import assert from "node:assert/strict";
import { small } from "./small.js";

assert(small.blocks.length === 5, `expected 5 blocks, got ${small.blocks.length}`);
assert(typeof small.name === "string" && small.name.length > 0, "name is non-empty string");
assert(typeof small.markdown === "string" && small.markdown.length > 0, "markdown is non-empty string");

for (const block of small.blocks) {
  assert(typeof block.type === "string", `block.type must be string, got ${typeof block.type}`);
  assert(typeof block.content === "object" && block.content !== null, "block.content must be object");
}

console.log("small scenario tests passed ✓");
