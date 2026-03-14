import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import type { LineDiff } from '../diff/types.js';

const addedLineDeco = Decoration.line({ class: 'cm-diff-added' });
const modifiedLineDeco = Decoration.line({ class: 'cm-diff-added' });

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

		if (change.type === 'added') {
			lineDecos.push({ from: line.from, deco: addedLineDeco });
		} else if (change.type === 'modified') {
			lineDecos.push({ from: line.from, deco: modifiedLineDeco });
		}

		if (change.wordDiffs && change.wordDiffs.length > 0) {
			let pos = line.from;
			for (const wordDiff of change.wordDiffs) {
				const len = wordDiff.value.length;
				if (wordDiff.type === 'added' && len > 0) {
					const end = Math.min(pos + len, line.to);
					if (pos < end) {
						inlineDecos.push({
							from: pos,
							to: end,
							deco: Decoration.mark({ class: 'cm-diff-added-word' })
						});
					}
				}
				if (wordDiff.type !== 'removed') {
					pos += len;
				}
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
