import type { HeadingBlock, TocBlock, VoxBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderToc(block: TocBlock, allBlocks: VoxBlock[]): string {
  const maxDepth = block.max_depth ?? 3;

  const headings = allBlocks.filter(
    (b): b is HeadingBlock => b.type === "heading" && b.level <= maxDepth,
  );

  const items = headings
    .map(
      (h) =>
        `<li><a href="#${h.id}">${escapeHtml(h.content)}</a></li>`,
    )
    .join("");

  return `<nav id="${block.id}" aria-label="Table of contents"><ol>${items}</ol></nav>`;
}
