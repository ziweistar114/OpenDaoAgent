import type { AgentQuery, AgentResponse, RetrievedKnowledge, RetrievedMemory } from "../shared/types.js";
import { retrieveMemory } from "../memory/store.js";
import { retrieveKnowledge } from "../knowledge/store.js";
import { logStep } from "../shared/logger.js";

function buildReply(
  query: AgentQuery,
  memoryHits: RetrievedMemory[],
  knowledgeHits: RetrievedKnowledge[]
): string {
  const parts: string[] = [];

  if (memoryHits.length) {
    parts.push(`Memory suggests: ${memoryHits[0].item.text}`);
  }

  if (knowledgeHits.length) {
    parts.push(
      `Knowledge suggests: ${knowledgeHits[0].item.summary} (source: ${knowledgeHits[0].item.source})`
    );
  }

  if (!parts.length) {
    parts.push("No strong memory or knowledge match was found yet. The next step is to expand seed data.");
  }

  parts.push(`Current request: ${query.text}`);
  return parts.join(" ");
}

export async function runOrchestrator(query: AgentQuery): Promise<AgentResponse> {
  logStep("orchestrator", `received query: ${query.text}`);

  const memoryHits = await retrieveMemory(query);
  logStep("memory", `hits: ${memoryHits.length}`);

  const knowledgeHits = await retrieveKnowledge(query);
  logStep("knowledge", `hits: ${knowledgeHits.length}`);

  return {
    query: query.text,
    memoryHits,
    knowledgeHits,
    reply: buildReply(query, memoryHits, knowledgeHits),
    notes: [
      "This is a minimal prototype chain.",
      "Memory now reads from a local JSON file if available.",
      "Knowledge now reads from local markdown or text files in prototype/data/knowledge."
    ]
  };
}
