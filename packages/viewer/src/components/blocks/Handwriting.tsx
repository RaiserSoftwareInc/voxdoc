import type { HandwritingBlock } from "@voxdoc/schema";

export function Handwriting({ block }: { block: HandwritingBlock }) {
  return (
    <figure className="my-4" role="figure" aria-label={block.alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.image} alt={block.alt} className="max-w-full rounded border border-gray-300 dark:border-gray-600" />
      <figcaption className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
        <p className="font-medium mb-1">Transcription (confidence: {(block.transcription.confidence * 100).toFixed(0)}%)</p>
        <p className="italic">{block.transcription.text}</p>
      </figcaption>
    </figure>
  );
}
