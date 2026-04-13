import { describe, it, expect } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("DocumentStore", () => {
  it("creates empty doc with title", () => {
    const store = DocumentStore.createEmpty("Test Doc");
    const doc = store.getDocument();
    expect(doc.meta.title).toBe("Test Doc");
    expect(doc.blocks).toHaveLength(0);
    expect(doc.meta.status).toBe("draft");
  });

  it("adds a block and returns blk_ prefixed id", () => {
    const store = DocumentStore.createEmpty("Test");
    const id = store.addBlock({ type: "paragraph", content: "Hello world" });
    expect(id).toMatch(/^blk_/);
    expect(store.getDocument().blocks).toHaveLength(1);
    expect(store.getBlock(id)).toBeDefined();
  });

  it("adds block after another block", () => {
    const store = DocumentStore.createEmpty("Test");
    const id1 = store.addBlock({ type: "paragraph", content: "First" });
    const id3 = store.addBlock({ type: "paragraph", content: "Third" });
    const id2 = store.addBlock({ type: "paragraph", content: "Second" }, id1);

    const blocks = store.getDocument().blocks;
    expect(blocks[0].id).toBe(id1);
    expect(blocks[1].id).toBe(id2);
    expect(blocks[2].id).toBe(id3);
  });

  it("edits a block's content", () => {
    const store = DocumentStore.createEmpty("Test");
    const id = store.addBlock({ type: "paragraph", content: "Original" });
    store.editBlock(id, { content: "Updated" });
    const block = store.getBlock(id);
    expect(block).toBeDefined();
    expect((block as any).content).toBe("Updated");
    expect(block!.id).toBe(id);
  });

  it("throws when editing non-existent block", () => {
    const store = DocumentStore.createEmpty("Test");
    expect(() => store.editBlock("blk_nonexistent", {})).toThrow("Block not found");
  });

  it("deletes a block", () => {
    const store = DocumentStore.createEmpty("Test");
    const id = store.addBlock({ type: "paragraph", content: "To delete" });
    expect(store.getDocument().blocks).toHaveLength(1);
    store.deleteBlock(id);
    expect(store.getDocument().blocks).toHaveLength(0);
  });

  it("moves a block after another", () => {
    const store = DocumentStore.createEmpty("Test");
    const id1 = store.addBlock({ type: "paragraph", content: "First" });
    const id2 = store.addBlock({ type: "paragraph", content: "Second" });
    const id3 = store.addBlock({ type: "paragraph", content: "Third" });

    // Move id1 after id2, so order becomes: id2, id1, id3
    store.moveBlock(id1, id2);

    const blocks = store.getDocument().blocks;
    expect(blocks[0].id).toBe(id2);
    expect(blocks[1].id).toBe(id1);
    expect(blocks[2].id).toBe(id3);
  });

  it("moves a block to start when afterId is undefined", () => {
    const store = DocumentStore.createEmpty("Test");
    const id1 = store.addBlock({ type: "paragraph", content: "First" });
    const id2 = store.addBlock({ type: "paragraph", content: "Second" });

    store.moveBlock(id2, undefined);

    const blocks = store.getDocument().blocks;
    expect(blocks[0].id).toBe(id2);
    expect(blocks[1].id).toBe(id1);
  });

  it("searches blocks by content (case-insensitive)", () => {
    const store = DocumentStore.createEmpty("Test");
    store.addBlock({ type: "paragraph", content: "Hello World" });
    store.addBlock({ type: "paragraph", content: "Goodbye Mars" });
    store.addBlock({ type: "heading", level: 1, content: "Hello Section" });

    const results = store.searchBlocks("hello");
    expect(results).toHaveLength(2);
  });

  it("lists blocks with summaries", () => {
    const store = DocumentStore.createEmpty("Test");
    store.addBlock({ type: "paragraph", content: "Some content here" });
    store.addBlock({ type: "heading", level: 1, content: "Title" });

    const list = store.listBlocks();
    expect(list).toHaveLength(2);
    expect(list[0].type).toBe("paragraph");
    expect(list[0].preview).toBe("Some content here");
    expect(list[1].type).toBe("heading");
  });

  it("sets metadata", () => {
    const store = DocumentStore.createEmpty("Test");
    store.setMetadata("description", "A test document");
    expect(store.getDocument().meta.description).toBe("A test document");
  });

  it("sets variables", () => {
    const store = DocumentStore.createEmpty("Test");
    store.setVariable("version", "2.0");
    expect(store.getDocument().meta.variables.version).toBe("2.0");
  });

  it("adds and lists comments", () => {
    const store = DocumentStore.createEmpty("Test");
    const blockId = store.addBlock({ type: "paragraph", content: "Review me" });
    const commentId = store.addComment(blockId, "Needs work");
    expect(commentId).toMatch(/^cmt_/);
    const comments = store.listComments();
    expect(comments).toHaveLength(1);
    expect(comments[0].comment).toBe("Needs work");
  });

  it("resolves comments", () => {
    const store = DocumentStore.createEmpty("Test");
    const blockId = store.addBlock({ type: "paragraph", content: "Review me" });
    const commentId = store.addComment(blockId, "Needs work");
    store.resolveComment(commentId);
    expect(store.listComments()).toHaveLength(0);
  });

  it("sets block review status", () => {
    const store = DocumentStore.createEmpty("Test");
    const id = store.addBlock({ type: "paragraph", content: "Content" });
    store.setBlockStatus(id, "approved");
    const block = store.getBlock(id);
    expect(block!.review).toBeDefined();
    expect(block!.review!.status).toBe("approved");
    expect(block!.review!.confidence).toBe(0);
  });

  it("sets document status", () => {
    const store = DocumentStore.createEmpty("Test");
    store.setStatus("pending_review");
    expect(store.getDocument().meta.status).toBe("pending_review");
  });
});
