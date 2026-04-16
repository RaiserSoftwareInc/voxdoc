export function generateStyles(): string {
  return `
:root {
  --vox-font: "Charter", "Iowan Old Style", "Sitka Text", "Palatino Linotype", "Georgia", serif;
  --vox-font-heading: "Bahnschrift", "Avenir Next", "Avenir", "Cantarell", sans-serif;
  --vox-font-mono: "Cascadia Code", "SF Mono", "Menlo", "Consolas", monospace;
  --vox-text: #1C1917;
  --vox-text-secondary: #57534E;
  --vox-bg: #FAFAF7;
  --vox-bg-secondary: #F0EFE9;
  --vox-border: #D6D3CC;
  --vox-accent: #0D7377;
  --vox-accent-light: #CCFBF1;
  --vox-accent-hover: #0A5C5F;
  --vox-link: #0D7377;
  --vox-code-bg: #F0EDE5;
  --vox-code-border: #D6D3CC;
  --vox-radius: 6px;
  --vox-shadow: 0 1px 2px rgba(28,25,23,0.06), 0 1px 3px rgba(28,25,23,0.08);
  --vox-shadow-lg: 0 4px 12px rgba(28,25,23,0.08), 0 1px 3px rgba(28,25,23,0.06);
  --vox-callout-info: #0C4A6E;
  --vox-callout-info-bg: #E0F2FE;
  --vox-callout-info-border: #7DD3FC;
  --vox-callout-warning: #854D0E;
  --vox-callout-warning-bg: #FEF9C3;
  --vox-callout-warning-border: #FDE047;
  --vox-callout-danger: #991B1B;
  --vox-callout-danger-bg: #FEE2E2;
  --vox-callout-danger-border: #FCA5A5;
  --vox-callout-tip: #065F46;
  --vox-callout-tip-bg: #D1FAE5;
  --vox-callout-tip-border: #6EE7B7;
  --vox-callout-note: #5B21B6;
  --vox-callout-note-bg: #EDE9FE;
  --vox-callout-note-border: #C4B5FD;
}

[data-theme="dark"] {
    --vox-text: #E7E5DF;
    --vox-text-secondary: #A8A29E;
    --vox-bg: #1A1915;
    --vox-bg-secondary: #262520;
    --vox-border: #3D3B35;
    --vox-accent: #2DD4BF;
    --vox-accent-light: #134E4A;
    --vox-accent-hover: #5EEAD4;
    --vox-link: #5EEAD4;
    --vox-code-bg: #22201B;
    --vox-code-border: #3D3B35;
    --vox-shadow: 0 1px 3px rgba(0,0,0,0.3);
    --vox-shadow-lg: 0 4px 12px rgba(0,0,0,0.3);
    --vox-callout-info: #BAE6FD;
    --vox-callout-info-bg: #0C2D48;
    --vox-callout-info-border: #0C4A6E;
    --vox-callout-warning: #FDE68A;
    --vox-callout-warning-bg: #3D2E06;
    --vox-callout-warning-border: #854D0E;
    --vox-callout-danger: #FECACA;
    --vox-callout-danger-bg: #3B1111;
    --vox-callout-danger-border: #991B1B;
    --vox-callout-tip: #A7F3D0;
    --vox-callout-tip-bg: #052E22;
    --vox-callout-tip-border: #065F46;
    --vox-callout-note: #DDD6FE;
    --vox-callout-note-bg: #2E1A5E;
    --vox-callout-note-border: #5B21B6;
}

/* Toolbar */
.vox-toolbar {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  gap: 0.5rem;
  -webkit-user-select: none;
  user-select: none;
}
.vox-theme-toggle,
.vox-copy-btn {
  background: var(--vox-bg-secondary);
  border: 1px solid var(--vox-border);
  border-radius: 999px;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  color: var(--vox-text);
  box-shadow: var(--vox-shadow);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.vox-theme-toggle:hover,
.vox-copy-btn:hover {
  background: var(--vox-border);
}

/* Copy dropdown */
.vox-copy-menu {
  position: relative;
}
.vox-copy-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.4rem;
  background: var(--vox-bg);
  border: 1px solid var(--vox-border);
  border-radius: var(--vox-radius);
  box-shadow: var(--vox-shadow-lg);
  overflow: hidden;
  min-width: 10rem;
}
.vox-copy-dropdown.open {
  display: block;
}
.vox-copy-dropdown button {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-family: var(--vox-font-heading);
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--vox-text);
  transition: background 0.1s ease;
}
.vox-copy-dropdown button:hover {
  background: var(--vox-bg-secondary);
}
.vox-copy-dropdown button + button {
  border-top: 1px solid var(--vox-border);
}

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: var(--vox-font);
  color: var(--vox-text);
  background: var(--vox-bg);
  line-height: 1.75;
  margin: 0;
  padding: 0;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.vox-document {
  max-width: 50rem;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Headings — geometric sans, tight tracking */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--vox-font-heading);
  margin-top: 2.5em;
  margin-bottom: 0.6em;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--vox-text);
}
h1 {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-top: 0;
  padding-bottom: 0.5em;
  border-bottom: 2px solid var(--vox-border);
}
h2 {
  font-size: 1.625rem;
  font-weight: 700;
  margin-top: 3em;
  padding-bottom: 0.35em;
  border-bottom: 1px solid var(--vox-border);
}
h3 {
  font-size: 1.3rem;
  font-weight: 700;
}
h4 {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0;
}
h5 {
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vox-text-secondary);
}
h6 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vox-text-secondary);
}

p {
  margin: 1.15em 0;
}

a {
  color: var(--vox-link);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
a:hover {
  color: var(--vox-accent-hover);
}

/* Inline code */
code {
  font-family: var(--vox-font-mono);
  background: var(--vox-code-bg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.85em;
  border: 1px solid var(--vox-code-border);
  font-weight: 500;
}

/* Code blocks */
pre {
  background: var(--vox-code-bg);
  padding: 1.25rem 1.5rem;
  border-radius: var(--vox-radius);
  overflow-x: auto;
  border: 1px solid var(--vox-code-border);
  line-height: 1.6;
  font-size: 0.875rem;
  box-shadow: var(--vox-shadow);
}
pre code {
  background: none;
  padding: 0;
  border: none;
  font-size: inherit;
  font-weight: 400;
}

/* Callouts — full tinted background */
.vox-callout {
  border-left: 4px solid var(--vox-border);
  padding: 1rem 1.25rem;
  margin: 1.75rem 0;
  border-radius: 0 var(--vox-radius) var(--vox-radius) 0;
  background: var(--vox-bg-secondary);
}
.vox-callout .vox-callout-title {
  font-family: var(--vox-font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}
.vox-callout-info {
  border-left-color: var(--vox-callout-info-border);
  background: var(--vox-callout-info-bg);
  color: var(--vox-callout-info);
}
.vox-callout-warning {
  border-left-color: var(--vox-callout-warning-border);
  background: var(--vox-callout-warning-bg);
  color: var(--vox-callout-warning);
}
.vox-callout-danger {
  border-left-color: var(--vox-callout-danger-border);
  background: var(--vox-callout-danger-bg);
  color: var(--vox-callout-danger);
}
.vox-callout-tip {
  border-left-color: var(--vox-callout-tip-border);
  background: var(--vox-callout-tip-bg);
  color: var(--vox-callout-tip);
}
.vox-callout-note {
  border-left-color: var(--vox-callout-note-border);
  background: var(--vox-callout-note-bg);
  color: var(--vox-callout-note);
}

/* Tables — striped rows, refined borders */
.vox-table-wrapper {
  overflow-x: auto;
  margin: 1.75rem 0;
  border-radius: var(--vox-radius);
  border: 1px solid var(--vox-border);
  box-shadow: var(--vox-shadow);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.925rem;
}
th, td {
  padding: 0.7rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--vox-border);
}
th {
  background: var(--vox-bg-secondary);
  font-family: var(--vox-font-heading);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vox-text-secondary);
}
tbody tr:nth-child(even) {
  background: var(--vox-bg-secondary);
}
tbody tr:last-child td {
  border-bottom: none;
}

/* Tabs — accent underline */
.vox-tabs {
  margin: 1.75rem 0;
}
.vox-tabs [role="tablist"] {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--vox-border);
  margin-bottom: 0;
}
.vox-tabs [role="tab"] {
  font-family: var(--vox-font-heading);
  padding: 0.6rem 1.25rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vox-text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.vox-tabs [role="tab"]:hover {
  color: var(--vox-text);
}
.vox-tabs [role="tab"][aria-selected="true"] {
  border-bottom-color: var(--vox-accent);
  color: var(--vox-accent);
}
.vox-tabs [role="tabpanel"] {
  padding: 1.25rem 0;
}

/* Layout grid */
.vox-layout-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.vox-layout-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
}

/* Steps — connecting vertical line */
.vox-steps {
  counter-reset: vox-step;
  list-style: none;
  padding: 0;
  position: relative;
}
.vox-steps::before {
  content: '';
  position: absolute;
  left: 0.95rem;
  top: 2rem;
  bottom: 1rem;
  width: 2px;
  background: var(--vox-border);
  border-radius: 1px;
}
.vox-step {
  position: relative;
  padding-left: 3.5rem;
  margin-bottom: 2rem;
}
.vox-step-number {
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  background: var(--vox-accent);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--vox-font-heading);
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 0 0 3px var(--vox-bg);
  z-index: 1;
}
.vox-step-title {
  font-family: var(--vox-font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

/* Accordion */
.vox-accordion {
  border: 1px solid var(--vox-border);
  border-radius: var(--vox-radius);
  margin: 1rem 0;
  box-shadow: var(--vox-shadow);
  overflow: hidden;
}
.vox-accordion summary {
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  font-family: var(--vox-font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--vox-bg-secondary);
  transition: background 0.15s ease;
}
.vox-accordion summary:hover {
  background: var(--vox-border);
}
.vox-accordion[open] summary {
  border-bottom: 1px solid var(--vox-border);
}
.vox-accordion .vox-accordion-content {
  padding: 1.25rem;
}

/* Code filename header */
.vox-code-filename {
  background: var(--vox-bg-secondary);
  border: 1px solid var(--vox-code-border);
  border-bottom: none;
  padding: 0.45rem 1rem;
  font-family: var(--vox-font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--vox-radius) var(--vox-radius) 0 0;
  color: var(--vox-text-secondary);
  letter-spacing: 0.02em;
}
.vox-code-filename + pre {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  margin-top: 0;
}

/* Table of Contents */
.vox-toc {
  background: var(--vox-bg-secondary);
  border: 1px solid var(--vox-border);
  border-radius: var(--vox-radius);
  padding: 1.25rem 1.75rem;
  margin: 2rem 0;
  box-shadow: var(--vox-shadow);
}
.vox-toc nav ul {
  list-style: none;
  padding-left: 1.25rem;
}
.vox-toc nav > ul {
  padding-left: 0;
}
.vox-toc a {
  text-decoration: none;
  color: var(--vox-text-secondary);
  font-size: 0.925rem;
  transition: color 0.15s ease;
}
.vox-toc a:hover {
  color: var(--vox-accent);
}

/* Lists */
ul, ol {
  padding-left: 1.5rem;
}
li {
  margin-bottom: 0.35em;
}
li::marker {
  color: var(--vox-accent);
}

/* Horizontal rule */
hr {
  border: none;
  height: 1px;
  background: var(--vox-border);
  margin: 3rem 0;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: var(--vox-radius);
}

/* Blockquote */
blockquote {
  border-left: 3px solid var(--vox-accent);
  margin: 1.5rem 0;
  padding: 0.5rem 1.25rem;
  color: var(--vox-text-secondary);
  font-style: italic;
}

/* Skip navigation link */
.vox-skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 0.75rem 1.5rem;
  background: var(--vox-accent);
  color: #fff;
  text-decoration: none;
  z-index: 1000;
  border-radius: 0 0 var(--vox-radius) 0;
  font-family: var(--vox-font-heading);
  font-weight: 600;
  font-size: 0.875rem;
}
.vox-skip-link:focus {
  top: 0;
}

/* Hide non-rendered scripts from selection */
script[type="application/vox+json"] {
  display: none !important;
}

/* Screen reader only */
.vox-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Diagram */
.vox-diagram {
  margin: 1.75rem 0;
  text-align: center;
}
.vox-diagram figcaption {
  font-size: 0.85rem;
  color: var(--vox-text-secondary);
  margin-top: 0.75rem;
  font-style: italic;
}

/* Math */
.vox-math {
  margin: 1.5rem 0;
  overflow-x: auto;
}

/* Handwriting */
.vox-handwriting {
  background: var(--vox-bg-secondary);
  border: 1px solid var(--vox-border);
  border-radius: var(--vox-radius);
  padding: 1.25rem;
  margin: 1.5rem 0;
}

/* Unsupported block fallback */
.vox-unsupported {
  background: var(--vox-callout-warning-bg);
  border: 1px dashed var(--vox-callout-warning-border);
  border-radius: var(--vox-radius);
  padding: 1rem;
  margin: 1rem 0;
  color: var(--vox-callout-warning);
  font-size: 0.875rem;
}

/* Selection */
::selection {
  background: var(--vox-accent-light);
  color: var(--vox-text);
}

/* Strong / emphasis */
strong {
  font-weight: 600;
}

/* Responsive: 640px */
@media (max-width: 640px) {
  .vox-layout-2col,
  .vox-layout-3col {
    grid-template-columns: 1fr;
  }
  .vox-tabs [role="tablist"] {
    flex-wrap: wrap;
  }
  .vox-document {
    padding: 2rem 1.25rem;
  }
}

/* Responsive: 400px */
@media (max-width: 400px) {
  .vox-document {
    padding: 1.5rem 1rem;
  }
  .vox-callout {
    padding: 0.75rem 1rem;
  }
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.375rem; }
}
`.trim();
}
