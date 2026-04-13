import type { MathBlock } from "@voxdoc/schema";
import katex from "katex";

export function renderMath(block: MathBlock): string {
  const rendered = katex.renderToString(block.expression, {
    displayMode: block.display === "block",
    throwOnError: false,
  });

  const tag = block.display === "block" ? "div" : "span";
  return `<${tag} id="${block.id}" class="vox-math" role="math" aria-label="${block.spoken}">${rendered}</${tag}>`;
}
