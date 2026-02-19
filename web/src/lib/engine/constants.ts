export enum Algorithm {
	NearestApple = 'NEAREST_APPLE',
	Random = 'RANDOM',
	SpontaneousCombustion = 'SPONTANEOUS_COMBUSTION'
}

export const ALGO_LABELS: Record<Algorithm, string> = {
	[Algorithm.NearestApple]: 'Nächster Apfel',
	[Algorithm.Random]: 'Zufälliger Apfel',
	[Algorithm.SpontaneousCombustion]: 'Spontaner Apfelflug'
};

export const SCREEN_WIDTH = 1600;
export const SCREEN_HEIGHT = 800;

export const DEFAULT_SPEED_MAN = 3;
export const DEFAULT_SPEED_BOY = 6;
export const DEFAULT_SPEED_APPLE = 8;
export const DEFAULT_APPLE_COUNT = 150;
export const DEFAULT_HERTZ = 60;

export const MIN_SPEED = 1;
export const MAX_SPEED = 50;
export const MIN_HERTZ = 10;
export const MAX_HERTZ = 200;

export const SPRITE_FRAME_COUNT = 8;
export const SPRITE_FRAME_INTERVAL = 0.1;

export const HUD_HEIGHT = 200;

export const MAX_STATS_ENTRIES = 10_000;
export const VALUES_FOR_AVERAGE = 10;
