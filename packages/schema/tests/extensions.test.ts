import { describe, it, expect } from "vitest";
import { isVoxFile, ensureVoxHtmlExtension, VOX_GLOB_PATTERNS } from "../src/extensions.js";

describe("isVoxFile", () => {
  it("accepts .vox.html", () => {
    expect(isVoxFile("doc.vox.html")).toBe(true);
  });
  it("accepts .vox", () => {
    expect(isVoxFile("doc.vox")).toBe(true);
  });
  it("rejects .html", () => {
    expect(isVoxFile("doc.html")).toBe(false);
  });
  it("rejects no extension", () => {
    expect(isVoxFile("doc")).toBe(false);
  });
  it("rejects .txt", () => {
    expect(isVoxFile("readme.txt")).toBe(false);
  });
});

describe("ensureVoxHtmlExtension", () => {
  it("adds .vox.html to bare name", () => {
    expect(ensureVoxHtmlExtension("doc")).toBe("doc.vox.html");
  });
  it("converts .vox to .vox.html", () => {
    expect(ensureVoxHtmlExtension("doc.vox")).toBe("doc.vox.html");
  });
  it("leaves .vox.html unchanged", () => {
    expect(ensureVoxHtmlExtension("doc.vox.html")).toBe("doc.vox.html");
  });
});

describe("VOX_GLOB_PATTERNS", () => {
  it("includes both extensions", () => {
    expect(VOX_GLOB_PATTERNS).toEqual(["*.vox.html", "*.vox"]);
  });
});
