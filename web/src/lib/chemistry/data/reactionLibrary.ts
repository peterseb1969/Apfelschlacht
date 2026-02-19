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
	},

	// === CATALYSIS ===
	{
		id: 'haber-bosch',
		name: 'Haber-Bosch-Synthese',
		nameEn: 'Haber-Bosch Synthesis',
		equation: 'N\u2082 + 3 H\u2082 \u21CC 2 NH\u2083 (katalytisch)',
		category: 'catalysis',
		description: 'Industrielle Ammoniaksynthese \u00FCber 7 Oberfl\u00E4chen-Gleichgewichte an einem Eisenkatalysator (S*). Schritt 3 (N\u2261N-Spaltung) ist geschwindigkeitsbestimmend.',
		descriptionEn: 'Industrial ammonia synthesis via 7 surface equilibria on an iron catalyst (S*). Step 3 (N\u2261N bond breaking) is rate-limiting.',
		species: [
			{ symbol: 'H\u2082', color: '#3498db', radius: 5, defaultCount: 40, role: 'reactant' },
			{ symbol: 'N\u2082', color: '#9b59b6', radius: 6, defaultCount: 20, role: 'reactant' },
			{ symbol: 'S*', color: '#95a5a6', radius: 9, defaultCount: 120, role: 'reactant', pinned: true },
			{ symbol: 'H_ad', color: '#2980b9', radius: 4, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'N\u2082_ad', color: '#8e44ad', radius: 7, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'N_ad', color: '#7d3c98', radius: 5, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'NH_ad', color: '#27ae60', radius: 6, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'NH\u2082_ad', color: '#2ecc71', radius: 7, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'NH\u2083_ad', color: '#1abc9c', radius: 8, defaultCount: 0, role: 'product', pinned: true },
			{ symbol: 'NH\u2083', color: '#16a085', radius: 7, defaultCount: 0, role: 'product' }
		],
		reactants: ['N\u2082', 'H\u2082'],
		products: ['NH\u2083'],
		forwardRate: 0,
		reverseRate: 0,
		reversible: true,
		steps: [
			{
				reactants: ['H\u2082', 'S*'],
				products: ['H_ad', 'H_ad'],
				forwardRate: 0.6,
				reverseRate: 0.15,
				reversible: true,
				equation: 'H\u2082 + S* \u21CC 2 H_ad'
			},
			{
				reactants: ['N\u2082', 'S*'],
				products: ['N\u2082_ad'],
				forwardRate: 0.4,
				reverseRate: 0.2,
				reversible: true,
				equation: 'N\u2082 + S* \u21CC N\u2082_ad'
			},
			{
				reactants: ['N\u2082_ad'],
				products: ['N_ad', 'N_ad'],
				forwardRate: 0.04,
				reverseRate: 0.3,
				reversible: true,
				equation: 'N\u2082_ad \u21CC 2 N_ad (langsam)'
			},
			{
				reactants: ['N_ad', 'H_ad'],
				products: ['NH_ad'],
				forwardRate: 0.5,
				reverseRate: 0.15,
				reversible: true,
				equation: 'N_ad + H_ad \u21CC NH_ad'
			},
			{
				reactants: ['NH_ad', 'H_ad'],
				products: ['NH\u2082_ad'],
				forwardRate: 0.5,
				reverseRate: 0.15,
				reversible: true,
				equation: 'NH_ad + H_ad \u21CC NH\u2082_ad'
			},
			{
				reactants: ['NH\u2082_ad', 'H_ad'],
				products: ['NH\u2083_ad'],
				forwardRate: 0.5,
				reverseRate: 0.15,
				reversible: true,
				equation: 'NH\u2082_ad + H_ad \u21CC NH\u2083_ad'
			},
			{
				reactants: ['NH\u2083_ad'],
				products: ['NH\u2083', 'S*'],
				forwardRate: 0.3,
				reverseRate: 0.1,
				reversible: true,
				equation: 'NH\u2083_ad \u21CC NH\u2083 + S*'
			}
		]
	},

	// === CHAIN REACTIONS ===
	{
		id: 'h2-br2-chain',
		name: 'H\u2082/Br\u2082-Kettenreaktion',
		nameEn: 'H\u2082/Br\u2082 Chain Reaction',
		equation: 'H\u2082 + Br\u2082 \u2192 2 HBr',
		category: 'catalysis',
		description: 'Klassische Radikalketten-Reaktion: Initiierung durch Br\u2082-Zerfall, Kettenfortpflanzung durch Br\u2022- und H\u2022-Radikale, Kettenabbruch durch Radikalrekombination.',
		descriptionEn: 'Classic radical chain reaction: initiation by Br\u2082 homolysis, propagation via Br\u2022 and H\u2022 radicals, termination by radical recombination.',
		species: [
			{ symbol: 'H\u2082', color: '#3498db', radius: 5, defaultCount: 40, role: 'reactant' },
			{ symbol: 'Br\u2082', color: '#c0392b', radius: 8, defaultCount: 40, role: 'reactant' },
			{ symbol: 'Br\u2022', color: '#e74c3c', radius: 4, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u2022', color: '#85c1e9', radius: 3, defaultCount: 0, role: 'product' },
			{ symbol: 'HBr', color: '#e67e22', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: [],
		products: [],
		forwardRate: 0,
		reverseRate: 0,
		reversible: false,
		steps: [
			{
				reactants: ['Br\u2082'],
				products: ['Br\u2022', 'Br\u2022'],
				forwardRate: 0.03,
				reverseRate: 0.6,
				reversible: true,
				equation: 'Br\u2082 \u21CC 2 Br\u2022 (Initiierung)'
			},
			{
				reactants: ['Br\u2022', 'H\u2082'],
				products: ['HBr', 'H\u2022'],
				forwardRate: 0.5,
				reverseRate: 0.05,
				reversible: true,
				equation: 'Br\u2022 + H\u2082 \u2192 HBr + H\u2022'
			},
			{
				reactants: ['H\u2022', 'Br\u2082'],
				products: ['HBr', 'Br\u2022'],
				forwardRate: 0.8,
				reverseRate: 0,
				reversible: false,
				equation: 'H\u2022 + Br\u2082 \u2192 HBr + Br\u2022 (schnell)'
			}
		]
	},
	{
		id: 'ch4-cl2-chain',
		name: 'Methan-Chlorierung',
		nameEn: 'Methane Chlorination',
		equation: 'CH\u2084 + Cl\u2082 \u2192 CH\u2083Cl + HCl',
		category: 'catalysis',
		description: 'Radikalische Substitution: Cl\u2082-Homolyse startet eine Kette. Nebenprodukt Ethan (C\u2082H\u2086) entsteht durch Methylradikal-Rekombination.',
		descriptionEn: 'Radical substitution: Cl\u2082 homolysis starts a chain. Side product ethane (C\u2082H\u2086) forms by methyl radical recombination.',
		species: [
			{ symbol: 'CH\u2084', color: '#95a5a6', radius: 7, defaultCount: 40, role: 'reactant' },
			{ symbol: 'Cl\u2082', color: '#2ecc71', radius: 7, defaultCount: 40, role: 'reactant' },
			{ symbol: 'Cl\u2022', color: '#27ae60', radius: 4, defaultCount: 0, role: 'product' },
			{ symbol: 'CH\u2083\u2022', color: '#7f8c8d', radius: 5, defaultCount: 0, role: 'product' },
			{ symbol: 'HCl', color: '#f1c40f', radius: 5, defaultCount: 0, role: 'product' },
			{ symbol: 'CH\u2083Cl', color: '#1abc9c', radius: 8, defaultCount: 0, role: 'product' },
			{ symbol: 'C\u2082H\u2086', color: '#bdc3c7', radius: 9, defaultCount: 0, role: 'product' }
		],
		reactants: [],
		products: [],
		forwardRate: 0,
		reverseRate: 0,
		reversible: false,
		steps: [
			{
				reactants: ['Cl\u2082'],
				products: ['Cl\u2022', 'Cl\u2022'],
				forwardRate: 0.04,
				reverseRate: 0.5,
				reversible: true,
				equation: 'Cl\u2082 \u21CC 2 Cl\u2022 (Initiierung)'
			},
			{
				reactants: ['Cl\u2022', 'CH\u2084'],
				products: ['HCl', 'CH\u2083\u2022'],
				forwardRate: 0.5,
				reverseRate: 0.02,
				reversible: true,
				equation: 'Cl\u2022 + CH\u2084 \u2192 HCl + CH\u2083\u2022'
			},
			{
				reactants: ['CH\u2083\u2022', 'Cl\u2082'],
				products: ['CH\u2083Cl', 'Cl\u2022'],
				forwardRate: 0.6,
				reverseRate: 0,
				reversible: false,
				equation: 'CH\u2083\u2022 + Cl\u2082 \u2192 CH\u2083Cl + Cl\u2022'
			},
			{
				reactants: ['CH\u2083\u2022', 'CH\u2083\u2022'],
				products: ['C\u2082H\u2086'],
				forwardRate: 0.7,
				reverseRate: 0.01,
				reversible: true,
				equation: '2 CH\u2083\u2022 \u2192 C\u2082H\u2086 (Abbruch)'
			}
		]
	},
	{
		id: 'h2-combustion',
		name: 'Knallgas (Kettenexplosion)',
		nameEn: 'Hydrogen Combustion (Chain Explosion)',
		equation: '2 H\u2082 + O\u2082 \u2192 2 H\u2082O',
		category: 'catalysis',
		description: 'Kettenverzweigende Explosion: Ein Radikal erzeugt zwei neue. OH\u2022, H\u2022 und O\u2022 vermehren sich exponentiell \u2014 sichtbare Explosion.',
		descriptionEn: 'Chain-branching explosion: one radical produces two. OH\u2022, H\u2022 and O\u2022 multiply exponentially \u2014 visible explosion.',
		species: [
			{ symbol: 'H\u2082', color: '#3498db', radius: 5, defaultCount: 50, role: 'reactant' },
			{ symbol: 'O\u2082', color: '#e74c3c', radius: 6, defaultCount: 25, role: 'reactant' },
			{ symbol: 'OH\u2022', color: '#f39c12', radius: 4, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u2022', color: '#85c1e9', radius: 3, defaultCount: 0, role: 'product' },
			{ symbol: 'O\u2022', color: '#e91e63', radius: 4, defaultCount: 0, role: 'product' },
			{ symbol: 'H\u2082O', color: '#2980b9', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: [],
		products: [],
		forwardRate: 0,
		reverseRate: 0,
		reversible: false,
		steps: [
			{
				reactants: ['H\u2082', 'O\u2082'],
				products: ['OH\u2022', 'OH\u2022'],
				forwardRate: 0.02,
				reverseRate: 0,
				reversible: false,
				equation: 'H\u2082 + O\u2082 \u2192 2 OH\u2022 (Initiierung)'
			},
			{
				reactants: ['OH\u2022', 'H\u2082'],
				products: ['H\u2082O', 'H\u2022'],
				forwardRate: 0.7,
				reverseRate: 0,
				reversible: false,
				equation: 'OH\u2022 + H\u2082 \u2192 H\u2082O + H\u2022'
			},
			{
				reactants: ['H\u2022', 'O\u2082'],
				products: ['OH\u2022', 'O\u2022'],
				forwardRate: 0.6,
				reverseRate: 0,
				reversible: false,
				equation: 'H\u2022 + O\u2082 \u2192 OH\u2022 + O\u2022 (Verzweigung)'
			},
			{
				reactants: ['O\u2022', 'H\u2082'],
				products: ['OH\u2022', 'H\u2022'],
				forwardRate: 0.6,
				reverseRate: 0,
				reversible: false,
				equation: 'O\u2022 + H\u2082 \u2192 OH\u2022 + H\u2022 (Verzweigung)'
			}
		]
	},
	{
		id: 'ozone-cl',
		name: 'Ozonabbau durch Chlor',
		nameEn: 'Ozone Depletion by Chlorine',
		equation: 'O\u2083 + O \u2192 2 O\u2082 (Cl-katalysiert)',
		category: 'catalysis',
		description: 'Katalytischer Ozonabbau: Cl\u2022 wird nicht verbraucht, sondern zerst\u00F6rt in einem Zyklus je ein O\u2083-Molek\u00FCl. Homogene Gasphasenkatalyse.',
		descriptionEn: 'Catalytic ozone destruction: Cl\u2022 is not consumed but destroys one O\u2083 molecule per cycle. Homogeneous gas-phase catalysis.',
		species: [
			{ symbol: 'O\u2083', color: '#3498db', radius: 8, defaultCount: 50, role: 'reactant' },
			{ symbol: 'O\u2082', color: '#2ecc71', radius: 6, defaultCount: 0, role: 'product' },
			{ symbol: 'O\u2022', color: '#e74c3c', radius: 4, defaultCount: 0, role: 'product' },
			{ symbol: 'Cl\u2022', color: '#f1c40f', radius: 4, defaultCount: 5, role: 'reactant' },
			{ symbol: 'ClO', color: '#e67e22', radius: 6, defaultCount: 0, role: 'product' }
		],
		reactants: [],
		products: [],
		forwardRate: 0,
		reverseRate: 0,
		reversible: false,
		steps: [
			{
				reactants: ['O\u2083'],
				products: ['O\u2082', 'O\u2022'],
				forwardRate: 0.06,
				reverseRate: 0.3,
				reversible: true,
				equation: 'O\u2083 \u21CC O\u2082 + O\u2022 (langsam)'
			},
			{
				reactants: ['Cl\u2022', 'O\u2083'],
				products: ['ClO', 'O\u2082'],
				forwardRate: 0.7,
				reverseRate: 0.05,
				reversible: true,
				equation: 'Cl\u2022 + O\u2083 \u2192 ClO + O\u2082'
			},
			{
				reactants: ['ClO', 'O\u2022'],
				products: ['Cl\u2022', 'O\u2082'],
				forwardRate: 0.8,
				reverseRate: 0,
				reversible: false,
				equation: 'ClO + O\u2022 \u2192 Cl\u2022 + O\u2082 (Regeneration)'
			}
		]
	}
];

export function getReactionById(id: string): ReactionDefinition | undefined {
	return reactionLibrary.find(r => r.id === id);
}

export function getReactionsByCategory(category: string): ReactionDefinition[] {
	return reactionLibrary.filter(r => r.category === category);
}
