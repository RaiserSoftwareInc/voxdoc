# @voxdoc/cli

CLI for creating, validating, compiling, and serving [Vox](https://github.com/RaiserSoftwareInc/voxdoc) documents.

## Install

```bash
npm install -g @voxdoc/cli
```

## Commands

```bash
# Create a new document
vox init my-doc.vox.html --title "My Document"

# Register legacy .vox files with your OS (optional)
vox setup

# Validate against schema + accessibility rules
vox validate my-doc.vox.html

# Recompile (re-renders the self-rendering HTML)
vox compile my-doc.vox.html

# Show document metadata
vox info my-doc.vox.html

# List all blocks
vox blocks my-doc.vox.html

# Open in browser
vox view my-doc.vox.html

# Start MCP server for AI authoring (file or directory)
vox mcp serve my-doc.vox.html
vox mcp serve ./docs/
```

## How it works

Vox documents are self-rendering HTML files with embedded JSON source. Double-click a `.vox.html` file to view it in any browser. AI agents connect via MCP to author documents. Humans review by exception.

```bash
vox init doc.vox.html --title "API Docs"    # creates self-rendering .vox.html
# open doc.vox.html in browser → see it immediately
# AI edits via MCP → file re-renders automatically
vox compile doc.vox.html                     # re-render from embedded source
```

## License

MIT — Raiser Software Inc.
