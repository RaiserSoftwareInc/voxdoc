import type { IncludeBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderInclude(block: IncludeBlock): string {
  const src = escapeHtml(block.src);
  return `<div id="${block.id}" class="vox-include"><a href="${src}">📄 Included document: ${src}</a></div>`;
}
