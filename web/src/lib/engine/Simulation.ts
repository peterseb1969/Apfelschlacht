import {
	Algorithm,
	DEFAULT_SPEED_MAN, DEFAULT_SPEED_BOY, DEFAULT_SPEED_APPLE,
	DEFAULT_APPLE_COUNT, DEFAULT_HERTZ,
	SCREEN_WIDTH, SCREEN_HEIGHT,
	VALUES_FOR_AVERAGE, MIN_HERTZ, MAX_HERTZ
} from './constants';
import type { Apple, SimulationConfig, SimulationState, ThrowEvent } from './types';
import { Player } from './Player';
import { MovingObject } from './MovingObject';
import { StatsRecorder } from './StatsRecorder';

let nextAppleId = 0;

export class Simulation {
	width: number;
	height: number;
	algorithm: Algorithm;
	hertz: number;
	applesBoy: number;
	applesMan: number;
	speedApple: number;

	oldMan!: Player;
	youngBoy!: Player;
	allApples: Apple[] = [];
	throwLog: ThrowEvent[] = [];
	stats = new StatsRecorder();

	simTime = 0;
	timeSinceTick = 0;
	running = false;

	constructor() {
		this.width = SCREEN_WIDTH;
		this.height = SCREEN_HEIGHT;
		this.algorithm = Algorithm.NearestApple;
		this.hertz = DEFAULT_HERTZ;
		this.applesBoy = DEFAULT_APPLE_COUNT;
		this.applesMan = 0;
		this.speedApple = DEFAULT_SPEED_APPLE;
		this.setup();
	}

	setup(): void {
		nextAppleId = 0;
		this.simTime = 0;
		this.timeSinceTick = 0;
		this.stats.clear();

		this.youngBoy = new Player('boy', 100, 100, DEFAULT_SPEED_BOY, this.width, this.height);
		this.oldMan = new Player('man', this.width / 2 + 100, 100, DEFAULT_SPEED_MAN, this.width, this.height);

		this.oldMan.speedApple = this.speedApple;
		this.youngBoy.speedApple = this.speedApple;

		this.throwLog = [];
		this.throwLog.push({ time: 0, player: 'boy', x: this.youngBoy.x, y: this.youngBoy.y });
		this.throwLog.push({ time: 0, player: 'man', x: this.oldMan.x, y: this.oldMan.y });

		this.allApples = [];
		this.youngBoy.myApples = [];
		this.oldMan.myApples = [];

		// Boy's apples on the left side
		for (let i = 0; i < this.applesBoy; i++) {
			const apple: Apple = {
				x: Math.floor(Math.random() * (this.width / 2 - 20)) + 10,
				y: Math.floor(Math.random() * (this.height - 20)) + 10,
				id: nextAppleId++
			};
			this.allApples.push(apple);
			this.youngBoy.myApples.push(apple);
		}

		// Man's apples on the right side
		for (let i = 0; i < this.applesMan; i++) {
			const apple: Apple = {
				x: Math.floor(Math.random() * (this.width / 2 - 20)) + this.width / 2 + 10,
				y: Math.floor(Math.random() * (this.height - 20)) + 10,
				id: nextAppleId++
			};
			this.allApples.push(apple);
			this.oldMan.myApples.push(apple);
		}
	}

	tick(dt: number): void {
		if (!this.running) return;

		this.simTime += dt;
		this.timeSinceTick += dt;

		const players = [this.oldMan, this.youngBoy];

		for (const p of players) {
			if (this.timeSinceTick > 1) {
				p.flyAppleNumbers.push(p.flyApples);
				if (p.flyAppleNumbers.length > VALUES_FOR_AVERAGE) {
					p.flyAppleNumbers.shift();
				}
				if (p.avgDist.length > VALUES_FOR_AVERAGE) {
					p.avgDist.shift();
				}
			}

			p.updateAnimation(dt);
		}

		if (this.timeSinceTick > 1) {
			this.stats.recordApples(
				this.simTime,
				this.oldMan.flyApples, this.oldMan.myApples.length,
				this.youngBoy.flyApples, this.youngBoy.myApples.length
			);
			this.timeSinceTick = 0;
		}

		// Player movement and apple throwing
		for (const p of players) {
			if (p.nextApple !== null && this.algorithm !== Algorithm.SpontaneousCombustion) {
				if (p.steps > 0) {
					p.steps--;
					p.x += p.deltaX;
					p.y += p.deltaY;
				} else {
					// Arrived at apple — record throw event and throw to opposite side
					this.throwLog.push({ time: this.simTime, player: p.name, x: p.x, y: p.y });
					const offset = p.name === 'boy' ? this.width / 2 + 20 : 0;
					const destX = Math.floor(Math.random() * (this.width / 2 - 20)) + offset + 10;
					const destY = Math.floor(Math.random() * (this.height - 20)) + 10;
					const flyApple = new MovingObject(destX, destY, this.speedApple, p.nextApple);

					if (destX > this.width / 2) {
						this.youngBoy.flyApples++;
						this.youngBoy.objsInMotion.push(flyApple);
					} else {
						this.oldMan.flyApples++;
						this.oldMan.objsInMotion.push(flyApple);
					}

					const idx = p.myApples.indexOf(p.nextApple);
					if (idx !== -1) p.myApples.splice(idx, 1);
					p.nextApple = null;
				}
			} else if (p.nextApple === null) {
				p.findNextApple(this.algorithm, dt, this.stats);
			}
		}

		// Move flying apples
		for (const p of players) {
			for (let i = p.objsInMotion.length - 1; i >= 0; i--) {
				const obj = p.objsInMotion[i];
				if (!obj.move()) {
					p.objsInMotion.splice(i, 1);
					if (p.name === 'man') {
						this.youngBoy.myApples.push(obj.apple);
					} else {
						this.oldMan.myApples.push(obj.apple);
					}
					p.flyApples--;
				}
			}
			if (this.algorithm === Algorithm.SpontaneousCombustion) {
				p.findNextApple(this.algorithm, dt, this.stats);
			}
		}
	}

	getState(): SimulationState {
		return {
			running: this.running,
			algorithm: this.algorithm,
			hertz: this.hertz,
			simTime: this.simTime,
			width: this.width,
			height: this.height,
			apples: this.allApples,
			man: {
				name: this.oldMan.name,
				x: this.oldMan.x,
				y: this.oldMan.y,
				spriteFrame: this.oldMan.spriteFrame,
				textureOffset: this.oldMan.textureOffset,
				appleCount: this.oldMan.myApples.length,
				flyApples: this.oldMan.flyApples,
				speed: this.oldMan.speed,
				speedApple: this.oldMan.speedApple,
				avgDist: this.oldMan.getAvgDist(),
				avgFlyApples: this.oldMan.getAvgFlyApples()
			},
			boy: {
				name: this.youngBoy.name,
				x: this.youngBoy.x,
				y: this.youngBoy.y,
				spriteFrame: this.youngBoy.spriteFrame,
				textureOffset: this.youngBoy.textureOffset,
				appleCount: this.youngBoy.myApples.length,
				flyApples: this.youngBoy.flyApples,
				speed: this.youngBoy.speed,
				speedApple: this.youngBoy.speedApple,
				avgDist: this.youngBoy.getAvgDist(),
				avgFlyApples: this.youngBoy.getAvgFlyApples()
			}
		};
	}

	changeHertz(delta: number): void {
		this.hertz = Math.max(MIN_HERTZ, Math.min(MAX_HERTZ, this.hertz + delta));
	}

	get appleCount(): number {
		return this.applesBoy + this.applesMan;
	}

	setAlgorithm(algo: Algorithm): void {
		this.algorithm = algo;
		this.setup();
	}

	changeAppleSpeed(delta: number): void {
		const newSpeed = this.speedApple + delta;
		if (newSpeed >= 1) {
			this.speedApple = newSpeed;
			this.oldMan.speedApple = newSpeed;
			this.youngBoy.speedApple = newSpeed;
		}
	}
}
