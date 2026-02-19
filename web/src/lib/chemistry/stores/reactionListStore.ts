import { writable } from 'svelte/store';
import type { ReactionDefinition } from '../engine/types';
import { reactionLibrary } from '../data/reactionLibrary';

const builtInIds = new Set(reactionLibrary.map(r => r.id));

export const reactions = writable<ReactionDefinition[]>([...reactionLibrary]);

export function isBuiltIn(id: string): boolean {
	return builtInIds.has(id);
}

export function addReaction(r: ReactionDefinition): void {
	reactions.update(list => [...list, r]);
}

export function updateReaction(id: string, r: ReactionDefinition): void {
	reactions.update(list => list.map(existing => existing.id === id ? r : existing));
}

export function deleteReaction(id: string): void {
	reactions.update(list => list.filter(existing => existing.id !== id));
}
