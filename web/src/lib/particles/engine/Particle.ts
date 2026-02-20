import type { ParticleType } from './types';

let nextId = 0;

export class Particle {
	id: number;
	type: ParticleType;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	mass: number;
	/** KE lost during X+Y complex formation — returned on decay */
	bindingEnergy = 0;
	/** KE lost during C+Z stabilized complex formation — returned on S decay */
	bindingEnergyCZ = 0;
	/** Rotation angle for complex spin (radians) */
	rotation = 0;
	/** Time spent inside drain zone */
	drainDwell = 0;
	/** Angular velocity (radians/tick), computed from collision angular momentum */
	angularVelocity = 0;

	constructor(type: ParticleType, x: number, y: number, vx: number, vy: number, radius: number, mass: number) {
		this.id = nextId++;
		this.type = type;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.radius = radius;
		this.mass = mass;
	}

	static resetIdCounter(): void {
		nextId = 0;
	}
}
