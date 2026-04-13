import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import open from "open";

export async function viewCommand(filePath: string): Promise<void> {
  const absPath = path.resolve(filePath);
  const raw = fs.readFileSync(absPath, "utf-8");
  const doc = JSON.parse(raw);

  const server = http.createServer((req, res) => {
    // CORS headers for viewer dev server
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/api/document") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(doc));
      return;
    }

    // Serve a minimal info page
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vox Viewer — ${doc.meta.title}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a2e; }
  h1 { color: #6366f1; }
  .badge { display: inline-block; padding: 0.2em 0.6em; border-radius: 1em; font-size: 0.75em; background: #fef9c3; color: #92400e; }
  pre { background: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; }
  .info { display: grid; grid-template-columns: auto 1fr; gap: 0.25em 1em; }
  .info dt { font-weight: 600; color: #6b7280; }
</style>
</head>
<body>
<h1>${doc.meta.title} <span class="badge">${doc.meta.status}</span></h1>
<dl class="info">
  <dt>Version</dt><dd>${doc.meta.version}</dd>
  <dt>Blocks</dt><dd>${doc.blocks.length}</dd>
  <dt>Authors</dt><dd>${doc.meta.authors.join(", ") || "\u2014"}</dd>
  <dt>Language</dt><dd>${doc.meta.accessibility.language}</dd>
</dl>
<h2>API</h2>
<p>Document JSON available at <a href="/api/document"><code>/api/document</code></a></p>
<h2>Compile</h2>
<p>Run <code>vox compile ${filePath} --format html</code> for the full rendered document.</p>
<p><em>Full viewer UI at <code>packages/viewer</code> — run <code>pnpm --filter @vox/viewer dev</code></em></p>
</body>
</html>`);
  });

  const port = 4400;
  server.listen(port, () => {
    console.log(`Vox viewer running at http://localhost:${port}`);
    console.log(`Document: ${absPath}`);
    console.log(`API endpoint: http://localhost:${port}/api/document`);
    open(`http://localhost:${port}`);
  });
}
