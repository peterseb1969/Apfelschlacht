<script lang="ts">
	import { onMount } from 'svelte';
	import { ChemistrySimulation } from '../engine/ChemistrySimulation';
	import { ChemistryRenderer } from '../render/ChemistryRenderer';
	import { running, config, chartData, latestState, activeReaction } from '../stores/chemistryStore';
	import type { ChemistryChartPoint, SpeciesDefinition } from '../engine/types';

	let canvas: HTMLCanvasElement;
	let simulation: ChemistrySimulation;
	let renderer: ChemistryRenderer;
	let rafId: number;
	let lastTime = 0;
	let accumulator = 0;
	let speciesDefs = new Map<string, SpeciesDefinition>();

	export function getSimulation(): ChemistrySimulation {
		return simulation;
	}

	export function getSpeciesDefs(): Map<string, SpeciesDefinition> {
		return speciesDefs;
	}

	onMount(() => {
		simulation = new ChemistrySimulation();
		renderer = new ChemistryRenderer(canvas);

		let bgGrey = 26;

		const unsubConfig = config.subscribe(($config) => {
			if (!simulation) return;
			simulation.hertz = $config.hertz;
			simulation.motionRange = $config.motionRange;
			simulation.gravity = $config.gravity;
			simulation.gravityOn = $config.gravityOn;
			simulation.setTemperature($config.temperature);
			simulation.setEffectiveWidth($config.effectiveWidth);
			simulation.setForwardRate($config.forwardRateOverride);
			simulation.setReverseRate($config.reverseRateOverride);
			bgGrey = $config.bgGrey;
		});

		const unsubRunning = running.subscribe(($running) => {
			if (simulation) simulation.running = $running;
		});

		const unsubReaction = activeReaction.subscribe(($reaction) => {
			if (!simulation || !$reaction) return;
			speciesDefs.clear();
			for (const s of $reaction.species) {
				speciesDefs.set(s.symbol, s);
			}
			simulation.loadReaction($reaction);
			lastTime = 0;
			accumulator = 0;
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
				renderer.render(state, speciesDefs, bgGrey);
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
			renderer.render(state, speciesDefs, bgGrey);
			latestState.set(state);
		}

		rafId = requestAnimationFrame(loop);

		const chartInterval = setInterval(() => {
			if (!simulation || !simulation.running) return;
			const state = simulation.getState();
			const point: ChemistryChartPoint = {
				time: Math.round(state.simTime),
				counts: { ...state.speciesCounts },
				pressure: state.pressure,
				temperature: state.temperature,
				volume: state.effectiveWidth * state.height / 1000
			};
			chartData.update(data => [...data, point]);
		}, 1000);

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
			unsubReaction();
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
