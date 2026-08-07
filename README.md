# YeahDiff

A web-based multi-text comparison tool. Compare unlimited texts side-by-side with real-time diff highlighting, auto syntax detection, and synchronized scrolling.

## Features

- **Unlimited panes** - Add as many text panes as you need
- **Two diff modes** - Base (all vs one) or Adjacent (neighbors)
- **Line and word-level diffs** - Changed lines highlighted with word-level detail
- **Aligned layout** - Optional spacing so matching lines stay side-by-side
- **Auto syntax detection** - JS/TS, Python, Rust, Go, Java, C++, PHP, SQL, CSS, HTML, XML, JSON, Markdown
- **Light / dark / system theme**
- **Synchronized scrolling** and word wrap (toggleable)
- **Shareable URLs** - Encode pane content into the URL hash
- **Session import/export** - JSON files for larger content
- **Search across panes** - Ctrl/Cmd+F
- **Drag and drop files** into any pane
- **Mobile stack and compare layouts**
- **Large file safeguards** - Warnings and skip heavy diffs for very large content

## Tech Stack

- Svelte 5 (SvelteKit) with TypeScript
- CodeMirror 6 (direct API, no wrapper)
- jsdiff for diff computation
- Tailwind CSS 4

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

## Keyboard Shortcuts

| Shortcut   | Action                    |
| ---------- | ------------------------- |
| Ctrl/Cmd+N | Add pane                  |
| Ctrl/Cmd+F | Search across panes       |
| Ctrl/Cmd+K | Keyboard shortcuts modal  |
| Esc        | Close modal or menu       |

## License

MIT
