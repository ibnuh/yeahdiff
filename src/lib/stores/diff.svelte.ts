import {
	computePairwiseDiffs,
	summarizeDiff,
	getChangeAnchors as getAnchorsFromResults,
	buildUnifiedRows,
	type DiffStats
} from '../diff/engine.js';
import type {
	DiffResult,
	LineDiff,
	PaddingEntry,
	PrimaryPairTexts,
	UnifiedRow
} from '../diff/types.js';
import { paneStore } from './panes.svelte.js';
import { settings } from './settings.svelte.js';

/** @deprecated Prefer PrimaryPairTexts from diff/types */
export type PrimaryPair = PrimaryPairTexts;

class DiffStore {
	results = $state<Map<number, DiffResult>>(new Map());
	totalLines = $state(0);
	unifiedRows = $state<UnifiedRow[]>([]);
	private timeout: ReturnType<typeof setTimeout> | null = null;

	scheduleRecompute(
		texts: string[],
		mode: typeof settings.diffMode,
		aligned: boolean,
		baseIdx: number
	) {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(() => {
			const hasContent = texts.some((t) => t.length > 0);
			this.totalLines = texts.reduce((sum, text) => sum + text.split('\n').length, 0);
			if (hasContent) {
				this.results = computePairwiseDiffs(texts, mode, baseIdx, aligned);
			} else {
				this.results = new Map();
			}

			const pair = this.resolvePrimaryPair(texts, mode, baseIdx);
			if (pair && (pair.textA.length > 0 || pair.textB.length > 0)) {
				this.unifiedRows = buildUnifiedRows(pair.textA, pair.textB, 3);
			} else {
				this.unifiedRows = [];
			}
		}, 300);
	}

	resolvePrimaryPair(
		texts: string[],
		mode: typeof settings.diffMode,
		baseIdx: number
	): PrimaryPairTexts | null {
		if (texts.length < 2) {
			return null;
		}

		if (mode === 'base') {
			// baseIndex as A; first other pane as B (prefer next, else previous)
			const indexA = Math.min(baseIdx, texts.length - 1);
			let indexB = -1;
			for (let i = 0; i < texts.length; i++) {
				if (i !== indexA) {
					indexB = i;
					break;
				}
			}
			if (indexB === -1) {
				return null;
			}
			// Prefer the pane immediately after base when available
			if (indexA + 1 < texts.length) {
				indexB = indexA + 1;
			}
			return {
				textA: texts[indexA] ?? '',
				textB: texts[indexB] ?? '',
				indexA,
				indexB
			};
		}

		// adjacent: baseIndex vs baseIndex+1, clamped to last pair
		let indexA = Math.min(baseIdx, texts.length - 1);
		let indexB = indexA + 1;
		if (indexB >= texts.length) {
			indexA = Math.max(0, texts.length - 2);
			indexB = texts.length - 1;
		}
		return {
			textA: texts[indexA] ?? '',
			textB: texts[indexB] ?? '',
			indexA,
			indexB
		};
	}

	getPrimaryPair(): PrimaryPairTexts | null {
		return this.getPrimaryPairTexts();
	}

	/**
	 * Primary pair for unified view / pair-focused UX.
	 * base mode: baseIndex as A, first other pane as B;
	 * adjacent: baseIndex and baseIndex+1 (clamped).
	 */
	getPrimaryPairTexts(): PrimaryPairTexts | null {
		const texts = paneStore.panes.map((p) => p.content);
		const baseIdx = Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1));
		return this.resolvePrimaryPair(texts, settings.diffMode, baseIdx);
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

	getChangeAnchors(paneIndex: number): number[] {
		return getAnchorsFromResults(this.results, paneIndex);
	}

	getNavigationAnchors(): { paneIndex: number; lines: number[] } {
		const preferred = Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1));
		const preferredLines = this.getChangeAnchors(preferred);
		if (preferredLines.length > 0) {
			return { paneIndex: preferred, lines: preferredLines };
		}
		for (let i = 0; i < paneStore.count; i++) {
			const lines = this.getChangeAnchors(i);
			if (lines.length > 0) {
				return { paneIndex: i, lines };
			}
		}
		return { paneIndex: preferred, lines: [] };
	}
}

export const diffStore = new DiffStore();

$effect.root(() => {
	$effect(() => {
		const texts = paneStore.panes.map((p) => p.content);
		const mode = settings.diffMode;
		const aligned = settings.alignedDiff;
		const baseIdx = Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1));

		if (baseIdx !== settings.baseIndex) {
			settings.setBaseIndex(baseIdx);
		}

		void settings.viewMode;

		diffStore.scheduleRecompute(texts, mode, aligned, baseIdx);
	});
});
