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
	let isDraggingOver = $state(false);

	const pane = $derived(paneStore.panes.find((p) => p.id === paneId));

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDraggingOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		if (e.target === containerEl) {
			isDraggingOver = false;
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDraggingOver = false;

		const files = e.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.type.startsWith('text/') && !file.name.match(/\.(txt|js|ts|jsx|tsx|json|xml|html|css|scss|md|py|rb|go|rs|java|c|cpp|h|hpp|swift|kt|php|sql|yaml|yml|sh|bash|zsh|fish)$/)) {
			return;
		}

		try {
			const text = await file.text();
			if (view) {
				view.dispatch({
					changes: { from: 0, to: view.state.doc.length, insert: text }
				});
			}
		} catch (err) {
			console.error('Failed to read file:', err);
		}
	}

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

	// Sync content from store to editor (for shareable URL loading)
	$effect(() => {
		if (!view || !pane) return;
		const storeContent = pane.content;
		const editorContent = view.state.doc.toString();
		if (storeContent !== editorContent) {
			view.dispatch({
				changes: { from: 0, to: editorContent.length, insert: storeContent }
			});
		}
	});

</script>

<div
	class="h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0 overflow-hidden relative"
	class:ring-2={isDraggingOver}
	class:ring-blue-500={isDraggingOver}
	class:ring-inset={isDraggingOver}
	bind:this={containerEl}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
>
	{#if isDraggingOver}
		<div class="absolute inset-0 bg-blue-500/10 flex items-center justify-center z-10 pointer-events-none">
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
				Drop file to load
			</div>
		</div>
	{/if}
</div>
