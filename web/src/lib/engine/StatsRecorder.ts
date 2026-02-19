import { MAX_STATS_ENTRIES } from './constants';
import type { StatsSnapshot, DistRecord } from './types';

export class StatsRecorder {
	appleHistory: StatsSnapshot[] = [];
	distHistory: DistRecord[] = [];

	recordApples(
		time: number,
		manFlying: number, manTotal: number,
		boyFlying: number, boyTotal: number
	): void {
		this.appleHistory.push({ time, manFlying, manTotal, boyFlying, boyTotal });
		if (this.appleHistory.length > MAX_STATS_ENTRIES) {
			this.appleHistory = [];
		}
	}

	recordDistance(player: string, distance: number): void {
		this.distHistory.push({ time: performance.now() / 1000, player, distance });
		if (this.distHistory.length > MAX_STATS_ENTRIES) {
			this.distHistory = [];
		}
	}

	toCSV(): { apples: string; distances: string } {
		let apples = 'time,manFlying,manTotal,boyFlying,boyTotal\n';
		for (const s of this.appleHistory) {
			apples += `${s.time},${s.manFlying},${s.manTotal},${s.boyFlying},${s.boyTotal}\n`;
		}

		let distances = 'time,player,distance\n';
		for (const d of this.distHistory) {
			distances += `${d.time},${d.player},${d.distance}\n`;
		}

		return { apples, distances };
	}

	toJSON(): string {
		return JSON.stringify({
			appleHistory: this.appleHistory,
			distHistory: this.distHistory
		}, null, 2);
	}

	clear(): void {
		this.appleHistory = [];
		this.distHistory = [];
	}
}
