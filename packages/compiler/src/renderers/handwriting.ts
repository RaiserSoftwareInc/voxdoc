import type { HandwritingBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderHandwriting(block: HandwritingBlock): string {
  const alt = escapeHtml(block.alt);
  const src = escapeHtml(block.image);
  const transcription = escapeHtml(block.transcription.text);

  let html = `<figure id="${block.id}" class="vox-handwriting">`;
  html += `<img src="${src}" alt="${alt}" loading="lazy">`;
  html += `<p class="vox-sr-only">${transcription}</p>`;
  html += `</figure>`;

  return html;
}
