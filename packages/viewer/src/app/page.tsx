"use client";

import { useEffect, useCallback } from "react";
import { useDocumentStore } from "@/store/document";
import { fetchDocument, approveBlock, flagBlock } from "@/lib/api";
import { Shell } from "@/components/layout/Shell";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { BlockReviewControls } from "@/components/review/BlockReviewControls";
import { CommentThread } from "@/components/review/CommentThread";

export default function Home() {
  const document = useDocumentStore((s) => s.document);
  const setDocument = useDocumentStore((s) => s.setDocument);
  const getVisibleBlocks = useDocumentStore((s) => s.getVisibleBlocks);

  useEffect(() => {
    fetchDocument()
      .then(setDocument)
      .catch(() => {
        // API not available — load demo document for development
        setDocument({
          $schema: "vox",
          meta: {
            id: "demo-doc",
            title: "Demo Document",
            description: "A sample document for development",
            version: "1.0.0",
            authors: ["Vox"],
            tags: ["demo"],
            status: "pending_review",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            variables: { project: "Vox", version: "1.0" },
            provenance: {
              generated_by: "claude-3.5-sonnet",
              reviewed_by: "human",
              approved_blocks: [],
              flagged_blocks: ["block-3"],
            },
            accessibility: { language: "en", reading_level: "technical" },
          },
          blocks: [
            { id: "block-1", type: "heading", level: 1, content: "Getting Started with Vox", review: { confidence: 0.95, reason: null, status: "pending" } },
            { id: "block-2", type: "paragraph", content: "Vox is a document generation and review system that transforms structured content into accessible PDF documents.", review: { confidence: 0.92, reason: null, status: "pending" } },
            { id: "block-3", type: "callout", variant: "warning", title: "Beta Software", content: "This software is in beta. Features may change without notice.", review: { confidence: 0.6, reason: "Low confidence — may need human review", status: "flagged" } },
            { id: "block-4", type: "code", language: "typescript", content: "import { compile } from '@vox/compiler';\n\nconst html = await compile(document);", review: { confidence: 0.88, reason: null, status: "pending" } },
            { id: "block-5", type: "list", ordered: true, items: ["Install dependencies", "Create a .vox document", "Run the compiler", "Review output"], review: { confidence: 0.9, reason: null, status: "approved" } },
            { id: "block-6", type: "table", headers: ["Feature", "Status"], rows: [["PDF Generation", "Stable"], ["Review UI", "Beta"], ["MCP Server", "Alpha"]], summary: "Feature status table", review: { confidence: 0.85, reason: null, status: "pending" } },
          ],
          comments: [
            { id: "c-1", block_id: "block-3", comment: "Please soften the language here", created: new Date().toISOString(), resolved: false },
          ],
        });
      });
  }, [setDocument]);

  const handleApprove = useCallback(
    async (id: string) => {
      await approveBlock(id).catch(() => {});
      // Optimistic update
      if (document) {
        const updated = {
          ...document,
          blocks: document.blocks.map((b) =>
            b.id === id ? { ...b, review: { confidence: 1, reason: null, status: "approved" as const } } : b
          ),
        };
        setDocument(updated);
      }
    },
    [document, setDocument]
  );

  const handleFlag = useCallback(
    async (id: string, comment: string) => {
      await flagBlock(id, comment).catch(() => {});
      if (document) {
        const updated = {
          ...document,
          blocks: document.blocks.map((b) =>
            b.id === id
              ? { ...b, review: { confidence: b.review?.confidence ?? 0, reason: comment, status: "flagged" as const } }
              : b
          ),
          comments: [
            ...(document.comments ?? []),
            { id: `c-${Date.now()}`, block_id: id, comment, created: new Date().toISOString(), resolved: false },
          ],
        };
        setDocument(updated);
      }
    },
    [document, setDocument]
  );

  const visibleBlocks = getVisibleBlocks();
  const blockComments = (blockId: string) =>
    (document?.comments ?? []).filter((c) => c.block_id === blockId);

  if (!document) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading document...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {visibleBlocks.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-2xl mb-2">All blocks approved</p>
            <p className="text-gray-500 dark:text-gray-400">Switch to &quot;Show All&quot; to see the full document.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {visibleBlocks.map((block) => (
            <article key={block.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label={`Block ${block.id}`}>
              <BlockRenderer block={block} />
              <BlockReviewControls block={block} onApprove={handleApprove} onFlag={handleFlag} />
              <CommentThread
                comments={blockComments(block.id)}
                onSubmit={(comment) => handleFlag(block.id, comment)}
              />
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
