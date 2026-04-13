"use client";

import { useState } from "react";
import type { TabsBlock } from "@voxdoc/schema";

export function Tabs({ block }: { block: TabsBlock }) {
  const [active, setActive] = useState(0);
  const panel = block.panels[active];

  return (
    <div className="my-4" role="tablist" aria-label="Tabbed content">
      <div className="flex border-b border-gray-300 dark:border-gray-600">
        {block.panels.map((p, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-controls={`tabpanel-${block.id}-${i}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              i === active
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            onClick={() => setActive(i)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div
        id={`tabpanel-${block.id}-${active}`}
        role="tabpanel"
        className="p-4 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b"
      >
        {panel?.content && (
          <pre className="text-sm font-mono whitespace-pre-wrap">{panel.content}</pre>
        )}
      </div>
    </div>
  );
}
