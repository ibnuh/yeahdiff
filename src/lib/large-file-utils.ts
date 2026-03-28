export const MAX_DIFF_LINES = 10000;
const WARNING_THRESHOLD = 5000;

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatLineCount(lines: number): string {
	if (lines === 0) return '0 lines';
	if (lines === 1) return '1 line';
	if (lines < 1000) return `${lines} lines`;
	if (lines < 1000000) return `${(lines / 1000).toFixed(1)}k lines`;
	return `${(lines / 1000000).toFixed(1)}M lines`;
}

export function shouldSkipDiff(lines: number): boolean {
	return lines > MAX_DIFF_LINES;
}

export function shouldShowWarning(lines: number): boolean {
	return lines > WARNING_THRESHOLD;
}
