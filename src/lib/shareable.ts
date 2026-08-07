import { paneStore } from './stores/panes.svelte.js';

const MAX_URL_LENGTH = 8000; // Browser limit is typically around 8000-10000 chars

function bytesToBase64Url(data: Uint8Array): string {
	// Chunk to avoid call-stack limits from String.fromCharCode(...largeArray)
	const chunkSize = 0x8000;
	let binary = '';
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlToBytes(hash: string): Uint8Array {
	let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export type ShareEncodeResult = {
	hash: string;
	url: string;
	tooLong: boolean;
	byteLength: number;
};

export function encodeStateToHash(): ShareEncodeResult {
	const panes = paneStore.panes.map((p) => ({
		content: p.content,
		lang: p.manualLanguage || p.detectedLanguage
	}));

	const state = JSON.stringify(panes);
	const encoder = new TextEncoder();
	const data = encoder.encode(state);
	const hash = bytesToBase64Url(data);
	const url = `${window.location.origin}${window.location.pathname}#${hash}`;
	const tooLong = url.length > MAX_URL_LENGTH;

	if (state.length > 5000) {
		console.warn('Content is large, URL may exceed browser limits');
	}
	if (tooLong) {
		console.error('URL too long, share may not work properly');
	}

	return { hash, url, tooLong, byteLength: data.length };
}

export function decodeStateFromHash(
	hash: string
): Array<{ content: string; lang?: string }> | null {
	try {
		const bytes = base64UrlToBytes(hash);
		const decoder = new TextDecoder();
		const state = decoder.decode(bytes);
		return JSON.parse(state);
	} catch {
		return null;
	}
}

export async function copyShareableUrl(): Promise<{ ok: boolean; tooLong: boolean }> {
	const { url, tooLong } = encodeStateToHash();
	try {
		await navigator.clipboard.writeText(url);
		return { ok: true, tooLong };
	} catch {
		return { ok: false, tooLong };
	}
}

export async function loadFromHash(): Promise<boolean> {
	const hash = window.location.hash.slice(1);
	if (!hash) return false;

	const state = decodeStateFromHash(hash);
	if (!state || state.length === 0) {
		return false;
	}

	paneStore.replaceAll(
		state.map((paneData) => ({
			content: paneData.content,
			manualLanguage: paneData.lang ?? null
		}))
	);

	return true;
}
