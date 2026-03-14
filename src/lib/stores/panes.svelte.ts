export interface PaneData {
	id: string;
	content: string;
	detectedLanguage: string | null;
	manualLanguage: string | null;
}

let nextId = 0;

function createId(): string {
	return `pane-${nextId++}`;
}

class PaneStore {
	panes = $state<PaneData[]>([
		{ id: createId(), content: '', detectedLanguage: null, manualLanguage: null },
		{ id: createId(), content: '', detectedLanguage: null, manualLanguage: null }
	]);

	count = $derived(this.panes.length);

	addPane() {
		this.panes.push({
			id: createId(),
			content: '',
			detectedLanguage: null,
			manualLanguage: null
		});
	}

	setManualLanguage(id: string, language: string | null) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			pane.manualLanguage = language;
		}
	}

	removePane(id: string) {
		if (this.panes.length <= 2) return;
		const index = this.panes.findIndex((p) => p.id === id);
		if (index !== -1) {
			this.panes.splice(index, 1);
		}
	}

	indexOf(id: string): number {
		return this.panes.findIndex((p) => p.id === id);
	}

	updateContent(id: string, content: string) {
		const pane = this.panes.find((p) => p.id === id);
		if (pane) {
			pane.content = content;
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
