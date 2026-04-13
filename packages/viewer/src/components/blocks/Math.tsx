import type { MathBlock } from "@voxdoc/schema";

export function Math({ block }: { block: MathBlock }) {
  return (
    <div
      className={`my-3 font-mono ${block.display === "block" ? "text-center py-4" : "inline"}`}
      role="math"
      aria-label={block.spoken}
    >
      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
        {block.expression}
      </code>
    </div>
  );
}
