<script lang="ts">
	import { diffStore } from '../stores/diff.svelte.js';
	import { navigation } from '../stores/navigation.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';

	interface Props {
		paneIndex: number;
		/** Optional fixed height; defaults to 100% of parent. */
		height?: string | number;
	}

	let { paneIndex, height }: Props = $props();

	const changes = $derived(diffStore.getDiffsForPane(paneIndex));
	const markers = $derived(
		changes.filter(
			(c) => c.type === 'added' || c.type === 'removed' || c.type === 'modified'
		)
	);
	const totalLines = $derived.by(() => {
		const content = paneStore.panes[paneIndex]?.content ?? '';
		if (!content) {
			return 1;
		}
		return Math.max(1, content.split('\n').length);
	});

	const heightStyle = $derived(
		height === undefined
			? '100%'
			: typeof height === 'number'
				? `${height}px`
				: height
	);

	function markerTop(lineNumber: number): string {
		const ratio = (Math.max(1, lineNumber) - 1) / totalLines;
		return `${Math.min(100, Math.max(0, ratio * 100))}%`;
	}

	function markerColor(type: string): string {
		if (type === 'added') {
			return 'bg-green-500/50 dark:bg-green-400/40';
		}
		if (type === 'removed') {
			return 'bg-red-500/50 dark:bg-red-400/40';
		}
		return 'bg-amber-500/50 dark:bg-amber-400/40';
	}

	function handleClick(lineNumber: number) {
		navigation.jumpTo(paneIndex, lineNumber);
	}

	function handleKeydown(e: KeyboardEvent, lineNumber: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(lineNumber);
		}
	}
</script>

<div
	class="relative w-2 shrink-0 h-full border-l border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50"
	style:height={heightStyle}
	role="navigation"
	aria-label="Change overview minimap"
>
	{#each markers as marker (marker.lineNumber + marker.type)}
		<button
			type="button"
			class="absolute left-0 right-0 h-1 min-h-[3px] w-full border-0 p-0 cursor-pointer
				hover:opacity-100 opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
				{markerColor(marker.type)}"
			style:top={markerTop(marker.lineNumber)}
			title={`Line ${marker.lineNumber} (${marker.type})`}
			aria-label={`Jump to ${marker.type} change on line ${marker.lineNumber}`}
			onclick={() => handleClick(marker.lineNumber)}
			onkeydown={(e) => handleKeydown(e, marker.lineNumber)}
		></button>
	{/each}
</div>
