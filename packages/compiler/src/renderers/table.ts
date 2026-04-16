import type { TableBlock } from "@voxdoc/schema";
import { escapeHtml } from "../utils.js";
import { resolveVariables } from "../variables.js";

export function renderTable(
  block: TableBlock,
  variables: Record<string, string> = {},
): string {
  let html = "";

  html += `<p id="${block.id}-summary" class="vox-sr-only">${escapeHtml(block.summary)}</p>`;
  html += `<div class="vox-table-wrapper" id="${block.id}">`;
  html += `<table aria-describedby="${block.id}-summary">`;

  if (block.caption) {
    html += `<caption>${escapeHtml(block.caption)}</caption>`;
  }

  html += `<thead><tr>`;
  for (const header of block.headers) {
    html += `<th scope="col">${escapeHtml(resolveVariables(header, variables))}</th>`;
  }
  html += `</tr></thead>`;

  html += `<tbody>`;
  for (const row of block.rows) {
    html += `<tr>`;
    for (const cell of row) {
      html += `<td>${escapeHtml(resolveVariables(cell, variables))}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody>`;

  html += `</table></div>`;

  return html;
}
