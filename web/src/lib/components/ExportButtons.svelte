<script lang="ts">
	import { chartData, throwLog } from '$lib/stores/gameStore';

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
		let csv = 'time,manTotal,boyTotal,manFlying,boyFlying,manDist,boyDist\n';
		for (const d of data) {
			csv += `${d.time},${d.manTotal},${d.boyTotal},${d.manFlying},${d.boyFlying},${d.manDist.toFixed(2)},${d.boyDist.toFixed(2)}\n`;
		}
		download(csv, 'apfelschlacht_data.csv', 'text/csv');
	}

	function exportJSON() {
		download(JSON.stringify($chartData, null, 2), 'apfelschlacht_data.json', 'application/json');
	}

	function exportThrowLog() {
		const events = $throwLog;
		let csv = 'time,player,x,y\n';
		for (const e of events) {
			csv += `${e.time.toFixed(3)},${e.player},${Math.round(e.x)},${Math.round(e.y)}\n`;
		}
		download(csv, 'apfelschlacht_paths.csv', 'text/csv');
	}
</script>

<div class="export">
	<button onclick={exportCSV}>CSV</button>
	<button onclick={exportJSON}>JSON</button>
	<button onclick={exportThrowLog}>Pfade CSV</button>
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
