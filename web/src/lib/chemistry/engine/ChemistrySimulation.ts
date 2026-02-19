import { ChemistryParticle } from './ChemistryParticle';
import { ReactionEngine } from './ReactionEngine';
import { Injector } from './Injector';
import {
	SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_HERTZ, DEFAULT_MOTION,
	DEFAULT_GRAVITY, DEFAULT_TEMPERATURE, DEFAULT_EFFECTIVE_WIDTH,
	DENSITY_SECTIONS
} from './constants';
import type {
	ReactionDefinition, SpeciesDefinition,
	ChemistrySimState, ChemistryParticleState
} from './types';

export class ChemistrySimulation {
	width = SCREEN_WIDTH;
	height = SCREEN_HEIGHT;
	effectiveWidth = DEFAULT_EFFECTIVE_WIDTH;
	hertz = DEFAULT_HERTZ;
	motionRange = DEFAULT_MOTION;
	gravity = DEFAULT_GRAVITY;
	gravityOn = false;
	running = false;
	simTime = 0;

	private particles = new Map<string, ChemistryParticle[]>();
	private speciesDefs = new Map<string, SpeciesDefinition>();
	private reactionEngine: ReactionEngine | null = null;
	private reaction: ReactionDefinition | null = null;
	private injectors: Injector[] = [];
	private decayAccumulators = new Map<string, number>();
	private currentTemperature = DEFAULT_TEMPERATURE;
	private keBeforeGravity = 0;
	private wasGravityOn = false;
	private densitySections: number[] = new Array(DENSITY_SECTIONS).fill(0);
	private timeSinceRecord = 0;

	private forwardRateOverride: number | null = null;
	private reverseRateOverride: number | null = null;

	constructor() {}

	loadReaction(reaction: ReactionDefinition): void {
		this.reaction = reaction;
		this.speciesDefs.clear();
		for (const s of reaction.species) {
			this.speciesDefs.set(s.symbol, s);
		}
		this.rebuildEngine();
		this.setup();
	}

	private rebuildEngine(): void {
		if (!this.reaction) return;
		const r = { ...this.reaction };
		if (this.forwardRateOverride !== null) r.forwardRate = this.forwardRateOverride;
		if (this.reverseRateOverride !== null) r.reverseRate = this.reverseRateOverride;
		this.reactionEngine = new ReactionEngine(r);
	}

	setForwardRate(rate: number | null): void {
		this.forwardRateOverride = rate;
		this.rebuildEngine();
	}

	setReverseRate(rate: number | null): void {
		this.reverseRateOverride = rate;
		this.rebuildEngine();
	}

	setup(): void {
		ChemistryParticle.resetIdCounter();
		this.particles.clear();
		this.decayAccumulators.clear();
		this.simTime = 0;
		this.timeSinceRecord = 0;
		this.densitySections = new Array(DENSITY_SECTIONS).fill(0);
		this.keBeforeGravity = 0;
		this.wasGravityOn = false;
		this.currentTemperature = DEFAULT_TEMPERATURE;
		this.injectors = [];

		if (!this.reaction) return;

		// Initialize empty arrays for all species
		for (const s of this.reaction.species) {
			this.particles.set(s.symbol, []);
		}
	}

	injectSpecies(symbol: string, count: number): void {
		const def = this.speciesDefs.get(symbol);
		if (!def) return;
		const sides: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
		const side = sides[Math.floor(Math.random() * sides.length)];
		const position = 0.3 + 0.4 * Math.random();
		this.injectors.push(new Injector(side, position, def, count, this.motionRange));
	}

	setTemperature(newTemp: number): void {
		if (newTemp <= 0 || this.currentTemperature <= 0) return;
		const all = this.getAllParticles();
		if (all.length === 0) {
			this.currentTemperature = newTemp;
			return;
		}
		const scale = Math.sqrt(newTemp / this.currentTemperature);
		for (const p of all) {
			p.vx *= scale;
			p.vy *= scale;
		}
		this.currentTemperature = newTemp;
	}

	setEffectiveWidth(newWidth: number): void {
		const oldWidth = this.effectiveWidth;
		this.effectiveWidth = newWidth;
		if (newWidth < oldWidth) {
			// Push particles out of the dead zone
			for (const arr of this.particles.values()) {
				for (const p of arr) {
					if (p.x + p.radius > newWidth) {
						p.x = newWidth - p.radius - 1;
						p.vx = -Math.abs(p.vx);
					}
				}
			}
		}
	}

	tick(dt: number): void {
		if (!this.running || !this.reactionEngine) return;
		this.simTime += dt;
		this.timeSinceRecord += dt;

		// 0. Process injectors
		for (const inj of this.injectors) {
			const emitted = inj.tick(dt, this.effectiveWidth, this.height);
			for (const p of emitted) {
				const arr = this.particles.get(p.species);
				if (arr) arr.push(p);
			}
		}
		// Remove spent injectors
		this.injectors = this.injectors.filter(inj => inj.active);

		const all = this.getAllParticles();

		// Gravity toggle detection
		if (this.gravityOn && !this.wasGravityOn) {
			this.keBeforeGravity = this.computeTotalKE(all);
			this.wasGravityOn = true;
		} else if (!this.gravityOn && this.wasGravityOn) {
			const keCurrent = this.computeTotalKE(all);
			if (keCurrent > 1e-6 && this.keBeforeGravity > 1e-6) {
				const scale = Math.sqrt(this.keBeforeGravity / keCurrent);
				for (const p of all) {
					p.vx *= scale;
					p.vy *= scale;
				}
			}
			this.wasGravityOn = false;
		}

		// 1. Leapfrog half-step
		if (this.gravityOn) {
			const halfG = this.gravity * 0.5;
			for (const p of all) p.vy += halfG;
		}

		// 2. Move + spin
		for (const p of all) {
			p.x += p.vx;
			p.y += p.vy;
			if (p.isProduct) p.rotation += p.angularVelocity;
		}

		// 3. Boundary bounce (using effectiveWidth for piston)
		for (const p of all) {
			const r = p.radius;
			if (p.x - r < 0) {
				p.x = 2 * r - p.x;
				p.vx = Math.abs(p.vx);
			} else if (p.x + r > this.effectiveWidth) {
				p.x = 2 * (this.effectiveWidth - r) - p.x;
				p.vx = -Math.abs(p.vx);
			}
			if (p.y - r < 0) {
				p.y = 2 * r - p.y;
				p.vy = Math.abs(p.vy);
			} else if (p.y + r > this.height) {
				p.y = 2 * (this.height - r) - p.y;
				p.vy = -Math.abs(p.vy);
			}
		}

		// 4. Leapfrog second half-step
		if (this.gravityOn) {
			const halfG = this.gravity * 0.5;
			for (const p of all) p.vy += halfG;
		}

		// 5. Collision detection
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
					const rule = this.reactionEngine.matchCollision(a.species, b.species);
					if (rule && Math.random() < rule.probability) {
						this.executeReaction(a, b, rule.products);
						handled.add(a.id);
						handled.add(b.id);
					} else {
						this.elasticCollision(a, b);
						handled.add(a.id);
						handled.add(b.id);
					}
					break;
				}
			}
		}

		// 6. Decay rules
		for (const rule of this.reactionEngine.decayRules) {
			const arr = this.particles.get(rule.fromSpecies);
			if (!arr || arr.length === 0) continue;

			const acc = (this.decayAccumulators.get(rule.fromSpecies) ?? 0) + rule.rate * dt * arr.length;
			this.decayAccumulators.set(rule.fromSpecies, acc);

			let remaining = acc;
			while (remaining >= 1 && arr.length > 0) {
				remaining -= 1;
				const idx = Math.floor(Math.random() * arr.length);
				this.executeDecay(arr[idx], rule.toSpecies);
			}
			this.decayAccumulators.set(rule.fromSpecies, remaining);
		}

		// 7. Density recording
		if (this.timeSinceRecord >= 1) {
			this.computeDensity();
			this.timeSinceRecord = 0;
		}
	}

	private executeReaction(a: ChemistryParticle, b: ChemistryParticle, products: string[]): void {
		const mc = a.mass + b.mass;
		const cx = (a.mass * a.x + b.mass * b.x) / mc;
		const cy = (a.mass * a.y + b.mass * b.y) / mc;
		const cvx = (a.vx * a.mass + b.vx * b.mass) / mc;
		const cvy = (a.vy * a.mass + b.vy * b.mass) / mc;

		const keBefore = 0.5 * a.mass * (a.vx * a.vx + a.vy * a.vy)
		               + 0.5 * b.mass * (b.vx * b.vx + b.vy * b.vy);
		const keAfterCom = 0.5 * mc * (cvx * cvx + cvy * cvy);
		const bindingEnergy = keBefore - keAfterCom;

		// Angular momentum for product spin
		const La = a.mass * ((a.x - cx) * (a.vy - cvy) - (a.y - cy) * (a.vx - cvx));
		const Lb = b.mass * ((b.x - cx) * (b.vy - cvy) - (b.y - cy) * (b.vx - cvx));
		const Ltotal = La + Lb;
		const dxA = a.x - cx, dyA = a.y - cy;
		const dxB = b.x - cx, dyB = b.y - cy;
		const I = a.mass * (dxA * dxA + dyA * dyA) + b.mass * (dxB * dxB + dyB * dyB);
		const omega = I > 1e-6 ? Ltotal / I : 0;

		// Remove reactants
		this.removeParticle(a);
		this.removeParticle(b);

		if (products.length === 1) {
			// Merge: A + B -> C
			const def = this.speciesDefs.get(products[0]);
			const radius = def?.radius ?? Math.max(3, a.radius + b.radius - 3);
			const p = new ChemistryParticle(products[0], cx, cy, cvx, cvy, radius, mc, true);
			p.bindingEnergy = bindingEnergy;
			p.angularVelocity = omega;
			this.addParticle(p);
		} else if (products.length === 2) {
			// Exchange: A + B -> C + D
			const def0 = this.speciesDefs.get(products[0]);
			const def1 = this.speciesDefs.get(products[1]);
			const r0 = def0?.radius ?? 7;
			const r1 = def1?.radius ?? 7;
			const m0 = r0 / 10;
			const m1 = r1 / 10;

			const angle = Math.random() * Math.PI * 2;
			const cosA = Math.cos(angle);
			const sinA = Math.sin(angle);
			const sep = r0 + r1 + 2;

			// Distribute remaining KE as relative velocity
			const relKE = Math.max(0, bindingEnergy * 0.5);
			const totalM = m0 + m1;
			const kick0 = Math.sqrt(2 * relKE * m1 / (m0 * totalM));
			const kick1 = (m0 / m1) * kick0;

			const p0 = new ChemistryParticle(
				products[0],
				cx - cosA * sep * 0.5, cy - sinA * sep * 0.5,
				cvx - cosA * kick0, cvy - sinA * kick0,
				r0, m0, def0?.role === 'product'
			);
			const p1 = new ChemistryParticle(
				products[1],
				cx + cosA * sep * 0.5, cy + sinA * sep * 0.5,
				cvx + cosA * kick1, cvy + sinA * kick1,
				r1, m1, def1?.role === 'product'
			);
			this.addParticle(p0);
			this.addParticle(p1);
		}
	}

	private executeDecay(p: ChemistryParticle, toSpecies: string[]): void {
		const angle = Math.random() * Math.PI * 2;
		const cosA = Math.cos(angle);
		const sinA = Math.sin(angle);

		this.removeParticle(p);

		if (toSpecies.length === 1) {
			// Rare: C -> A (just relabel, shouldn't normally happen)
			const def = this.speciesDefs.get(toSpecies[0]);
			const np = new ChemistryParticle(
				toSpecies[0], p.x, p.y, p.vx, p.vy,
				def?.radius ?? p.radius, def ? def.radius / 10 : p.mass,
				def?.role === 'product'
			);
			this.addParticle(np);
		} else if (toSpecies.length === 2) {
			// C -> A + B
			const def0 = this.speciesDefs.get(toSpecies[0]);
			const def1 = this.speciesDefs.get(toSpecies[1]);
			const r0 = def0?.radius ?? 7;
			const r1 = def1?.radius ?? 7;
			const m0 = r0 / 10;
			const m1 = r1 / 10;
			const mc = m0 + m1;
			const sep = r0 + r1 + 2;

			const energy = Math.max(0, p.bindingEnergy);
			const kick0 = Math.sqrt(2 * energy * m1 / (m0 * mc));
			const kick1 = (m0 / m1) * kick0;

			const p0 = new ChemistryParticle(
				toSpecies[0],
				p.x - cosA * sep * 0.5, p.y - sinA * sep * 0.5,
				p.vx - cosA * kick0, p.vy - sinA * kick0,
				r0, m0, def0?.role === 'product'
			);
			const p1 = new ChemistryParticle(
				toSpecies[1],
				p.x + cosA * sep * 0.5, p.y + sinA * sep * 0.5,
				p.vx + cosA * kick1, p.vy + sinA * kick1,
				r1, m1, def1?.role === 'product'
			);
			this.addParticle(p0);
			this.addParticle(p1);
		}
	}

	private elasticCollision(a: ChemistryParticle, b: ChemistryParticle): void {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist === 0) return;

		const nx = dx / dist;
		const ny = dy / dist;
		const dvx = a.vx - b.vx;
		const dvy = a.vy - b.vy;
		const velAlongNormal = dvx * nx + dvy * ny;

		if (velAlongNormal > 0) return;

		const impulse = (2 * velAlongNormal) / (a.mass + b.mass);
		a.vx -= impulse * b.mass * nx;
		a.vy -= impulse * b.mass * ny;
		b.vx += impulse * a.mass * nx;
		b.vy += impulse * a.mass * ny;

		const overlap = (a.radius + b.radius) - dist;
		if (overlap > 0) {
			const totalMass = a.mass + b.mass;
			a.x += nx * overlap * (b.mass / totalMass);
			a.y += ny * overlap * (b.mass / totalMass);
			b.x -= nx * overlap * (a.mass / totalMass);
			b.y -= ny * overlap * (a.mass / totalMass);
		}
	}

	private addParticle(p: ChemistryParticle): void {
		let arr = this.particles.get(p.species);
		if (!arr) {
			arr = [];
			this.particles.set(p.species, arr);
		}
		arr.push(p);
	}

	private removeParticle(p: ChemistryParticle): void {
		const arr = this.particles.get(p.species);
		if (arr) {
			const idx = arr.indexOf(p);
			if (idx >= 0) arr.splice(idx, 1);
		}
	}

	private getAllParticles(): ChemistryParticle[] {
		const result: ChemistryParticle[] = [];
		for (const arr of this.particles.values()) {
			result.push(...arr);
		}
		return result;
	}

	private computeTotalKE(particles: ChemistryParticle[]): number {
		let ke = 0;
		for (const p of particles) {
			ke += 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
		}
		return ke;
	}

	private computeDensity(): void {
		const sections = new Array(DENSITY_SECTIONS).fill(0);
		const sectionHeight = this.height / DENSITY_SECTIONS;
		for (const arr of this.particles.values()) {
			for (const p of arr) {
				const idx = Math.min(DENSITY_SECTIONS - 1, Math.max(0, Math.floor(p.y / sectionHeight)));
				sections[idx]++;
			}
		}
		this.densitySections = sections;
	}

	getSpeciesCounts(): Record<string, number> {
		const counts: Record<string, number> = {};
		if (this.reaction) {
			for (const s of this.reaction.species) {
				counts[s.symbol] = this.particles.get(s.symbol)?.length ?? 0;
			}
		}
		return counts;
	}

	getTotalParticleCount(): number {
		let total = 0;
		for (const arr of this.particles.values()) total += arr.length;
		return total;
	}

	getPressure(): number {
		const n = this.getTotalParticleCount();
		const V = this.effectiveWidth * this.height;
		if (V === 0) return 0;
		return (n * this.currentTemperature) / V * 1e5;
	}

	getState(): ChemistrySimState {
		const particles: ChemistryParticleState[] = [];
		for (const arr of this.particles.values()) {
			for (const p of arr) {
				particles.push({
					id: p.id,
					species: p.species,
					x: p.x,
					y: p.y,
					vx: p.vx,
					vy: p.vy,
					radius: p.radius,
					mass: p.mass,
					rotation: p.rotation,
					isProduct: p.isProduct
				});
			}
		}

		return {
			running: this.running,
			simTime: this.simTime,
			width: this.width,
			height: this.height,
			effectiveWidth: this.effectiveWidth,
			particles,
			speciesCounts: this.getSpeciesCounts(),
			injectors: this.injectors.map(inj => inj.getState()),
			hertz: this.hertz,
			gravityOn: this.gravityOn,
			temperature: this.currentTemperature,
			pressure: this.getPressure(),
			densitySections: [...this.densitySections]
		};
	}
}
