import { writable } from 'svelte/store';
import type { ReactionDefinition, ChemistrySimState, ChemistryChartPoint } from '../engine/types';
import {
	DEFAULT_HERTZ, DEFAULT_MOTION, DEFAULT_GRAVITY,
	DEFAULT_EFFECTIVE_WIDTH, DEFAULT_BG_GREY
} from '../engine/constants';

export const running = writable(false);
export const selectedReactionId = writable('fe-scn');

export const config = writable({
	hertz: DEFAULT_HERTZ,
	motionRange: DEFAULT_MOTION,
	gravity: DEFAULT_GRAVITY,
	gravityOn: false,
	effectiveWidth: DEFAULT_EFFECTIVE_WIDTH,
	bgGrey: DEFAULT_BG_GREY,
	forwardRateOverride: null as number | null,
	reverseRateOverride: null as number | null,
	stepRateOverrides: {} as Record<number, { forward?: number; reverse?: number }>
});

export const chartData = writable<ChemistryChartPoint[]>([]);
export const maWindow = writable(10);
export const latestState = writable<ChemistrySimState | null>(null);
export const activeReaction = writable<ReactionDefinition | null>(null);
