import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import open from "open";
import { readVoxSource } from "@voxdoc/compiler";

export async function viewCommand(filePath: string): Promise<void> {
  const absPath = path.resolve(filePath);
  const raw = fs.readFileSync(absPath, "utf-8");

  // Check if the file is already self-rendering HTML
  const isHtml = raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html");

  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/api/document") {
      const doc = readVoxSource(fs.readFileSync(absPath, "utf-8"));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(doc));
      return;
    }

    if (isHtml) {
      // Self-rendering .vox — serve the file directly
      const content = fs.readFileSync(absPath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    } else {
      // Legacy JSON .vox — compile on the fly
      const { compile } = require("@voxdoc/compiler");
      const doc = readVoxSource(raw);
      const result = compile(doc);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(result.success ? result.html : `<pre>Compile error: ${result.errors?.join("\n")}</pre>`);
    }
  });

  const port = 4400;
  server.listen(port, () => {
    console.log(`Vox viewer running at http://localhost:${port}`);
    console.log(`Document: ${absPath}`);
    console.log(`API endpoint: http://localhost:${port}/api/document`);
    open(`http://localhost:${port}`);
  });
}
