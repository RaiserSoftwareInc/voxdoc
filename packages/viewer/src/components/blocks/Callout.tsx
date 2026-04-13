import type { CalloutBlock, CalloutVariant } from "@voxdoc/schema";

const variantStyles: Record<CalloutVariant, { border: string; bg: string; icon: string }> = {
  info: { border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-950", icon: "i" },
  warning: { border: "border-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950", icon: "!" },
  danger: { border: "border-red-500", bg: "bg-red-50 dark:bg-red-950", icon: "X" },
  tip: { border: "border-green-500", bg: "bg-green-50 dark:bg-green-950", icon: "*" },
  note: { border: "border-gray-500", bg: "bg-gray-50 dark:bg-gray-800", icon: "N" },
};

export function Callout({ block }: { block: CalloutBlock }) {
  const style = variantStyles[block.variant];
  return (
    <aside
      className={`my-4 border-l-4 ${style.border} ${style.bg} p-4 rounded-r`}
      role="note"
      aria-label={block.title ?? `${block.variant} callout`}
    >
      {block.title && (
        <p className="font-semibold mb-1">
          <span aria-hidden="true">{style.icon} </span>
          {block.title}
        </p>
      )}
      <p>{block.content}</p>
    </aside>
  );
}
