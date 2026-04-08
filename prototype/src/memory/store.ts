import fs from "node:fs/promises";
import path from "node:path";
import { memoryFilePath } from "../core/paths.js";
import type {
  AgentQuery,
  MemoryCategory,
  MemoryItem,
  MemoryPriority,
  MemoryWriteResult,
  RetrievedMemory
} from "../shared/types.js";

const memorySeed: MemoryItem[] = [
  {
    id: "m-1",
    text: "OpenDaoAgent should start local-first and keep the first version small.",
    summary: "Keep Phase 1 narrow and local-first.",
    tags: ["phase1", "local-first", "scope"],
    category: "constraint",
    priority: "high",
    state: "active",
    accessCount: 0,
    mergeCount: 0,
    aliases: [],
    createdAt: "2026-04-09T00:00:00.000Z",
    updatedAt: "2026-04-09T00:00:00.000Z",
    source: "seed"
  },
  {
    id: "m-2",
    text: "The project values persistent memory, continuity, and auditable behavior.",
    summary: "Persistent memory, continuity, and auditability are core values.",
    tags: ["memory", "continuity", "audit"],
    category: "fact",
    priority: "high",
    state: "active",
    accessCount: 0,
    mergeCount: 0,
    aliases: [],
    createdAt: "2026-04-09T00:00:00.000Z",
    updatedAt: "2026-04-09T00:00:00.000Z",
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

function buildSummary(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  return normalized.length <= 90 ? normalized : `${normalized.slice(0, 87)}...`;
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

function inferCategory(text: string): MemoryCategory {
  const normalized = text.toLowerCase();
  if (normalized.includes("should") || normalized.includes("must") || normalized.includes("need to")) {
    return "constraint";
  }
  if (normalized.includes("prefer") || normalized.includes("like") || normalized.includes("want")) {
    return "preference";
  }
  if (normalized.includes("?")) {
    return "question";
  }
  if (normalized.includes("goal") || normalized.includes("milestone") || normalized.includes("phase")) {
    return "goal";
  }
  return "fact";
}

function inferPriority(text: string, category: MemoryCategory): MemoryPriority {
  const normalized = text.toLowerCase();
  if (
    category === "constraint" ||
    normalized.includes("must") ||
    normalized.includes("critical") ||
    normalized.includes("priority")
  ) {
    return "high";
  }
  if (category === "goal" || normalized.includes("phase") || normalized.includes("milestone")) {
    return "medium";
  }
  return "low";
}

function priorityWeight(priority: MemoryPriority): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function similarityScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function toStructuredMemory(
  item: Omit<
    MemoryItem,
    "summary" | "category" | "priority" | "state" | "accessCount" | "mergeCount" | "aliases" | "createdAt" | "updatedAt"
  > &
    Partial<
      Pick<
        MemoryItem,
        "summary" | "category" | "priority" | "state" | "accessCount" | "mergeCount" | "aliases" | "createdAt" | "updatedAt"
      >
    >
): MemoryItem {
  const now = new Date().toISOString();
  const category = item.category ?? inferCategory(item.text);
  return {
    ...item,
    summary: item.summary ?? buildSummary(item.text),
    category,
    priority: item.priority ?? inferPriority(item.text, category),
    state: item.state ?? "active",
    accessCount: item.accessCount ?? 0,
    mergeCount: item.mergeCount ?? 0,
    aliases: item.aliases ?? [],
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now
  };
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
    const parsed = JSON.parse(raw) as Array<
      Omit<
        MemoryItem,
        "summary" | "category" | "priority" | "state" | "accessCount" | "mergeCount" | "aliases" | "createdAt" | "updatedAt"
      > &
        Partial<
          Pick<
            MemoryItem,
            "summary" | "category" | "priority" | "state" | "accessCount" | "mergeCount" | "aliases" | "createdAt" | "updatedAt"
          >
        >
    >;
    const items = Array.isArray(parsed) && parsed.length ? parsed.map((item) => toStructuredMemory(item)) : memorySeed;
    await writeMemoryItems(items);
    return items;
  } catch {
    return memorySeed;
  }
}

async function writeMemoryItems(items: MemoryItem[]): Promise<void> {
  await fs.writeFile(memoryFilePath, JSON.stringify(items, null, 2), "utf8");
}

function sortForRetention(items: MemoryItem[]): MemoryItem[] {
  return items.sort((a, b) => {
    const byPriority = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (byPriority !== 0) return byPriority;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function mergeMemory(existing: MemoryItem, incomingText: string, incomingTags: string[]): MemoryItem {
  const updatedText = incomingText.length > existing.text.length ? incomingText : existing.text;
  const aliases = Array.from(new Set([...existing.aliases, existing.text, incomingText])).filter(
    (item) => normalizeText(item) !== normalizeText(updatedText)
  );

  return {
    ...existing,
    text: updatedText,
    summary: buildSummary(updatedText),
    tags: Array.from(new Set([...existing.tags, ...incomingTags])).slice(0, 12),
    aliases: aliases.slice(0, 10),
    mergeCount: existing.mergeCount + 1,
    updatedAt: new Date().toISOString()
  };
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
    const refreshed: MemoryItem = {
      ...duplicate,
      accessCount: duplicate.accessCount + 1,
      updatedAt: new Date().toISOString()
    };
    await writeMemoryItems(sortForRetention([refreshed, ...items.filter((item) => item.id !== duplicate.id)]).slice(0, 50));
    return { saved: false, reason: "duplicate memory already exists; updated timestamp", item: refreshed };
  }

  const tags = buildTagsFromQuery(text);
  const similar = items.find((item) => {
    if (item.category !== inferCategory(text)) return false;
    return similarityScore(item.tags, tags) >= 0.45;
  });

  if (similar) {
    const merged = mergeMemory(similar, text, tags);
    await writeMemoryItems(sortForRetention([merged, ...items.filter((item) => item.id !== similar.id)]).slice(0, 50));
    return { saved: false, reason: "merged into similar memory", item: merged };
  }

  const item = toStructuredMemory({
    id: `m-local-${Date.now()}`,
    text,
    tags,
    source: "local"
  });

  await writeMemoryItems(sortForRetention([item, ...items]).slice(0, 50));
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
