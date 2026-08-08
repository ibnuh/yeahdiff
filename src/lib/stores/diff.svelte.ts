import {
	computePairwiseDiffs,
	summarizeDiff,
	getChangeAnchors as getAnchorsFromResults,
	buildUnifiedRows,
	type DiffStats
} from '../diff/engine.js';
import { computePairwiseDiffsAsync } from '../diff/worker-client.js';
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
	/** Keys of expanded unified separators (from unifiedSeparatorKey). */
	unifiedExpandedKeys = $state<Set<string>>(new Set());
	private timeout: ReturnType<typeof setTimeout> | null = null;

	scheduleRecompute(
		texts: string[],
		mode: typeof settings.diffMode,
		aligned: boolean,
		baseIdx: number,
		diffOptions?: { ignoreWhitespace?: boolean; ignoreCase?: boolean }
	) {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(() => {
			void this.runRecompute(texts, mode, aligned, baseIdx, diffOptions);
		}, 300);
	}

	private recomputeGen = 0;

	private async runRecompute(
		texts: string[],
		mode: typeof settings.diffMode,
		aligned: boolean,
		baseIdx: number,
		diffOptions?: { ignoreWhitespace?: boolean; ignoreCase?: boolean }
	) {
		const gen = ++this.recomputeGen;
		const hasContent = texts.some((t) => t.length > 0);
		const totalLines = texts.reduce((sum, text) => sum + text.split('\n').length, 0);
		this.totalLines = totalLines;

		let results: Map<number, DiffResult>;
		if (hasContent) {
			if (totalLines > 2000) {
				results = await computePairwiseDiffsAsync(texts, mode, baseIdx, aligned, diffOptions);
			} else {
				results = computePairwiseDiffs(texts, mode, baseIdx, aligned, diffOptions);
			}
		} else {
			results = new Map();
		}

		if (gen !== this.recomputeGen) {
			return;
		}
		this.results = results;

		const pair = this.resolvePrimaryPair(texts, mode, baseIdx);
		if (pair && (pair.textA.length > 0 || pair.textB.length > 0)) {
			this.unifiedRows = buildUnifiedRows(
				pair.textA,
				pair.textB,
				3,
				this.unifiedExpandedKeys,
				diffOptions
			);
		} else {
			this.unifiedRows = [];
		}
	}

	/**
	 * Force immediate unified recompute (e.g. after expand / pair change).
	 * Uses current pane contents and settings.
	 */
	recomputeUnifiedNow() {
		const texts = paneStore.panes.map((p) => p.content);
		const baseIdx = Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1));
		const pair = this.resolvePrimaryPair(texts, settings.diffMode, baseIdx);
		const diffOptions = {
			ignoreWhitespace: settings.ignoreWhitespace,
			ignoreCase: settings.ignoreCase
		};
		if (pair && (pair.textA.length > 0 || pair.textB.length > 0)) {
			this.unifiedRows = buildUnifiedRows(
				pair.textA,
				pair.textB,
				3,
				this.unifiedExpandedKeys,
				diffOptions
			);
		} else {
			this.unifiedRows = [];
		}
	}

	expandUnifiedSeparator(key: string) {
		if (this.unifiedExpandedKeys.has(key)) {
			return;
		}
		const next = new Set(this.unifiedExpandedKeys);
		next.add(key);
		this.unifiedExpandedKeys = next;
		this.recomputeUnifiedNow();
	}

	expandAllUnifiedSeparators() {
		const keys = new Set<string>();
		for (const row of this.unifiedRows) {
			if (row.kind === 'separator') {
				keys.add(
					`${row.expandFromA}:${row.expandToA}:${row.expandFromB}:${row.expandToB}`
				);
			}
		}
		if (keys.size === 0 && this.unifiedExpandedKeys.size === 0) {
			return;
		}
		const next = new Set(this.unifiedExpandedKeys);
		for (const k of keys) {
			next.add(k);
		}
		this.unifiedExpandedKeys = next;
		this.recomputeUnifiedNow();
	}

	clearUnifiedExpanded() {
		if (this.unifiedExpandedKeys.size === 0) {
			return;
		}
		this.unifiedExpandedKeys = new Set();
		this.recomputeUnifiedNow();
	}

	resolvePrimaryPair(
		texts: string[],
		mode: typeof settings.diffMode,
		baseIdx: number
	): PrimaryPairTexts | null {
		if (texts.length < 2) {
			return null;
		}

		// Explicit pair from settings (pair picker) when both indices are valid and distinct
		const ua = settings.unifiedIndexA;
		const ub = settings.unifiedIndexB;
		if (
			ua !== null &&
			ub !== null &&
			ua !== ub &&
			ua >= 0 &&
			ub >= 0 &&
			ua < texts.length &&
			ub < texts.length
		) {
			return {
				textA: texts[ua] ?? '',
				textB: texts[ub] ?? '',
				indexA: ua,
				indexB: ub
			};
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
	 * Prefer settings.unifiedIndexA/B when set; else base/adjacent resolve.
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
		const ignoreWhitespace = settings.ignoreWhitespace;
		const ignoreCase = settings.ignoreCase;

		if (baseIdx !== settings.baseIndex) {
			settings.setBaseIndex(baseIdx);
		}

		void settings.viewMode;
		// Recompute when explicit unified pair changes
		void settings.unifiedIndexA;
		void settings.unifiedIndexB;

		diffStore.scheduleRecompute(texts, mode, aligned, baseIdx, {
			ignoreWhitespace,
			ignoreCase
		});
	});
});
