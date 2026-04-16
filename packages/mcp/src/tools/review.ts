import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerReviewTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.registerTool(
    "add_comment",
    {
      description: "Add a review comment to a block",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        block_id: z.string(),
        comment: z.string(),
      },
    },
    async ({ block_id, comment }) => {
      const comment_id = getStore().addComment(block_id, comment);
      return {
        content: [{ type: "text", text: JSON.stringify({ comment_id }) }],
      };
    },
  );

  server.registerTool("list_comments", { description: "List all unresolved review comments", annotations: { readOnlyHint: false, destructiveHint: false } }, async () => {
    const comments = getStore().listComments();
    return {
      content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
    };
  });

  server.registerTool(
    "resolve_comment",
    {
      description: "Resolve one or more review comments. Pass an array of comment IDs.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: { comment_ids: z.array(z.string()) },
    },
    async ({ comment_ids }) => {
      const results = comment_ids.map((comment_id) => {
        try {
          getStore().resolveComment(comment_id);
          return { comment_id, success: true };
        } catch (e) {
          return { comment_id, success: false, error: (e as Error).message };
        }
      });
      const anyFailed = results.some((r) => !r.success);
      return {
        content: [{ type: "text", text: JSON.stringify({ results }) }],
        ...(anyFailed ? { isError: true } : {}),
      };
    },
  );

  server.registerTool(
    "set_block_status",
    {
      description: "Set the review status of one or more blocks. Batch multiple status updates in one call.",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        statuses: z.array(z.object({
          id: z.string(),
          status: z.enum(["pre_approved", "pending", "flagged", "approved"]),
        })),
      },
    },
    async ({ statuses }) => {
      const results = statuses.map(({ id, status }) => {
        try {
          getStore().setBlockStatus(id, status);
          return { id, success: true };
        } catch (e) {
          return { id, success: false, error: (e as Error).message };
        }
      });
      const anyFailed = results.some((r) => !r.success);
      return {
        content: [{ type: "text", text: JSON.stringify({ results }) }],
        ...(anyFailed ? { isError: true } : {}),
      };
    },
  );

  server.registerTool(
    "set_status",
    {
      description: "Set the document review status",
      annotations: { readOnlyHint: false, destructiveHint: false },
      inputSchema: {
        status: z.enum(["draft", "pending_review", "approved", "published"]),
      },
    },
    async ({ status }) => {
      getStore().setStatus(status);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );
}
