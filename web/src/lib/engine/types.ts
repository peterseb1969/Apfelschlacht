import type { Algorithm } from './constants';

export interface Apple {
	x: number;
	y: number;
	id: number;
}

export interface SimulationConfig {
	algorithm: Algorithm;
	hertz: number;
	appleCount: number;
	speedMan: number;
	speedBoy: number;
	speedApple: number;
}

export interface PlayerState {
	name: string;
	x: number;
	y: number;
	spriteFrame: number;
	textureOffset: number;
	appleCount: number;
	flyApples: number;
	speed: number;
	speedApple: number;
	avgDist: number;
	avgFlyApples: number;
}

export interface SimulationState {
	running: boolean;
	algorithm: Algorithm;
	hertz: number;
	simTime: number;
	width: number;
	height: number;
	apples: Apple[];
	man: PlayerState;
	boy: PlayerState;
}

export interface StatsSnapshot {
	time: number;
	manFlying: number;
	manTotal: number;
	boyFlying: number;
	boyTotal: number;
}

export interface DistRecord {
	time: number;
	player: string;
	distance: number;
}
