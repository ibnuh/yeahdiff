<script lang="ts">
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';

	function cycleTheme() {
		const order: Array<'light' | 'dark' | 'system'> = ['system', 'light', 'dark'];
		const current = order.indexOf(settings.theme);
		settings.setTheme(order[(current + 1) % order.length]);
	}

	const themeLabel = $derived(
		settings.theme === 'system' ? 'System' : settings.theme === 'light' ? 'Light' : 'Dark'
	);
</script>

<div
	class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0"
>
	<div class="flex items-center gap-1">
		<h1 class="text-lg font-bold text-gray-800 dark:text-gray-100 mr-4">YeahDiff</h1>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
			onclick={() => paneStore.addPane()}
			title="Add pane (Ctrl+N)"
		>
			<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
			Add Pane
		</button>

		<div class="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

		<div class="flex items-center rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
			<button
				class="px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 {settings.diffMode === 'base'
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				onclick={() => settings.setDiffMode('base')}
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-3a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
				Base
			</button>
			<button
				class="px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 {settings.diffMode === 'adjacent'
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				onclick={() => settings.setDiffMode('adjacent')}
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" clip-rule="evenodd"/></svg>
				Adjacent
			</button>
		</div>
	</div>

	<div class="flex items-center gap-1">
		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.alignedDiff
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleAlignedDiff()}
			title="Toggle aligned diff (padding to keep matching lines at same position)"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			Aligned
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.syncScroll
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleSyncScroll()}
			title="Toggle synchronized scrolling"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zM7.293 6.293a1 1 0 011.414 0L10 7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414zm0 6a1 1 0 011.414 0L10 13.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			Sync
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5
			{settings.wordWrap
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleWordWrap()}
			title="Toggle word wrap"
		>
			<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 10a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm0-5a1 1 0 011-1h9a3 3 0 010 6h-1.586l.293.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414L12.414 13H13a1 1 0 100-2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
			Wrap
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

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
			onclick={cycleTheme}
			title="Cycle theme: {themeLabel}"
		>
			{#if settings.theme === 'light'}
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>
			{:else if settings.theme === 'dark'}
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
			{:else}
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/></svg>
			{/if}
			{themeLabel}
		</button>

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
</div>
