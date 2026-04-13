// ── Review & Status ──────────────────────────────────────────────

export type ReviewStatus = "pre_approved" | "pending" | "flagged" | "approved";

export interface BlockReview {
  confidence: number;
  reason: string | null;
  status: ReviewStatus;
}

// ── Base Block ───────────────────────────────────────────────────

export interface BaseBlock {
  id: string;
  review?: BlockReview;
}

// ── Core Blocks ──────────────────────────────────────────────────

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

// ── Enhanced Blocks ──────────────────────────────────────────────

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

// ── Accessibility ────────────────────────────────────────────────

export interface HandwritingTranscription {
  text: string;
  confidence: number;
  status: ReviewStatus;
  method: string;
}

export interface HandwritingBlock extends BaseBlock {
  type: "handwriting";
  image: string;
  alt: string;
  transcription: HandwritingTranscription;
}

// ── Metadata Blocks ──────────────────────────────────────────────

export interface VariableDefBlock extends BaseBlock {
  type: "variable_def";
  key: string;
  value: string;
}

export interface XrefBlock extends BaseBlock {
  type: "xref";
  target: string;
}

// ── Union Type ───────────────────────────────────────────────────

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

// ── Document Types ───────────────────────────────────────────────

export type DocumentStatus = "draft" | "pending_review" | "approved" | "published";

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
  provenance: {
    generated_by: string;
    reviewed_by: string;
    approved_blocks: string[];
    flagged_blocks: string[];
  };
  accessibility: {
    language: string;
    reading_level: string;
  };
}

export interface ReviewComment {
  id: string;
  block_id: string;
  comment: string;
  created: string;
  resolved: boolean;
}

export interface VoxDocument {
  $schema?: string;
  meta: DocumentMeta;
  blocks: VoxBlock[];
  comments?: ReviewComment[];
}
