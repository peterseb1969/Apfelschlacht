<script lang="ts">
	import { latestState, activeReaction } from '../stores/chemistryStore';
</script>

{#if $latestState && $activeReaction}
<div class="stats">
	<h3>Statistik</h3>

	<div class="equation">{$activeReaction.equation}</div>

	<table>
		<tbody>
			{#each $activeReaction.species as species}
				<tr>
					<td>
						<span class="swatch" style="background: {species.color}"></span>
						{species.symbol}
					</td>
					<td>{$latestState.speciesCounts[species.symbol] ?? 0}</td>
				</tr>
			{/each}
			<tr class="separator"><td colspan="2"></td></tr>
			<tr>
				<td>Druck (P)</td>
				<td>{$latestState.pressure.toFixed(1)}</td>
			</tr>
			<tr>
				<td>Temperatur (T)</td>
				<td>{$latestState.temperature.toFixed(1)}</td>
			</tr>
			<tr>
				<td>Volumen (V)</td>
				<td>{($latestState.effectiveWidth * $latestState.height / 1000).toFixed(1)}</td>
			</tr>
			<tr class="separator"><td colspan="2"></td></tr>
			<tr>
				<td>Sim-Zeit</td>
				<td>{$latestState.simTime.toFixed(0)}s</td>
			</tr>
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

	.equation {
		font-family: 'Times New Roman', serif;
		font-size: 0.95rem;
		color: #ddd;
		text-align: center;
		padding: 4px 0 6px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	td {
		padding: 2px 6px;
		font-size: 0.8rem;
	}

	td:first-child {
		text-align: left;
	}

	td:last-child {
		text-align: right;
	}

	.swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		vertical-align: middle;
		margin-right: 4px;
	}

	.separator td {
		padding: 2px 0;
		border-bottom: 1px solid #444;
	}
</style>
