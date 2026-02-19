<script lang="ts">
	import { Algorithm, ALGO_LABELS, MIN_SPEED, MAX_SPEED, MIN_HERTZ, MAX_HERTZ } from '$lib/engine/constants';
	import { running, config, chartData, maWindow } from '$lib/stores/gameStore';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function setAlgorithm(e: Event) {
		const value = (e.target as HTMLSelectElement).value as Algorithm;
		$config = { ...$config, algorithm: value };
		$chartData = [];
		dispatch('algorithm-change', value);
	}

	function setSpeedMan(e: Event) {
		$config = { ...$config, speedMan: Number((e.target as HTMLInputElement).value) };
	}

	function setSpeedBoy(e: Event) {
		$config = { ...$config, speedBoy: Number((e.target as HTMLInputElement).value) };
	}

	function setSpeedApple(e: Event) {
		$config = { ...$config, speedApple: Number((e.target as HTMLInputElement).value) };
	}

	function setHertz(e: Event) {
		$config = { ...$config, hertz: Number((e.target as HTMLInputElement).value) };
	}

	function setAppleSize(e: Event) {
		$config = { ...$config, appleSize: Number((e.target as HTMLInputElement).value) };
	}

	function setPlayerSize(e: Event) {
		$config = { ...$config, playerSize: Number((e.target as HTMLInputElement).value) };
	}

	function setMaWindow(e: Event) {
		$maWindow = Number((e.target as HTMLInputElement).value);
	}

	function setHalfLifeLeft(e: Event) {
		$config = { ...$config, halfLifeLeft: Number((e.target as HTMLInputElement).value) };
	}

	function setHalfLifeRight(e: Event) {
		$config = { ...$config, halfLifeRight: Number((e.target as HTMLInputElement).value) };
	}

	function changeAppleCount(delta: number) {
		$config = { ...$config, appleCount: Math.max(50, $config.appleCount + delta) };
		$chartData = [];
		dispatch('apple-count-change');
	}

	function toggleRunning() {
		$running = !$running;
	}

	function reset() {
		$running = false;
		$chartData = [];
		dispatch('reset');
	}
</script>

<div class="panel">
	<div class="buttons">
		<button class="primary" onclick={toggleRunning}>
			{$running ? '⏸ Pause' : '▶ Start'}
		</button>
		<button onclick={reset}>⟳ Reset</button>
	</div>

	<details open>
		<summary>Steuerung</summary>
		<div class="controls">
			<label>
				Modus
				<select value={$config.algorithm} onchange={setAlgorithm}>
					{#each Object.values(Algorithm) as algo}
						<option value={algo}>{ALGO_LABELS[algo]}</option>
					{/each}
				</select>
			</label>

			{#if $config.algorithm !== Algorithm.SpontaneousCombustion}
				<label>
					Alter Mann: {$config.speedMan}
					<input type="range" min={MIN_SPEED} max={MAX_SPEED} value={$config.speedMan} oninput={setSpeedMan} />
				</label>

				<label>
					Junge: {$config.speedBoy}
					<input type="range" min={MIN_SPEED} max={MAX_SPEED} value={$config.speedBoy} oninput={setSpeedBoy} />
				</label>
			{:else}
				<label>
					Halbwertszeit links: {$config.halfLifeLeft}s
					<input type="range" min={1} max={100} value={$config.halfLifeLeft} oninput={setHalfLifeLeft} />
				</label>

				<label>
					Halbwertszeit rechts: {$config.halfLifeRight}s
					<input type="range" min={1} max={100} value={$config.halfLifeRight} oninput={setHalfLifeRight} />
				</label>
			{/if}

			<label>
				Apfel-Geschw.: {$config.speedApple}
				<input type="range" min={1} max={MAX_SPEED} value={$config.speedApple} oninput={setSpeedApple} />
			</label>

			<div class="apple-count">
				<span>Äpfel: {$config.appleCount}</span>
				<button onclick={() => changeAppleCount(-50)}>-50</button>
				<button onclick={() => changeAppleCount(50)}>+50</button>
			</div>

			<label>
				Hertz: {$config.hertz}
				<input type="range" min={MIN_HERTZ} max={MAX_HERTZ} step={10} value={$config.hertz} oninput={setHertz} />
			</label>

			<label>
				Apfel-Größe: {$config.appleSize}px
				<input type="range" min={4} max={40} value={$config.appleSize} oninput={setAppleSize} />
			</label>

			{#if $config.algorithm !== Algorithm.SpontaneousCombustion}
				<label>
					Spieler-Größe: {$config.playerSize}px
					<input type="range" min={16} max={128} value={$config.playerSize} oninput={setPlayerSize} />
				</label>
			{/if}

			<label>
				GD-Fenster: {$maWindow}
				<input type="range" min={2} max={50} value={$maWindow} oninput={setMaWindow} />
			</label>
		</div>
	</details>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	details {
		border: 1px solid #444;
		border-radius: 4px;
		padding: 0;
	}

	summary {
		cursor: pointer;
		padding: 6px 10px;
		font-size: 0.95rem;
		font-weight: 600;
		user-select: none;
		list-style: none;
	}

	summary::before {
		content: '▶ ';
		font-size: 0.7rem;
		display: inline-block;
		transition: transform 0.15s;
	}

	details[open] > summary::before {
		content: '▼ ';
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 10px 10px;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 2px;
	}

	select, input[type="range"] {
		width: 100%;
	}

	.apple-count {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
	}

	.apple-count button {
		padding: 2px 10px;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.buttons {
		display: flex;
		gap: 8px;
	}

	.buttons button {
		flex: 1;
		padding: 6px 12px;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		font-size: 0.9rem;
		background: #333;
		color: white;
	}

	.buttons button.primary {
		background: #2a7d2a;
	}

	.buttons button:hover {
		opacity: 0.85;
	}
</style>
