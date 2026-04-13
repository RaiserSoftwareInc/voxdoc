import type { TableBlock } from "@voxdoc/schema";

export function Table({ block }: { block: TableBlock }) {
  return (
    <figure className="my-4 overflow-x-auto" role="figure" aria-label={block.caption ?? block.summary}>
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm" aria-describedby={`table-caption-${block.id}`}>
        {block.caption && (
          <caption id={`table-caption-${block.id}`} className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-left">
            {block.caption}
          </caption>
        )}
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i} className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-left font-semibold" scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} className="even:bg-gray-50 dark:even:bg-gray-800/50">
              {row.map((cell, ci) => (
                <td key={ci} className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
