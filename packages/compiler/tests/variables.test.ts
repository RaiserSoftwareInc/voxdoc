import { describe, it, expect } from "vitest";
import { resolveVariables } from "../src/variables.js";

describe("resolveVariables", () => {
  it("replaces {{var}} in text", () => {
    const result = resolveVariables("Hello {{name}}, version {{version}}", {
      name: "World",
      version: "2.0",
    });
    expect(result).toBe("Hello World, version 2.0");
  });

  it("leaves unknown variables as-is", () => {
    const result = resolveVariables("Hello {{name}}, {{unknown}}", {
      name: "World",
    });
    expect(result).toBe("Hello World, {{unknown}}");
  });

  it("handles text with no variables", () => {
    const result = resolveVariables("No variables here", { foo: "bar" });
    expect(result).toBe("No variables here");
  });

  it("handles empty variables object", () => {
    const result = resolveVariables("Hello {{name}}", {});
    expect(result).toBe("Hello {{name}}");
  });
});
