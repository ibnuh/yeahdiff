import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';

type ScrollCallback = (scrollTop: number, scrollLeft: number, source: EditorView) => void;

let scrollCallbacks: ScrollCallback[] = [];
let ignoreScroll = false;

export function registerScrollCallback(cb: ScrollCallback): () => void {
	scrollCallbacks.push(cb);
	return () => {
		scrollCallbacks = scrollCallbacks.filter((c) => c !== cb);
	};
}

export function clearScrollCallbacks(): void {
	scrollCallbacks = [];
}

export function createSyncScrollPlugin(enabled: () => boolean) {
	return ViewPlugin.fromClass(
		class {
			private view: EditorView;
			private handleScroll: () => void;
			private unregister: (() => void) | null = null;

			constructor(view: EditorView) {
				this.view = view;

				this.handleScroll = () => {
					if (!enabled() || ignoreScroll) return;

					const scrollDOM = this.view.scrollDOM;
					const scrollTop = scrollDOM.scrollTop;
					const scrollLeft = scrollDOM.scrollLeft;

					ignoreScroll = true;
					for (const cb of scrollCallbacks) {
						cb(scrollTop, scrollLeft, this.view);
					}
					requestAnimationFrame(() => {
						ignoreScroll = false;
					});
				};

				this.view.scrollDOM.addEventListener('scroll', this.handleScroll, { passive: true });

				this.unregister = registerScrollCallback(
					(scrollTop: number, scrollLeft: number, source: EditorView) => {
						if (source === this.view) return;
						this.view.scrollDOM.scrollTop = scrollTop;
						this.view.scrollDOM.scrollLeft = scrollLeft;
					}
				);
			}

			update(_update: ViewUpdate) {}

			destroy() {
				this.view.scrollDOM.removeEventListener('scroll', this.handleScroll);
				if (this.unregister) this.unregister();
			}
		}
	);
}
