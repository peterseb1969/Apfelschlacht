<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import { Simulation } from '$lib/engine/Simulation';
	import { Algorithm } from '$lib/engine/constants';
	import { CanvasRenderer } from '$lib/render/CanvasRenderer';
	import { loadSprites } from '$lib/render/SpriteSheet';
	import { running, config, chartData, latestState } from '$lib/stores/gameStore';
	import type { ChartPoint } from '$lib/stores/gameStore';

	let canvas: HTMLCanvasElement;
	let simulation: Simulation;
	let renderer: CanvasRenderer;
	let rafId: number;
	let lastTime = 0;
	let accumulator = 0;

	export function getSimulation(): Simulation {
		return simulation;
	}

	onMount(async () => {
		const sprites = await loadSprites(`${base}/sprites`);
		simulation = new Simulation();
		renderer = new CanvasRenderer(canvas, sprites);

		// Subscribe to config changes
		const unsubConfig = config.subscribe(($config) => {
			if (!simulation) return;
			simulation.hertz = $config.hertz;
			simulation.oldMan.speed = $config.speedMan;
			simulation.youngBoy.speed = $config.speedBoy;
			simulation.speedApple = $config.speedApple;
			simulation.oldMan.speedApple = $config.speedApple;
			simulation.youngBoy.speedApple = $config.speedApple;
			simulation.youngBoy.halfLife = $config.halfLifeLeft;
			simulation.oldMan.halfLife = $config.halfLifeRight;
			if (renderer) {
				renderer.appleSize = $config.appleSize;
				renderer.playerSize = $config.playerSize;
			}
		});

		const unsubRunning = running.subscribe(($running) => {
			if (simulation) simulation.running = $running;
		});

		function loop(time: number) {
			rafId = requestAnimationFrame(loop);
			if (lastTime === 0) {
				lastTime = time;
				return;
			}

			const dtMs = time - lastTime;
			lastTime = time;

			if (!simulation.running) {
				const state = simulation.getState();
				renderer.render(state);
				latestState.set(state);
				return;
			}

			const stepDt = 1 / simulation.hertz;
			accumulator += dtMs / 1000;

			// Cap accumulator to avoid spiral of death
			if (accumulator > 0.5) accumulator = 0.5;

			while (accumulator >= stepDt) {
				simulation.tick(stepDt);
				accumulator -= stepDt;
			}

			const state = simulation.getState();
			renderer.render(state);
			latestState.set(state);
		}

		rafId = requestAnimationFrame(loop);

		// Push chart data every second
		let chartInterval = setInterval(() => {
			if (!simulation || !simulation.running) return;
			const state = simulation.getState();
			const manAll = state.man.appleCount + state.man.flyApples;
			const boyAll = state.boy.appleCount + state.boy.flyApples;
			const point: ChartPoint = {
				time: Math.round(state.simTime),
				manTotal: state.man.appleCount,
				boyTotal: state.boy.appleCount,
				manFlying: state.man.flyApples,
				boyFlying: state.boy.flyApples,
				manDist: state.man.avgDist,
				boyDist: state.boy.avgDist,
				ratio: boyAll > 0 ? manAll / boyAll : 0
			};
			chartData.update(data => [...data, point]);
		}, 1000);

		// Keyboard handler
		function handleKey(e: KeyboardEvent) {
			if (!simulation) return;
			switch (e.key) {
				case ' ':
					e.preventDefault();
					running.update(r => !r);
					break;
				case 'w':
				case 'W':
					simulation.changeAppleCount(50);
					config.update(c => ({ ...c, appleCount: simulation.appleCount }));
					chartData.set([]);
					break;
				case 's':
				case 'S':
					simulation.changeAppleCount(-50);
					config.update(c => ({ ...c, appleCount: simulation.appleCount }));
					chartData.set([]);
					break;
				case 'o':
				case 'O':
					simulation.oldMan.changeSpeed(1);
					config.update(c => ({ ...c, speedMan: simulation.oldMan.speed }));
					break;
				case 'l':
				case 'L':
					simulation.oldMan.changeSpeed(-1);
					config.update(c => ({ ...c, speedMan: simulation.oldMan.speed }));
					break;
				case 'j':
				case 'J':
					simulation.youngBoy.changeSpeed(1);
					config.update(c => ({ ...c, speedBoy: simulation.youngBoy.speed }));
					break;
				case 'n':
				case 'N':
					simulation.youngBoy.changeSpeed(-1);
					config.update(c => ({ ...c, speedBoy: simulation.youngBoy.speed }));
					break;
				case 'a':
				case 'A':
					simulation.changeAppleSpeed(1);
					config.update(c => ({ ...c, speedApple: simulation.speedApple }));
					break;
				case 'y':
				case 'Y':
					simulation.changeAppleSpeed(-1);
					config.update(c => ({ ...c, speedApple: simulation.speedApple }));
					break;
				case '1':
					simulation.setAlgorithm(Algorithm.NearestApple);
					config.update(c => ({ ...c, algorithm: Algorithm.NearestApple }));
					chartData.set([]);
					break;
				case '2':
					simulation.setAlgorithm(Algorithm.Random);
					config.update(c => ({ ...c, algorithm: Algorithm.Random }));
					chartData.set([]);
					break;
				case '3':
					simulation.setAlgorithm(Algorithm.SpontaneousCombustion);
					config.update(c => ({ ...c, algorithm: Algorithm.SpontaneousCombustion }));
					chartData.set([]);
					break;
				case '+':
				case '=':
					simulation.changeHertz(10);
					config.update(c => ({ ...c, hertz: simulation.hertz }));
					break;
				case '-':
					simulation.changeHertz(-10);
					config.update(c => ({ ...c, hertz: simulation.hertz }));
					break;
			}
		}

		window.addEventListener('keydown', handleKey);

		return () => {
			cancelAnimationFrame(rafId);
			clearInterval(chartInterval);
			window.removeEventListener('keydown', handleKey);
			unsubConfig();
			unsubRunning();
		};
	});
</script>

<canvas bind:this={canvas} width={1600} height={800}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		display: block;
		image-rendering: pixelated;
	}
</style>
