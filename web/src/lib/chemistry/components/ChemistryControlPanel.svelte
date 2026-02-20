<script lang="ts">
	import { MIN_HERTZ, MAX_HERTZ, MIN_EFFECTIVE_WIDTH, MAX_EFFECTIVE_WIDTH } from '../engine/constants';
	import { running, config, chartData, maWindow, selectedReactionId, activeReaction, latestState } from '../stores/chemistryStore';
	import { reactions, isBuiltIn, addReaction, updateReaction, deleteReaction, getAllReactions } from '../stores/reactionListStore';
	import { createEventDispatcher } from 'svelte';
	import type { ReactionDefinition } from '../engine/types';
	import ReactionEditor from './ReactionEditor.svelte';

	const dispatch = createEventDispatcher();

	// Per-species injection counts, editable by the user
	let injectCounts = $state<Record<string, number>>({});

	// Editor modal state
	let editorOpen = $state(false);
	let editorReaction = $state<ReactionDefinition | null>(null);

	// Initialize counts when reaction changes
	activeReaction.subscribe(($reaction) => {
		if (!$reaction) return;
		const counts: Record<string, number> = {};
		for (const s of $reaction.species) {
			counts[s.symbol] = s.defaultCount;
		}
		injectCounts = counts;
	});

	// Group reactions by category — reactive via $reactions
	const categoryDefs = [
		{ key: 'complexation', label: 'Komplexbildung' },
		{ key: 'dissociation', label: 'Dissoziation' },
		{ key: 'equilibrium', label: 'Gleichgewicht' },
		{ key: 'acid-base', label: 'Säure-Base' },
		{ key: 'exchange', label: 'Austausch' },
		{ key: 'catalysis', label: 'Katalyse' }
	] as const;

	let categories = $derived(
		categoryDefs
			.map(c => ({ label: c.label, reactions: $reactions.filter(r => r.category === c.key) }))
			.filter(c => c.reactions.length > 0)
	);

	function selectReaction(e: Event) {
		const id = (e.target as HTMLSelectElement).value;
		$selectedReactionId = id;
		const reaction = $reactions.find(r => r.id === id);
		if (reaction) {
			$activeReaction = reaction;
			$config = { ...$config, forwardRateOverride: null, reverseRateOverride: null, stepRateOverrides: {} };
			$running = false;
			$chartData = [];
			dispatch('reset');
		}
	}

	function injectAll() {
		const reaction = $activeReaction;
		if (!reaction) return;
		for (const s of reaction.species) {
			const count = injectCounts[s.symbol] ?? 0;
			if (count > 0) {
				dispatch('inject', { symbol: s.symbol, count });
			}
		}
		$running = true;
	}

	function injectOne(symbol: string) {
		const count = injectCounts[symbol] ?? 0;
		if (count > 0) {
			dispatch('inject', { symbol, count });
			if (!$running) $running = true;
		}
	}

	function pause() {
		$running = false;
	}

	function reset() {
		$running = false;
		$chartData = [];
		const reaction = $reactions.find(r => r.id === $selectedReactionId);
		if (reaction) {
			$activeReaction = reaction;
		}
		dispatch('reset');
	}

	function setInjectCount(symbol: string, e: Event) {
		const val = Math.max(0, Math.min(500, Number((e.target as HTMLInputElement).value) || 0));
		injectCounts[symbol] = val;
	}

	function setForwardRate(e: Event) {
		$config = { ...$config, forwardRateOverride: Number((e.target as HTMLInputElement).value) };
	}

	function setReverseRate(e: Event) {
		$config = { ...$config, reverseRateOverride: Number((e.target as HTMLInputElement).value) };
	}

	function resetRates() {
		$config = { ...$config, forwardRateOverride: null, reverseRateOverride: null, stepRateOverrides: {} };
	}

	function setStepForwardRate(stepIndex: number, e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		const overrides = { ...$config.stepRateOverrides };
		overrides[stepIndex] = { ...overrides[stepIndex], forward: value };
		$config = { ...$config, stepRateOverrides: overrides };
	}

	function setStepReverseRate(stepIndex: number, e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		const overrides = { ...$config.stepRateOverrides };
		overrides[stepIndex] = { ...overrides[stepIndex], reverse: value };
		$config = { ...$config, stepRateOverrides: overrides };
	}

	function toggleThermostat() {
		if ($config.thermostatEnabled) {
			$config = { ...$config, thermostatEnabled: false };
		} else {
			const currentT = $latestState?.temperature ?? 0;
			if (currentT > 0) {
				$config = { ...$config, thermostatEnabled: true, thermostatTarget: currentT };
			}
		}
	}

	function handleHeat() {
		dispatch('heat', { factor: 1.5 });
		if ($config.thermostatEnabled) {
			$config = { ...$config, thermostatTarget: $config.thermostatTarget * 1.5 };
		}
	}

	function handleCool() {
		dispatch('heat', { factor: 0.67 });
		if ($config.thermostatEnabled) {
			$config = { ...$config, thermostatTarget: $config.thermostatTarget * 0.67 };
		}
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

	function setMaWindow(e: Event) {
		$maWindow = Number((e.target as HTMLInputElement).value);
	}

	// --- Editor actions ---

	function openEditCurrent() {
		if ($activeReaction) {
			editorReaction = $activeReaction;
			editorOpen = true;
		}
	}

	function openNew() {
		editorReaction = null;
		editorOpen = true;
	}

	function handleEditorSave(r: ReactionDefinition) {
		if (editorReaction) {
			// Editing existing
			updateReaction(editorReaction.id, r);
			if ($selectedReactionId === editorReaction.id) {
				$activeReaction = r;
			}
		} else {
			// Creating new
			addReaction(r);
			$selectedReactionId = r.id;
			$activeReaction = r;
			$config = { ...$config, forwardRateOverride: null, reverseRateOverride: null, stepRateOverrides: {} };
			$running = false;
			$chartData = [];
			dispatch('reset');
		}
		editorOpen = false;
	}

	function handleEditorCancel() {
		editorOpen = false;
	}

	let fileInput = $state<HTMLInputElement | null>(null);

	function exportReactions() {
		const all = getAllReactions();
		const json = JSON.stringify(all, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'reaktionen.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function triggerImport() {
		fileInput?.click();
	}

	function handleImportFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string);
				if (!Array.isArray(data)) {
					alert('Ungültiges Format: Array erwartet.');
					return;
				}
				const existingIds = new Set($reactions.map(r => r.id));
				let added = 0;
				let updated = 0;
				for (const r of data) {
					if (!r.id || !r.name || !r.species) continue;
					if (existingIds.has(r.id)) {
						updateReaction(r.id, r);
						updated++;
					} else {
						addReaction(r);
						existingIds.add(r.id);
						added++;
					}
				}
				const parts: string[] = [];
				if (added > 0) parts.push(`${added} hinzugefügt`);
				if (updated > 0) parts.push(`${updated} aktualisiert`);
				alert(parts.length > 0 ? `Reaktionen: ${parts.join(', ')}.` : 'Keine Reaktionen importiert.');
			} catch {
				alert('Fehler beim Lesen der Datei.');
			}
			// Reset file input so same file can be re-imported
			if (fileInput) fileInput.value = '';
		};
		reader.readAsText(file);
	}

	function handleDelete() {
		const id = $selectedReactionId;
		if (isBuiltIn(id)) return;
		if (!confirm('Reaktion löschen?')) return;
		deleteReaction(id);
		// Switch to first available reaction
		const first = $reactions[0];
		if (first) {
			$selectedReactionId = first.id;
			$activeReaction = first;
			$config = { ...$config, forwardRateOverride: null, reverseRateOverride: null, stepRateOverrides: {} };
			$running = false;
			$chartData = [];
			dispatch('reset');
		}
	}
</script>

{#if editorOpen}
	<ReactionEditor
		reaction={editorReaction}
		onSave={handleEditorSave}
		onCancel={handleEditorCancel}
	/>
{/if}

<div class="panel">
	<div class="buttons">
		<button class="primary" onclick={injectAll}>{'\u25B6'} Alle injizieren</button>
		{#if $running}
			<button onclick={pause}>{'\u23F8'} Pause</button>
		{/if}
		<button onclick={reset}>{'\u27F3'} Reset</button>
	</div>

	<details open>
		<summary>Reaktion</summary>
		<div class="controls">
			<div class="select-row">
				<select value={$selectedReactionId} onchange={selectReaction}>
					{#each categories as cat}
						<optgroup label={cat.label}>
							{#each cat.reactions as r}
								<option value={r.id}>{r.name}</option>
							{/each}
						</optgroup>
					{/each}
				</select>
				<button class="icon-btn" onclick={openEditCurrent} title="Bearbeiten">{'\u270E'}</button>
				{#if !isBuiltIn($selectedReactionId)}
					<button class="icon-btn delete" onclick={handleDelete} title="Löschen">{'\u{1F5D1}'}</button>
				{/if}
			</div>

			{#if $activeReaction}
				<div class="equation">{$activeReaction.equation}</div>
				{#if $activeReaction.steps}
					<ol class="step-list">
						{#each $activeReaction.steps as step, i}
							<li class="step-eq">{step.equation ?? `Schritt ${i + 1}`}</li>
						{/each}
					</ol>
				{/if}
				<p class="description">{$activeReaction.description}</p>
				<p class="description en">{$activeReaction.descriptionEn}</p>
			{/if}

			<button class="small-btn new-btn" onclick={openNew}>+ Neue Reaktion</button>
			<div class="io-row">
				<button class="small-btn" onclick={exportReactions}>Export</button>
				<button class="small-btn" onclick={triggerImport}>Import</button>
				<input type="file" accept=".json" bind:this={fileInput} onchange={handleImportFile} class="hidden-input" />
			</div>
		</div>
	</details>

	<details open>
		<summary>Spezies</summary>
		<div class="controls">
			{#if $activeReaction}
				{#each $activeReaction.species as species}
					<div class="species-row">
						<span class="swatch" class:pinned={species.pinned || species.solid} class:liquid={species.liquid} style="background: {species.color}"></span>
						<span class="species-symbol">{species.symbol}</span>
						<input class="count-input" type="number" min={0} max={500}
							value={injectCounts[species.symbol] ?? 0}
							onchange={(e) => setInjectCount(species.symbol, e)} />
						<button class="inject-btn" onclick={() => injectOne(species.symbol)}>{'\u25B6'}</button>
					</div>
				{/each}
			{/if}
		</div>
	</details>

	<details open>
		<summary>Steuerung</summary>
		<div class="controls">
			<div class="temp-row">
				<span class="temp-label">T = {($latestState?.temperature ?? 0).toFixed(2)}</span>
				<button
					class="temp-btn thermostat-btn"
					class:active={$config.thermostatEnabled}
					onclick={toggleThermostat}
					title={$config.thermostatEnabled ? `Thermostat: ${$config.thermostatTarget.toFixed(2)}` : 'Temperatur fixieren'}
				>{$config.thermostatEnabled ? '\uD83D\uDD12' : '\uD83D\uDD13'}</button>
				<button class="temp-btn" onclick={handleHeat}>Heizen</button>
				<button class="temp-btn" onclick={handleCool}>Kühlen</button>
			</div>
			{#if $config.thermostatEnabled}
				<div class="thermostat-info">Thermostat: {$config.thermostatTarget.toFixed(2)}</div>
			{/if}

			<label>
				Volumen: {$config.effectiveWidth}
				<input type="range" min={MIN_EFFECTIVE_WIDTH} max={MAX_EFFECTIVE_WIDTH} step={10} value={$config.effectiveWidth}
					oninput={(e) => $config = { ...$config, effectiveWidth: Number((e.target as HTMLInputElement).value) }} />
			</label>

			{#if $activeReaction?.steps}
				<div class="step-rates">
					{#each $activeReaction.steps as step, i}
						<div class="step-rate-group">
							<span class="step-label">{step.equation ?? `Schritt ${i + 1}`}</span>
							<label>
								Hin: {($config.stepRateOverrides[i]?.forward ?? step.forwardRate).toFixed(2)}
								<input type="range" min={0} max={2} step={0.01}
									value={$config.stepRateOverrides[i]?.forward ?? step.forwardRate}
									oninput={(e) => setStepForwardRate(i, e)} />
							</label>
							{#if step.reversible}
								<label>
									Rück: {($config.stepRateOverrides[i]?.reverse ?? step.reverseRate).toFixed(2)}
									<input type="range" min={0} max={2} step={0.01}
										value={$config.stepRateOverrides[i]?.reverse ?? step.reverseRate}
										oninput={(e) => setStepReverseRate(i, e)} />
								</label>
							{/if}
						</div>
					{/each}
				</div>
				<button class="small-btn" onclick={resetRates}>Raten zurücksetzen</button>
			{:else}
				<label>
					Hin-Rate: {($config.forwardRateOverride ?? $activeReaction?.forwardRate ?? 0).toFixed(2)}
					<input type="range" min={0} max={2} step={0.05}
						value={$config.forwardRateOverride ?? $activeReaction?.forwardRate ?? 0}
						oninput={setForwardRate} />
				</label>

				<label>
					Rück-Rate: {($config.reverseRateOverride ?? $activeReaction?.reverseRate ?? 0).toFixed(2)}
					<input type="range" min={0} max={2} step={0.05}
						value={$config.reverseRateOverride ?? $activeReaction?.reverseRate ?? 0}
						oninput={setReverseRate} />
				</label>

				<button class="small-btn" onclick={resetRates}>Raten zurücksetzen</button>
			{/if}

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

			<label>
				Hertz: {$config.hertz}
				<input type="range" min={MIN_HERTZ} max={MAX_HERTZ} step={10} value={$config.hertz} oninput={setHertz} />
			</label>

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
				<input type="range" min={0} max={255} value={$config.bgGrey}
					oninput={(e) => $config = { ...$config, bgGrey: Number((e.target as HTMLInputElement).value) }} />
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
		content: '\25B6 ';
		font-size: 0.7rem;
		display: inline-block;
		transition: transform 0.15s;
	}

	details[open] > summary::before {
		content: '\25BC ';
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 0 10px 10px;
	}

	.select-row {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.select-row select {
		flex: 1;
		min-width: 0;
	}

	select {
		width: 100%;
		padding: 4px 6px;
		background: #333;
		color: white;
		border: 1px solid #666;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.icon-btn {
		padding: 3px 6px;
		background: #333;
		color: #ccc;
		border: 1px solid #666;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.icon-btn:hover {
		background: #444;
		color: #fff;
	}

	.icon-btn.delete {
		color: #e74c3c;
	}

	.icon-btn.delete:hover {
		background: #5c1a1a;
		color: #ff6b6b;
	}

	.new-btn {
		align-self: stretch;
	}

	.equation {
		font-family: 'Times New Roman', serif;
		font-size: 1.05rem;
		color: #eee;
		text-align: center;
		padding: 6px 0;
		background: #2a2a2a;
		border-radius: 4px;
	}

	.description {
		font-size: 0.8rem;
		color: #999;
		margin: 0;
		line-height: 1.3;
	}

	.description.en {
		font-style: italic;
		color: #777;
	}

	.step-list {
		margin: 4px 0;
		padding-left: 22px;
		font-family: 'Times New Roman', serif;
		font-size: 0.85rem;
		color: #bbb;
		line-height: 1.5;
	}

	.step-eq {
		padding: 1px 0;
	}

	.species-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
	}

	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.swatch.pinned {
		border-radius: 2px;
	}

	.swatch.liquid {
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.45);
	}

	.species-symbol {
		flex: 1;
		font-family: 'Times New Roman', serif;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.count-input {
		width: 52px;
		padding: 2px 4px;
		font-size: 0.8rem;
		text-align: right;
		background: #333;
		color: white;
		border: 1px solid #666;
		border-radius: 4px;
		-moz-appearance: textfield;
	}

	.count-input::-webkit-inner-spin-button,
	.count-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.inject-btn {
		padding: 2px 8px;
		font-size: 0.75rem;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		background: #2a7d2a;
		color: white;
		flex-shrink: 0;
	}

	.inject-btn:hover {
		background: #36993a;
	}

	.small-btn {
		padding: 3px 8px;
		font-size: 0.8rem;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		background: #333;
		color: #ccc;
	}

	.small-btn:hover {
		background: #444;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 2px;
	}

	.checkbox-label {
		flex-direction: row;
		align-items: center;
		gap: 6px;
	}

	input[type="range"] {
		width: 100%;
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

	.temp-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.temp-label {
		font-family: monospace;
		font-size: 0.85rem;
		flex: 1;
	}

	.temp-btn {
		padding: 3px 10px;
		font-size: 0.8rem;
		cursor: pointer;
		border: 1px solid #666;
		border-radius: 4px;
		background: #333;
		color: #ccc;
	}

	.temp-btn:hover {
		background: #444;
	}

	.thermostat-btn.active {
		background: #8b5e00;
		color: #ffd700;
		border-color: #c89600;
	}

	.thermostat-info {
		font-size: 0.75rem;
		color: #c89600;
		font-family: monospace;
	}

	.step-rates {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.step-rate-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px 8px;
		background: #2a2a2a;
		border-radius: 4px;
	}

	.step-label {
		font-family: 'Times New Roman', serif;
		font-size: 0.8rem;
		color: #bbb;
		margin-bottom: 2px;
	}

	.io-row {
		display: flex;
		gap: 6px;
	}

	.io-row .small-btn {
		flex: 1;
	}

	.hidden-input {
		display: none;
	}

	.buttons button.primary {
		background: #2a7d2a;
	}

	.buttons button:hover {
		opacity: 0.85;
	}
</style>
