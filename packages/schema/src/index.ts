// Types
export type {
  BaseBlock,
  BlockReview,
  ReviewStatus,
  HeadingBlock,
  ParagraphBlock,
  CodeBlock,
  ImageBlock,
  ListBlock,
  TocBlock,
  CalloutVariant,
  CalloutBlock,
  DiagramBlock,
  TableBlock,
  MathBlock,
  TabPanel,
  TabsBlock,
  AccordionBlock,
  StepItem,
  StepsBlock,
  LayoutBlock,
  IncludeBlock,
  HandwritingTranscription,
  HandwritingBlock,
  VariableDefBlock,
  XrefBlock,
  VoxBlock,
  DocumentStatus,
  DocumentMeta,
  ReviewComment,
  VoxDocument,
} from "./types.js";

// Schema
export { voxDocumentSchema } from "./schema.js";

// Validation
export { validateDocument } from "./validate.js";
export type { ValidationResult } from "./validate.js";

// Block ID
export { generateBlockId } from "./block-id.js";

// Extensions
export { isVoxFile, ensureVoxHtmlExtension, VOX_GLOB_PATTERNS } from "./extensions.js";
