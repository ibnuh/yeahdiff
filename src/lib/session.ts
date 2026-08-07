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
		panes: paneStore.panes.map((p) => ({
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

export async function importSession(file: File): Promise<{ ok: boolean; error?: string }> {
	try {
		const text = await file.text();
		const data: SessionData = JSON.parse(text);

		if (!data.panes || !Array.isArray(data.panes) || data.panes.length === 0) {
			return { ok: false, error: 'Invalid session file: missing panes' };
		}

		// Atomic replace avoids the min-2-pane guard on removePane
		paneStore.replaceAll(
			data.panes.map((paneData) => ({
				content: paneData.content ?? '',
				manualLanguage: paneData.language ?? null
			}))
		);

		if (data.settings) {
			if (data.settings.diffMode) {
				settings.setDiffMode(data.settings.diffMode);
			}
			if (data.settings.alignedDiff !== undefined) {
				settings.setAlignedDiff(data.settings.alignedDiff);
			}
			if (data.settings.syncScroll !== undefined) {
				settings.setSyncScroll(data.settings.syncScroll);
			}
			if (data.settings.wordWrap !== undefined) {
				settings.setWordWrap(data.settings.wordWrap);
			}
		}

		return { ok: true };
	} catch (err) {
		console.error('Failed to import session:', err);
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Failed to import session'
		};
	}
}
