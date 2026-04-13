import { describe, it, expect } from "vitest";
import { createDocument } from "../src/commands/init.js";
import { validateDocument } from "@vox/schema";

describe("createDocument", () => {
  it("creates a valid VoxDocument that passes schema validation", () => {
    const doc = createDocument();
    const result = validateDocument(doc);
    expect(result.valid).toBe(true);
  });

  it("uses the provided title", () => {
    const doc = createDocument({ title: "My Custom Title" });
    expect(doc.meta.title).toBe("My Custom Title");
  });

  it("defaults to 'Untitled Document' when no title given", () => {
    const doc = createDocument();
    expect(doc.meta.title).toBe("Untitled Document");
  });

  it("has correct default status 'draft'", () => {
    const doc = createDocument();
    expect(doc.meta.status).toBe("draft");
  });

  it("has $schema set", () => {
    const doc = createDocument();
    expect(doc.$schema).toBe("https://voxformat.dev/schema/v1.json");
  });

  it("has empty blocks array", () => {
    const doc = createDocument();
    expect(doc.blocks).toEqual([]);
  });

  it("generates a unique id", () => {
    const doc1 = createDocument();
    const doc2 = createDocument();
    expect(doc1.meta.id).not.toBe(doc2.meta.id);
  });
});
