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

export function retrieveKnowledge(query: AgentQuery): RetrievedKnowledge[] {
  return knowledgeSeed
    .map((item) => ({ item, score: scoreText(query.text, `${item.title} ${item.summary}`, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
