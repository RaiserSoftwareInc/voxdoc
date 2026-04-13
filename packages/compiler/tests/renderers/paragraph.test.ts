import { describe, it, expect } from "vitest";
import { renderParagraph } from "../../src/renderers/paragraph.js";
import type { ParagraphBlock } from "@vox/schema";

describe("renderParagraph", () => {
  it("renders plain text in <p>", () => {
    const block: ParagraphBlock = {
      type: "paragraph",
      id: "p1",
      content: "Hello world",
    };
    const html = renderParagraph(block);
    expect(html).toBe('<p id="p1">Hello world</p>');
  });

  it("parses inline markdown (bold/italic)", () => {
    const block: ParagraphBlock = {
      type: "paragraph",
      id: "p2",
      content: "This is **bold** and *italic*",
    };
    const html = renderParagraph(block);
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("resolves variables like {{api_version}}", () => {
    const block: ParagraphBlock = {
      type: "paragraph",
      id: "p3",
      content: "Current version is {{api_version}}",
    };
    const html = renderParagraph(block, { api_version: "3.1" });
    expect(html).toContain("Current version is 3.1");
  });
});
