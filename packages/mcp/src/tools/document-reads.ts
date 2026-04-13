import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { voxDocumentSchema } from "@voxdoc/schema";
import type { DocumentStore } from "../document-store.js";

export function registerReadTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.registerTool("get_document", { description: "Get the full Vox document", annotations: { readOnlyHint: true, destructiveHint: false } }, async () => {
    const doc = getStore().getDocument();
    return {
      content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
    };
  });

  server.registerTool("list_blocks", { description: "List all blocks with summaries", annotations: { readOnlyHint: true, destructiveHint: false } }, async () => {
    const blocks = getStore().listBlocks();
    return {
      content: [{ type: "text", text: JSON.stringify(blocks, null, 2) }],
    };
  });

  server.registerTool(
    "get_block",
    {
      description: "Get a single block by ID",
      inputSchema: { id: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ id }) => {
      const block = getStore().getBlock(id);
      if (!block) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Block not found: ${id}` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(block, null, 2) }],
      };
    },
  );

  server.registerTool("get_schema", { description: "Get the Vox document JSON schema", annotations: { readOnlyHint: true, destructiveHint: false } }, async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(voxDocumentSchema, null, 2) }],
    };
  });

  server.registerTool(
    "search_blocks",
    {
      description: "Search blocks by content",
      inputSchema: { query: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async ({ query }) => {
      const results = getStore().searchBlocks(query);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}
