# Architecture Sketch

## Current Positioning

Phase 1 of `OpenDaoAgent` is not trying to build a complete digital lifeform. It is trying to build an open foundation that other people can continue extending.

That means the architecture must optimize for four things first:

- it can be implemented
- it can be replaced
- it can be extended
- it can be audited

Chinese entry: [ARCHITECTURE_ZH.md](./ARCHITECTURE_ZH.md)

## V1 Core Layers

A useful way to think about V1 is as six layers:

```text
interaction layer
  ↓
orchestration layer
  ↓
memory layer
  ↓
knowledge layer
  ↓
tool layer
  ↓
deployment and audit layer
```

---

## 1. Interaction Layer

### Role

Receives user input, renders output, and exposes the system through multiple interfaces.

### Phase 1 Recommendation

- web interface
- local desktop entry or lightweight browser entry
- API entrypoint

### Not A Priority Yet

- complex voice assistant behavior
- multimodal camera integration
- large-scale third-party platform integration

---

## 2. Orchestration Layer

### Role

Determines how a request should be decomposed, whether memory should be used, whether knowledge should be retrieved, and whether a tool should be called.

### Phase 1 Recommendation

- keep it lightweight
- keep tool boundaries explicit
- support a minimal workflow

### Useful References

- LangGraph
- workflow ideas from Flowise or Dify

### What To Avoid

- jumping immediately into very heavy autonomous agents
- allowing unrestricted automatic execution by default

---

## 3. Memory Layer

### Role

Lets the system maintain continuity beyond a single conversation.

### At Minimum, Phase 1 Should Distinguish Two Types Of Memory

#### Short-Term Memory

- current session context
- task progress state

#### Durable Memory

- user preferences
- key identity information
- important long-term projects
- reusable summaries and indexes

### Key Principles

- not everything should be stored forever
- memory needs selection and update rules
- deletion, override, and rollback must exist

---

## 4. Knowledge Layer

### Role

Allows the system to read both public knowledge and authorized knowledge.

### Phase 1 Recommendation

- local document ingestion
- indexing
- basic retrieval enhancement
- explicit source references

### What Not To Write

- "learn the entire internet"

### More Accurate Framing

- ingest compliant public knowledge
- ingest user-authorized knowledge
- build a knowledge system that is retrievable, citable, and updateable

---

## 5. Tool Layer

### Role

Allows the agent to move from only talking to actually doing bounded work.

### Phase 1 Recommendation

- file reading
- file writing within limited scope
- basic command execution
- calling specific apps or scripts

### Core Principles

- minimum permission by default
- high-risk actions require confirmation
- behavior must be recordable

---

## 6. Deployment And Audit Layer

### Role

Keeps the system startable, maintainable, recoverable, and inspectable.

### Phase 1 Recommendation

- Docker-based local deployment
- configuration in files
- traceable logs
- memory and knowledge backups
- recovery support

### Longer-Term Extensions

- cloud sync
- cross-device continuity
- node-based deployment

---

## Not Included In V1

The following can remain future explorations, but should not be pulled into Phase 1:

- blockchain governance
- DAO governance mechanisms
- full-network edge-node permanent persistence
- continuous full-parameter training
- unrestricted autonomous learning
- governance of humanity-scale public infrastructure

These are long-range topics, not current prototype foundation work.

---

## The Most Important Architectural Question Right Now

The success of V1 does not depend on how grand it sounds. It depends on whether these four judgments hold:

1. does durable memory actually work?
2. can local-first deployment actually be made real?
3. can tool use actually stay controlled?
4. is the code structure clear enough for outside contributors to continue building?

If these four points do not hold, the larger narrative does not hold either.
