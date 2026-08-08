/// <reference lib="webworker" />
import { computePairwiseDiffs } from './engine.js';
import type { DiffMode, DiffResult } from './types.js';

export type DiffWorkerRequest = {
	id: number;
	texts: string[];
	mode: DiffMode;
	baseIndex: number;
	aligned: boolean;
	ignoreWhitespace?: boolean;
	ignoreCase?: boolean;
};

export type DiffWorkerResponse = {
	id: number;
	entries: Array<[number, DiffResult]>;
};

self.onmessage = (event: MessageEvent<DiffWorkerRequest>) => {
	const { id, texts, mode, baseIndex, aligned, ignoreWhitespace, ignoreCase } = event.data;
	const results = computePairwiseDiffs(texts, mode, baseIndex, aligned, {
		ignoreWhitespace,
		ignoreCase
	});
	const response: DiffWorkerResponse = {
		id,
		entries: Array.from(results.entries())
	};
	self.postMessage(response);
};
