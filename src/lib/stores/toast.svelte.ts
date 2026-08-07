type ToastKind = 'info' | 'success' | 'error';

class ToastStore {
	message = $state('');
	kind = $state<ToastKind>('info');
	visible = $state(false);
	private hideTimeout: ReturnType<typeof setTimeout> | null = null;

	show(message: string, kind: ToastKind = 'info', durationMs = 2500) {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = null;
		}
		this.message = message;
		this.kind = kind;
		this.visible = true;
		this.hideTimeout = setTimeout(() => {
			this.visible = false;
		}, durationMs);
	}

	success(message: string, durationMs = 2500) {
		this.show(message, 'success', durationMs);
	}

	error(message: string, durationMs = 3500) {
		this.show(message, 'error', durationMs);
	}

	info(message: string, durationMs = 2500) {
		this.show(message, 'info', durationMs);
	}
}

export const toast = new ToastStore();
