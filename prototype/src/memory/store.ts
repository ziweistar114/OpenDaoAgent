import fs from "node:fs/promises";
import path from "node:path";
import { memoryFilePath } from "../core/paths.js";
import type {
  AgentQuery,
  MemoryCategory,
  MemoryGovernanceStats,
  MemoryItem,
  MemoryPriority,
  MemorySnapshot,
  MemoryWriteResult,
  RetrievedMemory
} from "../shared/types.js";

const memoryRetentionLimit = 50;

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

function extractSearchTokens(text: string): string[] {
  const matches = text.toLowerCase().match(/[\u4e00-\u9fff]{2,}|[a-z0-9-]{2,}/g) || [];
  const semanticAliases: Array<[string, string[]]> = [
    ["本地", ["local", "local-first"]],
    ["阶段", ["phase", "phase1"]],
    ["第一阶段", ["phase", "phase1"]],
    ["记忆", ["memory"]],
    ["长期记忆", ["memory", "persistent"]],
    ["来源", ["source"]],
    ["可追踪", ["source", "retrieval"]],
    ["检索", ["retrieval"]],
    ["检索层", ["retrieval"]],
    ["架构", ["architecture"]],
    ["知识", ["knowledge"]],
    ["部署", ["deployment"]],
    ["偏好", ["preference"]],
    ["历史", ["history"]],
    ["向量数据库", ["vector", "database"]],
    ["数据库", ["database"]]
  ];

  const expanded = [...matches];
  for (const [keyword, aliases] of semanticAliases) {
    if (text.includes(keyword)) {
      expanded.push(...aliases);
    }
  }

  return Array.from(new Set(expanded));
}

function scoreText(query: string, candidate: string, tags: string[]): number {
  const tokens = extractSearchTokens(query);
  const normalizedCandidate = candidate.toLowerCase();
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  let score = 0;
  for (const token of tokens) {
    if (normalizedCandidate.includes(token)) score += 2;
    if (normalizedTags.some((tag) => tag.includes(token))) score += 1;
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

function buildCompressedSummary(text: string, aliases: string[]): string {
  const base = buildSummary(text);
  if (!aliases.length) return base;
  return `${base} (+${aliases.length} related phrasing${aliases.length > 1 ? "s" : ""})`;
}

function buildTagsFromQuery(text: string): string[] {
  return extractSearchTokens(text)
    .filter((token) => token.length > 1)
    .slice(0, 8);
}

function inferCategory(text: string): MemoryCategory {
  const normalized = text.toLowerCase();
  if (
    normalized.includes("should") ||
    normalized.includes("must") ||
    normalized.includes("need to") ||
    text.includes("应该") ||
    text.includes("必须") ||
    text.includes("需要")
  ) {
    return "constraint";
  }
  if (
    normalized.includes("prefer") ||
    normalized.includes("like") ||
    normalized.includes("want") ||
    text.includes("偏好") ||
    text.includes("喜欢") ||
    text.includes("希望") ||
    text.includes("想要")
  ) {
    return "preference";
  }
  if (normalized.includes("?") || text.includes("？") || text.includes("什么") || text.includes("如何") || text.includes("怎么")) {
    return "question";
  }
  if (
    normalized.includes("goal") ||
    normalized.includes("milestone") ||
    normalized.includes("phase") ||
    text.includes("目标") ||
    text.includes("里程碑") ||
    text.includes("阶段")
  ) {
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
    normalized.includes("priority") ||
    text.includes("必须") ||
    text.includes("关键") ||
    text.includes("优先")
  ) {
    return "high";
  }
  if (category === "goal" || normalized.includes("phase") || normalized.includes("milestone") || text.includes("阶段") || text.includes("里程碑")) {
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

function compactAliases(text: string, aliases: string[]): string[] {
  const unique = Array.from(new Set(aliases.map((item) => item.trim()).filter(Boolean))).filter(
    (item) => normalizeText(item) !== normalizeText(text)
  );

  return unique
    .sort((a, b) => a.length - b.length)
    .slice(0, 3);
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
    aliases: compactAliases(item.text, item.aliases ?? []),
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

function buildMemoryGovernanceStats(items: MemoryItem[]): MemoryGovernanceStats {
  const sortedByUpdated = [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return {
    retentionLimit: memoryRetentionLimit,
    totalCount: items.length,
    activeCount: items.filter((item) => item.state === "active").length,
    mergedCount: items.filter((item) => item.state === "merged").length,
    highPriorityCount: items.filter((item) => item.priority === "high").length,
    categories: {
      goal: items.filter((item) => item.category === "goal").length,
      preference: items.filter((item) => item.category === "preference").length,
      constraint: items.filter((item) => item.category === "constraint").length,
      fact: items.filter((item) => item.category === "fact").length,
      question: items.filter((item) => item.category === "question").length
    },
    sources: {
      seed: items.filter((item) => item.source === "seed").length,
      local: items.filter((item) => item.source === "local").length
    },
    newestUpdatedAt: sortedByUpdated[0]?.updatedAt,
    oldestUpdatedAt: sortedByUpdated.at(-1)?.updatedAt
  };
}

export async function listMemorySnapshot(): Promise<MemorySnapshot> {
  const items = await readMemoryItems();
  return {
    items,
    stats: buildMemoryGovernanceStats(items)
  };
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
  const aliases = compactAliases(updatedText, [...existing.aliases, existing.text, incomingText]);
  const mergeCount = existing.mergeCount + 1;

  return {
    ...existing,
    text: updatedText,
    summary: buildCompressedSummary(updatedText, aliases),
    tags: Array.from(new Set([...existing.tags, ...incomingTags])).slice(0, 12),
    aliases,
    state: mergeCount > 0 ? "merged" : "active",
    mergeCount,
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
      summary: buildCompressedSummary(duplicate.text, duplicate.aliases),
      updatedAt: new Date().toISOString()
    };
    await writeMemoryItems(
      sortForRetention([refreshed, ...items.filter((item) => item.id !== duplicate.id)]).slice(0, memoryRetentionLimit)
    );
    return { saved: false, reason: "duplicate memory already exists; updated timestamp", item: refreshed };
  }

  const tags = buildTagsFromQuery(text);
  const similar = items.find((item) => {
    if (item.category !== inferCategory(text)) return false;
    return similarityScore(item.tags, tags) >= 0.45;
  });

  if (similar) {
    const merged = mergeMemory(similar, text, tags);
    await writeMemoryItems(
      sortForRetention([merged, ...items.filter((item) => item.id !== similar.id)]).slice(0, memoryRetentionLimit)
    );
    return { saved: false, reason: "merged into similar memory", item: merged };
  }

  const item = toStructuredMemory({
    id: `m-local-${Date.now()}`,
    text,
    tags,
    source: "local"
  });

  await writeMemoryItems(sortForRetention([item, ...items]).slice(0, memoryRetentionLimit));
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
