import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { countTokens } from "./tokenizer.js";
import type { BlockDef, StrategyResult } from "./scenarios/types.js";

const SERVER_ENTRY = fileURLToPath(new URL("../tests/mcp-server-entry.mjs", import.meta.url));

function makeEmptyVox(): string {
  const now = new Date().toISOString();
  return JSON.stringify({
    meta: {
      id: randomUUID(),
      title: "Benchmark",
      description: "",
      version: "1.0.0",
      authors: [],
      tags: [],
      status: "draft",
      created: now,
      updated: now,
      variables: {},
      provenance: {
        generated_by: "",
        reviewed_by: "",
        approved_blocks: [],
        flagged_blocks: [],
      },
      accessibility: {
        language: "en",
        reading_level: "general",
      },
    },
    blocks: [],
  });
}

function buildRequest(toolName: string, args: unknown): object {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };
}

function buildResponse(result: unknown): object {
  return { jsonrpc: "2.0", id: 1, result };
}

async function withMcpServer<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const tmpDir = mkdtempSync(join(tmpdir(), "voxbench-"));
  const tmpFile = join(tmpDir, "doc.vox");
  writeFileSync(tmpFile, makeEmptyVox());

  const transport = new StdioClientTransport({
    command: "node",
    args: [SERVER_ENTRY, tmpFile],
  });

  const client = new Client({ name: "benchmark", version: "1.0.0" });
  await client.connect(transport);

  try {
    return await fn(client);
  } finally {
    await client.close();
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

export async function runIndividual(blocks: BlockDef[]): Promise<StrategyResult> {
  return withMcpServer(async (client) => {
    let inputTokens = 0;
    let outputTokens = 0;

    for (const block of blocks) {
      const args = { blocks: [block] };
      const req = buildRequest("add_block", args);
      const result = await client.callTool({ name: "add_block", arguments: args });
      const res = buildResponse(result);
      inputTokens += countTokens(req);
      outputTokens += countTokens(res);
    }

    return {
      strategy: "individual",
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      callCount: blocks.length,
    };
  });
}

export async function runBatch(blocks: BlockDef[]): Promise<StrategyResult> {
  return withMcpServer(async (client) => {
    const args = { blocks };
    const req = buildRequest("add_block", args);
    const result = await client.callTool({ name: "add_block", arguments: args });
    const res = buildResponse(result);

    const inputTokens = countTokens(req);
    const outputTokens = countTokens(res);

    return {
      strategy: "batch",
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      callCount: 1,
    };
  });
}

export function runMarkdown(markdown: string): StrategyResult {
  const tokens = countTokens(markdown);
  return {
    strategy: "markdown",
    inputTokens: tokens,
    outputTokens: 0,
    totalTokens: tokens,
    callCount: 1,
  };
}
