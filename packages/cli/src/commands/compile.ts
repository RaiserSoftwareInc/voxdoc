import { readFileSync, writeFileSync } from "node:fs";
import { compile, readVoxSource } from "@voxdoc/compiler";

export interface CompileOptions {
  format: "html" | "pdf";
  out?: string;
}

export function compileCommand(
  filePath: string,
  options: CompileOptions,
): void {
  const raw = readFileSync(filePath, "utf-8");
  const doc = readVoxSource(raw);

  if (options.format === "pdf") {
    console.error("PDF export not yet implemented");
    process.exit(1);
  }

  const result = compile(doc);
  if (!result.success) {
    console.error("Compilation errors:");
    for (const err of result.errors ?? []) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  // Default: write back to the same .vox file (re-render in place)
  const outPath = options.out ?? filePath;
  writeFileSync(outPath, result.html!, "utf-8");
  console.log(`Compiled to ${outPath}`);
}
