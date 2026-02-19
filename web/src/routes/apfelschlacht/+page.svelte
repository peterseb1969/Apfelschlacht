<script lang="ts">
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import LiveCharts from '$lib/components/LiveCharts.svelte';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';
	import ExportButtons from '$lib/components/ExportButtons.svelte';
	import { config, chartData, running } from '$lib/stores/gameStore';

	let gameCanvas: GameCanvas;

	function handleAlgorithmChange() {
		const sim = gameCanvas?.getSimulation();
		if (sim) {
			let cfg: any;
			config.subscribe(v => cfg = v)();
			sim.setAlgorithm(cfg.algorithm);
		}
	}

	function handleAppleCountChange() {
		const sim = gameCanvas?.getSimulation();
		if (sim) {
			let cfg: any;
			config.subscribe(v => cfg = v)();
			sim.appleCount = cfg.appleCount;
			sim.setup();
		}
	}

	function handleReset() {
		const sim = gameCanvas?.getSimulation();
		if (sim) {
			sim.setup();
			running.set(false);
			chartData.set([]);
		}
	}
</script>

<svelte:head>
	<title>Apfelschlacht</title>
</svelte:head>

<div class="layout">
	<div class="canvas-area">
		<GameCanvas
			bind:this={gameCanvas}
		/>
	</div>
	<aside class="side-panel">
		<ControlPanel
			on:algorithm-change={handleAlgorithmChange}
			on:apple-count-change={handleAppleCountChange}
			on:reset={handleReset}
		/>
		<StatsDisplay />
		<LiveCharts />
		<ExportButtons />
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
