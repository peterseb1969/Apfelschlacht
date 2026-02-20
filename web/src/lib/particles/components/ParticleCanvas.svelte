<script lang="ts">
	import { onMount } from 'svelte';
	import { ParticleSimulation } from '../engine/ParticleSimulation';
	import { ParticleRenderer, type RenderColors } from '../render/ParticleRenderer';
	import { running, config, chartData, latestState } from '../stores/particleStore';
	import type { ParticleChartPoint } from '../engine/types';

	let canvas: HTMLCanvasElement;
	let simulation: ParticleSimulation;
	let renderer: ParticleRenderer;
	let rafId: number;
	let lastTime = 0;
	let accumulator = 0;

	export function getSimulation(): ParticleSimulation {
		return simulation;
	}

	onMount(() => {
		simulation = new ParticleSimulation();
		renderer = new ParticleRenderer(canvas);

		let renderColors: RenderColors = { colorX: '#3498db', colorY: '#e74c3c', colorZ: '#f39c12', bgGrey: 26 };

		const unsubConfig = config.subscribe(($config) => {
			if (!simulation) return;
			simulation.hertz = $config.hertz;
			simulation.decayConstant = $config.decayConstant;
			simulation.stabilityFactor = $config.stabilityFactor;
			simulation.motionRange = $config.motionRange;
			simulation.gravity = $config.gravity;
			simulation.gravityOn = $config.gravityOn;
			simulation.setTemperature($config.temperature);
			simulation.setDrainSpecies($config.drainSpecies);
			renderColors = { colorX: $config.colorX, colorY: $config.colorY, colorZ: $config.colorZ, bgGrey: $config.bgGrey };
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
				renderer.render(state, renderColors);
				latestState.set(state);
				return;
			}

			const stepDt = 1 / simulation.hertz;
			accumulator += dtMs / 1000;
			if (accumulator > 0.5) accumulator = 0.5;

			while (accumulator >= stepDt) {
				simulation.tick(stepDt);
				accumulator -= stepDt;
			}

			const state = simulation.getState();
			renderer.render(state, renderColors);
			latestState.set(state);
		}

		rafId = requestAnimationFrame(loop);

		// Push chart data every second
		const chartInterval = setInterval(() => {
			if (!simulation || !simulation.running) return;
			const state = simulation.getState();
			const point: ParticleChartPoint = {
				time: Math.round(state.simTime),
				countX: state.countX,
				countY: state.countY,
				countC: state.countC,
				countZ: state.countZ,
				countS: state.countS
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
				case 'g':
				case 'G':
					config.update(c => ({ ...c, gravityOn: !c.gravityOn }));
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

<canvas bind:this={canvas} width={1200} height={800}></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
