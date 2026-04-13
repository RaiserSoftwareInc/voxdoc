"use client";

import { useState } from "react";
import type { VoxBlock } from "@voxdoc/schema";

interface BlockReviewControlsProps {
  block: VoxBlock;
  onApprove: (id: string) => void;
  onFlag: (id: string, comment: string) => void;
}

export function BlockReviewControls({ block, onApprove, onFlag }: BlockReviewControlsProps) {
  const [flagging, setFlagging] = useState(false);
  const [comment, setComment] = useState("");
  const review = block.review;
  const status = review?.status ?? "pending";

  if (status === "approved" || status === "pre_approved") return null;

  return (
    <div className="flex items-start gap-3 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700" role="group" aria-label={`Review controls for block ${block.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-mono">{block.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
            status === "flagged"
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          }`}>
            {status}
          </span>
          {review && (
            <span className="text-gray-400">
              confidence: {(review.confidence * 100).toFixed(0)}%
              {review.reason && ` — ${review.reason}`}
            </span>
          )}
        </div>
        {flagging && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add instructions for regeneration..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Flag comment"
            />
            <button
              onClick={() => {
                if (comment.trim()) {
                  onFlag(block.id, comment.trim());
                  setFlagging(false);
                  setComment("");
                }
              }}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => { setFlagging(false); setComment(""); }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onApprove(block.id)}
          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          aria-label={`Approve block ${block.id}`}
        >
          Approve
        </button>
        <button
          onClick={() => setFlagging(true)}
          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          aria-label={`Flag block ${block.id}`}
        >
          Flag
        </button>
      </div>
    </div>
  );
}
