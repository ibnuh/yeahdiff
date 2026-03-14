import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import type { Extension } from '@codemirror/state';

export const lightTheme: Extension = [
	EditorView.theme({
		'&': {
			backgroundColor: '#ffffff',
			color: '#24292e'
		},
		'.cm-gutters': {
			backgroundColor: '#f6f8fa',
			color: '#6e7781',
			borderRight: '1px solid #d0d7de'
		},
		'.cm-activeLineGutter': {
			backgroundColor: '#eaeef2'
		},
		'.cm-activeLine': {
			backgroundColor: '#f6f8fa'
		},
		'.cm-selectionBackground': {
			backgroundColor: 'rgba(59, 130, 246, 0.35) !important'
		},
		'&.cm-focused .cm-cursor': {
			borderLeftColor: '#24292e'
		}
	}),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true })
];

export const darkTheme: Extension = oneDark;

export function getThemeExtension(isDark: boolean): Extension {
	return isDark ? darkTheme : lightTheme;
}
