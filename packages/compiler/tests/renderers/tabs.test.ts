import { describe, it, expect } from "vitest";
import { renderTabs } from "../../src/renderers/tabs.js";
import type { TabsBlock } from "@vox/schema";

describe("renderTabs", () => {
  it("renders tablist with role attributes", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs1",
      panels: [
        { label: "Tab A", content: "Content A" },
        { label: "Tab B", content: "Content B" },
      ],
    };
    const html = renderTabs(block);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('role="tabpanel"');
  });

  it("first tab is selected, others are not", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs2",
      panels: [
        { label: "First", content: "1" },
        { label: "Second", content: "2" },
      ],
    };
    const html = renderTabs(block);
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('tabindex="-1"');
  });

  it("first panel visible, others hidden", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs3",
      panels: [
        { label: "A", content: "visible" },
        { label: "B", content: "hidden" },
      ],
    };
    const html = renderTabs(block);
    expect(html).toContain('hidden="true"');
    // first panel should not have hidden
    const panels = html.split('role="tabpanel"');
    expect(panels[1]).not.toContain("hidden");
  });

  it("renders code content when type/language present", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs4",
      panels: [
        { label: "JS", type: "code", language: "javascript", content: "console.log('hi')" },
      ],
    };
    const html = renderTabs(block);
    expect(html).toContain("language-javascript");
    expect(html).toContain("console.log(");
  });

  it("renders panel content as text when no type", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs5",
      panels: [
        { label: "Text", content: "Hello world" },
      ],
    };
    const html = renderTabs(block);
    expect(html).toContain("Hello world");
  });

  it("renders nested blocks via renderChild", () => {
    const block: TabsBlock = {
      type: "tabs",
      id: "tabs6",
      panels: [
        {
          label: "Nested",
          blocks: [
            { type: "paragraph", id: "p1", content: "Nested paragraph" },
          ],
        },
      ],
    };
    const renderChild = () => '<p id="p1">Nested paragraph</p>';
    const html = renderTabs(block, {}, renderChild);
    expect(html).toContain("Nested paragraph");
  });
});
