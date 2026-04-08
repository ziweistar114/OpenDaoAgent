import fs from "node:fs/promises";
import path from "node:path";
import { memoryFilePath } from "../core/paths.js";
import type { AgentQuery, MemoryItem, RetrievedMemory } from "../shared/types.js";

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

export async function retrieveMemory(query: AgentQuery): Promise<RetrievedMemory[]> {
  const memoryItems = await readMemoryItems();

  return memoryItems
    .map((item) => ({ item, score: scoreText(query.text, item.text, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
