<script lang="ts">
	import Toolbar from '$lib/components/Toolbar.svelte';
	import PaneContainer from '$lib/components/PaneContainer.svelte';
	import { settings } from '$lib/stores/settings.svelte.js';
	import { paneStore } from '$lib/stores/panes.svelte.js';

	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
			e.preventDefault();
			paneStore.addPane();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>YeahDiff - Multi-Text Comparison</title>
</svelte:head>

<div class="flex flex-col h-full {settings.fullWidth ? '' : 'max-w-screen-2xl mx-auto w-full'}">
	<Toolbar />
	<PaneContainer />
</div>
