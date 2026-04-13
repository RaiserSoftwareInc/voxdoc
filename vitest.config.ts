import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@vox/schema": path.resolve(__dirname, "packages/schema/src/index.ts"),
      "@vox/compiler": path.resolve(
        __dirname,
        "packages/compiler/src/index.ts",
      ),
    },
  },
});
