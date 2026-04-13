import { readFileSync } from "node:fs";
import { validateDocument } from "@vox/schema";
import { checkAccessibility } from "@vox/compiler";

export function validateCommand(filePath: string): void {
  const raw = readFileSync(filePath, "utf-8");
  const doc = JSON.parse(raw);

  const result = validateDocument(doc);
  if (!result.valid) {
    console.error("Schema validation errors:");
    for (const err of result.errors ?? []) {
      console.error(`  ${err.path}: ${err.message}`);
    }
    process.exit(1);
  }

  const a11y = checkAccessibility(doc.blocks ?? []);
  if (!a11y.valid) {
    console.error("Accessibility errors:");
    for (const err of a11y.errors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("Valid ✓");
}
