import type { LayoutBlock } from "@voxdoc/schema";

export function Layout({ block }: { block: LayoutBlock }) {
  const gridClass = block.columns === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={`my-4 grid ${gridClass} gap-4`} role="group" aria-label={`${block.columns}-column layout`}>
      {block.blocks.map((col, ci) => (
        <div key={ci} className="border border-gray-200 dark:border-gray-700 rounded p-3">
          {col.map((child) => (
            <div key={child.id} className="text-sm my-1">
              {"content" in child ? String(child.content) : `[${child.type}]`}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
