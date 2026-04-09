# Phase 1 MVP

## One-Line Goal

Build an open agent prototype that is local-first, capable of durable memory, able to ingest authorized knowledge, and able to use a small set of bounded tools.

Chinese entry: [FIRST_MVP_ZH.md](./FIRST_MVP_ZH.md)

## Why This MVP Exists

If the first version cannot do the following, then it is too early to talk about larger ambitions:

- remember important things
- reconnect with prior context
- run in a real environment
- remain understandable enough for other contributors to continue building

That is why Phase 1 must stay deliberately narrow.

## Capabilities Phase 1 Must Include

### 1. Local Deployment

Requirements:

- it should start on a normal development machine
- deployment should stay as simple as possible
- Docker is strongly preferred

Acceptance:

- a new contributor can get it running by following the docs

### 2. Durable Memory

Requirements:

- at least one durable memory layer
- it can retain important user information
- it persists beyond a single session

Acceptance:

- key memories still exist after stopping and restarting the system

### 3. Authorized Knowledge Ingestion

Requirements:

- local documents can be imported
- basic retrieval works
- the system can cite knowledge instead of only guessing

Acceptance:

- for the same question, the system can answer with support from imported knowledge

### 4. Basic Orchestration

Requirements:

- the system can decide whether to use memory, knowledge, or tools
- complex autonomy is not required

Acceptance:

- at least one clear workflow runs end to end

### 5. Bounded Tool Use

Requirements:

- the system can perform a small set of useful operations
- full permission is never the default
- higher-risk actions remain controllable

Acceptance:

- the system can demonstrate constrained tool use in a clear way

### 6. Auditability And Recovery

Requirements:

- logging exists
- configuration exists
- backup and recovery thinking exists

Acceptance:

- basic problems can be traced
- core data can be restored

## What Must Not Enter Phase 1

The following should not be mixed into the MVP:

- globally distributed permanent persistence
- automatic learning of the entire internet
- global governance mechanisms
- blockchainization
- token systems
- complex multi-agent ecosystems
- digital-life-level narrative implementation

These directions would overload and likely break Phase 1.

## Recommended Module Breakdown

### Module A: Local Runtime Shell

- configuration
- startup
- Docker
- base API

### Module B: Memory System

- short-term memory
- durable memory
- update strategy

### Module C: Knowledge System

- document ingestion
- indexing
- retrieval

### Module D: Orchestration System

- intent judgment
- routing
- tool invocation control

### Module E: Audit System

- logging
- error recording
- behavior recording

## Suggested First Issues

- choose the initial local deployment path
- design the durable memory structure
- design the knowledge ingestion flow
- design the minimum workflow
- design the tool permission model
- design the logging and audit basics
- build the first frontend shell

## What Counts As Phase 1 Success

The standard is not how powerful the system looks. The standard is whether the project becomes real enough to continue.

Phase 1 is successful if:

- newcomers can run it
- users can observe durable memory effects
- authorized knowledge ingestion works
- tool use remains controlled
- the code structure is clear enough to continue from
- serious collaborators want to keep building with it