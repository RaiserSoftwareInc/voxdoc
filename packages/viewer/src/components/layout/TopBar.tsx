"use client";

import { useDocumentStore } from "@/store/document";

export function TopBar() {
  const document = useDocumentStore((s) => s.document);
  const viewMode = useDocumentStore((s) => s.viewMode);
  const setViewMode = useDocumentStore((s) => s.setViewMode);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">
          {document?.meta.title ?? "Vox Viewer"}
        </h1>
        {document && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            document.meta.status === "approved"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : document.meta.status === "pending_review"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
            {document.meta.status}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex rounded border border-gray-300 dark:border-gray-600 overflow-hidden" role="radiogroup" aria-label="View mode">
          <button
            role="radio"
            aria-checked={viewMode === "flagged"}
            onClick={() => setViewMode("flagged")}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "flagged"
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Flagged Only
          </button>
          <button
            role="radio"
            aria-checked={viewMode === "all"}
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 text-sm ${
              viewMode === "all"
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Show All
          </button>
        </div>
      </div>
    </header>
  );
}
