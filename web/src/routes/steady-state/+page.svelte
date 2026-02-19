<script lang="ts">
	import ParticleCanvas from '$lib/particles/components/ParticleCanvas.svelte';
	import ParticleControlPanel from '$lib/particles/components/ParticleControlPanel.svelte';
	import ParticleLiveCharts from '$lib/particles/components/ParticleLiveCharts.svelte';
	import ParticleStatsDisplay from '$lib/particles/components/ParticleStatsDisplay.svelte';
	import ParticleExportButtons from '$lib/particles/components/ParticleExportButtons.svelte';
	import { config, chartData, running } from '$lib/particles/stores/particleStore';

	let particleCanvas: ParticleCanvas;

	function handleReset() {
		const sim = particleCanvas?.getSimulation();
		if (sim) {
			let cfg: any;
			config.subscribe(v => cfg = v)();
			sim.countX = cfg.countX;
			sim.countY = cfg.countY;
			sim.countZ = cfg.countZ;
			sim.radiusX = cfg.radiusX;
			sim.radiusY = cfg.radiusY;
			sim.radiusZ = cfg.radiusZ;
			sim.setup();
			running.set(false);
			chartData.set([]);
		}
	}
</script>

<svelte:head>
	<title>Steady State</title>
</svelte:head>

<div class="layout">
	<div class="canvas-area">
		<ParticleCanvas bind:this={particleCanvas} />
	</div>
	<aside class="side-panel">
		<ParticleControlPanel on:reset={handleReset} />
		<ParticleStatsDisplay />
		<ParticleLiveCharts />
		<ParticleExportButtons />
	</aside>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 350px;
		height: 100vh;
		gap: 0;
	}

	.canvas-area {
		overflow: hidden;
		background: #111;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.side-panel {
		overflow-y: auto;
		padding: 12px;
		background: #222;
		display: flex;
		flex-direction: column;
		gap: 16px;
		border-left: 1px solid #444;
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			height: auto;
			overflow-y: auto;
		}

		.canvas-area {
			height: 60vh;
		}

		.side-panel {
			border-left: none;
			border-top: 1px solid #444;
		}
	}
</style>
