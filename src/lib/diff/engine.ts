import { diffLines, diffWords } from 'diff';
import type {
	DiffResult,
	LineDiff,
	WordDiff,
	DiffMode,
	PaddingEntry,
	DiffHunk,
	DiffPairChanges,
	DiffViewOptions,
	UnifiedDiffLine,
	UnifiedRow,
	AlignedPairResult
} from './types.js';
import { shouldSkipDiff } from '../large-file-utils.js';

export type { AlignedPairResult, DiffPairChanges, DiffViewOptions };

const DEFAULT_CONTEXT_LINES = 3;

function computeWordDiffForLine(lineA: string, lineB: string): WordDiff[] {
	const result = diffWords(lineA, lineB);
	return result.map((part) => ({
		type: part.added ? 'added' as const : part.removed ? 'removed' as const : 'unchanged' as const,
		value: part.value
	}));
}

export function computeDiffBetweenTexts(textA: string, textB: string): LineDiff[] {
	if (textA === textB) return [];

	const result = diffLines(textA, textB);
	const changes: LineDiff[] = [];
	let lineInB = 0;

	let i = 0;
	while (i < result.length) {
		const part = result[i];
		const lines = part.value.replace(/\n$/, '').split('\n');

		if (!part.added && !part.removed) {
			lineInB += lines.length;
			i++;
			continue;
		}

		if (part.removed) {
			const nextPart = result[i + 1];

			if (nextPart && nextPart.added) {
				const removedLines = lines;
				const addedLines = nextPart.value.replace(/\n$/, '').split('\n');

				const maxLen = Math.max(removedLines.length, addedLines.length);
				for (let j = 0; j < maxLen; j++) {
					lineInB++;
					if (j < removedLines.length && j < addedLines.length) {
						const wordDiffs = computeWordDiffForLine(removedLines[j], addedLines[j]);
						const hasChanges = wordDiffs.some((w) => w.type !== 'unchanged');
						changes.push({
							type: hasChanges ? 'modified' : 'unchanged',
							lineNumber: lineInB,
							content: addedLines[j],
							wordDiffs: hasChanges ? wordDiffs.filter((w) => w.type !== 'removed') : undefined
						});
					} else if (j < addedLines.length) {
						changes.push({
							type: 'added',
							lineNumber: lineInB,
							content: addedLines[j]
						});
					}
				}
				i += 2;
				continue;
			}

			i++;
			continue;
		}

		if (part.added) {
			for (const line of lines) {
				lineInB++;
				changes.push({
					type: 'added',
					lineNumber: lineInB,
					content: line
				});
			}
			i++;
			continue;
		}

		i++;
	}

	return changes;
}

export function computeAlignedPair(textA: string, textB: string): AlignedPairResult {
	const empty: AlignedPairResult = { changesA: [], changesB: [], paddingA: [], paddingB: [] };
	if (textA === textB) return empty;

	const result = diffLines(textA, textB);
	const changesA: LineDiff[] = [];
	const changesB: LineDiff[] = [];
	const paddingA: PaddingEntry[] = [];
	const paddingB: PaddingEntry[] = [];

	let lineInA = 0;
	let lineInB = 0;

	let i = 0;
	while (i < result.length) {
		const part = result[i];
		const lines = part.value.replace(/\n$/, '').split('\n');

		if (!part.added && !part.removed) {
			lineInA += lines.length;
			lineInB += lines.length;
			i++;
			continue;
		}

		if (part.removed) {
			const nextPart = result[i + 1];

			if (nextPart && nextPart.added) {
				const removedLines = lines;
				const addedLines = nextPart.value.replace(/\n$/, '').split('\n');

				const maxLen = Math.max(removedLines.length, addedLines.length);
				for (let j = 0; j < maxLen; j++) {
					if (j < removedLines.length && j < addedLines.length) {
						const wordDiffs = computeWordDiffForLine(removedLines[j], addedLines[j]);
						const hasChanges = wordDiffs.some((w) => w.type !== 'unchanged');

						lineInA++;
						changesA.push({
							type: hasChanges ? 'modified' : 'unchanged',
							lineNumber: lineInA,
							content: removedLines[j],
							wordDiffs: hasChanges ? wordDiffs.filter((w) => w.type !== 'added') : undefined,
							side: 'base'
						});

						lineInB++;
						changesB.push({
							type: hasChanges ? 'modified' : 'unchanged',
							lineNumber: lineInB,
							content: addedLines[j],
							wordDiffs: hasChanges ? wordDiffs.filter((w) => w.type !== 'removed') : undefined,
							side: 'target'
						});
					} else if (j < removedLines.length) {
						lineInA++;
						changesA.push({
							type: 'removed',
							lineNumber: lineInA,
							content: removedLines[j],
							side: 'base'
						});
					} else {
						lineInB++;
						changesB.push({
							type: 'added',
							lineNumber: lineInB,
							content: addedLines[j],
							side: 'target'
						});
					}
				}

				const diff = removedLines.length - addedLines.length;
				if (diff > 0) {
					paddingB.push({ afterLine: lineInB, count: diff });
				} else if (diff < 0) {
					paddingA.push({ afterLine: lineInA, count: -diff });
				}

				i += 2;
				continue;
			}

			for (const line of lines) {
				lineInA++;
				changesA.push({
					type: 'removed',
					lineNumber: lineInA,
					content: line,
					side: 'base'
				});
			}
			paddingB.push({ afterLine: lineInB, count: lines.length });

			i++;
			continue;
		}

		if (part.added) {
			for (const line of lines) {
				lineInB++;
				changesB.push({
					type: 'added',
					lineNumber: lineInB,
					content: line,
					side: 'target'
				});
			}
			paddingA.push({ afterLine: lineInA, count: lines.length });

			i++;
			continue;
		}

		i++;
	}

	return { changesA, changesB, paddingA, paddingB };
}

/**
 * Merge change lists for the same pane (e.g. base vs multiple targets).
 * Prefer stronger markers when the same line appears in more than one pair:
 * modified > removed > added > unchanged.
 */
function mergeLineDiffs(lists: LineDiff[][]): LineDiff[] {
	const rank: Record<string, number> = {
		unchanged: 0,
		added: 1,
		removed: 2,
		modified: 3
	};
	const byLine = new Map<number, LineDiff>();

	for (const list of lists) {
		for (const change of list) {
			const existing = byLine.get(change.lineNumber);
			if (!existing || rank[change.type] > rank[existing.type]) {
				byLine.set(change.lineNumber, change);
			}
		}
	}

	return [...byLine.values()].sort((a, b) => a.lineNumber - b.lineNumber);
}

/**
 * Always computes two-sided decorations so both panes show adds/removes/modifies.
 * Padding (blank spacer rows) is only applied when `aligned` is true.
 */
export function computePairwiseDiffs(
	texts: string[],
	mode: DiffMode,
	baseIndex: number,
	aligned: boolean = false
): Map<number, DiffResult> {
	const results = new Map<number, DiffResult>();
	const emptyPadding: PaddingEntry[] = [];

	// Check if any file is too large for diff computation
	const totalLines = texts.reduce((sum, text) => sum + text.split('\n').length, 0);
	if (shouldSkipDiff(totalLines)) {
		for (let i = 0; i < texts.length; i++) {
			results.set(i, { paneIndex: i, basePaneIndex: baseIndex, changes: [], padding: [] });
		}
		return results;
	}

	if (mode === 'base') {
		const baseText = texts[baseIndex] ?? '';
		const baseChangeLists: LineDiff[][] = [];
		const basePaddingLists: PaddingEntry[][] = [];

		for (let i = 0; i < texts.length; i++) {
			if (i === baseIndex) continue;
			const pair = computeAlignedPair(baseText, texts[i]);

			results.set(i, {
				paneIndex: i,
				basePaneIndex: baseIndex,
				changes: pair.changesB,
				// Target padding only when align is on
				padding: aligned ? pair.paddingB : emptyPadding
			});

			baseChangeLists.push(pair.changesA);
			if (aligned) {
				basePaddingLists.push(pair.paddingA);
			}
		}

		// Base pane: union of removals/modifications against every target
		results.set(baseIndex, {
			paneIndex: baseIndex,
			basePaneIndex: baseIndex,
			changes: mergeLineDiffs(baseChangeLists),
			// For multi-target, use padding from the first pair only (visual alignment
			// against one target at a time; multi-target padding merge is ambiguous)
			padding: aligned ? (basePaddingLists[0] ?? emptyPadding) : emptyPadding
		});
	} else {
		// Adjacent: each pane vs its neighbor; both sides always get decorations
		for (let i = 0; i < texts.length - 1; i++) {
			const pair = computeAlignedPair(texts[i], texts[i + 1]);

			if (!results.has(i)) {
				results.set(i, {
					paneIndex: i,
					basePaneIndex: i,
					changes: pair.changesA,
					padding: aligned ? pair.paddingA : emptyPadding
				});
			}

			results.set(i + 1, {
				paneIndex: i + 1,
				basePaneIndex: i,
				changes: pair.changesB,
				padding: aligned ? pair.paddingB : emptyPadding
			});
		}
	}

	return results;
}

export type DiffStats = {
	added: number;
	removed: number;
	modified: number;
};

export function summarizeDiff(changes: LineDiff[]): DiffStats {
	let added = 0;
	let removed = 0;
	let modified = 0;
	for (const change of changes) {
		if (change.type === 'added') {
			added += 1;
		} else if (change.type === 'removed') {
			removed += 1;
		} else if (change.type === 'modified') {
			modified += 1;
		}
	}
	return { added, removed, modified };
}

export function getChangeAnchors(
	results: Map<number, DiffResult>,
	paneIndex: number
): number[] {
	const changes = results.get(paneIndex)?.changes ?? [];
	const lines = new Set<number>();
	for (const change of changes) {
		if (change.type === 'added' || change.type === 'removed' || change.type === 'modified') {
			lines.add(change.lineNumber);
		}
	}
	return [...lines].sort((a, b) => a - b);
}

export function countHunks(hunks: DiffHunk[]): number {
	return hunks.length;
}

/**
 * Group consecutive changes into hunks. Pure removals on A and pure adds on B
 * that sit in the same edit region (via aligned pair ordering) are merged when
 * their line ranges are adjacent within a small gap. Ranges expand by
 * `contextLines` (default 3) for collapse-unchanged / next-prev UX.
 */
export function buildHunks(
	pair: AlignedPairResult | DiffPairChanges,
	contextLines: number = DEFAULT_CONTEXT_LINES
): DiffHunk[] {
	const ctx = Math.max(0, contextLines);
	const a = pair.changesA
		.filter((c) => c.type !== 'unchanged')
		.sort((x, y) => x.lineNumber - y.lineNumber);
	const b = pair.changesB
		.filter((c) => c.type !== 'unchanged')
		.sort((x, y) => x.lineNumber - y.lineNumber);

	if (a.length === 0 && b.length === 0) {
		return [];
	}

	// Merge gap grows with context so nearby clusters become one hunk (git-style)
	const mergeGap = Math.max(1, ctx * 2);

	const raw: DiffHunk[] = [];
	let ia = 0;
	let ib = 0;

	while (ia < a.length || ib < b.length) {
		const nextA = ia < a.length ? a[ia].lineNumber : Infinity;
		const nextB = ib < b.length ? b[ib].lineNumber : Infinity;

		const changesA: LineDiff[] = [];
		const changesB: LineDiff[] = [];
		let endA = 0;
		let endB = 0;
		let startA = 0;
		let startB = 0;

		// Seed hunk with the earlier side
		if (nextA <= nextB) {
			startA = a[ia].lineNumber;
			endA = startA;
			changesA.push(a[ia]);
			ia += 1;
		} else {
			startB = b[ib].lineNumber;
			endB = startB;
			changesB.push(b[ib]);
			ib += 1;
		}

		let grew = true;
		while (grew) {
			grew = false;
			if (ia < a.length) {
				const line = a[ia].lineNumber;
				const nearA = endA > 0 && line <= endA + mergeGap;
				const nearB = endB > 0 && line <= endB + mergeGap;
				const nearStart = startA === 0 && startB > 0 && line <= startB + mergeGap;
				if (nearA || nearB || nearStart) {
					if (startA === 0) {
						startA = line;
					}
					endA = line;
					changesA.push(a[ia]);
					ia += 1;
					grew = true;
					continue;
				}
			}
			if (ib < b.length) {
				const line = b[ib].lineNumber;
				const nearB = endB > 0 && line <= endB + mergeGap;
				const nearA = endA > 0 && line <= endA + mergeGap;
				const nearStart = startB === 0 && startA > 0 && line <= startA + mergeGap;
				if (nearB || nearA || nearStart) {
					if (startB === 0) {
						startB = line;
					}
					endB = line;
					changesB.push(b[ib]);
					ib += 1;
					grew = true;
				}
			}
		}

		raw.push({
			startLineA: startA,
			endLineA: endA,
			startLineB: startB,
			endLineB: endB,
			changeCount: changesA.length + changesB.length,
			changesA,
			changesB
		});
	}

	// Expand ranges by context (callers clamp to document length)
	return raw.map((hunk) => {
		const hasA = hunk.startLineA > 0;
		const hasB = hunk.startLineB > 0;
		return {
			...hunk,
			startLineA: hasA ? Math.max(1, hunk.startLineA - ctx) : 0,
			endLineA: hasA ? hunk.endLineA + ctx : 0,
			startLineB: hasB ? Math.max(1, hunk.startLineB - ctx) : 0,
			endLineB: hasB ? hunk.endLineB + ctx : 0
		};
	});
}

/**
 * Build a classic unified view sequence from two texts.
 * Unchanged context appears once; modified lines are emitted as removed then added
 * with wordDiffs attached when useful.
 *
 * When `options.contextLines` is set, far-away context is collapsed (only that many
 * context lines around each change, git unified style). Omit it for the full sequence.
 */
export function buildUnifiedLines(
	textA: string,
	textB: string,
	options?: DiffViewOptions
): UnifiedDiffLine[] {
	const full = buildFullUnifiedLines(textA, textB);
	if (options?.contextLines === undefined) {
		return full;
	}
	return collapseUnifiedContext(full, Math.max(0, options.contextLines));
}

function buildFullUnifiedLines(textA: string, textB: string): UnifiedDiffLine[] {
	if (textA === textB) {
		// Preserve trailing empty line semantics of split
		const all = textA === '' ? [] : textA.split('\n');
		return all.map((content, idx) => ({
			kind: 'context' as const,
			lineNumberA: idx + 1,
			lineNumberB: idx + 1,
			content
		}));
	}

	const result = diffLines(textA, textB);
	const rows: UnifiedDiffLine[] = [];
	let lineA = 0;
	let lineB = 0;
	let i = 0;

	while (i < result.length) {
		const part = result[i];
		const chunk = part.value.endsWith('\n')
			? part.value.slice(0, -1).split('\n')
			: part.value.split('\n');

		if (!part.added && !part.removed) {
			for (const content of chunk) {
				lineA += 1;
				lineB += 1;
				rows.push({
					kind: 'context',
					lineNumberA: lineA,
					lineNumberB: lineB,
					content
				});
			}
			i += 1;
			continue;
		}

		if (part.removed) {
			const nextPart = result[i + 1];
			if (nextPart && nextPart.added) {
				const removedLines = chunk;
				const addedChunk = nextPart.value.endsWith('\n')
					? nextPart.value.slice(0, -1).split('\n')
					: nextPart.value.split('\n');

				const maxLen = Math.max(removedLines.length, addedChunk.length);
				for (let j = 0; j < maxLen; j++) {
					if (j < removedLines.length && j < addedChunk.length) {
						const wordDiffs = computeWordDiffForLine(removedLines[j], addedChunk[j]);
						const hasChanges = wordDiffs.some((w) => w.type !== 'unchanged');
						lineA += 1;
						rows.push({
							kind: hasChanges ? 'removed' : 'context',
							lineNumberA: lineA,
							content: removedLines[j],
							wordDiffs: hasChanges
								? wordDiffs.filter((w) => w.type !== 'added')
								: undefined
						});
						// Prefer classic removed+added for any change
						if (hasChanges) {
							lineB += 1;
							rows.push({
								kind: 'added',
								lineNumberB: lineB,
								content: addedChunk[j],
								wordDiffs: wordDiffs.filter((w) => w.type !== 'removed')
							});
						} else {
							// rewrite last as context with both numbers
							const last = rows[rows.length - 1];
							lineB += 1;
							last.kind = 'context';
							last.lineNumberB = lineB;
						}
					} else if (j < removedLines.length) {
						lineA += 1;
						rows.push({
							kind: 'removed',
							lineNumberA: lineA,
							content: removedLines[j]
						});
					} else {
						lineB += 1;
						rows.push({
							kind: 'added',
							lineNumberB: lineB,
							content: addedChunk[j]
						});
					}
				}
				i += 2;
				continue;
			}

			for (const content of chunk) {
				lineA += 1;
				rows.push({
					kind: 'removed',
					lineNumberA: lineA,
					content
				});
			}
			i += 1;
			continue;
		}

		if (part.added) {
			for (const content of chunk) {
				lineB += 1;
				rows.push({
					kind: 'added',
					lineNumberB: lineB,
					content
				});
			}
			i += 1;
			continue;
		}

		i += 1;
	}

	return rows;
}

function collapseUnifiedContext(
	full: UnifiedDiffLine[],
	contextLines: number
): UnifiedDiffLine[] {
	if (full.length === 0) {
		return [];
	}

	const changeIndices: number[] = [];
	for (let idx = 0; idx < full.length; idx++) {
		if (full[idx].kind !== 'context') {
			changeIndices.push(idx);
		}
	}

	if (changeIndices.length === 0) {
		return full;
	}

	const include = new Array<boolean>(full.length).fill(false);
	for (const ci of changeIndices) {
		const from = Math.max(0, ci - contextLines);
		const to = Math.min(full.length - 1, ci + contextLines);
		for (let idx = from; idx <= to; idx++) {
			include[idx] = true;
		}
	}

	const out: UnifiedDiffLine[] = [];
	for (let idx = 0; idx < full.length; idx++) {
		if (include[idx]) {
			out.push(full[idx]);
		}
	}
	return out;
}

/**
 * Unified rows with collapsed context: only `contextLines` around each change
 * hunk, with separator rows for omitted regions (git-style).
 */
export function buildUnifiedRows(
	textA: string,
	textB: string,
	contextLines: number = DEFAULT_CONTEXT_LINES
): UnifiedRow[] {
	// Full sequence first so separators can describe omitted ranges
	const full = buildFullUnifiedLines(textA, textB);
	if (full.length === 0) {
		return [];
	}

	// Mark which indices are "interesting" (non-context)
	const interesting = full.map((row) => row.kind !== 'context');
	if (!interesting.some(Boolean)) {
		// Identical files: show all as context, no separators
		return full;
	}

	const keep = new Array(full.length).fill(false);
	for (let idx = 0; idx < full.length; idx++) {
		if (!interesting[idx]) {
			continue;
		}
		const from = Math.max(0, idx - contextLines);
		const to = Math.min(full.length - 1, idx + contextLines);
		for (let k = from; k <= to; k++) {
			keep[k] = true;
		}
	}

	const rows: UnifiedRow[] = [];
	let i = 0;
	while (i < full.length) {
		if (keep[i]) {
			rows.push(full[i]);
			i += 1;
			continue;
		}

		// Omitted run
		const start = i;
		while (i < full.length && !keep[i]) {
			i += 1;
		}
		const omitted = i - start;
		const first = full[start];
		const last = full[i - 1];
		const fromA = first.lineNumberA ?? 0;
		const toA = last.lineNumberA ?? fromA;
		const fromB = first.lineNumberB ?? 0;
		const toB = last.lineNumberB ?? fromB;
		rows.push({
			kind: 'separator',
			omitted,
			header: `@@ -${fromA},${Math.max(0, toA - fromA + 1)} +${fromB},${Math.max(0, toB - fromB + 1)} @@`,
			expandFromA: fromA,
			expandToA: toA,
			expandFromB: fromB,
			expandToB: toB
		});
	}

	return rows;
}

