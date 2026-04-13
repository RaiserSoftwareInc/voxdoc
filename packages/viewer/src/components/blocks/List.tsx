import type { ListBlock } from "@vox/schema";

export function List({ block }: { block: ListBlock }) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag
      className={`my-3 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
      role="list"
      aria-label={`${block.ordered ? "Ordered" : "Unordered"} list`}
    >
      {block.items.map((item, i) => (
        <li key={i} className="my-1" role="listitem">
          {item}
        </li>
      ))}
    </Tag>
  );
}
