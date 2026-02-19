import { ChemistryParticle } from './ChemistryParticle';
import { INJECT_SPREAD, INJECT_SPEED_FACTOR } from './constants';
import type { SpeciesDefinition, InjectorState } from './types';

export class Injector {
	side: 'left' | 'right' | 'top' | 'bottom';
	position: number;
	species: SpeciesDefinition;
	rate: number;
	remaining: number;
	speed: number;
	accumulator = 0;

	constructor(
		side: 'left' | 'right' | 'top' | 'bottom',
		position: number,
		species: SpeciesDefinition,
		count: number,
		motionRange: number,
		rate = 20
	) {
		this.side = side;
		this.position = position;
		this.species = species;
		this.remaining = count;
		this.speed = motionRange * INJECT_SPEED_FACTOR;
		this.rate = rate;
	}

	get active(): boolean {
		return this.remaining > 0;
	}

	tick(dt: number, width: number, height: number): ChemistryParticle[] {
		if (this.remaining <= 0) return [];

		this.accumulator += this.rate * dt;
		const emitted: ChemistryParticle[] = [];

		while (this.accumulator >= 1 && this.remaining > 0) {
			this.accumulator -= 1;
			this.remaining--;
			emitted.push(this.emit(width, height));
		}

		return emitted;
	}

	private emit(width: number, height: number): ChemistryParticle {
		const { species, side, position, speed } = this;
		const r = species.radius;
		let x: number, y: number, baseAngle: number;

		switch (side) {
			case 'left':
				x = r + 2;
				y = position * height;
				baseAngle = 0;
				break;
			case 'right':
				x = width - r - 2;
				y = position * height;
				baseAngle = Math.PI;
				break;
			case 'top':
				x = position * width;
				y = r + 2;
				baseAngle = Math.PI / 2;
				break;
			case 'bottom':
				x = position * width;
				y = height - r - 2;
				baseAngle = -Math.PI / 2;
				break;
		}

		const angle = baseAngle + (Math.random() - 0.5) * INJECT_SPREAD;
		const vx = Math.cos(angle) * speed;
		const vy = Math.sin(angle) * speed;
		const mass = r / 10;

		return new ChemistryParticle(species.symbol, x, y, vx, vy, r, mass, species.role === 'product');
	}

	getState(): InjectorState {
		return {
			side: this.side,
			position: this.position,
			species: this.species.symbol,
			color: this.species.color,
			active: this.active
		};
	}
}
