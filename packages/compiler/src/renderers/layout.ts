import type { LayoutBlock, VoxBlock } from "@voxdoc/schema";
import type { RenderContext } from "./index.js";

export function renderLayout(
  block: LayoutBlock,
  variables: Record<string, string> = {},
  renderChild?: (block: VoxBlock, ctx: RenderContext) => string,
): string {
  const ctx: RenderContext = { variables, allBlocks: [] };

  let html = `<div id="${block.id}" class="vox-layout vox-layout-${block.columns}col">`;

  for (const column of block.blocks) {
    html += `<div class="vox-layout-column">`;
    if (renderChild) {
      html += column.map((b) => renderChild(b, ctx)).join("");
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}
