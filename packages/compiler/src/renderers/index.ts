import type { VoxBlock } from "@voxdoc/schema";
import { renderHeading } from "./heading.js";
import { renderParagraph } from "./paragraph.js";
import { renderCode } from "./code.js";
import { renderList } from "./list.js";
import { renderImage } from "./image.js";
import { renderToc } from "./toc.js";
import { renderCallout } from "./callout.js";
import { renderDiagram } from "./diagram.js";
import { renderTable } from "./table.js";
import { renderMath } from "./math.js";
import { renderTabs } from "./tabs.js";
import { renderAccordion } from "./accordion.js";
import { renderSteps } from "./steps.js";
import { renderLayout } from "./layout.js";
import { renderHandwriting } from "./handwriting.js";
import { renderInclude } from "./include.js";
import { renderVariableDef } from "./variable-def.js";
import { escapeHtml } from "../utils.js";

export type RenderContext = {
  variables: Record<string, string>;
  allBlocks: VoxBlock[];
};

export function renderBlock(block: VoxBlock, ctx: RenderContext): string {
  switch (block.type) {
    case "heading":
      return renderHeading(block, ctx.variables);
    case "paragraph":
      return renderParagraph(block, ctx.variables);
    case "code":
      return renderCode(block);
    case "list":
      return renderList(block, ctx.variables);
    case "image":
      return renderImage(block);
    case "toc":
      return renderToc(block, ctx.allBlocks);
    case "callout":
      return renderCallout(block, ctx.variables);
    case "diagram":
      return renderDiagram(block);
    case "table":
      return renderTable(block, ctx.variables);
    case "math":
      return renderMath(block);
    case "tabs":
      return renderTabs(block, ctx.variables, renderBlock);
    case "accordion":
      return renderAccordion(block, ctx.variables, renderBlock);
    case "steps":
      return renderSteps(block, ctx.variables, renderBlock);
    case "layout":
      return renderLayout(block, ctx.variables, renderBlock);
    case "handwriting":
      return renderHandwriting(block);
    case "include":
      return renderInclude(block);
    case "variable_def":
      return renderVariableDef(block);
    case "xref":
      return `<a href="#${escapeHtml(block.target)}">[ref: ${escapeHtml(block.target)}]</a>`;
    default:
      return `<div class="vox-unsupported">[Unsupported block: ${(block as VoxBlock).type}]</div>`;
  }
}

export { renderHeading } from "./heading.js";
export { renderParagraph } from "./paragraph.js";
export { renderCode } from "./code.js";
export { renderList } from "./list.js";
export { renderImage } from "./image.js";
export { renderToc } from "./toc.js";
export { renderCallout } from "./callout.js";
export { renderDiagram } from "./diagram.js";
export { renderTable } from "./table.js";
export { renderMath } from "./math.js";
export { renderTabs } from "./tabs.js";
export { renderAccordion } from "./accordion.js";
export { renderSteps } from "./steps.js";
export { renderLayout } from "./layout.js";
export { renderHandwriting } from "./handwriting.js";
export { renderInclude } from "./include.js";
export { renderVariableDef } from "./variable-def.js";
