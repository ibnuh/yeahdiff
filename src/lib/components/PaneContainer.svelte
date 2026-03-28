<script lang="ts">
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';
	import { computePairwiseDiffs } from '../diff/engine.js';
	import type { LineDiff, DiffResult, PaddingEntry } from '../diff/types.js';
	import DiffPane from './DiffPane.svelte';

	let diffResults = $state<Map<number, DiffResult>>(new Map());
	let diffTimeout: ReturnType<typeof setTimeout> | null = null;

	const textsSnapshot = $derived(paneStore.panes.map((p) => p.content));

	$effect(() => {
		const texts = textsSnapshot;
		const mode = settings.diffMode;
		const aligned = settings.alignedDiff;
		const baseIdx = Math.min(settings.baseIndex, paneStore.count - 1);

		if (baseIdx !== settings.baseIndex) {
			settings.setBaseIndex(baseIdx);
		}

		if (diffTimeout) clearTimeout(diffTimeout);
		diffTimeout = setTimeout(() => {
			const hasContent = texts.some((t) => t.length > 0);
			if (hasContent) {
				diffResults = computePairwiseDiffs(texts, mode, baseIdx, aligned);
			} else {
				diffResults = new Map();
			}
		}, 300);

		return () => {
			if (diffTimeout) clearTimeout(diffTimeout);
		};
	});

	function getDiffsForPane(index: number): LineDiff[] {
		const result = diffResults.get(index);
		return result?.changes ?? [];
	}

	function getPaddingForPane(index: number): PaddingEntry[] {
		const result = diffResults.get(index);
		return result?.padding ?? [];
	}

	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);

	// Mobile: show only active pane in stack mode
	const activePane = $derived(paneStore.panes[settings.baseIndex] ?? paneStore.panes[0]);
</script>

<!-- Desktop: side-by-side grid -->
<div
	class="hidden md:grid flex-1 min-h-0"
	style:grid-template-columns={gridCols}
>
	{#each paneStore.panes as pane, index (pane.id)}
		<DiffPane
			paneId={pane.id}
			paneIndex={index}
			diffs={getDiffsForPane(index)}
			padding={getPaddingForPane(index)}
		/>
	{/each}
</div>

<!-- Mobile Stack Mode: show only active pane -->
{#if settings.mobileLayout === 'stack'}
	<div class="md:hidden flex-1 min-h-0">
		<DiffPane
			paneId={activePane.id}
			paneIndex={settings.baseIndex}
			diffs={getDiffsForPane(settings.baseIndex)}
			padding={getPaddingForPane(settings.baseIndex)}
		/>
	</div>
{/if}

<!-- Mobile Compare Mode: horizontal scroll with all panes -->
{#if settings.mobileLayout === 'compare'}
	<div class="md:hidden flex-1 min-h-0 overflow-x-auto">
		<div class="flex h-full" style="width: {paneStore.count * 100}vw; min-width: {paneStore.count * 320}px;">
			{#each paneStore.panes as pane, index (pane.id)}
				<div class="flex-1 min-w-[320px] h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0">
					<DiffPane
						paneId={pane.id}
						paneIndex={index}
						diffs={getDiffsForPane(index)}
						padding={getPaddingForPane(index)}
					/>
				</div>
			{/each}
		</div>
	</div>
{/if}
