import type { AccordionBlock } from "@voxdoc/schema";

export function Accordion({ block }: { block: AccordionBlock }) {
  return (
    <details className="my-4 border border-gray-300 dark:border-gray-600 rounded" open={block.default_open}>
      <summary className="px-4 py-3 cursor-pointer font-medium bg-gray-50 dark:bg-gray-800 rounded select-none">
        {block.title}
      </summary>
      <div className="p-4 text-sm">
        {block.blocks.map((child) => (
          <div key={child.id} className="my-1">
            {"content" in child ? String(child.content) : `[${child.type}]`}
          </div>
        ))}
      </div>
    </details>
  );
}
