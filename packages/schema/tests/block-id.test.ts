import { describe, it, expect } from "vitest";
import { generateBlockId } from "../src/block-id.js";

describe("generateBlockId", () => {
  it("starts with blk_ prefix", () => {
    const id = generateBlockId();
    expect(id.startsWith("blk_")).toBe(true);
  });

  it("generates 100 unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateBlockId());
    }
    expect(ids.size).toBe(100);
  });

  it("has consistent length (>4, <30 chars)", () => {
    const id = generateBlockId();
    expect(id.length).toBeGreaterThan(4);
    expect(id.length).toBeLessThan(30);
  });
});
