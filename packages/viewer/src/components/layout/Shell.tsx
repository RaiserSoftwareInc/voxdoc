"use client";

import { TopBar } from "./TopBar";
import { ReviewSidebar } from "@/components/review/ReviewSidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6" role="main">
          {children}
        </main>
        <ReviewSidebar />
      </div>
    </div>
  );
}
