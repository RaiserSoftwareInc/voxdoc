import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { checkAccessibility } from "@voxdoc/compiler";
import type { HandwritingBlock } from "@voxdoc/schema";
import type { DocumentStore } from "../document-store.js";

export function registerAccessibilityTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.registerTool(
    "set_description",
    {
      description: "Set a description on a block for accessibility",
      inputSchema: {
        block_id: z.string(),
        text: z.string(),
      },
    },
    async ({ block_id, text }) => {
      try {
        getStore().editBlock(block_id, { description: text });
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
    "set_transcription",
    {
      description: "Verify and set transcription text on a handwriting block",
      inputSchema: {
        block_id: z.string(),
        text: z.string(),
      },
    },
    async ({ block_id, text }) => {
      const store = getStore();
      const block = store.getBlock(block_id);
      if (!block) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Block not found: ${block_id}` }) }],
          isError: true,
        };
      }
      if (block.type !== "handwriting") {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Block ${block_id} is not a handwriting block (type: ${block.type})` }) }],
          isError: true,
        };
      }
      const updatedTranscription = {
        ...block.transcription,
        text,
        status: "verified" as const,
      };
      store.editBlock(block_id, { transcription: updatedTranscription } as unknown as Partial<HandwritingBlock>);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );

  server.registerTool("get_accessibility_report", { description: "Get an accessibility report for the document" }, async () => {
    const doc = getStore().getDocument();
    const report = checkAccessibility(doc.blocks);
    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    };
  });
}
