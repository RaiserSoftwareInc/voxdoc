import { generateStyles } from "./styles.js";

export interface DocumentShellOptions {
  title: string;
  language: string;
  bodyHtml: string;
}

export function wrapInDocument({ title, language, bodyHtml }: DocumentShellOptions): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${generateStyles()}</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
</head>
<body>
<a href="#vox-main" class="vox-skip-link">Skip to content</a>
<main id="vox-main" class="vox-document">
${bodyHtml}
</main>
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>
<script>
// Tab switching
document.querySelectorAll('[role="tablist"]').forEach(tablist => {
  tablist.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabs = tablist.querySelectorAll('[role="tab"]');
      tabs.forEach(t => { t.setAttribute('aria-selected', 'false'); t.tabIndex = -1; });
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;
      const panelId = tab.getAttribute('aria-controls');
      tablist.closest('.vox-tabs').querySelectorAll('[role="tabpanel"]').forEach(p => p.hidden = true);
      document.getElementById(panelId).hidden = false;
    });
  });
});
</script>
</body>
</html>`;
}
