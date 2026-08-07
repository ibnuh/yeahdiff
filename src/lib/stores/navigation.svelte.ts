/** Cross-pane navigation requests (search jump, etc.) */
class NavigationStore {
	/** Monotonic token so the same line can be requested twice. */
	token = $state(0);
	paneIndex = $state(0);
	lineNumber = $state(1);

	jumpTo(paneIndex: number, lineNumber: number) {
		this.paneIndex = paneIndex;
		this.lineNumber = Math.max(1, lineNumber);
		this.token += 1;
	}
}

export const navigation = new NavigationStore();
