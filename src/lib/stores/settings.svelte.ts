import type { DiffMode } from '../diff/types.js';
import { loadFromStorage, saveToStorage } from './storage.js';

export type ViewMode = 'split' | 'unified';
export type ChangeStyle = 'background' | 'bars' | 'both';

class Settings {
	theme = $state<'light' | 'dark' | 'system'>('system');
	fullWidth = $state(true);
	syncScroll = $state(true);
	wordWrap = $state(false);
	alignedDiff = $state(false);
	diffMode = $state<DiffMode>('base');
	baseIndex = $state(0);
	mobileLayout = $state<'stack' | 'compare'>('stack');
	/** Split = multi-pane side-by-side; unified = stacked A/B view for primary pair. */
	viewMode = $state<ViewMode>('split');
	/** How change lines are painted in editors. */
	changeStyle = $state<ChangeStyle>('both');
	/** Ignore leading/trailing whitespace when computing diffs. */
	ignoreWhitespace = $state(false);
	/** Treat upper/lowercase as equal when computing diffs. */
	ignoreCase = $state(false);
	/**
	 * Optional explicit pair for unified view (pane indices).
	 * null = auto from resolvePrimaryPair (base/adjacent).
	 */
	unifiedIndexA = $state<number | null>(null);
	unifiedIndexB = $state<number | null>(null);
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
			this.viewMode = loadFromStorage('yeahdiff-viewMode', 'split' as ViewMode);
			this.changeStyle = loadFromStorage('yeahdiff-changeStyle', 'both' as ChangeStyle);
			this.ignoreWhitespace = loadFromStorage('yeahdiff-ignoreWhitespace', false);
			this.ignoreCase = loadFromStorage('yeahdiff-ignoreCase', false);

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

	setViewMode(mode: ViewMode) {
		this.viewMode = mode;
		saveToStorage('yeahdiff-viewMode', mode);
	}

	toggleViewMode() {
		this.setViewMode(this.viewMode === 'split' ? 'unified' : 'split');
	}

	setChangeStyle(style: ChangeStyle) {
		this.changeStyle = style;
		saveToStorage('yeahdiff-changeStyle', style);
	}

	cycleChangeStyle() {
		const order: ChangeStyle[] = ['both', 'background', 'bars'];
		const idx = order.indexOf(this.changeStyle);
		const next = order[(idx + 1) % order.length];
		this.setChangeStyle(next);
	}

	setUnifiedPair(indexA: number | null, indexB: number | null) {
		this.unifiedIndexA = indexA;
		this.unifiedIndexB = indexB;
	}

	setUnifiedIndexA(index: number | null) {
		this.unifiedIndexA = index;
	}

	setUnifiedIndexB(index: number | null) {
		this.unifiedIndexB = index;
	}

	setIgnoreWhitespace(value: boolean) {
		this.ignoreWhitespace = value;
		saveToStorage('yeahdiff-ignoreWhitespace', value);
	}

	toggleIgnoreWhitespace() {
		this.setIgnoreWhitespace(!this.ignoreWhitespace);
	}

	setIgnoreCase(value: boolean) {
		this.ignoreCase = value;
		saveToStorage('yeahdiff-ignoreCase', value);
	}

	toggleIgnoreCase() {
		this.setIgnoreCase(!this.ignoreCase);
	}
}

export const settings = new Settings();
