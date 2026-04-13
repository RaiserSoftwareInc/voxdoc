import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerWriteTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.tool(
    "add_block",
    "Add a new block to the document",
    {
      type: z.string(),
      content: z.record(z.string(), z.any()),
      after: z.string().optional(),
    },
    async ({ type, content, after }) => {
      const blockData = { type, ...content } as Parameters<DocumentStore["addBlock"]>[0];
      const id = getStore().addBlock(blockData, after);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id }, null, 2) }],
      };
    },
  );

  server.tool(
    "edit_block",
    "Edit an existing block",
    {
      id: z.string(),
      content: z.record(z.string(), z.any()),
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

  server.tool(
    "delete_block",
    "Delete a block from the document",
    { id: z.string() },
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

  server.tool(
    "move_block",
    "Move a block to a new position",
    {
      id: z.string(),
      after: z.string().optional(),
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

  server.tool(
    "set_metadata",
    "Set a metadata field",
    {
      key: z.string(),
      value: z.any(),
    },
    async ({ key, value }) => {
      getStore().setMetadata(key, value);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );

  server.tool(
    "set_variable",
    "Set a template variable",
    {
      key: z.string(),
      value: z.string(),
    },
    async ({ key, value }) => {
      getStore().setVariable(key, value);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );
}
