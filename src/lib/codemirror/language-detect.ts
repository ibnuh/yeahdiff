import type { Extension } from '@codemirror/state';

type LanguageLoader = () => Promise<Extension>;

interface LanguagePattern {
	name: string;
	test: (content: string) => boolean;
	load: LanguageLoader;
}

const languagePatterns: LanguagePattern[] = [
	{
		name: 'json',
		test: (content) => {
			const trimmed = content.trim();
			if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
				(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
				try {
					JSON.parse(trimmed);
					return true;
				} catch {
					return false;
				}
			}
			return false;
		},
		load: async () => {
			const { json } = await import('@codemirror/lang-json');
			return json();
		}
	},
	{
		name: 'html',
		test: (content) => /^\s*<!doctype\s+html/i.test(content) || /^\s*<html[\s>]/i.test(content),
		load: async () => {
			const { html } = await import('@codemirror/lang-html');
			return html();
		}
	},
	{
		name: 'xml',
		test: (content) => /^\s*<\?xml\s/i.test(content) || /^\s*<[a-zA-Z][\w-]*[\s>]/.test(content),
		load: async () => {
			const { xml } = await import('@codemirror/lang-xml');
			return xml();
		}
	},
	{
		name: 'php',
		test: (content) => /^\s*<\?php/i.test(content),
		load: async () => {
			const { php } = await import('@codemirror/lang-php');
			return php();
		}
	},
	{
		name: 'python',
		test: (content) =>
			/^#!.*python/m.test(content) ||
			/^\s*(def |class |import |from .+ import |if __name__)/m.test(content),
		load: async () => {
			const { python } = await import('@codemirror/lang-python');
			return python();
		}
	},
	{
		name: 'rust',
		test: (content) =>
			/^\s*(fn |pub fn |use |mod |struct |enum |impl |trait |let mut )/m.test(content),
		load: async () => {
			const { rust } = await import('@codemirror/lang-rust');
			return rust();
		}
	},
	{
		name: 'go',
		test: (content) =>
			/^\s*package\s+\w+/m.test(content) ||
			/^\s*func\s+/m.test(content) ||
			/^\s*import\s+\(/m.test(content),
		load: async () => {
			const { go } = await import('@codemirror/lang-go');
			return go();
		}
	},
	{
		name: 'java',
		test: (content) =>
			/^\s*(public |private |protected )?(class |interface |enum )/m.test(content) &&
			/;\s*$/m.test(content),
		load: async () => {
			const { java } = await import('@codemirror/lang-java');
			return java();
		}
	},
	{
		name: 'cpp',
		test: (content) =>
			/^\s*#include\s+[<"]/m.test(content) ||
			/^\s*(namespace |template\s*<|std::)/m.test(content),
		load: async () => {
			const { cpp } = await import('@codemirror/lang-cpp');
			return cpp();
		}
	},
	{
		name: 'sql',
		test: (content) =>
			/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s/im.test(content),
		load: async () => {
			const { sql } = await import('@codemirror/lang-sql');
			return sql();
		}
	},
	{
		name: 'css',
		test: (content) =>
			/^\s*(@import|@media|@keyframes|\*|body|html|\.[\w-]+\s*\{|#[\w-]+\s*\{)/m.test(content),
		load: async () => {
			const { css } = await import('@codemirror/lang-css');
			return css();
		}
	},
	{
		name: 'markdown',
		test: (content) =>
			/^#{1,6}\s+/m.test(content) ||
			(/^\s*[-*+]\s+/m.test(content) && /\[.*\]\(.*\)/m.test(content)),
		load: async () => {
			const { markdown } = await import('@codemirror/lang-markdown');
			return markdown();
		}
	},
	{
		name: 'javascript',
		test: (content) =>
			/^#!.*node/m.test(content) ||
			/^\s*(import |export |const |let |var |function |class |async |=>)/m.test(content) ||
			/^\s*(require\(|module\.exports)/m.test(content),
		load: async () => {
			const { javascript } = await import('@codemirror/lang-javascript');
			return javascript({ jsx: true, typescript: true });
		}
	}
];

export const availableLanguages: string[] = languagePatterns.map((p) => p.name);

export interface DetectedLanguage {
	name: string;
	extension: Extension;
}

export async function loadLanguageByName(name: string): Promise<Extension | null> {
	const pattern = languagePatterns.find((p) => p.name === name);
	if (!pattern) return null;
	return pattern.load();
}

export async function detectLanguage(content: string): Promise<DetectedLanguage | null> {
	if (!content.trim()) return null;

	const sample = content.slice(0, 5000);

	for (const pattern of languagePatterns) {
		if (pattern.test(sample)) {
			const extension = await pattern.load();
			return { name: pattern.name, extension };
		}
	}

	return null;
}
