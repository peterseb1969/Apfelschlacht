import { MAX_STATS_ENTRIES } from './constants';
import type { ParticleChartPoint } from './types';

export class StatsRecorder {
	history: ParticleChartPoint[] = [];

	record(time: number, countX: number, countY: number, countC: number, countZ: number, countS: number): void {
		this.history.push({ time, countX, countY, countC, countZ, countS });
		if (this.history.length > MAX_STATS_ENTRIES) {
			this.history = [];
		}
	}

	toCSV(): string {
		let csv = 'time,countX,countY,countC,countZ,countS\n';
		for (const d of this.history) {
			csv += `${d.time},${d.countX},${d.countY},${d.countC},${d.countZ},${d.countS}\n`;
		}
		return csv;
	}

	toJSON(): string {
		return JSON.stringify(this.history, null, 2);
	}

	clear(): void {
		this.history = [];
	}
}
