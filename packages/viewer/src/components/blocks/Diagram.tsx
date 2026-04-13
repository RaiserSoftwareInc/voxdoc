import type { DiagramBlock } from "@vox/schema";

export function Diagram({ block }: { block: DiagramBlock }) {
  return (
    <figure className="my-4" role="figure" aria-label={block.description}>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm font-mono border border-gray-200 dark:border-gray-700">
        {block.content}
      </pre>
      <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {block.syntax} diagram: {block.description}
      </figcaption>
    </figure>
  );
}
