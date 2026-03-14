<script lang="ts">
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { onMount } from 'svelte';
	import { createBaseExtensions, languageCompartment, themeCompartment, wrapCompartment, getWrapExtension } from '../codemirror/setup.js';
	import { setDiffDecorations, setPaddingDecorations } from '../codemirror/diff-decorations.js';
	import { createSyncScrollPlugin } from '../codemirror/sync-scroll.js';
	import { detectLanguage, loadLanguageByName } from '../codemirror/language-detect.js';
	import { getThemeExtension } from '../codemirror/themes.js';
	import { settings } from '../stores/settings.svelte.js';
	import { paneStore } from '../stores/panes.svelte.js';
	import type { LineDiff, PaddingEntry } from '../diff/types.js';

	interface Props {
		paneId: string;
		paneIndex: number;
		diffs: LineDiff[];
		padding: PaddingEntry[];
	}

	let { paneId, paneIndex, diffs, padding }: Props = $props();

	let containerEl: HTMLDivElement;
	let view: EditorView | null = null;
	let detectTimeout: ReturnType<typeof setTimeout> | null = null;

	const pane = $derived(paneStore.panes.find((p) => p.id === paneId));

	onMount(() => {
		const extensions = [
			...createBaseExtensions(getThemeExtension(settings.isDark), settings.wordWrap),
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

		const initialContent = pane?.content ?? '';
		if (initialContent.trim()) {
			if (pane?.manualLanguage) {
				applyLanguage(pane.manualLanguage);
			} else {
				runLanguageDetection(initialContent);
			}
		}

		return () => {
			if (detectTimeout) clearTimeout(detectTimeout);
			view?.destroy();
			view = null;
		};
	});

	async function runLanguageDetection(content: string) {
		if (pane?.manualLanguage) return;

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

	async function applyLanguage(name: string | null) {
		if (!view) return;
		if (name) {
			const ext = await loadLanguageByName(name);
			if (ext && view) {
				view.dispatch({ effects: languageCompartment.reconfigure(ext) });
			}
		} else {
			view.dispatch({ effects: languageCompartment.reconfigure([]) });
			const content = view.state.doc.toString();
			if (content.trim()) {
				runLanguageDetection(content);
			}
		}
	}

	$effect(() => {
		if (!view) return;
		const manual = pane?.manualLanguage;
		applyLanguage(manual ?? null);
	});

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
			effects: wrapCompartment.reconfigure(getWrapExtension(settings.wordWrap))
		});
	});

	$effect(() => {
		if (!view) return;
		view.dispatch({
			effects: setDiffDecorations.of(diffs)
		});
	});

	$effect(() => {
		if (!view) return;
		view.dispatch({
			effects: setPaddingDecorations.of({
				padding,
				lineHeight: view.defaultLineHeight
			})
		});
	});

</script>

<div class="h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0 overflow-hidden" bind:this={containerEl}></div>
