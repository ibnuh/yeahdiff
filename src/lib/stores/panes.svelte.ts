import { loadFromStorage, saveToStorage } from './storage.js';

export interface PaneData {
	id: string;
	content: string;
	detectedLanguage: string | null;
	manualLanguage: string | null;
	label: string | null;
}

interface SavedPane {
	content: string;
	manualLanguage: string | null;
	label?: string | null;
}

export type PaneInput = {
	content?: string;
	manualLanguage?: string | null;
	label?: string | null;
};

let nextId = 0;

function createId(): string {
	return `pane-${nextId++}`;
}

function createPane(
	content = '',
	manualLanguage: string | null = null,
	label: string | null = null
): PaneData {
	return { id: createId(), content, detectedLanguage: null, manualLanguage, label };
}

class PaneStore {
	panes = $state<PaneData[]>(this.loadPanes());
	private saveTimeout: ReturnType<typeof setTimeout> | null = null;

	count = $derived(this.panes.length);

	private loadPanes(): PaneData[] {
		const saved = loadFromStorage<SavedPane[]>('yeahdiff-panes', []);
		if (saved.length >= 2) {
			return saved.map((s) => createPane(s.content, s.manualLanguage, s.label ?? null));
		}
		return [createPane(), createPane()];
	}

	private scheduleSave() {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = setTimeout(() => {
			const data: SavedPane[] = this.panes.map((p) => ({
				content: p.content,
				manualLanguage: p.manualLanguage,
				label: p.label
			}));
			saveToStorage('yeahdiff-panes', data);
		}, 500);
	}

	addPane(content = '', manualLanguage: string | null = null, label: string | null = null) {
		this.panes.push(createPane(content, manualLanguage, label));
		this.scheduleSave();
	}

	/** Replace all panes at once (session import / shareable load). */
	replaceAll(items: Array<PaneInput>) {
		const next =
			items.length >= 2
				? items.map((item) =>
						createPane(item.content ?? '', item.manualLanguage ?? null, item.label ?? null)
					)
				: [createPane(), createPane()];
		this.panes = next;
		this.scheduleSave();
	}

	setManualLanguage(id: string, language: string | null) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			pane.manualLanguage = language;
			this.scheduleSave();
		}
	}

	setLabel(id: string, label: string | null) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			const trimmed = label?.trim() ?? '';
			pane.label = trimmed.length > 0 ? trimmed : null;
			this.scheduleSave();
		}
	}

	removePane(id: string) {
		if (this.panes.length <= 2) {
			return;
		}
		const index = this.panes.findIndex((p) => p.id === id);
		if (index !== -1) {
			this.panes.splice(index, 1);
			this.scheduleSave();
		}
	}

	indexOf(id: string): number {
		return this.panes.findIndex((p) => p.id === id);
	}

	updateContent(id: string, content: string) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			pane.content = content;
			this.scheduleSave();
		}
	}

	setDetectedLanguage(id: string, language: string | null) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			pane.detectedLanguage = language;
		}
	}

	getTexts(): string[] {
		return this.panes.map((p) => p.content);
	}
}

export const paneStore = new PaneStore();
