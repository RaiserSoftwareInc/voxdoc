import type { CodeBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderCode(block: CodeBlock): string {
  const escaped = escapeHtml(block.content);
  const langClass = block.language
    ? ` class="language-${block.language}"`
    : "";

  let html = `<div class="vox-code-block">`;

  if (block.filename) {
    html += `<div class="vox-code-filename">${escapeHtml(block.filename)}</div>`;
  }

  html += `<pre><code${langClass}>${escaped}</code></pre>`;
  html += `</div>`;

  return html;
}
