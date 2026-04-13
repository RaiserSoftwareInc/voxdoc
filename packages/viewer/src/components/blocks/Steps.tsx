import type { StepsBlock } from "@voxdoc/schema";

export function Steps({ block }: { block: StepsBlock }) {
  return (
    <ol className="my-4 space-y-4" role="list" aria-label="Steps">
      {block.steps.map((step, i) => (
        <li key={i} className="flex gap-3" role="listitem">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold">{step.title}</p>
            {step.blocks.map((child) => (
              <div key={child.id} className="text-sm my-1">
                {"content" in child ? String(child.content) : `[${child.type}]`}
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
