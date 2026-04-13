// Entry point for spawning the MCP server as a child process
import { startServer } from "../packages/mcp/dist/index.js";

const filePath = process.argv[2] || process.env.VOX_FILE;
if (!filePath) {
  console.error("Usage: node mcp-server-entry.mjs <file.vox>");
  process.exit(1);
}

await startServer(filePath);
