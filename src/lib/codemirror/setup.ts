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

export function createBaseExtensions(themeExtension: Extension, wrap: boolean): Extension[] {
	return [
		lineNumbers(),
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
		languageCompartment.of([]),
		themeCompartment.of(themeExtension),
		wrapCompartment.of(getWrapExtension(wrap)),
		diffDecorationField,
		paddingDecorationField
	];
}
