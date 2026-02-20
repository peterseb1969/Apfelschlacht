<script lang="ts">
	import { untrack } from 'svelte';
	import type { ReactionDefinition, ReactionCategory, ReactionStep, SpeciesDefinition } from '../engine/types';

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
	let multiStep = $state(!!(r?.steps && r.steps.length > 0));

	// Species table — deep-clone to avoid mutating the original
	type Phase = 'gas' | 'liquid' | 'solid' | 'catalyst';
	function phaseFromDef(s: SpeciesDefinition): Phase {
		if (s.pinned) return 'catalyst';
		if (s.solid) return 'solid';
		if (s.liquid) return 'liquid';
		return 'gas';
	}
	const initSpecies: (SpeciesDefinition & { _key: number; _phase: Phase })[] = r
		? r.species.map((s, i) => ({ ...s, pinned: s.pinned ?? false, solid: s.solid ?? false, liquid: s.liquid ?? false, _phase: phaseFromDef(s), _key: i }))
		: [
			{ symbol: '', color: '#e74c3c', radius: 8, defaultCount: 30, role: 'reactant' as const, pinned: false, solid: false, liquid: false, _phase: 'gas' as Phase, _key: 0 },
			{ symbol: '', color: '#3498db', radius: 8, defaultCount: 0, role: 'product' as const, pinned: false, solid: false, liquid: false, _phase: 'gas' as Phase, _key: 1 }
		];
	let species = $state(initSpecies);
	let nextKey = $state(initSpecies.length);

	// Steps state for multi-step mode
	interface StepRow {
		_key: number;
		reactant1: string;
		reactant2: string;
		product1: string;
		product2: string;
		equation: string;
		forwardRate: number;
		reverseRate: number;
		reversible: boolean;
	}

	function initStepFromDef(step: ReactionStep, key: number): StepRow {
		return {
			_key: key,
			reactant1: step.reactants[0] ?? '',
			reactant2: step.reactants[1] ?? '',
			product1: step.products[0] ?? '',
			product2: step.products[1] ?? '',
			equation: step.equation ?? '',
			forwardRate: step.forwardRate,
			reverseRate: step.reverseRate,
			reversible: step.reversible
		};
	}

	const initSteps: StepRow[] = r?.steps
		? r.steps.map((s, i) => initStepFromDef(s, i))
		: [];
	let steps = $state(initSteps);
	let nextStepKey = $state(initSteps.length);

	let error = $state('');

	// Available symbols for step dropdowns
	let availableSymbols = $derived(species.map(s => s.symbol.trim()).filter(s => s));

	function addSpecies() {
		species = [...species, { symbol: '', color: '#888888', radius: 8, defaultCount: 0, role: 'reactant', pinned: false, solid: false, liquid: false, _phase: 'gas' as Phase, _key: nextKey }];
		nextKey++;
	}

	function removeSpecies(key: number) {
		species = species.filter(s => s._key !== key);
	}

	function addStep() {
		steps = [...steps, {
			_key: nextStepKey,
			reactant1: '', reactant2: '',
			product1: '', product2: '',
			equation: '',
			forwardRate: 0.5, reverseRate: 0.1,
			reversible: true
		}];
		nextStepKey++;
	}

	function removeStep(key: number) {
		steps = steps.filter(s => s._key !== key);
	}

	function generateStepEquation(step: StepRow): string {
		const lhs = [step.reactant1, step.reactant2].filter(Boolean).join(' + ');
		const rhs = [step.product1, step.product2].filter(Boolean).join(' + ');
		const arrow = step.reversible ? ' \u21CC ' : ' \u2192 ';
		return lhs + arrow + rhs;
	}

	function validate(): string | null {
		if (!name.trim()) return 'Name darf nicht leer sein.';
		const symbols = species.map(s => s.symbol.trim());
		if (symbols.some(s => !s)) return 'Alle Spezies brauchen ein Symbol.';
		if (new Set(symbols).size !== symbols.length) return 'Spezies-Symbole müssen eindeutig sein.';

		if (multiStep) {
			if (steps.length === 0) return 'Mindestens 1 Schritt nötig.';
			for (let i = 0; i < steps.length; i++) {
				const st = steps[i];
				if (!st.reactant1) return `Schritt ${i + 1}: Mindestens 1 Edukt nötig.`;
				if (!st.product1) return `Schritt ${i + 1}: Mindestens 1 Produkt nötig.`;
				const stepSymbols = [st.reactant1, st.reactant2, st.product1, st.product2].filter(Boolean);
				for (const sym of stepSymbols) {
					if (!symbols.includes(sym)) return `Schritt ${i + 1}: "${sym}" ist nicht in der Spezies-Liste.`;
				}
				if (st.forwardRate <= 0) return `Schritt ${i + 1}: Hin-Rate muss > 0 sein.`;
			}
		} else {
			if (forwardRate <= 0) return 'Hin-Rate muss > 0 sein.';
			const reactants = species.filter(s => s.role === 'reactant');
			const products = species.filter(s => s.role === 'product');
			if (reactants.length === 0) return 'Mindestens 1 Edukt nötig.';
			if (products.length === 0) return 'Mindestens 1 Produkt nötig.';
			if (reactants.length > 2) return 'Maximal 2 Edukte erlaubt.';
			if (products.length > 2) return 'Maximal 2 Produkte erlaubt.';
		}
		return null;
	}

	function handleSave() {
		const msg = validate();
		if (msg) {
			error = msg;
			return;
		}
		error = '';

		const cleanSpecies: SpeciesDefinition[] = species.map(({ _key, _phase, ...s }) => {
			const base = { ...s, symbol: s.symbol.trim() };
			base.pinned = _phase === 'catalyst';
			base.solid = _phase === 'solid';
			base.liquid = _phase === 'liquid';
			return base;
		});

		// Build reactants/products arrays, preserving stoichiometry from original
		let finalReactants: string[];
		let finalProducts: string[];
		if (multiStep) {
			finalReactants = [];
			finalProducts = [];
		} else if (r) {
			// Editing existing: preserve original arrays (keeps duplicates like ['NO₂','NO₂']).
			// Map renamed symbols by species position.
			const oldSymbols = r.species.map(s => s.symbol);
			const newSymbols = cleanSpecies.map(s => s.symbol);
			const rename = new Map<string, string>();
			for (let i = 0; i < Math.min(oldSymbols.length, newSymbols.length); i++) {
				if (oldSymbols[i] !== newSymbols[i]) {
					rename.set(oldSymbols[i], newSymbols[i]);
				}
			}
			finalReactants = r.reactants.map(s => rename.get(s) ?? s);
			finalProducts = r.products.map(s => rename.get(s) ?? s);
		} else {
			// New reaction: build from roles
			finalReactants = cleanSpecies.filter(s => s.role === 'reactant').map(s => s.symbol);
			finalProducts = cleanSpecies.filter(s => s.role === 'product').map(s => s.symbol);
		}

		const result: ReactionDefinition = {
			id: r?.id ?? `custom-${Date.now()}`,
			name: name.trim(),
			nameEn: nameEn.trim(),
			equation: equation.trim(),
			category,
			description: description.trim(),
			descriptionEn: descriptionEn.trim(),
			species: cleanSpecies,
			reactants: finalReactants,
			products: finalProducts,
			forwardRate: multiStep ? 0 : forwardRate,
			reverseRate: multiStep ? 0 : (reversible ? reverseRate : 0),
			reversible: multiStep ? false : reversible
		};

		if (multiStep) {
			result.steps = steps.map(st => {
				const reactants = [st.reactant1, st.reactant2].filter(Boolean);
				const products = [st.product1, st.product2].filter(Boolean);
				return {
					reactants,
					products,
					forwardRate: st.forwardRate,
					reverseRate: st.reversible ? st.reverseRate : 0,
					reversible: st.reversible,
					equation: st.equation.trim() || generateStepEquation(st)
				} satisfies ReactionStep;
			});
		}

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
					<option value="catalysis">Katalyse</option>
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
					<input type="checkbox" bind:checked={multiStep} />
					Mehrstufig
				</span>
			</label>
			{#if !multiStep}
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
				<span>Phase</span>
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
					<select bind:value={sp._phase} class="sp-phase">
						<option value="gas">Gas</option>
						<option value="liquid">Flüssig</option>
						<option value="solid">Feststoff</option>
						<option value="catalyst">Katalysator</option>
					</select>
					<button class="delete-btn" onclick={() => removeSpecies(sp._key)} title="Entfernen">&times;</button>
				</div>
			{/each}
		</div>
		<button class="add-species-btn" onclick={addSpecies}>+ Spezies hinzufügen</button>

		{#if multiStep}
			<h3>Schritte</h3>
			<div class="steps-section">
				{#each steps as step (step._key)}
					<div class="step-card">
						<div class="step-top">
							<div class="step-selects">
								<select bind:value={step.reactant1} class="step-select">
									<option value="">Edukt 1</option>
									{#each availableSymbols as sym}
										<option value={sym}>{sym}</option>
									{/each}
								</select>
								<select bind:value={step.reactant2} class="step-select">
									<option value="">(Edukt 2)</option>
									{#each availableSymbols as sym}
										<option value={sym}>{sym}</option>
									{/each}
								</select>
								<span class="step-arrow">{step.reversible ? '\u21CC' : '\u2192'}</span>
								<select bind:value={step.product1} class="step-select">
									<option value="">Produkt 1</option>
									{#each availableSymbols as sym}
										<option value={sym}>{sym}</option>
									{/each}
								</select>
								<select bind:value={step.product2} class="step-select">
									<option value="">(Produkt 2)</option>
									{#each availableSymbols as sym}
										<option value={sym}>{sym}</option>
									{/each}
								</select>
							</div>
							<button class="delete-btn" onclick={() => removeStep(step._key)} title="Schritt entfernen">&times;</button>
						</div>
						<div class="step-bottom">
							<input type="text" bind:value={step.equation} placeholder="Gleichung (auto)" class="step-eq-input" />
							<label class="step-rate">
								Hin
								<input type="number" bind:value={step.forwardRate} min={0.01} max={5} step={0.01} />
							</label>
							<label class="step-rate">
								<span class="checkbox-row-inline">
									<input type="checkbox" bind:checked={step.reversible} />
									Rück
								</span>
								<input type="number" bind:value={step.reverseRate} min={0} max={5} step={0.01}
									disabled={!step.reversible} />
							</label>
						</div>
					</div>
				{/each}
			</div>
			<button class="add-species-btn" onclick={addStep}>+ Schritt hinzufügen</button>
		{/if}

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
		width: 700px;
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
		grid-template-columns: 2fr 40px 60px 60px 90px 90px 30px;
		gap: 6px;
		font-size: 0.75rem;
		color: #888;
		padding: 0 2px;
	}

	.species-row {
		display: grid;
		grid-template-columns: 2fr 40px 60px 60px 90px 90px 30px;
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

	.sp-phase {
		padding: 4px 4px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.75rem;
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

	/* Steps section */
	.steps-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.step-card {
		background: #262626;
		border: 1px solid #444;
		border-radius: 6px;
		padding: 8px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.step-top {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.step-selects {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
		flex-wrap: wrap;
	}

	.step-select {
		padding: 3px 4px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.8rem;
		min-width: 0;
		flex: 1;
	}

	.step-arrow {
		font-size: 1.1rem;
		color: #aaa;
		flex-shrink: 0;
		padding: 0 2px;
	}

	.step-bottom {
		display: flex;
		align-items: flex-end;
		gap: 8px;
	}

	.step-eq-input {
		flex: 1;
		padding: 3px 6px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.8rem;
		font-family: 'Times New Roman', serif;
	}

	.step-rate {
		display: flex;
		flex-direction: column;
		font-size: 0.75rem;
		gap: 2px;
		color: #aaa;
	}

	.step-rate input[type="number"] {
		width: 60px;
		padding: 3px 4px;
		background: #2a2a2a;
		color: #eee;
		border: 1px solid #555;
		border-radius: 4px;
		font-size: 0.8rem;
		text-align: right;
		-moz-appearance: textfield;
	}

	.step-rate input[type="number"]::-webkit-inner-spin-button,
	.step-rate input[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.step-rate input[type="number"]:disabled {
		opacity: 0.4;
	}

	.checkbox-row-inline {
		display: flex;
		align-items: center;
		gap: 4px;
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
