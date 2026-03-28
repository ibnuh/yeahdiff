import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, lineNumbers, highlightActiveLineGutter, EditorView } from '@codemirror/view';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { diffDecorationField, paddingDecorationField } from './diff-decorations.js';

export const languageCompartment = new Compartment();
export const themeCompartment = new Compartment();
export const wrapCompartment = new Compartment();

export function getWrapExtension(wrap: boolean): Extension {
	return wrap ? EditorView.lineWrapping : [];
}

// Check if device is touch/mobile
function isTouchDevice(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(pointer: coarse)').matches || 
		   'ontouchstart' in window || 
		   navigator.maxTouchPoints > 0;
}

// Mobile-optimized line numbers with larger touch targets
function createLineNumbers(): Extension {
	const isMobile = isTouchDevice();
	return lineNumbers({
		formatNumber: (lineNo) => lineNo.toString()
	});
}

export function createBaseExtensions(themeExtension: Extension, wrap: boolean): Extension[] {
	const isMobile = isTouchDevice();
	
	return [
		createLineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			indentWithTab
		]),
		// Mobile-specific: prevent native touch scrolling from interfering
		isMobile ? EditorView.domEventHandlers({
			touchstart: (e, view) => {
				// Let CodeMirror handle touch events for editing
				return false;
			}
		}) : [],
		languageCompartment.of([]),
		themeCompartment.of(themeExtension),
		wrapCompartment.of(getWrapExtension(wrap)),
		diffDecorationField,
		paddingDecorationField
	];
}
