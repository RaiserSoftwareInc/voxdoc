export function generateStyles(): string {
  return `
:root {
  --vox-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --vox-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --vox-text: #1a1a2e;
  --vox-bg: #ffffff;
  --vox-bg-secondary: #f5f5f7;
  --vox-border: #e0e0e0;
  --vox-accent: #2563eb;
  --vox-accent-light: #dbeafe;
  --vox-link: #2563eb;
  --vox-code-bg: #f8f9fa;
  --vox-radius: 8px;
  --vox-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --vox-text: #e0e0e0;
    --vox-bg: #1a1a2e;
    --vox-bg-secondary: #16213e;
    --vox-border: #333;
    --vox-accent: #60a5fa;
    --vox-accent-light: #1e3a5f;
    --vox-link: #93bbfc;
    --vox-code-bg: #0f1729;
    --vox-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
}

*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: var(--vox-font);
  color: var(--vox-text);
  background: var(--vox-bg);
  line-height: 1.7;
  margin: 0;
  padding: 0;
}

.vox-document {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 2em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.1rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.9rem; }

p { margin: 1em 0; }

a { color: var(--vox-link); text-decoration: underline; }
a:hover { text-decoration: none; }

code {
  font-family: var(--vox-font-mono);
  background: var(--vox-code-bg);
  padding: 0.15em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  background: var(--vox-code-bg);
  padding: 1rem;
  border-radius: var(--vox-radius);
  overflow-x: auto;
  border: 1px solid var(--vox-border);
}
pre code {
  background: none;
  padding: 0;
}

/* Callouts */
.vox-callout {
  border-left: 4px solid var(--vox-border);
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
  border-radius: 0 var(--vox-radius) var(--vox-radius) 0;
  background: var(--vox-bg-secondary);
}
.vox-callout-info { border-left-color: #2563eb; }
.vox-callout-warning { border-left-color: #f59e0b; }
.vox-callout-danger { border-left-color: #ef4444; }
.vox-callout-tip { border-left-color: #10b981; }
.vox-callout-note { border-left-color: #8b5cf6; }

/* Tables */
.vox-table-wrapper {
  overflow-x: auto;
  margin: 1.5rem 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.75rem 1rem;
  border: 1px solid var(--vox-border);
  text-align: left;
}
th {
  background: var(--vox-bg-secondary);
  font-weight: 600;
}

/* Tabs */
.vox-tabs {
  margin: 1.5rem 0;
}
.vox-tabs [role="tablist"] {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--vox-border);
  margin-bottom: 0;
}
.vox-tabs [role="tab"] {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--vox-text);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.vox-tabs [role="tab"][aria-selected="true"] {
  border-bottom-color: var(--vox-accent);
  color: var(--vox-accent);
  font-weight: 600;
}
.vox-tabs [role="tabpanel"] {
  padding: 1rem 0;
}

/* Layout grid */
.vox-layout-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.vox-layout-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
}

/* Steps */
.vox-steps {
  counter-reset: vox-step;
  list-style: none;
  padding: 0;
}
.vox-step {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 1.5rem;
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
  font-weight: 700;
  font-size: 0.85rem;
}

/* Accordion */
.vox-accordion {
  border: 1px solid var(--vox-border);
  border-radius: var(--vox-radius);
  margin: 1rem 0;
}
.vox-accordion summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
  background: var(--vox-bg-secondary);
  border-radius: var(--vox-radius);
}
.vox-accordion[open] summary {
  border-radius: var(--vox-radius) var(--vox-radius) 0 0;
  border-bottom: 1px solid var(--vox-border);
}
.vox-accordion .vox-accordion-content {
  padding: 1rem;
}

/* Code filename header */
.vox-code-filename {
  background: var(--vox-bg-secondary);
  border: 1px solid var(--vox-border);
  border-bottom: none;
  padding: 0.4rem 0.75rem;
  font-family: var(--vox-font-mono);
  font-size: 0.8rem;
  border-radius: var(--vox-radius) var(--vox-radius) 0 0;
  color: var(--vox-text);
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
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
}
.vox-toc nav ul {
  list-style: none;
  padding-left: 1.25rem;
}
.vox-toc nav > ul {
  padding-left: 0;
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
}
.vox-skip-link:focus {
  top: 0;
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

/* Responsive: 640px */
@media (max-width: 640px) {
  .vox-layout-2col,
  .vox-layout-3col {
    grid-template-columns: 1fr;
  }
  .vox-tabs [role="tablist"] {
    flex-wrap: wrap;
  }
}

/* Responsive: 400px */
@media (max-width: 400px) {
  .vox-document {
    padding: 1rem 0.75rem;
  }
  .vox-callout {
    padding: 0.75rem 1rem;
  }
}
`.trim();
}
