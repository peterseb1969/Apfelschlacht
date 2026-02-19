<script lang="ts">
	import { untrack } from 'svelte';
	import type { ReactionDefinition, ReactionCategory, SpeciesDefinition } from '../engine/types';

	interface Props {
		reaction: ReactionDefinition | null;
		onSave: (r: ReactionDefinition) => void;
		onCancel: () => void;
	}

	const { reaction, onSave, onCancel }: Props = $props();

	// Snapshot the prop once (modal is freshly mounted each time)
	const r = untrack(() => reaction);
	const isNew = !r;

	// Form state
	let name = $state(r?.name ?? '');
	let nameEn = $state(r?.nameEn ?? '');
	let category = $state<ReactionCategory>(r?.category ?? 'complexation');
	let equation = $state(r?.equation ?? '');
	let description = $state(r?.description ?? '');
	let descriptionEn = $state(r?.descriptionEn ?? '');
	let reversible = $state(r?.reversible ?? true);
	let forwardRate = $state(r?.forwardRate ?? 0.5);
	let reverseRate = $state(r?.reverseRate ?? 0.1);

	// Species table — deep-clone to avoid mutating the original
	const initSpecies: (SpeciesDefinition & { _key: number })[] = r
		? r.species.map((s, i) => ({ ...s, _key: i }))
		: [
			{ symbol: '', color: '#e74c3c', radius: 8, defaultCount: 30, role: 'reactant' as const, _key: 0 },
			{ symbol: '', color: '#3498db', radius: 8, defaultCount: 0, role: 'product' as const, _key: 1 }
		];
	let species = $state(initSpecies);
	let nextKey = $state(initSpecies.length);

	let error = $state('');

	function addSpecies() {
		species = [...species, { symbol: '', color: '#888888', radius: 8, defaultCount: 0, role: 'reactant', _key: nextKey }];
		nextKey++;
	}

	function removeSpecies(key: number) {
		species = species.filter(s => s._key !== key);
	}

	function validate(): string | null {
		if (!name.trim()) return 'Name darf nicht leer sein.';
		if (forwardRate <= 0) return 'Hin-Rate muss > 0 sein.';
		const reactants = species.filter(s => s.role === 'reactant');
		const products = species.filter(s => s.role === 'product');
		if (reactants.length === 0) return 'Mindestens 1 Edukt nötig.';
		if (products.length === 0) return 'Mindestens 1 Produkt nötig.';
		if (reactants.length > 2) return 'Maximal 2 Edukte erlaubt.';
		if (products.length > 2) return 'Maximal 2 Produkte erlaubt.';
		const symbols = species.map(s => s.symbol.trim());
		if (symbols.some(s => !s)) return 'Alle Spezies brauchen ein Symbol.';
		if (new Set(symbols).size !== symbols.length) return 'Spezies-Symbole müssen eindeutig sein.';
		return null;
	}

	function handleSave() {
		const msg = validate();
		if (msg) {
			error = msg;
			return;
		}
		error = '';

		const cleanSpecies: SpeciesDefinition[] = species.map(({ _key, ...s }) => ({
			...s,
			symbol: s.symbol.trim()
		}));

		const result: ReactionDefinition = {
			id: r?.id ?? `custom-${Date.now()}`,
			name: name.trim(),
			nameEn: nameEn.trim(),
			equation: equation.trim(),
			category,
			description: description.trim(),
			descriptionEn: descriptionEn.trim(),
			species: cleanSpecies,
			reactants: cleanSpecies.filter(s => s.role === 'reactant').map(s => s.symbol),
			products: cleanSpecies.filter(s => s.role === 'product').map(s => s.symbol),
			forwardRate,
			reverseRate: reversible ? reverseRate : 0,
			reversible
		};
		onSave(result);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onCancel();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" onclick={onCancel}>
	<div class="modal" onclick={(e) => e.stopPropagation()}>
		<h2>{isNew ? 'Neue Reaktion' : 'Reaktion bearbeiten'}</h2>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<div class="form-grid">
			<label>
				Name
				<input type="text" bind:value={name} placeholder="z.B. Eisen-Thiocyanat" />
			</label>
			<label>
				Name EN
				<input type="text" bind:value={nameEn} placeholder="e.g. Iron Thiocyanate" />
			</label>
			<label>
				Kategorie
				<select bind:value={category}>
					<option value="complexation">Komplexbildung</option>
					<option value="dissociation">Dissoziation</option>
					<option value="equilibrium">Gleichgewicht</option>
					<option value="acid-base">Säure-Base</option>
					<option value="exchange">Austausch</option>
				</select>
			</label>
			<label>
				Gleichung
				<input type="text" bind:value={equation} placeholder="A + B ⇌ C" />
			</label>
			<label class="full-width">
				Beschreibung DE
				<input type="text" bind:value={description} />
			</label>
			<label class="full-width">
				Beschreibung EN
				<input type="text" bind:value={descriptionEn} />
			</label>
			<label>
				<span class="checkbox-row">
					<input type="checkbox" bind:checked={reversible} />
					Reversibel
				</span>
			</label>
			<label>
				Hin-Rate
				<input type="number" bind:value={forwardRate} min={0.01} max={5} step={0.01} />
			</label>
			{#if reversible}
				<label>
					Rück-Rate
					<input type="number" bind:value={reverseRate} min={0} max={5} step={0.01} />
				</label>
			{/if}
		</div>

		<h3>Spezies</h3>
		<div class="species-table">
			<div class="species-header">
				<span>Symbol</span>
				<span>Farbe</span>
				<span>Radius</span>
				<span>Anzahl</span>
				<span>Rolle</span>
				<span></span>
			</div>
			{#each species as sp (sp._key)}
				<div class="species-row">
					<input type="text" bind:value={sp.symbol} placeholder="z.B. Fe³⁺" class="sp-symbol" />
					<input type="color" bind:value={sp.color} class="sp-color" />
					<input type="number" bind:value={sp.radius} min={2} max={20} class="sp-number" />
					<input type="number" bind:value={sp.defaultCount} min={0} max={500} class="sp-number" />
					<select bind:value={sp.role} class="sp-role">
						<option value="reactant">Edukt</option>
						<option value="product">Produkt</option>
					</select>
					<button class="delete-btn" onclick={() => removeSpecies(sp._key)} title="Entfernen">&times;</button>
				</div>
			{/each}
		</div>
		<button class="add-species-btn" onclick={addSpecies}>+ Spezies hinzufügen</button>

		<div class="modal-buttons">
			<button class="save-btn" onclick={handleSave}>Speichern</button>
			<button class="cancel-btn" onclick={onCancel}>Abbrechen</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: #1e1e1e;
		color: #eee;
		border: 1px solid #555;
		border-radius: 8px;
		padding: 24px;
		width: 600px;
		max-width: 95vw;
		max-height: 90vh;
		overflow-y: auto;
	}

	h2 {
		margin: 0 0 16px;
		font-size: 1.2rem;
	}

	h3 {
		margin: 18px 0 8px;
		font-size: 1rem;
	}

	.error {
		background: #5c1a1a;
		color: #f99;
		padding: 8px 12px;
		border-radius: 4px;
		margin-bottom: 12px;
		font-size: 0.85rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.form-grid label {
		display: flex;
		flex-direction: column;
		font-size: 0.85rem;
		gap: 3px;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.form-grid input[type="text"],
	.form-grid input[type="number"],
	.form-grid select {
		padding: 5px 8px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.checkbox-row {
		flex-direction: row;
		display: flex;
		align-items: center;
		gap: 6px;
		padding-top: 16px;
	}

	.species-table {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.species-header {
		display: grid;
		grid-template-columns: 2fr 40px 60px 60px 90px 30px;
		gap: 6px;
		font-size: 0.75rem;
		color: #888;
		padding: 0 2px;
	}

	.species-row {
		display: grid;
		grid-template-columns: 2fr 40px 60px 60px 90px 30px;
		gap: 6px;
		align-items: center;
	}

	.sp-symbol {
		padding: 4px 6px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.sp-color {
		width: 36px;
		height: 28px;
		padding: 1px;
		background: #2a2a2a;
		border: 1px solid #555;
		border-radius: 4px;
		cursor: pointer;
	}

	.sp-number {
		padding: 4px 4px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.8rem;
		text-align: right;
		-moz-appearance: textfield;
	}

	.sp-number::-webkit-inner-spin-button,
	.sp-number::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.sp-role {
		padding: 4px 4px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	.delete-btn {
		background: none;
		border: none;
		color: #e74c3c;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.delete-btn:hover {
		color: #ff6b6b;
	}

	.add-species-btn {
		margin-top: 6px;
		padding: 4px 12px;
		background: #2a2a2a;
		color: #aaa;
		border: 1px dashed #555;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
	}

	.add-species-btn:hover {
		background: #333;
		color: #eee;
	}

	.modal-buttons {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		justify-content: flex-end;
	}

	.save-btn {
		padding: 8px 20px;
		background: #2a7d2a;
		color: white;
		border: 1px solid #3a9d3a;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.save-btn:hover {
		background: #36993a;
	}

	.cancel-btn {
		padding: 8px 20px;
		background: #444;
		color: #ccc;
		border: 1px solid #666;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.cancel-btn:hover {
		background: #555;
	}
</style>
