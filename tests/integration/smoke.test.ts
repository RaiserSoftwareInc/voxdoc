import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { validateDocument } from "@voxdoc/schema";
import { compile } from "@voxdoc/compiler";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

describe("Integration smoke test", () => {
  const examples = ["examples/hello-world.vox.html", "examples/api-reference.vox.html"];

  for (const file of examples) {
    describe(file, () => {
      const filePath = path.join(ROOT, file);

      it("validates successfully", () => {
        const raw = fs.readFileSync(filePath, "utf-8");
        const doc = JSON.parse(raw);
        const result = validateDocument(doc);
        expect(result.valid).toBe(true);
        if (!result.valid) {
          console.error("Validation errors:", result.errors);
        }
      });

      it("compiles to HTML successfully", () => {
        const raw = fs.readFileSync(filePath, "utf-8");
        const doc = JSON.parse(raw);
        const result = compile(doc);
        expect(result.success).toBe(true);
        if (!result.success) {
          console.error("Compile errors:", result.errors);
        }
        expect(result.html).toBeTruthy();
      });

      it("compiled HTML has correct structure", () => {
        const raw = fs.readFileSync(filePath, "utf-8");
        const doc = JSON.parse(raw);
        const result = compile(doc);
        const html = result.html!;

        // Document shell
        expect(html).toContain("<!DOCTYPE html>");
        expect(html).toContain("Skip to content"); // skip nav
        expect(html).toContain("@media"); // responsive CSS
        expect(html).toContain('class="vox-document"'); // main wrapper
      });

      it("compiled HTML contains semantic elements", () => {
        const raw = fs.readFileSync(filePath, "utf-8");
        const doc = JSON.parse(raw);
        const result = compile(doc);
        const html = result.html!;

        // Semantic structure
        expect(html).toContain("<main");
        expect(html).toContain("<h1");
        expect(html).toContain('lang="en"');
      });

      it("compiled HTML resolves variables in text blocks", () => {
        const raw = fs.readFileSync(filePath, "utf-8");
        const doc = JSON.parse(raw);
        const result = compile(doc);
        const html = result.html!;

        // Variables should be resolved in paragraphs, headings, callouts, tables
        // Note: code blocks and tab panel inline content preserve raw text by design
        if (file.includes("hello-world")) {
          // The heading and paragraphs should have resolved {{format_name}} to "Vox"
          expect(html).toContain("Welcome to Vox");
          expect(html).toContain("<strong>Vox</strong>");
        }
        if (file.includes("api-reference")) {
          // Paragraphs should have resolved variables
          expect(html).toContain("https://api.voxformat.dev");
          expect(html).toContain("/v1");
        }
      });
    });
  }
});
