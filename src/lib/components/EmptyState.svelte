<script lang="ts">
	import { paneStore } from '../stores/panes.svelte.js';

	const examples = [
		{
			name: 'Simple Text Diff',
			description: 'Compare two versions of a paragraph',
			load: () => {
				paneStore.updateContent(paneStore.panes[0].id, 'The quick brown fox jumps over the lazy dog. This is the original text that we want to compare.');
				if (paneStore.panes[1]) {
					paneStore.updateContent(paneStore.panes[1].id, 'The quick brown fox jumps over the lazy dog. This is the modified text with some changes added here.');
				} else {
					paneStore.addPane();
					paneStore.updateContent(paneStore.panes[1].id, 'The quick brown fox jumps over the lazy dog. This is the modified text with some changes added here.');
				}
			}
		},
		{
			name: 'JSON Comparison',
			description: 'Compare JSON objects side by side',
			load: () => {
				const json1 = JSON.stringify({ name: 'Alice', age: 30, city: 'New York' }, null, 2);
				const json2 = JSON.stringify({ name: 'Alice', age: 31, city: 'Boston' }, null, 2);
				paneStore.updateContent(paneStore.panes[0].id, json1);
				if (paneStore.panes[1]) {
					paneStore.updateContent(paneStore.panes[1].id, json2);
				} else {
					paneStore.addPane();
					paneStore.updateContent(paneStore.panes[1].id, json2);
				}
			}
		},
		{
			name: 'Code Diff',
			description: 'Compare code with syntax highlighting',
			load: () => {
				const code1 = `function greet(name) {
  console.log('Hello, ' + name);
}`;
				const code2 = `function greet(name) {
  if (!name) {
    name = 'World';
  }
  console.log(\`Hello, \${name}!\`);
}`;
				paneStore.updateContent(paneStore.panes[0].id, code1);
				if (paneStore.panes[1]) {
					paneStore.updateContent(paneStore.panes[1].id, code2);
				} else {
					paneStore.addPane();
					paneStore.updateContent(paneStore.panes[1].id, code2);
				}
			}
		}
	];
</script>

<div class="flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8 text-center overflow-y-auto">
	<div class="max-w-md space-y-4 sm:space-y-6">
		<div class="space-y-2">
			<h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
				Welcome to YeahDiff
			</h2>
			<p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
				Compare text and code across multiple panes. Add panes with Ctrl+N, paste or drag files, and see differences highlighted automatically.
			</p>
		</div>

		<div class="space-y-2 sm:space-y-3">
			<p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-500">Try an example:</p>
			<div class="space-y-2">
				{#each examples as example}
					<button
						type="button"
						class="w-full text-left p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
						onclick={example.load}
					>
						<div class="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">{example.name}</div>
						<div class="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{example.description}</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="text-xs sm:text-sm text-gray-500 dark:text-gray-500 space-y-1">
			<p>Or get started by:</p>
			<ul class="space-y-0.5 sm:space-y-1">
				<li>• Pasting text directly into any pane</li>
				<li>• Dragging a file onto any pane</li>
				<li>• Using Ctrl+N to add more panes</li>
			</ul>
		</div>
	</div>
</div>
