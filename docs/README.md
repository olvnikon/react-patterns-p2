# React Patterns Part 2 — Documentation Guide

## Purpose

These documents are source material for designing and presenting a small client-side React architecture showcase.

They are intentionally more detailed than the application we will build. Sections about advanced alternatives, production hardening, and additional libraries provide discussion context; they are not all implementation requirements.

Some long code examples use illustrative package paths to make boundaries obvious. The repository structure and implementation slice in [the phased plan](../IMPLEMENTATION_PLAN.md) are the source of truth; app-specific runtime, bootstrap, and prefetch code will stay in the app package.

## Application boundary

The showcase is a purely UI/JAMstack application:

```text
static Vite build
    +
resources.json loaded at runtime
    +
client-side React application
    +
fake local repositories and browser APIs
```

The repository will not contain:

- a backend project;
- SSR or React Server Components;
- a database;
- real authentication or authorization;
- real API endpoints;
- server-side workflow orchestration;
- real financial calculations.

Repository contracts may look like API clients so the UI architecture remains realistic, but their implementations are fake, local, and mocked.

## Pattern documents

| # | Pattern or practice | Main question | Visible demo |
| --- | --- | --- | --- |
| 1 | [Runtime Configuration](patterns/01-runtime-configuration.md) | Which deployment choices were supplied to this build? | `/startup` shows validated values from `resources.json`. |
| 2 | [Composition Root](patterns/02-composition-root.md) | Which concrete UI-side implementations were created and connected? | `/startup` shows the selected repository, adapters, strategy, store, and runtime services. |
| 3 | [Strategy Pattern](patterns/03-strategy-pattern.md) | Which interchangeable analytics implementation is active? | `/analytics` compares direct and Worker-backed implementations behind one contract. |
| 4 | [State Machines and Statecharts](patterns/04-state-machines-and-statecharts.md) | What state is one workflow in, and which transitions are valid? | `/workflows` shows one explicit fake order workflow. |
| 5 | [Actor Model for UI Orchestration](patterns/05-actor-model-for-ui-orchestration.md) | How do several independent workflow instances run and communicate? | `/workflows` opens and closes multiple ticket actors. |
| 6 | [Declarative Bootstrap Task Graph](patterns/06-declarative-bootstrap-task-graph.md) | Which startup task can run now? | `/startup` visualizes a small fixed XState task graph. |
| 7 | [Web Worker Offloading](patterns/07-web-worker-offloading.md) | Where should CPU-heavy calculation execute? | `/analytics` keeps UI interaction responsive during a synthetic calculation. |
| 8 | [Intent-Based Prefetching](patterns/08-intent-based-prefetching.md) | When should a likely lazy resource start loading? | Navigation and `/panels` expose hover/focus preload status. |
| 9 | [Graceful Capability Degradation](patterns/09-graceful-capability-degradation.md) | What remains safely usable when an optional panel fails? | `/panels` contains locally isolated lazy panels with Retry and Remove. |

## Small showcase implementation

The implementation should remain easy to explain:

```text
5 Part 2 routes, including the pattern map
3 new feature packages
1 runtime resource document
1 explicit bootstrap machine
1 order-ticket statechart
1 workspace actor
1 analytics contract with 2 strategies
1 Web Worker
3 dynamic panel types
```

We will not implement every advanced option described in the documents.

Examples that remain documentation-only unless the small demo proves a need:

- a generic arbitrary task-graph engine;
- Worker pools;
- SharedArrayBuffer and Atomics;
- WebAssembly;
- a dependency-injection container;
- a general plugin platform;
- a general query-cache implementation;
- a production configuration service;
- cross-tab or distributed actors;
- a full financial analytics engine.

## Visibility rule

Every topic must be visible in the running UI, not only in source code.

Each Part 2 route should include:

- a one-sentence pattern explanation;
- a simple diagram or status projection;
- a small interactive demo;
- a “what to observe” note;
- controlled success, delay, or failure switches where useful;
- the currently selected implementation or state.

The UI should make important distinctions explicit:

```text
configuration ≠ object construction
strategy ≠ workflow
state machine ≠ actor system
actor concurrency ≠ Worker multithreading
lazy loading ≠ intent prefetching
Error Boundary ≠ graceful degradation policy
```

## Safety and naming

Use only fake generic values:

```text
ORD-1001
PF-001
USR-DEMO
INST-ALPHA
INST-BETA
INST-GAMMA
Global Desk
```

Do not use real company names, real ticker symbols, real customer data, real endpoints, proprietary workflow names, or real financial formulas.

## Reading order

For the main architectural narrative:

```text
Runtime Configuration
    → Composition Root
    → Strategy
    → State Machines
    → Actor Model
    → Bootstrap Task Graph
    → Web Workers
    → Intent Prefetching
    → Graceful Degradation
```

For implementation, follow [the phased plan](../IMPLEMENTATION_PLAN.md), beginning with the runtime foundation and preserving all existing Part 1 routes.

Additional concise guides:

- [Part 2 architecture overview](architecture/part-2-overview.md)
- [Pattern comparison](architecture/pattern-comparison.md)
- [Live demo walkthrough](architecture/demo-walkthrough.md)
- [Final verification](architecture/final-verification.md)
