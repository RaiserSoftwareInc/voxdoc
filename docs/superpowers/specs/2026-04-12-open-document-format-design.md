# Open Document Format — Design Spec
**Date:** 2026-04-12
**Status:** Approved
**License:** MIT (fully open source)
**Name:** Vox

---

## Overview

An open, AI-first document format that competes with PDF in all non-legal use cases. PDFs are write-once, inaccessible, mobile-hostile, and designed for humans to author manually. This format inverts that: AI authors documents, humans review by exception, and accessibility is built into the structure rather than retrofitted.

The format is a typed, schema-validated JSON block document. AI generates and edits it via an MCP server. Humans read the compiled output and intervene only when AI flags uncertainty. Every document is accessible by default — WCAG 2.1 AA, screen reader ready, handwriting transcribed.

---

## Design Principles

1. **AI ships by default. Humans intervene by exception.** Zero flags means the document compiles and ships automatically. Human effort is the cost — minimize it.
2. **Accessibility is structure, not a retrofit.** Every visual block carries a text equivalent. The compiled HTML is WCAG 2.1 AA. This is not optional.
3. **The format is the product.** Open spec, MIT licensed. The tools (MCP server, CLI, viewer) are the reference implementation.
4. **Developer-first beachhead.** Developers adopt fast, build tooling, and drag the wider market along. Everything is designed to feel natural to a developer.
5. **Git-friendly by default.** JSON source is diffable, versionable, and mergeable at the block level.

---

## What This Is Not

- Not a Markdown replacement — Markdown is great for authoring prose. This is for distributing professional, structured documents.
- Not a PDF editor — PDF is a separate export target.
- Not a word processor — there is no WYSIWYG editing interface.
- Not a collaboration tool — real-time collaboration is out of scope for v1.
- Not a legal document format — QES, court-admissible signatures, and legal archiving are out of scope.

---

## Target Users (v1)

**Primary:** Developers — API documentation, technical specs, architecture documents, proposals, reports. Developers who currently suffer through Markdown-to-PDF pipelines or paste into Notion to make things shareable.

**Secondary (v2+):** Educators, researchers, technical writers. Anyone producing documents that need professional presentation, accessibility compliance, and AI-assisted authoring.

---

## The Format

### File Structure

A document is a single `.json` file with two top-level keys: `meta` and `blocks`.

```json
{
  "$schema": "https://voxformat.dev/schema/v1.json",
  "meta": {
    "id": "uuid-v4",
    "title": "Authentication API",
    "description": "Reference documentation for auth endpoints",
    "version": "1.0.0",
    "authors": ["Bryan"],
    "tags": ["api", "authentication"],
    "status": "pending_review",
    "created": "2026-04-12T00:00:00Z",
    "updated": "2026-04-12T00:00:00Z",
    "variables": {
      "api_version": "v2",
      "base_url": "https://api.example.com"
    },
    "provenance": {
      "generated_by": "claude-sonnet-4-6",
      "reviewed_by": null,
      "approved_blocks": [],
      "flagged_blocks": []
    },
    "accessibility": {
      "language": "en",
      "reading_level": "technical"
    }
  },
  "blocks": []
}
```

### Document Status Lifecycle

```
draft → pending_review → approved → published
                ↑              |
                └──────────────┘  (revision cycle)
```

- **draft** — AI is still generating. Not ready for review.
- **pending_review** — AI finished and self-reviewed. Flagged blocks need human attention.
- **approved** — all blocks approved. Ready to compile and distribute.
- **published** — compiled output exists and has been distributed.

### Variables

Defined in `meta.variables`. Referenced anywhere in block content as `{{variable_name}}`. AI resolves variables at compile time. Changing a variable propagates instantly across the entire document.

### Block IDs

Every block has a stable `id` (format: `blk_[nanoid]`). IDs never change after creation — they are the stable reference for cross-references, review comments, diffs, and provenance tracking. If a block is deleted and recreated, it gets a new ID.

---

## Block Types

### Core Content

| Type | Description |
|---|---|
| `heading` | Section heading. Fields: `level` (1-6), `content` |
| `paragraph` | Prose content. Inline Markdown supported. Fields: `content` |
| `code` | Syntax-highlighted code. Fields: `language`, `content`, `filename?`, `highlight_lines?` |
| `image` | Image with required alt text. Fields: `src`, `alt`, `caption?` — `alt` is required, never empty |
| `list` | Ordered or unordered list. Fields: `ordered`, `items[]` |
| `toc` | Auto-generated table of contents. Fields: `max_depth?` |

### Enhanced (Markdown gaps)

| Type | Description |
|---|---|
| `callout` | Admonition box. Fields: `variant` (info/warning/danger/tip/note), `title?`, `content` |
| `diagram` | Rendered diagram. Fields: `syntax` (mermaid/graphviz/d2), `content`, `description` (required — screen reader text) |
| `table` | Rich table. Fields: `headers[]`, `rows[][]`, `caption?`, `summary` (required — screen reader summary) |
| `math` | KaTeX equation. Fields: `expression`, `display` (inline/block), `spoken` (MathSpeak text for screen readers) |
| `tabs` | Tabbed panels. Fields: `panels[]` — each panel has `label`, `blocks[]` |
| `accordion` | Collapsible section. Fields: `title`, `blocks[]`, `default_open?` |
| `steps` | Numbered step sequence. Fields: `steps[]` — each step has `title`, `blocks[]` |
| `layout` | Multi-column layout. Fields: `columns` (2/3), `blocks[][]` — each inner array is one column |
| `include` | Reference to another document file. Fields: `src` (path to .json), `section?` (block id range). Block type defined in v1; compile-time inlining (following includes and embedding content) is a v2 compiler feature. In v1, include blocks render as links in compiled output. |

### Accessibility-specific

| Type | Description |
|---|---|
| `handwriting` | Handwritten content with AI transcription. Fields: `image` (src), `transcription` (text, confidence, status, method), `alt` |

### Metadata

| Type | Description |
|---|---|
| `variable_def` | Inline variable definition. Fields: `key`, `value` — alternative to meta.variables for inline definition |

### Block Accessibility Fields

Every block that has visual content carries mandatory accessibility fields:

```json
{
  "id": "blk_001",
  "type": "diagram",
  "syntax": "mermaid",
  "content": "flowchart LR\n  A[Client] --> B[Redis] --> C[API] --> D[DB]",
  "description": "Authentication flow: client sends credentials to Redis cache, which forwards to API, which queries the database. Cache hit skips API and DB.",
  "review": {
    "confidence": 0.87,
    "reason": null,
    "status": "pre_approved"
  }
}
```

The `description` field on visual blocks is what screen readers announce. AI generates it. Humans verify it during review. It is never optional.

### Handwriting Block

```json
{
  "id": "blk_042",
  "type": "handwriting",
  "image": "assets/teacher-annotation-p3.png",
  "alt": "Teacher's handwritten annotation on page 3",
  "transcription": {
    "text": "Remember: this formula only applies when n > 0",
    "confidence": 0.94,
    "status": "pending_review",
    "method": "ai_ocr"
  },
  "review": {
    "confidence": 0.94,
    "reason": "OCR confidence adequate but handwriting partially obscured in bottom-right corner",
    "status": "flagged"
  }
}
```

When a handwriting block has low transcription confidence, it is automatically flagged for human verification. The human reads the original image and confirms or corrects the transcription — not by editing content but by approving or leaving a correction comment for AI to apply.

---

## Block Review Model

### AI Self-Review

Before setting status to `pending_review`, AI assigns a confidence score to every block it generated:

```json
"review": {
  "confidence": 0.6,
  "reason": "Inferred Redis caching from code comments — not explicitly documented anywhere",
  "status": "flagged"
}
```

Confidence thresholds:
- **≥ 0.90** → `pre_approved` — human never sees this block unless they request full review
- **0.70 – 0.89** → `pending` — surfaced in the reviewer, human approves or flags
- **< 0.70** → `flagged` — automatically flagged with AI's reasoning shown to human

### Human Review Modes

| Mode | When to use | Human effort |
|---|---|---|
| **Flagged only** (default) | Normal case — AI surfaced 1-3 uncertain blocks | Minimal |
| **Approve all** | High trust, routine document | Zero — one click |
| **Spot check** | AI picks 3-4 representative blocks for sanity check | Low |
| **Review all** | High-stakes document requiring full human read | High |

### Zero-Flag Automatic Compilation

If AI self-review produces zero flagged blocks, the document compiles and ships automatically. No human opens the viewer. A notification is sent: "API docs updated — 0 blocks flagged, compiled to HTML."

### Progressive Trust

As a human approves more of AI's output without corrections, AI's confidence threshold adjusts upward for that document type. Over time, routine documents ship without ever requiring human input.

### Human Actions

Humans have three actions on any block:
1. **Approve** — mark as verified
2. **Flag + comment** — describe what is wrong; AI reads the comment via MCP and revises
3. **Pass** — skip for now, revisit later

Humans never directly edit block content. They instruct AI via comments.

---

## MCP Server

The MCP server is the primary interface for AI tools. It exposes the document as typed tools and resources.

### Tools

```
Document reads
  get_document()                      → full document JSON
  list_blocks()                       → all blocks: id, type, content summary, review status
  get_block(id)                       → single block full content
  get_schema()                        → full JSONSchema for all block types
  search_blocks(query)                → semantic search across block content

Document writes
  add_block(type, content, after?)    → insert block after given id, returns new block id
  edit_block(id, content)             → update block content
  delete_block(id)                    → remove block
  move_block(id, after?)              → reorder blocks
  set_metadata(key, value)            → update title, version, tags, etc.
  set_variable(key, value)            → add or update a variable

Accessibility
  set_description(block_id, text)     → set screen reader description on visual block
  set_transcription(block_id, text)   → update handwriting transcription
  get_accessibility_report()          → list blocks missing required alt/description fields

Review workflow
  self_review()                       → AI scores all blocks, sets flags, sets status pending_review
  add_comment(block_id, comment)      → attach human feedback to a block
  list_comments()                     → all pending comments AI needs to act on
  resolve_comment(comment_id)         → mark comment addressed after AI fixes it
  set_block_status(id, status)        → pre_approved / pending / flagged / approved
  set_status(status)                  → set document-level status

Output
  validate()                          → check document against schema, returns errors/warnings
  compile(format)                     → build html or pdf, returns output path
```

### Resources

```
document://current                  → live document JSON
document://schema                   → block type schema
document://block/{id}               → single block
document://comments                 → pending review comments
document://accessibility            → accessibility report
```

### AI Authoring Workflow

```
Developer → AI: "Generate API docs for /src/routes/auth.ts"

1. AI reads source file via its own tools
2. AI calls get_schema() to understand available block types
3. AI builds the document block by block:
     add_block("heading", { level: 1, content: "Authentication API" })
     add_block("paragraph", { content: "All requests to {{base_url}}..." })
     add_block("callout", { variant: "warning", content: "..." })
     add_block("diagram", { syntax: "mermaid", content: "...", description: "..." })
     add_block("table", { headers: [...], rows: [...], summary: "..." })
     set_variable("base_url", "https://api.example.com")
4. AI calls self_review() → scores all blocks, flags uncertain ones
5. set_status("pending_review")

If zero flags:
   compile("html") → ships automatically → developer notified

If flags exist:
   Developer opens viewer → sees only flagged blocks
   Developer leaves comments
   AI calls list_comments() → edits blocks → resolve_comment()
   Developer approves remaining blocks
   compile("html") → ships
```

---

## CLI

Single binary installable via npm. No runtime dependencies.

```bash
npm install -g @vox/cli
```

### Commands

```bash
# Initialize
vox init api-reference.json
vox init api-reference.json --title "Auth API" --template api-docs

# MCP server (AI connects here)
vox mcp serve api-reference.json
vox mcp serve api-reference.json --port 3100
# Prints MCP connection config for Claude/Cursor/etc.

# Viewer/reviewer
vox view api-reference.json
# Serves viewer at localhost:PORT, opens browser, shows flagged blocks only

# Validate
vox validate api-reference.json
# Prints block-level schema errors and accessibility warnings

# Compile
vox compile api-reference.json --format html
vox compile api-reference.json --format pdf
vox compile api-reference.json --format html --out ./dist
vox compile api-reference.json --format html --watch

# Diff (block-level, not line-level)
vox diff v1.json v2.json
# Shows which blocks added, edited, removed — not a raw text diff

# Import from other formats
vox import README.md --out readme.json
vox import spec.pdf --out spec.json
# PDF import: OCRs handwriting, extracts structure, creates handwriting blocks

# Info
vox info api-reference.json
vox blocks api-reference.json
# id | type | content preview | review status | confidence
```

### Package Structure

```
@vox/cli          CLI tool
@vox/schema       JSONSchema + TypeScript types
@vox/mcp          MCP server (also usable as a library)
@vox/viewer       Viewer app (also embeddable)
@vox/compiler     JSON → HTML/PDF (usable as a library)
```

---

## Viewer / Reviewer

A lightweight browser-based interface. Not an editor. Served locally via `vox view` or as a static web app.

### Default View: Flagged and Pending Blocks

The viewer opens showing only blocks that need human attention — `flagged` blocks (AI confidence < 0.70) and `pending` blocks (confidence 0.70–0.89). Pre-approved blocks (≥ 0.90) are hidden unless the user switches to full review mode.

Each surfaced block shows:
- The rendered block content
- AI's confidence score and reasoning
- Approve / Flag buttons
- Comment thread (if flagged) with a text input for instructions to AI

### Panels

**Review sidebar:**
- Approved / Pending / Flagged counts
- Progress bar
- Document provenance (generated by, reviewed by)
- Variable list

**Full document view (optional):**
- All blocks rendered in order
- Block status indicators (green/gray/red dot)
- Approve All / Spot Check buttons

### Accessibility in the Viewer

- Full keyboard navigation
- Screen reader compatible (ARIA live regions for status updates)
- High contrast mode (follows OS preference)
- Focus indicators on all interactive elements

---

## Compiled Output Accessibility

Every HTML document compiled from the format is WCAG 2.1 AA compliant by default. This is enforced by the compiler, not left to the author.

Compiler guarantees:
- Semantic HTML5 elements (`<article>`, `<section>`, `<nav>`, `<figure>`, `<figcaption>`)
- All images have non-empty `alt` attributes — compilation fails if any are missing
- All diagrams have `aria-label` from the `description` field
- All tables have `<caption>` and proper `<th scope>` associations
- All math blocks rendered with MathSpeak ARIA labels
- Handwriting blocks render the transcription text in a `<p>` below the image, visually hidden but screen-reader visible
- Logical reading order matches visual order
- Skip navigation link at top of every compiled document
- Sufficient color contrast enforced in all built-in themes
- No content conveyed by color alone

### Responsive Output

Every compiled HTML document is fully responsive by default. This is a compiler guarantee, not a configuration option. PDF on mobile requires pinch-zoom on a fixed A4 layout — Vox compiled output reads naturally on any screen width.

Compiler responsive guarantees:
- Fluid layout — document width adapts to viewport, readable from 320px upward
- `layout` (multi-column) blocks collapse to single column below 640px
- `table` blocks scroll horizontally within their container on small screens — column headers remain visible
- `diagram` blocks scale to container width — minimum readable size enforced, never clipped
- `code` blocks scroll horizontally within the block — never breaks page layout
- `tabs` panels compress labels on small screens — collapse to a select dropdown below 400px if labels overflow
- `math` blocks scroll horizontally within the block if expression is wider than viewport
- `image` and `handwriting` blocks are max-width 100% — never overflow their container
- Base font size scales with viewport — comfortable reading without zooming
- Touch targets (approve/flag buttons in viewer) minimum 44×44px per WCAG 2.5.5

No external CSS framework is required in the compiled output — the compiler emits a self-contained stylesheet optimized for document reading.

**Compilation fails if:**
- Any `image` block has an empty or missing `alt` field
- Any `diagram` block has an empty or missing `description` field
- Any `table` block has an empty or missing `summary` field
- Any `handwriting` block has a transcription with status `pending_review` and confidence < 0.70 (must be human-verified before compile)

---

## Distribution Formats

| Format | Use case | Notes |
|---|---|---|
| `.json` | Source, version control, AI authoring | Native format, git-friendly |
| `.html` | Sharing, self-hosting, reading | Self-contained, renders in any browser, no install |
| `.pdf` | Print, legacy compatibility | Exported via headless browser. Not the primary target. |

---

## Open Source

- **License:** MIT
- **Repository:** GitHub (public from day one)
- **Spec:** Published separately as a versioned document — any tool can implement it
- **No telemetry, no analytics, no phone-home of any kind**
- **Scoped npm packages** — anyone can build on `@vox/schema` without taking the whole stack

---

## v2 Planned

- Multi-file composition resolved at compile time (`include` block)
- Rich table merged cells
- Real-time collaboration (operational transforms or CRDTs on block array)
- QTSP integration for legally-recognized digital signatures
- Educator tools: classroom distribution, student submission, handwriting import from stylus
- Plugin system for custom block types
- Export to EPUB for ebook distribution

---

## Out of Scope Forever

- WYSIWYG editing interface — humans review, AI authors
- Qualified Electronic Signatures (QES) — requires QTSP HSM
- XFA form support
- Telemetry or usage tracking
- Vendor lock-in of any kind — the spec is open, the tools are MIT
