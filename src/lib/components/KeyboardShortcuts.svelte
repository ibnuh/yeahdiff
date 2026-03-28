<script lang="ts">
	import { slide } from 'svelte/transition';

	let isOpen = $state(false);

	const shortcuts = [
		{ key: 'Ctrl+N', action: 'Add new pane' },
		{ key: 'Ctrl+F', action: 'Search across all panes' },
		{ key: 'Ctrl+K', action: 'Show keyboard shortcuts' },
	];

	export function open() {
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50 cursor-default"
		onclick={close}
		aria-label="Close keyboard shortcuts"
	></button>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
		transition:slide={{ duration: 150 }}
	>
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md pointer-events-auto">
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Keyboard Shortcuts</h2>
				<button
					type="button"
					class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
					onclick={close}
					aria-label="Close"
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
					</svg>
				</button>
			</div>
			<div class="p-4">
				<table class="w-full">
					<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
						{#each shortcuts as shortcut}
							<tr>
								<td class="py-3 pr-4">
									<kbd class="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
										{shortcut.key}
									</kbd>
								</td>
								<td class="py-3 text-sm text-gray-700 dark:text-gray-300">{shortcut.action}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
