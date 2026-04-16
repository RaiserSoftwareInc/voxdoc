import type { Scenario } from "./types.js";

export const small: Scenario = {
  name: "small",
  description: "5-block document — 1 heading, 4 paragraphs",
  blocks: [
    {
      type: "heading",
      content: { level: 1, content: "Getting Started with Voxdoc" },
    },
    {
      type: "paragraph",
      content: { content: "Voxdoc is an AI-first document format designed for structured content authoring." },
    },
    {
      type: "paragraph",
      content: { content: "Create and edit documents using MCP tools from any AI assistant." },
    },
    {
      type: "paragraph",
      content: { content: "Documents compile to self-rendering HTML with embedded JSON source for round-tripping." },
    },
    {
      type: "paragraph",
      content: { content: "Use batch operations to send multiple blocks in a single tool call and reduce token overhead." },
    },
  ],
  markdown: `# Getting Started with Voxdoc

Voxdoc is an AI-first document format designed for structured content authoring.

Create and edit documents using MCP tools from any AI assistant.

Documents compile to self-rendering HTML with embedded JSON source for round-tripping.

Use batch operations to send multiple blocks in a single tool call and reduce token overhead.`,
};
