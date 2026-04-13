import { describe, it, expect } from "vitest";
import { renderCallout } from "../../src/renderers/callout.js";
import type { CalloutBlock } from "@voxdoc/schema";

describe("renderCallout", () => {
  it("renders with role=note and variant class", () => {
    const block: CalloutBlock = {
      type: "callout",
      id: "c1",
      variant: "info",
      content: "Some info",
    };
    const html = renderCallout(block);
    expect(html).toContain('role="note"');
    expect(html).toContain('class="vox-callout vox-callout-info"');
    expect(html).toContain('aria-label="info"');
    expect(html).toContain("Some info");
  });

  it("renders title when provided", () => {
    const block: CalloutBlock = {
      type: "callout",
      id: "c2",
      variant: "warning",
      title: "Watch out!",
      content: "Be careful here.",
    };
    const html = renderCallout(block);
    expect(html).toContain("Watch out!");
    expect(html).toContain("vox-callout-warning");
  });

  it("renders correct icon for each variant", () => {
    const variants = ["info", "warning", "danger", "tip", "note"] as const;
    const icons = ["ℹ️", "⚠️", "🚨", "💡", "📝"];
    variants.forEach((variant, i) => {
      const block: CalloutBlock = {
        type: "callout",
        id: `c-${variant}`,
        variant,
        content: "test",
      };
      const html = renderCallout(block);
      expect(html).toContain(icons[i]);
    });
  });

  it("resolves variables in content", () => {
    const block: CalloutBlock = {
      type: "callout",
      id: "c3",
      variant: "tip",
      content: "Use version {{ver}}",
    };
    const html = renderCallout(block, { ver: "3.0" });
    expect(html).toContain("Use version 3.0");
  });

  it("escapes HTML in title", () => {
    const block: CalloutBlock = {
      type: "callout",
      id: "c4",
      variant: "danger",
      title: "<script>alert(1)</script>",
      content: "safe",
    };
    const html = renderCallout(block);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
