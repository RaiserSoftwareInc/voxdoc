import type { Scenario } from "./types.js";

export const large: Scenario = {
  name: "large",
  description: "25-block document — headings, paragraphs, code, callouts, lists",
  blocks: [
    { type: "heading", content: { level: 1, content: "Voxdoc Reference Guide" } },
    { type: "paragraph", content: { content: "Voxdoc is an AI-first document format that enables structured, accessible, and reviewable content authoring through MCP tools." } },
    { type: "heading", content: { level: 2, content: "Installation" } },
    { type: "paragraph", content: { content: "Install the Voxdoc CLI globally to create and manage documents from the command line." } },
    { type: "code", content: { language: "bash", content: "npm install -g @voxdoc/cli" } },
    { type: "heading", content: { level: 2, content: "Creating a Document" } },
    { type: "paragraph", content: { content: "Use the init command to create a new Voxdoc document. The title argument sets the document title in metadata." } },
    { type: "code", content: { language: "bash", content: "voxdoc init my-guide --title \"My Guide\"" } },
    { type: "heading", content: { level: 2, content: "Block Types" } },
    { type: "paragraph", content: { content: "Voxdoc supports 18 block types covering text, media, layout, and interactive content." } },
    { type: "list", content: { ordered: false, items: ["heading", "paragraph", "code", "image", "list", "toc", "callout", "diagram", "table", "math", "tabs", "accordion", "steps", "layout", "include", "handwriting", "variable_def", "xref"] } },
    { type: "heading", content: { level: 2, content: "Accessibility Requirements" } },
    { type: "paragraph", content: { content: "Voxdoc enforces accessibility fields at compile time. Missing fields cause compilation to fail." } },
    { type: "callout", content: { variant: "warning", title: "Required Fields", content: "image requires alt, diagram requires description, table requires summary, math requires spoken (MathSpeak)." } },
    { type: "heading", content: { level: 2, content: "MCP Tools" } },
    { type: "paragraph", content: { content: "Voxdoc exposes 26 MCP tools organized into workspace, read, write, review, accessibility, and output categories." } },
    { type: "heading", content: { level: 3, content: "Batch Operations" } },
    { type: "paragraph", content: { content: "Batch tools accept arrays of blocks or edits, reducing the number of tool calls required for multi-block operations." } },
    { type: "code", content: { language: "json", content: "{\n  \"name\": \"add_block\",\n  \"arguments\": {\n    \"blocks\": [\n      { \"type\": \"heading\", \"content\": { \"level\": 1, \"content\": \"Title\" } },\n      { \"type\": \"paragraph\", \"content\": { \"content\": \"Body text.\" } }\n    ]\n  }\n}" } },
    { type: "callout", content: { variant: "tip", title: "Token Efficiency", content: "Batching 5 blocks in a single call uses ~80% fewer tokens than 5 individual calls." } },
    { type: "heading", content: { level: 2, content: "Variables" } },
    { type: "paragraph", content: { content: "Define variables in meta.variables and reference them as {{variable_name}} in text content. Variables are resolved at compile time." } },
    { type: "heading", content: { level: 2, content: "Compilation" } },
    { type: "paragraph", content: { content: "Compile a Voxdoc document to self-contained HTML using the compile command. The output embeds all CSS and the source JSON for round-tripping." } },
    { type: "code", content: { language: "bash", content: "voxdoc compile my-guide.vox.html --format html" } },
  ],
  markdown: `# Voxdoc Reference Guide

Voxdoc is an AI-first document format that enables structured, accessible, and reviewable content authoring through MCP tools.

## Installation

Install the Voxdoc CLI globally to create and manage documents from the command line.

\`\`\`bash
npm install -g @voxdoc/cli
\`\`\`

## Creating a Document

Use the init command to create a new Voxdoc document. The title argument sets the document title in metadata.

\`\`\`bash
voxdoc init my-guide --title "My Guide"
\`\`\`

## Block Types

Voxdoc supports 18 block types covering text, media, layout, and interactive content.

- heading
- paragraph
- code
- image
- list
- toc
- callout
- diagram
- table
- math
- tabs
- accordion
- steps
- layout
- include
- handwriting
- variable_def
- xref

## Accessibility Requirements

Voxdoc enforces accessibility fields at compile time. Missing fields cause compilation to fail.

> **Warning: Required Fields**
> image requires alt, diagram requires description, table requires summary, math requires spoken (MathSpeak).

## MCP Tools

Voxdoc exposes 26 MCP tools organized into workspace, read, write, review, accessibility, and output categories.

### Batch Operations

Batch tools accept arrays of blocks or edits, reducing the number of tool calls required for multi-block operations.

\`\`\`json
{
  "name": "add_block",
  "arguments": {
    "blocks": [
      { "type": "heading", "content": { "level": 1, "content": "Title" } },
      { "type": "paragraph", "content": { "content": "Body text." } }
    ]
  }
}
\`\`\`

> **Tip: Token Efficiency**
> Batching 5 blocks in a single call uses ~80% fewer tokens than 5 individual calls.

## Variables

Define variables in meta.variables and reference them as {{variable_name}} in text content. Variables are resolved at compile time.

## Compilation

Compile a Voxdoc document to self-contained HTML using the compile command. The output embeds all CSS and the source JSON for round-tripping.

\`\`\`bash
voxdoc compile my-guide.vox.html --format html
\`\`\``,
};
