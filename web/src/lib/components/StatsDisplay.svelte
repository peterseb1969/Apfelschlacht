<script lang="ts">
	import { latestState, config } from '$lib/stores/gameStore';
	import { Algorithm } from '$lib/engine/constants';

	function getActualRatio(man: { appleCount: number; flyApples: number }, boy: { appleCount: number; flyApples: number }): number {
		const manAll = man.appleCount + man.flyApples;
		const boyAll = boy.appleCount + boy.flyApples;
		return boyAll > 0 ? manAll / boyAll : 0;
	}

	function getTheoreticalRatio(cfg: typeof $config, algo: Algorithm): number {
		if (algo === Algorithm.SpontaneousCombustion) {
			return cfg.halfLifeLeft > 0 ? cfg.halfLifeRight / cfg.halfLifeLeft : 0;
		}
		return cfg.speedBoy > 0 ? cfg.speedBoy / cfg.speedMan : 0;
	}
</script>

{#if $latestState}
<div class="stats">
	<h3>Statistik</h3>
	<table>
		<thead>
			<tr><th></th><th>Alter Mann</th><th>Junge</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>Äpfel</td>
				<td>{$latestState.man.appleCount}</td>
				<td>{$latestState.boy.appleCount}</td>
			</tr>
			<tr>
				<td>Fliegend</td>
				<td>{$latestState.man.flyApples}</td>
				<td>{$latestState.boy.flyApples}</td>
			</tr>
			<tr>
				<td>Durchschn. Flug</td>
				<td>{$latestState.man.avgFlyApples.toFixed(1)}</td>
				<td>{$latestState.boy.avgFlyApples.toFixed(1)}</td>
			</tr>
			{#if $latestState.algorithm !== Algorithm.SpontaneousCombustion}
			<tr>
				<td>Entfernung</td>
				<td>{$latestState.man.avgDist.toFixed(1)}</td>
				<td>{$latestState.boy.avgDist.toFixed(1)}</td>
			</tr>
			{/if}
		</tbody>
	</table>
	<div class="ratio">
		<div class="ratio-row">
			<span class="ratio-label">Verhältnis Mann/Junge</span>
			<span class="ratio-value">{getActualRatio($latestState.man, $latestState.boy).toFixed(2)}</span>
		</div>
		<div class="ratio-row theory">
			<span class="ratio-label">Theorie</span>
			<span class="ratio-value">{getTheoreticalRatio($config, $latestState.algorithm).toFixed(2)}</span>
		</div>
	</div>
</div>
{/if}

<style>
	.stats {
		font-size: 0.8rem;
	}

	h3 {
		margin: 0 0 4px 0;
		font-size: 0.95rem;
		border-bottom: 1px solid #555;
		padding-bottom: 4px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		text-align: right;
		padding: 2px 6px;
		font-size: 0.8rem;
	}

	th:first-child, td:first-child {
		text-align: left;
	}

	thead th {
		border-bottom: 1px solid #555;
		font-weight: 600;
	}

	.ratio {
		margin-top: 8px;
		padding-top: 6px;
		border-top: 1px solid #555;
	}

	.ratio-row {
		display: flex;
		justify-content: space-between;
		padding: 2px 6px;
		font-size: 0.8rem;
	}

	.ratio-row.theory {
		color: #999;
		font-style: italic;
	}
</style>
