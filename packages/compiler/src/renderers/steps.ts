import type { StepsBlock, VoxBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";
import type { RenderContext } from "./index.js";

export function renderSteps(
  block: StepsBlock,
  variables: Record<string, string> = {},
  renderChild?: (block: VoxBlock, ctx: RenderContext) => string,
): string {
  const ctx: RenderContext = { variables, allBlocks: [] };

  let html = `<ol id="${block.id}" class="vox-steps">`;

  block.steps.forEach((step, i) => {
    html += `<li class="vox-step">`;
    html += `<div class="vox-step-number">${i + 1}</div>`;
    html += `<div class="vox-step-title">${escapeHtml(step.title)}</div>`;

    if (renderChild) {
      html += `<div class="vox-step-content">`;
      html += step.blocks.map((b) => renderChild(b, ctx)).join("");
      html += `</div>`;
    }

    html += `</li>`;
  });

  html += `</ol>`;
  return html;
}
