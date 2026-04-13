import { describe, it, expect } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("Document read operations", () => {
  function makeStore() {
    const store = DocumentStore.createEmpty("Read Test");
    store.addBlock({ type: "heading", level: 1, content: "Introduction" });
    store.addBlock({ type: "paragraph", content: "This is a test paragraph about cats." });
    store.addBlock({ type: "paragraph", content: "Another paragraph about dogs." });
    return store;
  }

  it("getDocument returns full document with meta and blocks", () => {
    const store = makeStore();
    const doc = store.getDocument();
    expect(doc.meta.title).toBe("Read Test");
    expect(doc.blocks).toHaveLength(3);
  });

  it("listBlocks returns summaries for each block", () => {
    const store = makeStore();
    const list = store.listBlocks();
    expect(list).toHaveLength(3);
    expect(list[0].type).toBe("heading");
    expect(list[0].preview).toBe("Introduction");
    expect(list[1].type).toBe("paragraph");
  });

  it("getBlock returns specific block by ID", () => {
    const store = makeStore();
    const blockList = store.listBlocks();
    const block = store.getBlock(blockList[0].id);
    expect(block).toBeDefined();
    expect(block!.type).toBe("heading");
  });

  it("getBlock returns undefined for missing ID", () => {
    const store = makeStore();
    expect(store.getBlock("blk_nonexistent")).toBeUndefined();
  });

  it("searchBlocks finds matching blocks", () => {
    const store = makeStore();
    const results = store.searchBlocks("cats");
    expect(results).toHaveLength(1);
    expect((results[0] as any).content).toContain("cats");
  });

  it("searchBlocks returns empty for no match", () => {
    const store = makeStore();
    expect(store.searchBlocks("elephants")).toHaveLength(0);
  });
});
