import { readFileSync, writeFileSync } from "node:fs";
import type { VoxDocument } from "@vox/schema";
import { compile } from "@vox/compiler";

export interface CompileOptions {
  format: "html" | "pdf";
  out?: string;
}

export function compileCommand(
  filePath: string,
  options: CompileOptions,
): void {
  const raw = readFileSync(filePath, "utf-8");
  const doc: VoxDocument = JSON.parse(raw);

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

  const outPath =
    options.out ?? filePath.replace(/\.(json|vox)$/, ".html");
  writeFileSync(outPath, result.html!, "utf-8");
  console.log(`Compiled to ${outPath}`);
}
