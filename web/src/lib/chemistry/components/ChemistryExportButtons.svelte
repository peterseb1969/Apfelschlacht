<script lang="ts">
	import { chartData, activeReaction } from '../stores/chemistryStore';

	function download(content: string, filename: string, type: string) {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function exportCSV() {
		const data = $chartData;
		const reaction = $activeReaction;
		if (!reaction || data.length === 0) return;

		const speciesSymbols = reaction.species.map(s => s.symbol);
		const headers = ['time', ...speciesSymbols, 'pressure', 'temperature', 'volume'];
		let csv = headers.join(',') + '\n';

		for (const d of data) {
			const row = [
				d.time,
				...speciesSymbols.map(sym => d.counts[sym] ?? 0),
				d.pressure.toFixed(2),
				d.temperature.toFixed(2),
				d.volume.toFixed(2)
			];
			csv += row.join(',') + '\n';
		}
		download(csv, 'chemistry_data.csv', 'text/csv');
	}

	function exportJSON() {
		download(JSON.stringify($chartData, null, 2), 'chemistry_data.json', 'application/json');
	}
</script>

<div class="export">
	<button onclick={exportCSV}>CSV</button>
	<button onclick={exportJSON}>JSON</button>
</div>

<style>
	.export {
		display: flex;
		gap: 8px;
	}

	button {
		flex: 1;
		padding: 5px 10px;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		font-size: 0.8rem;
		background: #444;
		color: white;
	}

	button:hover {
		background: #555;
	}
</style>
