import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type {
  VoxDocument,
  VoxBlock,
  ReviewComment,
  ReviewStatus,
  DocumentStatus,
} from "@vox/schema";
import { generateBlockId } from "@vox/schema";

export class DocumentStore {
  private doc: VoxDocument;
  private filePath: string | null;
  private comments: ReviewComment[];

  private constructor(doc: VoxDocument, filePath: string | null) {
    this.doc = doc;
    this.filePath = filePath;
    this.comments = doc.comments ? [...doc.comments] : [];
  }

  static createEmpty(title: string): DocumentStore {
    const now = new Date().toISOString();
    const doc: VoxDocument = {
      meta: {
        id: randomUUID(),
        title,
        description: "",
        version: "1.0.0",
        authors: [],
        tags: [],
        status: "draft",
        created: now,
        updated: now,
        variables: {},
        provenance: {
          generated_by: "",
          reviewed_by: "",
          approved_blocks: [],
          flagged_blocks: [],
        },
        accessibility: {
          language: "en",
          reading_level: "general",
        },
      },
      blocks: [],
    };
    return new DocumentStore(doc, null);
  }

  static fromFile(filePath: string): DocumentStore {
    const content = readFileSync(filePath, "utf-8");
    const doc = JSON.parse(content) as VoxDocument;
    return new DocumentStore(doc, filePath);
  }

  save(): void {
    this.doc.meta.updated = new Date().toISOString();
    if (this.comments.length > 0) {
      this.doc.comments = [...this.comments];
    }
    if (this.filePath) {
      writeFileSync(this.filePath, JSON.stringify(this.doc, null, 2), "utf-8");
    }
  }

  getDocument(): VoxDocument {
    return this.doc;
  }

  getBlock(id: string): VoxBlock | undefined {
    return this.doc.blocks.find((b) => b.id === id);
  }

  listBlocks(): Array<{
    id: string;
    type: string;
    preview: string;
    review_status: string | undefined;
  }> {
    return this.doc.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      preview: getBlockPreview(block),
      review_status: block.review?.status,
    }));
  }

  addBlock(
    blockData: Omit<VoxBlock, "id"> & { id?: string },
    afterId?: string,
  ): string {
    const id = blockData.id ?? generateBlockId();
    const block = { ...blockData, id } as VoxBlock;

    if (afterId) {
      const idx = this.doc.blocks.findIndex((b) => b.id === afterId);
      if (idx === -1) {
        this.doc.blocks.push(block);
      } else {
        this.doc.blocks.splice(idx + 1, 0, block);
      }
    } else {
      this.doc.blocks.push(block);
    }

    this.save();
    return id;
  }

  editBlock(id: string, updates: Partial<VoxBlock>): void {
    const idx = this.doc.blocks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error(`Block not found: ${id}`);
    }
    const existing = this.doc.blocks[idx];
    this.doc.blocks[idx] = { ...existing, ...updates, id: existing.id } as VoxBlock;
    this.save();
  }

  deleteBlock(id: string): void {
    const idx = this.doc.blocks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error(`Block not found: ${id}`);
    }
    this.doc.blocks.splice(idx, 1);
    this.save();
  }

  moveBlock(id: string, afterId?: string): void {
    const idx = this.doc.blocks.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error(`Block not found: ${id}`);
    }
    const [block] = this.doc.blocks.splice(idx, 1);

    if (afterId === undefined) {
      this.doc.blocks.unshift(block);
    } else {
      const afterIdx = this.doc.blocks.findIndex((b) => b.id === afterId);
      if (afterIdx === -1) {
        this.doc.blocks.push(block);
      } else {
        this.doc.blocks.splice(afterIdx + 1, 0, block);
      }
    }

    this.save();
  }

  setMetadata(key: string, value: unknown): void {
    (this.doc.meta as unknown as Record<string, unknown>)[key] = value;
    this.save();
  }

  setVariable(key: string, value: string): void {
    this.doc.meta.variables[key] = value;
    this.save();
  }

  searchBlocks(query: string): VoxBlock[] {
    const lower = query.toLowerCase();
    return this.doc.blocks.filter((block) => {
      const content = getBlockSearchableContent(block);
      return content.toLowerCase().includes(lower);
    });
  }

  // ── Review methods (for Task 7) ──

  addComment(blockId: string, comment: string): string {
    const id = `cmt_${randomUUID()}`;
    const reviewComment: ReviewComment = {
      id,
      block_id: blockId,
      comment,
      created: new Date().toISOString(),
      resolved: false,
    };
    this.comments.push(reviewComment);
    this.save();
    return id;
  }

  listComments(): ReviewComment[] {
    return this.comments.filter((c) => !c.resolved);
  }

  resolveComment(commentId: string): void {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      this.save();
    }
  }

  setBlockStatus(id: string, status: ReviewStatus): void {
    const block = this.getBlock(id);
    if (!block) {
      throw new Error(`Block not found: ${id}`);
    }
    if (!block.review) {
      block.review = { confidence: 0, reason: null, status };
    } else {
      block.review.status = status;
    }
    this.save();
  }

  setStatus(status: DocumentStatus): void {
    this.doc.meta.status = status;
    this.save();
  }
}

function getBlockPreview(block: VoxBlock): string {
  if ("content" in block && typeof block.content === "string") {
    return block.content.slice(0, 80);
  }
  if ("items" in block && Array.isArray(block.items)) {
    return block.items.slice(0, 3).join(", ");
  }
  if ("expression" in block) {
    return block.expression.slice(0, 80);
  }
  return `[${block.type}]`;
}

function getBlockSearchableContent(block: VoxBlock): string {
  const parts: string[] = [];
  if ("content" in block && typeof block.content === "string") {
    parts.push(block.content);
  }
  if ("items" in block && Array.isArray(block.items)) {
    parts.push(...block.items);
  }
  if ("expression" in block) {
    parts.push(block.expression);
  }
  if ("title" in block && typeof block.title === "string") {
    parts.push(block.title);
  }
  if ("alt" in block && typeof block.alt === "string") {
    parts.push(block.alt);
  }
  if ("caption" in block && typeof block.caption === "string") {
    parts.push(block.caption);
  }
  if ("description" in block && typeof block.description === "string") {
    parts.push(block.description);
  }
  if ("summary" in block && typeof block.summary === "string") {
    parts.push(block.summary);
  }
  if ("headers" in block && Array.isArray(block.headers)) {
    parts.push(...block.headers);
  }
  return parts.join(" ");
}
