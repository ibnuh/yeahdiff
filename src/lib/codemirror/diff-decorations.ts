import { EditorView, Decoration, WidgetType, type DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import type { LineDiff, PaddingEntry } from '../diff/types.js';

const addedLineDeco = Decoration.line({ class: 'cm-diff-added' });
const removedLineDeco = Decoration.line({ class: 'cm-diff-removed' });

export const setDiffDecorations = StateEffect.define<LineDiff[]>();

export const diffDecorationField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, tr) {
		for (const effect of tr.effects) {
			if (effect.is(setDiffDecorations)) {
				return buildDecorations(effect.value, tr.state.doc);
			}
		}
		return tr.docChanged ? Decoration.none : decorations;
	},
	provide: (f) => EditorView.decorations.from(f)
});

function buildDecorations(
	changes: LineDiff[],
	doc: { lines: number; line: (n: number) => { from: number; to: number; text: string } }
): DecorationSet {
	const lineDecos: { from: number; deco: Decoration }[] = [];
	const inlineDecos: { from: number; to: number; deco: Decoration }[] = [];

	for (const change of changes) {
		if (change.type === 'unchanged') continue;

		if (change.lineNumber < 1 || change.lineNumber > doc.lines) continue;

		const line = doc.line(change.lineNumber);

		if (change.type === 'added' || (change.type === 'modified' && change.side !== 'base')) {
			lineDecos.push({ from: line.from, deco: addedLineDeco });
		} else if (change.type === 'removed' || (change.type === 'modified' && change.side === 'base')) {
			lineDecos.push({ from: line.from, deco: removedLineDeco });
		}

		if (change.wordDiffs && change.wordDiffs.length > 0) {
			let pos = line.from;
			for (const wordDiff of change.wordDiffs) {
				const len = wordDiff.value.length;
				if (wordDiff.type !== 'unchanged' && len > 0) {
					const end = Math.min(pos + len, line.to);
					if (pos < end) {
						const className =
							wordDiff.type === 'added' ? 'cm-diff-added-word' : 'cm-diff-removed-word';
						inlineDecos.push({
							from: pos,
							to: end,
							deco: Decoration.mark({ class: className })
						});
					}
				}
				pos += len;
			}
		}
	}

	const allDecos = [
		...lineDecos.map((d) => d.deco.range(d.from)),
		...inlineDecos.map((d) => d.deco.range(d.from, d.to))
	];

	allDecos.sort((a, b) => a.from - b.from || a.startSide - b.startSide);

	return Decoration.set(allDecos);
}

class PaddingWidget extends WidgetType {
	constructor(
		readonly count: number,
		readonly lineHeight: number
	) {
		super();
	}

	toDOM() {
		const el = document.createElement('div');
		el.className = 'cm-diff-padding';
		el.style.height = `${this.count * this.lineHeight}px`;
		return el;
	}

	eq(other: PaddingWidget) {
		return this.count === other.count && this.lineHeight === other.lineHeight;
	}
}

export const setPaddingDecorations = StateEffect.define<{
	padding: PaddingEntry[];
	lineHeight: number;
}>();

export const paddingDecorationField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(decorations, tr) {
		for (const effect of tr.effects) {
			if (effect.is(setPaddingDecorations)) {
				return buildPaddingDecorations(
					effect.value.padding,
					effect.value.lineHeight,
					tr.state.doc
				);
			}
		}
		return tr.docChanged ? Decoration.none : decorations;
	},
	provide: (f) => EditorView.decorations.from(f)
});

function buildPaddingDecorations(
	padding: PaddingEntry[],
	lineHeight: number,
	doc: { lines: number; line: (n: number) => { from: number; to: number } }
): DecorationSet {
	if (padding.length === 0) return Decoration.none;

	const decos = [];

	for (const p of padding) {
		if (p.count <= 0) continue;

		let pos: number;
		if (p.afterLine <= 0) {
			pos = 0;
		} else if (p.afterLine <= doc.lines) {
			pos = doc.line(p.afterLine).to;
		} else {
			pos = doc.line(doc.lines).to;
		}

		decos.push(
			Decoration.widget({
				widget: new PaddingWidget(p.count, lineHeight),
				block: true,
				side: 1
			}).range(pos)
		);
	}

	decos.sort((a, b) => a.from - b.from);
	return Decoration.set(decos);
}
