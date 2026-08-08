import { createTwoFilesPatch, FILE_HEADERS_ONLY } from 'diff';
import type { DiffComputeOptions } from './types.js';

export type BuildUnifiedPatchOptions = DiffComputeOptions & {
	fileA?: string;
	fileB?: string;
	/** Context lines around each change (default 3). */
	contextLines?: number;
};

/**
 * Build a git-style unified patch string for two texts.
 * Pure function (no DOM). Headers look like:
 *
 * ```
 * --- a
 * +++ b
 * @@ -x,y +u,v @@
 *  context
 * -removed
 * +added
 * ```
 */
export function buildUnifiedPatch(
	textA: string,
	textB: string,
	opts?: BuildUnifiedPatchOptions
): string {
	const fileA = opts?.fileA ?? 'a';
	const fileB = opts?.fileB ?? 'b';
	const context = opts?.contextLines ?? 3;

	// jsdiff line equality supports ignoreCase via Diff base; types only list ignoreWhitespace.
	const patchOptions = {
		context,
		ignoreWhitespace: opts?.ignoreWhitespace ?? false,
		ignoreCase: opts?.ignoreCase ?? false,
		headerOptions: FILE_HEADERS_ONLY
	};

	return createTwoFilesPatch(
		fileA,
		fileB,
		textA,
		textB,
		undefined,
		undefined,
		patchOptions as Parameters<typeof createTwoFilesPatch>[6]
	);
}
