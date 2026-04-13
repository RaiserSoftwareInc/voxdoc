import type { VoxDocument } from "@vox/schema";
import { renderBlock, type RenderContext } from "./renderers/index.js";
import { checkAccessibility } from "./accessibility.js";
import { wrapInDocument } from "./document-shell.js";

export interface CompileResult {
  success: boolean;
  html?: string;
  errors?: string[];
}

export function compile(doc: VoxDocument): CompileResult {
  // 1. Accessibility check
  const a11y = checkAccessibility(doc.blocks);
  if (!a11y.valid) {
    return { success: false, errors: a11y.errors };
  }

  // 2. Collect variables (meta.variables + inline variable_def blocks)
  const variables: Record<string, string> = { ...doc.meta.variables };
  for (const block of doc.blocks) {
    if (block.type === "variable_def") {
      variables[block.key] = block.value;
    }
  }

  // 3. Render all blocks
  const ctx: RenderContext = { variables, allBlocks: doc.blocks };
  const bodyHtml = doc.blocks
    .map((block) => renderBlock(block, ctx))
    .filter(Boolean)
    .join("\n");

  // 4. Wrap in document shell
  const html = wrapInDocument({
    title: doc.meta.title,
    language: doc.meta.accessibility.language,
    bodyHtml,
  });

  return { success: true, html };
}
