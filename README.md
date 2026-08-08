# YeahDiff

A web-based multi-text comparison tool. Compare unlimited texts side-by-side with real-time diff highlighting, auto syntax detection, and synchronized scrolling.

## Features

- **Unlimited panes** - Add as many text panes as you need, with optional labels
- **Two diff modes** - Base (all vs one) or Adjacent (neighbors)
- **Split and unified views** - Side-by-side editors or stacked unified diff
- **Line and word-level diffs** - Changed lines highlighted with word-level detail
- **Change styles** - Full background, gutter bars, or both
- **Aligned layout** - Optional spacing so matching lines stay side-by-side
- **Ignore whitespace / case** - Reduce noise on formatting-only changes
- **Next / previous change** - Jump between edits (Alt+Up/Down)
- **Auto syntax detection** - From content and dropped file names
- **Light / dark / system theme**
- **Synchronized scrolling** and word wrap (toggleable)
- **Shareable URLs** - Compressed hash encoding when supported
- **Session import/export** - JSON files for larger content
- **Unified patch export** - Copy or download a git-style patch
- **Search across panes** - Ctrl/Cmd+F
- **Drag and drop files** into any pane
- **Mobile stack and compare layouts**
- **Large file safeguards** - Warnings, skip heavy diffs, optional worker path
- **Change minimap** - Overview markers for quick jump

## Tech Stack

- Svelte 5 (SvelteKit) with TypeScript
- CodeMirror 6 (direct API, no wrapper)
- jsdiff for diff computation
- Tailwind CSS 4
- Vitest for unit tests

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building

```bash
npm run build
npm run preview
```

Produces a static site in the `build/` directory, deployable anywhere.

## Testing

```bash
npm test
```

## Keyboard Shortcuts

| Shortcut     | Action                         |
| ------------ | ------------------------------ |
| Ctrl/Cmd+N   | Add pane                       |
| Ctrl/Cmd+F   | Search across panes            |
| Ctrl/Cmd+K   | Keyboard shortcuts modal       |
| Ctrl/Cmd+U   | Toggle split / unified view    |
| Alt+Up/Down  | Previous / next change         |
| Esc          | Close modal or menu            |

## License

MIT
