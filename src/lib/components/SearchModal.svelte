<script lang="ts">
	import { slide } from 'svelte/transition';
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';

	let isOpen = $state(false);
	let searchQuery = $state('');
	let searchResults = $state<Array<{paneIndex: number; lineNumber: number; lineContent: string}>>([]);
	let currentResultIndex = $state(-1);

	export function open() {
		isOpen = true;
		searchQuery = '';
		searchResults = [];
		currentResultIndex = -1;
	}

	export function close() {
		isOpen = false;
		searchQuery = '';
		searchResults = [];
		currentResultIndex = -1;
	}

	function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		const results: Array<{paneIndex: number; lineNumber: number; lineContent: string}> = [];
		const query = searchQuery.toLowerCase();

		paneStore.panes.forEach((pane, paneIndex) => {
			const lines = pane.content.split('\n');
			lines.forEach((line, lineIndex) => {
				if (line.toLowerCase().includes(query)) {
					results.push({
						paneIndex,
						lineNumber: lineIndex + 1,
						lineContent: line.trim().substring(0, 80)
					});
				}
			});
		});

		searchResults = results;
		currentResultIndex = results.length > 0 ? 0 : -1;
	}

	function navigateToResult(index: number) {
		if (index < 0 || index >= searchResults.length) return;
		
		currentResultIndex = index;
		const result = searchResults[index];
		
		// Switch to that pane
		settings.setBaseIndex(result.paneIndex);
	}

	function nextResult() {
		if (searchResults.length === 0) return;
		navigateToResult((currentResultIndex + 1) % searchResults.length);
	}

	function prevResult() {
		if (searchResults.length === 0) return;
		navigateToResult((currentResultIndex - 1 + searchResults.length) % searchResults.length);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		} else if (e.key === 'Enter') {
			nextResult();
		} else if (e.key === 'ArrowDown') {
			nextResult();
		} else if (e.key === 'ArrowUp') {
			prevResult();
		}
	}

	$effect(() => {
		if (searchQuery) {
			performSearch();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50 cursor-default"
		onclick={close}
		aria-label="Close search"
	></button>
	<div
		class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 pointer-events-none"
		transition:slide={{ duration: 150 }}
	>
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl pointer-events-auto">
			<div class="p-4 border-b border-gray-200 dark:border-gray-700">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
					</svg>
					<input
						type="text"
						class="flex-1 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
						placeholder="Search across all panes..."
						bind:value={searchQuery}
						autofocus
					/>
					{#if searchResults.length > 0}
						<span class="text-sm text-gray-500">
							{currentResultIndex + 1} / {searchResults.length}
						</span>
					{/if}
					<button
						type="button"
						class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
						onclick={close}
					>
						<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
						</svg>
					</button>
				</div>
			</div>
			
			{#if searchResults.length > 0}
				<div class="max-h-80 overflow-y-auto">
					{#each searchResults as result, index}
						<button
							type="button"
							class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0
								{index === currentResultIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}"
							onclick={() => navigateToResult(index)}
						>
							<div class="flex items-center gap-2 text-sm">
								<span class="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-1.5 py-0.5 rounded">
									Pane {result.paneIndex + 1}:L{result.lineNumber}
								</span>
								<span class="text-gray-700 dark:text-gray-300 truncate font-mono text-xs">
									{result.lineContent}
								</span>
							</div>
						</button>
					{/each}
				</div>
			{:else if searchQuery.trim()}
				<div class="p-4 text-center text-gray-500">
					No results found
				</div>
			{/if}
			
			<div class="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex items-center justify-between">
				<span>↑↓ to navigate, Enter to jump, Esc to close</span>
			</div>
		</div>
	</div>
{/if}
