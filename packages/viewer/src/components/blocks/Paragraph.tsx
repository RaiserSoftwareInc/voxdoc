import type { ParagraphBlock } from "@vox/schema";

export function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <p className="my-3 leading-relaxed" aria-label={`Paragraph ${block.id}`}>
      {block.content}
    </p>
  );
}
