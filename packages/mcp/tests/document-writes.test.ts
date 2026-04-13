import { describe, it, expect } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("Document write operations", () => {
  it("add_block adds a block and returns an ID", () => {
    const store = DocumentStore.createEmpty("Write Test");
    const id = store.addBlock({ type: "paragraph", content: "New block" });
    expect(id).toMatch(/^blk_/);
    expect(store.getDocument().blocks).toHaveLength(1);
  });

  it("add_block with after inserts in correct position", () => {
    const store = DocumentStore.createEmpty("Write Test");
    const id1 = store.addBlock({ type: "paragraph", content: "First" });
    store.addBlock({ type: "paragraph", content: "Third" });
    const id2 = store.addBlock({ type: "paragraph", content: "Second" }, id1);

    const ids = store.getDocument().blocks.map((b) => b.id);
    expect(ids.indexOf(id2)).toBe(1);
  });

  it("edit_block updates content and preserves id", () => {
    const store = DocumentStore.createEmpty("Write Test");
    const id = store.addBlock({ type: "paragraph", content: "Original" });
    store.editBlock(id, { content: "Edited" });

    const block = store.getBlock(id);
    expect((block as any).content).toBe("Edited");
    expect(block!.id).toBe(id);
  });

  it("delete_block removes the block", () => {
    const store = DocumentStore.createEmpty("Write Test");
    const id = store.addBlock({ type: "paragraph", content: "Delete me" });
    store.deleteBlock(id);
    expect(store.getDocument().blocks).toHaveLength(0);
    expect(store.getBlock(id)).toBeUndefined();
  });

  it("move_block reorders blocks correctly", () => {
    const store = DocumentStore.createEmpty("Write Test");
    const id1 = store.addBlock({ type: "paragraph", content: "A" });
    const id2 = store.addBlock({ type: "paragraph", content: "B" });
    const id3 = store.addBlock({ type: "paragraph", content: "C" });

    store.moveBlock(id3, id1);

    const ids = store.getDocument().blocks.map((b) => b.id);
    expect(ids).toEqual([id1, id3, id2]);
  });

  it("set_metadata updates the metadata field", () => {
    const store = DocumentStore.createEmpty("Write Test");
    store.setMetadata("description", "Updated desc");
    expect(store.getDocument().meta.description).toBe("Updated desc");
  });

  it("set_variable sets a template variable", () => {
    const store = DocumentStore.createEmpty("Write Test");
    store.setVariable("company", "Acme");
    expect(store.getDocument().meta.variables.company).toBe("Acme");
  });
});
