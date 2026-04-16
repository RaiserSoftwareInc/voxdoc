import { get_encoding } from "tiktoken";

const enc = get_encoding("cl100k_base");

export function countTokens(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return enc.encode(text).length;
}
