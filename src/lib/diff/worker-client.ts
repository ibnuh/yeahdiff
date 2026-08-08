import { computePairwiseDiffs } from './engine.js';
import type { DiffMode, DiffResult } from './types.js';
import type { DiffWorkerRequest, DiffWorkerResponse } from './diff.worker.js';

type Pending = {
	resolve: (value: Map<number, DiffResult>) => void;
	reject: (reason?: unknown) => void;
};

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 1;
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
	if (workerFailed) {
		return null;
	}
	if (worker) {
		return worker;
	}
	if (typeof Worker === 'undefined') {
		workerFailed = true;
		return null;
	}
	try {
		worker = new Worker(new URL('./diff.worker.ts', import.meta.url), {
			type: 'module'
		});
		worker.onmessage = (event: MessageEvent<DiffWorkerResponse>) => {
			const { id, entries } = event.data;
			const request = pending.get(id);
			if (!request) {
				return;
			}
			pending.delete(id);
			request.resolve(new Map(entries));
		};
		worker.onerror = (err) => {
			workerFailed = true;
			for (const [, request] of pending) {
				request.reject(err);
			}
			pending.clear();
			if (worker) {
				worker.terminate();
				worker = null;
			}
		};
		return worker;
	} catch {
		workerFailed = true;
		return null;
	}
}

/**
 * Compute pairwise diffs off the main thread when Workers are available.
 * Falls back to synchronous computePairwiseDiffs otherwise.
 */
export function computePairwiseDiffsAsync(
	texts: string[],
	mode: DiffMode,
	baseIndex: number,
	aligned: boolean = false,
	options?: { ignoreWhitespace?: boolean; ignoreCase?: boolean }
): Promise<Map<number, DiffResult>> {
	const activeWorker = getWorker();
	if (!activeWorker) {
		return Promise.resolve(computePairwiseDiffs(texts, mode, baseIndex, aligned, options));
	}

	const id = nextId++;
	const request: DiffWorkerRequest = {
		id,
		texts,
		mode,
		baseIndex,
		aligned,
		ignoreWhitespace: options?.ignoreWhitespace,
		ignoreCase: options?.ignoreCase
	};

	return new Promise<Map<number, DiffResult>>((resolve, reject) => {
		pending.set(id, { resolve, reject });
		try {
			activeWorker.postMessage(request);
		} catch (err) {
			pending.delete(id);
			// Fall back to sync if postMessage fails
			resolve(computePairwiseDiffs(texts, mode, baseIndex, aligned, options));
		}
	});
}
