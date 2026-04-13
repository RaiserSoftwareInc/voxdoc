import { readFileSync } from "node:fs";
import type { VoxDocument } from "@vox/schema";

export function infoCommand(filePath: string): void {
  const raw = readFileSync(filePath, "utf-8");
  const doc: VoxDocument = JSON.parse(raw);

  console.log(`Title:    ${doc.meta.title}`);
  console.log(`Version:  ${doc.meta.version}`);
  console.log(`Status:   ${doc.meta.status}`);
  console.log(`Blocks:   ${doc.blocks.length}`);
  console.log(`Authors:  ${doc.meta.authors.length > 0 ? doc.meta.authors.join(", ") : "(none)"}`);
  console.log(`Language: ${doc.meta.accessibility.language}`);
}
