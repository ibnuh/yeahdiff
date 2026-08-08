export type ShareablePane = {
	content: string;
	lang?: string | null;
	label?: string | null;
};

export function bytesToBase64Url(data: Uint8Array): string {
	// Chunk to avoid call-stack limits from String.fromCharCode(...largeArray)
	const chunkSize = 0x8000;
	let binary = '';
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64UrlToBytes(hash: string): Uint8Array {
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

function panePayload(panes: ShareablePane[]): string {
	return JSON.stringify(
		panes.map((p) => {
			const entry: { content: string; lang?: string; label?: string | null } = {
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
}

/** Pure sync encode of pane state to a URL-safe base64 hash (uncompressed, no window). */
export function encodePanesToHash(panes: ShareablePane[]): string {
	const encoder = new TextEncoder();
	return bytesToBase64Url(encoder.encode(panePayload(panes)));
}

/** Pure sync decode of uncompressed hash payload. */
export function decodePanesFromHash(
	hash: string
): Array<{ content: string; lang?: string; label?: string | null }> | null {
	if (!hash) {
		return null;
	}
	try {
		const bytes = base64UrlToBytes(hash);
		const decoder = new TextDecoder();
		const state = decoder.decode(bytes);
		return JSON.parse(state);
	} catch {
		return null;
	}
}
