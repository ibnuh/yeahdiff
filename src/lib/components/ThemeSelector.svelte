<script lang="ts">
	import { settings } from '../stores/settings.svelte.js';
	import { slide } from 'svelte/transition';

	let isOpen = $state(false);
	let containerRef: HTMLDivElement;

	const themeOptions = [
		{
			value: 'light' as const,
			label: 'Light',
			description: 'Always use light theme',
			icon: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>`
		},
		{
			value: 'dark' as const,
			label: 'Dark',
			description: 'Always use dark theme',
			icon: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>`
		},
		{
			value: 'system' as const,
			label: 'System',
			description: 'Follow system preference',
			icon: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"/></svg>`
		}
	];

	function selectTheme(theme: 'light' | 'dark' | 'system') {
		settings.setTheme(theme);
		isOpen = false;
	}

	function toggleOpen() {
		isOpen = !isOpen;
	}

	function closeOnClickOutside(e: MouseEvent) {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	const currentTheme = $derived(themeOptions.find(t => t.value === settings.theme));
</script>

<svelte:window onclick={closeOnClickOutside} />

<div bind:this={containerRef} class="relative">
	<!-- Desktop Trigger Button -->
	<button
		type="button"
		class="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
		onclick={toggleOpen}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-label="Select theme"
	>
		<span class="w-4 h-4">
			{@html currentTheme?.icon}
		</span>
		<span class="text-sm font-medium">{currentTheme?.label}</span>
		<svg class="w-3.5 h-3.5 transition-transform {isOpen ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
		</svg>
	</button>

	<!-- Mobile Trigger Button -->
	<button
		type="button"
		class="md:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
		onclick={toggleOpen}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-label="Select theme"
	>
		<span class="w-5 h-5">
			{@html currentTheme?.icon}
		</span>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
			role="listbox"
			transition:slide={{ duration: 150 }}
		>
			<div class="p-1.5 space-y-0.5">
				{#each themeOptions as option}
					<button
						type="button"
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors
							{settings.theme === option.value
								? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
								: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}"
						onclick={() => selectTheme(option.value)}
						role="option"
						aria-selected={settings.theme === option.value}
					>
						<span class="w-5 h-5 shrink-0">
							{@html option.icon}
						</span>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium">{option.label}</div>
							<div class="text-xs opacity-70 truncate">{option.description}</div>
						</div>
						{#if settings.theme === option.value}
							<svg class="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
