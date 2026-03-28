import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

// Clean, high-contrast light theme colors
const lightColors = {
	bg: '#ffffff',           // Pure white background for readability
	fg: '#1a1a1a',           // Near-black text for maximum contrast
	lineBg: '#f8f9fa',       // Light gray for gutters
	lineFg: '#495057',       // Darker gray for line numbers (better visibility)
	border: '#dee2e6',       // Clear border
	activeLine: '#e9ecef',   // Visible highlight
	selection: 'rgba(13, 110, 253, 0.25)',
	cursor: '#1a1a1a'
};

// Custom syntax highlighting for light theme
const lightHighlightStyle = HighlightStyle.define([
	{ tag: tags.keyword, color: '#d53f8c' },
	{ tag: tags.operator, color: '#d53f8c' },
	{ tag: tags.className, color: '#3182ce' },
	{ tag: tags.definition(tags.typeName), color: '#3182ce' },
	{ tag: tags.typeName, color: '#38a169' },
	{ tag: tags.tagName, color: '#e53e3e' },
	{ tag: tags.attributeName, color: '#dd6b20' },
	{ tag: tags.attributeValue, color: '#38a169' },
	{ tag: tags.string, color: '#38a169' },
	{ tag: tags.comment, color: '#a0aec0', fontStyle: 'italic' },
	{ tag: tags.name, color: '#2d3748' },
	{ tag: tags.heading, color: '#2d3748', fontWeight: 'bold' },
	{ tag: tags.url, color: '#3182ce', textDecoration: 'underline' },
	{ tag: tags.literal, color: '#dd6b20' },
	{ tag: tags.number, color: '#dd6b20' },
	{ tag: tags.bool, color: '#d53f8c' },
	{ tag: tags.propertyName, color: '#2d3748' },
	{ tag: tags.variableName, color: '#2d3748' },
]);

export const lightTheme: Extension = [
	EditorView.theme({
		'&': {
			backgroundColor: lightColors.bg,
			color: lightColors.fg
		},
		'.cm-gutters': {
			backgroundColor: lightColors.lineBg,
			color: lightColors.lineFg,
			borderRight: `1px solid ${lightColors.border}`
		},
		'.cm-activeLineGutter': {
			backgroundColor: lightColors.activeLine
		},
		'.cm-activeLine': {
			backgroundColor: lightColors.activeLine
		},
		'.cm-selectionBackground': {
			backgroundColor: `${lightColors.selection} !important`
		},
		'&.cm-focused .cm-cursor': {
			borderLeftColor: lightColors.cursor
		},
		'.cm-foldPlaceholder': {
			backgroundColor: lightColors.lineBg,
			border: `1px solid ${lightColors.border}`,
			color: lightColors.fg
		}
	}),
	syntaxHighlighting(lightHighlightStyle, { fallback: true })
];

export const darkTheme: Extension = oneDark;

export function getThemeExtension(isDark: boolean): Extension {
	return isDark ? darkTheme : lightTheme;
}
