const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "code",
  "image",
  "list",
  "toc",
  "callout",
  "diagram",
  "table",
  "math",
  "tabs",
  "accordion",
  "steps",
  "layout",
  "include",
  "handwriting",
  "variable_def",
  "xref",
] as const;

const reviewSchema = {
  type: "object",
  properties: {
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: ["string", "null"] },
    status: { type: "string", enum: ["pre_approved", "pending", "flagged", "approved"] },
  },
  required: ["confidence", "reason", "status"],
};

const baseBlockProperties = {
  id: { type: "string" },
  review: reviewSchema,
};

function blockSchema(
  typeName: string,
  props: Record<string, unknown>,
  required: string[] = [],
) {
  return {
    type: "object",
    properties: {
      ...baseBlockProperties,
      type: { type: "string", const: typeName },
      ...props,
    },
    required: ["id", "type", ...required],
    additionalProperties: false,
  };
}

// Recursive block ref — used for nested blocks (accordion, steps, tabs, layout)
const blockRef = { $ref: "#/$defs/block" };

const blockSchemas: Record<string, object> = {
  heading: blockSchema(
    "heading",
    {
      level: { type: "integer", minimum: 1, maximum: 6 },
      content: { type: "string" },
    },
    ["level", "content"],
  ),

  paragraph: blockSchema("paragraph", { content: { type: "string" } }, ["content"]),

  code: blockSchema(
    "code",
    {
      language: { type: "string" },
      content: { type: "string" },
      filename: { type: "string" },
      highlight_lines: { type: "array", items: { type: "integer" } },
    },
    ["language", "content"],
  ),

  image: blockSchema(
    "image",
    {
      src: { type: "string" },
      alt: { type: "string", minLength: 1 },
      caption: { type: "string" },
    },
    ["src", "alt"],
  ),

  list: blockSchema(
    "list",
    {
      ordered: { type: "boolean" },
      items: { type: "array", items: { type: "string" } },
    },
    ["ordered", "items"],
  ),

  toc: blockSchema("toc", { max_depth: { type: "integer" } }),

  callout: blockSchema(
    "callout",
    {
      variant: { type: "string", enum: ["info", "warning", "danger", "tip", "note"] },
      title: { type: "string" },
      content: { type: "string" },
    },
    ["variant", "content"],
  ),

  diagram: blockSchema(
    "diagram",
    {
      syntax: { type: "string", enum: ["mermaid", "graphviz", "d2"] },
      content: { type: "string" },
      description: { type: "string", minLength: 1 },
    },
    ["syntax", "content", "description"],
  ),

  table: blockSchema(
    "table",
    {
      headers: { type: "array", items: { type: "string" } },
      rows: { type: "array", items: { type: "array", items: { type: "string" } } },
      caption: { type: "string" },
      summary: { type: "string", minLength: 1 },
    },
    ["headers", "rows", "summary"],
  ),

  math: blockSchema(
    "math",
    {
      expression: { type: "string" },
      display: { type: "string", enum: ["inline", "block"] },
      spoken: { type: "string", minLength: 1 },
    },
    ["expression", "display", "spoken"],
  ),

  tabs: blockSchema(
    "tabs",
    {
      panels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            type: { type: "string" },
            language: { type: "string" },
            content: { type: "string" },
            blocks: { type: "array", items: blockRef },
          },
          required: ["label"],
        },
      },
    },
    ["panels"],
  ),

  accordion: blockSchema(
    "accordion",
    {
      title: { type: "string" },
      blocks: { type: "array", items: blockRef },
      default_open: { type: "boolean" },
    },
    ["title", "blocks"],
  ),

  steps: blockSchema(
    "steps",
    {
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            blocks: { type: "array", items: blockRef },
          },
          required: ["title", "blocks"],
        },
      },
    },
    ["steps"],
  ),

  layout: blockSchema(
    "layout",
    {
      columns: { type: "integer", enum: [2, 3] },
      blocks: { type: "array", items: { type: "array", items: blockRef } },
    },
    ["columns", "blocks"],
  ),

  include: blockSchema(
    "include",
    {
      src: { type: "string" },
      section: { type: "string" },
    },
    ["src"],
  ),

  handwriting: blockSchema(
    "handwriting",
    {
      image: { type: "string" },
      alt: { type: "string" },
      transcription: {
        type: "object",
        properties: {
          text: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          status: { type: "string", enum: ["pre_approved", "pending", "flagged", "approved"] },
          method: { type: "string" },
        },
        required: ["text", "confidence", "status", "method"],
      },
    },
    ["image", "alt", "transcription"],
  ),

  variable_def: blockSchema(
    "variable_def",
    {
      key: { type: "string" },
      value: { type: "string" },
    },
    ["key", "value"],
  ),

  xref: blockSchema("xref", { target: { type: "string" } }, ["target"]),
};

export const voxDocumentSchema = {
  type: "object",
  properties: {
    $schema: { type: "string" },
    meta: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        version: { type: "string" },
        authors: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } },
        status: { type: "string", enum: ["draft", "pending_review", "approved", "published"] },
        created: { type: "string" },
        updated: { type: "string" },
        variables: { type: "object", additionalProperties: { type: "string" } },
        provenance: {
          type: "object",
          properties: {
            generated_by: { type: "string" },
            reviewed_by: { type: "string" },
            approved_blocks: { type: "array", items: { type: "string" } },
            flagged_blocks: { type: "array", items: { type: "string" } },
          },
          required: ["generated_by", "reviewed_by", "approved_blocks", "flagged_blocks"],
        },
        accessibility: {
          type: "object",
          properties: {
            language: { type: "string" },
            reading_level: { type: "string" },
          },
          required: ["language", "reading_level"],
        },
      },
      required: [
        "id",
        "title",
        "description",
        "version",
        "authors",
        "tags",
        "status",
        "created",
        "updated",
        "variables",
        "provenance",
        "accessibility",
      ],
    },
    blocks: {
      type: "array",
      items: { $ref: "#/$defs/block" },
    },
    comments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          block_id: { type: "string" },
          comment: { type: "string" },
          created: { type: "string" },
          resolved: { type: "boolean" },
        },
        required: ["id", "block_id", "comment", "created", "resolved"],
      },
    },
  },
  required: ["meta", "blocks"],
  $defs: {
    block: {
      oneOf: Object.values(blockSchemas),
    },
  },
};
