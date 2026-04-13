import type { HeadingBlock } from "@voxdoc/schema";

const sizeClasses: Record<number, string> = {
  1: "text-3xl font-bold mt-8 mb-4",
  2: "text-2xl font-bold mt-6 mb-3",
  3: "text-xl font-semibold mt-5 mb-2",
  4: "text-lg font-semibold mt-4 mb-2",
  5: "text-base font-medium mt-3 mb-1",
  6: "text-sm font-medium mt-3 mb-1",
};

export function Heading({ block }: { block: HeadingBlock }) {
  const Tag = `h${block.level}` as const;
  return (
    <Tag className={sizeClasses[block.level]} id={block.id} role="heading" aria-level={block.level}>
      {block.content}
    </Tag>
  );
}
