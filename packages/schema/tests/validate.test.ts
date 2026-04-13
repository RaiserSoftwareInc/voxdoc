import { describe, it, expect } from "vitest";
import { validateDocument } from "../src/validate.js";

function minimalMeta(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    title: "Test Doc",
    description: "A test document",
    version: "1.0.0",
    authors: ["author"],
    tags: ["test"],
    status: "draft",
    created: "2025-01-01",
    updated: "2025-01-01",
    variables: {},
    provenance: {
      generated_by: "test",
      reviewed_by: "test",
      approved_blocks: [],
      flagged_blocks: [],
    },
    accessibility: {
      language: "en",
      reading_level: "general",
    },
    ...overrides,
  };
}

describe("validateDocument", () => {
  it("validates a minimal valid document (empty blocks)", () => {
    const result = validateDocument({
      meta: minimalMeta(),
      blocks: [],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("rejects document with missing meta.title", () => {
    const meta = minimalMeta();
    delete (meta as Record<string, unknown>).title;
    const result = validateDocument({ meta, blocks: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("validates a document with heading + paragraph blocks", () => {
    const result = validateDocument({
      meta: minimalMeta(),
      blocks: [
        { id: "blk_1", type: "heading", level: 1, content: "Hello" },
        { id: "blk_2", type: "paragraph", content: "World" },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects an invalid block type", () => {
    const result = validateDocument({
      meta: minimalMeta(),
      blocks: [{ id: "blk_1", type: "unknown_block", content: "bad" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("rejects image block with missing alt", () => {
    const result = validateDocument({
      meta: minimalMeta(),
      blocks: [{ id: "blk_1", type: "image", src: "photo.png" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
