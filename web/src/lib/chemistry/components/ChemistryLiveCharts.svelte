<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { Chart, registerables } from 'chart.js';
	import { chartData, maWindow, activeReaction } from '../stores/chemistryStore';
	import type { ReactionDefinition, ChemistryChartPoint } from '../engine/types';

	Chart.register(...registerables);

	let countCanvas: HTMLCanvasElement;
	let pressureCanvas: HTMLCanvasElement;

	let countChart: Chart;
	let pressureChart: Chart;

	let modalOpen = $state(false);
	let modalCanvas = $state<HTMLCanvasElement>(undefined!);
	let modalChart: Chart | null = null;
	let modalTitle = $state('');

	function legendLabels(fontSize: number, lineWidth: number) {
		return {
			color: '#ccc',
			font: { size: fontSize },
			usePointStyle: true,
			pointStyleWidth: lineWidth,
			generateLabels: (chart: Chart) => {
				return chart.data.datasets.map((ds, i) => ({
					text: ds.label ?? '',
					fontColor: '#ccc',
					strokeStyle: ds.borderColor as string,
					fillStyle: ds.borderColor as string,
					lineWidth: ds.borderWidth as number,
					lineDash: (ds as any).borderDash || [],
					pointStyle: 'line' as const,
					hidden: !chart.isDatasetVisible(i),
					datasetIndex: i
				}));
			}
		};
	}

	const smallChartOpts = {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 0 },
		scales: {
			x: {
				title: { display: true, text: 'Zeit (s)', color: '#ccc', font: { size: 10 } },
				ticks: { color: '#aaa', font: { size: 9 } },
				grid: { color: '#333' }
			},
			y: {
				ticks: { color: '#aaa', font: { size: 9 } },
				grid: { color: '#333' }
			}
		},
		plugins: {
			legend: { labels: legendLabels(10, 20) }
		}
	};

	const bigChartOpts = {
		responsive: true,
		maintainAspectRatio: false,
		animation: { duration: 0 },
		scales: {
			x: {
				title: { display: true, text: 'Zeit (s)', color: '#ccc', font: { size: 14 } },
				ticks: { color: '#aaa', font: { size: 12 } },
				grid: { color: '#333' }
			},
			y: {
				ticks: { color: '#aaa', font: { size: 12 } },
				grid: { color: '#333' }
			}
		},
		plugins: {
			legend: { labels: legendLabels(13, 24) }
		}
	};

	const stableScalePlugin = {
		id: 'stableScale',
		beforeLayout(chart: Chart) {
			let min = Infinity;
			let max = -Infinity;
			for (const ds of chart.data.datasets) {
				for (const v of ds.data) {
					if (v === null || v === undefined) continue;
					const n = v as number;
					if (n < min) min = n;
					if (n > max) max = n;
				}
			}
			if (min !== Infinity && max !== -Infinity) {
				const pad = (max - min) * 0.05 || 1;
				chart.options.scales!.y!.min = min - pad;
				chart.options.scales!.y!.max = max + pad;
			}
		}
	};

	function makeCountDatasets(reaction: ReactionDefinition | null) {
		if (!reaction) return [];
		const datasets: any[] = [];
		// Raw datasets
		for (const s of reaction.species) {
			datasets.push({
				label: s.symbol,
				data: [] as number[],
				borderColor: s.color,
				borderWidth: 2,
				pointRadius: 0,
				fill: false,
				order: reaction.species.length - datasets.length
			});
		}
		// MA datasets
		for (const s of reaction.species) {
			datasets.push({
				label: `${s.symbol} (GD)`,
				data: [] as (number | null)[],
				borderColor: s.color,
				borderWidth: 2.5,
				borderDash: [5, 3],
				pointRadius: 0,
				fill: false,
				order: reaction.species.length - (datasets.length - reaction.species.length)
			});
		}
		return datasets;
	}

	function movingAvg(arr: number[], window: number): (number | null)[] {
		return arr.map((_, i) => {
			if (i < window - 1) return null;
			let sum = 0;
			for (let j = i - window + 1; j <= i; j++) sum += arr[j];
			return sum / window;
		});
	}

	const CHART_WINDOW = 60;

	function windowedMA(full: number[], w: number): (number | null)[] {
		return movingAvg(full, w).slice(-CHART_WINDOW);
	}

	function openModal() {
		const reaction = get(activeReaction);
		modalTitle = 'Spezies-Bestand';
		modalOpen = true;

		requestAnimationFrame(() => {
			if (!modalCanvas) return;
			modalChart?.destroy();
			modalChart = new Chart(modalCanvas, {
				type: 'line',
				data: { labels: [], datasets: makeCountDatasets(reaction) },
				options: { ...bigChartOpts, plugins: { ...bigChartOpts.plugins, title: { display: true, text: 'Spezies-Bestand', color: '#ddd', font: { size: 18 } } } },
				plugins: [stableScalePlugin]
			});
			syncModalChart();
		});
	}

	function closeModal() {
		modalOpen = false;
		modalChart?.destroy();
		modalChart = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && modalOpen) {
			e.stopPropagation();
			closeModal();
		}
	}

	function syncModalChart() {
		if (!modalChart) return;
		const data = get(chartData);
		const reaction = get(activeReaction);
		if (data.length === 0 || !reaction) return;
		const w = get(maWindow);
		const view = data.slice(-CHART_WINDOW);

		modalChart.data.labels = view.map(d => d.time);
		const speciesCount = reaction.species.length;

		for (let si = 0; si < speciesCount; si++) {
			const sym = reaction.species[si].symbol;
			const full = data.map(d => d.counts[sym] ?? 0);
			modalChart.data.datasets[si].data = full.slice(-CHART_WINDOW);
			modalChart.data.datasets[si + speciesCount].data = windowedMA(full, w);
		}
		modalChart.update('none');
	}

	function rebuildCharts() {
		const reaction = get(activeReaction);
		if (!countChart || !reaction) return;

		countChart.data.datasets = makeCountDatasets(reaction);
		countChart.update('none');
	}

	function updateAllCharts() {
		const data = get(chartData);
		const reaction = get(activeReaction);
		if (!countChart || data.length === 0 || !reaction) return;
		const w = get(maWindow);

		const view = data.slice(-CHART_WINDOW);
		const labels = view.map(d => d.time);
		const speciesCount = reaction.species.length;

		countChart.data.labels = labels;
		for (let si = 0; si < speciesCount; si++) {
			const sym = reaction.species[si].symbol;
			const full = data.map(d => d.counts[sym] ?? 0);
			if (countChart.data.datasets[si]) {
				countChart.data.datasets[si].data = full.slice(-CHART_WINDOW);
			}
			if (countChart.data.datasets[si + speciesCount]) {
				countChart.data.datasets[si + speciesCount].data = windowedMA(full, w);
			}
		}
		countChart.update('none');

		// Pressure chart
		if (pressureChart) {
			pressureChart.data.labels = labels;
			const fullP = data.map(d => d.pressure);
			pressureChart.data.datasets[0].data = fullP.slice(-CHART_WINDOW);
			pressureChart.data.datasets[1].data = windowedMA(fullP, w);
			pressureChart.update('none');
		}

		syncModalChart();
	}

	onMount(() => {
		const reaction = get(activeReaction);

		countChart = new Chart(countCanvas, {
			type: 'line',
			data: { labels: [], datasets: makeCountDatasets(reaction) },
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Spezies-Bestand', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		pressureChart = new Chart(pressureCanvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{ label: 'Druck', data: [], borderColor: '#e74c3c', borderWidth: 2, pointRadius: 0, fill: false },
					{ label: 'Druck (GD)', data: [] as (number | null)[], borderColor: '#e74c3c', borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false }
				]
			},
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Druck', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		window.addEventListener('keydown', handleKeydown);
	});

	const unsubData = chartData.subscribe(() => updateAllCharts());
	const unsubMa = maWindow.subscribe(() => updateAllCharts());
	const unsubReaction = activeReaction.subscribe(() => rebuildCharts());

	onDestroy(() => {
		unsubData();
		unsubMa();
		unsubReaction();
		countChart?.destroy();
		pressureChart?.destroy();
		modalChart?.destroy();
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="charts">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart-box" onclick={() => openModal()} onkeydown={(e) => e.key === 'Enter' && openModal()} role="button" tabindex="0" title="Zum Vergr\u00F6\u00DFern klicken">
		<canvas bind:this={countCanvas}></canvas>
	</div>
	<div class="chart-box">
		<canvas bind:this={pressureCanvas}></canvas>
	</div>
</div>

{#if modalOpen}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={closeModal} onkeydown={handleKeydown}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<span class="modal-title">{modalTitle}</span>
			<button class="modal-close" onclick={closeModal}>&times;</button>
		</div>
		<div class="modal-body">
			<canvas bind:this={modalCanvas}></canvas>
		</div>
	</div>
</div>
{/if}

<style>
	.charts {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chart-box {
		height: 160px;
		position: relative;
		cursor: pointer;
		border-radius: 4px;
		transition: outline 0.15s;
		outline: 2px solid transparent;
	}

	.chart-box:hover {
		outline: 2px solid #666;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal {
		background: #1e1e1e;
		border: 1px solid #555;
		border-radius: 8px;
		width: min(900px, 90vw);
		height: min(520px, 80vh);
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid #444;
	}

	.modal-title {
		font-size: 1rem;
		font-weight: 600;
	}

	.modal-close {
		background: none;
		border: none;
		color: #aaa;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0 4px;
		line-height: 1;
	}

	.modal-close:hover {
		color: white;
	}

	.modal-body {
		flex: 1;
		padding: 16px;
		position: relative;
		min-height: 0;
	}
</style>
