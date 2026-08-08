export type DiffChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface WordDiff {
	type: 'added' | 'removed' | 'unchanged';
	value: string;
}

export interface LineDiff {
	type: DiffChangeType;
	lineNumber: number;
	content: string;
	wordDiffs?: WordDiff[];
	side?: 'base' | 'target';
}

export interface PaddingEntry {
	afterLine: number;
	count: number;
}

export interface DiffResult {
	paneIndex: number;
	basePaneIndex: number;
	changes: LineDiff[];
	padding: PaddingEntry[];
}

export type DiffMode = 'base' | 'adjacent';

/** Aligned left/right pair result from computeAlignedPair. */
export interface AlignedPairResult {
	changesA: LineDiff[];
	changesB: LineDiff[];
	paddingA: PaddingEntry[];
	paddingB: PaddingEntry[];
}

/** Minimal pair shape accepted by buildHunks. */
export interface DiffPairChanges {
	changesA: LineDiff[];
	changesB: LineDiff[];
}

/**
 * Group of consecutive changes for collapse / navigation.
 * Line ranges are inclusive and 1-based. When contextLines is applied,
 * start/end expand around the change cluster (callers should clamp to doc length).
 * 0 means no lines on that side.
 */
export interface DiffHunk {
	startLineA: number;
	endLineA: number;
	startLineB: number;
	endLineB: number;
	/** Number of actual changed lines (A + B, excluding pure context). */
	changeCount: number;
	changesA: LineDiff[];
	changesB: LineDiff[];
}

export type UnifiedDiffLineKind = 'context' | 'removed' | 'added' | 'modified';

/**
 * One row in a unified (stacked) diff view.
 * Context lines appear once with both line numbers when available.
 * Modified lines are typically emitted as removed then added; wordDiffs
 * may be attached on either side when useful.
 */
export interface UnifiedDiffLine {
	kind: UnifiedDiffLineKind;
	lineNumberA?: number;
	lineNumberB?: number;
	content: string;
	wordDiffs?: WordDiff[];
}

/** Separator / expand control between collapsed context regions. */
export interface UnifiedHunkSeparator {
	kind: 'separator';
	/** How many context lines were omitted before the next shown block. */
	omitted: number;
	/** Line range label for git-style hunk headers. */
	header: string;
	/** Expand this separator to show omitted context. */
	expandFromA: number;
	expandToA: number;
	expandFromB: number;
	expandToB: number;
}

export type UnifiedRow = UnifiedDiffLine | UnifiedHunkSeparator;

/** Options shared by diff / hunk / unified builders. Defaults are all false / unset. */
export interface DiffViewOptions {
	/** Context lines around each change region (default 3 when collapsing). */
	contextLines?: number;
	/** Ignore leading/trailing whitespace when comparing lines (jsdiff). */
	ignoreWhitespace?: boolean;
	/** Treat upper/lowercase as equal when comparing (jsdiff). */
	ignoreCase?: boolean;
}

/** Compute options without view-specific fields. */
export type DiffComputeOptions = Pick<DiffViewOptions, 'ignoreWhitespace' | 'ignoreCase'>;

/** Primary pair of texts used for unified view / pair-focused UX. */
export interface PrimaryPairTexts {
	textA: string;
	textB: string;
	indexA: number;
	indexB: number;
}
