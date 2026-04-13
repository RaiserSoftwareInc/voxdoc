# @voxdoc/mcp

MCP (Model Context Protocol) server for AI-first authoring of [Vox](https://github.com/RaiserSoftwareInc/voxdoc) documents.

## Install

```bash
npm install @voxdoc/mcp
```

## Usage

```typescript
import { startServer } from "@voxdoc/mcp";

// Start MCP server for a document
await startServer("document.vox");
```

Or use the CLI:

```bash
vox mcp serve document.vox
```

## MCP Tools (21 total)

**Reads:** `get_document`, `list_blocks`, `get_block`, `get_schema`, `search_blocks`

**Writes:** `add_block`, `edit_block`, `delete_block`, `move_block`, `set_metadata`, `set_variable`

**Review:** `add_comment`, `list_comments`, `resolve_comment`, `set_block_status`, `set_status`

**Accessibility:** `set_description`, `set_transcription`, `get_accessibility_report`

**Output:** `validate`, `compile`

## Claude Desktop Config

```json
{
  "mcpServers": {
    "vox-document": {
      "command": "vox",
      "args": ["mcp", "serve", "/path/to/document.vox"]
    }
  }
}
```

## License

MIT — Raiser Software Inc.
