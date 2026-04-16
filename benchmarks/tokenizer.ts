import { get_encoding } from "tiktoken";

// Allocated once at module load; free() omitted — benchmark script exits after run
const enc = get_encoding("cl100k_base");

export function countTokens(value: unknown): number {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return enc.encode(text).length;
}
