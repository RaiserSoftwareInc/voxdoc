# @voxdoc/compiler

Compiles [Vox](https://github.com/RaiserSoftwareInc/voxdoc) documents to self-contained, accessible, responsive HTML.

## Install

```bash
npm install @voxdoc/compiler
```

## Usage

```typescript
import { compile, readVoxSource } from "@voxdoc/compiler";
import fs from "node:fs";

// Read a .vox file (handles both self-rendering HTML and legacy JSON)
const content = fs.readFileSync("document.vox", "utf-8");
const doc = readVoxSource(content);

// Compile to HTML
const result = compile(doc);
if (result.success) {
  fs.writeFileSync("document.vox", result.html);
}
```

## Features

- Renders all 18 Vox block types to semantic HTML
- WCAG 2.1 AA compliant output — compilation fails if accessibility fields are missing
- Responsive CSS — readable from 320px screens upward
- Adaptive light/dark mode via `prefers-color-scheme`
- Self-contained output — single HTML file, no external dependencies (except Mermaid CDN for diagrams)
- Embedded source JSON — the compiled HTML contains the full Vox source for round-tripping

## License

MIT — Raiser Software Inc.
