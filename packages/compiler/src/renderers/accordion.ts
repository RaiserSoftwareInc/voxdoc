import type { AccordionBlock, VoxBlock } from "@voxdoc/schema";
import { escapeHtml } from "../utils.js";
import type { RenderContext } from "./index.js";

export function renderAccordion(
  block: AccordionBlock,
  variables: Record<string, string> = {},
  renderChild?: (block: VoxBlock, ctx: RenderContext) => string,
): string {
  const ctx: RenderContext = { variables, allBlocks: [] };
  const openAttr = block.default_open ? " open" : "";

  let html = `<details id="${block.id}" class="vox-accordion"${openAttr}>`;
  html += `<summary>${escapeHtml(block.title)}</summary>`;
  html += `<div class="vox-accordion-content">`;

  if (renderChild) {
    html += block.blocks.map((b) => renderChild(b, ctx)).join("");
  }

  html += `</div></details>`;
  return html;
}
