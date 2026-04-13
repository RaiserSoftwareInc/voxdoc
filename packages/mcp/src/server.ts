import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DocumentStore } from "./document-store.js";
import { registerReadTools } from "./tools/document-reads.js";
import { registerWriteTools } from "./tools/document-writes.js";

export function createVoxMcpServer(filePath: string): McpServer {
  const store = DocumentStore.fromFile(filePath);
  const getStore = () => store;
  const server = new McpServer({ name: "vox-document", version: "0.1.0" });
  registerReadTools(server, getStore);
  registerWriteTools(server, getStore);
  return server;
}

export async function startServer(filePath: string): Promise<void> {
  const server = createVoxMcpServer(filePath);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Vox MCP server running for: ${filePath}`);
}
