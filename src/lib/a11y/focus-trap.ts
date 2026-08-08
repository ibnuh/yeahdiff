const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(', ');

function isVisible(el: HTMLElement): boolean {
	if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
		return false;
	}
	const style = window.getComputedStyle(el);
	if (style.display === 'none' || style.visibility === 'hidden') {
		return false;
	}
	return true;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

/**
 * Trap Tab focus inside `container`. Returns a cleanup function.
 * Does not move focus itself; call focus on the first control separately.
 */
export function trapFocus(container: HTMLElement): () => void {
	function onKeyDown(e: KeyboardEvent) {
		if (e.key !== 'Tab') {
			return;
		}

		const focusable = getFocusable(container);
		if (focusable.length === 0) {
			e.preventDefault();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (e.shiftKey) {
			if (active === first || !container.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (active === last || !container.contains(active)) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	container.addEventListener('keydown', onKeyDown);

	return () => {
		container.removeEventListener('keydown', onKeyDown);
	};
}

/** Restore focus to a previously focused element, if it is still focusable. */
export function restoreFocus(el: Element | null): void {
	if (el instanceof HTMLElement) {
		el.focus();
	}
}
