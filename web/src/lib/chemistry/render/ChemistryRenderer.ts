import type { ChemistrySimState, ChemistryParticleState, InjectorState, SpeciesDefinition } from '../engine/types';
import { DENSITY_SECTIONS } from '../engine/constants';

export class ChemistryRenderer {
	private ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext('2d')!;
	}

	render(state: ChemistrySimState, speciesDefs: Map<string, SpeciesDefinition>, bgGrey: number): void {
		const { ctx } = this;
		const { width, height, effectiveWidth } = state;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// Background
		const g = bgGrey;
		ctx.fillStyle = `rgb(${g}, ${g}, ${Math.min(255, g + 10)})`;
		ctx.fillRect(0, 0, width, height);

		// Dead zone (right of piston)
		if (effectiveWidth < width) {
			this.renderDeadZone(effectiveWidth, width, height);
		}

		// Density overlay when gravity is on
		if (state.gravityOn && state.densitySections.length > 0) {
			this.renderDensityOverlay(state);
		}

		// Draw injector nozzles
		for (const inj of state.injectors) {
			this.drawInjector(inj, effectiveWidth, height);
		}

		// Draw particles
		for (const p of state.particles) {
			this.drawParticle(p, speciesDefs);
		}

		// Draw piston
		if (effectiveWidth < width) {
			this.drawPiston(effectiveWidth, height);
		}

		// HUD overlay
		this.drawHUD(state);
	}

	private drawParticle(p: ChemistryParticleState, speciesDefs: Map<string, SpeciesDefinition>): void {
		const { ctx } = this;
		const def = speciesDefs.get(p.species);
		const color = def?.color ?? '#aaa';

		if (p.isProduct) {
			this.drawProduct(p, color);
		} else {
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();

			// Label inside if large enough
			if (p.radius >= 12) {
				this.drawLabel(p);
			}
		}
	}

	private drawProduct(p: ChemistryParticleState, color: string): void {
		const { ctx } = this;

		// Main circle
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
		ctx.fillStyle = color;
		ctx.fill();

		// Bond glow
		ctx.globalAlpha = 0.3;
		const glowR = p.radius * 0.7;
		const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
		grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.beginPath();
		ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.fill();
		ctx.globalAlpha = 1;

		// Label inside if large enough
		if (p.radius >= 12) {
			this.drawLabel(p);
		}
	}

	private drawLabel(p: ChemistryParticleState): void {
		const { ctx } = this;
		const fontSize = Math.max(8, Math.min(12, p.radius * 0.8));
		ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		// Truncate long labels
		const label = p.species.length > 6 ? p.species.slice(0, 5) + '\u2026' : p.species;
		ctx.fillText(label, p.x, p.y);
	}

	private drawInjector(inj: InjectorState, effectiveWidth: number, height: number): void {
		const { ctx } = this;
		const size = 10;
		let x: number, y: number, angle: number;

		switch (inj.side) {
			case 'left':
				x = 0; y = inj.position * height; angle = 0;
				break;
			case 'right':
				x = effectiveWidth; y = inj.position * height; angle = Math.PI;
				break;
			case 'top':
				x = inj.position * effectiveWidth; y = 0; angle = Math.PI / 2;
				break;
			case 'bottom':
				x = inj.position * effectiveWidth; y = height; angle = -Math.PI / 2;
				break;
		}

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);

		// Triangle nozzle
		ctx.beginPath();
		ctx.moveTo(0, -size);
		ctx.lineTo(size * 1.2, 0);
		ctx.lineTo(0, size);
		ctx.closePath();

		ctx.fillStyle = inj.color;
		ctx.globalAlpha = inj.active ? 0.9 : 0.3;
		ctx.fill();

		// Glow when active
		if (inj.active) {
			ctx.globalAlpha = 0.4;
			ctx.shadowColor = inj.color;
			ctx.shadowBlur = 8;
			ctx.fill();
			ctx.shadowBlur = 0;
		}

		ctx.globalAlpha = 1;
		ctx.restore();
	}

	private drawPiston(effectiveWidth: number, height: number): void {
		const { ctx } = this;
		const pistonWidth = 6;

		// Gradient bar
		const grad = ctx.createLinearGradient(effectiveWidth - pistonWidth, 0, effectiveWidth + pistonWidth, 0);
		grad.addColorStop(0, '#666');
		grad.addColorStop(0.5, '#999');
		grad.addColorStop(1, '#555');

		ctx.fillStyle = grad;
		ctx.fillRect(effectiveWidth - pistonWidth / 2, 0, pistonWidth, height);

		// Border lines
		ctx.strokeStyle = '#aaa';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(effectiveWidth - pistonWidth / 2, 0);
		ctx.lineTo(effectiveWidth - pistonWidth / 2, height);
		ctx.moveTo(effectiveWidth + pistonWidth / 2, 0);
		ctx.lineTo(effectiveWidth + pistonWidth / 2, height);
		ctx.stroke();
	}

	private renderDeadZone(effectiveWidth: number, fullWidth: number, height: number): void {
		const { ctx } = this;
		const zoneWidth = fullWidth - effectiveWidth;

		// Dark background
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(effectiveWidth, 0, zoneWidth, height);

		// Hatched pattern
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
		ctx.lineWidth = 1;
		const step = 20;
		ctx.beginPath();
		for (let x = effectiveWidth; x < fullWidth + height; x += step) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x - height, height);
		}
		ctx.stroke();
	}

	private renderDensityOverlay(state: ChemistrySimState): void {
		const { ctx } = this;
		const { effectiveWidth, height, densitySections } = state;
		const sectionHeight = height / DENSITY_SECTIONS;
		const maxDensity = Math.max(1, ...densitySections);

		for (let i = 0; i < densitySections.length; i++) {
			const intensity = densitySections[i] / maxDensity;
			ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.08})`;
			ctx.fillRect(0, i * sectionHeight, effectiveWidth, sectionHeight);
		}
	}

	private drawHUD(state: ChemistrySimState): void {
		const { ctx } = this;
		const padding = 10;
		const x = 10;
		const y = 10;
		const lineHeight = 16;

		const lines = [
			`P = ${state.pressure.toFixed(1)}`,
			`T = ${state.temperature.toFixed(1)}`,
			`V = ${(state.effectiveWidth * state.height / 1000).toFixed(1)}`
		];

		const boxWidth = 90;
		const boxHeight = lines.length * lineHeight + padding * 2;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.beginPath();
		ctx.roundRect(x, y, boxWidth, boxHeight, 4);
		ctx.fill();

		ctx.font = '12px monospace';
		ctx.fillStyle = '#ccc';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		for (let i = 0; i < lines.length; i++) {
			ctx.fillText(lines[i], x + padding, y + padding + i * lineHeight);
		}
	}
}
