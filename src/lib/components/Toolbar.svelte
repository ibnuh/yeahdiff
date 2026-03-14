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

	const themeIcon = $derived(
		settings.theme === 'system' ? 'S' : settings.theme === 'light' ? 'L' : 'D'
	);
</script>

<div
	class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 sticky top-0 z-20"
>
	<div class="flex items-center gap-1">
		<h1 class="text-lg font-bold text-gray-800 dark:text-gray-100 mr-4">YeahDiff</h1>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
			onclick={() => paneStore.addPane()}
			title="Add pane (Ctrl+N)"
		>
			+ Add Pane
		</button>

		<div class="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

		<div class="flex items-center rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
			<button
				class="px-3 py-1.5 text-sm transition-colors {settings.diffMode === 'base'
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				onclick={() => settings.setDiffMode('base')}
			>
				Base
			</button>
			<button
				class="px-3 py-1.5 text-sm transition-colors {settings.diffMode === 'adjacent'
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				onclick={() => settings.setDiffMode('adjacent')}
			>
				Adjacent
			</button>
		</div>
	</div>

	<div class="flex items-center gap-1">
		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors
			{settings.alignedDiff
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleAlignedDiff()}
			title="Toggle aligned diff (padding to keep matching lines at same position)"
		>
			Aligned {settings.alignedDiff ? 'On' : 'Off'}
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors
			{settings.syncScroll
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleSyncScroll()}
			title="Toggle synchronized scrolling"
		>
			Sync Scroll {settings.syncScroll ? 'On' : 'Off'}
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors
			{settings.wordWrap
				? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
				: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
			hover:opacity-80"
			onclick={() => settings.toggleWordWrap()}
			title="Toggle word wrap"
		>
			Wrap {settings.wordWrap ? 'On' : 'Off'}
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
			onclick={() => settings.toggleFullWidth()}
			title="Toggle full width"
		>
			{settings.fullWidth ? 'Contained' : 'Full Width'}
		</button>

		<button
			class="px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
			onclick={cycleTheme}
			title="Cycle theme: {themeLabel}"
		>
			{themeIcon} {themeLabel}
		</button>
	</div>
</div>
