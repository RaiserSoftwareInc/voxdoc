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
      description: "Add one or more blocks to the document. Prefer batching multiple blocks in one call over separate calls to reduce token usage.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        blocks: z.array(z.object({
          type: z.string(),
          content: z.record(z.string(), z.any()),
        })),
        after: z.string().optional().describe("Insert all blocks after this block ID. Omit to append to end."),
      },
    },
    async ({ blocks, after }) => {
      const ids: string[] = [];
      let insertAfter = after;
      for (const block of blocks) {
        const blockData = { type: block.type, ...block.content } as Parameters<DocumentStore["addBlock"]>[0];
        const id = getStore().addBlock(blockData, insertAfter);
        ids.push(id);
        insertAfter = id;
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ ids }) }],
      };
    },
  );

  server.registerTool(
    "edit_block",
    {
      description: "Edit one or more existing blocks. Batch edits in one call to reduce token usage.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        edits: z.array(z.object({
          id: z.string(),
          content: z.record(z.string(), z.any()),
        })),
      },
    },
    async ({ edits }) => {
      const results = edits.map(({ id, content }) => {
        try {
          getStore().editBlock(id, content);
          return { id, success: true };
        } catch (e) {
          return { id, success: false, error: (e as Error).message };
        }
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ results }) }],
      };
    },
  );

  server.registerTool(
    "delete_block",
    {
      description: "Delete one or more blocks from the document. Pass an array of block IDs.",
      annotations: { readOnlyHint: false, destructiveHint: true },
      inputSchema: {
        ids: z.array(z.string()),
      },
    },
    async ({ ids }) => {
      const results = ids.map((id) => {
        try {
          getStore().deleteBlock(id);
          return { id, success: true };
        } catch (e) {
          return { id, success: false, error: (e as Error).message };
        }
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ results }) }],
      };
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
