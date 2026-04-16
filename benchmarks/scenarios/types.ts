export interface BlockDef {
  type: string;
  content: Record<string, unknown>;
}

export interface Scenario {
  name: string;
  description: string;
  blocks: BlockDef[];
  markdown: string;
}

export interface StrategyResult {
  strategy: "markdown" | "individual" | "batch";
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

export interface ScenarioResult {
  scenario: string;
  results: StrategyResult[];
}

export interface BenchmarkReport {
  version: string;
  timestamp: string;
  note: string;
  toolDefsTokens: number;
  scenarios: ScenarioResult[];
}
