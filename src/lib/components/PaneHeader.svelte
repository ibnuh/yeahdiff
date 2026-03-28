<script lang="ts">
	import { availableLanguages } from '../codemirror/language-detect.js';
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import { formatLineCount } from '../large-file-utils.js';

	interface Props {
		paneId: string;
		paneIndex: number;
	}

	let { paneId, paneIndex }: Props = $props();

	const pane = $derived(paneStore.panes.find((p) => p.id === paneId));
	const isBase = $derived(settings.diffMode === 'base' && settings.baseIndex === paneIndex);
	
	const lineCount = $derived(pane?.content ? pane.content.split('\n').length : 0);

	function handleLanguageChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		const lang = value === 'auto' ? null : value;
		paneStore.setManualLanguage(paneId, lang);
	}

	function copyContent() {
		if (pane?.content) {
			navigator.clipboard.writeText(pane.content);
		}
	}

	function clearContent() {
		paneStore.updateContent(paneId, '');
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
		{#if lineCount > 0}
			<span class="text-xs text-gray-400 dark:text-gray-500">
				{formatLineCount(lineCount)}
			</span>
		{/if}
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
		{#if pane?.content}
			<button
				class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
				onclick={copyContent}
				title="Copy content"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
			</button>
			<button
				class="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
				onclick={clearContent}
				title="Clear content"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
			</button>
		{/if}
		{#if settings.diffMode === 'base' && !isBase}
			<button
				class="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors flex items-center gap-1"
				onclick={() => settings.setBaseIndex(paneIndex)}
				title="Set as base"
			>
				<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-3a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>
				Set base
			</button>
		{/if}
		{#if paneStore.count > 2}
			<button
				class="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
				onclick={() => paneStore.removePane(paneId)}
				title="Remove pane"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
			</button>
		{/if}
	</div>
</div>
