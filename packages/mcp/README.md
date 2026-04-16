# @voxdoc/mcp

MCP (Model Context Protocol) server for AI-first authoring of [Vox](https://github.com/RaiserSoftwareInc/voxdoc) documents.

## Install

```bash
npm install @voxdoc/mcp
```

## Usage

```typescript
import { startServer } from "@voxdoc/mcp";

// Start with a workspace path
await startServer("./docs/");

// Start without a path — AI calls set_workspace to configure
await startServer();
```

Or use the CLI:

```bash
# Single file
vox mcp serve document.vox.html

# Workspace — serve a directory of .vox.html files
vox mcp serve ./docs/

# Dynamic — AI calls set_workspace to choose a directory
vox mcp serve

# Register with Claude (one-time)
vox mcp install
```

## MCP Tools (26 total)

**Workspace:** `list_documents`, `open_document`, `create_document`, `set_workspace`, `get_workspace`

**Reads:** `get_document`, `list_blocks`, `get_block`, `get_schema`, `search_blocks`

**Writes:** `add_block`, `edit_block`, `delete_block`, `move_block`, `set_metadata`, `set_variable`

**Review:** `add_comment`, `list_comments`, `resolve_comment`, `set_block_status`, `set_status`

**Accessibility:** `set_description`, `set_transcription`, `get_accessibility_report`

**Output:** `validate`, `compile`

## Claude Setup

```bash
vox mcp install              # dynamic workspace
vox mcp install ./docs/      # fixed workspace
```

Or manually add to Claude config:

```json
{
  "mcpServers": {
    "vox-document": {
      "command": "vox",
      "args": ["mcp", "serve"]
    }
  }
}
```

## License

MIT — Raiser Software Inc.
