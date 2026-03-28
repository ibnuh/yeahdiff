import { paneStore } from './stores/panes.svelte.js';

export function encodeStateToHash(): string {
	const panes = paneStore.panes.map(p => ({
		content: p.content,
		lang: p.manualLanguage || p.detectedLanguage
	}));
	
	const state = JSON.stringify(panes);
	// Use TextEncoder for proper UTF-8 handling
	const encoder = new TextEncoder();
	const data = encoder.encode(state);
	// Convert to base64url (URL-safe)
	const base64 = btoa(String.fromCharCode(...data));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeStateFromHash(hash: string): Array<{content: string; lang?: string}> | null {
	try {
		// Restore base64 padding and characters
		let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
		while (base64.length % 4) {
			base64 += '=';
		}
		
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		
		const decoder = new TextDecoder();
		const state = decoder.decode(bytes);
		return JSON.parse(state);
	} catch (err) {
		console.error('Failed to decode hash:', err);
		return null;
	}
}

export function copyShareableUrl() {
	const hash = encodeStateToHash();
	const url = `${window.location.origin}${window.location.pathname}#${hash}`;
	navigator.clipboard.writeText(url);
}

export async function loadFromHash(): Promise<boolean> {
	const hash = window.location.hash.slice(1);
	if (!hash) return false;
	
	const state = decodeStateFromHash(hash);
	if (!state || state.length === 0) {
		console.warn('No valid state found in hash');
		return false;
	}
	
	console.log('Loading state from hash:', state.length, 'panes');
	
	// Store pane IDs to remove
	const idsToRemove = paneStore.panes.map(p => p.id);
	
	// First, update existing panes or create new ones
	for (let i = 0; i < state.length; i++) {
		const paneData = state[i];
		
		if (i < paneStore.panes.length) {
			// Update existing pane
			const existingPane = paneStore.panes[i];
			paneStore.updateContent(existingPane.id, paneData.content);
			if (paneData.lang) {
				paneStore.setManualLanguage(existingPane.id, paneData.lang);
			}
		} else {
			// Add new pane
			paneStore.addPane();
			const newPane = paneStore.panes[paneStore.panes.length - 1];
			if (newPane) {
				paneStore.updateContent(newPane.id, paneData.content);
				if (paneData.lang) {
					paneStore.setManualLanguage(newPane.id, paneData.lang);
				}
			}
		}
	}
	
	// Remove excess panes if we loaded fewer than existing
	while (paneStore.panes.length > state.length) {
		const lastPane = paneStore.panes[paneStore.panes.length - 1];
		if (lastPane) {
			paneStore.removePane(lastPane.id);
		}
	}
	
	return true;
}
