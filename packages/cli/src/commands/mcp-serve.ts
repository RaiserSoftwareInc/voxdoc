import { startServer } from "@voxdoc/mcp";
import path from "node:path";
import { statSync } from "node:fs";

export async function mcpServeCommand(pathArg: string): Promise<void> {
  const absPath = path.resolve(pathArg);
  const isDir = statSync(absPath).isDirectory();

  console.log(
    `Starting Vox MCP server for: ${absPath}${isDir ? " (workspace)" : ""}`,
  );
  console.log(`\nAdd to your Claude config:`);
  console.log(
    JSON.stringify(
      {
        mcpServers: {
          "vox-document": {
            command: "vox",
            args: ["mcp", "serve", absPath],
          },
        },
      },
      null,
      2,
    ),
  );

  if (isDir) {
    console.log(`\nWorkspace mode — AI can list, open, and create documents in this directory.`);
  }

  console.log(`\nWaiting for AI connection...`);
  await startServer(absPath);
}
