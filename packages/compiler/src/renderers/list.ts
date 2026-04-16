import type { ListBlock } from "@voxdoc/schema";
import { marked } from "marked";
import { resolveVariables } from "../variables.js";

export function renderList(
  block: ListBlock,
  variables: Record<string, string> = {},
): string {
  const tag = block.ordered ? "ol" : "ul";
  const items = block.items
    .map((item) => {
      const resolved = resolveVariables(item, variables);
      const html = marked.parseInline(resolved) as string;
      return `<li>${html}</li>`;
    })
    .join("");

  return `<${tag} id="${block.id}">${items}</${tag}>`;
}
