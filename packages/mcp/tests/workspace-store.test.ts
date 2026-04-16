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

  it("lists .vox.html files in a directory", () => {
    createTestVox("alpha.vox.html", "Alpha");
    createTestVox("beta.vox.html", "Beta");
    const ws = new WorkspaceStore(TEST_DIR);
    const files = ws.listFiles();
    expect(files).toEqual(["alpha.vox.html", "beta.vox.html"]);
  });

  it("auto-activates single file in directory", () => {
    createTestVox("only.vox.html", "Only Doc");
    const ws = new WorkspaceStore(TEST_DIR);
    expect(ws.getActiveFilename()).toBe("only.vox.html");
  });

  it("has no active file with multiple docs until opened", () => {
    createTestVox("a.vox.html", "A");
    createTestVox("b.vox.html", "B");
    const ws = new WorkspaceStore(TEST_DIR);
    expect(ws.getActiveFilename()).toBeNull();
    expect(() => ws.getActiveStore()).toThrow("No active document");
  });

  it("opens a document and sets it active", () => {
    createTestVox("a.vox.html", "A");
    createTestVox("b.vox.html", "B");
    const ws = new WorkspaceStore(TEST_DIR);
    ws.openDocument("b.vox.html");
    expect(ws.getActiveFilename()).toBe("b.vox.html");
    const doc = ws.getActiveStore().getDocument();
    expect(doc.meta.title).toBe("B");
  });

  it("lists documents with metadata", () => {
    createTestVox("a.vox.html", "Alpha Doc");
    createTestVox("b.vox.html", "Beta Doc");
    const ws = new WorkspaceStore(TEST_DIR);
    ws.openDocument("a.vox.html");
    const docs = ws.listDocuments();
    expect(docs).toHaveLength(2);
    expect(docs[0].title).toBe("Alpha Doc");
    expect(docs[0].active).toBe(true);
    expect(docs[1].title).toBe("Beta Doc");
    expect(docs[1].active).toBe(false);
  });

  it("creates a new document in the workspace", () => {
    const ws = new WorkspaceStore(TEST_DIR);
    ws.createDocument("new-doc", "New Document");
    expect(ws.getActiveFilename()).toBe("new-doc.vox.html");
    const doc = ws.getActiveStore().getDocument();
    expect(doc.meta.title).toBe("New Document");
    expect(ws.listFiles()).toContain("new-doc.vox.html");
  });

  it("handles single file path (backward compatible)", () => {
    createTestVox("single.vox.html", "Single");
    const ws = new WorkspaceStore(join(TEST_DIR, "single.vox.html"));
    expect(ws.getActiveFilename()).toBe("single.vox.html");
    expect(ws.getDir()).toBe(TEST_DIR);
  });

  it("lists both .vox and .vox.html files (backward compat)", () => {
    createTestVox("old.vox", "Old Doc");
    createTestVox("new.vox.html", "New Doc");
    const ws = new WorkspaceStore(TEST_DIR);
    const files = ws.listFiles();
    expect(files).toContain("old.vox");
    expect(files).toContain("new.vox.html");
    expect(files).toHaveLength(2);
  });

  it("starts unconfigured when no path provided", () => {
    const ws = new WorkspaceStore();
    expect(ws.isConfigured()).toBe(false);
    expect(ws.getDir()).toBeNull();
    expect(ws.getActiveFilename()).toBeNull();
  });

  it("throws on all operations when unconfigured", () => {
    const ws = new WorkspaceStore();
    const msg = "No workspace configured. Call set_workspace with a directory path first.";
    expect(() => ws.listFiles()).toThrow(msg);
    expect(() => ws.listDocuments()).toThrow(msg);
    expect(() => ws.openDocument("x.vox.html")).toThrow(msg);
    expect(() => ws.createDocument("x", "X")).toThrow(msg);
    expect(() => ws.getActiveStore()).toThrow(msg);
  });

  it("configures workspace via setWorkspace()", () => {
    createTestVox("test.vox.html", "Test");
    const ws = new WorkspaceStore();
    ws.setWorkspace(TEST_DIR);
    expect(ws.isConfigured()).toBe(true);
    expect(ws.listFiles()).toEqual(["test.vox.html"]);
  });

  it("switches workspace via setWorkspace()", () => {
    const dir2 = join(TEST_DIR, "sub");
    mkdirSync(dir2, { recursive: true });
    createTestVox("a.vox.html", "A");
    // Create a doc in dir2
    const doc = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: "test", title: "B", description: "", version: "1.0.0",
        authors: [], tags: [], status: "draft",
        created: new Date().toISOString(), updated: new Date().toISOString(),
        variables: {},
        provenance: { generated_by: null, reviewed_by: null, approved_blocks: [], flagged_blocks: [] },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [],
    };
    const result = compile(doc);
    writeFileSync(join(dir2, "b.vox.html"), result.html!, "utf-8");

    const ws = new WorkspaceStore(TEST_DIR);
    expect(ws.listFiles()).toContain("a.vox.html");

    ws.setWorkspace(dir2);
    expect(ws.listFiles()).toEqual(["b.vox.html"]);
    // dir2 has one file → auto-activates (same behavior as constructor)
    expect(ws.getActiveFilename()).toBe("b.vox.html");
  });
});
