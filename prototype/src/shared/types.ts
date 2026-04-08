export type AgentQuery = {
  text: string;
};

export type MemoryItem = {
  id: string;
  text: string;
  tags: string[];
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

export type AgentResponse = {
  query: string;
  memoryHits: RetrievedMemory[];
  knowledgeHits: RetrievedKnowledge[];
  reply: string;
  notes: string[];
};
