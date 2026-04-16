import { generateStyles } from "./styles.js";

export interface DocumentShellOptions {
  title: string;
  language: string;
  bodyHtml: string;
  sourceJson: string;
}

export function wrapInDocument({ title, language, bodyHtml, sourceJson }: DocumentShellOptions): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
<style>${generateStyles()}</style>
</head>
<body>
<script>
// Theme: restore saved preference or detect OS default
(function() {
  var saved = localStorage.getItem('vox-theme');
  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
</script>
<button class="vox-theme-toggle" id="vox-theme-btn" aria-label="Toggle theme" title="Toggle light/dark theme">&#9790;</button>
<a href="#vox-main" class="vox-skip-link">Skip to content</a>
<main id="vox-main" class="vox-document">
${bodyHtml}
</main>
<script type="application/vox+json">
${sourceJson}
</script>
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
mermaid.initialize({ startOnLoad: true, theme: isDark ? 'dark' : 'default' });
</script>
<script>
// Theme toggle
(function() {
  var btn = document.getElementById('vox-theme-btn');
  var update = function() { btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '\u2600' : '\u263E'; };
  update();
  btn.addEventListener('click', function() {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('vox-theme', t);
    update();
  });
})();

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
