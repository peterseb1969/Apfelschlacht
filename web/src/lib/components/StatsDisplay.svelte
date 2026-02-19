<script lang="ts">
	import { latestState } from '$lib/stores/gameStore';
	import { Algorithm } from '$lib/engine/constants';
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
</style>
