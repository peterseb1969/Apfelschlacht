export type ParticleType = 'X' | 'Y' | 'C' | 'Z' | 'S';

export interface ParticleState {
	id: number;
	type: ParticleType;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	mass: number;
	/** Rotation angle for complex rendering */
	rotation: number;
}

export interface ParticleSimState {
	running: boolean;
	simTime: number;
	width: number;
	height: number;
	particles: ParticleState[];
	countX: number;
	countY: number;
	countC: number;
	countZ: number;
	countS: number;
	hertz: number;
	gravityOn: boolean;
	densitySections: number[];
	/** Component radii for complex rendering */
	radiusX: number;
	radiusY: number;
	radiusZ: number;
}

export interface ParticleChartPoint {
	time: number;
	countX: number;
	countY: number;
	countC: number;
	countZ: number;
	countS: number;
}
