import { describe, it, expect } from "vitest";
import { DocumentStore } from "../src/document-store.js";
import { flattenBlock } from "../src/tools/document-writes.js";

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

describe("flattenBlock", () => {
  it("flattens a simple block", () => {
    const result = flattenBlock({ type: "paragraph", content: { content: "Hello" } });
    expect(result).toEqual({ type: "paragraph", content: "Hello" });
  });

  it("flattens steps with nested paragraph and math blocks", () => {
    const result = flattenBlock({
      type: "steps",
      content: {
        steps: [
          {
            title: "Install",
            blocks: [
              { type: "paragraph", content: { content: "Run npm install" } },
              { type: "math", content: { expression: "n^2", display: "block", spoken: "n squared" } },
            ],
          },
        ],
      },
    });
    expect(result.type).toBe("steps");
    expect(result.steps[0].blocks[0]).toEqual({ type: "paragraph", content: "Run npm install" });
    expect(result.steps[0].blocks[1]).toEqual({ type: "math", expression: "n^2", display: "block", spoken: "n squared" });
  });

  it("flattens accordion with nested blocks", () => {
    const result = flattenBlock({
      type: "accordion",
      content: {
        title: "Details",
        blocks: [{ type: "paragraph", content: { content: "Body text" } }],
      },
    });
    expect(result.title).toBe("Details");
    expect(result.blocks[0]).toEqual({ type: "paragraph", content: "Body text" });
  });

  it("flattens tabs panels that contain blocks", () => {
    const result = flattenBlock({
      type: "tabs",
      content: {
        panels: [
          { label: "Info", blocks: [{ type: "paragraph", content: { content: "Tab content" } }] },
          { label: "Code", content: "console.log()", language: "js" },
        ],
      },
    });
    expect(result.panels[0].blocks[0]).toEqual({ type: "paragraph", content: "Tab content" });
    expect(result.panels[1].content).toBe("console.log()");
  });

  it("flattens layout nested column blocks", () => {
    const result = flattenBlock({
      type: "layout",
      content: {
        columns: 2,
        blocks: [
          [{ type: "paragraph", content: { content: "Left" } }],
          [{ type: "paragraph", content: { content: "Right" } }],
        ],
      },
    });
    expect(result.blocks[0][0]).toEqual({ type: "paragraph", content: "Left" });
    expect(result.blocks[1][0]).toEqual({ type: "paragraph", content: "Right" });
  });
});

describe("add_block with container blocks via flattenBlock", () => {
  it("stores steps block with correctly flattened nested paragraph and math blocks", () => {
    const store = DocumentStore.createEmpty("Flatten Test");
    const blockData = flattenBlock({
      type: "steps",
      content: {
        steps: [
          {
            title: "Setup",
            blocks: [
              { type: "paragraph", content: { content: "Run npm install" } },
              { type: "math", content: { expression: "E = mc^2", display: "block", spoken: "E equals m c squared" } },
            ],
          },
        ],
      },
    }) as Parameters<DocumentStore["addBlock"]>[0];

    const id = store.addBlock(blockData);
    const stored = store.getBlock(id) as any;

    expect(stored.type).toBe("steps");
    expect(stored.steps[0].blocks[0].content).toBe("Run npm install");
    expect(stored.steps[0].blocks[0].type).toBe("paragraph");
    expect(stored.steps[0].blocks[1].expression).toBe("E = mc^2");
    expect(stored.steps[0].blocks[1].type).toBe("math");
    expect(stored.steps[0].blocks[1].content).toBeUndefined();
  });
});
