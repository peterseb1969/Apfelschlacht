<script lang="ts">
	import { chartData } from '../stores/particleStore';

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
		let csv = 'time,countX,countY,countC,countZ,countS\n';
		for (const d of data) {
			csv += `${d.time},${d.countX},${d.countY},${d.countC},${d.countZ},${d.countS}\n`;
		}
		download(csv, 'steady_state_data.csv', 'text/csv');
	}

	function exportJSON() {
		download(JSON.stringify($chartData, null, 2), 'steady_state_data.json', 'application/json');
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
