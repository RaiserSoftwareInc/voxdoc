import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerWriteTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.registerTool(
    "add_block",
    {
      description: "Add a new block to the document",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        type: z.string(),
        content: z.record(z.string(), z.any()),
        after: z.string().optional(),
      },
    },
    async ({ type, content, after }) => {
      const blockData = { type, ...content } as Parameters<DocumentStore["addBlock"]>[0];
      const id = getStore().addBlock(blockData, after);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "edit_block",
    {
      description: "Edit an existing block",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        id: z.string(),
        content: z.record(z.string(), z.any()),
      },
    },
    async ({ id, content }) => {
      try {
        getStore().editBlock(id, content);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: (e as Error).message }) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "delete_block",
    {
      description: "Delete a block from the document",
      annotations: { readOnlyHint: false, destructiveHint: true },
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      try {
        getStore().deleteBlock(id);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: (e as Error).message }) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "move_block",
    {
      description: "Move a block to a new position",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        id: z.string(),
        after: z.string().optional(),
      },
    },
    async ({ id, after }) => {
      try {
        getStore().moveBlock(id, after);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: (e as Error).message }) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "set_metadata",
    {
      description: "Set a metadata field",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        key: z.string(),
        value: z.any(),
      },
    },
    async ({ key, value }) => {
      getStore().setMetadata(key, value);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );

  server.registerTool(
    "set_variable",
    {
      description: "Set a template variable",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        key: z.string(),
        value: z.string(),
      },
    },
    async ({ key, value }) => {
      getStore().setVariable(key, value);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );
}
