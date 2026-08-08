<script lang="ts">
	import { tick } from 'svelte';
	import { diffStore } from '../stores/diff.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import { settings } from '../stores/settings.svelte.js';
	import { navigation } from '../stores/navigation.svelte.js';
	import {
		summarizeUnifiedRows,
		unifiedSeparatorKey
	} from '../diff/engine.js';
	import type { UnifiedDiffLine, UnifiedHunkSeparator, UnifiedRow, WordDiff } from '../diff/types.js';
	import DiffStatsBadge from './DiffStatsBadge.svelte';

	const pair = $derived(diffStore.getPrimaryPair());
	const rows = $derived(diffStore.unifiedRows);
	const stats = $derived(summarizeUnifiedRows(rows));
	const paneCount = $derived(paneStore.count);
	const showPairPicker = $derived(paneCount >= 3);

	const selectedA = $derived(
		settings.unifiedIndexA !== null
			? settings.unifiedIndexA
			: (pair?.indexA ?? 0)
	);
	const selectedB = $derived(
		settings.unifiedIndexB !== null
			? settings.unifiedIndexB
			: (pair?.indexB ?? Math.min(1, Math.max(0, paneCount - 1)))
	);

	let expandedLocal = $state<Set<string>>(new Set());
	let scrollEl: HTMLDivElement | undefined = $state();
	let highlightedIndex = $state(-1);
	let lastHighlightToken = $state(0);
	let changeCursor = $state(-1);

	const bothEmpty = $derived(
		!pair || (pair.textA.trim() === '' && pair.textB.trim() === '')
	);
	const identical = $derived(
		!!pair &&
			!bothEmpty &&
			pair.textA === pair.textB
	);
	const hasSeparators = $derived(rows.some((r) => r.kind === 'separator'));

	const labelA = $derived(
		pair
			? `Pane ${pair.indexA + 1}${paneStore.panes[pair.indexA]?.detectedLanguage ? ` (${paneStore.panes[pair.indexA]?.detectedLanguage})` : ''}`
			: 'A'
	);
	const labelB = $derived(
		pair
			? `Pane ${pair.indexB + 1}${paneStore.panes[pair.indexB]?.detectedLanguage ? ` (${paneStore.panes[pair.indexB]?.detectedLanguage})` : ''}`
			: 'B'
	);

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

	function separatorKey(row: UnifiedHunkSeparator): string {
		return unifiedSeparatorKey(
			row.expandFromA,
			row.expandToA,
			row.expandFromB,
			row.expandToB
		);
	}

	function expandSeparator(row: UnifiedHunkSeparator) {
		const key = separatorKey(row);
		const next = new Set(expandedLocal);
		next.add(key);
		expandedLocal = next;
		diffStore.expandUnifiedSeparator(key);
	}

	function expandAll() {
		const keys: string[] = [];
		for (const row of rows) {
			if (row.kind === 'separator') {
				keys.push(separatorKey(row));
			}
		}
		if (keys.length === 0) {
			return;
		}
		const next = new Set(expandedLocal);
		for (const k of keys) {
			next.add(k);
		}
		expandedLocal = next;
		diffStore.expandAllUnifiedSeparators();
	}

	function paneLabel(index: number): string {
		const lang = paneStore.panes[index]?.detectedLanguage;
		return lang ? `Pane ${index + 1} (${lang})` : `Pane ${index + 1}`;
	}

	function onPickA(e: Event) {
		const value = Number((e.currentTarget as HTMLSelectElement).value);
		let nextB = selectedB;
		if (value === nextB) {
			// Keep pair distinct: pick first other pane
			nextB = value === 0 ? 1 : 0;
			if (nextB >= paneCount) {
				nextB = Math.max(0, paneCount - 1);
				if (nextB === value && paneCount > 1) {
					nextB = value === 0 ? 1 : 0;
				}
			}
		}
		expandedLocal = new Set();
		diffStore.clearUnifiedExpanded();
		settings.setUnifiedPair(value, nextB);
		diffStore.recomputeUnifiedNow();
	}

	function onPickB(e: Event) {
		const value = Number((e.currentTarget as HTMLSelectElement).value);
		let nextA = selectedA;
		if (value === nextA) {
			nextA = value === 0 ? 1 : 0;
			if (nextA >= paneCount) {
				nextA = Math.max(0, paneCount - 1);
				if (nextA === value && paneCount > 1) {
					nextA = value === 0 ? 1 : 0;
				}
			}
		}
		expandedLocal = new Set();
		diffStore.clearUnifiedExpanded();
		settings.setUnifiedPair(nextA, value);
		diffStore.recomputeUnifiedNow();
	}

	function switchToSplit() {
		settings.setViewMode('split');
	}

	function wordClass(type: WordDiff['type']): string {
		if (type === 'added') {
			return 'cm-diff-added-word yd-unified-word-added';
		}
		if (type === 'removed') {
			return 'cm-diff-removed-word yd-unified-word-removed';
		}
		return '';
	}

	function changeRowIndices(list: UnifiedRow[]): number[] {
		const out: number[] = [];
		for (let i = 0; i < list.length; i++) {
			const row = list[i];
			if (row.kind === 'added' || row.kind === 'removed' || row.kind === 'modified') {
				out.push(i);
			}
		}
		return out;
	}

	function findRowForLine(list: UnifiedRow[], lineNumber: number, paneIndex: number): number {
		const isA = pair ? paneIndex === pair.indexA : true;
		for (let i = 0; i < list.length; i++) {
			const row = list[i];
			if (row.kind === 'separator') {
				continue;
			}
			if (row.kind === 'context') {
				continue;
			}
			if (isA && row.lineNumberA === lineNumber) {
				return i;
			}
			if (!isA && row.lineNumberB === lineNumber) {
				return i;
			}
			// Fallback: match either side number for modified/added/removed
			if (row.lineNumberA === lineNumber || row.lineNumberB === lineNumber) {
				return i;
			}
		}
		// If no exact change match, try any row with that line number
		for (let i = 0; i < list.length; i++) {
			const row = list[i];
			if (row.kind === 'separator') {
				continue;
			}
			if (row.lineNumberA === lineNumber || row.lineNumberB === lineNumber) {
				return i;
			}
		}
		return -1;
	}

	async function scrollToRow(index: number) {
		highlightedIndex = index;
		await tick();
		if (!scrollEl || index < 0) {
			return;
		}
		const el = scrollEl.querySelector(`[data-unified-row="${index}"]`) as HTMLElement | null;
		if (el) {
			el.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
	}

	// Respond to toolbar / keyboard next-prev via navigation store
	$effect(() => {
		const token = navigation.unifiedHighlightToken;
		if (token === 0 || token === lastHighlightToken) {
			return;
		}
		if (settings.viewMode !== 'unified') {
			return;
		}
		lastHighlightToken = token;

		const hint = navigation.unifiedRowHint;
		if (hint >= 0 && hint < rows.length) {
			void scrollToRow(hint);
			return;
		}

		const line = navigation.lineNumber;
		const pane = navigation.paneIndex;
		let idx = findRowForLine(rows, line, pane);
		if (idx < 0) {
			// Advance among non-context rows using change cursor semantics
			const changes = changeRowIndices(rows);
			if (changes.length === 0) {
				return;
			}
			if (changeCursor < 0 || changeCursor >= changes.length) {
				changeCursor = 0;
			} else {
				changeCursor = (changeCursor + 1) % changes.length;
			}
			idx = changes[changeCursor];
		} else {
			const changes = changeRowIndices(rows);
			const pos = changes.indexOf(idx);
			if (pos >= 0) {
				changeCursor = pos;
			}
		}
		void scrollToRow(idx);
	});

</script>

<div class="flex flex-col h-full min-h-0 border-t border-gray-200 dark:border-gray-700">
	<div
		class="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
	>
		<div class="flex flex-wrap items-center gap-2 min-w-0">
			<span class="font-medium text-gray-700 dark:text-gray-300 shrink-0">Unified</span>
			{#if showPairPicker}
				<label class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
					<span class="hidden sm:inline">Pane A</span>
					<select
						class="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-1.5 py-0.5 text-xs max-w-[9rem]"
						value={selectedA}
						onchange={onPickA}
						aria-label="Unified pane A"
					>
						{#each paneStore.panes as _p, i}
							<option value={i}>{paneLabel(i)}</option>
						{/each}
					</select>
				</label>
				<span class="text-gray-400 dark:text-gray-500" aria-hidden="true">→</span>
				<label class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
					<span class="hidden sm:inline">Pane B</span>
					<select
						class="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-1.5 py-0.5 text-xs max-w-[9rem]"
						value={selectedB}
						onchange={onPickB}
						aria-label="Unified pane B"
					>
						{#each paneStore.panes as _p, i}
							<option value={i}>{paneLabel(i)}</option>
						{/each}
					</select>
				</label>
			{:else}
				<span class="font-medium text-gray-700 dark:text-gray-300 truncate">
					{labelA} → {labelB}
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-2 shrink-0">
			{#if hasSeparators}
				<button
					type="button"
					class="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
					onclick={expandAll}
				>
					Expand all
				</button>
			{/if}
			<DiffStatsBadge {stats} />
		</div>
	</div>

	{#if bothEmpty}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-gray-500 p-6">
			<p>Paste text into two panes to see a unified diff.</p>
			<button
				type="button"
				class="text-blue-600 dark:text-blue-400 hover:underline"
				onclick={switchToSplit}
			>
				Switch to Split to edit panes
			</button>
		</div>
	{:else if identical || rows.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-gray-500 p-6">
			<p>No differences</p>
			<button
				type="button"
				class="text-blue-600 dark:text-blue-400 hover:underline"
				onclick={switchToSplit}
			>
				Switch to Split to edit panes
			</button>
		</div>
	{:else}
		<div class="flex-1 min-h-0 overflow-auto app-bg" bind:this={scrollEl}>
			{#each rows as row, idx (idx)}
				{#if isSeparator(row)}
					<button
						type="button"
						class="yd-unified-hunk-sep"
						title="Click to expand hidden context"
						data-unified-row={idx}
						onclick={() => expandSeparator(row)}
					>
						<span class="font-mono text-[11px]">{row.header}</span>
						<span class="opacity-70">({row.omitted} lines hidden · click to expand)</span>
					</button>
				{:else if isLine(row)}
					<div
						class="yd-unified-line {lineClass(row.kind)}{highlightedIndex === idx
							? ' yd-unified-highlight'
							: ''}"
						data-unified-row={idx}
					>
						<div class="yd-unified-gutter">
							<span class="w-8 text-right">{formatNum(row.lineNumberA)}</span>
							<span class="w-8 text-right">{formatNum(row.lineNumberB)}</span>
						</div>
						<span class="yd-unified-prefix">{prefix(row.kind)}</span>
						<span class="yd-unified-content">
							{#if row.wordDiffs && row.wordDiffs.length > 0}
								{#each row.wordDiffs as part}
									{#if part.type === 'unchanged'}
										{part.value}
									{:else}
										<span class={wordClass(part.type)}>{part.value}</span>
									{/if}
								{/each}
							{:else}
								{row.content.length === 0 ? ' ' : row.content}
							{/if}
						</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
