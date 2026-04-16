import assert from "node:assert/strict";
import { large } from "./large.js";

assert(large.blocks.length === 25, `expected 25 blocks, got ${large.blocks.length}`);
assert(typeof large.name === "string" && large.name.length > 0, "name is non-empty string");
assert(typeof large.markdown === "string" && large.markdown.length > 0, "markdown is non-empty string");

const types = large.blocks.map((b) => b.type);
for (const required of ["heading", "paragraph", "code", "callout", "list"]) {
  assert(types.includes(required), `missing block type: ${required}`);
}

for (const block of large.blocks) {
  assert(typeof block.type === "string", `block.type must be string`);
  assert(typeof block.content === "object" && block.content !== null, "block.content must be object");
  assert(Object.keys(block.content).length > 0, `block.content must not be empty (type: ${block.type})`);
}

console.log("large scenario tests passed ✓");
