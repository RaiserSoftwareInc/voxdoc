import { describe, it, expect } from "vitest";
import { compile } from "../src/compiler.js";
import type { VoxDocument, VoxBlock } from "@voxdoc/schema";

function makeDoc(blocks: VoxBlock[], variables: Record<string, string> = {}): VoxDocument {
  return {
    meta: {
      id: "test-doc",
      title: "Test Document",
      description: "A test document",
      version: "1.0.0",
      authors: ["Test Author"],
      tags: ["test"],
      status: "draft",
      created: "2026-01-01T00:00:00Z",
      updated: "2026-01-01T00:00:00Z",
      variables,
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
    },
    blocks,
  };
}

describe("compile", () => {
  it("produces valid HTML with doctype for heading+paragraph doc", () => {
    const doc = makeDoc([
      { type: "heading", id: "h1", level: 1, content: "Hello" },
      { type: "paragraph", id: "p1", content: "World" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
    expect(result.html!).toContain("<!DOCTYPE html>");
    expect(result.html!).toContain('<html lang="en">');
    expect(result.html!).toContain("<h1");
    expect(result.html!).toContain("Hello");
    expect(result.html!).toContain("World");
  });

  it("resolves variables from meta.variables", () => {
    const doc = makeDoc(
      [
        { type: "paragraph", id: "p1", content: "Version {{version}}" },
      ],
      { version: "3.0" },
    );
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain("Version 3.0");
  });

  it("resolves variables from variable_def blocks", () => {
    const doc = makeDoc([
      { type: "variable_def", id: "vd1", key: "app", value: "MyApp" },
      { type: "paragraph", id: "p1", content: "Welcome to {{app}}" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain("Welcome to MyApp");
  });

  it("fails on missing accessibility fields (image with empty alt)", () => {
    const doc = makeDoc([
      { type: "image", id: "img1", src: "photo.png", alt: "" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors![0]).toContain("alt");
  });

  it("includes skip nav link", () => {
    const doc = makeDoc([
      { type: "heading", id: "h1", level: 1, content: "Title" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain("Skip to content");
    expect(result.html!).toContain("vox-skip-link");
  });

  it("includes responsive CSS with 640px breakpoint", () => {
    const doc = makeDoc([
      { type: "heading", id: "h1", level: 1, content: "Title" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain("@media");
    expect(result.html!).toContain("640px");
  });

  it("includes mermaid script", () => {
    const doc = makeDoc([
      { type: "heading", id: "h1", level: 1, content: "Title" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain("mermaid");
  });

  it("includes tab switching script", () => {
    const doc = makeDoc([
      { type: "heading", id: "h1", level: 1, content: "Title" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html!).toContain('[role="tablist"]');
  });
});
