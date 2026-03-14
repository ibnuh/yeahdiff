export function loadFromStorage<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const stored = localStorage.getItem(key);
		if (stored !== null) return JSON.parse(stored) as T;
	} catch {}
	return fallback;
}

export function saveToStorage(key: string, value: unknown): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
