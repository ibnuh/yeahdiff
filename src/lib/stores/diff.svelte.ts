import { computePairwiseDiffs, summarizeDiff, type DiffStats } from '../diff/engine.js';
import type { DiffResult, LineDiff, PaddingEntry } from '../diff/types.js';
import { paneStore } from './panes.svelte.js';
import { settings } from './settings.svelte.js';

class DiffStore {
	results = $state<Map<number, DiffResult>>(new Map());
	totalLines = $state(0);
	private timeout: ReturnType<typeof setTimeout> | null = null;

	scheduleRecompute(texts: string[], mode: typeof settings.diffMode, aligned: boolean, baseIdx: number) {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			const hasContent = texts.some((t) => t.length > 0);
			this.totalLines = texts.reduce((sum, text) => sum + text.split('\n').length, 0);
			if (hasContent) {
				this.results = computePairwiseDiffs(texts, mode, baseIdx, aligned);
			} else {
				this.results = new Map();
			}
		}, 300);
	}

	getDiffsForPane(index: number): LineDiff[] {
		return this.results.get(index)?.changes ?? [];
	}

	getPaddingForPane(index: number): PaddingEntry[] {
		return this.results.get(index)?.padding ?? [];
	}

	getStatsForPane(index: number): DiffStats {
		return summarizeDiff(this.getDiffsForPane(index));
	}
}

export const diffStore = new DiffStore();

// Reactive recomputation lives at module scope (runes-aware .svelte.ts)
$effect.root(() => {
	$effect(() => {
		const texts = paneStore.panes.map((p) => p.content);
		const mode = settings.diffMode;
		const aligned = settings.alignedDiff;
		const baseIdx = Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1));

		if (baseIdx !== settings.baseIndex) {
			settings.setBaseIndex(baseIdx);
		}

		diffStore.scheduleRecompute(texts, mode, aligned, baseIdx);
	});
});
