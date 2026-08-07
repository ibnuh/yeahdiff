<script lang="ts">
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';
	import { diffStore } from '../stores/diff.svelte.js';
	import DiffPane from './DiffPane.svelte';
	import EmptyState from './EmptyState.svelte';
	import UnifiedDiffView from './UnifiedDiffView.svelte';
	import { shouldSkipDiff, shouldShowWarning, formatLineCount } from '../large-file-utils.js';

	const allEmpty = $derived(paneStore.panes.every((p) => !p.content.trim()));
	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);
	const activePane = $derived(paneStore.panes[settings.baseIndex] ?? paneStore.panes[0]);
	const activeIndex = $derived(Math.min(settings.baseIndex, Math.max(0, paneStore.count - 1)));
	const largeFileSkipped = $derived(shouldSkipDiff(diffStore.totalLines));
	const largeFileWarning = $derived(
		shouldShowWarning(diffStore.totalLines) && !shouldSkipDiff(diffStore.totalLines)
	);
	const isUnified = $derived(settings.viewMode === 'unified');
</script>

{#if allEmpty}
	<EmptyState />
{:else}
	{#if largeFileSkipped || largeFileWarning}
		<div
			class="shrink-0 px-3 py-2 text-xs sm:text-sm border-b
				{largeFileSkipped
				? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800'
				: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800'}"
			role="status"
		>
			{#if largeFileSkipped}
				Diff highlighting is disabled for large content ({formatLineCount(diffStore.totalLines)} total). Editing still works.
			{:else}
				Large content detected ({formatLineCount(diffStore.totalLines)} total). Diff may be slower.
			{/if}
		</div>
	{/if}

	{#if isUnified}
		<div class="flex-1 min-h-0">
			<UnifiedDiffView />
		</div>
	{:else}
		<!-- Desktop: side-by-side grid -->
		<div class="hidden md:grid flex-1 min-h-0" style:grid-template-columns={gridCols}>
			{#each paneStore.panes as pane, index (pane.id)}
				<DiffPane
					paneId={pane.id}
					paneIndex={index}
					diffs={diffStore.getDiffsForPane(index)}
					padding={diffStore.getPaddingForPane(index)}
				/>
			{/each}
		</div>

		<!-- Mobile: stack shows one pane; compare scrolls all -->
		<div
			class="md:hidden flex-1 min-h-0 {settings.mobileLayout === 'compare' ? 'overflow-x-auto' : ''}"
		>
			{#if settings.mobileLayout === 'stack'}
				<div class="h-full">
					{#if activePane}
						<DiffPane
							paneId={activePane.id}
							paneIndex={activeIndex}
							diffs={diffStore.getDiffsForPane(activeIndex)}
							padding={diffStore.getPaddingForPane(activeIndex)}
						/>
					{/if}
				</div>
			{:else}
				<div
					class="flex h-full"
					style="width: {paneStore.count * 100}vw; min-width: {paneStore.count * 320}px;"
				>
					{#each paneStore.panes as pane, index (pane.id)}
						<div
							class="flex-1 min-w-[320px] h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0"
						>
							<DiffPane
								paneId={pane.id}
								paneIndex={index}
								diffs={diffStore.getDiffsForPane(index)}
								padding={diffStore.getPaddingForPane(index)}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}
