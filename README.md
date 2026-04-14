# Vox — Documents with a voice

An AI-first, accessible, open document format. AI authors documents, humans review by exception.

Vox documents are self-rendering HTML files with embedded structured JSON. Double-click to view in any browser. Connect an AI agent via MCP to author content. The compiler enforces WCAG 2.1 AA accessibility — no exceptions.

## Install

```bash
npm install -g @voxdoc/cli
```

## Quick Start

```bash
# Create a document (creates my-doc.vox.html)
vox init my-doc --title "My Document"

# Open it — double-click in any browser, no setup needed
# Add blocks, then recompile
vox compile my-doc.vox.html

# Validate against schema + accessibility rules
vox validate my-doc.vox.html

# Start MCP server for AI authoring (single file or directory)
vox mcp serve my-doc.vox.html
vox mcp serve ./docs/
```

> `.vox.html` files open directly in any browser — no `vox setup` required. `vox setup` is optional and only needed if you want OS-level file association for double-clicking `.vox.html` files.

## How It Works

```
AI Agent ──MCP──▶ .vox.html ──Compiler──▶ Self-contained HTML
                     ▲                         │
                     │                         ▼
                     └──── Human Review ◀── Browser
```

1. **AI connects via MCP** — 24 tools for reading, writing, reviewing, and compiling documents
2. **AI builds the document** block by block — headings, paragraphs, tables, diagrams, code, callouts
3. **AI self-reviews** — flags blocks it's uncertain about, auto-approves the rest
4. **Human reviews only flagged blocks** — approve, flag with a comment, or skip
5. **Zero flags = ships automatically** — no human needed for routine documents

## Block Types (18)

| Core      | Enhanced                               |
| --------- | -------------------------------------- |
| heading   | callout (info/warning/danger/tip/note) |
| paragraph | diagram (Mermaid, Graphviz, D2)        |
| code      | table (with screen reader summary)     |
| image     | math (KaTeX with MathSpeak)            |
| list      | tabs                                   |
| toc       | accordion, steps, layout               |
|           | handwriting (with AI transcription)    |

## Accessibility

Compilation fails if accessibility fields are missing. This is not optional.

- Every `image` needs `alt` text
- Every `diagram` needs a `description` for screen readers
- Every `table` needs a `summary`
- Every `math` block needs `spoken` text (MathSpeak)
- Compiled HTML is WCAG 2.1 AA compliant, responsive from 320px upward

## Packages

| Package                               | Description                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| [@voxdoc/cli](packages/cli)           | CLI — `vox init`, `validate`, `compile`, `view`, `mcp serve` |
| [@voxdoc/schema](packages/schema)     | TypeScript types, JSONSchema, validation                     |
| [@voxdoc/compiler](packages/compiler) | Compiles Vox documents to self-contained HTML                |
| [@voxdoc/mcp](packages/mcp)           | MCP server for AI-first document authoring                   |

## MCP Server

Connect any MCP-compatible AI agent to author Vox documents. Serve a single file or a whole directory:

```bash
# Single document
vox mcp serve my-doc.vox.html

# Workspace — AI can list, open, and create documents in the directory
vox mcp serve ./docs/
```

```json
{
  "mcpServers": {
    "vox-document": {
      "command": "vox",
      "args": ["mcp", "serve", "path/to/docs/"]
    }
  }
}
```

**24 tools:**

| Category      | Tools                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Workspace     | list_documents, open_document, create_document                              |
| Read          | get_document, list_blocks, get_block, get_schema, search_blocks             |
| Write         | add_block, edit_block, delete_block, move_block, set_metadata, set_variable |
| Review        | add_comment, list_comments, resolve_comment, set_block_status, set_status   |
| Accessibility | set_description, set_transcription, get_accessibility_report                |
| Output        | validate, compile                                                           |

## Development

```bash
git clone https://github.com/RaiserSoftwareInc/voxdoc.git
cd voxdoc
pnpm install
pnpm -r build
pnpm -r test    # 102 tests
```

## License

MIT — [Raiser Software Inc.](https://github.com/RaiserSoftwareInc)
