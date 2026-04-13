import type { TabsBlock, VoxBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";
import type { RenderContext } from "./index.js";

export function renderTabs(
  block: TabsBlock,
  variables: Record<string, string> = {},
  renderChild?: (block: VoxBlock, ctx: RenderContext) => string,
): string {
  const ctx: RenderContext = { variables, allBlocks: [] };
  let html = `<div id="${block.id}" class="vox-tabs">`;

  // Tab buttons
  html += `<div role="tablist">`;
  block.panels.forEach((panel, i) => {
    const tabId = `${block.id}-tab-${i}`;
    const panelId = `${block.id}-panel-${i}`;
    const selected = i === 0;
    html += `<button role="tab" id="${tabId}" aria-controls="${panelId}" aria-selected="${selected}" tabindex="${selected ? "0" : "-1"}">${escapeHtml(panel.label)}</button>`;
  });
  html += `</div>`;

  // Tab panels
  block.panels.forEach((panel, i) => {
    const tabId = `${block.id}-tab-${i}`;
    const panelId = `${block.id}-panel-${i}`;
    const hidden = i > 0;

    html += `<div role="tabpanel" id="${panelId}" aria-labelledby="${tabId}"`;
    if (hidden) {
      html += ` hidden="true"`;
    }
    html += `>`;

    if (panel.blocks && renderChild) {
      html += panel.blocks.map((b) => renderChild(b, ctx)).join("");
    } else if (panel.content !== undefined) {
      if (panel.type === "code" && panel.language) {
        html += `<pre><code class="language-${panel.language}">${escapeHtml(panel.content)}</code></pre>`;
      } else {
        html += `<p>${escapeHtml(panel.content)}</p>`;
      }
    }

    html += `</div>`;
  });

  html += `</div>`;
  return html;
}
