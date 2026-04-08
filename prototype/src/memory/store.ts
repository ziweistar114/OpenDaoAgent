import type { AgentQuery, MemoryItem, RetrievedMemory } from "../shared/types.js";

const memorySeed: MemoryItem[] = [
  {
    id: "m-1",
    text: "OpenDaoAgent should start local-first and keep the first version small.",
    tags: ["phase1", "local-first", "scope"]
  },
  {
    id: "m-2",
    text: "The project values persistent memory, continuity, and auditable behavior.",
    tags: ["memory", "continuity", "audit"]
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

export function retrieveMemory(query: AgentQuery): RetrievedMemory[] {
  return memorySeed
    .map((item) => ({ item, score: scoreText(query.text, item.text, item.tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
