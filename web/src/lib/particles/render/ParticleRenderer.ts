import type { ParticleSimState, ParticleState, ParticleType } from '../engine/types';
import { DENSITY_SECTIONS } from '../engine/constants';

export interface RenderColors {
	colorX: string;
	colorY: string;
	colorZ: string;
	bgGrey: number;
}

export class ParticleRenderer {
	private ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext('2d')!;
	}

	render(state: ParticleSimState, colors: RenderColors): void {
		const { ctx } = this;
		const { width, height } = state;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// Configurable background
		const g = colors.bgGrey;
		ctx.fillStyle = `rgb(${g}, ${g}, ${Math.min(255, g + 10)})`;
		ctx.fillRect(0, 0, width, height);

		// Density overlay when gravity is on
		if (state.gravityOn && state.densitySections.length > 0) {
			this.renderDensityOverlay(state);
		}

		// Drain zone (before particles)
		if (state.drainZone) {
			this.renderDrainZone(state.drainZone);
		}

		// Draw particles
		for (const p of state.particles) {
			const blinking = p.drainProgress >= 1;
			if (blinking) {
				const blinkPhase = p.drainProgress - 1;
				const freq = 8 + blinkPhase * 30;
				const alpha = 0.3 + 0.7 * Math.abs(Math.sin(state.simTime * freq));
				ctx.globalAlpha = alpha;
			}

			if (p.type === 'S') {
				this.drawStabilized(p, state.radiusX, state.radiusY, state.radiusZ, colors);
			} else if (p.type === 'C') {
				this.drawComplex(p, state.radiusX, state.radiusY, colors);
			} else {
				this.drawParticle(p, colors);
			}

			if (blinking) {
				ctx.globalAlpha = 1;
			}
		}

		// HUD
		if (state.drainZone) {
			this.drawHUD(state);
		}
	}

	private drawParticle(p: ParticleState, colors: RenderColors): void {
		const { ctx } = this;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
		ctx.fillStyle = p.type === 'X' ? colors.colorX : p.type === 'Y' ? colors.colorY : colors.colorZ;
		ctx.fill();
	}

	private drawComplex(p: ParticleState, radiusX: number, radiusY: number, colors: RenderColors): void {
		const { ctx } = this;

		// Two component circles orbiting the center
		const offset = (radiusX + radiusY) * 0.3;
		const cosR = Math.cos(p.rotation);
		const sinR = Math.sin(p.rotation);

		const x1 = p.x + cosR * offset;
		const y1 = p.y + sinR * offset;
		const x2 = p.x - cosR * offset;
		const y2 = p.y - sinR * offset;

		// Draw X component (semi-transparent)
		ctx.globalAlpha = 0.7;
		ctx.beginPath();
		ctx.arc(x1, y1, radiusX, 0, Math.PI * 2);
		ctx.fillStyle = colors.colorX;
		ctx.fill();

		// Draw Y component (semi-transparent)
		ctx.beginPath();
		ctx.arc(x2, y2, radiusY, 0, Math.PI * 2);
		ctx.fillStyle = colors.colorY;
		ctx.fill();

		// Subtle bond glow at center
		ctx.globalAlpha = 0.25;
		const glowR = Math.max(radiusX, radiusY) * 0.6;
		const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
		grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.beginPath();
		ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.fill();

		ctx.globalAlpha = 1;
	}

	private drawStabilized(p: ParticleState, radiusX: number, radiusY: number, radiusZ: number, colors: RenderColors): void {
		const { ctx } = this;

		// Three components at 120° intervals orbiting the center
		const offset = (radiusX + radiusY + radiusZ) * 0.25;
		const baseAngle = p.rotation;

		const positions = [
			{ r: radiusX, color: colors.colorX, angle: baseAngle },
			{ r: radiusY, color: colors.colorY, angle: baseAngle + (Math.PI * 2 / 3) },
			{ r: radiusZ, color: colors.colorZ, angle: baseAngle + (Math.PI * 4 / 3) }
		];

		ctx.globalAlpha = 0.7;
		for (const comp of positions) {
			const cx = p.x + Math.cos(comp.angle) * offset;
			const cy = p.y + Math.sin(comp.angle) * offset;
			ctx.beginPath();
			ctx.arc(cx, cy, comp.r, 0, Math.PI * 2);
			ctx.fillStyle = comp.color;
			ctx.fill();
		}

		// Bond glow at center — slightly brighter than C to show stability
		ctx.globalAlpha = 0.35;
		const glowR = Math.max(radiusX, radiusY, radiusZ) * 0.7;
		const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
		grad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
		grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
		ctx.beginPath();
		ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.fill();

		ctx.globalAlpha = 1;
	}

	private renderDrainZone(zone: { x: number; y: number; w: number; h: number; species: ParticleType }): void {
		const { ctx } = this;
		const { x, y, w, h, species } = zone;

		// Semi-transparent teal background
		ctx.fillStyle = 'rgba(0, 180, 120, 0.12)';
		ctx.fillRect(x, y, w, h);

		// Hatched pattern
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
		ctx.strokeStyle = 'rgba(0, 180, 120, 0.15)';
		ctx.lineWidth = 1;
		const step = 14;
		ctx.beginPath();
		for (let lx = x - h; lx < x + w + h; lx += step) {
			ctx.moveTo(lx, y);
			ctx.lineTo(lx + h, y + h);
		}
		ctx.stroke();
		ctx.restore();

		// Thin border
		ctx.strokeStyle = 'rgba(0, 180, 120, 0.35)';
		ctx.lineWidth = 1;
		ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

		// Species label centered
		ctx.font = 'bold 14px system-ui, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgba(0, 220, 150, 0.5)';
		ctx.fillText(species, x + w / 2, y + h / 2);
	}

	private drawHUD(state: ParticleSimState): void {
		const { ctx } = this;
		const label = `D: ${state.drainedCount} ${state.drainZone!.species}`;

		ctx.font = 'bold 13px monospace';
		const m = ctx.measureText(label);
		const px = 8, py = 4;
		const bw = m.width + px * 2;
		const bh = 18 + py * 2;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
		ctx.fillRect(8, 8, bw, bh);
		ctx.fillStyle = 'rgba(0, 220, 150, 0.85)';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText(label, 8 + px, 8 + py + 2);
	}

	private renderDensityOverlay(state: ParticleSimState): void {
		const { ctx } = this;
		const { width, height, densitySections } = state;
		const sectionHeight = height / DENSITY_SECTIONS;

		const maxDensity = Math.max(1, ...densitySections);

		for (let i = 0; i < densitySections.length; i++) {
			const intensity = densitySections[i] / maxDensity;
			ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.08})`;
			ctx.fillRect(0, i * sectionHeight, width, sectionHeight);
		}
	}
}
