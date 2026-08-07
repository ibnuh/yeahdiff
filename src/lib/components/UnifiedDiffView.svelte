<script lang="ts">
	import { diffStore } from '../stores/diff.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import type { UnifiedDiffLine, UnifiedHunkSeparator, UnifiedRow } from '../diff/types.js';

	const pair = $derived(diffStore.getPrimaryPair());
	const rows = $derived(diffStore.unifiedRows);

	function isSeparator(row: UnifiedRow): row is UnifiedHunkSeparator {
		return row.kind === 'separator';
	}

	function isLine(row: UnifiedRow): row is UnifiedDiffLine {
		return row.kind !== 'separator';
	}

	function prefix(kind: UnifiedDiffLine['kind']): string {
		if (kind === 'added') {
			return '+';
		}
		if (kind === 'removed') {
			return '-';
		}
		return ' ';
	}

	function lineClass(kind: UnifiedDiffLine['kind']): string {
		if (kind === 'added') {
			return 'added';
		}
		if (kind === 'removed') {
			return 'removed';
		}
		return 'context';
	}

	function formatNum(n?: number): string {
		return n && n > 0 ? String(n) : '';
	}

	const labelA = $derived(
		pair ? `Pane ${pair.indexA + 1}${paneStore.panes[pair.indexA]?.detectedLanguage ? ` (${paneStore.panes[pair.indexA]?.detectedLanguage})` : ''}` : 'A'
	);
	const labelB = $derived(
		pair ? `Pane ${pair.indexB + 1}${paneStore.panes[pair.indexB]?.detectedLanguage ? ` (${paneStore.panes[pair.indexB]?.detectedLanguage})` : ''}` : 'B'
	);
</script>

<div class="flex flex-col h-full min-h-0 border-t border-gray-200 dark:border-gray-700">
	<div
		class="shrink-0 flex items-center justify-between px-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
	>
		<span class="font-medium text-gray-700 dark:text-gray-300">
			Unified · {labelA} → {labelB}
		</span>
		<span class="text-gray-400 dark:text-gray-500">
			{rows.filter((r) => r.kind !== 'separator' && r.kind !== 'context').length} changed lines
		</span>
	</div>

	{#if !pair || (pair.textA.trim() === '' && pair.textB.trim() === '')}
		<div class="flex-1 flex items-center justify-center text-sm text-gray-500 p-6">
			Paste text into two panes to see a unified diff.
		</div>
	{:else if rows.length === 0}
		<div class="flex-1 flex items-center justify-center text-sm text-gray-500 p-6">
			No differences.
		</div>
	{:else}
		<div class="flex-1 min-h-0 overflow-auto app-bg">
			{#each rows as row, idx (idx)}
				{#if isSeparator(row)}
					<div class="yd-unified-hunk-sep" title="Collapsed unchanged lines">
						<span class="font-mono text-[11px]">{row.header}</span>
						<span class="opacity-70">({row.omitted} lines hidden)</span>
					</div>
				{:else if isLine(row)}
					<div class="yd-unified-line {lineClass(row.kind)}">
						<div class="yd-unified-gutter">
							<span class="w-8 text-right">{formatNum(row.lineNumberA)}</span>
							<span class="w-8 text-right">{formatNum(row.lineNumberB)}</span>
						</div>
						<span class="yd-unified-prefix">{prefix(row.kind)}</span>
						<span class="yd-unified-content">{row.content.length === 0 ? ' ' : row.content}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
