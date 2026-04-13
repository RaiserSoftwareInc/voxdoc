import { describe, it, expect } from "vitest";
import { createDocument } from "../src/commands/init.js";
import { compile } from "@voxdoc/compiler";
import type { VoxDocument, HeadingBlock, ParagraphBlock } from "@voxdoc/schema";

describe("compile integration", () => {
  it("compiles an init'd document with blocks to HTML", () => {
    const doc = createDocument({ title: "Compile Test" });

    const heading: HeadingBlock = {
      id: "h1",
      type: "heading",
      level: 1,
      content: "Hello World",
    };

    const para: ParagraphBlock = {
      id: "p1",
      type: "paragraph",
      content: "This is a test paragraph.",
    };

    doc.blocks.push(heading, para);

    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
    expect(result.html).toContain("Hello World");
    expect(result.html).toContain("This is a test paragraph.");
    expect(result.html).toContain("Compile Test");
  });

  it("compiles an empty document successfully", () => {
    const doc = createDocument({ title: "Empty Doc" });
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
    expect(result.html).toContain("Empty Doc");
  });

  it("fails compilation when accessibility errors exist", () => {
    const doc = createDocument();
    doc.blocks.push({
      id: "img1",
      type: "image",
      src: "test.png",
      alt: "",
    });

    const result = compile(doc as VoxDocument);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});
