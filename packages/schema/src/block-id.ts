import { nanoid } from "nanoid";

export function generateBlockId(): string {
  return `blk_${nanoid(12)}`;
}
