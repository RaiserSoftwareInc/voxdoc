import { describe, it, expect } from "vitest";
import { checkAccessibility } from "../src/accessibility.js";
import type { VoxBlock } from "@voxdoc/schema";

describe("checkAccessibility", () => {
  it("passes for blocks with required accessibility fields", () => {
    const blocks: VoxBlock[] = [
      { type: "heading", id: "h1", level: 1, content: "Title" },
      { type: "paragraph", id: "p1", content: "Text" },
      {
        type: "image",
        id: "img1",
        src: "photo.png",
        alt: "A photo of a sunset",
      },
      {
        type: "diagram",
        id: "d1",
        syntax: "mermaid",
        content: "graph TD; A-->B",
        description: "A flows to B",
      },
      {
        type: "table",
        id: "t1",
        headers: ["Name"],
        rows: [["Alice"]],
        summary: "A list of names",
      },
      {
        type: "math",
        id: "m1",
        expression: "E=mc^2",
        display: "block",
        spoken: "E equals m c squared",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails for image with empty alt", () => {
    const blocks: VoxBlock[] = [
      { type: "image", id: "img1", src: "photo.png", alt: "" },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("img1");
    expect(result.errors[0]).toContain("alt");
  });

  it("fails for diagram with empty description", () => {
    const blocks: VoxBlock[] = [
      {
        type: "diagram",
        id: "d1",
        syntax: "mermaid",
        content: "graph TD; A-->B",
        description: "",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("d1");
    expect(result.errors[0]).toContain("description");
  });

  it("fails for table with empty summary", () => {
    const blocks: VoxBlock[] = [
      {
        type: "table",
        id: "t1",
        headers: ["Name"],
        rows: [["Alice"]],
        summary: "",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("t1");
    expect(result.errors[0]).toContain("summary");
  });

  it("fails for math with empty spoken", () => {
    const blocks: VoxBlock[] = [
      {
        type: "math",
        id: "m1",
        expression: "E=mc^2",
        display: "block",
        spoken: "",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("m1");
    expect(result.errors[0]).toContain("spoken");
  });

  it("fails for low-confidence unverified handwriting", () => {
    const blocks: VoxBlock[] = [
      {
        type: "handwriting",
        id: "hw1",
        image: "scan.png",
        alt: "Handwritten note",
        transcription: {
          text: "Hello",
          confidence: 0.5,
          status: "pending",
          method: "ocr",
        },
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("hw1");
    expect(result.errors[0]).toContain("confidence");
  });

  it("passes for high-confidence handwriting even if pending", () => {
    const blocks: VoxBlock[] = [
      {
        type: "handwriting",
        id: "hw1",
        image: "scan.png",
        alt: "Handwritten note",
        transcription: {
          text: "Hello",
          confidence: 0.9,
          status: "pending",
          method: "ocr",
        },
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(true);
  });

  it("collects multiple errors", () => {
    const blocks: VoxBlock[] = [
      { type: "image", id: "img1", src: "a.png", alt: "" },
      { type: "image", id: "img2", src: "b.png", alt: "" },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
