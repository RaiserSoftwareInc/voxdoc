import type { HeadingBlock } from "@voxdoc/schema";
import { escapeHtml } from "../utils.js";
import { resolveVariables } from "../variables.js";

export function renderHeading(
  block: HeadingBlock,
  variables: Record<string, string> = {},
): string {
  const content = escapeHtml(resolveVariables(block.content, variables));
  const tag = `h${block.level}`;
  return `<${tag} id="${block.id}">${content}</${tag}>`;
}
