/** Cross-pane navigation requests (search jump, next/prev change, etc.) */
class NavigationStore {
	/** Monotonic token so the same line can be requested twice. */
	token = $state(0);
	paneIndex = $state(0);
	lineNumber = $state(1);
	/**
	 * Monotonic highlight token for unified view next/prev.
	 * UnifiedDiffView watches this (and token/lineNumber) to scroll + flash a row.
	 */
	unifiedHighlightToken = $state(0);
	/** Optional row index hint for unified highlight (-1 = resolve from lineNumber). */
	unifiedRowHint = $state(-1);

	jumpTo(paneIndex: number, lineNumber: number) {
		this.paneIndex = paneIndex;
		this.lineNumber = Math.max(1, lineNumber);
		this.token += 1;
		this.unifiedRowHint = -1;
		this.unifiedHighlightToken += 1;
	}

	/** Jump and highlight a specific unified display row. */
	jumpToUnified(paneIndex: number, lineNumber: number, rowIndex: number) {
		this.paneIndex = paneIndex;
		this.lineNumber = Math.max(1, lineNumber);
		this.token += 1;
		this.unifiedRowHint = rowIndex;
		this.unifiedHighlightToken += 1;
	}

	/** Highlight a specific unified display row (when known). */
	highlightUnifiedRow(rowIndex: number) {
		this.unifiedRowHint = rowIndex;
		this.unifiedHighlightToken += 1;
	}
}

export const navigation = new NavigationStore();
