<script lang="ts">
	import '../app.css';
	import { settings } from '$lib/stores/settings.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		const el = document.documentElement;
		if (settings.isDark) {
			el.classList.add('dark');
		} else {
			el.classList.remove('dark');
		}
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			if (settings.theme === 'system') {
				const el = document.documentElement;
				if (mq.matches) {
					el.classList.add('dark');
				} else {
					el.classList.remove('dark');
				}
			}
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

<div class="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
	{@render children()}
</div>
