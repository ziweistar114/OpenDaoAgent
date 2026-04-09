import fs from "node:fs/promises";
import path from "node:path";
import { ingestLocalDocument } from "./store.js";

type CliOptions = {
  filePath?: string;
  title?: string;
  text?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--file" && next) {
      options.filePath = next;
      index += 1;
      continue;
    }

    if (token === "--title" && next) {
      options.title = next;
      index += 1;
      continue;
    }

    if (token === "--text" && next) {
      options.text = next;
      index += 1;
    }
  }

  return options;
}

async function resolveContent(options: CliOptions): Promise<{ title: string; content: string; fileName?: string }> {
  if (options.filePath) {
    const absolutePath = path.resolve(options.filePath);
    const content = await fs.readFile(absolutePath, "utf8");
    const fileName = path.basename(absolutePath);
    const title = options.title || fileName.replace(/\.[^.]+$/, "");
    return { title, content, fileName };
  }

  if (options.text) {
    return {
      title: options.title || "Imported Note",
      content: options.text
    };
  }

  throw new Error("Usage: npm run ingest:file -- --file <path> [--title <title>] OR --text <text> [--title <title>]");
}

const options = parseArgs(process.argv.slice(2));
const payload = await resolveContent(options);
const result = await ingestLocalDocument(payload);

console.log(`Knowledge document ${result.action}.`);
console.log(`- title: ${result.title}`);
console.log(`- file: ${result.fileName}`);
console.log(`- path: ${result.filePath}`);
console.log(`- language: ${result.document.language}`);
console.log(`- chunks: ${result.document.chunkCount}`);
console.log(`- tags: ${result.document.tags.join(", ")}`);
console.log(`- index: ${result.index.cacheState} | docs=${result.index.documentCount} | chunks=${result.index.chunkCount}`);
