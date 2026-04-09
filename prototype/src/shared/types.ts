export type AgentQuery = {
  text: string;
};

export type MemoryCategory = "goal" | "preference" | "constraint" | "fact" | "question";
export type MemoryPriority = "low" | "medium" | "high";
export type MemoryState = "active" | "merged";

export type MemoryItem = {
  id: string;
  text: string;
  summary: string;
  tags: string[];
  category: MemoryCategory;
  priority: MemoryPriority;
  state: MemoryState;
  accessCount: number;
  mergeCount: number;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
  source: "seed" | "local";
};

export type KnowledgeItem = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  source: string;
  chunkIndex: number;
};

export type KnowledgeLanguage = "zh" | "en" | "mixed" | "unknown";

export type KnowledgeDocumentSummary = {
  title: string;
  fileName: string;
  sourcePath: string;
  chunkCount: number;
  characterCount: number;
  tags: string[];
  language: KnowledgeLanguage;
  updatedAt: string;
};

export type KnowledgeIndexCacheState = "reused" | "rebuilt" | "seed" | "skipped";

export type KnowledgeIndexStatus = {
  cacheFile: string;
  cacheState: KnowledgeIndexCacheState;
  documentCount: number;
  chunkCount: number;
  lastBuiltAt?: string;
};

export type RetrievedMemory = {
  item: MemoryItem;
  score: number;
};

export type RetrievedKnowledge = {
  item: KnowledgeItem;
  score: number;
};

export type KnowledgeRetrievalResult = {
  hits: RetrievedKnowledge[];
  index: KnowledgeIndexStatus;
};

export type KnowledgeImportResult = {
  fileName: string;
  filePath: string;
  title: string;
  document: KnowledgeDocumentSummary;
  index: KnowledgeIndexStatus;
};

export type AgentRouteMode = "memory-first" | "knowledge-first" | "hybrid" | "fallback";

export type AgentRouteDecision = {
  mode: AgentRouteMode;
  reason: string;
  shouldReadMemory: boolean;
  shouldReadKnowledge: boolean;
};

export type MemoryWriteResult = {
  saved: boolean;
  reason: string;
  item?: MemoryItem;
};

export type AgentResponse = {
  version: "v1";
  query: AgentQuery;
  answer: {
    summary: string;
    evidence: string[];
    nextActions: string[];
  };
  route: AgentRouteDecision;
  memory: {
    hits: RetrievedMemory[];
    write?: MemoryWriteResult;
  };
  knowledge: KnowledgeRetrievalResult;
  system: {
    generatedAt: string;
    notes: string[];
  };
};
