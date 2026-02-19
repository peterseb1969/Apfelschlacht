let nextId = 0;

export class ChemistryParticle {
	id: number;
	species: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	mass: number;
	isProduct: boolean;
	bindingEnergy = 0;
	rotation = 0;
	angularVelocity = 0;

	constructor(
		species: string,
		x: number, y: number,
		vx: number, vy: number,
		radius: number, mass: number,
		isProduct: boolean
	) {
		this.id = nextId++;
		this.species = species;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.radius = radius;
		this.mass = mass;
		this.isProduct = isProduct;
	}

	static resetIdCounter(): void {
		nextId = 0;
	}
}
