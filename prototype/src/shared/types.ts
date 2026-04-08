export type AgentQuery = {
  text: string;
};

export type MemoryCategory = "goal" | "preference" | "constraint" | "fact" | "question";
export type MemoryPriority = "low" | "medium" | "high";

export type MemoryItem = {
  id: string;
  text: string;
  summary: string;
  tags: string[];
  category: MemoryCategory;
  priority: MemoryPriority;
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
};

export type RetrievedMemory = {
  item: MemoryItem;
  score: number;
};

export type RetrievedKnowledge = {
  item: KnowledgeItem;
  score: number;
};

export type MemoryWriteResult = {
  saved: boolean;
  reason: string;
  item?: MemoryItem;
};

export type AgentResponse = {
  query: string;
  memoryHits: RetrievedMemory[];
  knowledgeHits: RetrievedKnowledge[];
  reply: string;
  notes: string[];
  memoryWrite?: MemoryWriteResult;
};
