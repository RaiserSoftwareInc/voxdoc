import { describe, it, expect } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("Review operations", () => {
  it("adds and lists comments", () => {
    const store = DocumentStore.createEmpty("Review Test");
    const blockId = store.addBlock({ type: "paragraph", content: "Hello" });
    const commentId = store.addComment(blockId, "Needs revision");

    expect(commentId).toMatch(/^cmt_/);

    const comments = store.listComments();
    expect(comments).toHaveLength(1);
    expect(comments[0].block_id).toBe(blockId);
    expect(comments[0].comment).toBe("Needs revision");
    expect(comments[0].resolved).toBe(false);
  });

  it("resolves a comment", () => {
    const store = DocumentStore.createEmpty("Review Test");
    const blockId = store.addBlock({ type: "paragraph", content: "Hello" });
    const commentId = store.addComment(blockId, "Fix this");

    store.resolveComment(commentId);

    const comments = store.listComments();
    expect(comments).toHaveLength(0);
  });

  it("sets block review status", () => {
    const store = DocumentStore.createEmpty("Review Test");
    const blockId = store.addBlock({ type: "paragraph", content: "Hello" });

    store.setBlockStatus(blockId, "flagged");

    const block = store.getBlock(blockId);
    expect(block!.review).toBeDefined();
    expect(block!.review!.status).toBe("flagged");
  });

  it("sets document status", () => {
    const store = DocumentStore.createEmpty("Review Test");
    expect(store.getDocument().meta.status).toBe("draft");

    store.setStatus("approved");
    expect(store.getDocument().meta.status).toBe("approved");
  });
});
