<script lang="ts">
	import { onMount } from 'svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import PaneContainer from '$lib/components/PaneContainer.svelte';
	import PaneHeader from '$lib/components/PaneHeader.svelte';
	import MobilePaneTabs from '$lib/components/MobilePaneTabs.svelte';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import { settings } from '$lib/stores/settings.svelte.js';
	import { paneStore } from '$lib/stores/panes.svelte.js';
	import { diffStore } from '$lib/stores/diff.svelte.js';
	import { loadFromHash } from '$lib/shareable.js';
	import { navigation } from '$lib/stores/navigation.svelte.js';

	let keyboardShortcutsModal: KeyboardShortcuts;
	let searchModal: SearchModal;

	let changeCursor = -1;

	function jumpChange(direction: 1 | -1) {
		if (settings.viewMode === 'unified') {
			const changeRows: number[] = [];
			for (let i = 0; i < diffStore.unifiedRows.length; i++) {
				const row = diffStore.unifiedRows[i];
				if (row.kind === 'added' || row.kind === 'removed' || row.kind === 'modified') {
					changeRows.push(i);
				}
			}
			if (changeRows.length === 0) {
				return;
			}
			if (changeCursor < 0 || changeCursor >= changeRows.length) {
				changeCursor = direction > 0 ? 0 : changeRows.length - 1;
			} else {
				changeCursor = (changeCursor + direction + changeRows.length) % changeRows.length;
			}
			const rowIndex = changeRows[changeCursor];
			const row = diffStore.unifiedRows[rowIndex];
			if (row.kind === 'separator') {
				return;
			}
			const pair = diffStore.getPrimaryPair();
			const paneIndex = pair
				? row.kind === 'added'
					? pair.indexB
					: pair.indexA
				: 0;
			const lineNumber = row.lineNumberB ?? row.lineNumberA ?? 1;
			navigation.jumpToUnified(paneIndex, lineNumber, rowIndex);
			return;
		}

		const { paneIndex, lines } = diffStore.getNavigationAnchors();
		if (lines.length === 0) {
			return;
		}
		if (changeCursor < 0 || changeCursor >= lines.length) {
			changeCursor = direction > 0 ? 0 : lines.length - 1;
		} else {
			changeCursor = (changeCursor + direction + lines.length) % lines.length;
		}
		navigation.jumpTo(paneIndex, lines[changeCursor]);
		settings.setBaseIndex(paneIndex);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
			e.preventDefault();
			paneStore.addPane();
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			keyboardShortcutsModal?.open();
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
			e.preventDefault();
			searchModal?.open();
		}
		if (e.altKey && e.key === 'ArrowDown') {
			e.preventDefault();
			jumpChange(1);
		}
		if (e.altKey && e.key === 'ArrowUp') {
			e.preventDefault();
			jumpChange(-1);
		}
		if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
			e.preventDefault();
			settings.toggleViewMode();
		}
	}

	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);

	onMount(async () => {
		await loadFromHash();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>YeahDiff - Multi-Text Diff Comparison Tool</title>
</svelte:head>

<h1 class="sr-only">YeahDiff</h1>

<div class="flex flex-col h-full {settings.fullWidth ? '' : 'max-w-screen-2xl mx-auto w-full'}">
	<div class="sticky top-0 z-20 shrink-0">
		<Toolbar
			onShowShortcuts={() => keyboardShortcutsModal?.open()}
			onSearch={() => searchModal?.open()}
		/>
		<!-- Desktop headers -->
		<div class="hidden md:grid" style:grid-template-columns={gridCols}>
			{#each paneStore.panes as pane, index (pane.id)}
				<PaneHeader
					paneId={pane.id}
					paneIndex={index}
					stats={diffStore.getStatsForPane(index)}
				/>
			{/each}
		</div>
		<!-- Mobile tabs -->
		<MobilePaneTabs />
	</div>
	<PaneContainer />
</div>

<KeyboardShortcuts bind:this={keyboardShortcutsModal} />
<SearchModal bind:this={searchModal} />
