import type { ReactionDefinition, CollisionRule, DecayRule } from './types';

export class ReactionEngine {
	collisionRules = new Map<string, CollisionRule>();
	decayRules: DecayRule[] = [];

	constructor(reaction: ReactionDefinition) {
		this.buildRules(reaction);
	}

	private buildRules(reaction: ReactionDefinition): void {
		const { reactants, products, forwardRate, reverseRate, reversible } = reaction;

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
		this.collisionRules.set(key, { speciesA: a, speciesB: b, products: [...products], probability });
	}

	matchCollision(speciesA: string, speciesB: string): CollisionRule | null {
		const key = this.makeKey(speciesA, speciesB);
		return this.collisionRules.get(key) ?? null;
	}

	private makeKey(a: string, b: string): string {
		return a <= b ? `${a}|${b}` : `${b}|${a}`;
	}
}
