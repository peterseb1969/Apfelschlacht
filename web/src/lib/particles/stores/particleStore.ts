import { writable } from 'svelte/store';
import type { ParticleSimState, ParticleChartPoint, ParticleType } from '../engine/types';
import {
	DEFAULT_COUNT_X, DEFAULT_COUNT_Y, DEFAULT_COUNT_Z,
	DEFAULT_RADIUS_X, DEFAULT_RADIUS_Y, DEFAULT_RADIUS_Z,
	DEFAULT_DECAY, DEFAULT_HERTZ, DEFAULT_MOTION, DEFAULT_GRAVITY,
	DEFAULT_STABILITY_FACTOR
} from '../engine/constants';

export const running = writable(false);

export const config = writable({
	countX: DEFAULT_COUNT_X,
	countY: DEFAULT_COUNT_Y,
	countZ: DEFAULT_COUNT_Z,
	radiusX: DEFAULT_RADIUS_X,
	radiusY: DEFAULT_RADIUS_Y,
	radiusZ: DEFAULT_RADIUS_Z,
	decayConstant: DEFAULT_DECAY,
	stabilityFactor: DEFAULT_STABILITY_FACTOR,
	hertz: DEFAULT_HERTZ,
	motionRange: DEFAULT_MOTION,
	gravity: DEFAULT_GRAVITY,
	gravityOn: false,
	temperature: 1.0,
	colorX: '#3498db',
	colorY: '#e74c3c',
	colorZ: '#f39c12',
	bgGrey: 26,    // 0–255, default matches #1a1a2e ≈ 26
	drainSpecies: null as ParticleType | null
});

export const chartData = writable<ParticleChartPoint[]>([]);
export const maWindow = writable(10);
export const latestState = writable<ParticleSimState | null>(null);
