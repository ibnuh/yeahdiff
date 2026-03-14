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
