import type { DiagramBlock } from "@voxdoc/schema";
import { escapeHtml } from "../utils.js";

export function renderDiagram(block: DiagramBlock): string {
  const description = escapeHtml(block.description);
  const escaped = escapeHtml(block.content);

  let inner: string;
  if (block.syntax === "mermaid") {
    inner = `<pre class="mermaid">${escaped}</pre>`;
  } else {
    inner = `<pre><code class="language-${block.syntax}">${escaped}</code></pre>`;
  }

  return `<figure id="${block.id}" class="vox-diagram" aria-label="${description}">${inner}<figcaption class="vox-sr-only">${description}</figcaption></figure>`;
}
