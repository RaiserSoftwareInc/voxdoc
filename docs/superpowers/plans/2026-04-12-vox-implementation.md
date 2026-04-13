# Vox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Vox — an AI-first, accessible, open document format with a JSON block schema, HTML compiler, MCP server, CLI, and web-based review interface.

**Architecture:** Monorepo with 5 scoped npm packages (`@vox/schema`, `@vox/compiler`, `@vox/mcp`, `@vox/cli`, `@vox/viewer`). Schema is the foundation — all packages depend on it. Compiler renders blocks to HTML strings. MCP server exposes document operations as AI tools. CLI wires it all together. Viewer is a Next.js app for human review.

**Tech Stack:** TypeScript, pnpm workspaces, Turborepo, Vitest, Commander.js, ajv, nanoid, @modelcontextprotocol/sdk, marked, shiki, katex, Mermaid (client-side in compiled output), Next.js 15, React, Zustand, Tailwind CSS.

---

## File Structure

```
vox/
├── package.json                        # Workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .gitignore
├── packages/
│   ├── schema/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                # Public API
│   │   │   ├── types.ts                # TypeScript types for all blocks + document
│   │   │   ├── schema.ts               # JSONSchema as JS object
│   │   │   ├── validate.ts             # ajv validation wrapper
│   │   │   └── block-id.ts             # nanoid-based block ID generation
│   │   └── tests/
│   │       ├── validate.test.ts
│   │       └── block-id.test.ts
│   ├── compiler/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                # Public API: compile()
│   │   │   ├── compiler.ts             # Main compile orchestrator
│   │   │   ├── variables.ts            # {{var}} resolution
│   │   │   ├── accessibility.ts        # Pre-compile accessibility checks
│   │   │   ├── styles.ts               # Responsive CSS generation
│   │   │   ├── document-shell.ts       # HTML <html>/<head>/<body> wrapper
│   │   │   └── renderers/
│   │   │       ├── index.ts            # Registry mapping type → renderer
│   │   │       ├── heading.ts
│   │   │       ├── paragraph.ts
│   │   │       ├── code.ts
│   │   │       ├── list.ts
│   │   │       ├── image.ts
│   │   │       ├── toc.ts
│   │   │       ├── callout.ts
│   │   │       ├── diagram.ts
│   │   │       ├── table.ts
│   │   │       ├── math.ts
│   │   │       ├── tabs.ts
│   │   │       ├── accordion.ts
│   │   │       ├── steps.ts
│   │   │       ├── layout.ts
│   │   │       ├── handwriting.ts
│   │   │       ├── include.ts
│   │   │       └── variable-def.ts
│   │   └── tests/
│   │       ├── compiler.test.ts
│   │       ├── variables.test.ts
│   │       ├── accessibility.test.ts
│   │       └── renderers/
│   │           ├── heading.test.ts
│   │           ├── paragraph.test.ts
│   │           ├── callout.test.ts
│   │           ├── table.test.ts
│   │           └── tabs.test.ts
│   ├── mcp/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                # Public API
│   │   │   ├── server.ts               # MCP server setup + tool registration
│   │   │   ├── document-store.ts       # File I/O + in-memory document state
│   │   │   └── tools/
│   │   │       ├── document-reads.ts
│   │   │       ├── document-writes.ts
│   │   │       ├── review.ts
│   │   │       ├── accessibility.ts
│   │   │       └── output.ts
│   │   └── tests/
│   │       ├── document-store.test.ts
│   │       ├── document-reads.test.ts
│   │       ├── document-writes.test.ts
│   │       └── review.test.ts
│   ├── cli/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                # Entry point
│   │   │   ├── cli.ts                  # Commander setup
│   │   │   └── commands/
│   │   │       ├── init.ts
│   │   │       ├── validate.ts
│   │   │       ├── compile.ts
│   │   │       ├── info.ts
│   │   │       ├── blocks.ts
│   │   │       ├── view.ts
│   │   │       └── mcp-serve.ts
│   │   └── tests/
│   │       ├── init.test.ts
│   │       └── compile.test.ts
│   └── viewer/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── blocks/
│       │   │   │   ├── BlockRenderer.tsx    # Dispatch component
│       │   │   │   ├── Heading.tsx
│       │   │   │   ├── Paragraph.tsx
│       │   │   │   ├── Code.tsx
│       │   │   │   ├── Callout.tsx
│       │   │   │   ├── Table.tsx
│       │   │   │   ├── Diagram.tsx
│       │   │   │   ├── Math.tsx
│       │   │   │   ├── Tabs.tsx
│       │   │   │   ├── Accordion.tsx
│       │   │   │   ├── Steps.tsx
│       │   │   │   ├── Layout.tsx
│       │   │   │   ├── Image.tsx
│       │   │   │   ├── List.tsx
│       │   │   │   └── Handwriting.tsx
│       │   │   ├── review/
│       │   │   │   ├── ReviewSidebar.tsx
│       │   │   │   ├── BlockReviewControls.tsx
│       │   │   │   └── CommentThread.tsx
│       │   │   └── layout/
│       │   │       ├── Shell.tsx
│       │   │       └── TopBar.tsx
│       │   ├── lib/
│       │   │   └── api.ts              # Fetch-based API to CLI server
│       │   └── store/
│       │       └── document.ts         # Zustand store
│       └── tests/
│           └── components/
│               └── BlockRenderer.test.tsx
├── examples/
│   ├── hello-world.vox
│   └── api-reference.vox
└── docs/
    └── superpowers/
```

---

### Task 0: Monorepo & Tooling Setup

**Goal:** Scaffold the monorepo with pnpm workspaces, TypeScript, Turborepo, and all 5 empty packages.

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`
- Create: `packages/{schema,compiler,mcp,cli,viewer}/package.json`
- Create: `packages/{schema,compiler,mcp,cli}/tsconfig.json`
- Create: `packages/{schema,compiler,mcp,cli}/src/index.ts`

**Acceptance Criteria:**
- [ ] `pnpm install` succeeds
- [ ] `pnpm -r build` succeeds (all packages compile)
- [ ] Git repo initialized with initial commit

**Verify:** `pnpm install && pnpm -r build` → exits 0

**Steps:**

- [ ] **Step 1: Initialize git and create root configs**

```bash
cd D:/code/personal/PDF
git init
```

```json
// package.json
{
  "name": "vox",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

```gitignore
# .gitignore
node_modules/
dist/
.turbo/
*.tsbuildinfo
.superpowers/
.claude/
```

- [ ] **Step 2: Scaffold @vox/schema package**

```json
// packages/schema/package.json
{
  "name": "@vox/schema",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "ajv": "^8.17.0",
    "nanoid": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

```json
// packages/schema/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

```typescript
// packages/schema/src/index.ts
export {};
```

- [ ] **Step 3: Scaffold @vox/compiler package**

```json
// packages/compiler/package.json
{
  "name": "@vox/compiler",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@vox/schema": "workspace:*",
    "katex": "^0.16.0",
    "marked": "^15.0.0",
    "shiki": "^3.0.0"
  },
  "devDependencies": {
    "@types/katex": "^0.16.0",
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

```json
// packages/compiler/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../schema" }]
}
```

```typescript
// packages/compiler/src/index.ts
export {};
```

- [ ] **Step 4: Scaffold @vox/mcp package**

```json
// packages/mcp/package.json
{
  "name": "@vox/mcp",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@vox/schema": "workspace:*",
    "@vox/compiler": "workspace:*",
    "@modelcontextprotocol/sdk": "^1.12.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

```json
// packages/mcp/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../schema" }, { "path": "../compiler" }]
}
```

```typescript
// packages/mcp/src/index.ts
export {};
```

- [ ] **Step 5: Scaffold @vox/cli package**

```json
// packages/cli/package.json
{
  "name": "@vox/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "vox": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@vox/schema": "workspace:*",
    "@vox/compiler": "workspace:*",
    "@vox/mcp": "workspace:*",
    "commander": "^13.0.0",
    "chalk": "^5.4.0",
    "open": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

```json
// packages/cli/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../schema" }, { "path": "../compiler" }, { "path": "../mcp" }]
}
```

```typescript
// packages/cli/src/index.ts
#!/usr/bin/env node
console.log("vox cli");
```

- [ ] **Step 6: Install dependencies and verify build**

```bash
pnpm install
pnpm -r build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vox monorepo with 5 packages"
```

---

### Task 1: @vox/schema — Types, JSONSchema, Validation

**Goal:** Define the complete Vox document type system, JSONSchema, and a validation function. This is the foundation every other package depends on.

**Files:**
- Create: `packages/schema/src/types.ts`
- Create: `packages/schema/src/schema.ts`
- Create: `packages/schema/src/validate.ts`
- Create: `packages/schema/src/block-id.ts`
- Modify: `packages/schema/src/index.ts`
- Create: `packages/schema/tests/validate.test.ts`
- Create: `packages/schema/tests/block-id.test.ts`

**Acceptance Criteria:**
- [ ] All block types and document meta types exported from `@vox/schema`
- [ ] `validateDocument()` returns `{ valid: true }` for valid documents, `{ valid: false, errors: [...] }` for invalid
- [ ] `generateBlockId()` returns `blk_` prefixed unique IDs
- [ ] All tests pass

**Verify:** `cd packages/schema && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write the failing tests for validation**

```typescript
// packages/schema/tests/validate.test.ts
import { describe, it, expect } from "vitest";
import { validateDocument, type VoxDocument } from "../src/index.js";

describe("validateDocument", () => {
  it("validates a minimal valid document", () => {
    const doc: VoxDocument = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: "test-uuid",
        title: "Test",
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: "2026-04-12T00:00:00Z",
        updated: "2026-04-12T00:00:00Z",
        variables: {},
        provenance: {
          generated_by: null,
          reviewed_by: null,
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [],
    };
    const result = validateDocument(doc);
    expect(result.valid).toBe(true);
  });

  it("rejects a document with missing meta.title", () => {
    const doc = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: { id: "test" },
      blocks: [],
    };
    const result = validateDocument(doc as any);
    expect(result.valid).toBe(false);
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("validates a document with blocks", () => {
    const doc: VoxDocument = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: "test-uuid",
        title: "Test",
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: "2026-04-12T00:00:00Z",
        updated: "2026-04-12T00:00:00Z",
        variables: {},
        provenance: {
          generated_by: null,
          reviewed_by: null,
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [
        { id: "blk_001", type: "heading", level: 1, content: "Hello" },
        { id: "blk_002", type: "paragraph", content: "World" },
      ],
    };
    const result = validateDocument(doc);
    expect(result.valid).toBe(true);
  });

  it("rejects an invalid block type", () => {
    const doc = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: "test-uuid",
        title: "Test",
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: "2026-04-12T00:00:00Z",
        updated: "2026-04-12T00:00:00Z",
        variables: {},
        provenance: {
          generated_by: null,
          reviewed_by: null,
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [{ id: "blk_001", type: "nonexistent", content: "x" }],
    };
    const result = validateDocument(doc as any);
    expect(result.valid).toBe(false);
  });

  it("rejects image block with missing alt", () => {
    const doc = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: "test-uuid",
        title: "Test",
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: "2026-04-12T00:00:00Z",
        updated: "2026-04-12T00:00:00Z",
        variables: {},
        provenance: {
          generated_by: null,
          reviewed_by: null,
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [{ id: "blk_001", type: "image", src: "img.png" }],
    };
    const result = validateDocument(doc as any);
    expect(result.valid).toBe(false);
  });
});
```

```typescript
// packages/schema/tests/block-id.test.ts
import { describe, it, expect } from "vitest";
import { generateBlockId } from "../src/index.js";

describe("generateBlockId", () => {
  it("starts with blk_ prefix", () => {
    const id = generateBlockId();
    expect(id).toMatch(/^blk_/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateBlockId()));
    expect(ids.size).toBe(100);
  });

  it("has consistent length", () => {
    const id = generateBlockId();
    expect(id.length).toBeGreaterThan(4);
    expect(id.length).toBeLessThan(30);
  });
});
```

- [ ] **Step 2: Define TypeScript types**

```typescript
// packages/schema/src/types.ts

// --- Review ---
export type ReviewStatus = "pre_approved" | "pending" | "flagged" | "approved";

export interface BlockReview {
  confidence: number;
  reason: string | null;
  status: ReviewStatus;
}

// --- Base Block ---
export interface BaseBlock {
  id: string;
  review?: BlockReview;
}

// --- Core Blocks ---
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: string;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  content: string;
  filename?: string;
  highlight_lines?: number[];
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface ListBlock extends BaseBlock {
  type: "list";
  ordered: boolean;
  items: string[];
}

export interface TocBlock extends BaseBlock {
  type: "toc";
  max_depth?: number;
}

// --- Enhanced Blocks ---
export type CalloutVariant = "info" | "warning" | "danger" | "tip" | "note";

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  content: string;
}

export interface DiagramBlock extends BaseBlock {
  type: "diagram";
  syntax: "mermaid" | "graphviz" | "d2";
  content: string;
  description: string;
}

export interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
  caption?: string;
  summary: string;
}

export interface MathBlock extends BaseBlock {
  type: "math";
  expression: string;
  display: "inline" | "block";
  spoken: string;
}

export interface TabPanel {
  label: string;
  type?: string;
  language?: string;
  content?: string;
  blocks?: VoxBlock[];
}

export interface TabsBlock extends BaseBlock {
  type: "tabs";
  panels: TabPanel[];
}

export interface AccordionBlock extends BaseBlock {
  type: "accordion";
  title: string;
  blocks: VoxBlock[];
  default_open?: boolean;
}

export interface StepItem {
  title: string;
  blocks: VoxBlock[];
}

export interface StepsBlock extends BaseBlock {
  type: "steps";
  steps: StepItem[];
}

export interface LayoutBlock extends BaseBlock {
  type: "layout";
  columns: 2 | 3;
  blocks: VoxBlock[][];
}

export interface IncludeBlock extends BaseBlock {
  type: "include";
  src: string;
  section?: string;
}

// --- Accessibility Blocks ---
export interface HandwritingTranscription {
  text: string;
  confidence: number;
  status: "pending_review" | "verified";
  method: "ai_ocr" | "manual";
}

export interface HandwritingBlock extends BaseBlock {
  type: "handwriting";
  image: string;
  alt: string;
  transcription: HandwritingTranscription;
}

// --- Metadata Blocks ---
export interface VariableDefBlock extends BaseBlock {
  type: "variable_def";
  key: string;
  value: string;
}

// --- Cross-reference Block ---
export interface XrefBlock extends BaseBlock {
  type: "xref";
  target: string;
}

// --- Union Type ---
export type VoxBlock =
  | HeadingBlock
  | ParagraphBlock
  | CodeBlock
  | ImageBlock
  | ListBlock
  | TocBlock
  | CalloutBlock
  | DiagramBlock
  | TableBlock
  | MathBlock
  | TabsBlock
  | AccordionBlock
  | StepsBlock
  | LayoutBlock
  | IncludeBlock
  | HandwritingBlock
  | VariableDefBlock
  | XrefBlock;

// --- Document Status ---
export type DocumentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published";

// --- Document Meta ---
export interface DocumentProvenance {
  generated_by: string | null;
  reviewed_by: string | null;
  approved_blocks: string[];
  flagged_blocks: string[];
}

export interface DocumentAccessibility {
  language: string;
  reading_level: string;
}

export interface DocumentMeta {
  id: string;
  title: string;
  description: string;
  version: string;
  authors: string[];
  tags: string[];
  status: DocumentStatus;
  created: string;
  updated: string;
  variables: Record<string, string>;
  provenance: DocumentProvenance;
  accessibility: DocumentAccessibility;
}

// --- Comment ---
export interface ReviewComment {
  id: string;
  block_id: string;
  comment: string;
  created: string;
  resolved: boolean;
}

// --- Full Document ---
export interface VoxDocument {
  $schema: string;
  meta: DocumentMeta;
  blocks: VoxBlock[];
  comments?: ReviewComment[];
}
```

- [ ] **Step 3: Define JSONSchema**

```typescript
// packages/schema/src/schema.ts

export const BLOCK_TYPES = [
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
    status: {
      type: "string",
      enum: ["pre_approved", "pending", "flagged", "approved"],
    },
  },
  required: ["confidence", "reason", "status"],
};

const blockSchemas: Record<string, object> = {
  heading: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "heading" },
      level: { type: "integer", minimum: 1, maximum: 6 },
      content: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "level", "content"],
  },
  paragraph: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "paragraph" },
      content: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "content"],
  },
  code: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "code" },
      language: { type: "string" },
      content: { type: "string" },
      filename: { type: "string" },
      highlight_lines: { type: "array", items: { type: "integer" } },
      review: reviewSchema,
    },
    required: ["id", "type", "language", "content"],
  },
  image: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "image" },
      src: { type: "string" },
      alt: { type: "string", minLength: 1 },
      caption: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "src", "alt"],
  },
  list: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "list" },
      ordered: { type: "boolean" },
      items: { type: "array", items: { type: "string" } },
      review: reviewSchema,
    },
    required: ["id", "type", "ordered", "items"],
  },
  toc: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "toc" },
      max_depth: { type: "integer", minimum: 1, maximum: 6 },
      review: reviewSchema,
    },
    required: ["id", "type"],
  },
  callout: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "callout" },
      variant: {
        type: "string",
        enum: ["info", "warning", "danger", "tip", "note"],
      },
      title: { type: "string" },
      content: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "variant", "content"],
  },
  diagram: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "diagram" },
      syntax: { type: "string", enum: ["mermaid", "graphviz", "d2"] },
      content: { type: "string" },
      description: { type: "string", minLength: 1 },
      review: reviewSchema,
    },
    required: ["id", "type", "syntax", "content", "description"],
  },
  table: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "table" },
      headers: { type: "array", items: { type: "string" } },
      rows: {
        type: "array",
        items: { type: "array", items: { type: "string" } },
      },
      caption: { type: "string" },
      summary: { type: "string", minLength: 1 },
      review: reviewSchema,
    },
    required: ["id", "type", "headers", "rows", "summary"],
  },
  math: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "math" },
      expression: { type: "string" },
      display: { type: "string", enum: ["inline", "block"] },
      spoken: { type: "string", minLength: 1 },
      review: reviewSchema,
    },
    required: ["id", "type", "expression", "display", "spoken"],
  },
  tabs: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "tabs" },
      panels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
          },
          required: ["label"],
        },
      },
      review: reviewSchema,
    },
    required: ["id", "type", "panels"],
  },
  accordion: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "accordion" },
      title: { type: "string" },
      default_open: { type: "boolean" },
      review: reviewSchema,
    },
    required: ["id", "type", "title"],
  },
  steps: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "steps" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: { title: { type: "string" } },
          required: ["title"],
        },
      },
      review: reviewSchema,
    },
    required: ["id", "type", "steps"],
  },
  layout: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "layout" },
      columns: { type: "integer", enum: [2, 3] },
      review: reviewSchema,
    },
    required: ["id", "type", "columns"],
  },
  include: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "include" },
      src: { type: "string" },
      section: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "src"],
  },
  handwriting: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "handwriting" },
      image: { type: "string" },
      alt: { type: "string", minLength: 1 },
      transcription: {
        type: "object",
        properties: {
          text: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          status: {
            type: "string",
            enum: ["pending_review", "verified"],
          },
          method: { type: "string", enum: ["ai_ocr", "manual"] },
        },
        required: ["text", "confidence", "status", "method"],
      },
      review: reviewSchema,
    },
    required: ["id", "type", "image", "alt", "transcription"],
  },
  variable_def: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "variable_def" },
      key: { type: "string" },
      value: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "key", "value"],
  },
  xref: {
    type: "object",
    properties: {
      id: { type: "string" },
      type: { const: "xref" },
      target: { type: "string" },
      review: reviewSchema,
    },
    required: ["id", "type", "target"],
  },
};

export const voxDocumentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://voxformat.dev/schema/v1.json",
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
        status: {
          type: "string",
          enum: ["draft", "pending_review", "approved", "published"],
        },
        created: { type: "string" },
        updated: { type: "string" },
        variables: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        provenance: {
          type: "object",
          properties: {
            generated_by: { type: ["string", "null"] },
            reviewed_by: { type: ["string", "null"] },
            approved_blocks: { type: "array", items: { type: "string" } },
            flagged_blocks: { type: "array", items: { type: "string" } },
          },
          required: [
            "generated_by",
            "reviewed_by",
            "approved_blocks",
            "flagged_blocks",
          ],
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
      items: {
        oneOf: Object.values(blockSchemas),
      },
    },
  },
  required: ["meta", "blocks"],
};

export { blockSchemas };
```

- [ ] **Step 4: Implement validation and block ID generation**

```typescript
// packages/schema/src/validate.ts
import Ajv from "ajv";
import { voxDocumentSchema } from "./schema.js";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(voxDocumentSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

export function validateDocument(doc: unknown): ValidationResult {
  const valid = validate(doc);
  if (valid) {
    return { valid: true };
  }
  return {
    valid: false,
    errors: (validate.errors ?? []).map((e) => ({
      path: e.instancePath || "/",
      message: e.message ?? "Unknown error",
    })),
  };
}
```

```typescript
// packages/schema/src/block-id.ts
import { nanoid } from "nanoid";

export function generateBlockId(): string {
  return `blk_${nanoid(12)}`;
}
```

- [ ] **Step 5: Wire up the public API**

```typescript
// packages/schema/src/index.ts
export type {
  VoxDocument,
  VoxBlock,
  DocumentMeta,
  DocumentStatus,
  DocumentProvenance,
  DocumentAccessibility,
  ReviewComment,
  BlockReview,
  ReviewStatus,
  HeadingBlock,
  ParagraphBlock,
  CodeBlock,
  ImageBlock,
  ListBlock,
  TocBlock,
  CalloutBlock,
  CalloutVariant,
  DiagramBlock,
  TableBlock,
  MathBlock,
  TabsBlock,
  TabPanel,
  AccordionBlock,
  StepsBlock,
  StepItem,
  LayoutBlock,
  IncludeBlock,
  HandwritingBlock,
  HandwritingTranscription,
  VariableDefBlock,
  XrefBlock,
  BaseBlock,
} from "./types.js";

export { voxDocumentSchema, blockSchemas, BLOCK_TYPES } from "./schema.js";
export { validateDocument, type ValidationResult } from "./validate.js";
export { generateBlockId } from "./block-id.js";
```

- [ ] **Step 6: Run tests**

```bash
cd packages/schema && pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/schema/
git commit -m "feat(schema): add Vox document types, JSONSchema, and validation"
```

---

### Task 2: @vox/compiler — Core Block Renderers

**Goal:** Implement HTML renderers for core block types: heading, paragraph, code, list, image, toc.

**Files:**
- Create: `packages/compiler/src/renderers/heading.ts`
- Create: `packages/compiler/src/renderers/paragraph.ts`
- Create: `packages/compiler/src/renderers/code.ts`
- Create: `packages/compiler/src/renderers/list.ts`
- Create: `packages/compiler/src/renderers/image.ts`
- Create: `packages/compiler/src/renderers/toc.ts`
- Create: `packages/compiler/src/renderers/index.ts`
- Create: `packages/compiler/tests/renderers/heading.test.ts`
- Create: `packages/compiler/tests/renderers/paragraph.test.ts`

**Acceptance Criteria:**
- [ ] Each renderer accepts a block object and returns an HTML string
- [ ] Heading renderer emits semantic `<h1>`-`<h6>` with ID attributes
- [ ] Paragraph renderer parses inline Markdown (bold, italic, code, links)
- [ ] Code renderer produces `<pre><code>` with language class
- [ ] Image renderer always includes `alt` attribute and wraps in `<figure>`
- [ ] All tests pass

**Verify:** `cd packages/compiler && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests for heading and paragraph renderers**

```typescript
// packages/compiler/tests/renderers/heading.test.ts
import { describe, it, expect } from "vitest";
import { renderHeading } from "../../src/renderers/heading.js";

describe("renderHeading", () => {
  it("renders h1 with id", () => {
    const html = renderHeading({
      id: "blk_001",
      type: "heading",
      level: 1,
      content: "Hello World",
    });
    expect(html).toContain("<h1");
    expect(html).toContain('id="blk_001"');
    expect(html).toContain("Hello World");
    expect(html).toContain("</h1>");
  });

  it("renders h3", () => {
    const html = renderHeading({
      id: "blk_002",
      type: "heading",
      level: 3,
      content: "Sub Section",
    });
    expect(html).toContain("<h3");
    expect(html).toContain("</h3>");
  });
});
```

```typescript
// packages/compiler/tests/renderers/paragraph.test.ts
import { describe, it, expect } from "vitest";
import { renderParagraph } from "../../src/renderers/paragraph.js";

describe("renderParagraph", () => {
  it("renders plain text", () => {
    const html = renderParagraph({
      id: "blk_001",
      type: "paragraph",
      content: "Hello World",
    });
    expect(html).toContain("<p");
    expect(html).toContain("Hello World");
    expect(html).toContain("</p>");
  });

  it("parses inline markdown", () => {
    const html = renderParagraph({
      id: "blk_002",
      type: "paragraph",
      content: "This is **bold** and *italic*",
    });
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("resolves variables", () => {
    const html = renderParagraph(
      { id: "blk_003", type: "paragraph", content: "Use {{api_version}}" },
      { api_version: "v2" }
    );
    expect(html).toContain("Use v2");
  });
});
```

- [ ] **Step 2: Implement heading renderer**

```typescript
// packages/compiler/src/renderers/heading.ts
import type { HeadingBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderHeading(
  block: HeadingBlock,
  variables?: Record<string, string>
): string {
  const tag = `h${block.level}`;
  const content = resolveVars(escapeHtml(block.content), variables);
  return `<${tag} id="${block.id}">${content}</${tag}>`;
}

function resolveVars(
  text: string,
  vars?: Record<string, string>
): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
```

```typescript
// packages/compiler/src/utils.ts
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

- [ ] **Step 3: Implement paragraph renderer with inline Markdown**

```typescript
// packages/compiler/src/renderers/paragraph.ts
import type { ParagraphBlock } from "@vox/schema";
import { marked } from "marked";

export function renderParagraph(
  block: ParagraphBlock,
  variables?: Record<string, string>
): string {
  let content = block.content;
  if (variables) {
    content = content.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => variables[key] ?? `{{${key}}}`
    );
  }
  // marked.parseInline returns inline-level HTML (no wrapping <p>)
  const html = marked.parseInline(content) as string;
  return `<p id="${block.id}">${html}</p>`;
}
```

- [ ] **Step 4: Implement code, list, image, toc renderers**

```typescript
// packages/compiler/src/renderers/code.ts
import type { CodeBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderCode(block: CodeBlock): string {
  const escaped = escapeHtml(block.content);
  const filenameAttr = block.filename
    ? ` data-filename="${escapeHtml(block.filename)}"`
    : "";
  const header = block.filename
    ? `<div class="vox-code-filename">${escapeHtml(block.filename)}</div>`
    : "";
  return `<div class="vox-code-block" id="${block.id}"${filenameAttr}>${header}<pre><code class="language-${block.language}">${escaped}</code></pre></div>`;
}
```

```typescript
// packages/compiler/src/renderers/list.ts
import type { ListBlock } from "@vox/schema";
import { marked } from "marked";

export function renderList(
  block: ListBlock,
  variables?: Record<string, string>
): string {
  const tag = block.ordered ? "ol" : "ul";
  const items = block.items
    .map((item) => {
      let content = item;
      if (variables) {
        content = content.replace(
          /\{\{(\w+)\}\}/g,
          (_, key) => variables[key] ?? `{{${key}}}`
        );
      }
      return `<li>${marked.parseInline(content)}</li>`;
    })
    .join("\n");
  return `<${tag} id="${block.id}">\n${items}\n</${tag}>`;
}
```

```typescript
// packages/compiler/src/renderers/image.ts
import type { ImageBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderImage(block: ImageBlock): string {
  const caption = block.caption
    ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
    : "";
  return `<figure id="${block.id}">
<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy" style="max-width:100%">
${caption}
</figure>`;
}
```

```typescript
// packages/compiler/src/renderers/toc.ts
import type { TocBlock, VoxBlock, HeadingBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderToc(
  block: TocBlock,
  allBlocks: VoxBlock[]
): string {
  const maxDepth = block.max_depth ?? 3;
  const headings = allBlocks.filter(
    (b): b is HeadingBlock => b.type === "heading" && b.level <= maxDepth
  );
  const items = headings
    .map(
      (h) =>
        `<li class="vox-toc-level-${h.level}"><a href="#${h.id}">${escapeHtml(h.content)}</a></li>`
    )
    .join("\n");
  return `<nav id="${block.id}" class="vox-toc" aria-label="Table of contents">
<ol>\n${items}\n</ol>
</nav>`;
}
```

- [ ] **Step 5: Create renderer registry**

```typescript
// packages/compiler/src/renderers/index.ts
import type { VoxBlock } from "@vox/schema";
import { renderHeading } from "./heading.js";
import { renderParagraph } from "./paragraph.js";
import { renderCode } from "./code.js";
import { renderList } from "./list.js";
import { renderImage } from "./image.js";
import { renderToc } from "./toc.js";

export type RenderContext = {
  variables: Record<string, string>;
  allBlocks: VoxBlock[];
};

export function renderBlock(block: VoxBlock, ctx: RenderContext): string {
  switch (block.type) {
    case "heading":
      return renderHeading(block, ctx.variables);
    case "paragraph":
      return renderParagraph(block, ctx.variables);
    case "code":
      return renderCode(block);
    case "list":
      return renderList(block, ctx.variables);
    case "image":
      return renderImage(block);
    case "toc":
      return renderToc(block, ctx.allBlocks);
    default:
      return `<div id="${(block as any).id}" class="vox-unsupported">[Unsupported block: ${(block as any).type}]</div>`;
  }
}

export { renderHeading } from "./heading.js";
export { renderParagraph } from "./paragraph.js";
export { renderCode } from "./code.js";
export { renderList } from "./list.js";
export { renderImage } from "./image.js";
export { renderToc } from "./toc.js";
```

- [ ] **Step 6: Run tests and commit**

```bash
cd packages/compiler && pnpm test
git add packages/compiler/
git commit -m "feat(compiler): add core block renderers (heading, paragraph, code, list, image, toc)"
```

---

### Task 3: @vox/compiler — Enhanced Block Renderers

**Goal:** Implement HTML renderers for enhanced block types: callout, diagram, table, math, tabs, accordion, steps, layout, handwriting, include, variable_def.

**Files:**
- Create: `packages/compiler/src/renderers/callout.ts`
- Create: `packages/compiler/src/renderers/diagram.ts`
- Create: `packages/compiler/src/renderers/table.ts`
- Create: `packages/compiler/src/renderers/math.ts`
- Create: `packages/compiler/src/renderers/tabs.ts`
- Create: `packages/compiler/src/renderers/accordion.ts`
- Create: `packages/compiler/src/renderers/steps.ts`
- Create: `packages/compiler/src/renderers/layout.ts`
- Create: `packages/compiler/src/renderers/handwriting.ts`
- Create: `packages/compiler/src/renderers/include.ts`
- Create: `packages/compiler/src/renderers/variable-def.ts`
- Modify: `packages/compiler/src/renderers/index.ts` — add all new renderers to registry
- Create: `packages/compiler/tests/renderers/callout.test.ts`
- Create: `packages/compiler/tests/renderers/table.test.ts`
- Create: `packages/compiler/tests/renderers/tabs.test.ts`

**Acceptance Criteria:**
- [ ] Callout renders with correct ARIA role and variant styling class
- [ ] Diagram renders Mermaid source in `<pre class="mermaid">` with `aria-label` from `description`
- [ ] Table renders with `<caption>`, `<th scope="col">`, and `aria-describedby` for summary
- [ ] Math renders using KaTeX `renderToString()` with `aria-label` from `spoken`
- [ ] Tabs renders with `role="tablist"`, `role="tab"`, `role="tabpanel"` ARIA structure
- [ ] Handwriting renders image with visually-hidden transcription `<p>`
- [ ] All tests pass

**Verify:** `cd packages/compiler && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests for callout, table, tabs**

```typescript
// packages/compiler/tests/renderers/callout.test.ts
import { describe, it, expect } from "vitest";
import { renderCallout } from "../../src/renderers/callout.js";

describe("renderCallout", () => {
  it("renders with variant class and ARIA role", () => {
    const html = renderCallout({
      id: "blk_001",
      type: "callout",
      variant: "warning",
      content: "Be careful!",
    });
    expect(html).toContain('role="note"');
    expect(html).toContain("vox-callout-warning");
    expect(html).toContain("Be careful!");
  });

  it("renders optional title", () => {
    const html = renderCallout({
      id: "blk_002",
      type: "callout",
      variant: "tip",
      title: "Pro tip",
      content: "Use shortcuts",
    });
    expect(html).toContain("Pro tip");
  });
});
```

```typescript
// packages/compiler/tests/renderers/table.test.ts
import { describe, it, expect } from "vitest";
import { renderTable } from "../../src/renderers/table.js";

describe("renderTable", () => {
  it("renders with caption and proper th scope", () => {
    const html = renderTable({
      id: "blk_001",
      type: "table",
      headers: ["Name", "Value"],
      rows: [["foo", "bar"]],
      caption: "Test table",
      summary: "A simple key-value table",
    });
    expect(html).toContain("<caption>Test table</caption>");
    expect(html).toContain('<th scope="col">');
    expect(html).toContain("foo");
    expect(html).toContain("bar");
  });

  it("includes summary for screen readers", () => {
    const html = renderTable({
      id: "blk_002",
      type: "table",
      headers: ["A"],
      rows: [["1"]],
      summary: "Summary text",
    });
    expect(html).toContain("Summary text");
  });
});
```

```typescript
// packages/compiler/tests/renderers/tabs.test.ts
import { describe, it, expect } from "vitest";
import { renderTabs } from "../../src/renderers/tabs.js";

describe("renderTabs", () => {
  it("renders with tablist ARIA structure", () => {
    const html = renderTabs({
      id: "blk_001",
      type: "tabs",
      panels: [
        { label: "JS", content: "console.log('hi')" },
        { label: "Python", content: "print('hi')" },
      ],
    });
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain("JS");
    expect(html).toContain("Python");
  });
});
```

- [ ] **Step 2: Implement callout renderer**

```typescript
// packages/compiler/src/renderers/callout.ts
import type { CalloutBlock } from "@vox/schema";
import { marked } from "marked";
import { escapeHtml } from "../utils.js";

const ICONS: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  danger: "🚨",
  tip: "💡",
  note: "📝",
};

export function renderCallout(
  block: CalloutBlock,
  variables?: Record<string, string>
): string {
  let content = block.content;
  if (variables) {
    content = content.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => variables[key] ?? `{{${key}}}`
    );
  }
  const html = marked.parseInline(content) as string;
  const icon = ICONS[block.variant] ?? "";
  const title = block.title
    ? `<div class="vox-callout-title">${icon} ${escapeHtml(block.title)}</div>`
    : `<div class="vox-callout-title">${icon} ${block.variant.charAt(0).toUpperCase() + block.variant.slice(1)}</div>`;
  return `<div id="${block.id}" class="vox-callout vox-callout-${block.variant}" role="note" aria-label="${block.variant}">
${title}
<div class="vox-callout-content">${html}</div>
</div>`;
}
```

- [ ] **Step 3: Implement diagram renderer (client-side Mermaid)**

```typescript
// packages/compiler/src/renderers/diagram.ts
import type { DiagramBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderDiagram(block: DiagramBlock): string {
  if (block.syntax === "mermaid") {
    return `<figure id="${block.id}" class="vox-diagram" aria-label="${escapeHtml(block.description)}">
<pre class="mermaid">${escapeHtml(block.content)}</pre>
<figcaption class="vox-sr-only">${escapeHtml(block.description)}</figcaption>
</figure>`;
  }
  // Graphviz and D2: render as code block with description, rendering TBD
  return `<figure id="${block.id}" class="vox-diagram" aria-label="${escapeHtml(block.description)}">
<pre><code class="language-${block.syntax}">${escapeHtml(block.content)}</code></pre>
<figcaption class="vox-sr-only">${escapeHtml(block.description)}</figcaption>
</figure>`;
}
```

- [ ] **Step 4: Implement table renderer with accessibility**

```typescript
// packages/compiler/src/renderers/table.ts
import type { TableBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderTable(
  block: TableBlock,
  variables?: Record<string, string>
): string {
  const resolve = (text: string) => {
    if (!variables) return escapeHtml(text);
    return escapeHtml(
      text.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => variables[key] ?? `{{${key}}}`
      )
    );
  };

  const summaryId = `${block.id}-summary`;
  const caption = block.caption
    ? `<caption>${resolve(block.caption)}</caption>`
    : "";
  const summary = `<p id="${summaryId}" class="vox-sr-only">${resolve(block.summary)}</p>`;

  const headerCells = block.headers
    .map((h) => `<th scope="col">${resolve(h)}</th>`)
    .join("");
  const thead = `<thead><tr>${headerCells}</tr></thead>`;

  const rows = block.rows
    .map((row) => {
      const cells = row.map((cell) => `<td>${resolve(cell)}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\n");
  const tbody = `<tbody>\n${rows}\n</tbody>`;

  return `${summary}
<div class="vox-table-wrapper" id="${block.id}">
<table aria-describedby="${summaryId}">
${caption}
${thead}
${tbody}
</table>
</div>`;
}
```

- [ ] **Step 5: Implement math renderer with KaTeX**

```typescript
// packages/compiler/src/renderers/math.ts
import type { MathBlock } from "@vox/schema";
import katex from "katex";
import { escapeHtml } from "../utils.js";

export function renderMath(block: MathBlock): string {
  const rendered = katex.renderToString(block.expression, {
    displayMode: block.display === "block",
    throwOnError: false,
  });
  const tag = block.display === "block" ? "div" : "span";
  return `<${tag} id="${block.id}" class="vox-math" role="math" aria-label="${escapeHtml(block.spoken)}">${rendered}</${tag}>`;
}
```

- [ ] **Step 6: Implement tabs renderer with ARIA**

```typescript
// packages/compiler/src/renderers/tabs.ts
import type { TabsBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";
import { renderBlock, type RenderContext } from "./index.js";

export function renderTabs(
  block: TabsBlock,
  ctx?: RenderContext
): string {
  const tabButtons = block.panels
    .map(
      (panel, i) =>
        `<button role="tab" id="${block.id}-tab-${i}" aria-controls="${block.id}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${escapeHtml(panel.label)}</button>`
    )
    .join("\n");

  const tabPanels = block.panels
    .map((panel, i) => {
      let content = "";
      if (panel.content) {
        content = escapeHtml(panel.content);
        if (panel.type === "code" && panel.language) {
          content = `<pre><code class="language-${panel.language}">${content}</code></pre>`;
        }
      } else if (panel.blocks && ctx) {
        content = panel.blocks.map((b) => renderBlock(b, ctx)).join("\n");
      }
      return `<div role="tabpanel" id="${block.id}-panel-${i}" aria-labelledby="${block.id}-tab-${i}" ${i === 0 ? "" : 'hidden="true"'}>${content}</div>`;
    })
    .join("\n");

  return `<div id="${block.id}" class="vox-tabs">
<div role="tablist" aria-label="Code examples">
${tabButtons}
</div>
${tabPanels}
</div>`;
}
```

- [ ] **Step 7: Implement accordion, steps, layout, handwriting, include, variable_def**

```typescript
// packages/compiler/src/renderers/accordion.ts
import type { AccordionBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";
import { renderBlock, type RenderContext } from "./index.js";

export function renderAccordion(
  block: AccordionBlock,
  ctx?: RenderContext
): string {
  const content = block.blocks && ctx
    ? block.blocks.map((b) => renderBlock(b, ctx)).join("\n")
    : "";
  return `<details id="${block.id}" class="vox-accordion"${block.default_open ? " open" : ""}>
<summary>${escapeHtml(block.title)}</summary>
<div class="vox-accordion-content">${content}</div>
</details>`;
}
```

```typescript
// packages/compiler/src/renderers/steps.ts
import type { StepsBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";
import { renderBlock, type RenderContext } from "./index.js";

export function renderSteps(
  block: StepsBlock,
  ctx?: RenderContext
): string {
  const items = block.steps
    .map((step, i) => {
      const content = step.blocks && ctx
        ? step.blocks.map((b) => renderBlock(b, ctx)).join("\n")
        : "";
      return `<li class="vox-step">
<div class="vox-step-number">${i + 1}</div>
<div class="vox-step-content">
<div class="vox-step-title">${escapeHtml(step.title)}</div>
${content}
</div>
</li>`;
    })
    .join("\n");
  return `<ol id="${block.id}" class="vox-steps" role="list">\n${items}\n</ol>`;
}
```

```typescript
// packages/compiler/src/renderers/layout.ts
import type { LayoutBlock } from "@vox/schema";
import { renderBlock, type RenderContext } from "./index.js";

export function renderLayout(
  block: LayoutBlock,
  ctx?: RenderContext
): string {
  const columns = (block.blocks ?? [])
    .map((col) => {
      const content = ctx
        ? col.map((b) => renderBlock(b, ctx)).join("\n")
        : "";
      return `<div class="vox-layout-column">${content}</div>`;
    })
    .join("\n");
  return `<div id="${block.id}" class="vox-layout vox-layout-${block.columns}col">\n${columns}\n</div>`;
}
```

```typescript
// packages/compiler/src/renderers/handwriting.ts
import type { HandwritingBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderHandwriting(block: HandwritingBlock): string {
  return `<figure id="${block.id}" class="vox-handwriting">
<img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.alt)}" loading="lazy" style="max-width:100%">
<p class="vox-sr-only">${escapeHtml(block.transcription.text)}</p>
</figure>`;
}
```

```typescript
// packages/compiler/src/renderers/include.ts
import type { IncludeBlock } from "@vox/schema";
import { escapeHtml } from "../utils.js";

export function renderInclude(block: IncludeBlock): string {
  // v1: render as a link. v2 will inline the referenced document.
  return `<div id="${block.id}" class="vox-include">
<a href="${escapeHtml(block.src)}" class="vox-include-link">📄 Included document: ${escapeHtml(block.src)}</a>
</div>`;
}
```

```typescript
// packages/compiler/src/renderers/variable-def.ts
import type { VariableDefBlock } from "@vox/schema";

export function renderVariableDef(_block: VariableDefBlock): string {
  // Variable definitions are resolved at compile time, not rendered visually
  return "";
}
```

- [ ] **Step 8: Update renderer registry**

Update `packages/compiler/src/renderers/index.ts` to import and register all new renderers in the `renderBlock` switch statement. Add cases for: `callout`, `diagram`, `table`, `math`, `tabs`, `accordion`, `steps`, `layout`, `handwriting`, `include`, `variable_def`, `xref`.

- [ ] **Step 9: Run tests and commit**

```bash
cd packages/compiler && pnpm test
git add packages/compiler/
git commit -m "feat(compiler): add enhanced block renderers (callout, diagram, table, math, tabs, accordion, steps, layout, handwriting)"
```

---

### Task 4: @vox/compiler — Document Assembly & CSS

**Goal:** Wire up the full compilation pipeline: variable resolution, accessibility validation, responsive CSS, HTML document shell, and the main `compile()` function.

**Files:**
- Create: `packages/compiler/src/variables.ts`
- Create: `packages/compiler/src/accessibility.ts`
- Create: `packages/compiler/src/styles.ts`
- Create: `packages/compiler/src/document-shell.ts`
- Create: `packages/compiler/src/compiler.ts`
- Modify: `packages/compiler/src/index.ts`
- Create: `packages/compiler/tests/compiler.test.ts`
- Create: `packages/compiler/tests/variables.test.ts`
- Create: `packages/compiler/tests/accessibility.test.ts`

**Acceptance Criteria:**
- [ ] `compile(doc)` returns a self-contained HTML string
- [ ] Variables in block content are resolved from `meta.variables`
- [ ] Compilation fails with descriptive errors if accessibility fields are missing (image.alt, diagram.description, table.summary)
- [ ] Generated CSS includes responsive breakpoints (640px column collapse, table scroll, etc.)
- [ ] HTML includes skip navigation link, semantic structure, Mermaid client-side script, and tab switching script
- [ ] All tests pass

**Verify:** `cd packages/compiler && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests**

```typescript
// packages/compiler/tests/variables.test.ts
import { describe, it, expect } from "vitest";
import { resolveVariables } from "../src/variables.js";

describe("resolveVariables", () => {
  it("replaces {{var}} in block content", () => {
    const result = resolveVariables("Use {{base_url}}/api", {
      base_url: "https://api.example.com",
    });
    expect(result).toBe("Use https://api.example.com/api");
  });

  it("leaves unknown variables as-is", () => {
    const result = resolveVariables("{{unknown}}", {});
    expect(result).toBe("{{unknown}}");
  });
});
```

```typescript
// packages/compiler/tests/accessibility.test.ts
import { describe, it, expect } from "vitest";
import { checkAccessibility } from "../src/accessibility.js";
import type { VoxBlock } from "@vox/schema";

describe("checkAccessibility", () => {
  it("passes for blocks with required fields", () => {
    const blocks: VoxBlock[] = [
      {
        id: "blk_001",
        type: "image",
        src: "img.png",
        alt: "A cat",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(true);
  });

  it("fails for image with empty alt", () => {
    const blocks: VoxBlock[] = [
      {
        id: "blk_001",
        type: "image",
        src: "img.png",
        alt: "",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("blk_001");
  });

  it("fails for diagram with empty description", () => {
    const blocks: VoxBlock[] = [
      {
        id: "blk_002",
        type: "diagram",
        syntax: "mermaid",
        content: "graph LR; A-->B",
        description: "",
      },
    ];
    const result = checkAccessibility(blocks);
    expect(result.valid).toBe(false);
  });
});
```

```typescript
// packages/compiler/tests/compiler.test.ts
import { describe, it, expect } from "vitest";
import { compile } from "../src/compiler.js";
import type { VoxDocument } from "@vox/schema";

function makeDoc(blocks: any[]): VoxDocument {
  return {
    $schema: "https://voxformat.dev/schema/v1.json",
    meta: {
      id: "test",
      title: "Test Doc",
      description: "A test",
      version: "1.0.0",
      authors: ["Tester"],
      tags: [],
      status: "approved" as const,
      created: "2026-04-12T00:00:00Z",
      updated: "2026-04-12T00:00:00Z",
      variables: { version: "2.0" },
      provenance: {
        generated_by: null,
        reviewed_by: null,
        approved_blocks: [],
        flagged_blocks: [],
      },
      accessibility: { language: "en", reading_level: "general" },
    },
    blocks,
  };
}

describe("compile", () => {
  it("produces valid HTML with doctype", () => {
    const doc = makeDoc([
      { id: "blk_001", type: "heading", level: 1, content: "Hello" },
      { id: "blk_002", type: "paragraph", content: "World" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello");
    expect(result.html).toContain("World");
  });

  it("resolves variables", () => {
    const doc = makeDoc([
      {
        id: "blk_001",
        type: "paragraph",
        content: "Version: {{version}}",
      },
    ]);
    const result = compile(doc);
    expect(result.html).toContain("Version: 2.0");
  });

  it("fails on missing accessibility fields", () => {
    const doc = makeDoc([
      { id: "blk_001", type: "image", src: "x.png", alt: "" },
    ]);
    const result = compile(doc);
    expect(result.success).toBe(false);
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("includes skip nav link", () => {
    const doc = makeDoc([
      { id: "blk_001", type: "heading", level: 1, content: "X" },
    ]);
    const result = compile(doc);
    expect(result.html).toContain("Skip to content");
  });

  it("includes responsive CSS", () => {
    const doc = makeDoc([
      { id: "blk_001", type: "heading", level: 1, content: "X" },
    ]);
    const result = compile(doc);
    expect(result.html).toContain("@media");
    expect(result.html).toContain("640px");
  });
});
```

- [ ] **Step 2: Implement variables, accessibility, styles, document-shell**

```typescript
// packages/compiler/src/variables.ts
export function resolveVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] ?? match
  );
}
```

```typescript
// packages/compiler/src/accessibility.ts
import type { VoxBlock } from "@vox/schema";

export interface AccessibilityResult {
  valid: boolean;
  errors: string[];
}

export function checkAccessibility(blocks: VoxBlock[]): AccessibilityResult {
  const errors: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "image":
        if (!block.alt || block.alt.trim() === "") {
          errors.push(
            `Block ${block.id}: image is missing required 'alt' text`
          );
        }
        break;
      case "diagram":
        if (!block.description || block.description.trim() === "") {
          errors.push(
            `Block ${block.id}: diagram is missing required 'description' for screen readers`
          );
        }
        break;
      case "table":
        if (!block.summary || block.summary.trim() === "") {
          errors.push(
            `Block ${block.id}: table is missing required 'summary' for screen readers`
          );
        }
        break;
      case "handwriting":
        if (
          block.transcription.status === "pending_review" &&
          block.transcription.confidence < 0.7
        ) {
          errors.push(
            `Block ${block.id}: handwriting transcription has low confidence (${block.transcription.confidence}) and must be verified before compilation`
          );
        }
        break;
      case "math":
        if (!block.spoken || block.spoken.trim() === "") {
          errors.push(
            `Block ${block.id}: math block is missing required 'spoken' text for screen readers`
          );
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}
```

```typescript
// packages/compiler/src/styles.ts
export function generateStyles(): string {
  return `
/* Vox Document Styles — Auto-generated, do not edit */
:root {
  --vox-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --vox-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  --vox-max-width: 48rem;
  --vox-text: #1a1a2e;
  --vox-bg: #ffffff;
  --vox-surface: #f8f9fa;
  --vox-border: #e5e7eb;
  --vox-accent: #6366f1;
}
@media (prefers-color-scheme: dark) {
  :root {
    --vox-text: #e0e0e0;
    --vox-bg: #111827;
    --vox-surface: #1f2937;
    --vox-border: #374151;
  }
}
*, *::before, *::after { box-sizing: border-box; }
body {
  font-family: var(--vox-font);
  color: var(--vox-text);
  background: var(--vox-bg);
  line-height: 1.7;
  margin: 0; padding: 0;
}
.vox-document {
  max-width: var(--vox-max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
h1, h2, h3, h4, h5, h6 { line-height: 1.3; margin-top: 2em; margin-bottom: 0.5em; }
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
p { margin: 0.75em 0; }
a { color: var(--vox-accent); }
code { font-family: var(--vox-mono); background: var(--vox-surface); padding: 0.15em 0.3em; border-radius: 3px; font-size: 0.9em; }
pre { background: var(--vox-surface); border: 1px solid var(--vox-border); border-radius: 6px; padding: 1em; overflow-x: auto; }
pre code { background: none; padding: 0; }
img { max-width: 100%; height: auto; border-radius: 4px; }
figure { margin: 1.5em 0; }
figcaption { font-size: 0.85em; color: #6b7280; margin-top: 0.5em; text-align: center; }

/* Callouts */
.vox-callout { border-left: 4px solid var(--vox-border); padding: 0.75em 1em; margin: 1em 0; border-radius: 0 6px 6px 0; background: var(--vox-surface); }
.vox-callout-info { border-color: #3b82f6; }
.vox-callout-warning { border-color: #eab308; }
.vox-callout-danger { border-color: #ef4444; }
.vox-callout-tip { border-color: #10b981; }
.vox-callout-note { border-color: #8b5cf6; }
.vox-callout-title { font-weight: 600; margin-bottom: 0.25em; }

/* Tables */
.vox-table-wrapper { overflow-x: auto; margin: 1em 0; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid var(--vox-border); padding: 0.5em 0.75em; text-align: left; }
th { background: var(--vox-surface); font-weight: 600; }

/* Tabs */
.vox-tabs [role="tablist"] { display: flex; border-bottom: 2px solid var(--vox-border); gap: 0; }
.vox-tabs [role="tab"] { padding: 0.5em 1em; border: none; background: none; cursor: pointer; font-size: 0.9em; border-bottom: 2px solid transparent; margin-bottom: -2px; color: var(--vox-text); }
.vox-tabs [role="tab"][aria-selected="true"] { border-bottom-color: var(--vox-accent); color: var(--vox-accent); font-weight: 600; }
.vox-tabs [role="tabpanel"] { padding: 1em 0; }

/* Layout */
.vox-layout { display: grid; gap: 1.5rem; }
.vox-layout-2col { grid-template-columns: 1fr 1fr; }
.vox-layout-3col { grid-template-columns: 1fr 1fr 1fr; }

/* Steps */
.vox-steps { list-style: none; padding: 0; counter-reset: none; }
.vox-step { display: flex; gap: 1em; margin-bottom: 1.5em; }
.vox-step-number { width: 2em; height: 2em; background: var(--vox-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.vox-step-title { font-weight: 600; margin-bottom: 0.25em; }

/* Accordion */
.vox-accordion { border: 1px solid var(--vox-border); border-radius: 6px; margin: 1em 0; }
.vox-accordion summary { padding: 0.75em 1em; cursor: pointer; font-weight: 600; }
.vox-accordion-content { padding: 0 1em 1em; }

/* Code filename */
.vox-code-filename { font-family: var(--vox-mono); font-size: 0.8em; padding: 0.3em 1em; background: var(--vox-border); border-radius: 6px 6px 0 0; color: #6b7280; }

/* TOC */
.vox-toc { background: var(--vox-surface); border: 1px solid var(--vox-border); border-radius: 6px; padding: 1em 1.5em; margin: 1.5em 0; }
.vox-toc ol { padding-left: 1.5em; }

/* Skip nav */
.vox-skip-link { position: absolute; top: -100px; left: 0; padding: 0.5em 1em; background: var(--vox-accent); color: #fff; z-index: 1000; text-decoration: none; }
.vox-skip-link:focus { top: 0; }

/* Screen reader only */
.vox-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* Responsive */
@media (max-width: 640px) {
  .vox-layout-2col, .vox-layout-3col { grid-template-columns: 1fr; }
  .vox-tabs [role="tablist"] { flex-wrap: wrap; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
}
@media (max-width: 400px) {
  .vox-document { padding: 1rem; }
}
`.trim();
}
```

```typescript
// packages/compiler/src/document-shell.ts
import { escapeHtml } from "./utils.js";
import { generateStyles } from "./styles.js";

interface ShellOptions {
  title: string;
  language: string;
  bodyHtml: string;
}

export function wrapInDocument(options: ShellOptions): string {
  const styles = generateStyles();
  return `<!DOCTYPE html>
<html lang="${options.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(options.title)}</title>
<style>${styles}</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
</head>
<body>
<a href="#vox-main" class="vox-skip-link">Skip to content</a>
<main id="vox-main" class="vox-document">
${options.bodyHtml}
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
```

- [ ] **Step 3: Implement main compile function**

```typescript
// packages/compiler/src/compiler.ts
import type { VoxDocument } from "@vox/schema";
import { renderBlock, type RenderContext } from "./renderers/index.js";
import { checkAccessibility } from "./accessibility.js";
import { wrapInDocument } from "./document-shell.js";

export interface CompileResult {
  success: boolean;
  html?: string;
  errors?: string[];
}

export function compile(doc: VoxDocument): CompileResult {
  // 1. Accessibility check
  const a11y = checkAccessibility(doc.blocks);
  if (!a11y.valid) {
    return { success: false, errors: a11y.errors };
  }

  // 2. Collect variables (meta.variables + inline variable_def blocks)
  const variables = { ...doc.meta.variables };
  for (const block of doc.blocks) {
    if (block.type === "variable_def") {
      variables[block.key] = block.value;
    }
  }

  // 3. Render all blocks
  const ctx: RenderContext = {
    variables,
    allBlocks: doc.blocks,
  };
  const bodyHtml = doc.blocks
    .map((block) => renderBlock(block, ctx))
    .filter(Boolean)
    .join("\n");

  // 4. Wrap in document shell
  const html = wrapInDocument({
    title: doc.meta.title,
    language: doc.meta.accessibility.language,
    bodyHtml,
  });

  return { success: true, html };
}
```

- [ ] **Step 4: Wire up public API**

```typescript
// packages/compiler/src/index.ts
export { compile, type CompileResult } from "./compiler.js";
export { checkAccessibility, type AccessibilityResult } from "./accessibility.js";
export { resolveVariables } from "./variables.js";
export { renderBlock, type RenderContext } from "./renderers/index.js";
```

- [ ] **Step 5: Run tests and commit**

```bash
cd packages/compiler && pnpm test
git add packages/compiler/
git commit -m "feat(compiler): add document assembly, accessibility checks, responsive CSS, and compile()"
```

---

### Task 5: @vox/cli — Core Commands

**Goal:** Implement the `vox` CLI with `init`, `validate`, `compile`, `info`, and `blocks` commands.

**Files:**
- Create: `packages/cli/src/cli.ts`
- Create: `packages/cli/src/commands/init.ts`
- Create: `packages/cli/src/commands/validate.ts`
- Create: `packages/cli/src/commands/compile.ts`
- Create: `packages/cli/src/commands/info.ts`
- Create: `packages/cli/src/commands/blocks.ts`
- Modify: `packages/cli/src/index.ts`
- Create: `packages/cli/tests/init.test.ts`
- Create: `packages/cli/tests/compile.test.ts`

**Acceptance Criteria:**
- [ ] `vox init output.json` creates a valid Vox document with correct structure
- [ ] `vox validate file.json` reports schema and accessibility errors
- [ ] `vox compile file.json --format html` produces a self-contained HTML file
- [ ] `vox info file.json` prints title, status, block count, version
- [ ] `vox blocks file.json` lists blocks as a table
- [ ] All tests pass

**Verify:** `cd packages/cli && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests**

```typescript
// packages/cli/tests/init.test.ts
import { describe, it, expect } from "vitest";
import { createDocument } from "../src/commands/init.js";
import { validateDocument } from "@vox/schema";

describe("createDocument", () => {
  it("creates a valid Vox document", () => {
    const doc = createDocument({ title: "Test" });
    const result = validateDocument(doc);
    expect(result.valid).toBe(true);
  });

  it("uses provided title", () => {
    const doc = createDocument({ title: "My API Docs" });
    expect(doc.meta.title).toBe("My API Docs");
  });
});
```

```typescript
// packages/cli/tests/compile.test.ts
import { describe, it, expect } from "vitest";
import { createDocument } from "../src/commands/init.js";
import { compile } from "@vox/compiler";

describe("compile integration", () => {
  it("compiles an init'd document to HTML", () => {
    const doc = createDocument({ title: "Test" });
    doc.blocks.push({
      id: "blk_001",
      type: "heading",
      level: 1,
      content: "Hello World",
    });
    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toContain("Hello World");
  });
});
```

- [ ] **Step 2: Implement init command**

```typescript
// packages/cli/src/commands/init.ts
import { generateBlockId, type VoxDocument } from "@vox/schema";
import { randomUUID } from "node:crypto";
import fs from "node:fs";

interface InitOptions {
  title?: string;
}

export function createDocument(options: InitOptions = {}): VoxDocument {
  const now = new Date().toISOString();
  return {
    $schema: "https://voxformat.dev/schema/v1.json",
    meta: {
      id: randomUUID(),
      title: options.title ?? "Untitled Document",
      description: "",
      version: "1.0.0",
      authors: [],
      tags: [],
      status: "draft",
      created: now,
      updated: now,
      variables: {},
      provenance: {
        generated_by: null,
        reviewed_by: null,
        approved_blocks: [],
        flagged_blocks: [],
      },
      accessibility: {
        language: "en",
        reading_level: "technical",
      },
    },
    blocks: [],
  };
}

export function initCommand(outputPath: string, options: InitOptions): void {
  const doc = createDocument(options);
  fs.writeFileSync(outputPath, JSON.stringify(doc, null, 2), "utf-8");
  console.log(`Created ${outputPath}`);
}
```

- [ ] **Step 3: Implement validate, compile, info, blocks commands**

```typescript
// packages/cli/src/commands/validate.ts
import fs from "node:fs";
import { validateDocument } from "@vox/schema";
import { checkAccessibility } from "@vox/compiler";

export function validateCommand(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc = JSON.parse(raw);

  const schemaResult = validateDocument(doc);
  if (!schemaResult.valid) {
    console.error("Schema validation failed:");
    for (const err of schemaResult.errors!) {
      console.error(`  ${err.path}: ${err.message}`);
    }
    process.exit(1);
  }

  const a11y = checkAccessibility(doc.blocks);
  if (!a11y.valid) {
    console.error("Accessibility validation failed:");
    for (const err of a11y.errors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("Valid ✓");
}
```

```typescript
// packages/cli/src/commands/compile.ts
import fs from "node:fs";
import path from "node:path";
import { compile } from "@vox/compiler";
import type { VoxDocument } from "@vox/schema";

interface CompileOptions {
  format: "html" | "pdf";
  out?: string;
}

export function compileCommand(
  filePath: string,
  options: CompileOptions
): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc: VoxDocument = JSON.parse(raw);

  if (options.format === "pdf") {
    console.error("PDF export not yet implemented. Use --format html");
    process.exit(1);
  }

  const result = compile(doc);
  if (!result.success) {
    console.error("Compilation failed:");
    for (const err of result.errors!) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  const outPath =
    options.out ??
    filePath.replace(/\.json$/, ".html").replace(/\.vox$/, ".html");
  fs.writeFileSync(outPath, result.html!, "utf-8");
  console.log(`Compiled to ${outPath}`);
}
```

```typescript
// packages/cli/src/commands/info.ts
import fs from "node:fs";
import type { VoxDocument } from "@vox/schema";

export function infoCommand(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc: VoxDocument = JSON.parse(raw);
  console.log(`Title:    ${doc.meta.title}`);
  console.log(`Version:  ${doc.meta.version}`);
  console.log(`Status:   ${doc.meta.status}`);
  console.log(`Blocks:   ${doc.blocks.length}`);
  console.log(`Authors:  ${doc.meta.authors.join(", ") || "(none)"}`);
  console.log(`Language: ${doc.meta.accessibility.language}`);
}
```

```typescript
// packages/cli/src/commands/blocks.ts
import fs from "node:fs";
import type { VoxDocument, VoxBlock } from "@vox/schema";

function preview(block: VoxBlock): string {
  if ("content" in block && typeof block.content === "string") {
    return block.content.slice(0, 40) + (block.content.length > 40 ? "..." : "");
  }
  return "";
}

function reviewStatus(block: VoxBlock): string {
  if (block.review) {
    return `${block.review.status} (${block.review.confidence.toFixed(2)})`;
  }
  return "-";
}

export function blocksCommand(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc: VoxDocument = JSON.parse(raw);
  console.log("ID           | Type        | Review          | Content");
  console.log("-------------|-------------|-----------------|--------");
  for (const block of doc.blocks) {
    const id = block.id.padEnd(12);
    const type = block.type.padEnd(11);
    const review = reviewStatus(block).padEnd(15);
    console.log(`${id} | ${type} | ${review} | ${preview(block)}`);
  }
}
```

- [ ] **Step 4: Wire up CLI with Commander**

```typescript
// packages/cli/src/cli.ts
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { compileCommand } from "./commands/compile.js";
import { infoCommand } from "./commands/info.js";
import { blocksCommand } from "./commands/blocks.js";

export function createCli(): Command {
  const program = new Command();

  program
    .name("vox")
    .description("Vox — Documents with a voice")
    .version("0.1.0");

  program
    .command("init <output>")
    .description("Create a new Vox document")
    .option("-t, --title <title>", "Document title", "Untitled Document")
    .action((output, opts) => initCommand(output, { title: opts.title }));

  program
    .command("validate <file>")
    .description("Validate a Vox document against schema and accessibility rules")
    .action((file) => validateCommand(file));

  program
    .command("compile <file>")
    .description("Compile a Vox document to HTML or PDF")
    .option("-f, --format <format>", "Output format (html|pdf)", "html")
    .option("-o, --out <path>", "Output file path")
    .action((file, opts) =>
      compileCommand(file, { format: opts.format, out: opts.out })
    );

  program
    .command("info <file>")
    .description("Display document metadata")
    .action((file) => infoCommand(file));

  program
    .command("blocks <file>")
    .description("List all blocks in a document")
    .action((file) => blocksCommand(file));

  return program;
}
```

```typescript
// packages/cli/src/index.ts
#!/usr/bin/env node
import { createCli } from "./cli.js";

const program = createCli();
program.parse();
```

- [ ] **Step 5: Run tests and commit**

```bash
cd packages/cli && pnpm test
git add packages/cli/
git commit -m "feat(cli): add vox init, validate, compile, info, blocks commands"
```

---

### Task 6: @vox/mcp — Document Store & Server Foundation

**Goal:** Implement the MCP server with document store (file I/O + in-memory state) and all read/write tools.

**Files:**
- Create: `packages/mcp/src/document-store.ts`
- Create: `packages/mcp/src/server.ts`
- Create: `packages/mcp/src/tools/document-reads.ts`
- Create: `packages/mcp/src/tools/document-writes.ts`
- Modify: `packages/mcp/src/index.ts`
- Create: `packages/mcp/tests/document-store.test.ts`
- Create: `packages/mcp/tests/document-reads.test.ts`
- Create: `packages/mcp/tests/document-writes.test.ts`

**Acceptance Criteria:**
- [ ] DocumentStore loads a .vox file, provides block CRUD, persists to disk
- [ ] `get_document`, `list_blocks`, `get_block`, `search_blocks` tools return correct data
- [ ] `add_block`, `edit_block`, `delete_block`, `move_block` tools modify document correctly
- [ ] `set_metadata` and `set_variable` tools update meta
- [ ] MCP server starts and registers all tools
- [ ] All tests pass

**Verify:** `cd packages/mcp && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests for DocumentStore**

```typescript
// packages/mcp/tests/document-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("DocumentStore", () => {
  let store: DocumentStore;

  beforeEach(() => {
    store = DocumentStore.createEmpty("Test Doc");
  });

  it("creates an empty document", () => {
    const doc = store.getDocument();
    expect(doc.meta.title).toBe("Test Doc");
    expect(doc.blocks).toHaveLength(0);
  });

  it("adds a block", () => {
    const id = store.addBlock({ type: "heading", level: 1, content: "Hi" });
    expect(id).toMatch(/^blk_/);
    expect(store.getDocument().blocks).toHaveLength(1);
  });

  it("edits a block", () => {
    const id = store.addBlock({
      type: "paragraph",
      content: "Old text",
    });
    store.editBlock(id, { content: "New text" });
    const block = store.getBlock(id);
    expect((block as any).content).toBe("New text");
  });

  it("deletes a block", () => {
    const id = store.addBlock({
      type: "paragraph",
      content: "Delete me",
    });
    store.deleteBlock(id);
    expect(store.getDocument().blocks).toHaveLength(0);
  });

  it("moves a block", () => {
    const id1 = store.addBlock({
      type: "heading",
      level: 1,
      content: "First",
    });
    const id2 = store.addBlock({
      type: "paragraph",
      content: "Second",
    });
    store.moveBlock(id1, id2); // move id1 after id2
    const blocks = store.getDocument().blocks;
    expect(blocks[0].id).toBe(id2);
    expect(blocks[1].id).toBe(id1);
  });

  it("searches blocks", () => {
    store.addBlock({ type: "paragraph", content: "Hello world" });
    store.addBlock({ type: "paragraph", content: "Goodbye world" });
    const results = store.searchBlocks("Hello");
    expect(results).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Implement DocumentStore**

```typescript
// packages/mcp/src/document-store.ts
import {
  generateBlockId,
  validateDocument,
  type VoxDocument,
  type VoxBlock,
  type ReviewComment,
} from "@vox/schema";
import { randomUUID } from "node:crypto";
import fs from "node:fs";

export class DocumentStore {
  private doc: VoxDocument;
  private filePath: string | null;
  private comments: ReviewComment[] = [];

  private constructor(doc: VoxDocument, filePath: string | null) {
    this.doc = doc;
    this.filePath = filePath;
  }

  static createEmpty(title: string): DocumentStore {
    const now = new Date().toISOString();
    const doc: VoxDocument = {
      $schema: "https://voxformat.dev/schema/v1.json",
      meta: {
        id: randomUUID(),
        title,
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: now,
        updated: now,
        variables: {},
        provenance: {
          generated_by: null,
          reviewed_by: null,
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: { language: "en", reading_level: "technical" },
      },
      blocks: [],
    };
    return new DocumentStore(doc, null);
  }

  static fromFile(filePath: string): DocumentStore {
    const raw = fs.readFileSync(filePath, "utf-8");
    const doc: VoxDocument = JSON.parse(raw);
    return new DocumentStore(doc, filePath);
  }

  save(): void {
    if (this.filePath) {
      this.doc.meta.updated = new Date().toISOString();
      this.doc.comments = this.comments.length > 0 ? this.comments : undefined;
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.doc, null, 2),
        "utf-8"
      );
    }
  }

  getDocument(): VoxDocument {
    return this.doc;
  }

  getBlock(id: string): VoxBlock | undefined {
    return this.doc.blocks.find((b) => b.id === id);
  }

  listBlocks(): Array<{
    id: string;
    type: string;
    preview: string;
    review_status: string;
  }> {
    return this.doc.blocks.map((b) => ({
      id: b.id,
      type: b.type,
      preview:
        "content" in b && typeof b.content === "string"
          ? b.content.slice(0, 60)
          : "",
      review_status: b.review?.status ?? "none",
    }));
  }

  addBlock(
    blockData: Omit<VoxBlock, "id"> & { id?: string },
    afterId?: string
  ): string {
    const id = blockData.id ?? generateBlockId();
    const block = { ...blockData, id } as VoxBlock;

    if (afterId) {
      const index = this.doc.blocks.findIndex((b) => b.id === afterId);
      if (index !== -1) {
        this.doc.blocks.splice(index + 1, 0, block);
      } else {
        this.doc.blocks.push(block);
      }
    } else {
      this.doc.blocks.push(block);
    }

    this.save();
    return id;
  }

  editBlock(id: string, updates: Partial<VoxBlock>): void {
    const index = this.doc.blocks.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Block ${id} not found`);
    this.doc.blocks[index] = {
      ...this.doc.blocks[index],
      ...updates,
      id,
    } as VoxBlock;
    this.save();
  }

  deleteBlock(id: string): void {
    this.doc.blocks = this.doc.blocks.filter((b) => b.id !== id);
    this.save();
  }

  moveBlock(id: string, afterId?: string): void {
    const blockIndex = this.doc.blocks.findIndex((b) => b.id === id);
    if (blockIndex === -1) throw new Error(`Block ${id} not found`);
    const [block] = this.doc.blocks.splice(blockIndex, 1);

    if (afterId) {
      const afterIndex = this.doc.blocks.findIndex((b) => b.id === afterId);
      if (afterIndex !== -1) {
        this.doc.blocks.splice(afterIndex + 1, 0, block);
      } else {
        this.doc.blocks.push(block);
      }
    } else {
      this.doc.blocks.unshift(block);
    }
    this.save();
  }

  setMetadata(key: string, value: unknown): void {
    (this.doc.meta as any)[key] = value;
    this.save();
  }

  setVariable(key: string, value: string): void {
    this.doc.meta.variables[key] = value;
    this.save();
  }

  searchBlocks(query: string): VoxBlock[] {
    const lower = query.toLowerCase();
    return this.doc.blocks.filter((b) => {
      if ("content" in b && typeof b.content === "string") {
        return b.content.toLowerCase().includes(lower);
      }
      return false;
    });
  }

  // --- Review ---
  addComment(blockId: string, comment: string): string {
    const id = `cmt_${randomUUID().slice(0, 8)}`;
    this.comments.push({
      id,
      block_id: blockId,
      comment,
      created: new Date().toISOString(),
      resolved: false,
    });
    this.save();
    return id;
  }

  listComments(): ReviewComment[] {
    return this.comments.filter((c) => !c.resolved);
  }

  resolveComment(commentId: string): void {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) comment.resolved = true;
    this.save();
  }

  setBlockStatus(
    id: string,
    status: "pre_approved" | "pending" | "flagged" | "approved"
  ): void {
    const block = this.getBlock(id);
    if (!block) throw new Error(`Block ${id} not found`);
    if (!block.review) {
      block.review = { confidence: 0, reason: null, status };
    } else {
      block.review.status = status;
    }
    this.save();
  }

  setStatus(status: "draft" | "pending_review" | "approved" | "published"): void {
    this.doc.meta.status = status;
    this.save();
  }
}
```

- [ ] **Step 3: Implement MCP server with tools**

```typescript
// packages/mcp/src/tools/document-reads.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";
import { voxDocumentSchema } from "@vox/schema";

export function registerReadTools(
  server: McpServer,
  getStore: () => DocumentStore
): void {
  server.tool("get_document", "Get the full Vox document JSON", {}, async () => {
    const doc = getStore().getDocument();
    return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
  });

  server.tool(
    "list_blocks",
    "List all blocks with id, type, preview, and review status",
    {},
    async () => {
      const blocks = getStore().listBlocks();
      return {
        content: [{ type: "text", text: JSON.stringify(blocks, null, 2) }],
      };
    }
  );

  server.tool(
    "get_block",
    "Get a single block by ID",
    { id: z.string().describe("Block ID") },
    async ({ id }) => {
      const block = getStore().getBlock(id);
      if (!block) {
        return { content: [{ type: "text", text: `Block ${id} not found` }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(block, null, 2) }] };
    }
  );

  server.tool(
    "get_schema",
    "Get the full Vox JSONSchema for reference",
    {},
    async () => {
      return {
        content: [
          { type: "text", text: JSON.stringify(voxDocumentSchema, null, 2) },
        ],
      };
    }
  );

  server.tool(
    "search_blocks",
    "Search block content for a query string",
    { query: z.string().describe("Search query") },
    async ({ query }) => {
      const results = getStore().searchBlocks(query);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );
}
```

```typescript
// packages/mcp/src/tools/document-writes.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerWriteTools(
  server: McpServer,
  getStore: () => DocumentStore
): void {
  server.tool(
    "add_block",
    "Add a new block to the document",
    {
      type: z.string().describe("Block type (heading, paragraph, callout, etc.)"),
      content: z.record(z.unknown()).describe("Block content fields"),
      after: z.string().optional().describe("Insert after this block ID"),
    },
    async ({ type, content, after }) => {
      const blockData = { type, ...content } as any;
      const id = getStore().addBlock(blockData, after);
      return { content: [{ type: "text", text: JSON.stringify({ id }) }] };
    }
  );

  server.tool(
    "edit_block",
    "Edit an existing block's content",
    {
      id: z.string().describe("Block ID to edit"),
      content: z.record(z.unknown()).describe("Fields to update"),
    },
    async ({ id, content }) => {
      getStore().editBlock(id, content as any);
      return { content: [{ type: "text", text: `Block ${id} updated` }] };
    }
  );

  server.tool(
    "delete_block",
    "Remove a block from the document",
    { id: z.string().describe("Block ID to delete") },
    async ({ id }) => {
      getStore().deleteBlock(id);
      return { content: [{ type: "text", text: `Block ${id} deleted` }] };
    }
  );

  server.tool(
    "move_block",
    "Move a block to a new position",
    {
      id: z.string().describe("Block ID to move"),
      after: z.string().optional().describe("Place after this block ID (omit for start)"),
    },
    async ({ id, after }) => {
      getStore().moveBlock(id, after);
      return { content: [{ type: "text", text: `Block ${id} moved` }] };
    }
  );

  server.tool(
    "set_metadata",
    "Update a document metadata field",
    {
      key: z.string().describe("Metadata key (title, version, tags, etc.)"),
      value: z.unknown().describe("New value"),
    },
    async ({ key, value }) => {
      getStore().setMetadata(key, value);
      return { content: [{ type: "text", text: `Metadata '${key}' updated` }] };
    }
  );

  server.tool(
    "set_variable",
    "Set or update a document variable",
    {
      key: z.string().describe("Variable name"),
      value: z.string().describe("Variable value"),
    },
    async ({ key, value }) => {
      getStore().setVariable(key, value);
      return { content: [{ type: "text", text: `Variable '${key}' set to '${value}'` }] };
    }
  );
}
```

- [ ] **Step 4: Create MCP server entry point**

```typescript
// packages/mcp/src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DocumentStore } from "./document-store.js";
import { registerReadTools } from "./tools/document-reads.js";
import { registerWriteTools } from "./tools/document-writes.js";

export function createVoxMcpServer(filePath: string): McpServer {
  const store = DocumentStore.fromFile(filePath);
  const getStore = () => store;

  const server = new McpServer({
    name: "vox-document",
    version: "0.1.0",
  });

  registerReadTools(server, getStore);
  registerWriteTools(server, getStore);

  return server;
}

export async function startServer(filePath: string): Promise<void> {
  const server = createVoxMcpServer(filePath);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Vox MCP server running for: ${filePath}`);
}
```

```typescript
// packages/mcp/src/index.ts
export { createVoxMcpServer, startServer } from "./server.js";
export { DocumentStore } from "./document-store.js";
```

- [ ] **Step 5: Run tests and commit**

```bash
cd packages/mcp && pnpm test
git add packages/mcp/
git commit -m "feat(mcp): add document store, read/write MCP tools, server foundation"
```

---

### Task 7: @vox/mcp — Review & Accessibility Tools

**Goal:** Add review workflow tools (self_review, comments, status) and accessibility tools to the MCP server.

**Files:**
- Create: `packages/mcp/src/tools/review.ts`
- Create: `packages/mcp/src/tools/accessibility.ts`
- Create: `packages/mcp/src/tools/output.ts`
- Modify: `packages/mcp/src/server.ts` — register new tools
- Create: `packages/mcp/tests/review.test.ts`

**Acceptance Criteria:**
- [ ] `add_comment`, `list_comments`, `resolve_comment` tools work correctly
- [ ] `set_block_status` and `set_status` tools update review state
- [ ] `get_accessibility_report` lists blocks with missing required fields
- [ ] `validate` and `compile` tools work via MCP
- [ ] All tests pass

**Verify:** `cd packages/mcp && pnpm test` → all tests pass

**Steps:**

- [ ] **Step 1: Write failing tests for review tools**

```typescript
// packages/mcp/tests/review.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { DocumentStore } from "../src/document-store.js";

describe("Review workflow", () => {
  let store: DocumentStore;

  beforeEach(() => {
    store = DocumentStore.createEmpty("Test");
  });

  it("adds and lists comments", () => {
    const blockId = store.addBlock({ type: "paragraph", content: "Text" });
    const commentId = store.addComment(blockId, "Fix this");
    const comments = store.listComments();
    expect(comments).toHaveLength(1);
    expect(comments[0].comment).toBe("Fix this");
    expect(comments[0].block_id).toBe(blockId);
  });

  it("resolves a comment", () => {
    const blockId = store.addBlock({ type: "paragraph", content: "Text" });
    const commentId = store.addComment(blockId, "Fix this");
    store.resolveComment(commentId);
    expect(store.listComments()).toHaveLength(0);
  });

  it("sets block review status", () => {
    const blockId = store.addBlock({ type: "paragraph", content: "Text" });
    store.setBlockStatus(blockId, "approved");
    const block = store.getBlock(blockId);
    expect(block?.review?.status).toBe("approved");
  });

  it("sets document status", () => {
    store.setStatus("pending_review");
    expect(store.getDocument().meta.status).toBe("pending_review");
  });
});
```

- [ ] **Step 2: Implement review, accessibility, and output MCP tools**

```typescript
// packages/mcp/src/tools/review.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";

export function registerReviewTools(
  server: McpServer,
  getStore: () => DocumentStore
): void {
  server.tool(
    "add_comment",
    "Add a review comment on a block",
    {
      block_id: z.string().describe("Block ID to comment on"),
      comment: z.string().describe("Comment text / instruction for AI"),
    },
    async ({ block_id, comment }) => {
      const id = getStore().addComment(block_id, comment);
      return { content: [{ type: "text", text: JSON.stringify({ comment_id: id }) }] };
    }
  );

  server.tool("list_comments", "Get all pending (unresolved) comments", {}, async () => {
    const comments = getStore().listComments();
    return { content: [{ type: "text", text: JSON.stringify(comments, null, 2) }] };
  });

  server.tool(
    "resolve_comment",
    "Mark a comment as resolved after addressing it",
    { comment_id: z.string().describe("Comment ID to resolve") },
    async ({ comment_id }) => {
      getStore().resolveComment(comment_id);
      return { content: [{ type: "text", text: `Comment ${comment_id} resolved` }] };
    }
  );

  server.tool(
    "set_block_status",
    "Set the review status of a block",
    {
      id: z.string().describe("Block ID"),
      status: z
        .enum(["pre_approved", "pending", "flagged", "approved"])
        .describe("New review status"),
    },
    async ({ id, status }) => {
      getStore().setBlockStatus(id, status);
      return { content: [{ type: "text", text: `Block ${id} set to ${status}` }] };
    }
  );

  server.tool(
    "set_status",
    "Set the document-level status",
    {
      status: z
        .enum(["draft", "pending_review", "approved", "published"])
        .describe("New document status"),
    },
    async ({ status }) => {
      getStore().setStatus(status);
      return { content: [{ type: "text", text: `Document status set to ${status}` }] };
    }
  );
}
```

```typescript
// packages/mcp/src/tools/accessibility.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";
import { checkAccessibility } from "@vox/compiler";

export function registerAccessibilityTools(
  server: McpServer,
  getStore: () => DocumentStore
): void {
  server.tool(
    "set_description",
    "Set the screen reader description on a visual block",
    {
      block_id: z.string().describe("Block ID"),
      text: z.string().describe("Description text for screen readers"),
    },
    async ({ block_id, text }) => {
      getStore().editBlock(block_id, { description: text } as any);
      return { content: [{ type: "text", text: `Description set on ${block_id}` }] };
    }
  );

  server.tool(
    "set_transcription",
    "Update the handwriting transcription for a block",
    {
      block_id: z.string().describe("Handwriting block ID"),
      text: z.string().describe("Transcription text"),
    },
    async ({ block_id, text }) => {
      const block = getStore().getBlock(block_id);
      if (!block || block.type !== "handwriting") {
        return {
          content: [{ type: "text", text: `Block ${block_id} is not a handwriting block` }],
          isError: true,
        };
      }
      getStore().editBlock(block_id, {
        transcription: { ...block.transcription, text, status: "verified" },
      } as any);
      return { content: [{ type: "text", text: `Transcription updated on ${block_id}` }] };
    }
  );

  server.tool(
    "get_accessibility_report",
    "Get a report of blocks missing required accessibility fields",
    {},
    async () => {
      const doc = getStore().getDocument();
      const report = checkAccessibility(doc.blocks);
      return {
        content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      };
    }
  );
}
```

```typescript
// packages/mcp/src/tools/output.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentStore } from "../document-store.js";
import { validateDocument } from "@vox/schema";
import { compile } from "@vox/compiler";

export function registerOutputTools(
  server: McpServer,
  getStore: () => DocumentStore
): void {
  server.tool(
    "validate",
    "Validate the document against schema and accessibility rules",
    {},
    async () => {
      const doc = getStore().getDocument();
      const result = validateDocument(doc);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "compile",
    "Compile the document to HTML",
    {
      format: z.enum(["html"]).describe("Output format"),
    },
    async ({ format }) => {
      const doc = getStore().getDocument();
      const result = compile(doc);
      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: `Compilation failed:\n${result.errors!.join("\n")}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          { type: "text", text: `Compilation successful. HTML length: ${result.html!.length} chars` },
        ],
      };
    }
  );
}
```

- [ ] **Step 3: Register all tools in server.ts**

Update `packages/mcp/src/server.ts` to import and call `registerReviewTools`, `registerAccessibilityTools`, and `registerOutputTools` alongside the existing read/write registrations.

- [ ] **Step 4: Run tests and commit**

```bash
cd packages/mcp && pnpm test
git add packages/mcp/
git commit -m "feat(mcp): add review workflow, accessibility, and output MCP tools"
```

---

### Task 8: @vox/viewer — Block Components & Review UI

**Goal:** Build the Next.js viewer/reviewer app with React block rendering components and the review interface.

**Files:**
- Create: `packages/viewer/next.config.ts`
- Create: `packages/viewer/tailwind.config.ts`
- Create: `packages/viewer/src/app/layout.tsx`
- Create: `packages/viewer/src/app/page.tsx`
- Create: `packages/viewer/src/components/blocks/BlockRenderer.tsx`
- Create: `packages/viewer/src/components/blocks/Heading.tsx` (and all block components)
- Create: `packages/viewer/src/components/review/ReviewSidebar.tsx`
- Create: `packages/viewer/src/components/review/BlockReviewControls.tsx`
- Create: `packages/viewer/src/components/review/CommentThread.tsx`
- Create: `packages/viewer/src/components/layout/Shell.tsx`
- Create: `packages/viewer/src/components/layout/TopBar.tsx`
- Create: `packages/viewer/src/store/document.ts`
- Create: `packages/viewer/src/lib/api.ts`

**Acceptance Criteria:**
- [ ] BlockRenderer dispatches to correct component based on block type
- [ ] All block types render with proper semantic HTML and ARIA attributes
- [ ] ReviewSidebar shows approved/pending/flagged counts with progress bar
- [ ] BlockReviewControls show approve/flag buttons on pending/flagged blocks
- [ ] CommentThread shows comments and input for new instructions
- [ ] Default view shows only flagged + pending blocks
- [ ] Full document view toggle works
- [ ] Dark mode follows system preference

**Verify:** `cd packages/viewer && pnpm dev` → opens in browser, renders a test document

**Steps:**

- [ ] **Step 1: Scaffold Next.js app with Tailwind**

```bash
cd packages/viewer
pnpm add next@latest react react-dom zustand
pnpm add -D @types/react @types/react-dom tailwindcss postcss autoprefixer typescript
npx tailwindcss init -p
```

```typescript
// packages/viewer/next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@vox/schema"],
};

export default config;
```

```typescript
// packages/viewer/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Create Zustand store and API layer**

```typescript
// packages/viewer/src/store/document.ts
import { create } from "zustand";
import type { VoxDocument, VoxBlock } from "@vox/schema";

interface DocumentState {
  document: VoxDocument | null;
  viewMode: "flagged" | "all";
  setDocument: (doc: VoxDocument) => void;
  setViewMode: (mode: "flagged" | "all") => void;
  getVisibleBlocks: () => VoxBlock[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  viewMode: "flagged",
  setDocument: (doc) => set({ document: doc }),
  setViewMode: (mode) => set({ viewMode: mode }),
  getVisibleBlocks: () => {
    const { document, viewMode } = get();
    if (!document) return [];
    if (viewMode === "all") return document.blocks;
    return document.blocks.filter(
      (b) =>
        !b.review ||
        b.review.status === "flagged" ||
        b.review.status === "pending"
    );
  },
}));
```

```typescript
// packages/viewer/src/lib/api.ts
import type { VoxDocument } from "@vox/schema";

const API_BASE = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "";

export async function fetchDocument(): Promise<VoxDocument> {
  const res = await fetch(`${API_BASE}/document`);
  return res.json();
}

export async function approveBlock(id: string): Promise<void> {
  await fetch(`${API_BASE}/block/${id}/approve`, { method: "POST" });
}

export async function flagBlock(id: string, comment: string): Promise<void> {
  await fetch(`${API_BASE}/block/${id}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
}
```

- [ ] **Step 3: Create BlockRenderer dispatch and block components**

```tsx
// packages/viewer/src/components/blocks/BlockRenderer.tsx
import type { VoxBlock } from "@vox/schema";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";
import { Callout } from "./Callout";
import { Code } from "./Code";
import { Table } from "./Table";

interface Props {
  block: VoxBlock;
}

export function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case "heading":
      return <Heading block={block} />;
    case "paragraph":
      return <Paragraph block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "code":
      return <Code block={block} />;
    case "table":
      return <Table block={block} />;
    default:
      return (
        <div id={block.id} className="text-gray-500 italic">
          [Unsupported block: {block.type}]
        </div>
      );
  }
}
```

Create individual block components following this pattern:

```tsx
// packages/viewer/src/components/blocks/Heading.tsx
import type { HeadingBlock } from "@vox/schema";

export function Heading({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
  return <Tag id={block.id} className="font-bold mt-6 mb-2">{block.content}</Tag>;
}
```

```tsx
// packages/viewer/src/components/blocks/Paragraph.tsx
import type { ParagraphBlock } from "@vox/schema";

export function Paragraph({ block }: { block: ParagraphBlock }) {
  return <p id={block.id} className="my-3 leading-relaxed">{block.content}</p>;
}
```

```tsx
// packages/viewer/src/components/blocks/Callout.tsx
import type { CalloutBlock } from "@vox/schema";

const VARIANT_STYLES: Record<string, string> = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  danger: "border-red-500 bg-red-50 dark:bg-red-950",
  tip: "border-green-500 bg-green-50 dark:bg-green-950",
  note: "border-purple-500 bg-purple-50 dark:bg-purple-950",
};

export function Callout({ block }: { block: CalloutBlock }) {
  return (
    <div
      id={block.id}
      role="note"
      aria-label={block.variant}
      className={`border-l-4 p-4 my-4 rounded-r ${VARIANT_STYLES[block.variant] ?? ""}`}
    >
      {block.title && <div className="font-semibold mb-1">{block.title}</div>}
      <div>{block.content}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create review components**

```tsx
// packages/viewer/src/components/review/BlockReviewControls.tsx
"use client";
import type { VoxBlock } from "@vox/schema";
import { useState } from "react";

interface Props {
  block: VoxBlock;
  onApprove: (id: string) => void;
  onFlag: (id: string, comment: string) => void;
}

export function BlockReviewControls({ block, onApprove, onFlag }: Props) {
  const [comment, setComment] = useState("");
  const status = block.review?.status ?? "pending";

  if (status === "pre_approved" || status === "approved") return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-b text-xs">
      <span className="text-gray-400">{block.id}</span>
      {block.review?.reason && (
        <span className="text-amber-600 text-xs ml-2">AI: {block.review.reason}</span>
      )}
      <div className="flex-1" />
      {status === "flagged" && (
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Instruction for AI..."
          className="flex-1 text-xs px-2 py-1 border rounded dark:bg-gray-900 dark:border-gray-600"
        />
      )}
      <button
        onClick={() => onFlag(block.id, comment)}
        className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
      >
        Flag
      </button>
      <button
        onClick={() => onApprove(block.id)}
        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
      >
        Approve
      </button>
    </div>
  );
}
```

```tsx
// packages/viewer/src/components/review/ReviewSidebar.tsx
"use client";
import type { VoxDocument } from "@vox/schema";

export function ReviewSidebar({ document }: { document: VoxDocument }) {
  const blocks = document.blocks;
  const approved = blocks.filter((b) => b.review?.status === "approved" || b.review?.status === "pre_approved").length;
  const pending = blocks.filter((b) => !b.review || b.review.status === "pending").length;
  const flagged = blocks.filter((b) => b.review?.status === "flagged").length;
  const total = blocks.length;
  const progress = total > 0 ? (approved / total) * 100 : 0;

  return (
    <div className="w-48 border-l border-gray-200 dark:border-gray-700 p-4 text-sm">
      <h3 className="font-semibold mb-3">Review Status</h3>
      <div className="space-y-1 mb-4">
        <div className="flex justify-between"><span className="text-green-500">✓ Approved</span><span className="font-semibold">{approved}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">○ Pending</span><span className="font-semibold">{pending}</span></div>
        <div className="flex justify-between"><span className="text-red-500">! Flagged</span><span className="font-semibold">{flagged}</span></div>
      </div>
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mb-4">
        <div className="h-full bg-green-500 rounded" style={{ width: `${progress}%` }} />
      </div>
      <h3 className="font-semibold mb-2">Provenance</h3>
      <div className="text-xs text-gray-500">
        <div>Generated by: {document.meta.provenance.generated_by ?? "—"}</div>
        <div>Reviewed by: {document.meta.provenance.reviewed_by ?? "—"}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create app shell and main page**

```tsx
// packages/viewer/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Vox Viewer" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
```

```tsx
// packages/viewer/src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useDocumentStore } from "../store/document";
import { fetchDocument } from "../lib/api";
import { BlockRenderer } from "../components/blocks/BlockRenderer";
import { BlockReviewControls } from "../components/review/BlockReviewControls";
import { ReviewSidebar } from "../components/review/ReviewSidebar";

export default function Home() {
  const { document, setDocument, viewMode, setViewMode, getVisibleBlocks } =
    useDocumentStore();

  useEffect(() => {
    fetchDocument().then(setDocument).catch(console.error);
  }, [setDocument]);

  if (!document) return <div className="p-8">Loading document...</div>;

  const blocks = getVisibleBlocks();

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold">{document.meta.title}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            {document.meta.status}
          </span>
          <div className="flex-1" />
          <button
            onClick={() =>
              setViewMode(viewMode === "flagged" ? "all" : "flagged")
            }
            className="text-xs px-3 py-1 border rounded dark:border-gray-600"
          >
            {viewMode === "flagged" ? "Show All" : "Flagged Only"}
          </button>
        </div>
        <div className="max-w-3xl space-y-4">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`rounded border ${
                block.review?.status === "approved"
                  ? "border-green-200 dark:border-green-800"
                  : block.review?.status === "flagged"
                    ? "border-red-300 dark:border-red-700"
                    : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="p-4">
                <BlockRenderer block={block} />
              </div>
              <BlockReviewControls
                block={block}
                onApprove={(id) => console.log("approve", id)}
                onFlag={(id, c) => console.log("flag", id, c)}
              />
            </div>
          ))}
        </div>
      </div>
      <ReviewSidebar document={document} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/viewer/
git commit -m "feat(viewer): add Next.js viewer with block rendering and review interface"
```

---

### Task 9: @vox/cli — View & MCP Serve Commands

**Goal:** Add `vox view` (serve viewer + open browser) and `vox mcp serve` (start MCP server) commands.

**Files:**
- Create: `packages/cli/src/commands/view.ts`
- Create: `packages/cli/src/commands/mcp-serve.ts`
- Modify: `packages/cli/src/cli.ts` — register new commands

**Acceptance Criteria:**
- [ ] `vox view doc.json` starts an HTTP server that serves the viewer app and a `/api/document` endpoint returning the document JSON
- [ ] `vox mcp serve doc.json` starts the MCP server and prints connection config
- [ ] View command opens browser automatically

**Verify:** `vox view examples/hello-world.vox` → opens browser with viewer

**Steps:**

- [ ] **Step 1: Implement view command**

```typescript
// packages/cli/src/commands/view.ts
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import open from "open";

export async function viewCommand(filePath: string): Promise<void> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const doc = JSON.parse(raw);

  const server = http.createServer((req, res) => {
    if (req.url === "/api/document") {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify(doc));
      return;
    }
    // Serve a minimal HTML page that loads the document inline
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Vox Viewer</title></head>
<body><pre>${JSON.stringify(doc, null, 2)}</pre>
<p>Full viewer UI coming — for now, showing raw document. Use 'vox compile' for rendered HTML.</p>
</body></html>`);
  });

  const port = 4400;
  server.listen(port, () => {
    console.log(`Vox viewer running at http://localhost:${port}`);
    console.log(`Document: ${filePath}`);
    open(`http://localhost:${port}`);
  });
}
```

- [ ] **Step 2: Implement mcp serve command**

```typescript
// packages/cli/src/commands/mcp-serve.ts
import { startServer } from "@vox/mcp";
import path from "node:path";

export async function mcpServeCommand(
  filePath: string,
  options: { port?: string }
): Promise<void> {
  const absPath = path.resolve(filePath);
  console.log(`Starting Vox MCP server for: ${absPath}`);
  console.log(`\nAdd to your Claude config:`);
  console.log(JSON.stringify({
    mcpServers: {
      "vox-document": {
        command: "vox",
        args: ["mcp", "serve", absPath],
      },
    },
  }, null, 2));
  console.log(`\nWaiting for AI connection...`);
  await startServer(absPath);
}
```

- [ ] **Step 3: Register new commands in cli.ts and commit**

Add `view` and `mcp serve` commands to the Commander program in `packages/cli/src/cli.ts`.

```bash
git add packages/cli/
git commit -m "feat(cli): add vox view and vox mcp serve commands"
```

---

### Task 10: Examples & Integration Smoke Test

**Goal:** Create example Vox documents and verify the full pipeline: init → populate → validate → compile → working HTML.

**Files:**
- Create: `examples/hello-world.vox`
- Create: `examples/api-reference.vox`
- Create: `tests/integration/smoke.test.ts`

**Acceptance Criteria:**
- [ ] Both example documents pass `vox validate`
- [ ] Both compile to self-contained HTML that opens in a browser
- [ ] HTML output contains correct semantic structure, ARIA attributes, responsive CSS
- [ ] Integration test verifies full pipeline programmatically

**Verify:** `vox compile examples/hello-world.vox --format html && open examples/hello-world.html` → valid rendered document in browser

**Steps:**

- [ ] **Step 1: Create hello-world.vox**

```json
{
  "$schema": "https://voxformat.dev/schema/v1.json",
  "meta": {
    "id": "example-hello-world",
    "title": "Hello, Vox!",
    "description": "A minimal example of a Vox document",
    "version": "1.0.0",
    "authors": ["Vox Team"],
    "tags": ["example"],
    "status": "approved",
    "created": "2026-04-12T00:00:00Z",
    "updated": "2026-04-12T00:00:00Z",
    "variables": { "format_name": "Vox" },
    "provenance": {
      "generated_by": null,
      "reviewed_by": null,
      "approved_blocks": [],
      "flagged_blocks": []
    },
    "accessibility": { "language": "en", "reading_level": "general" }
  },
  "blocks": [
    { "id": "blk_001", "type": "heading", "level": 1, "content": "Welcome to {{format_name}}" },
    { "id": "blk_002", "type": "paragraph", "content": "{{format_name}} is an AI-first, accessible, open document format. **Documents with a voice.**" },
    { "id": "blk_003", "type": "callout", "variant": "tip", "title": "Getting Started", "content": "Install the CLI with `npm install -g @vox/cli`, then run `vox init my-doc.vox`." },
    { "id": "blk_004", "type": "code", "language": "bash", "content": "npm install -g @vox/cli\nvox init my-first-doc.vox\nvox compile my-first-doc.vox --format html" },
    {
      "id": "blk_005",
      "type": "table",
      "headers": ["Feature", "PDF", "Vox"],
      "rows": [
        ["Editable", "No", "Yes"],
        ["Mobile-friendly", "No", "Yes"],
        ["Accessible by default", "Rarely", "Always"],
        ["AI-authored", "No", "Native"]
      ],
      "summary": "Comparison of PDF and Vox document format capabilities"
    }
  ]
}
```

- [ ] **Step 2: Create api-reference.vox example**

A more complete example with diagrams, tabs, variables, and callouts demonstrating the full range of block types.

- [ ] **Step 3: Write integration smoke test**

```typescript
// tests/integration/smoke.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { validateDocument } from "@vox/schema";
import { compile } from "@vox/compiler";

describe("Integration smoke test", () => {
  it("hello-world.vox validates and compiles", () => {
    const raw = fs.readFileSync("examples/hello-world.vox", "utf-8");
    const doc = JSON.parse(raw);

    const validation = validateDocument(doc);
    expect(validation.valid).toBe(true);

    const result = compile(doc);
    expect(result.success).toBe(true);
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("Welcome to");
    expect(result.html).toContain("Vox"); // variable resolved
    expect(result.html).toContain("Skip to content"); // skip nav
    expect(result.html).toContain("@media"); // responsive CSS
    expect(result.html).toContain('role="note"'); // callout ARIA
    expect(result.html).toContain('<th scope="col">'); // table accessibility
  });
});
```

- [ ] **Step 4: Run full test suite and commit**

```bash
pnpm -r build && pnpm -r test
git add examples/ tests/
git commit -m "feat: add example documents and integration smoke test"
```

---

## Post-Plan Summary

| Task | Package | What it delivers |
|------|---------|-----------------|
| 0 | Root | Monorepo scaffold with pnpm, Turbo, TypeScript |
| 1 | @vox/schema | Types, JSONSchema, validation, block ID generation |
| 2 | @vox/compiler | Core renderers (heading, paragraph, code, list, image, toc) |
| 3 | @vox/compiler | Enhanced renderers (callout, diagram, table, math, tabs, etc.) |
| 4 | @vox/compiler | Document assembly, accessibility checks, responsive CSS, compile() |
| 5 | @vox/cli | init, validate, compile, info, blocks commands |
| 6 | @vox/mcp | Document store, MCP server, read/write tools |
| 7 | @vox/mcp | Review workflow, accessibility, output tools |
| 8 | @vox/viewer | Next.js app with block components and review UI |
| 9 | @vox/cli | view + mcp serve commands |
| 10 | Examples | Example docs + integration smoke test |

**Dependency chain:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
