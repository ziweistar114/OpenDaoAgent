import fs from "node:fs/promises";
import path from "node:path";
import { knowledgeDirPath } from "../core/paths.js";
import type { AgentQuery, KnowledgeItem, RetrievedKnowledge } from "../shared/types.js";

const knowledgeSeed: KnowledgeItem[] = [
  {
    id: "k-1",
    title: "Phase 1 MVP",
    summary: "Phase 1 focuses on local deployment, persistent memory, authorized knowledge ingestion, basic orchestration, and safe tool boundaries.",
    tags: ["phase1", "mvp", "memory", "knowledge", "tools"],
    source: "docs/FIRST_MVP.md"
  },
  {
    id: "k-2",
    title: "Architecture",
    summary: "The first architecture layers are interaction, orchestration, memory, knowledge, tools, and audit-oriented deployment.",
    tags: ["architecture", "orchestrator", "knowledge", "memory", "tools"],
    source: "docs/ARCHITECTURE.md"
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

async function readKnowledgeItems(): Promise<KnowledgeItem[]> {
  await ensureKnowledgeDir();
  const entries = await fs.readdir(knowledgeDirPath, { withFileTypes: true });

  const docs = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name))
      .map(async (entry, index) => {
        const filePath = path.join(knowledgeDirPath, entry.name);
        const content = await fs.readFile(filePath, "utf8");

        return {
          id: `local-k-${index + 1}`,
          title: extractTitle(content, entry.name),
          summary: extractSummary(content),
          tags: extractTags(entry.name, content),
          source: path.relative(path.resolve(knowledgeDirPath, "..", ".."), filePath).replace(/\\/g, "/")
        } satisfies KnowledgeItem;
      })
  );

  return docs.length ? docs : knowledgeSeed;
}

export async function retrieveKnowledge(query: AgentQuery): Promise<RetrievedKnowledge[]> {
  const knowledgeItems = await readKnowledgeItems();

  return knowledgeItems
    .map((item) => ({ item, score: scoreText(query.text, `${item.title} ${item.summary}`, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
