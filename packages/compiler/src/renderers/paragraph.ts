import type { ParagraphBlock } from "@voxdoc/schema";
import { marked } from "marked";
import { resolveVariables } from "../variables.js";

export function renderParagraph(
  block: ParagraphBlock,
  variables: Record<string, string> = {},
): string {
  const resolved = resolveVariables(block.content, variables);
  const html = marked.parseInline(resolved) as string;
  return `<p id="${block.id}">${html}</p>`;
}
