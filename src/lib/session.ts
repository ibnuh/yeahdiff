import { paneStore } from './stores/panes.svelte.js';
import { settings } from './stores/settings.svelte.js';

interface SessionData {
	version: number;
	panes: Array<{
		content: string;
		language: string | null;
	}>;
	settings: {
		diffMode: 'base' | 'adjacent';
		alignedDiff: boolean;
		syncScroll: boolean;
		wordWrap: boolean;
	};
}

export function exportSession(): string {
	const data: SessionData = {
		version: 1,
		panes: paneStore.panes.map(p => ({
			content: p.content,
			language: p.manualLanguage || p.detectedLanguage
		})),
		settings: {
			diffMode: settings.diffMode,
			alignedDiff: settings.alignedDiff,
			syncScroll: settings.syncScroll,
			wordWrap: settings.wordWrap
		}
	};
	return JSON.stringify(data, null, 2);
}

export function downloadSession() {
	const json = exportSession();
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `yeahdiff-session-${new Date().toISOString().slice(0, 10)}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export async function importSession(file: File): Promise<boolean> {
	try {
		const text = await file.text();
		const data: SessionData = JSON.parse(text);
		
		if (!data.panes || !Array.isArray(data.panes)) {
			throw new Error('Invalid session file');
		}
		
		// Clear existing panes
		while (paneStore.count > 0) {
			paneStore.removePane(paneStore.panes[0].id);
		}
		
		// Add panes from session
		data.panes.forEach((paneData, index) => {
			paneStore.addPane();
			const newPane = paneStore.panes[index];
			if (newPane) {
				paneStore.updateContent(newPane.id, paneData.content);
				if (paneData.language) {
					paneStore.setManualLanguage(newPane.id, paneData.language);
				}
			}
		});
		
		// Apply settings if present
		if (data.settings) {
			if (data.settings.diffMode) {
				settings.setDiffMode(data.settings.diffMode);
			}
			if (data.settings.alignedDiff !== undefined) {
				settings.alignedDiff = data.settings.alignedDiff;
			}
			if (data.settings.syncScroll !== undefined) {
				settings.syncScroll = data.settings.syncScroll;
			}
			if (data.settings.wordWrap !== undefined) {
				settings.wordWrap = data.settings.wordWrap;
			}
		}
		
		return true;
	} catch (err) {
		console.error('Failed to import session:', err);
		return false;
	}
}
