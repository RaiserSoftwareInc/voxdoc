import { readFileSync } from "node:fs";
import type { VoxBlock } from "@voxdoc/schema";
import { readVoxSource } from "@voxdoc/compiler";

function getContentPreview(block: VoxBlock): string {
  if ("content" in block && typeof block.content === "string") {
    return block.content.slice(0, 40);
  }
  if ("expression" in block && typeof block.expression === "string") {
    return block.expression.slice(0, 40);
  }
  if ("items" in block && Array.isArray(block.items)) {
    return block.items.join(", ").slice(0, 40);
  }
  return "";
}

function getReviewInfo(block: VoxBlock): string {
  if (block.review) {
    return `${block.review.status} (${block.review.confidence})`;
  }
  return "-";
}

export function blocksCommand(filePath: string): void {
  const raw = readFileSync(filePath, "utf-8");
  const doc = readVoxSource(raw);

  console.log(
    `${"ID".padEnd(12)} | ${"Type".padEnd(14)} | ${"Review".padEnd(20)} | Content`,
  );
  console.log("-".repeat(80));

  for (const block of doc.blocks) {
    const id = block.id.padEnd(12);
    const type = block.type.padEnd(14);
    const review = getReviewInfo(block).padEnd(20);
    const content = getContentPreview(block);
    console.log(`${id} | ${type} | ${review} | ${content}`);
  }
}
