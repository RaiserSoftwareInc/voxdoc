import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ensureVoxHtmlExtension } from "@voxdoc/schema";
import type { WorkspaceStore } from "../workspace-store.js";

export function registerWorkspaceTools(
  server: McpServer,
  getWorkspace: () => WorkspaceStore,
): void {
  server.registerTool(
    "list_documents",
    {
      description:
        "List all Vox documents (.vox.html and .vox) in the workspace directory. Shows filename, title, status, block count, and which is active.",
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async () => {
      const docs = getWorkspace().listDocuments();
      return {
        content: [{ type: "text", text: JSON.stringify(docs, null, 2) }],
      };
    },
  );

  server.registerTool(
    "open_document",
    {
      description:
        "Open a Vox document from the workspace and set it as the active document. All block/review/compile tools operate on the active document.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        filename: z
          .string()
          .describe("Filename of the document to open (e.g. api-docs.vox.html)"),
      },
    },
    async ({ filename }) => {
      try {
        const store = getWorkspace().openDocument(filename);
        const doc = store.getDocument();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                active: filename,
                title: doc.meta.title,
                blocks: doc.blocks.length,
                status: doc.meta.status,
              }),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: (e as Error).message }) },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "create_document",
    {
      description:
        "Create a new Vox document in the workspace directory and set it as active.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        filename: z
          .string()
          .describe("Filename for the new document (e.g. getting-started.vox.html)"),
        title: z.string().describe("Document title"),
      },
    },
    async ({ filename, title }) => {
      try {
        const store = getWorkspace().createDocument(filename, title);
        const doc = store.getDocument();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                created: ensureVoxHtmlExtension(filename),
                title: doc.meta.title,
                active: true,
              }),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: (e as Error).message }) },
          ],
          isError: true,
        };
      }
    },
  );
}
