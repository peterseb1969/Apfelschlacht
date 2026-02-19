<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Simulationen</title>
</svelte:head>

<div class="landing">
	<h1>Simulationen</h1>
	<div class="cards">
		<a class="card" href="{base}/apfelschlacht">
			<div class="card-icon">🍎</div>
			<h2>Apfelschlacht</h2>
			<p>Zwei Spieler werfen Äpfel — wer sammelt mehr? Verschiedene Strategien im Vergleich.</p>
		</a>
		<a class="card" href="{base}/steady-state">
			<div class="card-icon">⚛</div>
			<h2>Steady State</h2>
			<p>Partikel-Simulation: Assoziation, Dissoziation und Gleichgewicht mit optionaler Schwerkraft.</p>
		</a>
	</div>
</div>

<style>
	.landing {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
	}

	h1 {
		font-size: 2rem;
		font-weight: 300;
		margin: 0 0 40px 0;
		color: #ccc;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
		max-width: 700px;
		width: 100%;
	}

	@media (max-width: 600px) {
		.cards {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: #252525;
		border: 1px solid #3a3a3a;
		border-radius: 12px;
		padding: 32px 24px;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.2s, transform 0.2s;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.card:hover {
		border-color: #666;
		transform: translateY(-2px);
	}

	.card-icon {
		font-size: 2.5rem;
		margin-bottom: 12px;
	}

	.card h2 {
		margin: 0 0 8px 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.card p {
		margin: 0;
		font-size: 0.9rem;
		color: #999;
		line-height: 1.4;
	}
</style>
