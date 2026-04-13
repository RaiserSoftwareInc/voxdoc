# OpenPDF — Design Spec
**Date:** 2026-04-12  
**Status:** Superseded — project pivoted to building a new open document format (see 2026-04-12-open-document-format-design.md)  
**License:** MIT (fully open source)  

---

## Overview

A free, open source, self-hostable PDF viewer, editor, annotator, form filler, and signer. Built out of spite toward overpriced SaaS PDF tools. No subscription, no uploads, no tracking. PDFs never leave the user's device.

---

## Goals

- Full-featured PDF editing in the browser — view, annotate, edit, fill forms, sign, organize pages
- Pure client-side processing — zero server required for core functionality
- Self-hostable with a single Docker command or a static file drop
- MIT licensed, open source on GitHub, contributor-friendly architecture
- PAdES-compliant digital signatures (Advanced tier) without requiring a backend
- Honest about limitations — no fake "edit existing text" claims

---

## Non-Goals (v1)

- Qualified Electronic Signatures (QES) — requires QTSP HSM, out of scope
- OCR / image-to-text conversion
- Word/Office document import
- Real-time collaboration
- Cloud storage integration
- Form creation (only filling existing AcroForms)
- True text reflow/editing of existing PDF text (pdf-lib limitation — we add on top, we don't rewrite)

---

## v2 Planned (not in scope now)

- REST API layer (enabled in server mode for self-hosters)
- MCP server for AI tool integration
- QTSP integration for Qualified signatures
- Auth: no auth required for local/internal deployments

---

## Platform & Deployment

**Type:** Web application — static export (`output: 'export'` in `next.config.js`)  
**Runtime requirement:** None. Static HTML/CSS/JS served by any web server.  

**Deployment options:**
- Drop `/out` folder behind Nginx, Apache, Caddy
- `docker run` single container (Nginx serving static files)
- Vercel / Cloudflare Pages / GitHub Pages (free hosting)
- `npx serve out/` for local use

**Self-hosting:** No database, no backend, no environment variables, no Node.js at runtime. Just files.

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 + TypeScript | Static export, App Router, largest ecosystem |
| PDF rendering | `pdfjs-dist` | Mozilla, powers Firefox PDF viewer, battle-tested |
| PDF read/write | `pdf-lib` | Pure JS, no native dependencies |
| Annotation canvas | `fabric.js` | Rich object model, serializable JSON, touch support |
| Page organizer DnD | `@dnd-kit/core` + `@dnd-kit/sortable` | Modern, accessible, no jQuery |
| Crypto / signing | `node-forge` | PKI operations in-browser, PAdES support |
| State management | `zustand` | Lightweight, no boilerplate, works with Next.js |
| Styling | Tailwind CSS + `shadcn/ui` | Fast, consistent, dark mode built-in |
| Icons | `lucide-react` | Clean, consistent icon set |

---

## Architecture

### Data Flow

```
[File Open]
    ↓
FileReader → ArrayBuffer
    ├─→ pdfjs-dist (render pages to <canvas>)
    └─→ pdf-lib (parse structure for editing)

[User Actions]
    ├─ Annotate → Fabric.js JSON → Zustand store
    ├─ Edit     → pdf-lib mutations → Zustand store
    ├─ Fill     → AcroForm field values → Zustand store
    ├─ Sign     → node-forge + pdf-lib → signature embedded
    └─ Organize → page order array → Zustand store

[Save]
    pdf-lib serializes all changes → ArrayBuffer → Blob → browser download
    (nothing sent to any server)
```

### State Management

Three Zustand stores:

- **`documentStore`** — loaded PDF bytes, pdf-lib document instance, page count, metadata
- **`annotationStore`** — Fabric.js canvas JSON per page, annotation tool state
- **`uiStore`** — active mode, zoom level, current page, dark mode, panel visibility

### Module Structure

```
src/
  app/                    # Next.js App Router pages
  components/
    shell/                # TopToolbar, LeftSidebar, RightPanel, StatusBar
    viewer/               # PDF.js canvas renderer, text layer, virtual scroll
    annotate/             # Fabric.js canvas layer, annotation tools
    edit/                 # Text box tool, image insert, merge UI
    forms/                # AcroForm field renderer, fill controls
    sign/                 # Signature pad, cert upload, placement UI
    organize/             # Page grid, DnD sorter, bulk actions
  lib/
    pdf-engine.ts         # pdf-lib wrapper (open, save, mutate)
    pdf-renderer.ts       # PDF.js wrapper (render page to canvas)
    annotation-engine.ts  # Fabric.js setup, serialize/deserialize
    signing/
      image-sign.ts       # Image signature flatten
      crypto-sign.ts      # PAdES-B signing (node-forge + pdf-lib)
      tsa.ts              # RFC 3161 timestamp request (hash only, no doc)
  store/
    document.ts
    annotation.ts
    ui.ts
```

---

## UI Shell

**Layout:** Top toolbar + Left sidebar + Main canvas + Right panel + Status bar

**Top toolbar:**
- Left: Logo, Open PDF, Save, Download
- Center: Mode switcher (View | Annotate | Edit | Forms | Sign | Organize)
- Right: Page navigation, zoom controls, dark mode toggle

**Left sidebar:**
- Pages tab: thumbnail strip (drag-to-reorder in Organize mode)
- Outline tab: PDF bookmark tree

**Main canvas:**
- PDF.js renders page(s) to `<canvas>`
- Fabric.js annotation canvas overlaid at exact same dimensions
- Virtual scrolling — only visible pages rendered
- Text layer for selection and `Ctrl+F` search

**Right panel (context-sensitive per mode):**
- Annotate: color, opacity, stroke width, note text, delete
- Edit: font, size, alignment, image controls
- Forms: field list, field value
- Sign: signature type selector, cert info, placement controls
- Organize: rotation, extract selection, delete selection

**Status bar:** filename, file size, selection info, page count, dark mode toggle

---

## Feature Modules

### View / Navigate
- PDF.js renders pages to canvas with full fidelity
- Virtual scrolling — only renders visible pages
- Text selection layer for copy/paste
- `Ctrl+F` text search with highlight
- Page thumbnails in sidebar
- PDF outline/bookmarks panel
- Zoom: fit-to-width, fit-to-page, percentage, keyboard shortcuts
- Keyboard navigation: arrow keys, Page Up/Down, `Home`/`End`

### Annotate
- Tools: highlight, underline, strikethrough (text selection-based)
- Tools: freehand draw, shapes (rect, circle, arrow, line)
- Tools: sticky note, text box
- All annotations stored as Fabric.js JSON in `annotationStore`
- On save: pdf-lib renders Fabric.js objects as PDF annotation objects (flattened into page)
- Color picker, opacity, stroke width in right panel

### Edit Content
- Add text box: places editable text overlay, baked into PDF on save via pdf-lib
- Insert image: drag-in or file picker, placed on page canvas
- Delete pages: select in sidebar, delete key
- Reorder pages: drag in sidebar or Organize mode
- Merge PDFs: open multiple files, drag to reorder, save as one
- UI clearly labels: "Existing text cannot be reflowed — new content is added as a layer"

### Fill Forms
- PDF.js renders AcroForm fields natively
- User fills fields in-browser
- pdf-lib reads field values on save, flattens AcroForms into static content
- Supports: text fields, checkboxes, radio buttons, dropdowns
- Does not support XFA forms (Adobe proprietary, deprecated)

### Sign

**Image signature:**
1. User draws signature on canvas pad (mouse/touch) or uploads image file
2. Signature placed on PDF page via drag
3. On save: pdf-lib renders signature image onto page, flattened permanently

**Cryptographic signature (PAdES-B-B / PAdES-B-T):**
1. User generates a self-signed cert in-browser (node-forge) — or uploads their own `.p12`/`.pfx` from a commercial CA
2. pdf-lib + node-forge embed a proper PDF digital signature dictionary (ISO 32000 compliant)
3. Optional: RFC 3161 timestamp from a TSA (FreeTSA.org or user-configured). Only a hash is sent — document content never leaves the browser.
4. Optional: OCSP response embedded for Long-Term Validation (LTV)

**Signature tiers (shown clearly in UI):**

| Mode | Trust Level | Server call? |
|---|---|---|
| Self-signed cert | Cryptographically valid, not CA-trusted | None |
| User .p12 (commercial CA) | Trusted by PDF readers, legally valid in most contexts | None (TSA optional) |
| + TSA timestamp | PAdES-B-T, proves signing time | Hash only to TSA |
| Qualified (QES) | Highest legal tier | Out of scope — requires QTSP HSM |

**Not supported in v1:** Qualified Electronic Signatures (QES) — by design, these require a government-approved QTSP server holding the private key in an HSM. We document how users can use an external QTSP and load the result back in.

### Organize Pages
- Full-screen grid view of all page thumbnails
- Drag-to-reorder with `@dnd-kit`
- Multi-select: `Shift+click`, `Ctrl+click`
- Bulk actions: delete, rotate 90°/180°, extract selection to new PDF
- Split: define page ranges, download as separate PDFs

---

## Digital Signature Standards Reference

- **ISO 32000-2:2017** — PDF 2.0 specification (target compliance)
- **ETSI EN 319 100** — PAdES (PDF Advanced Electronic Signatures)
- **RFC 3161** — Trusted Timestamping protocol
- **eIDAS Regulation (EU) 910/2014** — legal framework for electronic signatures
- **PDF Association** (pdfa.org) — industry body, reference implementations

Our signatures target **PAdES-B-B** (basic) and **PAdES-B-T** (with timestamp). This is legally sufficient for the vast majority of use cases outside of government/qualified contexts.

---

## Open Source

- **License:** MIT
- **Repository:** GitHub (public)
- **Contributing:** Module-per-feature structure makes it easy to contribute to one area without understanding the whole codebase
- **No telemetry, no analytics, no phone-home**

---

## v2 API Layer (planned, not in scope)

When self-hosted in server mode (Next.js server, not static export):

- REST API endpoints: extract-text, annotate, sign, merge, split, fill-form
- MCP server for AI tool integration (Claude, Cursor, etc.)
- No auth required for local/internal deployments
- Documents processed server-side using same pdf-lib/pdfjs stack

---

## Out of Scope Forever

- Uploading documents to any cloud without explicit user action
- Telemetry or usage tracking of any kind
- Subscription gating of features
- XFA form support (Adobe proprietary, being deprecated by Adobe itself)
