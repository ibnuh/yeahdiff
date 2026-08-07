<script lang="ts">
	import '../app.css';
	import { settings } from '$lib/stores/settings.svelte.js';
	import Toast from '$lib/components/Toast.svelte';
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
</script>

<div class="h-screen flex flex-col app-bg app-text">
	{@render children()}
	<Toast />
</div>
