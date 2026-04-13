import type { VoxBlock } from "@vox/schema";
import { Heading } from "./Heading";
import { Paragraph } from "./Paragraph";
import { Code } from "./Code";
import { Callout } from "./Callout";
import { Table } from "./Table";
import { Diagram } from "./Diagram";
import { Image } from "./Image";
import { List } from "./List";
import { Tabs } from "./Tabs";
import { Accordion } from "./Accordion";
import { Math } from "./Math";
import { Steps } from "./Steps";
import { Layout } from "./Layout";
import { Handwriting } from "./Handwriting";

export function BlockRenderer({ block }: { block: VoxBlock }) {
  switch (block.type) {
    case "heading":
      return <Heading block={block} />;
    case "paragraph":
      return <Paragraph block={block} />;
    case "code":
      return <Code block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "table":
      return <Table block={block} />;
    case "diagram":
      return <Diagram block={block} />;
    case "image":
      return <Image block={block} />;
    case "list":
      return <List block={block} />;
    case "tabs":
      return <Tabs block={block} />;
    case "accordion":
      return <Accordion block={block} />;
    case "math":
      return <Math block={block} />;
    case "steps":
      return <Steps block={block} />;
    case "layout":
      return <Layout block={block} />;
    case "handwriting":
      return <Handwriting block={block} />;
    case "toc":
      return (
        <nav className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded" role="navigation" aria-label="Table of contents">
          <p className="text-sm text-gray-500">[Table of Contents — rendered at compile time]</p>
        </nav>
      );
    case "include":
      return (
        <div className="my-4 p-4 border border-dashed border-gray-400 rounded text-sm text-gray-500" role="note">
          Include: {block.src}{block.section ? ` (section: ${block.section})` : ""}
        </div>
      );
    case "variable_def":
      return (
        <div className="my-2 text-xs text-gray-400 font-mono" role="note" aria-label={`Variable: ${block.key}`}>
          ${"{" + block.key + "}"} = {block.value}
        </div>
      );
    case "xref":
      return (
        <span className="text-blue-500 underline text-sm" role="link" aria-label={`Cross-reference to ${block.target}`}>
          [xref: {block.target}]
        </span>
      );
    default: {
      const _exhaustive: never = block;
      return <div className="text-red-500">Unknown block type: {(_exhaustive as VoxBlock).type}</div>;
    }
  }
}
