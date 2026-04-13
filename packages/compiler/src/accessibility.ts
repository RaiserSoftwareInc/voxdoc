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
            `Block "${block.id}": image is missing alt text. All images must have descriptive alt text for accessibility.`,
          );
        }
        break;

      case "diagram":
        if (!block.description || block.description.trim() === "") {
          errors.push(
            `Block "${block.id}": diagram is missing description. All diagrams must have a text description for accessibility.`,
          );
        }
        break;

      case "table":
        if (!block.summary || block.summary.trim() === "") {
          errors.push(
            `Block "${block.id}": table is missing summary. All tables must have a summary for accessibility.`,
          );
        }
        break;

      case "math":
        if (!block.spoken || block.spoken.trim() === "") {
          errors.push(
            `Block "${block.id}": math block is missing spoken text. All math blocks must have spoken text for accessibility.`,
          );
        }
        break;

      case "handwriting":
        if (
          block.transcription.status === "pending" &&
          block.transcription.confidence < 0.7
        ) {
          errors.push(
            `Block "${block.id}": handwriting transcription has low confidence (${block.transcription.confidence}) and has not been verified. Review is required before publishing.`,
          );
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}
