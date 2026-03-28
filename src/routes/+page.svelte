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
	import { loadFromHash } from '$lib/shareable.js';

	let keyboardShortcutsModal: KeyboardShortcuts;
	let searchModal: SearchModal;

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
	}

	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);

	onMount(() => {
		// Load from URL hash if present
		loadFromHash();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>YeahDiff - Multi-Text Diff Comparison Tool</title>
</svelte:head>

<div class="flex flex-col h-full {settings.fullWidth ? '' : 'max-w-screen-2xl mx-auto w-full'}">
	<div class="sticky top-0 z-20 shrink-0">
		<Toolbar 
		onShowShortcuts={() => keyboardShortcutsModal?.open()}
		onSearch={() => searchModal?.open()}
	/>
		<!-- Desktop headers -->
		<div class="hidden md:grid" style:grid-template-columns={gridCols}>
			{#each paneStore.panes as pane, index (pane.id)}
				<PaneHeader paneId={pane.id} paneIndex={index} />
			{/each}
		</div>
		<!-- Mobile tabs -->
		<MobilePaneTabs />
	</div>
	<PaneContainer />
</div>

<KeyboardShortcuts bind:this={keyboardShortcutsModal} />
<SearchModal bind:this={searchModal} />
