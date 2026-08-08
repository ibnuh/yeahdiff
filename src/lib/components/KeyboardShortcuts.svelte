<script lang="ts">
	import { slide } from 'svelte/transition';
	import { trapFocus, restoreFocus } from '../a11y/focus-trap.js';

	let isOpen = $state(false);
	let panelEl: HTMLDivElement | undefined = $state();
	let closeBtnEl: HTMLButtonElement | undefined = $state();
	let previouslyFocused: Element | null = null;
	let releaseTrap: (() => void) | null = null;

	const shortcuts = [
		{ key: 'Ctrl/⌘ + N', action: 'Add new pane' },
		{ key: 'Ctrl/⌘ + F', action: 'Search across all panes' },
		{ key: 'Ctrl/⌘ + K', action: 'Show keyboard shortcuts' },
		{ key: 'Ctrl/⌘ + U', action: 'Toggle split / unified view' },
		{ key: 'Alt + ↑ / ↓', action: 'Previous / next change' },
		{ key: 'Esc', action: 'Close modal or menu' }
	];

	export function open() {
		previouslyFocused = document.activeElement;
		isOpen = true;
		queueMicrotask(() => closeBtnEl?.focus());
	}

	export function close() {
		isOpen = false;
		releaseTrap?.();
		releaseTrap = null;
		restoreFocus(previouslyFocused);
		previouslyFocused = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	$effect(() => {
		if (!isOpen || !panelEl) {
			return;
		}
		releaseTrap = trapFocus(panelEl);
		return () => {
			releaseTrap?.();
			releaseTrap = null;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50 cursor-default"
		onclick={close}
		aria-label="Close keyboard shortcuts"
		tabindex="-1"
	></button>
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
		transition:slide={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="shortcuts-title"
	>
		<div
			class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md pointer-events-auto"
			bind:this={panelEl}
		>
			<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 id="shortcuts-title" class="text-lg font-semibold text-gray-800 dark:text-gray-100">
					Keyboard Shortcuts
				</h2>
				<button
					type="button"
					class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
					onclick={close}
					aria-label="Close"
					bind:this={closeBtnEl}
				>
					<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
			<div class="p-4">
				<table class="w-full">
					<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
						{#each shortcuts as shortcut}
							<tr>
								<td class="py-3 pr-4">
									<kbd
										class="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
									>
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
