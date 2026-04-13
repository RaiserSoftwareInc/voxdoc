import { startServer } from "@vox/mcp";
import path from "node:path";

export async function mcpServeCommand(filePath: string): Promise<void> {
  const absPath = path.resolve(filePath);
  console.log(`Starting Vox MCP server for: ${absPath}`);
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
  console.log(`\nWaiting for AI connection...`);
  await startServer(absPath);
}
