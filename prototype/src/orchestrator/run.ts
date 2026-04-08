import type {
  AgentQuery,
  AgentResponse,
  AgentRouteDecision,
  RetrievedKnowledge,
  RetrievedMemory
} from "../shared/types.js";
import { rememberQuery, retrieveMemory } from "../memory/store.js";
import { retrieveKnowledge } from "../knowledge/store.js";
import { logStep } from "../shared/logger.js";

function decideRoute(query: AgentQuery): AgentRouteDecision {
  const text = query.text.toLowerCase();
  const memorySignals = ["remember", "memory", "preference", "history", "again", "previous"];
  const knowledgeSignals = ["document", "knowledge", "source", "retrieval", "architecture", "how", "what", "why"];

  const memoryScore = memorySignals.filter((signal) => text.includes(signal)).length;
  const knowledgeScore = knowledgeSignals.filter((signal) => text.includes(signal)).length;

  if (memoryScore > 0 && knowledgeScore > 0) {
    return {
      mode: "hybrid",
      reason: "the query appears to need both durable memory and document-backed knowledge",
      shouldReadMemory: true,
      shouldReadKnowledge: true
    };
  }

  if (memoryScore > 0) {
    return {
      mode: "memory-first",
      reason: "the query leans toward continuity, preference, or prior context",
      shouldReadMemory: true,
      shouldReadKnowledge: false
    };
  }

  if (knowledgeScore > 0) {
    return {
      mode: "knowledge-first",
      reason: "the query leans toward explanation, source-backed guidance, or document retrieval",
      shouldReadMemory: false,
      shouldReadKnowledge: true
    };
  }

  return {
    mode: "fallback",
    reason: "the query does not strongly signal memory or knowledge, so both are checked lightly",
    shouldReadMemory: true,
    shouldReadKnowledge: true
  };
}

function buildReply(
  query: AgentQuery,
  route: AgentRouteDecision,
  memoryHits: RetrievedMemory[],
  knowledgeHits: RetrievedKnowledge[]
): string {
  const parts: string[] = [];

  parts.push(`Route: ${route.mode}.`);

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

  const memoryWrite = await rememberQuery(query);
  logStep("memory-write", memoryWrite.reason);

  const route = decideRoute(query);
  logStep("route", `${route.mode} | ${route.reason}`);

  const memoryHits = route.shouldReadMemory ? await retrieveMemory(query) : [];
  logStep("memory", `hits: ${memoryHits.length}`);

  const knowledgeHits = route.shouldReadKnowledge ? await retrieveKnowledge(query) : [];
  logStep("knowledge", `hits: ${knowledgeHits.length}`);

  return {
    query: query.text,
    route,
    memoryHits,
    knowledgeHits,
    reply: buildReply(query, route, memoryHits, knowledgeHits),
    memoryWrite,
    notes: [
      "This is a minimal prototype chain.",
      `Route mode: ${route.mode}.`,
      `Route reason: ${route.reason}.`,
      "Memory now reads from a local JSON file if available.",
      "Knowledge now reads from local markdown or text files in prototype/data/knowledge.",
      `Memory write status: ${memoryWrite.reason}.`
    ]
  };
}
