import { diffLines, diffWords } from 'diff';
import type { DiffResult, LineDiff, WordDiff, DiffMode } from './types.js';

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

export function computePairwiseDiffs(
	texts: string[],
	mode: DiffMode,
	baseIndex: number
): Map<number, DiffResult> {
	const results = new Map<number, DiffResult>();

	if (mode === 'base') {
		const baseText = texts[baseIndex] ?? '';
		for (let i = 0; i < texts.length; i++) {
			if (i === baseIndex) continue;
			const changes = computeDiffBetweenTexts(baseText, texts[i]);
			results.set(i, {
				paneIndex: i,
				basePaneIndex: baseIndex,
				changes
			});
		}
	} else {
		for (let i = 0; i < texts.length - 1; i++) {
			const changes = computeDiffBetweenTexts(texts[i], texts[i + 1]);
			results.set(i + 1, {
				paneIndex: i + 1,
				basePaneIndex: i,
				changes
			});
		}
	}

	return results;
}
