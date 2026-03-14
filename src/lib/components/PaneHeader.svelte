<script lang="ts">
	import { availableLanguages } from '../codemirror/language-detect.js';
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';

	interface Props {
		paneId: string;
		paneIndex: number;
	}

	let { paneId, paneIndex }: Props = $props();

	const pane = $derived(paneStore.panes.find((p) => p.id === paneId));
	const isBase = $derived(settings.diffMode === 'base' && settings.baseIndex === paneIndex);

	function handleLanguageChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		const lang = value === 'auto' ? null : value;
		paneStore.setManualLanguage(paneId, lang);
	}
</script>

<div
	class="flex items-center justify-between px-3 py-1.5 border-b border-r last:border-r-0 text-sm
	{isBase
		? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
		: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}"
>
	<div class="flex items-center gap-2">
		<span class="font-medium text-gray-700 dark:text-gray-300">
			Pane {paneIndex + 1}
		</span>
		<select
			class="px-1 py-0.5 text-xs rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-none outline-none cursor-pointer"
			value={pane?.manualLanguage ?? 'auto'}
			onchange={handleLanguageChange}
			title="Select language"
		>
			<option value="auto">
				{pane?.manualLanguage ? 'Auto' : pane?.detectedLanguage ? `Auto (${pane.detectedLanguage})` : 'Auto'}
			</option>
			{#each availableLanguages as lang}
				<option value={lang}>{lang}</option>
			{/each}
		</select>
		{#if isBase}
			<span
				class="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
			>
				base
			</span>
		{/if}
	</div>
	<div class="flex items-center gap-1">
		{#if settings.diffMode === 'base' && !isBase}
			<button
				class="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
				onclick={() => settings.setBaseIndex(paneIndex)}
				title="Set as base"
			>
				Set base
			</button>
		{/if}
		{#if paneStore.count > 2}
			<button
				class="px-1.5 py-0.5 text-xs rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
				onclick={() => paneStore.removePane(paneId)}
				title="Remove pane"
			>
				x
			</button>
		{/if}
	</div>
</div>
