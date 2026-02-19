import { Algorithm, MIN_SPEED, MAX_SPEED, VALUES_FOR_AVERAGE, DEFAULT_SPEED_APPLE, SPRITE_FRAME_COUNT } from './constants';
import { MovingObject } from './MovingObject';
import type { Apple } from './types';
import type { StatsRecorder } from './StatsRecorder';

export class Player {
	name: string;
	x: number;
	y: number;
	speed: number;
	speedApple: number;
	flyApples: number;
	screenWidth: number;
	screenHeight: number;

	myApples: Apple[] = [];
	nextApple: Apple | null = null;
	objsInMotion: MovingObject[] = [];

	steps = 0;
	deltaX = 0;
	deltaY = 0;

	spriteFrame = 0;
	spriteTime = 0;
	textureOffset = 0;

	halfLife = 10;
	flyAppleNumbers: number[] = [];
	avgDist: number[] = [];

	constructor(name: string, x: number, y: number, speed: number, screenWidth: number, screenHeight: number) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedApple = DEFAULT_SPEED_APPLE;
		this.flyApples = 0;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
	}

	changeSpeed(delta: number): void {
		this.speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, this.speed + delta));
	}

	findNextApple(algorithm: Algorithm, dt: number, stats?: StatsRecorder): void {
		let nearestApple: Apple | null = null;
		let dist = Infinity;

		if (algorithm === Algorithm.NearestApple) {
			for (const apple of this.myApples) {
				const dx = this.x - apple.x;
				const dy = this.y - apple.y;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d < dist) {
					dist = d;
					nearestApple = apple;
				}
			}
		} else if (algorithm === Algorithm.Random) {
			if (this.myApples.length > 0) {
				nearestApple = this.myApples[Math.floor(Math.random() * this.myApples.length)];
				const dx = this.x - nearestApple.x;
				const dy = this.y - nearestApple.y;
				dist = Math.sqrt(dx * dx + dy * dy);
			}
		}

		if (algorithm !== Algorithm.SpontaneousCombustion) {
			if (nearestApple !== null) {
				this.avgDist.push(dist);
				if (this.avgDist.length > VALUES_FOR_AVERAGE) {
					this.avgDist.shift();
					if (stats) {
						stats.recordDistance(this.name, dist);
					}
				}
				this.steps = Math.max(1, Math.floor(dist / this.speed));
				this.deltaX = (nearestApple.x - this.x) / this.steps;
				this.deltaY = (nearestApple.y - this.y) / this.steps;
				this.nextApple = nearestApple;
			}
		} else {
			this.spontaneousCombustion(dt);
		}
	}

	private spontaneousCombustion(dt: number): void {
		if (this.halfLife <= 0 || this.myApples.length === 0) return;
		const p = 1 - Math.exp(-Math.LN2 / this.halfLife * dt);

		for (let i = this.myApples.length - 1; i >= 0; i--) {
			if (Math.random() < p) {
				const apple = this.myApples[i];
				const offset = this.name === 'boy' ? this.screenWidth / 2 + 20 : 0;
				const destX = Math.floor(Math.random() * (this.screenWidth / 2 - 20)) + offset + 10;
				const destY = Math.floor(Math.random() * (this.screenHeight - 20)) + 10;
				const flyApple = new MovingObject(destX, destY, this.speedApple, apple);
				this.flyApples++;
				this.objsInMotion.push(flyApple);
				this.myApples.splice(i, 1);
			}
		}
	}

	getAvgDist(): number {
		if (this.avgDist.length < VALUES_FOR_AVERAGE) return 0;
		return this.avgDist.reduce((a, b) => a + b, 0) / this.avgDist.length;
	}

	getAvgFlyApples(): number {
		if (this.flyAppleNumbers.length < VALUES_FOR_AVERAGE) return 0;
		return this.flyAppleNumbers.reduce((a, b) => a + b, 0) / this.flyAppleNumbers.length;
	}

	updateAnimation(dt: number): void {
		this.spriteTime += dt;
		if (this.spriteTime > 0.1) {
			this.spriteTime = 0;
			this.spriteFrame = (this.spriteFrame + 1) % SPRITE_FRAME_COUNT;
			this.textureOffset = this.deltaX < 0 ? SPRITE_FRAME_COUNT : 0;
		}
	}
}
