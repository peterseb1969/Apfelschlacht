<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { Chart, registerables } from 'chart.js';
	import { chartData, maWindow, config } from '$lib/stores/gameStore';
	import type { ChartPoint } from '$lib/stores/gameStore';
	import { Algorithm } from '$lib/engine/constants';

	Chart.register(...registerables);

	let appleCanvas: HTMLCanvasElement;
	let flyingCanvas: HTMLCanvasElement;
	let distCanvas: HTMLCanvasElement;

	let appleChart: Chart;
	let flyingChart: Chart;
	let distChart: Chart;

	// Modal state
	let modalOpen = $state(false);
	let modalCanvas = $state<HTMLCanvasElement>(undefined!);
	let modalChart: Chart | null = null;
	let modalTitle = $state('');
	let activeChartIndex = $state(-1);

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

	// Plugin: compute Y scale from ALL datasets (including hidden) so toggling legend doesn't rescale
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

	function makeDatasets() {
		return [
			{ label: 'Alter Mann', data: [] as number[], borderColor: '#e74c3c', borderWidth: 1.5, pointRadius: 0, fill: false },
			{ label: 'Junge', data: [] as number[], borderColor: '#3498db', borderWidth: 1.5, pointRadius: 0, fill: false },
			{ label: 'Mann (GD)', data: [] as (number | null)[], borderColor: '#e74c3c', borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false },
			{ label: 'Junge (GD)', data: [] as (number | null)[], borderColor: '#3498db', borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false }
		];
	}

	function movingAvg(arr: number[], window: number): (number | null)[] {
		return arr.map((_, i) => {
			if (i < window - 1) return null;
			let sum = 0;
			for (let j = i - window + 1; j <= i; j++) sum += arr[j];
			return sum / window;
		});
	}

	const chartConfigs = [
		{ title: 'Äpfel-Bestand', getSeriesA: (d: ChartPoint) => d.manTotal, getSeriesB: (d: ChartPoint) => d.boyTotal },
		{ title: 'Fliegende Äpfel', getSeriesA: (d: ChartPoint) => d.manFlying, getSeriesB: (d: ChartPoint) => d.boyFlying },
		{ title: 'Durchschn. Entfernung', getSeriesA: (d: ChartPoint) => d.manDist, getSeriesB: (d: ChartPoint) => d.boyDist }
	];

	function openModal(index: number) {
		activeChartIndex = index;
		modalTitle = chartConfigs[index].title;
		modalOpen = true;

		// Create the modal chart after DOM updates
		requestAnimationFrame(() => {
			if (!modalCanvas) return;
			modalChart?.destroy();
			modalChart = new Chart(modalCanvas, {
				type: 'line',
				data: { labels: [], datasets: makeDatasets() },
				options: { ...bigChartOpts, plugins: { ...bigChartOpts.plugins, title: { display: true, text: chartConfigs[index].title, color: '#ddd', font: { size: 18 } } } },
				plugins: [stableScalePlugin]
			});
			syncModalChart();
		});
	}

	function closeModal() {
		modalOpen = false;
		activeChartIndex = -1;
		modalChart?.destroy();
		modalChart = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && modalOpen) {
			e.stopPropagation();
			closeModal();
		}
	}

	const CHART_WINDOW = 60;

	/** Compute MA on full series, then return only the last CHART_WINDOW points */
	function windowedMA(full: number[], w: number): (number | null)[] {
		return movingAvg(full, w).slice(-CHART_WINDOW);
	}

	function syncModalChart() {
		if (!modalChart || activeChartIndex < 0) return;
		const data = get(chartData);
		if (data.length === 0) return;
		const w = get(maWindow);

		const cfg = chartConfigs[activeChartIndex];
		const fullA = data.map(cfg.getSeriesA);
		const fullB = data.map(cfg.getSeriesB);
		const view = data.slice(-CHART_WINDOW);

		modalChart.data.labels = view.map(d => d.time);
		modalChart.data.datasets[0].data = fullA.slice(-CHART_WINDOW);
		modalChart.data.datasets[1].data = fullB.slice(-CHART_WINDOW);
		modalChart.data.datasets[2].data = windowedMA(fullA, w);
		modalChart.data.datasets[3].data = windowedMA(fullB, w);
		modalChart.update('none');
	}

	function updateAllCharts() {
		const data = get(chartData);
		if (!appleChart || data.length === 0) return;
		const w = get(maWindow);

		const view = data.slice(-CHART_WINDOW);
		const labels = view.map(d => d.time);

		const fullManTotal = data.map(d => d.manTotal);
		const fullBoyTotal = data.map(d => d.boyTotal);
		const fullManFlying = data.map(d => d.manFlying);
		const fullBoyFlying = data.map(d => d.boyFlying);
		const fullManDist = data.map(d => d.manDist);
		const fullBoyDist = data.map(d => d.boyDist);

		appleChart.data.labels = labels;
		appleChart.data.datasets[0].data = fullManTotal.slice(-CHART_WINDOW);
		appleChart.data.datasets[1].data = fullBoyTotal.slice(-CHART_WINDOW);
		appleChart.data.datasets[2].data = windowedMA(fullManTotal, w);
		appleChart.data.datasets[3].data = windowedMA(fullBoyTotal, w);
		appleChart.update('none');

		flyingChart.data.labels = labels;
		flyingChart.data.datasets[0].data = fullManFlying.slice(-CHART_WINDOW);
		flyingChart.data.datasets[1].data = fullBoyFlying.slice(-CHART_WINDOW);
		flyingChart.data.datasets[2].data = windowedMA(fullManFlying, w);
		flyingChart.data.datasets[3].data = windowedMA(fullBoyFlying, w);
		flyingChart.update('none');

		distChart.data.labels = labels;
		distChart.data.datasets[0].data = fullManDist.slice(-CHART_WINDOW);
		distChart.data.datasets[1].data = fullBoyDist.slice(-CHART_WINDOW);
		distChart.data.datasets[2].data = windowedMA(fullManDist, w);
		distChart.data.datasets[3].data = windowedMA(fullBoyDist, w);
		distChart.update('none');

		syncModalChart();
	}

	onMount(() => {
		appleChart = new Chart(appleCanvas, {
			type: 'line',
			data: { labels: [], datasets: makeDatasets() },
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Äpfel-Bestand', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		flyingChart = new Chart(flyingCanvas, {
			type: 'line',
			data: { labels: [], datasets: makeDatasets() },
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Fliegende Äpfel', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		distChart = new Chart(distCanvas, {
			type: 'line',
			data: { labels: [], datasets: makeDatasets() },
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Durchschn. Entfernung', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		window.addEventListener('keydown', handleKeydown);
	});

	const unsubData = chartData.subscribe(() => updateAllCharts());
	const unsubMa = maWindow.subscribe(() => updateAllCharts());

	onDestroy(() => {
		unsubData();
		unsubMa();
		appleChart?.destroy();
		flyingChart?.destroy();
		distChart?.destroy();
		modalChart?.destroy();
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="charts">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart-box" onclick={() => openModal(0)} onkeydown={(e) => e.key === 'Enter' && openModal(0)} role="button" tabindex="0" title="Zum Vergrößern klicken">
		<canvas bind:this={appleCanvas}></canvas>
	</div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart-box" onclick={() => openModal(1)} onkeydown={(e) => e.key === 'Enter' && openModal(1)} role="button" tabindex="0" title="Zum Vergrößern klicken">
		<canvas bind:this={flyingCanvas}></canvas>
	</div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart-box" class:hidden={$config.algorithm === Algorithm.SpontaneousCombustion} onclick={() => openModal(2)} onkeydown={(e) => e.key === 'Enter' && openModal(2)} role="button" tabindex="0" title="Zum Vergrößern klicken">
		<canvas bind:this={distCanvas}></canvas>
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

	.chart-box.hidden {
		display: none;
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
