# Prototype Skeleton

This directory is no longer just an empty scaffold. It already contains a minimal runnable chain for the project.

Chinese entry: [README_ZH.md](./README_ZH.md)

## Current Runnable Chain

The prototype already wires together:

- `memory`
- `knowledge`
- `orchestrator`
- `console output`
- `HTTP API`
- `browser demo`

## Goal

The prototype exists to give outside collaborators a clear starting point, separate Phase 1 concerns early, and prevent the repository from turning into an unstructured experiment dump.

## Current Directory Layout

```text
prototype/
 .gitignore
 public/
    index.html
    index.zh.html
 data/
    knowledge/
    memory/
 package.json
 tsconfig.json
 src/
    index.ts
    server.ts
    core/
    memory/
    knowledge/
    orchestrator/
    tools/
    shared/
```

## Layer Responsibilities

- `core/`: boot logic, identity, base configuration
- `memory/`: durable memory, retrieval, merge strategy, governance rules
- `knowledge/`: authorized document ingestion, indexing, retrieval
- `orchestrator/`: request routing and workflow coordination
- `tools/`: bounded tool invocation surfaces
- `shared/`: types, logging, shared utility structures

## What The Current Chain Does

The example flow is already more than a paper design:

1. Load base config
2. Write meaningful queries into local memory when appropriate
3. Retrieve local memory from `data/memory/memory.json`
4. Retrieve local knowledge from markdown or text files in `data/knowledge/`
5. Decide whether to use memory, knowledge, or a hybrid route
6. Return a unified response envelope through console output or HTTP

This is not the final product logic, but it is enough to move collaborators from abstract discussion into real code evolution.

## Local Data Sources

The prototype now reads from local runtime data, not only hardcoded seeds:

- `data/memory/memory.json`
- `data/knowledge/*.md`

Current behavior:

- Memory reads from local `memory.json` when available
- Knowledge scans local markdown or text files, chunks them, and reuses a local index cache
- The orchestrator attempts to write meaningful new queries back into memory
- If local data is missing, the code falls back to minimal built-in seed content
- `data/knowledge/` now includes both English and Chinese knowledge files for bilingual demo scenarios

## Getting Started

1. Enter `prototype/`
2. Install dependencies: `npm install`
3. Start the minimal HTTP API: `npm run dev`
4. If you only want the console demo chain: `npm run dev:console`
5. Then inspect:
   - `src/memory/store.ts`
   - `src/knowledge/store.ts`
   - `src/orchestrator/run.ts`
   - `src/server.ts`
6. Open the browser demo: `http://localhost:3010/`
7. Open the Chinese browser demo: `http://localhost:3010/zh`

## Demo Highlights

- You can ask questions in the browser without starting from `curl`
- The page renders the unified response fields: `summary / evidence / nextActions / route / knowledge / memory`
- Retrieval hits keep source references so answers remain inspectable
- Knowledge already uses a minimal index cache instead of rescanning every request
- The page is wired to the real local `POST /api/query` endpoint
- The default homepage is now English-facing, while a Chinese demo page is preserved separately

## Import Local Knowledge

Import a file directly:

```bash
npm run ingest:file -- --file ./data/knowledge/phase1-focus.md
```

Import inline text directly:

```bash
npm run ingest:file -- --title "Temporary Note" --text "Local-first memory should stay easy to inspect."
```

## Minimal HTTP API

The API listens on `http://localhost:3010` by default.

Browser pages:

```text
http://localhost:3010/
http://localhost:3010/zh
```

Health check:

```bash
curl http://localhost:3010/health
```

Query endpoint:

```bash
curl -X POST http://localhost:3010/api/query \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"What should Phase 1 focus on for local-first memory?\"}"
```

## Current Status

- This is a minimal evolution skeleton, not a complete product
- The real MVP target is still defined by `docs/FIRST_MVP.md`
- Memory already supports local JSON persistence, dedup, merge, and retention rules
- Knowledge already supports local markdown and text ingestion, chunking, source references, and minimal index caching
- The prototype already includes a first Chinese knowledge corpus covering Phase 1 focus, retrieval design, and memory principles
- The orchestrator already supports basic route decisions: `memory-first / knowledge-first / hybrid / fallback`
- The prototype already exposes `GET /health` and `POST /api/query`
- The browser demo already provides a usable external walkthrough for the current state

## Next Most Valuable Improvements

- Upgrade memory from minimal governance rules to deeper conflict handling and memory category extraction
- Upgrade knowledge from minimal cached indexing to stronger incremental ranking and retrieval quality
- Upgrade the unified response format into a more formal API-facing schema