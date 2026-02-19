import type { ReactionDefinition, ReactionStep, CollisionRule, DecayRule } from './types';

export class ReactionEngine {
	collisionRules = new Map<string, CollisionRule[]>();
	decayRules: DecayRule[] = [];

	constructor(reaction: ReactionDefinition) {
		if (reaction.steps && reaction.steps.length > 0) {
			for (const step of reaction.steps) {
				this.buildStepRules(step);
			}
		} else {
			this.buildStepRules(reaction);
		}
	}

	private buildStepRules(step: Pick<ReactionStep, 'reactants' | 'products' | 'forwardRate' | 'reverseRate' | 'reversible'>): void {
		const { reactants, products, forwardRate, reverseRate, reversible } = step;

		if (reactants.length === 2 && products.length === 1) {
			// A + B -> C  (merge)
			this.addCollisionRule(reactants[0], reactants[1], products, forwardRate);
			if (reversible && reverseRate > 0) {
				this.decayRules.push({ fromSpecies: products[0], toSpecies: [...reactants], rate: reverseRate });
			}
		} else if (reactants.length === 1 && products.length === 2) {
			// C -> A + B  (dissociation)
			this.decayRules.push({ fromSpecies: reactants[0], toSpecies: [...products], rate: forwardRate });
			if (reversible && reverseRate > 0) {
				this.addCollisionRule(products[0], products[1], reactants, reverseRate);
			}
		} else if (reactants.length === 2 && products.length === 2) {
			// A + B -> C + D  (exchange)
			this.addCollisionRule(reactants[0], reactants[1], products, forwardRate);
			if (reversible && reverseRate > 0) {
				this.addCollisionRule(products[0], products[1], reactants, reverseRate);
			}
		}
	}

	private addCollisionRule(a: string, b: string, products: string[], probability: number): void {
		const key = this.makeKey(a, b);
		let arr = this.collisionRules.get(key);
		if (!arr) {
			arr = [];
			this.collisionRules.set(key, arr);
		}
		arr.push({ speciesA: a, speciesB: b, products: [...products], probability });
	}

	matchCollision(speciesA: string, speciesB: string): CollisionRule | null {
		const key = this.makeKey(speciesA, speciesB);
		const rules = this.collisionRules.get(key);
		if (!rules || rules.length === 0) return null;

		if (rules.length === 1) {
			return Math.random() < rules[0].probability ? rules[0] : null;
		}

		// Stochastic selection weighted by probability
		const totalP = rules.reduce((sum, r) => sum + r.probability, 0);
		const roll = Math.random();
		if (roll >= totalP) return null; // elastic collision

		let cumulative = 0;
		for (const rule of rules) {
			cumulative += rule.probability;
			if (roll < cumulative) return rule;
		}
		return rules[rules.length - 1];
	}

	private makeKey(a: string, b: string): string {
		return a <= b ? `${a}|${b}` : `${b}|${a}`;
	}
}
