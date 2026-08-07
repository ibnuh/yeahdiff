<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { toast } from '../stores/toast.svelte.js';
</script>

{#if toast.visible}
	<div
		class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
		transition:fly={{ y: 16, duration: 180 }}
		role="status"
		aria-live="polite"
	>
		<div
			class="pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium border
				{toast.kind === 'error'
				? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
				: toast.kind === 'success'
					? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800'
					: 'bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'}"
			transition:fade={{ duration: 120 }}
		>
			{toast.message}
		</div>
	</div>
{/if}
