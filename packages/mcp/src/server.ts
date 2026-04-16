import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WorkspaceStore } from "./workspace-store.js";
import { registerWorkspaceTools } from "./tools/workspace.js";
import { registerReadTools } from "./tools/document-reads.js";
import { registerWriteTools } from "./tools/document-writes.js";
import { registerReviewTools } from "./tools/review.js";
import { registerAccessibilityTools } from "./tools/accessibility.js";
import { registerOutputTools } from "./tools/output.js";

export function createVoxMcpServer(pathArg?: string): McpServer {
  const workspace = new WorkspaceStore(pathArg);
  const getWorkspace = () => workspace;
  const getStore = () => workspace.getActiveStore();

  const server = new McpServer({ name: "vox-document", version: "0.1.0" });

  registerWorkspaceTools(server, getWorkspace);
  registerReadTools(server, getStore);
  registerWriteTools(server, getStore);
  registerReviewTools(server, getStore);
  registerAccessibilityTools(server, getStore);
  registerOutputTools(server, getStore);

  return server;
}

export async function startServer(pathArg?: string): Promise<void> {
  const server = createVoxMcpServer(pathArg);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  if (pathArg) {
    console.error(`Vox MCP server running for: ${pathArg}`);
  } else {
    console.error("Vox MCP server running (no workspace — use set_workspace to configure)");
  }
}
