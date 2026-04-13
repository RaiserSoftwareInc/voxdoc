import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import type { VoxDocument } from "@voxdoc/schema";
import { compile } from "@voxdoc/compiler";

export function createDocument(options: { title?: string } = {}): VoxDocument {
  const now = new Date().toISOString();
  return {
    $schema: "https://voxformat.dev/schema/v1.json",
    meta: {
      id: randomUUID(),
      title: options.title ?? "Untitled Document",
      description: "",
      version: "1.0.0",
      authors: [],
      tags: [],
      status: "draft",
      created: now,
      updated: now,
      variables: {},
      provenance: {
        generated_by: "vox-cli",
        reviewed_by: "",
        approved_blocks: [],
        flagged_blocks: [],
      },
      accessibility: {
        language: "en",
        reading_level: "general",
      },
    },
    blocks: [],
    comments: [],
  };
}

export function initCommand(
  outputPath: string,
  options: { title?: string } = {},
): void {
  const doc = createDocument(options);
  const result = compile(doc);
  if (result.success) {
    writeFileSync(outputPath, result.html!, "utf-8");
  } else {
    // Fallback to raw JSON if compile fails (shouldn't happen for empty doc)
    writeFileSync(outputPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");
  }
  console.log(`Created ${outputPath}`);
}
