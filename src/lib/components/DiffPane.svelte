<script lang="ts">
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { onMount } from 'svelte';
	import { createBaseExtensions, languageCompartment, themeCompartment } from '../codemirror/setup.js';
	import { setDiffDecorations } from '../codemirror/diff-decorations.js';
	import { createSyncScrollPlugin } from '../codemirror/sync-scroll.js';
	import { detectLanguage } from '../codemirror/language-detect.js';
	import { getThemeExtension } from '../codemirror/themes.js';
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import type { LineDiff } from '../diff/types.js';

	interface Props {
		paneId: string;
		paneIndex: number;
		diffs: LineDiff[];
	}

	let { paneId, paneIndex, diffs }: Props = $props();

	let containerEl: HTMLDivElement;
	let view: EditorView | null = null;
	let detectTimeout: ReturnType<typeof setTimeout> | null = null;

	const pane = $derived(paneStore.panes.find((p) => p.id === paneId));

	onMount(() => {
		const extensions = [
			...createBaseExtensions(getThemeExtension(settings.isDark)),
			createSyncScrollPlugin(() => settings.syncScroll),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const content = update.state.doc.toString();
					paneStore.updateContent(paneId, content);

					if (detectTimeout) clearTimeout(detectTimeout);
					detectTimeout = setTimeout(() => {
						runLanguageDetection(content);
					}, 1000);
				}
			})
		];

		const state = EditorState.create({
			doc: pane?.content ?? '',
			extensions
		});

		view = new EditorView({
			state,
			parent: containerEl
		});

		return () => {
			if (detectTimeout) clearTimeout(detectTimeout);
			view?.destroy();
			view = null;
		};
	});

	async function runLanguageDetection(content: string) {
		const detected = await detectLanguage(content);
		if (view && detected) {
			paneStore.setDetectedLanguage(paneId, detected.name);
			view.dispatch({
				effects: languageCompartment.reconfigure(detected.extension)
			});
		} else if (view && !detected) {
			paneStore.setDetectedLanguage(paneId, null);
			view.dispatch({
				effects: languageCompartment.reconfigure([])
			});
		}
	}

	$effect(() => {
		if (!view) return;
		const themeExt = getThemeExtension(settings.isDark);
		view.dispatch({
			effects: themeCompartment.reconfigure(themeExt)
		});
	});

	$effect(() => {
		if (!view) return;
		view.dispatch({
			effects: setDiffDecorations.of(diffs)
		});
	});

	const isBase = $derived(settings.diffMode === 'base' && settings.baseIndex === paneIndex);
</script>

<div class="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0">
	<div
		class="flex items-center justify-between px-3 py-1.5 border-b text-sm shrink-0
		{isBase
			? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
			: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}"
	>
		<div class="flex items-center gap-2">
			<span class="font-medium text-gray-700 dark:text-gray-300">
				Pane {paneIndex + 1}
			</span>
			{#if pane?.detectedLanguage}
				<span
					class="px-1.5 py-0.5 text-xs rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
				>
					{pane.detectedLanguage}
				</span>
			{/if}
			{#if isBase}
				<span
					class="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
				>
					base
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			{#if settings.diffMode === 'base' && !isBase}
				<button
					class="px-2 py-0.5 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
					onclick={() => settings.setBaseIndex(paneIndex)}
					title="Set as base"
				>
					Set base
				</button>
			{/if}
			{#if paneStore.count > 2}
				<button
					class="px-1.5 py-0.5 text-xs rounded hover:bg-red-100 dark:hover:bg-red-900 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
					onclick={() => paneStore.removePane(paneId)}
					title="Remove pane"
				>
					x
				</button>
			{/if}
		</div>
	</div>
	<div class="flex-1 min-h-0 overflow-hidden" bind:this={containerEl}></div>
</div>
