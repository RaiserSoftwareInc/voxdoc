import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { runIndividual, runBatch, runMarkdown } from "./mcp-runner.js";
import { small } from "./scenarios/small.js";
import { large } from "./scenarios/large.js";
import type { BenchmarkReport, ScenarioResult } from "./scenarios/types.js";

const req = createRequire(import.meta.url);
const { version } = req("../packages/mcp/package.json") as { version: string };

function fmt(n: number): string {
  return n.toLocaleString("en-US").padStart(7);
}

function pct(n: number, baseline: number): string {
  if (baseline === 0) return "N/A";
  const diff = ((n - baseline) / baseline) * 100;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(0)}%`;
}

function calls(n: number): string {
  return `${n} ${n === 1 ? "call" : "calls"}`;
}

async function main(): Promise<void> {
  const scenarios = [small, large];
  const scenarioResults: ScenarioResult[] = [];

  console.log("Voxdoc Token Benchmark");
  console.log(`voxdoc v${version} · ${new Date().toISOString().slice(0, 10)}`);
  console.log("Note: token counts use cl100k_base (tiktoken). Ratios accurate; absolutes ~5% approximate.\n");

  for (const scenario of scenarios) {
    console.log(`Scenario: ${scenario.name} (${scenario.blocks.length} blocks)`);

    const markdown = runMarkdown(scenario.markdown);
    const individual = await runIndividual(scenario.blocks);
    const batch = await runBatch(scenario.blocks);

    const mdTokens = markdown.totalTokens;

    console.log(`  Markdown baseline ${fmt(mdTokens)} tokens`);
    console.log(`  Voxdoc individual ${fmt(individual.totalTokens)} tokens  (${pct(individual.totalTokens, mdTokens)} vs markdown, ${calls(individual.callCount)})`);
    console.log(`  Voxdoc batch      ${fmt(batch.totalTokens)} tokens  (${pct(batch.totalTokens, mdTokens)} vs markdown, ${calls(batch.callCount)}) ✓`);
    console.log();

    scenarioResults.push({
      scenario: scenario.name,
      results: [markdown, individual, batch],
    });
  }

  const report: BenchmarkReport = {
    version,
    timestamp: new Date().toISOString(),
    note: "Token counts use cl100k_base encoding (tiktoken). Ratios between strategies are accurate; absolute values may differ from Claude's actual counts by ~5%.",
    scenarios: scenarioResults,
  };

  const outDir = fileURLToPath(new URL("./results", import.meta.url));
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "latest.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Results saved to benchmarks/results/latest.json`);
}

main().catch((err: unknown) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
