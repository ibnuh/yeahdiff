<script lang="ts">
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';
	import { computePairwiseDiffs } from '../diff/engine.js';
	import type { LineDiff, DiffResult } from '../diff/types.js';
	import DiffPane from './DiffPane.svelte';

	let diffResults = $state<Map<number, DiffResult>>(new Map());
	let diffTimeout: ReturnType<typeof setTimeout> | null = null;

	const textsSnapshot = $derived(paneStore.panes.map((p) => p.content));

	$effect(() => {
		const texts = textsSnapshot;
		const mode = settings.diffMode;
		const baseIdx = Math.min(settings.baseIndex, paneStore.count - 1);

		if (baseIdx !== settings.baseIndex) {
			settings.setBaseIndex(baseIdx);
		}

		if (diffTimeout) clearTimeout(diffTimeout);
		diffTimeout = setTimeout(() => {
			const hasContent = texts.some((t) => t.length > 0);
			if (hasContent) {
				diffResults = computePairwiseDiffs(texts, mode, baseIdx);
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

	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);
</script>

<div
	class="flex-1 min-h-0 grid"
	style:grid-template-columns={gridCols}
>
	{#each paneStore.panes as pane, index (pane.id)}
		<DiffPane
			paneId={pane.id}
			paneIndex={index}
			diffs={getDiffsForPane(index)}
		/>
	{/each}
</div>
