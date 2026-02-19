<script lang="ts">
	import { latestState, config } from '../stores/particleStore';
</script>

{#if $latestState}
<div class="stats">
	<h3>Statistik</h3>
	<table>
		<tbody>
			<tr>
				<td>X Partikel</td>
				<td>{$latestState.countX}</td>
			</tr>
			<tr>
				<td>Y Partikel</td>
				<td>{$latestState.countY}</td>
			</tr>
			<tr>
				<td>Z Partikel</td>
				<td>{$latestState.countZ}</td>
			</tr>
			<tr>
				<td>Komplexe (C)</td>
				<td>{$latestState.countC}</td>
			</tr>
			<tr>
				<td>Stabilisiert (S)</td>
				<td>{$latestState.countS}</td>
			</tr>
			<tr>
				<td>Masse X</td>
				<td>{($config.radiusX / 10).toFixed(1)}</td>
			</tr>
			<tr>
				<td>Masse Y</td>
				<td>{($config.radiusY / 10).toFixed(1)}</td>
			</tr>
			<tr>
				<td>Masse Z</td>
				<td>{($config.radiusZ / 10).toFixed(1)}</td>
			</tr>
			<tr>
				<td>Zerfallskonstante</td>
				<td>{$config.decayConstant.toFixed(2)}</td>
			</tr>
			<tr>
				<td>Stabilitätsfaktor</td>
				<td>{$config.stabilityFactor.toFixed(1)}</td>
			</tr>
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
</style>
