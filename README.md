# OpenDaoAgent

An open agent foundation for long-term memory, long-term presence, and cross-device continuity.

## One-Line Summary

`OpenDaoAgent` is not meant to be just another single-session chatbot. The project explores a more durable direction: an open agent foundation that can remember over time, stay inspectable, and evolve into a long-lived service system.

This repository is still early. It does not claim AGI, digital life, or production maturity. Its current goal is more practical: build a real, runnable starting point that other engineers can inspect and extend.

Chinese entry: [README_ZH.md](./README_ZH.md)

## What Already Exists

The repository now contains more than documentation. The `prototype/` directory already includes a runnable minimal chain with:

- A browser demo page
- A local HTTP API: `GET /health`, `POST /api/query`
- Local memory persistence for meaningful queries
- Local knowledge retrieval from markdown and text files
- A unified response format: `summary / evidence / nextActions / route / memory / knowledge / system`
- Source references and raw JSON inspection
- Early Chinese query support on top of the same local-first stack

## Start Here

If you are new to the project, read in this order:

1. [prototype/README.md](./prototype/README.md)
2. [FIRST_MVP.md](./docs/FIRST_MVP.md)
3. [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. [ROADMAP.md](./ROADMAP.md)
5. [MANIFESTO.md](./MANIFESTO.md)

## Quick Start

```bash
cd prototype
npm install
npm run dev
```

Then open:

```text
http://localhost:3010/
```

Chinese demo page:

```text
http://localhost:3010/zh
```

## What Problem This Project Tries To Solve

Most AI systems today are still session tools:

- They answer, but they do not really stay
- They execute, but they do not truly grow with continuity
- They cooperate, but they do not reliably remember the user and environment over time

`OpenDaoAgent` explores a different path:

- Long-term memory
- Cross-device continuity
- Authorized knowledge ingestion
- Auditable behavior
- Local-first deployment before larger infrastructure

## Phase 1 Scope

Phase 1 is intentionally narrow. It is not trying to simulate a complete autonomous digital being. It is only trying to validate whether a durable agent foundation can be assembled from a small set of practical capabilities:

- Local-first deployment
- Long-term memory
- Authorized knowledge ingestion
- Safe and auditable tool boundaries
- Cross-device continuity design

The current phase focuses on six questions:

1. Can the local deployment path remain stable and understandable?
2. How should durable memory be stored, merged, and governed?
3. How should authorized knowledge be ingested and retrieved?
4. How should tool use remain constrained and inspectable?
5. How should cross-device continuity be represented?
6. Is this direction concrete enough to attract serious technical collaborators?

## What This Project Is Not

At this stage, the project is not:

- A religion or belief system
- A mystical rebranding of vague ideas
- An unrestricted autonomous agent
- A user surveillance system
- A production-ready AGI platform
- A replacement for human judgment

## Who We Hope Will Join

The best early collaborators are people willing to help build the foundation carefully:

- Agent and LLM application engineers
- Memory, RAG, and retrieval engineers
- Backend, local deployment, Docker, and Linux engineers
- Frontend prototypers and product interaction designers
- Open-source community builders and maintainers

Useful interest areas include:

- Durable memory design
- Cross-device continuity
- Local-first versus cloud sync boundaries
- Auditable behavior and minimal permissions
- Keeping the project practical instead of drifting into vague futurism

## Working Principles

The current effort follows five basic rules:

1. Build something real before talking about distant end states
2. Start with a minimal prototype before claiming a grand vision
3. Attract technical collaborators before expanding the narrative
4. Validate memory and continuity before broader intelligence claims
5. Keep all capabilities within controllable, inspectable, and safe boundaries

## Repository Layout

```text
OpenDaoAgent/
|- README.md
|- README_ZH.md
|- README_EN.md
|- MANIFESTO.md
|- ROADMAP.md
|- CONTRIBUTING.md
|- LICENSE
|- docs/
|  |- FIRST_MVP.md
|  |- ARCHITECTURE.md
|  |- COMMUNITY_GUIDE.md
|  |- FIRST_ISSUES.md
|  '- GITHUB_LAUNCH_POST.md
'- prototype/
   |- README.md
   |- README_ZH.md
   |- public/
   |  |- index.html
   |  '- index.zh.html
   |- src/
   |- data/
   '- package.json
```

## Recommended Pre-Launch Checks

Before wider release, it is worth confirming:

- The README is clear enough for a first-time visitor
- Phase 1 boundaries are explicit
- The license is settled
- A runnable minimal prototype is present
- The first issues are ready for contributors

## Read More

- [MANIFESTO.md](./MANIFESTO.md)
- [ROADMAP.md](./ROADMAP.md)
- [FIRST_MVP.md](./docs/FIRST_MVP.md)
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [COMMUNITY_GUIDE.md](./docs/COMMUNITY_GUIDE.md)
- [FIRST_ISSUES.md](./docs/FIRST_ISSUES.md)
- [GITHUB_LAUNCH_POST.md](./docs/GITHUB_LAUNCH_POST.md)

Prototype details:

- [prototype/README.md](./prototype/README.md)
- [prototype/README_ZH.md](./prototype/README_ZH.md)

## Current Status

Current status: initiation stage, with documentation plus a minimal runnable prototype.

The next important step is not to inflate the vision. It is to deepen the prototype, sharpen module boundaries, create executable issues, and attract the first serious builders.

If you want to help move this from an idea into an early infrastructure shape, you are welcome to join.