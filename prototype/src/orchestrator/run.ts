import type {
  AgentQuery,
  AgentResponse,
  AgentRouteDecision,
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
  route: AgentRouteDecision,
  memoryHits: RetrievedMemory[],
  knowledgeHits: AgentResponse["knowledge"]["hits"]
): AgentResponse["answer"] {
  const evidence: string[] = [];
  const nextActions: string[] = [];

  if (memoryHits.length) {
    evidence.push(`Memory: ${memoryHits[0].item.summary}`);
  }

  if (knowledgeHits.length) {
    evidence.push(`Knowledge: ${knowledgeHits[0].item.summary} (${knowledgeHits[0].item.source})`);
  }

  if (!knowledgeHits.length) {
    nextActions.push("Add or refresh local documents in prototype/data/knowledge for stronger source-backed guidance.");
  }

  if (!memoryHits.length) {
    nextActions.push("Ask a more preference-rich or continuity-focused question to strengthen local memory retrieval.");
  }

  if (!nextActions.length) {
    nextActions.push("Keep expanding the local-first chain while preserving inspectable memory and source-backed knowledge.");
  }

  const summaryParts = [`Route selected: ${route.mode}.`];

  if (memoryHits.length) {
    summaryParts.push(`Memory emphasizes ${memoryHits[0].item.summary}`);
  }

  if (knowledgeHits.length) {
    summaryParts.push(`Knowledge emphasizes ${knowledgeHits[0].item.summary}`);
  }

  if (summaryParts.length === 1) {
    summaryParts.push("No strong memory or knowledge match was found yet.");
  }

  return {
    summary: summaryParts.join(" "),
    evidence,
    nextActions
  };
}

export async function runOrchestrator(query: AgentQuery): Promise<AgentResponse> {
  logStep("orchestrator", `received query: ${query.text}`);

  const memoryWrite = await rememberQuery(query);
  logStep("memory-write", memoryWrite.reason);

  const route = decideRoute(query);
  logStep("route", `${route.mode} | ${route.reason}`);

  const memoryHits = route.shouldReadMemory ? await retrieveMemory(query) : [];
  logStep("memory", `hits: ${memoryHits.length}`);

  const knowledge = route.shouldReadKnowledge
    ? await retrieveKnowledge(query)
    : {
        hits: [],
        index: {
          cacheFile: "data/knowledge/.index-cache.json",
          cacheState: "skipped" as const,
          documentCount: 0,
          chunkCount: 0
        }
      };
  logStep("knowledge", `hits: ${knowledge.hits.length} | cache: ${knowledge.index.cacheState}`);

  return {
    version: "v1",
    query,
    answer: buildReply(route, memoryHits, knowledge.hits),
    route,
    memory: {
      hits: memoryHits,
      write: memoryWrite
    },
    knowledge,
    system: {
      generatedAt: new Date().toISOString(),
      notes: [
      "This is a minimal prototype chain.",
      `Route mode: ${route.mode}.`,
      `Route reason: ${route.reason}.`,
      "Memory now reads from a local JSON file if available.",
      `Knowledge now reads from local markdown or text files in prototype/data/knowledge using a ${knowledge.index.cacheState} index.`,
      `Memory write status: ${memoryWrite.reason}.`
      ]
    }
  };
}
