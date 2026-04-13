import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { voxDocumentSchema } from "@vox/schema";
import type { DocumentStore } from "../document-store.js";

export function registerReadTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.tool("get_document", "Get the full Vox document", {}, async () => {
    const doc = getStore().getDocument();
    return {
      content: [{ type: "text", text: JSON.stringify(doc, null, 2) }],
    };
  });

  server.tool("list_blocks", "List all blocks with summaries", {}, async () => {
    const blocks = getStore().listBlocks();
    return {
      content: [{ type: "text", text: JSON.stringify(blocks, null, 2) }],
    };
  });

  server.tool(
    "get_block",
    "Get a single block by ID",
    { id: z.string() },
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

  server.tool("get_schema", "Get the Vox document JSON schema", {}, async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(voxDocumentSchema, null, 2) }],
    };
  });

  server.tool(
    "search_blocks",
    "Search blocks by content",
    { query: z.string() },
    async ({ query }) => {
      const results = getStore().searchBlocks(query);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}
