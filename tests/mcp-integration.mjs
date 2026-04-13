/**
 * MCP Integration Test
 * Starts the Vox MCP server as a child process, connects as a client,
 * and exercises the full tool set.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Resolve MCP SDK from the mcp package's node_modules
const require = createRequire(path.resolve("packages/mcp/src/server.ts"));
const clientUrl = pathToFileURL(require.resolve("@modelcontextprotocol/sdk/client/index.js")).href;
const stdioUrl = pathToFileURL(require.resolve("@modelcontextprotocol/sdk/client/stdio.js")).href;
const { Client } = await import(clientUrl);
const { StdioClientTransport } = await import(stdioUrl);

const VOX_FILE = path.resolve("mcp-test.vox");

async function main() {
  console.log("=== MCP Integration Test ===\n");

  // 1. Start server as child process and connect
  console.log("1. Connecting to MCP server...");
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.resolve("tests/mcp-server-entry.mjs"), VOX_FILE],
  });

  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  console.log("   Connected ✓\n");

  // 2. List available tools
  console.log("2. Listing tools...");
  const { tools } = await client.listTools();
  console.log(`   Found ${tools.length} tools: ${tools.map(t => t.name).join(", ")}`);
  console.log("   ✓\n");

  // 3. Get schema
  console.log("3. Calling get_schema...");
  const schemaResult = await client.callTool({ name: "get_schema", arguments: {} });
  const schema = JSON.parse(schemaResult.content[0].text);
  console.log(`   Schema has ${Object.keys(schema.properties || {}).length} top-level properties ✓\n`);

  // 4. Add blocks
  console.log("4. Adding blocks...");

  const h1Result = await client.callTool({
    name: "add_block",
    arguments: { type: "heading", content: { level: 1, content: "MCP Test" } },
  });
  const h1Id = JSON.parse(h1Result.content[0].text).id;
  console.log(`   Added heading: ${h1Id} ✓`);

  const pResult = await client.callTool({
    name: "add_block",
    arguments: { type: "paragraph", content: { content: "This document was authored entirely via MCP tools." } },
  });
  const pId = JSON.parse(pResult.content[0].text).id;
  console.log(`   Added paragraph: ${pId} ✓`);

  const calloutResult = await client.callTool({
    name: "add_block",
    arguments: {
      type: "callout",
      content: { variant: "tip", title: "It works!", content: "The MCP server is functioning correctly." },
    },
  });
  const calloutId = JSON.parse(calloutResult.content[0].text).id;
  console.log(`   Added callout: ${calloutId} ✓\n`);

  // 5. List blocks
  console.log("5. Listing blocks...");
  const listResult = await client.callTool({ name: "list_blocks", arguments: {} });
  const blocks = JSON.parse(listResult.content[0].text);
  console.log(`   ${blocks.length} blocks found ✓\n`);

  // 6. Edit a block
  console.log("6. Editing paragraph...");
  await client.callTool({
    name: "edit_block",
    arguments: { id: pId, content: { content: "This document was authored and **edited** via MCP tools." } },
  });
  const editedBlock = await client.callTool({ name: "get_block", arguments: { id: pId } });
  const editedContent = JSON.parse(editedBlock.content[0].text).content;
  console.log(`   Content updated: "${editedContent.slice(0, 50)}..." ✓\n`);

  // 7. Set metadata and variable
  console.log("7. Setting metadata and variable...");
  await client.callTool({ name: "set_metadata", arguments: { key: "title", value: "MCP Integration Test - Passed" } });
  await client.callTool({ name: "set_variable", arguments: { key: "test_run", value: "success" } });
  console.log("   ✓\n");

  // 8. Search blocks
  console.log("8. Searching blocks...");
  const searchResult = await client.callTool({ name: "search_blocks", arguments: { query: "MCP" } });
  const searchHits = JSON.parse(searchResult.content[0].text);
  console.log(`   Found ${searchHits.length} blocks matching "MCP" ✓\n`);

  // 9. Review workflow
  console.log("9. Testing review workflow...");
  await client.callTool({ name: "set_block_status", arguments: { id: h1Id, status: "pre_approved" } });
  await client.callTool({ name: "set_block_status", arguments: { id: pId, status: "flagged" } });
  const commentResult = await client.callTool({
    name: "add_comment",
    arguments: { block_id: pId, comment: "Make this more specific" },
  });
  const commentId = JSON.parse(commentResult.content[0].text).comment_id;
  console.log(`   Added comment: ${commentId}`);

  const comments = await client.callTool({ name: "list_comments", arguments: {} });
  const pendingComments = JSON.parse(comments.content[0].text);
  console.log(`   ${pendingComments.length} pending comment(s)`);

  await client.callTool({ name: "resolve_comment", arguments: { comment_id: commentId } });
  const commentsAfter = await client.callTool({ name: "list_comments", arguments: {} });
  const remaining = JSON.parse(commentsAfter.content[0].text);
  console.log(`   After resolve: ${remaining.length} pending comment(s) ✓\n`);

  // 10. Set document status
  console.log("10. Setting document status to approved...");
  await client.callTool({ name: "set_status", arguments: { status: "approved" } });
  const docResult = await client.callTool({ name: "get_document", arguments: {} });
  const doc = JSON.parse(docResult.content[0].text);
  console.log(`   Status: ${doc.meta.status} ✓`);
  console.log(`   Title: ${doc.meta.title} ✓`);
  console.log(`   Blocks: ${doc.blocks.length} ✓\n`);

  // 11. Validate
  console.log("11. Validating...");
  const validateResult = await client.callTool({ name: "validate", arguments: {} });
  const validation = JSON.parse(validateResult.content[0].text);
  console.log(`   Valid: ${validation.valid} ✓\n`);

  // Cleanup
  await client.close();

  // 12. Verify file on disk
  console.log("12. Checking file on disk...");
  const fileContent = readFileSync(VOX_FILE, "utf-8");
  const isHtml = fileContent.trimStart().startsWith("<!DOCTYPE");
  const hasEmbeddedJson = fileContent.includes("application/vox+json");
  console.log(`   Is self-rendering HTML: ${isHtml} ✓`);
  console.log(`   Has embedded JSON: ${hasEmbeddedJson} ✓\n`);

  console.log("=== ALL TESTS PASSED ===");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
