import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

type McpBlockInput = { type: string; content: Record<string, any> };

export function flattenBlock(block: McpBlockInput): Record<string, any> {
  const flat: Record<string, any> = { type: block.type, ...block.content };

  switch (block.type) {
    case "steps":
      if (Array.isArray(flat.steps)) {
        flat.steps = flat.steps.map((step: any) => ({
          ...step,
          blocks: Array.isArray(step.blocks)
            ? step.blocks.map((b: any) => flattenBlock(b))
            : step.blocks,
        }));
      }
      break;
    case "accordion":
      if (Array.isArray(flat.blocks)) {
        flat.blocks = flat.blocks.map((b: any) => flattenBlock(b));
      }
      break;
    case "tabs":
      if (Array.isArray(flat.panels)) {
        flat.panels = flat.panels.map((panel: any) =>
          Array.isArray(panel.blocks)
            ? { ...panel, blocks: panel.blocks.map((b: any) => flattenBlock(b)) }
            : panel,
        );
      }
      break;
    case "layout":
      if (Array.isArray(flat.blocks)) {
        flat.blocks = flat.blocks.map((col: any) =>
          Array.isArray(col) ? col.map((b: any) => flattenBlock(b)) : col,
        );
      }
      break;
  }

  return flat;
}

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
        const blockData = flattenBlock(block) as Parameters<DocumentStore["addBlock"]>[0];
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
      description: "Set one or more metadata fields at once. Pass an object of key-value pairs.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        fields: z.record(z.string(), z.any()),
      },
    },
    async ({ fields }) => {
      for (const [key, value] of Object.entries(fields)) {
        getStore().setMetadata(key, value);
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, count: Object.keys(fields).length }) }],
      };
    },
  );

  server.registerTool(
    "set_variable",
    {
      description: "Set one or more template variables at once. Pass an object of key-value pairs.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        variables: z.record(z.string(), z.string()),
      },
    },
    async ({ variables }) => {
      for (const [key, value] of Object.entries(variables)) {
        getStore().setVariable(key, value);
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, count: Object.keys(variables).length }) }],
      };
    },
  );
}
