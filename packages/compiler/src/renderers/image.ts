import type { ImageBlock } from "@voxdoc/schema";
import { escapeHtml } from "../utils.js";

export function renderImage(block: ImageBlock): string {
  const alt = escapeHtml(block.alt);
  const src = escapeHtml(block.src);

  let html = `<figure id="${block.id}">`;
  html += `<img src="${src}" alt="${alt}" loading="lazy" style="max-width:100%">`;

  if (block.caption) {
    html += `<figcaption>${escapeHtml(block.caption)}</figcaption>`;
  }

  html += `</figure>`;

  return html;
}
