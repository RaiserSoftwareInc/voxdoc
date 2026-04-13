import type { VoxBlock } from "@vox/schema";
import { renderHeading } from "./heading.js";
import { renderParagraph } from "./paragraph.js";
import { renderCode } from "./code.js";
import { renderList } from "./list.js";
import { renderImage } from "./image.js";
import { renderToc } from "./toc.js";

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
