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
<link id="prism-light" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.min.css">
<link id="prism-dark" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism-tomorrow.min.css">
<style>${generateStyles()}</style>
</head>
<body>
<script>
// Theme: restore saved preference or detect OS default
(function() {
  var saved = localStorage.getItem('vox-theme');
  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('prism-' + (theme === 'dark' ? 'light' : 'dark')).disabled = true;
})();
</script>
<div class="vox-toolbar">
<button class="vox-theme-toggle" id="vox-theme-btn" aria-label="Toggle theme" title="Toggle light/dark theme">&#9790;</button>
<div class="vox-copy-menu">
<button class="vox-copy-btn" id="vox-copy-btn" aria-label="Copy document" title="Copy document" onclick="event.stopPropagation();document.getElementById('vox-copy-dropdown').classList.toggle('open')">&#128203;</button>
<div class="vox-copy-dropdown" id="vox-copy-dropdown">
<button data-format="markdown">Copy as Markdown</button>
<button data-format="text">Copy as Plain Text</button>
<button data-format="json">Copy as Vox JSON</button>
</div>
</div>
</div>
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
document.querySelectorAll('.mermaid').forEach(el => el.setAttribute('data-source', el.textContent));
mermaid.initialize({ startOnLoad: true, theme: isDark ? 'dark' : 'default' });
window.__voxMermaid = mermaid;
</script>
<script>
// Theme toggle
(function() {
  var btn = document.getElementById('vox-theme-btn');
  var update = function() { btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '\\u2600' : '\\u263E'; };
  update();
  btn.addEventListener('click', function() {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('vox-theme', t);
    update();
    document.getElementById('prism-light').disabled = t === 'dark';
    document.getElementById('prism-dark').disabled = t !== 'dark';
    if (window.__voxMermaid) {
      window.__voxMermaid.initialize({ startOnLoad: false, theme: t === 'dark' ? 'dark' : 'default' });
      document.querySelectorAll('.mermaid').forEach(function(el) {
        var src = el.getAttribute('data-source');
        if (src) { el.removeAttribute('data-processed'); el.innerHTML = src; }
      });
      window.__voxMermaid.run();
    }
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
<script>
// Copy menu
(function() {
  var fence = String.fromCharCode(96,96,96);
  var dropdown = document.getElementById('vox-copy-dropdown');
  document.addEventListener('click', function() { dropdown.classList.remove('open'); });

  function getVoxSource() {
    var el = document.querySelector('script[type="application/vox+json"]');
    return el ? JSON.parse(el.textContent) : null;
  }

  function blockToMarkdown(block) {
    if (!block) return '';
    switch (block.type) {
      case 'heading': return '#'.repeat(block.level) + ' ' + block.content + '\\n\\n';
      case 'paragraph': return block.content + '\\n\\n';
      case 'code':
        var hdr = block.filename ? '**' + block.filename + '**\\n' : '';
        return hdr + fence + (block.language || '') + '\\n' + block.content + '\\n' + fence + '\\n\\n';
      case 'callout': return '> **' + (block.title || block.variant) + ':** ' + block.content + '\\n\\n';
      case 'list': return (block.items || []).map(function(item) { return (block.ordered ? '1. ' : '- ') + item; }).join('\\n') + '\\n\\n';
      case 'table':
        var rows = [block.headers.join(' | ')];
        rows.push(block.headers.map(function() { return '---'; }).join(' | '));
        (block.rows || []).forEach(function(r) { rows.push(r.join(' | ')); });
        return rows.join('\\n') + '\\n\\n';
      case 'diagram': return fence + (block.syntax || 'mermaid') + '\\n' + block.content + '\\n' + fence + '\\n\\n';
      case 'tabs': return (block.panels || []).map(function(p) {
        return '**' + p.label + ':**\\n' + fence + (p.language || '') + '\\n' + (p.content || '') + '\\n' + fence + '\\n';
      }).join('\\n') + '\\n';
      case 'accordion': return '<details>\\n<summary>' + block.title + '</summary>\\n\\n' + (block.blocks || []).map(blockToMarkdown).join('') + '</details>\\n\\n';
      case 'steps': return (block.steps || []).map(function(s, i) {
        return '**Step ' + (i+1) + ': ' + s.title + '**\\n' + (s.blocks || []).map(blockToMarkdown).join('');
      }).join('') + '\\n';
      case 'layout': return (block.blocks || []).map(function(col) {
        return col.map(blockToMarkdown).join('');
      }).join('---\\n\\n');
      case 'toc': return '*Table of Contents*\\n\\n';
      case 'variable_def': return '';
      default: return (block.content || '') + '\\n\\n';
    }
  }

  function blockToText(block) {
    if (!block) return '';
    switch (block.type) {
      case 'heading': return block.content.toUpperCase() + '\\n' + '='.repeat(block.content.length) + '\\n\\n';
      case 'paragraph': return block.content + '\\n\\n';
      case 'code': return (block.filename ? '[' + block.filename + ']\\n' : '') + block.content + '\\n\\n';
      case 'callout': return '[' + (block.variant || '').toUpperCase() + '] ' + (block.title || '') + '\\n' + block.content + '\\n\\n';
      case 'list': return (block.items || []).map(function(item, i) { return (block.ordered ? (i+1) + '. ' : String.fromCharCode(8226) + ' ') + item; }).join('\\n') + '\\n\\n';
      case 'table':
        var rows = [block.headers.join('\\t')];
        (block.rows || []).forEach(function(r) { rows.push(r.join('\\t')); });
        return rows.join('\\n') + '\\n\\n';
      case 'tabs': return (block.panels || []).map(function(p) { return '[' + p.label + ']\\n' + (p.content || '') + '\\n'; }).join('\\n') + '\\n';
      case 'accordion': return block.title + '\\n' + (block.blocks || []).map(blockToText).join('');
      case 'steps': return (block.steps || []).map(function(s, i) { return (i+1) + '. ' + s.title + '\\n' + (s.blocks || []).map(blockToText).join(''); }).join('');
      case 'layout': return (block.blocks || []).map(function(col) { return col.map(blockToText).join(''); }).join('\\n');
      case 'toc': return '';
      case 'variable_def': return '';
      default: return (block.content || '') + '\\n\\n';
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    var btn = document.getElementById('vox-copy-btn');
    btn.textContent = String.fromCharCode(10003);
    setTimeout(function() { btn.textContent = String.fromCharCode(128203); }, 1500);
  }

  dropdown.addEventListener('click', function(e) {
    var format = e.target.getAttribute('data-format');
    if (!format) return;
    var doc = getVoxSource();
    if (!doc) return;
    var text = '';
    if (format === 'json') {
      text = JSON.stringify(doc, null, 2);
    } else {
      var fn = format === 'markdown' ? blockToMarkdown : blockToText;
      var vars = (doc.meta && doc.meta.variables) || {};
      text = doc.blocks.map(function(b) { return fn(b); }).join('');
      Object.keys(vars).forEach(function(k) {
        text = text.replace(new RegExp('\\\\{\\\\{' + k + '\\\\}\\\\}', 'g'), vars[k]);
      });
    }
    copyToClipboard(text);
    dropdown.classList.remove('open');
  });
})();
</script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js"></script>
<script>if (typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) { Prism.plugins.autoloader.languages_path = 'https://cdn.jsdelivr.net/npm/prismjs@1/components/'; }</script>
</body>
</html>`;
}
