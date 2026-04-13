# @voxdoc/cli

CLI for creating, validating, compiling, and serving [Vox](https://github.com/RaiserSoftwareInc/voxdoc) documents.

## Install

```bash
npm install -g @voxdoc/cli
```

## Commands

```bash
# Create a new document
vox init my-doc.vox --title "My Document"

# Register .vox files with your OS (first time only)
vox setup

# Validate against schema + accessibility rules
vox validate my-doc.vox

# Recompile (re-renders the self-rendering HTML)
vox compile my-doc.vox

# Show document metadata
vox info my-doc.vox

# List all blocks
vox blocks my-doc.vox

# Open in browser
vox view my-doc.vox

# Start MCP server for AI authoring (file or directory)
vox mcp serve my-doc.vox
vox mcp serve ./docs/
```

## How it works

Vox documents are self-rendering HTML files with embedded JSON source. Double-click a `.vox` file to view it in any browser. AI agents connect via MCP to author documents. Humans review by exception.

```bash
vox init doc.vox --title "API Docs"    # creates self-rendering .vox
# open doc.vox in browser → see it immediately
# AI edits via MCP → file re-renders automatically
vox compile doc.vox                     # re-render from embedded source
```

## License

MIT — Raiser Software Inc.
