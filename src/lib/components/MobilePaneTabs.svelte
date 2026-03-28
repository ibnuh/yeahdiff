<script lang="ts">
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';

	const isBase = (index: number) => settings.diffMode === 'base' && settings.baseIndex === index;
</script>

<div class="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 md:hidden overflow-x-auto">
	{#each paneStore.panes as pane, index (pane.id)}
		<button
			class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors shrink-0 min-w-[44px] min-h-[44px]
				{settings.baseIndex === index
					? 'bg-blue-500 text-white'
					: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}
				{isBase(index) ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}"
			onclick={() => settings.setBaseIndex(index)}
		>
			<span class="font-medium">Pane {index + 1}</span>
			{#if isBase(index)}
				<span class="text-xs opacity-80">(base)</span>
			{/if}
		</button>
	{/each}
</div>
