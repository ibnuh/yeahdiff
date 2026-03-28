import { diffLines, diffWords } from 'diff';
import type { DiffResult, LineDiff, WordDiff, DiffMode, PaddingEntry } from './types.js';
import { shouldSkipDiff, MAX_DIFF_LINES } from '../large-file-utils.js';

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

interface AlignedPairResult {
	changesA: LineDiff[];
	changesB: LineDiff[];
	paddingA: PaddingEntry[];
	paddingB: PaddingEntry[];
}

function computeAlignedPair(textA: string, textB: string): AlignedPairResult {
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

export function computePairwiseDiffs(
	texts: string[],
	mode: DiffMode,
	baseIndex: number,
	aligned: boolean = false
): Map<number, DiffResult> {
	const results = new Map<number, DiffResult>();
	
	// Check if any file is too large for diff computation
	const totalLines = texts.reduce((sum, text) => sum + text.split('\n').length, 0);
	if (shouldSkipDiff(totalLines)) {
		// Return empty results for large files
		for (let i = 0; i < texts.length; i++) {
			results.set(i, { paneIndex: i, basePaneIndex: baseIndex, changes: [], padding: [] });
		}
		return results;
	}

	if (!aligned) {
		if (mode === 'base') {
			const baseText = texts[baseIndex] ?? '';
			for (let i = 0; i < texts.length; i++) {
				if (i === baseIndex) continue;
				const changes = computeDiffBetweenTexts(baseText, texts[i]);
				results.set(i, { paneIndex: i, basePaneIndex: baseIndex, changes, padding: [] });
			}
		} else {
			for (let i = 0; i < texts.length - 1; i++) {
				const changes = computeDiffBetweenTexts(texts[i], texts[i + 1]);
				results.set(i + 1, { paneIndex: i + 1, basePaneIndex: i, changes, padding: [] });
			}
		}
		return results;
	}

	if (mode === 'base') {
		const baseText = texts[baseIndex] ?? '';
		let basePairDone = false;

		for (let i = 0; i < texts.length; i++) {
			if (i === baseIndex) continue;
			const pair = computeAlignedPair(baseText, texts[i]);

			results.set(i, {
				paneIndex: i,
				basePaneIndex: baseIndex,
				changes: pair.changesB,
				padding: pair.paddingB
			});

			if (!basePairDone) {
				results.set(baseIndex, {
					paneIndex: baseIndex,
					basePaneIndex: baseIndex,
					changes: pair.changesA,
					padding: pair.paddingA
				});
				basePairDone = true;
			}
		}
	} else {
		for (let i = 0; i < texts.length - 1; i++) {
			const pair = computeAlignedPair(texts[i], texts[i + 1]);

			if (!results.has(i)) {
				results.set(i, {
					paneIndex: i,
					basePaneIndex: i,
					changes: pair.changesA,
					padding: pair.paddingA
				});
			}

			results.set(i + 1, {
				paneIndex: i + 1,
				basePaneIndex: i,
				changes: pair.changesB,
				padding: pair.paddingB
			});
		}
	}

	return results;
}
