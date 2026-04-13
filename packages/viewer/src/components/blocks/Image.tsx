import type { ImageBlock } from "@voxdoc/schema";

export function Image({ block }: { block: ImageBlock }) {
  return (
    <figure className="my-4" role="figure" aria-label={block.caption ?? block.alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.src} alt={block.alt} className="max-w-full rounded" />
      {block.caption && (
        <figcaption className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
