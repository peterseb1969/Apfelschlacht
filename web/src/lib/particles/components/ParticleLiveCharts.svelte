<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { Chart, registerables } from 'chart.js';
	import { chartData, maWindow, latestState, config } from '../stores/particleStore';
	import type { ParticleChartPoint } from '../engine/types';

	Chart.register(...registerables);

	let countCanvas: HTMLCanvasElement;
	let densityCanvas: HTMLCanvasElement;

	let countChart: Chart;
	let densityChart: Chart;

	// Modal state
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

	function makeCountDatasets(cx: string = '#3498db', cy: string = '#e74c3c', cz: string = '#f39c12') {
		return [
			{ label: 'X Partikel', data: [] as number[], borderColor: cx, borderWidth: 2, pointRadius: 0, fill: false, order: 5 },
			{ label: 'Y Partikel', data: [] as number[], borderColor: cy, borderWidth: 1.5, pointRadius: 0, fill: false, borderDash: [8, 3], order: 4 },
			{ label: 'Komplexe', data: [] as number[], borderColor: '#2ecc71', borderWidth: 1.5, pointRadius: 0, fill: false, order: 3 },
			{ label: 'Z Partikel', data: [] as number[], borderColor: cz, borderWidth: 1.5, pointRadius: 0, fill: false, borderDash: [4, 4], order: 2 },
			{ label: 'Stabilisiert', data: [] as number[], borderColor: '#9b59b6', borderWidth: 1.5, pointRadius: 0, fill: false, order: 1 },
			{ label: 'X (GD)', data: [] as (number | null)[], borderColor: cx, borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false, order: 5 },
			{ label: 'Y (GD)', data: [] as (number | null)[], borderColor: cy, borderWidth: 2.5, borderDash: [2, 2], pointRadius: 0, fill: false, order: 4 },
			{ label: 'C (GD)', data: [] as (number | null)[], borderColor: '#2ecc71', borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false, order: 3 },
			{ label: 'Z (GD)', data: [] as (number | null)[], borderColor: cz, borderWidth: 2.5, borderDash: [2, 2], pointRadius: 0, fill: false, order: 2 },
			{ label: 'S (GD)', data: [] as (number | null)[], borderColor: '#9b59b6', borderWidth: 2.5, borderDash: [5, 3], pointRadius: 0, fill: false, order: 1 }
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

	const CHART_WINDOW = 60;

	function windowedMA(full: number[], w: number): (number | null)[] {
		return movingAvg(full, w).slice(-CHART_WINDOW);
	}

	function openModal() {
		modalTitle = 'Partikel-Bestand';
		modalOpen = true;

		requestAnimationFrame(() => {
			if (!modalCanvas) return;
			modalChart?.destroy();
			modalChart = new Chart(modalCanvas, {
				type: 'line',
				data: { labels: [], datasets: makeCountDatasets() },
				options: { ...bigChartOpts, plugins: { ...bigChartOpts.plugins, title: { display: true, text: 'Partikel-Bestand', color: '#ddd', font: { size: 18 } } } },
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
		if (data.length === 0) return;
		const w = get(maWindow);

		const fullX = data.map(d => d.countX);
		const fullY = data.map(d => d.countY);
		const fullC = data.map(d => d.countC);
		const fullZ = data.map(d => d.countZ);
		const fullS = data.map(d => d.countS);
		const view = data.slice(-CHART_WINDOW);

		modalChart.data.labels = view.map(d => d.time);
		modalChart.data.datasets[0].data = fullX.slice(-CHART_WINDOW);
		modalChart.data.datasets[1].data = fullY.slice(-CHART_WINDOW);
		modalChart.data.datasets[2].data = fullC.slice(-CHART_WINDOW);
		modalChart.data.datasets[3].data = fullZ.slice(-CHART_WINDOW);
		modalChart.data.datasets[4].data = fullS.slice(-CHART_WINDOW);
		modalChart.data.datasets[5].data = windowedMA(fullX, w);
		modalChart.data.datasets[6].data = windowedMA(fullY, w);
		modalChart.data.datasets[7].data = windowedMA(fullC, w);
		modalChart.data.datasets[8].data = windowedMA(fullZ, w);
		modalChart.data.datasets[9].data = windowedMA(fullS, w);
		modalChart.update('none');
	}

	function syncChartColors() {
		if (!countChart) return;
		const cfg = get(config);
		const ds = countChart.data.datasets;
		ds[0].borderColor = cfg.colorX;
		ds[1].borderColor = cfg.colorY;
		ds[3].borderColor = cfg.colorZ;
		ds[5].borderColor = cfg.colorX;
		ds[6].borderColor = cfg.colorY;
		ds[8].borderColor = cfg.colorZ;
	}

	function updateAllCharts() {
		const data = get(chartData);
		if (!countChart || data.length === 0) return;
		const w = get(maWindow);
		syncChartColors();

		const view = data.slice(-CHART_WINDOW);
		const labels = view.map(d => d.time);

		const fullX = data.map(d => d.countX);
		const fullY = data.map(d => d.countY);
		const fullC = data.map(d => d.countC);
		const fullZ = data.map(d => d.countZ);
		const fullS = data.map(d => d.countS);

		countChart.data.labels = labels;
		countChart.data.datasets[0].data = fullX.slice(-CHART_WINDOW);
		countChart.data.datasets[1].data = fullY.slice(-CHART_WINDOW);
		countChart.data.datasets[2].data = fullC.slice(-CHART_WINDOW);
		countChart.data.datasets[3].data = fullZ.slice(-CHART_WINDOW);
		countChart.data.datasets[4].data = fullS.slice(-CHART_WINDOW);
		countChart.data.datasets[5].data = windowedMA(fullX, w);
		countChart.data.datasets[6].data = windowedMA(fullY, w);
		countChart.data.datasets[7].data = windowedMA(fullC, w);
		countChart.data.datasets[8].data = windowedMA(fullZ, w);
		countChart.data.datasets[9].data = windowedMA(fullS, w);
		countChart.update('none');

		// Update density chart
		updateDensityChart();

		syncModalChart();
	}

	function updateDensityChart() {
		if (!densityChart) return;
		const state = get(latestState);
		if (!state || !state.gravityOn) return;

		const sections = state.densitySections;
		const sectionLabels = sections.map((_, i) => `${i + 1}`);

		densityChart.data.labels = sectionLabels;
		densityChart.data.datasets[0].data = sections;
		densityChart.update('none');
	}

	onMount(() => {
		countChart = new Chart(countCanvas, {
			type: 'line',
			data: { labels: [], datasets: makeCountDatasets() },
			options: { ...smallChartOpts, plugins: { ...smallChartOpts.plugins, title: { display: true, text: 'Partikel-Bestand', color: '#ddd', font: { size: 12 } } } },
			plugins: [stableScalePlugin]
		});

		densityChart = new Chart(densityCanvas, {
			type: 'bar',
			data: {
				labels: [],
				datasets: [{
					label: 'Partikel pro Sektion',
					data: [],
					backgroundColor: 'rgba(52, 152, 219, 0.6)',
					borderColor: '#3498db',
					borderWidth: 1
				}]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				animation: { duration: 0 },
				scales: {
					x: {
						title: { display: true, text: 'Anzahl', color: '#ccc', font: { size: 10 } },
						ticks: { color: '#aaa', font: { size: 9 } },
						grid: { color: '#333' }
					},
					y: {
						title: { display: true, text: 'Sektion (oben → unten)', color: '#ccc', font: { size: 10 } },
						ticks: { color: '#aaa', font: { size: 9 } },
						grid: { color: '#333' }
					}
				},
				plugins: {
					legend: { display: false },
					title: { display: true, text: 'Dichte-Verteilung', color: '#ddd', font: { size: 12 } }
				}
			}
		});

		window.addEventListener('keydown', handleKeydown);
	});

	const unsubData = chartData.subscribe(() => updateAllCharts());
	const unsubMa = maWindow.subscribe(() => updateAllCharts());
	const unsubState = latestState.subscribe(() => updateDensityChart());
	const unsubConfig = config.subscribe(() => {
		syncChartColors();
		if (countChart) countChart.update('none');
	});

	onDestroy(() => {
		unsubData();
		unsubMa();
		unsubState();
		unsubConfig();
		countChart?.destroy();
		densityChart?.destroy();
		modalChart?.destroy();
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="charts">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart-box" onclick={() => openModal()} onkeydown={(e) => e.key === 'Enter' && openModal()} role="button" tabindex="0" title="Zum Vergrößern klicken">
		<canvas bind:this={countCanvas}></canvas>
	</div>
	<div class="chart-box" class:hidden={!$config.gravityOn}>
		<canvas bind:this={densityCanvas}></canvas>
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
