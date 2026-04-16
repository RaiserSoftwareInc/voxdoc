# Benchmark Harness Design

**Date:** 2026-04-16
**Status:** Approved

## Goal

Prove (or disprove) that voxdoc's batch MCP tools reduce token usage compared to individual tool calls and raw Markdown. Produce reproducible, credible numbers for internal validation and public developer documentation.

## Audiences

- **Internal:** sanity check that batch tools deliver the claimed ~80% reduction
- **External:** published benchmark developers can reproduce with `pnpm benchmark`

## Approach

Tokenizer-based measurement using a local tokenizer library (no API key, no cost). Spin up the real voxdoc MCP server, make actual tool calls, capture request/response JSON, tokenize those payloads. Compare against the equivalent Markdown representation of the same content.

## Three-Way Comparison

| Strategy | Description |
|---|---|
| Markdown baseline | Same document content as raw `.md` text |
| Voxdoc individual | N separate `add_block` calls (one block each) |
| Voxdoc batch | One `add_block` call with N blocks |

The delta between strategies is what matters. Tokenizer must be consistent — absolute accuracy matters less than ratio accuracy.

## File Structure

```
benchmarks/
  run.ts                  ← CLI entry point, orchestrates all scenarios, writes results
  tokenizer.ts            ← thin wrapper: countTokens(json: unknown) -> number
  scenarios/
    small.ts              ← 5-block scenario (headings + paragraphs)
    large.ts              ← 25-block scenario (mixed block types)
  results/
    latest.json           ← committed benchmark output
```

Lives at repo root. Not a package. Runs via `pnpm benchmark` using `tsx`.

## Scenarios

### Small (5 blocks)
- 1 heading + 4 paragraphs
- Tests basic batch vs individual overhead on minimal document

### Large (25 blocks)
- Mix: headings, paragraphs, code blocks, callouts, lists
- Tests realistic authoring session token cost

Both scenarios define:
1. The voxdoc block definitions (used for MCP tool calls)
2. The equivalent Markdown string (used for baseline measurement)

## Data Flow

```
1. Spin up MCP server (child process)
2. Connect MCP client
3. Run Markdown baseline: tokenize the .md string directly
4. Run individual strategy:
   - Call add_block N times (1 block each)
   - Capture each request + response JSON
   - Tokenize all payloads, sum
5. Reset document
6. Run batch strategy:
   - Call add_block once (N blocks)
   - Capture request + response JSON
   - Tokenize
7. Record: input tokens, output tokens, total tokens, % vs markdown, call count
8. Disconnect, kill server
9. Repeat for large scenario
10. Write results to benchmarks/results/latest.json
```

## Output

### Console

```
Voxdoc Token Benchmark
voxdoc v0.2.2 · 2026-04-16

Scenario: small (5 blocks)
  Markdown baseline    842 tokens
  Voxdoc individual   1,204 tokens   (+43% vs markdown)
  Voxdoc batch          198 tokens   (-76% vs markdown) ✓

Scenario: large (25 blocks)
  Markdown baseline   3,210 tokens
  Voxdoc individual   5,890 tokens   (+83% vs markdown)
  Voxdoc batch          680 tokens   (-79% vs markdown) ✓

Results saved to benchmarks/results/latest.json
```

### latest.json

Structured JSON with: voxdoc version, timestamp, per-scenario breakdown (tokens per strategy, tokens per individual call, call counts). Format designed for easy import into charting tools (Excel, Google Sheets, Plotly, Chart.js).

## pnpm Script

Add to root `package.json`:
```json
"benchmark": "pnpm -r build && tsx benchmarks/run.ts"
```

Build runs first — same requirement as test suite.

## Error Handling

- MCP server fails to start: hard exit, non-zero code, clear error message
- Tokenizer lib missing: startup check, install instruction printed
- No retry logic — deterministic inputs should not flake

## Out of Scope

- HTML report generation (future)
- CI token regression check (future)
- Benchmarking tools other than `add_block` (future)
