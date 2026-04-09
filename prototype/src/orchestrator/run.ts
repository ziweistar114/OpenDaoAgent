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
  const memorySignals = ["remember", "memory", "preference", "history", "again", "previous", "记住", "记忆", "偏好", "历史", "以前", "之前"];
  const knowledgeSignals = [
    "document",
    "knowledge",
    "source",
    "retrieval",
    "architecture",
    "how",
    "what",
    "why",
    "文档",
    "知识",
    "来源",
    "检索",
    "架构",
    "如何",
    "怎么",
    "为什么",
    "什么"
  ];

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
    evidence.push(`记忆命中: ${memoryHits[0].item.summary}`);
  }

  if (knowledgeHits.length) {
    evidence.push(`知识命中: ${knowledgeHits[0].item.summary} (${knowledgeHits[0].item.source})`);
  }

  if (!knowledgeHits.length) {
    nextActions.push("补充或更新 prototype/data/knowledge 里的本地文档，让回答更有来源依据。");
  }

  if (!memoryHits.length) {
    nextActions.push("尝试提出更明显带有偏好、连续性或历史上下文的问题，增强本地记忆检索。");
  }

  if (!nextActions.length) {
    nextActions.push("继续扩展这条本地优先链路，同时保持记忆可检查、知识可追溯。");
  }

  const summaryParts = [`当前路由: ${route.mode}。`];

  if (memoryHits.length) {
    summaryParts.push(`记忆侧强调的是：${memoryHits[0].item.summary}`);
  }

  if (knowledgeHits.length) {
    summaryParts.push(`知识侧强调的是：${knowledgeHits[0].item.summary}`);
  }

  if (summaryParts.length === 1) {
    summaryParts.push("当前还没有找到足够强的记忆或知识命中。");
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
      "这是当前最小可运行原型链路。",
      `Route mode: ${route.mode}.`,
      `Route reason: ${route.reason}.`,
      "Memory currently reads from a local JSON file if available.",
      `Knowledge currently reads from local markdown or text files in prototype/data/knowledge using a ${knowledge.index.cacheState} index.`,
      `Memory write status: ${memoryWrite.reason}.`
      ]
    }
  };
}
