<script lang="ts">
	import type { DiffStats } from '../diff/engine.js';

	interface Props {
		stats: DiffStats;
	}

	let { stats }: Props = $props();

	const hasChanges = $derived(stats.added + stats.removed + stats.modified > 0);
</script>

{#if hasChanges}
	<span class="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium tabular-nums" title="Diff summary">
		{#if stats.added > 0}
			<span class="text-green-700 dark:text-green-400">+{stats.added}</span>
		{/if}
		{#if stats.removed > 0}
			<span class="text-red-700 dark:text-red-400">-{stats.removed}</span>
		{/if}
		{#if stats.modified > 0}
			<span class="text-amber-700 dark:text-amber-400">~{stats.modified}</span>
		{/if}
	</span>
{/if}
