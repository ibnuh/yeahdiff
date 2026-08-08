import { paneStore } from './stores/panes.svelte.js';
import {
	base64UrlToBytes,
	bytesToBase64Url,
	encodePanesToHash,
	type ShareablePane
} from './shareable-codec.js';

export type { ShareablePane } from './shareable-codec.js';
export { encodePanesToHash } from './shareable-codec.js';

const MAX_URL_LENGTH = 8000; // Browser limit is typically around 8000-10000 chars
const COMPRESSED_PREFIX = 'v2.';

function supportsCompression(): boolean {
	return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

async function gzipCompress(data: Uint8Array): Promise<Uint8Array> {
	const copy = new Uint8Array(data.byteLength);
	copy.set(data);
	const stream = new Blob([copy]).stream().pipeThrough(new CompressionStream('gzip'));
	const buffer = await new Response(stream).arrayBuffer();
	return new Uint8Array(buffer);
}

async function gzipDecompress(data: Uint8Array): Promise<Uint8Array> {
	const copy = new Uint8Array(data.byteLength);
	copy.set(data);
	const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('gzip'));
	const buffer = await new Response(stream).arrayBuffer();
	return new Uint8Array(buffer);
}

export type ShareEncodeResult = {
	hash: string;
	url: string;
	tooLong: boolean;
	byteLength: number;
};

export async function encodeStateToHash(): Promise<ShareEncodeResult> {
	const panes: ShareablePane[] = paneStore.panes.map((p) => ({
		content: p.content,
		lang: p.manualLanguage || p.detectedLanguage,
		label: p.label ?? null
	}));

	const state = JSON.stringify(
		panes.map((p) => {
			const entry: { content: string; lang?: string | null; label?: string | null } = {
				content: p.content
			};
			if (p.lang != null && p.lang !== '') {
				entry.lang = p.lang;
			}
			if (p.label != null) {
				entry.label = p.label;
			}
			return entry;
		})
	);
	const encoder = new TextEncoder();
	const data = encoder.encode(state);

	let payloadLength = data.length;
	let hash = encodePanesToHash(panes);

	if (supportsCompression()) {
		try {
			const compressed = await gzipCompress(data);
			// Prefer compressed when it shrinks the payload
			if (compressed.length < data.length) {
				payloadLength = compressed.length;
				hash = COMPRESSED_PREFIX + bytesToBase64Url(compressed);
			}
		} catch {
			// Fall back to uncompressed payload
		}
	}

	const url = `${window.location.origin}${window.location.pathname}#${hash}`;
	const tooLong = url.length > MAX_URL_LENGTH;

	if (tooLong) {
		console.error('URL too long, share may not work properly');
	}

	return { hash, url, tooLong, byteLength: payloadLength };
}

export async function decodeStateFromHash(
	hash: string
): Promise<Array<{ content: string; lang?: string; label?: string | null }> | null> {
	if (!hash) {
		return null;
	}
	try {
		let bytes: Uint8Array;
		if (hash.startsWith(COMPRESSED_PREFIX)) {
			const raw = base64UrlToBytes(hash.slice(COMPRESSED_PREFIX.length));
			if (!supportsCompression()) {
				return null;
			}
			bytes = await gzipDecompress(raw);
		} else {
			bytes = base64UrlToBytes(hash);
		}
		const decoder = new TextDecoder();
		const state = decoder.decode(bytes);
		return JSON.parse(state);
	} catch {
		return null;
	}
}

export async function copyShareableUrl(): Promise<{ ok: boolean; tooLong: boolean }> {
	const { url, tooLong } = await encodeStateToHash();
	try {
		await navigator.clipboard.writeText(url);
		return { ok: true, tooLong };
	} catch {
		return { ok: false, tooLong };
	}
}

export async function loadFromHash(): Promise<boolean> {
	const hash = window.location.hash.slice(1);
	if (!hash) {
		return false;
	}

	const state = await decodeStateFromHash(hash);
	if (!state || state.length === 0) {
		return false;
	}

	paneStore.replaceAll(
		state.map((paneData) => ({
			content: paneData.content,
			manualLanguage: paneData.lang ?? null,
			label: paneData.label ?? null
		}))
	);

	return true;
}
