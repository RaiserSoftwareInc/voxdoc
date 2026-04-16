import { execSync } from "node:child_process";
import path from "node:path";

export async function mcpInstallCommand(pathArg?: string): Promise<void> {
  const args = ["mcp", "serve"];
  if (pathArg) {
    args.push(path.resolve(pathArg));
  }

  const claudeArgs = [
    "mcp", "add",
    "vox-document",
    "--",
    "vox",
    ...args,
  ];

  console.log(`Registering Vox MCP server with Claude...`);
  console.log(`Running: claude ${claudeArgs.join(" ")}\n`);

  try {
    execSync(`claude ${claudeArgs.join(" ")}`, { stdio: "inherit" });
    console.log(`\nDone! Restart Claude to use Vox.`);
  } catch {
    console.error(
      `\nFailed to register. Make sure Claude CLI is installed:\n  npm install -g @anthropic-ai/claude-code`,
    );
    process.exit(1);
  }
}
