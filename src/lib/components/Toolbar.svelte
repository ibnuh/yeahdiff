<script lang="ts">
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import ThemeSelector from './ThemeSelector.svelte';

	let mobileMenuOpen = $state(false);

	function closeMenu() {
		mobileMenuOpen = false;
	}

	// Close menu when clicking outside
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeMenu();
		}
	}
</script>

<div
	class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0"
>
	<!-- Logo and primary actions -->
	<div class="flex items-center gap-2 md:gap-3">
		<h1 class="text-lg font-bold text-gray-800 dark:text-gray-100 shrink-0">YeahDiff</h1>

		<!-- Add Pane button - visible on all sizes -->
		<button
			class="px-2.5 md:px-3 py-2 md:py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shrink-0 min-h-[44px] md:min-h-0"
			onclick={() => paneStore.addPane()}
			title="Add pane (Ctrl+N)"
		>
			<svg class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
			<span class="hidden md:inline">Add Pane</span>
		</button>

		<div class="hidden md:block mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

		<!-- Diff Mode selector - visible on all sizes but compact on mobile -->
		<div class="flex items-center rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 shrink-0">
			<button
				class="px-2 md:px-3 py-2 md:py-1.5 text-sm transition-colors flex items-center gap-1 min-h-[44px] md:min-h-0
					{settings.diffMode === 'base'
						? 'bg-blue-500 text-white'
						: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				onclick={() => settings.setDiffMode('base')}
			>
				<svg class="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-3a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
			<span class="hidden md:inline ml-1">Base</span>
		</button>
		<button
			class="px-2 md:px-3 py-2 md:py-1.5 text-sm transition-colors flex items-center gap-1 min-h-[44px] md:min-h-0
				{settings.diffMode === 'adjacent'
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
			onclick={() => settings.setDiffMode('adjacent')}
			title="Compare each pane with its neighbor"
		>
			<svg class="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" clip-rule="evenodd"/></svg>
			<span class="hidden md:inline ml-1">Adjacent</span>
			</button>
		</div>
	</div>

	<!-- Desktop controls -->
	<div class="hidden md:flex items-center gap-1">
		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.alignedDiff
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleAlignedDiff()}
			title="Align matching lines across all panes (adds spacing to keep lines synchronized)"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			Align Lines
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.syncScroll
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleSyncScroll()}
			title="Synchronize scrolling across all panes"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zM7.293 6.293a1 1 0 011.414 0L10 7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zm0 6a1 1 0 011.414 0L10 13.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			Scroll Sync
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.wordWrap
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleWordWrap()}
			title="Wrap long lines to fit within the pane width"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 10a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm0-5a1 1 0 011-1h9a3 3 0 010 6h-1.586l.293.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414L12.414 13H13a1 1 0 100-2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			Line Wrap
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
			onclick={() => settings.toggleFullWidth()}
			title="Toggle full width"
		>
			{#if settings.fullWidth}
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l2.293 2.293a1 1 0 01-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9-1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 4H12zm-6.707 8.293a1 1 0 011.414 0L9 13.586V12a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			{:else}
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zM5.293 12.293a1 1 0 011.414 0L9 14.586V13a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			{/if}
			{settings.fullWidth ? 'Contained' : 'Full Width'}
		</button>

		<ThemeSelector />

		<a
			href="https://github.com/ibnuh/yeahdiff"
			target="_blank"
			rel="noopener noreferrer"
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
			title="View on GitHub"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
			ibnuh/yeahdiff
		</a>
	</div>

	<!-- Mobile: Compare/Stack toggle, Theme selector, and Menu button -->
	<div class="flex md:hidden items-center gap-2">
		<!-- Compare/Stack toggle -->
		<button
			type="button"
			class="p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center
				{settings.mobileLayout === 'compare'
					? 'bg-blue-500 text-white'
					: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}"
			onclick={() => settings.toggleMobileLayout()}
			aria-label={settings.mobileLayout === 'compare' ? 'Switch to stacked view' : 'Switch to comparison view'}
			title={settings.mobileLayout === 'compare' ? 'Switch to stacked view' : 'Switch to comparison view'}
		>
			{#if settings.mobileLayout === 'compare'}
				<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z"/></svg>
			{:else}
				<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0-4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			{/if}
		</button>

		<!-- Theme Selector -->
		<ThemeSelector />

		<!-- Mobile menu button -->
		<button
			type="button"
			class="p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
			onclick={() => mobileMenuOpen = !mobileMenuOpen}
			aria-label={mobileMenuOpen ? 'Close settings menu' : 'Open settings menu'}
			title={mobileMenuOpen ? 'Close settings menu' : 'Open settings menu'}
		>
			{#if mobileMenuOpen}
				<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			{:else}
				<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			{/if}
		</button>
	</div>
</div>

<!-- Mobile menu overlay -->
{#if mobileMenuOpen}
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50 md:hidden cursor-default"
		onclick={handleBackdropClick}
		aria-label="Close settings menu"
	>
	</button>
	<div class="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto z-50">
		<div class="p-4 space-y-3">
			<div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
				<button
					type="button"
					class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
					onclick={closeMenu}
					aria-label="Close menu"
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
				</button>
				</div>

				<!-- Mobile menu items -->
				<button
					class="w-full px-3 py-3 rounded-lg transition-colors flex items-center justify-between min-h-[48px]
						{settings.alignedDiff
							? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}"
					onclick={() => { settings.toggleAlignedDiff(); closeMenu(); }}
				>
					<span class="flex items-center gap-2">
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
						Align Lines
					</span>
					{#if settings.alignedDiff}
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
					{/if}
				</button>

				<button
					class="w-full px-3 py-3 rounded-lg transition-colors flex items-center justify-between min-h-[48px]
						{settings.syncScroll
							? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}"
					onclick={() => { settings.toggleSyncScroll(); closeMenu(); }}
				>
					<span class="flex items-center gap-2">
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zM7.293 6.293a1 1 0 011.414 0L10 7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zm0 6a1 1 0 011.414 0L10 13.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
						Sync Scroll
					</span>
					{#if settings.syncScroll}
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
					{/if}
				</button>

				<button
					class="w-full px-3 py-3 rounded-lg transition-colors flex items-center justify-between min-h-[48px]
						{settings.wordWrap
							? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
							: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}"
					onclick={() => { settings.toggleWordWrap(); closeMenu(); }}
				>
					<span class="flex items-center gap-2">
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 10a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm0-5a1 1 0 011-1h9a3 3 0 010 6h-1.586l.293.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414L12.414 13H13a1 1 0 100-2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
						Word Wrap
					</span>
					{#if settings.wordWrap}
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
					{/if}
				</button>

				<button
					class="w-full px-3 py-3 rounded-lg transition-colors flex items-center justify-between min-h-[48px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
					onclick={() => { settings.toggleFullWidth(); closeMenu(); }}
				>
					<span class="flex items-center gap-2">
						{#if settings.fullWidth}
							<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l2.293 2.293a1 1 0 01-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9-1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 4H12zm-6.707 8.293a1 1 0 011.414 0L9 13.586V12a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
						{:else}
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zM5.293 12.293a1 1 0 011.414 0L9 14.586V13a1 1 0 112 0v4a1 1 0 01-1 1H6a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
						{/if}
						{settings.fullWidth ? 'Full Width' : 'Contained'}
					</span>
				</button>

				<a
					href="https://github.com/ibnuh/yeahdiff"
					target="_blank"
					rel="noopener noreferrer"
					class="w-full px-3 py-3 rounded-lg transition-colors flex items-center gap-2 min-h-[48px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
					onclick={closeMenu}
				>
					<svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
					GitHub: ibnuh/yeahdiff
				</a>
			</div>
		</div>
{/if}
