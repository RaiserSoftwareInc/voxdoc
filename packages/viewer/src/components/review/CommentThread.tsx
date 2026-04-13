"use client";

import { useState } from "react";
import type { ReviewComment } from "@voxdoc/schema";

interface CommentThreadProps {
  comments: ReviewComment[];
  onSubmit: (comment: string) => void;
}

export function CommentThread({ comments, onSubmit }: CommentThreadProps) {
  const [text, setText] = useState("");

  if (comments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2" aria-label="Comment thread">
      {comments.map((c) => (
        <div
          key={c.id}
          className={`text-sm p-2 rounded ${
            c.resolved
              ? "bg-green-50 dark:bg-green-950 text-gray-500 line-through"
              : "bg-yellow-50 dark:bg-yellow-950"
          }`}
        >
          <p>{c.comment}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(c.created).toLocaleString()}</p>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="New comment"
        />
        <button
          onClick={() => {
            if (text.trim()) {
              onSubmit(text.trim());
              setText("");
            }
          }}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
