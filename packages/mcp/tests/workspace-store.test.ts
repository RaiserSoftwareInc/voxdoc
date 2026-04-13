import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { WorkspaceStore } from "../src/workspace-store.js";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@voxdoc/compiler";

const TEST_DIR = join(import.meta.dirname, ".tmp-workspace-test");

function createTestVox(filename: string, title: string): void {
  const doc = {
    $schema: "https://voxformat.dev/schema/v1.json",
    meta: {
      id: "test",
      title,
      description: "",
      version: "1.0.0",
      authors: [],
      tags: [],
      status: "draft",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      variables: {},
      provenance: { generated_by: null, reviewed_by: null, approved_blocks: [], flagged_blocks: [] },
      accessibility: { language: "en", reading_level: "technical" },
    },
    blocks: [],
  };
  const result = compile(doc);
  writeFileSync(join(TEST_DIR, filename), result.html!, "utf-8");
}

describe("WorkspaceStore", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("lists .vox files in a directory", () => {
    createTestVox("alpha.vox", "Alpha");
    createTestVox("beta.vox", "Beta");
    const ws = new WorkspaceStore(TEST_DIR);
    const files = ws.listFiles();
    expect(files).toEqual(["alpha.vox", "beta.vox"]);
  });

  it("auto-activates single file in directory", () => {
    createTestVox("only.vox", "Only Doc");
    const ws = new WorkspaceStore(TEST_DIR);
    expect(ws.getActiveFilename()).toBe("only.vox");
  });

  it("has no active file with multiple docs until opened", () => {
    createTestVox("a.vox", "A");
    createTestVox("b.vox", "B");
    const ws = new WorkspaceStore(TEST_DIR);
    expect(ws.getActiveFilename()).toBeNull();
    expect(() => ws.getActiveStore()).toThrow("No active document");
  });

  it("opens a document and sets it active", () => {
    createTestVox("a.vox", "A");
    createTestVox("b.vox", "B");
    const ws = new WorkspaceStore(TEST_DIR);
    ws.openDocument("b.vox");
    expect(ws.getActiveFilename()).toBe("b.vox");
    const doc = ws.getActiveStore().getDocument();
    expect(doc.meta.title).toBe("B");
  });

  it("lists documents with metadata", () => {
    createTestVox("a.vox", "Alpha Doc");
    createTestVox("b.vox", "Beta Doc");
    const ws = new WorkspaceStore(TEST_DIR);
    ws.openDocument("a.vox");
    const docs = ws.listDocuments();
    expect(docs).toHaveLength(2);
    expect(docs[0].title).toBe("Alpha Doc");
    expect(docs[0].active).toBe(true);
    expect(docs[1].title).toBe("Beta Doc");
    expect(docs[1].active).toBe(false);
  });

  it("creates a new document in the workspace", () => {
    const ws = new WorkspaceStore(TEST_DIR);
    ws.createDocument("new-doc.vox", "New Document");
    expect(ws.getActiveFilename()).toBe("new-doc.vox");
    const doc = ws.getActiveStore().getDocument();
    expect(doc.meta.title).toBe("New Document");
    expect(ws.listFiles()).toContain("new-doc.vox");
  });

  it("handles single file path (backward compatible)", () => {
    createTestVox("single.vox", "Single");
    const ws = new WorkspaceStore(join(TEST_DIR, "single.vox"));
    expect(ws.getActiveFilename()).toBe("single.vox");
    expect(ws.getDir()).toBe(TEST_DIR);
  });
});
