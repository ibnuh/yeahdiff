import type { DiffMode } from '../diff/types.js';

function loadFromStorage<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const stored = localStorage.getItem(key);
		if (stored !== null) return JSON.parse(stored) as T;
	} catch {}
	return fallback;
}

function saveToStorage(key: string, value: unknown): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}

class Settings {
	theme = $state<'light' | 'dark' | 'system'>('system');
	fullWidth = $state(true);
	syncScroll = $state(true);
	wordWrap = $state(false);
	diffMode = $state<DiffMode>('base');
	baseIndex = $state(0);

	isDark = $derived.by(() => {
		if (this.theme === 'system') {
			if (typeof window === 'undefined') return false;
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		return this.theme === 'dark';
	});

	constructor() {
		if (typeof window !== 'undefined') {
			this.theme = loadFromStorage('yeahdiff-theme', 'system');
			this.fullWidth = loadFromStorage('yeahdiff-fullWidth', true);
			this.syncScroll = loadFromStorage('yeahdiff-syncScroll', true);
			this.wordWrap = loadFromStorage('yeahdiff-wordWrap', false);
			this.diffMode = loadFromStorage('yeahdiff-diffMode', 'base' as DiffMode);
		}
	}

	setTheme(value: 'light' | 'dark' | 'system') {
		this.theme = value;
		saveToStorage('yeahdiff-theme', value);
	}

	toggleFullWidth() {
		this.fullWidth = !this.fullWidth;
		saveToStorage('yeahdiff-fullWidth', this.fullWidth);
	}

	toggleSyncScroll() {
		this.syncScroll = !this.syncScroll;
		saveToStorage('yeahdiff-syncScroll', this.syncScroll);
	}

	toggleWordWrap() {
		this.wordWrap = !this.wordWrap;
		saveToStorage('yeahdiff-wordWrap', this.wordWrap);
	}

	setDiffMode(mode: DiffMode) {
		this.diffMode = mode;
		saveToStorage('yeahdiff-diffMode', mode);
	}

	setBaseIndex(index: number) {
		this.baseIndex = index;
	}
}

export const settings = new Settings();
