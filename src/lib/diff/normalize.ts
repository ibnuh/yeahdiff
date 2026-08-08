export type NormalizeTextOptions = {
	/** Convert `\r\n` and `\r` to `\n`. */
	eol?: boolean;
	/** Strip trailing whitespace on each line. */
	trimTrailing?: boolean;
};

/**
 * Optional text normalization helpers for pre-diff processing.
 * Pure function; does not mutate the input string.
 */
export function normalizeText(text: string, opts?: NormalizeTextOptions): string {
	let out = text;

	if (opts?.eol) {
		out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	}

	if (opts?.trimTrailing) {
		out = out
			.split('\n')
			.map((line) => line.replace(/[ \t\f\v]+$/g, ''))
			.join('\n');
	}

	return out;
}
