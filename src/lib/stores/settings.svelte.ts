import type { DiffMode } from '../diff/types.js';
import { loadFromStorage, saveToStorage } from './storage.js';

class Settings {
	theme = $state<'light' | 'dark' | 'system'>('system');
	fullWidth = $state(true);
	syncScroll = $state(true);
	wordWrap = $state(false);
	alignedDiff = $state(false);
	diffMode = $state<DiffMode>('base');
	baseIndex = $state(0);
	mobileLayout = $state<'stack' | 'compare'>('stack');
	/** Tracks system prefers-color-scheme so isDark stays reactive. */
	private systemPrefersDark = $state(false);

	isDark = $derived.by(() => {
		if (this.theme === 'system') {
			return this.systemPrefersDark;
		}
		return this.theme === 'dark';
	});

	constructor() {
		if (typeof window !== 'undefined') {
			this.theme = loadFromStorage('yeahdiff-theme', 'system');
			this.fullWidth = loadFromStorage('yeahdiff-fullWidth', true);
			this.syncScroll = loadFromStorage('yeahdiff-syncScroll', true);
			this.wordWrap = loadFromStorage('yeahdiff-wordWrap', false);
			this.alignedDiff = loadFromStorage('yeahdiff-alignedDiff', false);
			this.diffMode = loadFromStorage('yeahdiff-diffMode', 'base' as DiffMode);
			this.mobileLayout = loadFromStorage(
				'yeahdiff-mobileLayout',
				'stack' as 'stack' | 'compare'
			);

			const mq = window.matchMedia('(prefers-color-scheme: dark)');
			this.systemPrefersDark = mq.matches;
			mq.addEventListener('change', (e) => {
				this.systemPrefersDark = e.matches;
			});
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

	toggleAlignedDiff() {
		this.alignedDiff = !this.alignedDiff;
		saveToStorage('yeahdiff-alignedDiff', this.alignedDiff);
	}

	setDiffMode(mode: DiffMode) {
		this.diffMode = mode;
		saveToStorage('yeahdiff-diffMode', mode);
	}

	setBaseIndex(index: number) {
		this.baseIndex = index;
	}

	toggleMobileLayout() {
		this.mobileLayout = this.mobileLayout === 'stack' ? 'compare' : 'stack';
		saveToStorage('yeahdiff-mobileLayout', this.mobileLayout);
	}

	setAlignedDiff(value: boolean) {
		this.alignedDiff = value;
		saveToStorage('yeahdiff-alignedDiff', value);
	}

	setSyncScroll(value: boolean) {
		this.syncScroll = value;
		saveToStorage('yeahdiff-syncScroll', value);
	}

	setWordWrap(value: boolean) {
		this.wordWrap = value;
		saveToStorage('yeahdiff-wordWrap', value);
	}
}

export const settings = new Settings();
