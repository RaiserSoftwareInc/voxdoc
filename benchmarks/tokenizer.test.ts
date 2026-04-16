import assert from "node:assert/strict";
import { countTokens } from "./tokenizer.js";

const shortCount = countTokens("Hi");
const longCount = countTokens("Hello, world! This is a longer sentence with more words.");
const objCount = countTokens({ name: "add_block", arguments: { blocks: [] } });

assert(typeof shortCount === "number", "returns a number");
assert(shortCount > 0, "returns positive integer for short string");
assert(longCount > shortCount, "longer input produces more tokens");
assert(typeof objCount === "number", "accepts objects (tokenizes as JSON)");
assert(objCount > 0, "returns positive integer for object");

console.log(`tokenizer tests passed ✓  (short=${shortCount}, long=${longCount}, obj=${objCount})`);
