import { describe, expect, it } from 'vitest';
import {
	decodePanesFromHash,
	encodePanesToHash,
	type ShareablePane
} from './shareable-codec.js';

describe('shareable encode/decode', () => {
	it('roundtrips pane state through hash encoding', () => {
		const panes: ShareablePane[] = [
			{ content: 'hello world', lang: 'javascript' },
			{ content: 'hello there\nline 2', lang: 'typescript' }
		];
		const hash = encodePanesToHash(panes);
		expect(hash.length).toBeGreaterThan(0);
		expect(hash).not.toMatch(/[+/=]/);

		const decoded = decodePanesFromHash(hash);
		expect(decoded).toEqual([
			{ content: 'hello world', lang: 'javascript' },
			{ content: 'hello there\nline 2', lang: 'typescript' }
		]);
	});

	it('handles empty content and missing lang', () => {
		const panes: ShareablePane[] = [{ content: '' }, { content: 'x' }];
		const hash = encodePanesToHash(panes);
		const decoded = decodePanesFromHash(hash);
		expect(decoded).toEqual([{ content: '' }, { content: 'x' }]);
	});

	it('returns null for invalid hash', () => {
		expect(decodePanesFromHash('%%%not-valid%%%')).toBeNull();
		expect(decodePanesFromHash('')).toBeNull();
	});

	it('roundtrips unicode content', () => {
		const panes: ShareablePane[] = [{ content: 'こんにちは 🎉\nemoji', lang: 'text' }];
		const decoded = decodePanesFromHash(encodePanesToHash(panes));
		expect(decoded).toEqual(panes);
	});

	it('roundtrips optional labels', () => {
		const panes: ShareablePane[] = [
			{ content: 'a', lang: 'js', label: 'Original' },
			{ content: 'b', label: null }
		];
		const decoded = decodePanesFromHash(encodePanesToHash(panes));
		expect(decoded?.[0]).toMatchObject({ content: 'a', lang: 'js', label: 'Original' });
		expect(decoded?.[1]).toMatchObject({ content: 'b' });
	});
});
