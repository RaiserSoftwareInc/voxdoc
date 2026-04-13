import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { DocumentStore } from "./document-store.js";

export class WorkspaceStore {
  private dir: string;
  private stores: Map<string, DocumentStore> = new Map();
  private activeFile: string | null = null;

  constructor(pathArg: string) {
    const stat = statSync(pathArg);
    if (stat.isDirectory()) {
      this.dir = pathArg;
      // Auto-open the first .vox file if there's only one
      const files = this.listFiles();
      if (files.length === 1) {
        this.activeFile = files[0];
      }
    } else {
      // Single file — treat parent as dir, file as active
      this.dir = path.dirname(pathArg);
      this.activeFile = path.basename(pathArg);
    }
  }

  listFiles(): string[] {
    try {
      return readdirSync(this.dir)
        .filter((f) => f.endsWith(".vox"))
        .sort();
    } catch {
      return [];
    }
  }

  listDocuments(): Array<{
    filename: string;
    title: string;
    status: string;
    blocks: number;
    active: boolean;
  }> {
    return this.listFiles().map((filename) => {
      const store = this.getStoreForFile(filename);
      const doc = store.getDocument();
      return {
        filename,
        title: doc.meta.title,
        status: doc.meta.status,
        blocks: doc.blocks.length,
        active: filename === this.activeFile,
      };
    });
  }

  openDocument(filename: string): DocumentStore {
    if (!this.listFiles().includes(filename)) {
      throw new Error(`File not found in workspace: ${filename}`);
    }
    this.activeFile = filename;
    return this.getStoreForFile(filename);
  }

  createDocument(filename: string, title: string): DocumentStore {
    if (!filename.endsWith(".vox")) {
      filename = filename + ".vox";
    }
    const filePath = path.join(this.dir, filename);
    const store = DocumentStore.createEmpty(title);
    // Set file path and save
    (store as any).filePath = filePath;
    store.save();
    this.stores.set(filename, store);
    this.activeFile = filename;
    return store;
  }

  getActiveStore(): DocumentStore {
    if (!this.activeFile) {
      throw new Error(
        "No active document. Use list_documents to see available files, then open_document to select one.",
      );
    }
    return this.getStoreForFile(this.activeFile);
  }

  getActiveFilename(): string | null {
    return this.activeFile;
  }

  getDir(): string {
    return this.dir;
  }

  private getStoreForFile(filename: string): DocumentStore {
    let store = this.stores.get(filename);
    if (!store) {
      const filePath = path.join(this.dir, filename);
      store = DocumentStore.fromFile(filePath);
      this.stores.set(filename, store);
    }
    return store;
  }
}
