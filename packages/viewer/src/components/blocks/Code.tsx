import type { CodeBlock } from "@voxdoc/schema";

export function Code({ block }: { block: CodeBlock }) {
  return (
    <figure className="my-4" role="figure" aria-label={block.filename ?? `Code block (${block.language})`}>
      {block.filename && (
        <figcaption className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-t border border-b-0 border-gray-200 dark:border-gray-700 font-mono">
          {block.filename}
        </figcaption>
      )}
      <pre className={`bg-gray-100 dark:bg-gray-800 p-4 overflow-x-auto text-sm border border-gray-200 dark:border-gray-700 ${block.filename ? "rounded-b" : "rounded"}`}>
        <code className="font-mono" data-language={block.language}>
          {block.content}
        </code>
      </pre>
    </figure>
  );
}
