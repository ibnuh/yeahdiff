import { buildUnifiedPatch } from './diff/patch.js';

export async function copyUnifiedPatch(
	oldText: string,
	newText: string,
	oldFileName = 'a',
	newFileName = 'b'
): Promise<boolean> {
	const patch = buildUnifiedPatch(oldText, newText, {
		fileA: oldFileName,
		fileB: newFileName
	});
	try {
		await navigator.clipboard.writeText(patch);
		return true;
	} catch {
		return false;
	}
}

export function downloadUnifiedPatch(
	oldText: string,
	newText: string,
	oldFileName = 'a',
	newFileName = 'b',
	filename = 'yeahdiff.patch'
): void {
	const patch = buildUnifiedPatch(oldText, newText, {
		fileA: oldFileName,
		fileB: newFileName
	});
	const blob = new Blob([patch], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
