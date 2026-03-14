# YeahDiff

A web-based multi-text comparison tool. Compare unlimited texts side-by-side with real-time diff highlighting, auto syntax detection, and synchronized scrolling.

## Features

- **Unlimited panes** - Add as many text panes as you need, each taking equal width
- **Two diff modes** - "Base" compares all panes against a selected base, "Adjacent" compares neighboring panes
- **Line and word-level diffs** - Changed lines are highlighted, with word-level detail within modified lines
- **Auto syntax detection** - Supports JS/TS, Python, Rust, Go, Java, C++, PHP, SQL, CSS, HTML, XML, JSON, Markdown
- **Light/dark/system theme** - Full theme support across the app and all editor panes
- **Synchronized scrolling** - Scroll all panes together (toggleable)
- **Full-width toggle** - Use the entire screen or a contained layout
- **Keyboard shortcuts** - Ctrl/Cmd+N to add a new pane

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

## License

MIT
