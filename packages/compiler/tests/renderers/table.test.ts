import { describe, it, expect } from "vitest";
import { renderTable } from "../../src/renderers/table.js";
import type { TableBlock } from "@vox/schema";

describe("renderTable", () => {
  it("renders with caption and summary", () => {
    const block: TableBlock = {
      type: "table",
      id: "t1",
      headers: ["Name", "Age"],
      rows: [["Alice", "30"]],
      caption: "User Table",
      summary: "A table of users and ages",
    };
    const html = renderTable(block);
    expect(html).toContain("<caption>User Table</caption>");
    expect(html).toContain('class="vox-sr-only"');
    expect(html).toContain("A table of users and ages");
    expect(html).toContain('aria-describedby="t1-summary"');
  });

  it("renders th with scope=col", () => {
    const block: TableBlock = {
      type: "table",
      id: "t2",
      headers: ["Col1", "Col2"],
      rows: [],
      summary: "test",
    };
    const html = renderTable(block);
    expect(html).toContain('<th scope="col">Col1</th>');
    expect(html).toContain('<th scope="col">Col2</th>');
  });

  it("renders rows correctly", () => {
    const block: TableBlock = {
      type: "table",
      id: "t3",
      headers: ["X"],
      rows: [["a"], ["b"]],
      summary: "test",
    };
    const html = renderTable(block);
    expect(html).toContain("<td>a</td>");
    expect(html).toContain("<td>b</td>");
  });

  it("escapes HTML in cells", () => {
    const block: TableBlock = {
      type: "table",
      id: "t4",
      headers: ["<b>bold</b>"],
      rows: [["<em>hi</em>"]],
      summary: "test",
    };
    const html = renderTable(block);
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(html).toContain("&lt;em&gt;hi&lt;/em&gt;");
  });

  it("resolves variables in cells", () => {
    const block: TableBlock = {
      type: "table",
      id: "t5",
      headers: ["Version"],
      rows: [["{{ver}}"]],
      summary: "test",
    };
    const html = renderTable(block, { ver: "2.0" });
    expect(html).toContain("2.0");
  });

  it("renders without caption when not provided", () => {
    const block: TableBlock = {
      type: "table",
      id: "t6",
      headers: ["A"],
      rows: [["1"]],
      summary: "test",
    };
    const html = renderTable(block);
    expect(html).not.toContain("<caption>");
  });
});
