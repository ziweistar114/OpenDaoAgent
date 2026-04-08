import fs from "node:fs/promises";
import path from "node:path";
import { memoryFilePath } from "../core/paths.js";
import type { AgentQuery, MemoryItem, MemoryWriteResult, RetrievedMemory } from "../shared/types.js";

const memorySeed: MemoryItem[] = [
  {
    id: "m-1",
    text: "OpenDaoAgent should start local-first and keep the first version small.",
    tags: ["phase1", "local-first", "scope"],
    source: "seed"
  },
  {
    id: "m-2",
    text: "The project values persistent memory, continuity, and auditable behavior.",
    tags: ["memory", "continuity", "audit"],
    source: "seed"
  }
];

function scoreText(query: string, candidate: string, tags: string[]): number {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (candidate.toLowerCase().includes(token)) score += 2;
    if (tags.some((tag) => tag.toLowerCase().includes(token))) score += 1;
  }
  return score;
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildTagsFromQuery(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 4)
    )
  ).slice(0, 8);
}

async function ensureMemoryFile(): Promise<void> {
  await fs.mkdir(path.dirname(memoryFilePath), { recursive: true });

  try {
    await fs.access(memoryFilePath);
  } catch {
    await fs.writeFile(memoryFilePath, JSON.stringify(memorySeed, null, 2), "utf8");
  }
}

async function readMemoryItems(): Promise<MemoryItem[]> {
  await ensureMemoryFile();

  try {
    const raw = await fs.readFile(memoryFilePath, "utf8");
    const parsed = JSON.parse(raw) as MemoryItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : memorySeed;
  } catch {
    return memorySeed;
  }
}

async function writeMemoryItems(items: MemoryItem[]): Promise<void> {
  await fs.writeFile(memoryFilePath, JSON.stringify(items, null, 2), "utf8");
}

export async function rememberQuery(query: AgentQuery): Promise<MemoryWriteResult> {
  const text = query.text.trim();
  if (text.length < 24) {
    return { saved: false, reason: "query too short to become durable memory" };
  }

  const items = await readMemoryItems();
  const normalizedQuery = normalizeText(text);

  const duplicate = items.find((item) => normalizeText(item.text) === normalizedQuery);
  if (duplicate) {
    return { saved: false, reason: "duplicate memory already exists", item: duplicate };
  }

  const item: MemoryItem = {
    id: `m-local-${Date.now()}`,
    text,
    tags: buildTagsFromQuery(text),
    source: "local"
  };

  await writeMemoryItems([item, ...items].slice(0, 50));
  return { saved: true, reason: "saved as local memory", item };
}

export async function retrieveMemory(query: AgentQuery): Promise<RetrievedMemory[]> {
  const memoryItems = await readMemoryItems();

  return memoryItems
    .map((item) => ({ item, score: scoreText(query.text, item.text, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
