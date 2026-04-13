import { create } from "zustand";
import type { VoxDocument, VoxBlock } from "@voxdoc/schema";

interface DocumentState {
  document: VoxDocument | null;
  viewMode: "flagged" | "all";
  setDocument: (doc: VoxDocument) => void;
  setViewMode: (mode: "flagged" | "all") => void;
  getVisibleBlocks: () => VoxBlock[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  viewMode: "flagged",
  setDocument: (doc) => set({ document: doc }),
  setViewMode: (mode) => set({ viewMode: mode }),
  getVisibleBlocks: () => {
    const { document, viewMode } = get();
    if (!document) return [];
    if (viewMode === "all") return document.blocks;
    return document.blocks.filter(
      (b) => !b.review || b.review.status === "flagged" || b.review.status === "pending"
    );
  },
}));
