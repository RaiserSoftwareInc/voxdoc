import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { validateDocument } from "@vox/schema";
import { compile } from "@vox/compiler";
import type { DocumentStore } from "../document-store.js";

export function registerOutputTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.tool(
    "validate",
    "Validate the document against the Vox schema",
    {},
    async () => {
      const doc = getStore().getDocument();
      const result = validateDocument(doc);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "compile",
    "Compile the document to an output format",
    {
      format: z.enum(["html"]),
    },
    async ({ format: _format }) => {
      const doc = getStore().getDocument();
      const result = compile(doc);
      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Compiled successfully. HTML length: ${result.html!.length}`,
              }),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              errors: result.errors,
            }),
          },
        ],
        isError: true,
      };
    },
  );
}
