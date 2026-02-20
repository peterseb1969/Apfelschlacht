import { writable, get } from 'svelte/store';
import type { ReactionDefinition } from '../engine/types';
import { reactionLibrary } from '../data/reactionLibrary';

const STORAGE_KEY = 'chemistry-custom-reactions';
const builtInIds = new Set(reactionLibrary.map(r => r.id));

function loadCustomReactions(): ReactionDefinition[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const json = localStorage.getItem(STORAGE_KEY);
		if (!json) return [];
		const parsed = JSON.parse(json);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveCustomReactions(all: ReactionDefinition[]): void {
	if (typeof localStorage === 'undefined') return;
	const custom = all.filter(r => !builtInIds.has(r.id));
	localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}

export const reactions = writable<ReactionDefinition[]>([...reactionLibrary, ...loadCustomReactions()]);

export function isBuiltIn(id: string): boolean {
	return builtInIds.has(id);
}

export function addReaction(r: ReactionDefinition): void {
	reactions.update(list => {
		const next = [...list, r];
		saveCustomReactions(next);
		return next;
	});
}

export function updateReaction(id: string, r: ReactionDefinition): void {
	reactions.update(list => {
		const next = list.map(existing => existing.id === id ? r : existing);
		saveCustomReactions(next);
		return next;
	});
}

export function deleteReaction(id: string): void {
	reactions.update(list => {
		const next = list.filter(existing => existing.id !== id);
		saveCustomReactions(next);
		return next;
	});
}

export function getCustomReactions(): ReactionDefinition[] {
	return get(reactions).filter(r => !builtInIds.has(r.id));
}

export function getAllReactions(): ReactionDefinition[] {
	return get(reactions);
}
