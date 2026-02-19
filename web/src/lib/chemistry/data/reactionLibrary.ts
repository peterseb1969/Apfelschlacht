import type { ReactionDefinition } from '../engine/types';

export const reactionLibrary: ReactionDefinition[] = [
	// === COMPLEXATION ===
	{
		id: 'fe-scn',
		name: 'Eisen-Thiocyanat-Komplex',
		nameEn: 'Iron Thiocyanate Complex',
		equation: 'Fe\u00B3\u207A + SCN\u207B \u21CC [Fe(SCN)]\u00B2\u207A',
		category: 'complexation',
		description: 'Bildung des blutrot gef\u00E4rbten Eisen(III)-thiocyanat-Komplexes. Klassischer Nachweis f\u00FCr Fe\u00B3\u207A-Ionen.',
		descriptionEn: 'Formation of the blood-red iron(III) thiocyanate complex. Classic test for Fe\u00B3\u207A ions.',
		species: [
			{ symbol: 'Fe\u00B3\u207A', color: '#d4a017', radius: 8, defaultCount: 30, role: 'reactant' },
			{ symbol: 'SCN\u207B', color: '#3498db', radius: 7, defaultCount: 30, role: 'reactant' },
			{ symbol: '[Fe(SCN)]\u00B2\u207A', color: '#c0392b', radius: 12, defaultCount: 0, role: 'product' }
		],
		reactants: ['Fe\u00B3\u207A', 'SCN\u207B'],
		products: ['[Fe(SCN)]\u00B2\u207A'],
		forwardRate: 0.8,
		reverseRate: 0.15,
		reversible: true
	},
	{
		id: 'hb-o2',
		name: 'H\u00E4moglobin-Sauerstoff',
		nameEn: 'Hemoglobin-Oxygen',
		equation: 'Hb + O\u2082 \u21CC HbO\u2082',
		category: 'complexation',
		description: 'Reversible Bindung von Sauerstoff an H\u00E4moglobin im Blut.',
		descriptionEn: 'Reversible binding of oxygen to hemoglobin in blood.',
		species: [
			{ symbol: 'Hb', color: '#8e44ad', radius: 12, defaultCount: 20, role: 'reactant' },
			{ symbol: 'O\u2082', color: '#e74c3c', radius: 5, defaultCount: 40, role: 'reactant' },
			{ symbol: 'HbO\u2082', color: '#e91e63', radius: 14, defaultCount: 0, role: 'product' }
		],
		reactants: ['Hb', 'O\u2082'],
		products: ['HbO\u2082'],
		forwardRate: 0.7,
		reverseRate: 0.12,
		reversible: true
	},
	{
		id: 'i2-i',
		name: 'Triiodid-Bildung',
		nameEn: 'Triiodide Formation',
		equation: 'I\u2082 + I\u207B \u21CC I\u2083\u207B',
		category: 'complexation',
		description: 'Bildung des braunen Triiodid-Ions aus Iod und Iodid.',
		descriptionEn: 'Formation of the brown triiodide ion from iodine and iodide.',
		species: [
			{ symbol: 'I\u2082', color: '#6c3483', radius: 9, defaultCount: 25, role: 'reactant' },
			{ symbol: 'I\u207B', color: '#af7ac5', radius: 6, defaultCount: 25, role: 'reactant' },
			{ symbol: 'I\u2083\u207B', color: '#4a235a', radius: 12, defaultCount: 0, role: 'product' }
		],
		reactants: ['I\u2082', 'I\u207B'],
		products: ['I\u2083\u207B'],
		forwardRate: 0.6,
		reverseRate: 0.1,
		reversible: true
	},
	{
		id: 'ag-cl',
		name: 'Silberchlorid-F\u00E4llung',
		nameEn: 'Silver Chloride Precipitation',
		equation: 'Ag\u207A + Cl\u207B \u21CC AgCl',
		category: 'complexation',
		description: 'F\u00E4llung von schwer l\u00F6slichem Silberchlorid. Klassischer Halogenid-Nachweis.',
		descriptionEn: 'Precipitation of sparingly soluble silver chloride. Classic halide test.',
		species: [
			{ symbol: 'Ag\u207A', color: '#bdc3c7', radius: 7, defaultCount: 25, role: 'reactant' },
			{ symbol: 'Cl\u207B', color: '#27ae60', radius: 6, defaultCount: 25, role: 'reactant' },
			{ symbol: 'AgCl', color: '#ecf0f1', radius: 10, defaultCount: 0, role: 'product' }
		],
		reactants: ['Ag\u207A', 'Cl\u207B'],
		products: ['AgCl'],
		forwardRate: 0.9,
		reverseRate: 0.03,
		reversible: true
	},

	// === DISSOCIATION / EQUILIBRIUM ===
	{
		id: 'n2o4-no2',
		name: 'Distickstofftetroxid-Zerfall',
		nameEn: 'Dinitrogen Tetroxide Dissociation',
		equation: 'N\u2082O\u2084 \u21CC 2 NO\u2082',
		category: 'dissociation',
		description: 'Gleichgewicht zwischen farblosem N\u2082O\u2084 und braunem NO\u2082. Ideal zur Demonstration von Druckeffekten (Le Chatelier).',
		descriptionEn: 'Equilibrium between colorless N\u2082O\u2084 and brown NO\u2082. Ideal for demonstrating pressure effects (Le Chatelier).',
		species: [
			{ symbol: 'N\u2082O\u2084', color: '#ecf0f1', radius: 11, defaultCount: 30, role: 'reactant' },
			{ symbol: 'NO\u2082', color: '#a0522d', radius: 7, defaultCount: 0, role: 'product' }
		],
		reactants: ['N\u2082O\u2084'],
		products: ['NO\u2082', 'NO\u2082'],
		forwardRate: 0.2,
		reverseRate: 0.5,
		reversible: true
	},
	{
		id: 'pcl5',
		name: 'Phosphorpentachlorid-Zerfall',
		nameEn: 'Phosphorus Pentachloride Dissociation',
		equation: 'PCl\u2085 \u21CC PCl\u2083 + Cl\u2082',
		category: 'dissociation',
		description: 'Thermischer Zerfall von Phosphorpentachlorid in Phosphortrichlorid und Chlor.',
		descriptionEn: 'Thermal decomposition of phosphorus pentachloride into phosphorus trichloride and chlorine.',
		species: [
			{ symbol: 'PCl\u2085', color: '#f39c12', radius: 12, defaultCount: 30, role: 'reactant' },
			{ symbol: 'PCl\u2083', color: '#e67e22', radius: 9, defaultCount: 0, role: 'product' },
			{ symbol: 'Cl\u2082', color: '#2ecc71', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: ['PCl\u2085'],
		products: ['PCl\u2083', 'Cl\u2082'],
		forwardRate: 0.15,
		reverseRate: 0.4,
		reversible: true
	},
	{
		id: 'ch3cooh',
		name: 'Essigs\u00E4ure-Dissoziation',
		nameEn: 'Acetic Acid Dissociation',
		equation: 'CH\u2083COOH \u21CC CH\u2083COO\u207B + H\u207A',
		category: 'acid-base',
		description: 'Schwache S\u00E4ure: Nur teilweise Dissoziation der Essigs\u00E4ure in Acetat und Protonen.',
		descriptionEn: 'Weak acid: only partial dissociation of acetic acid into acetate and protons.',
		species: [
			{ symbol: 'CH\u2083COOH', color: '#f1c40f', radius: 10, defaultCount: 40, role: 'reactant' },
			{ symbol: 'CH\u2083COO\u207B', color: '#e67e22', radius: 9, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u207A', color: '#e74c3c', radius: 4, defaultCount: 0, role: 'product' }
		],
		reactants: ['CH\u2083COOH'],
		products: ['CH\u2083COO\u207B', 'H\u207A'],
		forwardRate: 0.08,
		reverseRate: 0.6,
		reversible: true
	},
	{
		id: 'caco3',
		name: 'Kalkzerfall',
		nameEn: 'Calcium Carbonate Decomposition',
		equation: 'CaCO\u2083 \u21CC CaO + CO\u2082',
		category: 'dissociation',
		description: 'Thermischer Zerfall von Kalkstein. Wichtig f\u00FCr die Zementherstellung.',
		descriptionEn: 'Thermal decomposition of limestone. Important in cement production.',
		species: [
			{ symbol: 'CaCO\u2083', color: '#ecf0f1', radius: 11, defaultCount: 30, role: 'reactant' },
			{ symbol: 'CaO', color: '#bdc3c7', radius: 8, defaultCount: 0, role: 'product' },
			{ symbol: 'CO\u2082', color: '#95a5a6', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: ['CaCO\u2083'],
		products: ['CaO', 'CO\u2082'],
		forwardRate: 0.12,
		reverseRate: 0.35,
		reversible: true
	},
	{
		id: 'h2-i2',
		name: 'Iodwasserstoff-Gleichgewicht',
		nameEn: 'Hydrogen Iodide Equilibrium',
		equation: 'H\u2082 + I\u2082 \u21CC 2 HI',
		category: 'equilibrium',
		description: 'Klassisches Gasgleichgewicht zwischen Wasserstoff, Iod und Iodwasserstoff.',
		descriptionEn: 'Classic gas-phase equilibrium between hydrogen, iodine, and hydrogen iodide.',
		species: [
			{ symbol: 'H\u2082', color: '#3498db', radius: 5, defaultCount: 25, role: 'reactant' },
			{ symbol: 'I\u2082', color: '#8e44ad', radius: 9, defaultCount: 25, role: 'reactant' },
			{ symbol: 'HI', color: '#e91e63', radius: 7, defaultCount: 0, role: 'product' }
		],
		reactants: ['H\u2082', 'I\u2082'],
		products: ['HI'],
		forwardRate: 0.5,
		reverseRate: 0.2,
		reversible: true
	},

	// === ACID-BASE ===
	{
		id: 'h-oh',
		name: 'Wasser-Autoprotoyse',
		nameEn: 'Water Autoprotolysis',
		equation: 'H\u207A + OH\u207B \u21CC H\u2082O',
		category: 'acid-base',
		description: 'Neutralisationsreaktion: Protonen und Hydroxid-Ionen vereinigen sich zu Wasser.',
		descriptionEn: 'Neutralization reaction: protons and hydroxide ions combine to form water.',
		species: [
			{ symbol: 'H\u207A', color: '#e74c3c', radius: 4, defaultCount: 30, role: 'reactant' },
			{ symbol: 'OH\u207B', color: '#3498db', radius: 5, defaultCount: 30, role: 'reactant' },
			{ symbol: 'H\u2082O', color: '#85c1e9', radius: 7, defaultCount: 0, role: 'product' }
		],
		reactants: ['H\u207A', 'OH\u207B'],
		products: ['H\u2082O'],
		forwardRate: 0.95,
		reverseRate: 0.02,
		reversible: true
	},
	{
		id: 'nh3-h2o',
		name: 'Ammoniak in Wasser',
		nameEn: 'Ammonia in Water',
		equation: 'NH\u2083 + H\u2082O \u21CC NH\u2084\u207A + OH\u207B',
		category: 'acid-base',
		description: 'Ammoniak als schwache Base: Protonenaufnahme aus Wasser.',
		descriptionEn: 'Ammonia as a weak base: proton uptake from water.',
		species: [
			{ symbol: 'NH\u2083', color: '#2ecc71', radius: 7, defaultCount: 30, role: 'reactant' },
			{ symbol: 'H\u2082O', color: '#85c1e9', radius: 6, defaultCount: 30, role: 'reactant' },
			{ symbol: 'NH\u2084\u207A', color: '#27ae60', radius: 8, defaultCount: 0, role: 'product' },
			{ symbol: 'OH\u207B', color: '#3498db', radius: 5, defaultCount: 0, role: 'product' }
		],
		reactants: ['NH\u2083', 'H\u2082O'],
		products: ['NH\u2084\u207A', 'OH\u207B'],
		forwardRate: 0.3,
		reverseRate: 0.5,
		reversible: true
	},

	// === EXCHANGE ===
	{
		id: 'hcl-naoh',
		name: 'Salzsäure + Natronlauge',
		nameEn: 'Hydrochloric Acid + Sodium Hydroxide',
		equation: 'HCl + NaOH \u2192 NaCl + H\u2082O',
		category: 'exchange',
		description: 'Klassische Neutralisation: starke S\u00E4ure und starke Base reagieren zu Salz und Wasser.',
		descriptionEn: 'Classic neutralization: strong acid and strong base react to form salt and water.',
		species: [
			{ symbol: 'HCl', color: '#e74c3c', radius: 6, defaultCount: 30, role: 'reactant' },
			{ symbol: 'NaOH', color: '#3498db', radius: 7, defaultCount: 30, role: 'reactant' },
			{ symbol: 'NaCl', color: '#ecf0f1', radius: 8, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u2082O', color: '#85c1e9', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: ['HCl', 'NaOH'],
		products: ['NaCl', 'H\u2082O'],
		forwardRate: 0.9,
		reverseRate: 0,
		reversible: false
	},
	{
		id: 'co-h2o',
		name: 'Wassergas-Shift',
		nameEn: 'Water-Gas Shift',
		equation: 'CO + H\u2082O \u21CC CO\u2082 + H\u2082',
		category: 'exchange',
		description: 'Industriell wichtige Gleichgewichtsreaktion zur Wasserstoffgewinnung.',
		descriptionEn: 'Industrially important equilibrium reaction for hydrogen production.',
		species: [
			{ symbol: 'CO', color: '#95a5a6', radius: 6, defaultCount: 25, role: 'reactant' },
			{ symbol: 'H\u2082O', color: '#85c1e9', radius: 6, defaultCount: 25, role: 'reactant' },
			{ symbol: 'CO\u2082', color: '#7f8c8d', radius: 7, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u2082', color: '#3498db', radius: 5, defaultCount: 0, role: 'product' }
		],
		reactants: ['CO', 'H\u2082O'],
		products: ['CO\u2082', 'H\u2082'],
		forwardRate: 0.4,
		reverseRate: 0.3,
		reversible: true
	}
];

export function getReactionById(id: string): ReactionDefinition | undefined {
	return reactionLibrary.find(r => r.id === id);
}

export function getReactionsByCategory(category: string): ReactionDefinition[] {
	return reactionLibrary.filter(r => r.category === category);
}
