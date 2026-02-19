export interface SpeciesDefinition {
	symbol: string;
	color: string;
	radius: number;
	defaultCount: number;
	role: 'reactant' | 'product';
	pinned?: boolean;
}

export type ReactionCategory = 'dissociation' | 'complexation' | 'acid-base' | 'equilibrium' | 'exchange' | 'catalysis';

export interface ReactionStep {
	reactants: string[];
	products: string[];
	forwardRate: number;
	reverseRate: number;
	reversible: boolean;
	equation?: string;
}

export interface ReactionDefinition {
	id: string;
	name: string;
	nameEn: string;
	equation: string;
	category: ReactionCategory;
	description: string;
	descriptionEn: string;
	species: SpeciesDefinition[];
	reactants: string[];
	products: string[];
	forwardRate: number;
	reverseRate: number;
	reversible: boolean;
	steps?: ReactionStep[];
}

export interface CollisionRule {
	speciesA: string;
	speciesB: string;
	products: string[];
	probability: number;
}

export interface DecayRule {
	fromSpecies: string;
	toSpecies: string[];
	rate: number;
}

export interface ChemistryParticleState {
	id: number;
	species: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	mass: number;
	rotation: number;
	isProduct: boolean;
	pinned: boolean;
}

export interface InjectorState {
	side: 'left' | 'right' | 'top' | 'bottom';
	position: number;
	species: string;
	color: string;
	active: boolean;
}

export interface ChemistrySimState {
	running: boolean;
	simTime: number;
	width: number;
	height: number;
	effectiveWidth: number;
	particles: ChemistryParticleState[];
	speciesCounts: Record<string, number>;
	injectors: InjectorState[];
	hertz: number;
	gravityOn: boolean;
	temperature: number;
	pressure: number;
	densitySections: number[];
}

export interface ChemistryChartPoint {
	time: number;
	counts: Record<string, number>;
	pressure: number;
	temperature: number;
	volume: number;
}
