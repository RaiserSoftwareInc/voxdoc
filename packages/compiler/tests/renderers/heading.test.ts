import { describe, it, expect } from "vitest";
import { renderHeading } from "../../src/renderers/heading.js";
import type { HeadingBlock } from "@vox/schema";

describe("renderHeading", () => {
  it("renders h1 with id attribute", () => {
    const block: HeadingBlock = {
      type: "heading",
      id: "intro",
      level: 1,
      content: "Introduction",
    };
    const html = renderHeading(block);
    expect(html).toBe('<h1 id="intro">Introduction</h1>');
  });

  it("renders h3", () => {
    const block: HeadingBlock = {
      type: "heading",
      id: "sub-section",
      level: 3,
      content: "Sub Section",
    };
    const html = renderHeading(block);
    expect(html).toBe('<h3 id="sub-section">Sub Section</h3>');
  });

  it("escapes HTML in content", () => {
    const block: HeadingBlock = {
      type: "heading",
      id: "xss",
      level: 2,
      content: "Hello <script>alert(1)</script>",
    };
    const html = renderHeading(block);
    expect(html).toContain("&lt;script&gt;");
  });

  it("resolves variables", () => {
    const block: HeadingBlock = {
      type: "heading",
      id: "ver",
      level: 1,
      content: "API {{version}}",
    };
    const html = renderHeading(block, { version: "2.0" });
    expect(html).toBe('<h1 id="ver">API 2.0</h1>');
  });
});
