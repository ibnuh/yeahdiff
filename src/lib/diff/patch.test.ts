import { describe, expect, it } from 'vitest';
import { buildUnifiedPatch } from './patch.js';

describe('buildUnifiedPatch', () => {
	it('returns a patch with file headers for differing texts', () => {
		const patch = buildUnifiedPatch('hello\n', 'hello world\n', {
			fileA: 'left.txt',
			fileB: 'right.txt',
			contextLines: 1
		});
		expect(patch).toContain('--- left.txt');
		expect(patch).toContain('+++ right.txt');
		expect(patch).toMatch(/@@/);
		expect(patch).toContain('-hello');
		expect(patch).toContain('+hello world');
	});

	it('uses default a/b file names', () => {
		const patch = buildUnifiedPatch('a\n', 'b\n');
		expect(patch).toContain('--- a');
		expect(patch).toContain('+++ b');
	});

	it('produces empty body for identical texts', () => {
		const patch = buildUnifiedPatch('same\n', 'same\n');
		// jsdiff still emits headers; no change hunks
		expect(patch).not.toMatch(/^-same/m);
		expect(patch).not.toMatch(/^\+same/m);
	});
});
