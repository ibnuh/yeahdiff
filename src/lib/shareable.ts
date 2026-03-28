import { paneStore } from './stores/panes.svelte.js';

export function encodeStateToHash(): string {
	const panes = paneStore.panes.map(p => ({
		content: p.content,
		lang: p.manualLanguage || p.detectedLanguage
	}));
	
	const state = JSON.stringify(panes);
	const compressed = btoa(unescape(encodeURIComponent(state)));
	return compressed;
}

export function decodeStateFromHash(hash: string): Array<{content: string; lang?: string}> | null {
	try {
		const decoded = decodeURIComponent(escape(atob(hash)));
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

export function copyShareableUrl() {
	const hash = encodeStateToHash();
	const url = `${window.location.origin}${window.location.pathname}#${hash}`;
	navigator.clipboard.writeText(url);
}

export function loadFromHash() {
	const hash = window.location.hash.slice(1);
	if (!hash) return false;
	
	const state = decodeStateFromHash(hash);
	if (!state || state.length === 0) return false;
	
	// Clear existing panes
	while (paneStore.count > 0) {
		paneStore.removePane(paneStore.panes[0].id);
	}
	
	// Add panes from hash
	state.forEach((pane, index) => {
		paneStore.addPane();
		const newPane = paneStore.panes[index];
		if (newPane) {
			paneStore.updateContent(newPane.id, pane.content);
			if (pane.lang) {
				paneStore.setManualLanguage(newPane.id, pane.lang);
			}
		}
	});
	
	return true;
}
