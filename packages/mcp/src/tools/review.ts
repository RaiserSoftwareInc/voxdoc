import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerReviewTools(
  server: McpServer,
  getStore: () => DocumentStore,
): void {
  server.tool(
    "add_comment",
    "Add a review comment to a block",
    {
      block_id: z.string(),
      comment: z.string(),
    },
    async ({ block_id, comment }) => {
      const comment_id = getStore().addComment(block_id, comment);
      return {
        content: [{ type: "text", text: JSON.stringify({ comment_id }) }],
      };
    },
  );

  server.tool(
    "list_comments",
    "List all unresolved review comments",
    {},
    async () => {
      const comments = getStore().listComments();
      return {
        content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
      };
    },
  );

  server.tool(
    "resolve_comment",
    "Resolve a review comment",
    { comment_id: z.string() },
    async ({ comment_id }) => {
      getStore().resolveComment(comment_id);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );

  server.tool(
    "set_block_status",
    "Set the review status of a block",
    {
      id: z.string(),
      status: z.enum(["pre_approved", "pending", "flagged", "approved"]),
    },
    async ({ id, status }) => {
      try {
        getStore().setBlockStatus(id, status);
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
    "set_status",
    "Set the document review status",
    {
      status: z.enum(["draft", "pending_review", "approved", "published"]),
    },
    async ({ status }) => {
      getStore().setStatus(status);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );
}
