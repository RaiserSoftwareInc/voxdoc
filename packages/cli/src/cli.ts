import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initCommand } from "./commands/init.js";
import { validateCommand } from "./commands/validate.js";
import { compileCommand } from "./commands/compile.js";
import { infoCommand } from "./commands/info.js";
import { blocksCommand } from "./commands/blocks.js";
import { mcpServeCommand } from "./commands/mcp-serve.js";
import { mcpInstallCommand } from "./commands/mcp-install.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

export function createCli(): Command {
  const program = new Command();
  program
    .name("vox")
    .description("Vox — Documents with a voice")
    .version(pkg.version);

  program
    .command("init <output>")
    .description("Create a new Vox document")
    .option("-t, --title <title>", "Document title", "Untitled Document")
    .action((output: string, opts: { title: string }) =>
      initCommand(output, { title: opts.title }),
    );

  program
    .command("validate <file>")
    .description("Validate a Vox document")
    .action((file: string) => validateCommand(file));

  program
    .command("compile <file>")
    .description("Compile a Vox document to HTML")
    .option("-f, --format <format>", "Output format (html|pdf)", "html")
    .option("-o, --out <path>", "Output file path")
    .action((file: string, opts: { format: "html" | "pdf"; out?: string }) =>
      compileCommand(file, { format: opts.format, out: opts.out }),
    );

  program
    .command("info <file>")
    .description("Display document metadata")
    .action((file: string) => infoCommand(file));

  program
    .command("blocks <file>")
    .description("List all blocks")
    .action((file: string) => blocksCommand(file));

  const mcpCmd = program.command("mcp").description("MCP server commands");
  mcpCmd
    .command("serve [path]")
    .description("Start MCP server for a document or directory (omit path for dynamic workspace)")
    .action((path?: string) => mcpServeCommand(path));

  mcpCmd
    .command("install [path]")
    .description("Register Vox MCP server with Claude")
    .action((path?: string) => mcpInstallCommand(path));

  return program;
}
