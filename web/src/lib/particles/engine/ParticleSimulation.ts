import { Particle } from './Particle';
import { StatsRecorder } from './StatsRecorder';
import {
	SCREEN_WIDTH, SCREEN_HEIGHT,
	DEFAULT_COUNT_X, DEFAULT_COUNT_Y, DEFAULT_COUNT_Z,
	DEFAULT_RADIUS_X, DEFAULT_RADIUS_Y, DEFAULT_RADIUS_Z,
	DEFAULT_DECAY, DEFAULT_HERTZ, DEFAULT_MOTION, DEFAULT_GRAVITY,
	DEFAULT_STABILITY_FACTOR, DENSITY_SECTIONS
} from './constants';
import type { ParticleSimState, ParticleState } from './types';

export class ParticleSimulation {
	width = SCREEN_WIDTH;
	height = SCREEN_HEIGHT;
	countX = DEFAULT_COUNT_X;
	countY = DEFAULT_COUNT_Y;
	countZ = DEFAULT_COUNT_Z;
	radiusX = DEFAULT_RADIUS_X;
	radiusY = DEFAULT_RADIUS_Y;
	radiusZ = DEFAULT_RADIUS_Z;
	decayConstant = DEFAULT_DECAY;
	stabilityFactor = DEFAULT_STABILITY_FACTOR;
	hertz = DEFAULT_HERTZ;
	motionRange = DEFAULT_MOTION;
	gravity = DEFAULT_GRAVITY;
	gravityOn = false;
	running = false;

	simTime = 0;
	stats = new StatsRecorder();

	private atomX: Particle[] = [];
	private atomY: Particle[] = [];
	private atomZ: Particle[] = [];
	private complexes: Particle[] = [];
	private stabilized: Particle[] = [];
	private breakingAccumulator = 0;
	private stabilizedBreakingAccumulator = 0;
	private timeSinceRecord = 0;
	private densitySections: number[] = new Array(DENSITY_SECTIONS).fill(0);

	constructor() {
		this.setup();
	}

	setup(): void {
		Particle.resetIdCounter();
		this.atomX = [];
		this.atomY = [];
		this.atomZ = [];
		this.complexes = [];
		this.stabilized = [];
		this.breakingAccumulator = 0;
		this.stabilizedBreakingAccumulator = 0;
		this.simTime = 0;
		this.timeSinceRecord = 0;
		this.densitySections = new Array(DENSITY_SECTIONS).fill(0);
		this.stats.clear();

		const massX = this.radiusX / 10;
		const massY = this.radiusY / 10;
		const massZ = this.radiusZ / 10;

		for (let i = 0; i < this.countX; i++) {
			const x = Math.random() * (this.width - 2 * this.radiusX) + this.radiusX;
			const y = Math.random() * (this.height - 2 * this.radiusX) + this.radiusX;
			const vx = (Math.random() * 2 - 1) * this.motionRange;
			const vy = (Math.random() * 2 - 1) * this.motionRange;
			this.atomX.push(new Particle('X', x, y, vx, vy, this.radiusX, massX));
		}

		for (let i = 0; i < this.countY; i++) {
			const x = Math.random() * (this.width - 2 * this.radiusY) + this.radiusY;
			const y = Math.random() * (this.height - 2 * this.radiusY) + this.radiusY;
			const vx = (Math.random() * 2 - 1) * this.motionRange;
			const vy = (Math.random() * 2 - 1) * this.motionRange;
			this.atomY.push(new Particle('Y', x, y, vx, vy, this.radiusY, massY));
		}

		for (let i = 0; i < this.countZ; i++) {
			const x = Math.random() * (this.width - 2 * this.radiusZ) + this.radiusZ;
			const y = Math.random() * (this.height - 2 * this.radiusZ) + this.radiusZ;
			const vx = (Math.random() * 2 - 1) * this.motionRange;
			const vy = (Math.random() * 2 - 1) * this.motionRange;
			this.atomZ.push(new Particle('Z', x, y, vx, vy, this.radiusZ, massZ));
		}
	}

	tick(dt: number): void {
		if (!this.running) return;
		this.simTime += dt;
		this.timeSinceRecord += dt;

		const all = this.getAllParticles();

		// 1. Apply gravity
		if (this.gravityOn) {
			for (const p of all) {
				p.vy += this.gravity;
			}
		}

		// 2. Move + spin complexes/stabilized
		for (const p of all) {
			p.x += p.vx;
			p.y += p.vy;
			if (p.type === 'C' || p.type === 'S') {
				p.rotation += p.angularVelocity;
			}
		}

		// 3. Boundary bounce — reflect position to preserve energy
		for (const p of all) {
			const r = p.radius;
			if (p.x - r < 0) {
				p.x = 2 * r - p.x;           // reflect overshoot
				p.vx = Math.abs(p.vx);
			}
			if (p.x + r > this.width) {
				p.x = 2 * (this.width - r) - p.x;
				p.vx = -Math.abs(p.vx);
			}
			if (!this.gravityOn && p.y - r < 0) {
				p.y = 2 * r - p.y;
				p.vy = Math.abs(p.vy);
			}
			if (!this.gravityOn && p.y + r > this.height) {
				p.y = 2 * (this.height - r) - p.y;
				p.vy = -Math.abs(p.vy);
			}
			if (this.gravityOn && p.y + r > this.height) {
				p.y = 2 * (this.height - r) - p.y;
				p.vy = -Math.abs(p.vy);
			}
		}

		// 4. Collision detection
		const handled = new Set<number>();
		const allCurrent = this.getAllParticles();

		for (let i = 0; i < allCurrent.length; i++) {
			if (handled.has(allCurrent[i].id)) continue;
			for (let j = i + 1; j < allCurrent.length; j++) {
				if (handled.has(allCurrent[j].id)) continue;
				const a = allCurrent[i];
				const b = allCurrent[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < a.radius + b.radius) {
					// Check if X↔Y collision → form complex C
					const isXY = (a.type === 'X' && b.type === 'Y') || (a.type === 'Y' && b.type === 'X');
					// Check if Z↔C collision → form stabilized complex S
					const isZC = (a.type === 'Z' && b.type === 'C') || (a.type === 'C' && b.type === 'Z');
					if (isXY) {
						const xp = a.type === 'X' ? a : b;
						const yp = a.type === 'Y' ? a : b;
						this.formComplex(xp, yp);
						handled.add(a.id);
						handled.add(b.id);
					} else if (isZC) {
						const zp = a.type === 'Z' ? a : b;
						const cp = a.type === 'C' ? a : b;
						this.formStabilized(cp, zp);
						handled.add(a.id);
						handled.add(b.id);
					} else {
						this.elasticCollision(a, b);
						handled.add(a.id);
						handled.add(b.id);
					}
					break; // particle i already handled, move to next
				}
			}
		}

		// 5. Complex decay (C → X + Y)
		if (this.complexes.length > 0) {
			this.breakingAccumulator += this.decayConstant * dt * this.complexes.length;
			while (this.breakingAccumulator >= 1 && this.complexes.length > 0) {
				this.breakingAccumulator -= 1;
				const idx = Math.floor(Math.random() * this.complexes.length);
				this.breakComplex(this.complexes[idx]);
			}
		}

		// 5b. Stabilized complex decay (S → X + Y + Z), rate = λ / stabilityFactor
		if (this.stabilized.length > 0) {
			const sDecayRate = this.decayConstant / this.stabilityFactor;
			this.stabilizedBreakingAccumulator += sDecayRate * dt * this.stabilized.length;
			while (this.stabilizedBreakingAccumulator >= 1 && this.stabilized.length > 0) {
				this.stabilizedBreakingAccumulator -= 1;
				const idx = Math.floor(Math.random() * this.stabilized.length);
				this.breakStabilized(this.stabilized[idx]);
			}
		}

		// 6. Record stats every ~1s of sim time
		if (this.timeSinceRecord >= 1) {
			this.computeDensity();
			this.timeSinceRecord = 0;
		}
	}

	private elasticCollision(a: Particle, b: Particle): void {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist === 0) return;

		const nx = dx / dist;
		const ny = dy / dist;

		const dvx = a.vx - b.vx;
		const dvy = a.vy - b.vy;
		const velAlongNormal = dvx * nx + dvy * ny;

		if (velAlongNormal > 0) return; // separating

		const impulse = (2 * velAlongNormal) / (a.mass + b.mass);
		a.vx -= impulse * b.mass * nx;
		a.vy -= impulse * b.mass * ny;
		b.vx += impulse * a.mass * nx;
		b.vy += impulse * a.mass * ny;
	}

	private formComplex(xp: Particle, yp: Particle): void {
		const mc = xp.mass + yp.mass;

		// Center of mass position and velocity
		const cx = (xp.mass * xp.x + yp.mass * yp.x) / mc;
		const cy = (xp.mass * xp.y + yp.mass * yp.y) / mc;
		const cvx = (xp.vx * xp.mass + yp.vx * yp.mass) / mc;
		const cvy = (xp.vy * xp.mass + yp.vy * yp.mass) / mc;
		const cRadius = Math.max(3, this.radiusX + this.radiusY - 5);

		// Calculate binding energy = KE lost in the inelastic merger
		const keBefore = 0.5 * xp.mass * (xp.vx * xp.vx + xp.vy * xp.vy)
		               + 0.5 * yp.mass * (yp.vx * yp.vx + yp.vy * yp.vy);
		const keAfter = 0.5 * mc * (cvx * cvx + cvy * cvy);

		// Angular momentum of each particle relative to the CM:
		//   L_i = m_i * (r_i × v_i)  where × is the 2D cross product (scalar)
		const Lx = xp.mass * ((xp.x - cx) * (xp.vy - cvy) - (xp.y - cy) * (xp.vx - cvx));
		const Ly = yp.mass * ((yp.x - cx) * (yp.vy - cvy) - (yp.y - cy) * (yp.vx - cvx));
		const Ltotal = Lx + Ly;

		// Moment of inertia from actual collision distances:
		//   I = mx·|rx|² + my·|ry|²  where r is distance from CM
		const dxX = xp.x - cx, dyX = xp.y - cy;
		const dxY = yp.x - cx, dyY = yp.y - cy;
		const I = xp.mass * (dxX * dxX + dyX * dyX)
		        + yp.mass * (dxY * dxY + dyY * dyY);

		// Angular velocity: ω = L / I
		const omega = I > 1e-6 ? Ltotal / I : 0;

		// Remove from their lists
		this.atomX = this.atomX.filter(p => p.id !== xp.id);
		this.atomY = this.atomY.filter(p => p.id !== yp.id);

		// Create complex
		const c = new Particle('C', cx, cy, cvx, cvy, cRadius, mc);
		c.bindingEnergy = keBefore - keAfter;
		c.angularVelocity = omega;
		this.complexes.push(c);
	}

	private breakComplex(c: Particle): void {
		const mx = this.radiusX / 10;
		const my = this.radiusY / 10;
		const mc = mx + my;

		// Separation distance to prevent immediate re-collision
		const separationDist = this.radiusX + this.radiusY + 2;

		// Random direction for the split axis
		const angle = Math.random() * Math.PI * 2;
		const cosA = Math.cos(angle);
		const sinA = Math.sin(angle);

		// Momentum-conserving kick that restores the binding energy.
		const energy = Math.max(0, c.bindingEnergy);
		const kickX = Math.sqrt(2 * energy * my / (mx * mc));
		const kickY = (mx / my) * kickX;

		const xp = new Particle(
			'X',
			c.x - cosA * separationDist * 0.5,
			c.y - sinA * separationDist * 0.5,
			c.vx - cosA * kickX, c.vy - sinA * kickX,
			this.radiusX, mx
		);
		const yp = new Particle(
			'Y',
			c.x + cosA * separationDist * 0.5,
			c.y + sinA * separationDist * 0.5,
			c.vx + cosA * kickY, c.vy + sinA * kickY,
			this.radiusY, my
		);

		this.complexes = this.complexes.filter(p => p.id !== c.id);
		this.atomX.push(xp);
		this.atomY.push(yp);
	}

	private formStabilized(cp: Particle, zp: Particle): void {
		const ms = cp.mass + zp.mass;

		// Center of mass position and velocity
		const sx = (cp.mass * cp.x + zp.mass * zp.x) / ms;
		const sy = (cp.mass * cp.y + zp.mass * zp.y) / ms;
		const svx = (cp.vx * cp.mass + zp.vx * zp.mass) / ms;
		const svy = (cp.vy * cp.mass + zp.vy * zp.mass) / ms;
		const sRadius = Math.max(4, this.radiusX + this.radiusY + this.radiusZ - 8);

		// Binding energy of the C+Z merge
		const keBefore = 0.5 * cp.mass * (cp.vx * cp.vx + cp.vy * cp.vy)
		               + 0.5 * zp.mass * (zp.vx * zp.vx + zp.vy * zp.vy);
		const keAfter = 0.5 * ms * (svx * svx + svy * svy);

		// Angular momentum from C+Z collision
		const Lc = cp.mass * ((cp.x - sx) * (cp.vy - svy) - (cp.y - sy) * (cp.vx - svx));
		const Lz = zp.mass * ((zp.x - sx) * (zp.vy - svy) - (zp.y - sy) * (zp.vx - svx));
		// Inherit spin angular momentum from the complex
		const LspinC = cp.angularVelocity * cp.mass * cp.radius * cp.radius * 0.5;
		const Ltotal = Lc + Lz + LspinC;

		const dxC = cp.x - sx, dyC = cp.y - sy;
		const dxZ = zp.x - sx, dyZ = zp.y - sy;
		const I = cp.mass * (dxC * dxC + dyC * dyC)
		        + zp.mass * (dxZ * dxZ + dyZ * dyZ);

		const omega = I > 1e-6 ? Ltotal / I : cp.angularVelocity * 0.5;

		// Remove from their lists
		this.complexes = this.complexes.filter(p => p.id !== cp.id);
		this.atomZ = this.atomZ.filter(p => p.id !== zp.id);

		// Create stabilized complex
		const s = new Particle('S', sx, sy, svx, svy, sRadius, ms);
		s.bindingEnergy = cp.bindingEnergy; // preserve original X+Y binding energy
		s.bindingEnergyCZ = keBefore - keAfter; // C+Z binding energy
		s.angularVelocity = omega;
		this.stabilized.push(s);
	}

	private breakStabilized(s: Particle): void {
		// Two-step decay: first detach Z from virtual-C, then split C into X+Y
		const mx = this.radiusX / 10;
		const my = this.radiusY / 10;
		const mz = this.radiusZ / 10;
		const mc = mx + my; // mass of virtual C
		const ms = mc + mz;

		// Step 1: Separate Z from S → virtual-C + Z
		// Momentum conservation: mc*vc + mz*vz = ms*vs
		// Energy restoration: 0.5*mc*|vc-vs|² + 0.5*mz*|vz-vs|² = bindingEnergyCZ
		const angleCZ = Math.random() * Math.PI * 2;
		const cosCZ = Math.cos(angleCZ);
		const sinCZ = Math.sin(angleCZ);

		const energyCZ = Math.max(0, s.bindingEnergyCZ);
		const kickC = Math.sqrt(2 * energyCZ * mz / (mc * ms));
		const kickZ = (mc / mz) * kickC;

		const cvx = s.vx - cosCZ * kickC;
		const cvy = s.vy - sinCZ * kickC;

		// Separation distances
		const sepCZ = Math.max(this.radiusX + this.radiusY, this.radiusZ) + this.radiusZ + 2;
		const cPosX = s.x - cosCZ * sepCZ * (mz / ms);
		const cPosY = s.y - sinCZ * sepCZ * (mz / ms);

		const zp = new Particle(
			'Z',
			s.x + cosCZ * sepCZ * (mc / ms),
			s.y + sinCZ * sepCZ * (mc / ms),
			s.vx + cosCZ * kickZ, s.vy + sinCZ * kickZ,
			this.radiusZ, mz
		);

		// Step 2: Split virtual-C into X+Y, restoring XY binding energy
		const sepXY = this.radiusX + this.radiusY + 2;
		const angleXY = Math.random() * Math.PI * 2;
		const cosXY = Math.cos(angleXY);
		const sinXY = Math.sin(angleXY);

		const energyXY = Math.max(0, s.bindingEnergy);
		const kickXfromC = Math.sqrt(2 * energyXY * my / (mx * mc));
		const kickYfromC = (mx / my) * kickXfromC;

		const xp = new Particle(
			'X',
			cPosX - cosXY * sepXY * 0.5,
			cPosY - sinXY * sepXY * 0.5,
			cvx - cosXY * kickXfromC, cvy - sinXY * kickXfromC,
			this.radiusX, mx
		);
		const yp = new Particle(
			'Y',
			cPosX + cosXY * sepXY * 0.5,
			cPosY + sinXY * sepXY * 0.5,
			cvx + cosXY * kickYfromC, cvy + sinXY * kickYfromC,
			this.radiusY, my
		);

		this.stabilized = this.stabilized.filter(p => p.id !== s.id);
		this.atomX.push(xp);
		this.atomY.push(yp);
		this.atomZ.push(zp);
	}

	private computeDensity(): void {
		const sections = new Array(DENSITY_SECTIONS).fill(0);
		const sectionHeight = this.height / DENSITY_SECTIONS;
		const all = this.getAllParticles();

		for (const p of all) {
			const idx = Math.min(DENSITY_SECTIONS - 1, Math.max(0, Math.floor(p.y / sectionHeight)));
			sections[idx]++;
		}

		this.densitySections = sections;
	}

	private getAllParticles(): Particle[] {
		return [...this.atomX, ...this.atomY, ...this.atomZ, ...this.complexes, ...this.stabilized];
	}

	getState(): ParticleSimState {
		const particles: ParticleState[] = this.getAllParticles().map(p => ({
			id: p.id,
			type: p.type,
			x: p.x,
			y: p.y,
			vx: p.vx,
			vy: p.vy,
			radius: p.radius,
			mass: p.mass,
			rotation: p.rotation
		}));

		return {
			running: this.running,
			simTime: this.simTime,
			width: this.width,
			height: this.height,
			particles,
			countX: this.atomX.length,
			countY: this.atomY.length,
			countC: this.complexes.length,
			countZ: this.atomZ.length,
			countS: this.stabilized.length,
			hertz: this.hertz,
			gravityOn: this.gravityOn,
			radiusX: this.radiusX,
			radiusY: this.radiusY,
			radiusZ: this.radiusZ,
			densitySections: [...this.densitySections]
		};
	}
}
