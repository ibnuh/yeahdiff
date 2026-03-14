<script lang="ts">
	import Toolbar from '$lib/components/Toolbar.svelte';
	import PaneContainer from '$lib/components/PaneContainer.svelte';
	import PaneHeader from '$lib/components/PaneHeader.svelte';
	import { settings } from '$lib/stores/settings.svelte.js';
	import { paneStore } from '$lib/stores/panes.svelte.js';

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
			e.preventDefault();
			paneStore.addPane();
		}
	}

	const gridCols = $derived(`repeat(${paneStore.count}, minmax(0, 1fr))`);
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>YeahDiff - Multi-Text Diff Comparison Tool</title>
</svelte:head>

<div class="flex flex-col h-full {settings.fullWidth ? '' : 'max-w-screen-2xl mx-auto w-full'}">
	<div class="sticky top-0 z-20 shrink-0">
		<Toolbar />
		<div class="grid" style:grid-template-columns={gridCols}>
			{#each paneStore.panes as pane, index (pane.id)}
				<PaneHeader paneId={pane.id} paneIndex={index} />
			{/each}
		</div>
	</div>
	<PaneContainer />
</div>
