import { writable } from 'svelte/store';
import type { SimulationState, StatsSnapshot, ThrowEvent } from '$lib/engine/types';
import {
	Algorithm, DEFAULT_HERTZ, DEFAULT_APPLE_COUNT,
	DEFAULT_SPEED_MAN, DEFAULT_SPEED_BOY, DEFAULT_SPEED_APPLE
} from '$lib/engine/constants';

export const running = writable(false);

export const config = writable({
	algorithm: Algorithm.NearestApple,
	hertz: DEFAULT_HERTZ,
	applesBoy: DEFAULT_APPLE_COUNT,
	applesMan: 0,
	speedMan: DEFAULT_SPEED_MAN,
	speedBoy: DEFAULT_SPEED_BOY,
	speedApple: DEFAULT_SPEED_APPLE,
	appleSize: 12,
	playerSize: 64,
	halfLifeLeft: 10,
	halfLifeRight: 10
});

export interface ChartPoint {
	time: number;
	manTotal: number;
	boyTotal: number;
	manFlying: number;
	boyFlying: number;
	manDist: number;
	boyDist: number;
	ratio: number;
}

export const chartData = writable<ChartPoint[]>([]);

export const maWindow = writable(10);

export const latestState = writable<SimulationState | null>(null);
export const throwLog = writable<ThrowEvent[]>([]);
