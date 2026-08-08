import { describe, expect, it } from 'vitest';
import {
	buildUnifiedLines,
	buildUnifiedRows,
	computeAlignedPair,
	computePairwiseDiffs,
	getChangeAnchors,
	summarizeDiff
} from './engine.js';

describe('computeAlignedPair', () => {
	it('returns empty changes for identical texts', () => {
		const pair = computeAlignedPair('a\nb\n', 'a\nb\n');
		expect(pair.changesA).toEqual([]);
		expect(pair.changesB).toEqual([]);
		expect(pair.paddingA).toEqual([]);
		expect(pair.paddingB).toEqual([]);
	});

	it('marks simple add on B and remove on A', () => {
		const pair = computeAlignedPair('line1\nline2\n', 'line1\nline2\nline3\n');
		expect(pair.changesA.some((c) => c.type === 'removed')).toBe(false);
		expect(pair.changesB.some((c) => c.type === 'added')).toBe(true);
		expect(pair.changesB.find((c) => c.type === 'added')?.content).toBe('line3');
	});

	it('marks simple remove on A when line deleted from B', () => {
		const pair = computeAlignedPair('line1\nline2\nline3\n', 'line1\nline3\n');
		expect(pair.changesA.some((c) => c.type === 'removed')).toBe(true);
		expect(pair.changesA.find((c) => c.type === 'removed')?.content).toBe('line2');
		expect(pair.changesB.some((c) => c.type === 'added')).toBe(false);
	});

	it('marks modifications on both sides', () => {
		const pair = computeAlignedPair('hello world\n', 'hello there\n');
		const modA = pair.changesA.find((c) => c.type === 'modified');
		const modB = pair.changesB.find((c) => c.type === 'modified');
		expect(modA).toBeDefined();
		expect(modB).toBeDefined();
		expect(modA?.side).toBe('base');
		expect(modB?.side).toBe('target');
	});
});

describe('computePairwiseDiffs', () => {
	it('base mode paints both base and target panes', () => {
		const texts = ['old line\n', 'new line\n', 'other\n'];
		const results = computePairwiseDiffs(texts, 'base', 0, false);

		expect(results.has(0)).toBe(true);
		expect(results.has(1)).toBe(true);
		expect(results.has(2)).toBe(true);

		const base = results.get(0)!;
		const target = results.get(1)!;
		expect(base.changes.some((c) => c.type === 'modified' || c.type === 'removed')).toBe(true);
		expect(target.changes.some((c) => c.type === 'modified' || c.type === 'added')).toBe(true);
	});

	it('adjacent mode compares neighbors', () => {
		const texts = ['a\n', 'b\n', 'c\n'];
		const results = computePairwiseDiffs(texts, 'adjacent', 0, false);
		expect(results.get(0)?.changes.length).toBeGreaterThan(0);
		expect(results.get(1)?.changes.length).toBeGreaterThan(0);
	});
});

describe('buildUnifiedLines', () => {
	it('emits removed then added for modifications', () => {
		const lines = buildUnifiedLines('alpha\n', 'beta\n');
		const kinds = lines.map((l) => l.kind);
		const removedIdx = kinds.indexOf('removed');
		const addedIdx = kinds.indexOf('added');
		expect(removedIdx).toBeGreaterThanOrEqual(0);
		expect(addedIdx).toBeGreaterThan(removedIdx);
		expect(lines[removedIdx].content).toBe('alpha');
		expect(lines[addedIdx].content).toBe('beta');
	});

	it('returns context only for identical texts', () => {
		const lines = buildUnifiedLines('same\n', 'same\n');
		expect(lines.every((l) => l.kind === 'context')).toBe(true);
	});
});

describe('buildUnifiedRows', () => {
	it('collapses large unchanged middle with separators', () => {
		const middle = Array.from({ length: 40 }, (_, i) => `unchanged ${i}`).join('\n');
		const textA = `head A\n${middle}\ntail A`;
		const textB = `head B\n${middle}\ntail B`;
		const rows = buildUnifiedRows(textA, textB, 3);

		const separators = rows.filter((r) => r.kind === 'separator');
		expect(separators.length).toBeGreaterThan(0);
		expect(rows.some((r) => r.kind === 'removed' || r.kind === 'added')).toBe(true);
		// Collapsed output should be much shorter than full file
		expect(rows.length).toBeLessThan(textA.split('\n').length);
	});
});

describe('getChangeAnchors', () => {
	it('returns sorted unique line numbers', () => {
		const texts = ['a\nb\nc\n', 'a\nB\nc\nX\n'];
		const results = computePairwiseDiffs(texts, 'base', 0, false);
		const anchors = getChangeAnchors(results, 1);
		const sorted = [...anchors].sort((a, b) => a - b);
		expect(anchors).toEqual(sorted);
		expect(new Set(anchors).size).toBe(anchors.length);
		expect(anchors.length).toBeGreaterThan(0);
	});
});

describe('summarizeDiff', () => {
	it('counts added, removed, and modified lines', () => {
		const stats = summarizeDiff([
			{ type: 'added', lineNumber: 1, content: 'x' },
			{ type: 'added', lineNumber: 2, content: 'y' },
			{ type: 'removed', lineNumber: 3, content: 'z' },
			{ type: 'modified', lineNumber: 4, content: 'm' },
			{ type: 'unchanged', lineNumber: 5, content: 'u' }
		]);
		expect(stats).toEqual({ added: 2, removed: 1, modified: 1 });
	});
});
