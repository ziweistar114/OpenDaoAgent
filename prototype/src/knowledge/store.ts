import fs from "node:fs/promises";
import path from "node:path";
import { knowledgeDirPath, prototypeRoot } from "../core/paths.js";
import type {
  AgentQuery,
  KnowledgeIndexStatus,
  KnowledgeItem,
  KnowledgeRetrievalResult,
  RetrievedKnowledge
} from "../shared/types.js";

const knowledgeSeed: KnowledgeItem[] = [
  {
    id: "k-1",
    title: "Phase 1 MVP",
    summary: "Phase 1 focuses on local deployment, persistent memory, authorized knowledge ingestion, basic orchestration, and safe tool boundaries.",
    tags: ["phase1", "mvp", "memory", "knowledge", "tools"],
    source: "docs/FIRST_MVP.md#chunk-1",
    chunkIndex: 1
  },
  {
    id: "k-2",
    title: "Architecture",
    summary: "The first architecture layers are interaction, orchestration, memory, knowledge, tools, and audit-oriented deployment.",
    tags: ["architecture", "orchestrator", "knowledge", "memory", "tools"],
    source: "docs/ARCHITECTURE.md#chunk-1",
    chunkIndex: 1
  }
];

const knowledgeIndexCachePath = path.join(knowledgeDirPath, ".index-cache.json");

type KnowledgeCacheDocument = {
  fileName: string;
  sourcePath: string;
  mtimeMs: number;
  size: number;
};

type KnowledgeIndexCache = {
  version: 1;
  builtAt: string;
  documents: KnowledgeCacheDocument[];
  items: KnowledgeItem[];
};

function scoreText(query: string, candidate: string, tags: string[]): number {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (candidate.toLowerCase().includes(token)) score += 2;
    if (tags.some((tag) => tag.toLowerCase().includes(token))) score += 1;
  }
  return score;
}

function extractTitle(content: string, fallback: string): string {
  const firstHeading = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  if (firstHeading) {
    return firstHeading.replace(/^#\s+/, "").trim();
  }

  return fallback;
}

function extractSummary(content: string): string {
  const normalized = content
    .replace(/^#.*$/gm, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.slice(0, 220);
}

function cleanChunkText(content: string): string {
  return content
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoChunks(content: string): string[] {
  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => cleanChunkText(part));

  const chunks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer} ${paragraph}` : paragraph;
    if (candidate.length <= 220) {
      buffer = candidate;
      continue;
    }

    if (buffer) {
      chunks.push(buffer);
    }

    if (paragraph.length <= 220) {
      buffer = paragraph;
    } else {
      for (let index = 0; index < paragraph.length; index += 180) {
        chunks.push(paragraph.slice(index, index + 180).trim());
      }
      buffer = "";
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks.length ? chunks : [extractSummary(content)];
}

function extractTags(fileName: string, content: string): string[] {
  const fromName = fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  const fromContent = content
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4)
    .slice(0, 8);

  return Array.from(new Set([...fromName, ...fromContent])).slice(0, 12);
}

function slugifyFileName(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `doc-${Date.now()}`;
}

function toProjectRelativePath(filePath: string): string {
  return path.relative(prototypeRoot, filePath).replace(/\\/g, "/");
}

function buildIndexStatus(
  cacheState: KnowledgeIndexStatus["cacheState"],
  documentCount: number,
  chunkCount: number,
  lastBuiltAt?: string
): KnowledgeIndexStatus {
  return {
    cacheFile: toProjectRelativePath(knowledgeIndexCachePath),
    cacheState,
    documentCount,
    chunkCount,
    lastBuiltAt
  };
}

function documentsMatch(current: KnowledgeCacheDocument[], cached: KnowledgeCacheDocument[]): boolean {
  if (current.length !== cached.length) {
    return false;
  }

  return current.every((item, index) => {
    const target = cached[index];
    return (
      target &&
      item.fileName === target.fileName &&
      item.sourcePath === target.sourcePath &&
      item.mtimeMs === target.mtimeMs &&
      item.size === target.size
    );
  });
}

async function ensureKnowledgeDir(): Promise<void> {
  await fs.mkdir(knowledgeDirPath, { recursive: true });

  const entries = await fs.readdir(knowledgeDirPath);
  if (entries.length > 0) return;

  await fs.writeFile(
    path.join(knowledgeDirPath, "phase1-overview.md"),
    [
      "# Phase 1 Overview",
      "",
      "Phase 1 should stay local-first, memory-driven, and small in scope.",
      "The prototype should focus on persistent memory, authorized knowledge ingestion, safe tool boundaries, and clear orchestration."
    ].join("\n"),
    "utf8"
  );

  await fs.writeFile(
    path.join(knowledgeDirPath, "architecture-notes.md"),
    [
      "# Architecture Notes",
      "",
      "The first layers are interaction, orchestration, memory, knowledge, tools, and audit-oriented deployment.",
      "The next step is to replace seed retrieval with real local storage and document ingestion."
    ].join("\n"),
    "utf8"
  );
}

async function listKnowledgeDocuments(): Promise<KnowledgeCacheDocument[]> {
  const entries = await fs.readdir(knowledgeDirPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name));

  const documents = await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(knowledgeDirPath, entry.name);
      const stats = await fs.stat(filePath);

      return {
        fileName: entry.name,
        sourcePath: toProjectRelativePath(filePath),
        mtimeMs: stats.mtimeMs,
        size: stats.size
      } satisfies KnowledgeCacheDocument;
    })
  );

  return documents.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function readKnowledgeCache(): Promise<KnowledgeIndexCache | null> {
  try {
    const raw = await fs.readFile(knowledgeIndexCachePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<KnowledgeIndexCache>;

    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.documents) ||
      !Array.isArray(parsed.items) ||
      typeof parsed.builtAt !== "string"
    ) {
      return null;
    }

    return {
      version: 1,
      builtAt: parsed.builtAt,
      documents: parsed.documents as KnowledgeCacheDocument[],
      items: parsed.items as KnowledgeItem[]
    };
  } catch {
    return null;
  }
}

async function writeKnowledgeCache(cache: KnowledgeIndexCache): Promise<void> {
  await fs.writeFile(knowledgeIndexCachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

export type IngestKnowledgeInput = {
  title?: string;
  content: string;
  fileName?: string;
};

export type IngestKnowledgeResult = {
  fileName: string;
  filePath: string;
  title: string;
};

export async function ingestLocalDocument(input: IngestKnowledgeInput): Promise<IngestKnowledgeResult> {
  await ensureKnowledgeDir();

  const title = (input.title || "Imported Knowledge").trim();
  const fileName = `${slugifyFileName(input.fileName || title)}.md`;
  const filePath = path.join(knowledgeDirPath, fileName);
  const content = input.content.trim();

  const documentBody = [`# ${title}`, "", content, ""].join("\n");
  await fs.writeFile(filePath, documentBody, "utf8");

  return {
    fileName,
    filePath,
    title
  };
}

async function readKnowledgeItems(): Promise<KnowledgeItem[]> {
  await ensureKnowledgeDir();
  const documents = await listKnowledgeDocuments();
  const cachedIndex = await readKnowledgeCache();

  if (cachedIndex && documentsMatch(documents, cachedIndex.documents) && cachedIndex.items.length > 0) {
    return cachedIndex.items;
  }

  const docs = (
    await Promise.all(
      documents.map(async (document) => {
        const filePath = path.join(knowledgeDirPath, document.fileName);
        const content = await fs.readFile(filePath, "utf8");
        const title = extractTitle(content, document.fileName);
        const chunks = splitIntoChunks(content);
        const baseId = slugifyFileName(document.fileName);

        return chunks.map((chunk, chunkIndex) => ({
          id: `local-k-${baseId}-c${chunkIndex + 1}`,
          title,
          summary: chunk,
          tags: extractTags(document.fileName, `${title} ${chunk}`),
          source: `${document.sourcePath}#chunk-${chunkIndex + 1}`,
          chunkIndex: chunkIndex + 1
        }) satisfies KnowledgeItem);
      })
    )
  ).flat();

  if (!docs.length) {
    return knowledgeSeed;
  }

  await writeKnowledgeCache({
    version: 1,
    builtAt: new Date().toISOString(),
    documents,
    items: docs
  });

  return docs;
}

async function loadKnowledgeIndex(): Promise<{ items: KnowledgeItem[]; index: KnowledgeIndexStatus }> {
  await ensureKnowledgeDir();
  const documents = await listKnowledgeDocuments();

  if (!documents.length) {
    return {
      items: knowledgeSeed,
      index: buildIndexStatus("seed", 0, knowledgeSeed.length)
    };
  }

  const cachedIndex = await readKnowledgeCache();
  if (cachedIndex && documentsMatch(documents, cachedIndex.documents) && cachedIndex.items.length > 0) {
    return {
      items: cachedIndex.items,
      index: buildIndexStatus("reused", documents.length, cachedIndex.items.length, cachedIndex.builtAt)
    };
  }

  const items = await readKnowledgeItems();
  const rebuiltCache = await readKnowledgeCache();

  return {
    items,
    index: buildIndexStatus(
      rebuiltCache ? "rebuilt" : "seed",
      documents.length,
      items.length,
      rebuiltCache?.builtAt
    )
  };
}

export async function retrieveKnowledge(query: AgentQuery): Promise<KnowledgeRetrievalResult> {
  const { items, index } = await loadKnowledgeIndex();

  const hits: RetrievedKnowledge[] = items
    .map((item) => ({ item, score: scoreText(query.text, `${item.title} ${item.summary}`, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    hits,
    index
  };
}
