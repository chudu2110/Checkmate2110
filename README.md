# Checkmate2110 – Chess Puzzle Player (Next.js)

A minimal Next.js app for mate‑in‑N chess puzzles.

**Features**
- Intro page with an animated/3D chess scene.
- Play page with an interactive board, move highlights, and default dark mode.

**How It Works**
- Puzzles are loaded from `problems.json`.
- Data is adapted to the app via `src/lib/problems-adapter.ts`.
- Static export is enabled (`output: 'export'`), files are written to `out/`.

**Quick Start**
- Requirements: Node.js 18+
- Install: `npm install`
- Develop: `npm run dev` then open `http://localhost:3000/intro` and `http://localhost:3000/play`
- Build static: `npm run build` → check `out/intro` and `out/play`

**Deploy**
- Netlify: `netlify.toml` publishes `out/`.
- GitHub Pages: publish the contents of `out/`.