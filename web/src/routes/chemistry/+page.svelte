<script lang="ts">
	import ChemistryCanvas from '$lib/chemistry/components/ChemistryCanvas.svelte';
	import ChemistryControlPanel from '$lib/chemistry/components/ChemistryControlPanel.svelte';
	import ChemistryLiveCharts from '$lib/chemistry/components/ChemistryLiveCharts.svelte';
	import ChemistryStatsDisplay from '$lib/chemistry/components/ChemistryStatsDisplay.svelte';
	import ChemistryExportButtons from '$lib/chemistry/components/ChemistryExportButtons.svelte';
	import { running, chartData, activeReaction } from '$lib/chemistry/stores/chemistryStore';
	import { reactionLibrary } from '$lib/chemistry/data/reactionLibrary';

	let chemistryCanvas: ChemistryCanvas;

	// Load the default reaction on mount
	$activeReaction = reactionLibrary[0];

	function handleReset() {
		const sim = chemistryCanvas?.getSimulation();
		if (sim) {
			running.set(false);
			chartData.set([]);
		}
	}

	function handleInject(e: CustomEvent<{ symbol: string; count: number }>) {
		const sim = chemistryCanvas?.getSimulation();
		if (sim) {
			sim.injectSpecies(e.detail.symbol, e.detail.count);
		}
	}
</script>

<svelte:head>
	<title>Chemie</title>
</svelte:head>

<div class="layout">
	<div class="canvas-area">
		<ChemistryCanvas bind:this={chemistryCanvas} />
	</div>
	<aside class="side-panel">
		<ChemistryControlPanel on:reset={handleReset} on:inject={handleInject} />
		<ChemistryStatsDisplay />
		<ChemistryLiveCharts />
		<ChemistryExportButtons />
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
