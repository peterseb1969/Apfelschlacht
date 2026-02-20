<script lang="ts">
	import { MIN_COUNT, MAX_COUNT, MIN_RADIUS, MAX_RADIUS, MIN_HERTZ, MAX_HERTZ } from '../engine/constants';
	import { running, config, chartData, maWindow, latestState } from '../stores/particleStore';
	import { createEventDispatcher } from 'svelte';
	import type { ParticleType } from '../engine/types';

	const dispatch = createEventDispatcher();

	function toggleRunning() {
		$running = !$running;
	}

	function reset() {
		$running = false;
		$chartData = [];
		dispatch('reset');
	}

	function changeCountX(delta: number) {
		$config = { ...$config, countX: Math.max(MIN_COUNT, Math.min(MAX_COUNT, $config.countX + delta)) };
		$chartData = [];
		dispatch('reset');
	}

	function changeCountY(delta: number) {
		$config = { ...$config, countY: Math.max(MIN_COUNT, Math.min(MAX_COUNT, $config.countY + delta)) };
		$chartData = [];
		dispatch('reset');
	}

	function setCountX(e: Event) {
		$config = { ...$config, countX: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function setCountY(e: Event) {
		$config = { ...$config, countY: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function changeCountZ(delta: number) {
		$config = { ...$config, countZ: Math.max(MIN_COUNT, Math.min(MAX_COUNT, $config.countZ + delta)) };
		$chartData = [];
		dispatch('reset');
	}

	function setCountZ(e: Event) {
		$config = { ...$config, countZ: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function setRadiusX(e: Event) {
		$config = { ...$config, radiusX: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function setRadiusY(e: Event) {
		$config = { ...$config, radiusY: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function setRadiusZ(e: Event) {
		$config = { ...$config, radiusZ: Number((e.target as HTMLInputElement).value) };
		$chartData = [];
		dispatch('reset');
	}

	function setDecay(e: Event) {
		$config = { ...$config, decayConstant: Number((e.target as HTMLInputElement).value) };
	}

	function setStabilityFactor(e: Event) {
		$config = { ...$config, stabilityFactor: Number((e.target as HTMLInputElement).value) };
	}

	function setHertz(e: Event) {
		$config = { ...$config, hertz: Number((e.target as HTMLInputElement).value) };
	}

	function setGravity(e: Event) {
		$config = { ...$config, gravity: Number((e.target as HTMLInputElement).value) };
	}

	function toggleGravity() {
		$config = { ...$config, gravityOn: !$config.gravityOn };
	}

	function setDrainSpecies(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		$config = { ...$config, drainSpecies: val === '' ? null : val as ParticleType };
	}

	function setMaWindow(e: Event) {
		$maWindow = Number((e.target as HTMLInputElement).value);
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
			<div class="count-row">
				<span>Anzahl X: {$config.countX}</span>
				<button onclick={() => changeCountX(-10)}>-10</button>
				<button onclick={() => changeCountX(10)}>+10</button>
			</div>
			<input type="range" min={MIN_COUNT} max={MAX_COUNT} value={$config.countX} oninput={setCountX} />

			<div class="count-row">
				<span>Anzahl Y: {$config.countY}</span>
				<button onclick={() => changeCountY(-10)}>-10</button>
				<button onclick={() => changeCountY(10)}>+10</button>
			</div>
			<input type="range" min={MIN_COUNT} max={MAX_COUNT} value={$config.countY} oninput={setCountY} />

			<div class="count-row">
				<span>Anzahl Z: {$config.countZ}</span>
				<button onclick={() => changeCountZ(-10)}>-10</button>
				<button onclick={() => changeCountZ(10)}>+10</button>
			</div>
			<input type="range" min={MIN_COUNT} max={MAX_COUNT} value={$config.countZ} oninput={setCountZ} />

			<label>
				Radius X: {$config.radiusX}
				<input type="range" min={MIN_RADIUS} max={MAX_RADIUS} value={$config.radiusX} oninput={setRadiusX} />
			</label>

			<label>
				Radius Y: {$config.radiusY}
				<input type="range" min={MIN_RADIUS} max={MAX_RADIUS} value={$config.radiusY} oninput={setRadiusY} />
			</label>

			<label>
				Radius Z: {$config.radiusZ}
				<input type="range" min={MIN_RADIUS} max={MAX_RADIUS} value={$config.radiusZ} oninput={setRadiusZ} />
			</label>

			<label>
				Zerfallskonstante λ: {$config.decayConstant.toFixed(2)}
				<input type="range" min={0} max={2} step={0.05} value={$config.decayConstant} oninput={setDecay} />
			</label>

			<label>
				Stabilitätsfaktor: {$config.stabilityFactor.toFixed(1)}
				<input type="range" min={1} max={20} step={0.5} value={$config.stabilityFactor} oninput={setStabilityFactor} />
			</label>

			<label>
				Hertz: {$config.hertz}
				<input type="range" min={MIN_HERTZ} max={MAX_HERTZ} step={10} value={$config.hertz} oninput={setHertz} />
			</label>

			<label>
				Temperatur: {$config.temperature.toFixed(1)}
				<input type="range" min={0.1} max={5} step={0.1} value={$config.temperature} oninput={(e) => $config = { ...$config, temperature: Number((e.target as HTMLInputElement).value) }} />
			</label>

			<label class="checkbox-label">
				<input type="checkbox" checked={$config.gravityOn} onchange={toggleGravity} />
				Schwerkraft
			</label>

			{#if $config.gravityOn}
				<label>
					Schwerkraft-Stärke: {$config.gravity.toFixed(1)}
					<input type="range" min={0} max={2} step={0.1} value={$config.gravity} oninput={setGravity} />
				</label>
			{/if}

			<div class="drain-row">
				<span>Drain:</span>
				<select class="drain-select" value={$config.drainSpecies ?? ''} onchange={setDrainSpecies}>
					<option value="">Aus</option>
					<option value="X">X</option>
					<option value="Y">Y</option>
					<option value="Z">Z</option>
					<option value="C">C</option>
					<option value="S">S</option>
				</select>
				{#if $config.drainSpecies && $latestState}
					<span class="drain-count">{$latestState.drainedCount} entfernt</span>
				{/if}
			</div>

			<label>
				GD-Fenster: {$maWindow}
				<input type="range" min={2} max={50} value={$maWindow} oninput={setMaWindow} />
			</label>
		</div>
	</details>

	<details>
		<summary>Darstellung</summary>
		<div class="controls">
			<label>
				Hintergrund: {$config.bgGrey}
				<input type="range" min={0} max={255} value={$config.bgGrey} oninput={(e) => $config = { ...$config, bgGrey: Number((e.target as HTMLInputElement).value) }} />
			</label>

			<label class="color-label">
				Farbe X
				<input type="color" value={$config.colorX} oninput={(e) => $config = { ...$config, colorX: (e.target as HTMLInputElement).value }} />
			</label>

			<label class="color-label">
				Farbe Y
				<input type="color" value={$config.colorY} oninput={(e) => $config = { ...$config, colorY: (e.target as HTMLInputElement).value }} />
			</label>

			<label class="color-label">
				Farbe Z
				<input type="color" value={$config.colorZ} oninput={(e) => $config = { ...$config, colorZ: (e.target as HTMLInputElement).value }} />
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

	.color-label {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	.color-label input[type="color"] {
		width: 36px;
		height: 24px;
		padding: 0;
		border: 1px solid #666;
		border-radius: 3px;
		background: none;
		cursor: pointer;
	}

	.checkbox-label {
		flex-direction: row;
		align-items: center;
		gap: 6px;
	}

	input[type="range"] {
		width: 100%;
	}

	.count-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
	}

	.count-row button {
		padding: 2px 10px;
		font-size: 0.8rem;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		background: #333;
		color: white;
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

	.drain-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
	}

	.drain-select {
		background: #333;
		color: white;
		border: 1px solid #666;
		border-radius: 4px;
		padding: 2px 6px;
		font-size: 0.85rem;
	}

	.drain-count {
		color: rgba(0, 220, 150, 0.85);
		font-size: 0.8rem;
	}
</style>
