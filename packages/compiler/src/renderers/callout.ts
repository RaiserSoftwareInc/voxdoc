import type { CalloutBlock, CalloutVariant } from "@vox/schema";
import { marked } from "marked";
import { escapeHtml, resolveVariables } from "../utils.js";

const ICONS: Record<CalloutVariant, string> = {
  info: "ℹ️",
  warning: "⚠️",
  danger: "🚨",
  tip: "💡",
  note: "📝",
};

export function renderCallout(
  block: CalloutBlock,
  variables: Record<string, string> = {},
): string {
  const icon = ICONS[block.variant];
  const content = marked.parseInline(
    resolveVariables(block.content, variables),
  ) as string;

  let html = `<div id="${block.id}" class="vox-callout vox-callout-${block.variant}" role="note" aria-label="${block.variant}">`;
  html += `<div class="vox-callout-title">${icon}`;
  if (block.title) {
    html += ` ${escapeHtml(block.title)}`;
  }
  html += `</div>`;
  html += `<div class="vox-callout-content">${content}</div>`;
  html += `</div>`;

  return html;
}
