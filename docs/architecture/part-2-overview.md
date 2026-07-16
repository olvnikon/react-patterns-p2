# Part 2 Architecture Overview

## Goal

Extend the existing Financial Workspace without replacing the Part 1 demonstrations.

The Part 2 application remains a small client-side React/JAMstack SPA:

```mermaid
flowchart TD
    Shell[Static Application Shell] --> Resources[resources.json]
    Resources --> Config[Typed RuntimeConfig]
    Config --> Bootstrap[Small XState Bootstrap Graph]
    Bootstrap --> Root[Composition Root]
    Root --> Store[Existing Redux Store]
    Root --> Strategy[Analytics Strategy]
    Root --> Workflow[Workflow Actor Logic]
    Root --> Worker[Worker-backed Analytics]
    Root --> Router[Client-side Router]
    Router --> Existing[Part 1 Routes]
    Router --> Startup[/startup]
    Router --> Workflows[/workflows]
    Router --> Analytics[/analytics]
    Router --> Panels[/panels]
```

There is no backend application in this repository. API-shaped work is represented by fake local repositories.

## Four focused demo routes

### `/startup`

Makes three patterns visible:

```text
resources.json
    → validated RuntimeConfig
    → bootstrap task statuses
    → Composition Root diagnostics
```

The route shows:

- validated config values;
- selected concrete UI-side implementations;
- a small dependency graph;
- the Main View Ready milestone;
- critical versus optional failure.

### `/workflows`

Makes two related patterns visible:

```text
one order-ticket statechart
    → one ticket workflow
    → several independent ticket actors
```

The route has:

- single-ticket mode for State Machines and Statecharts;
- multi-ticket mode for the Actor Model;
- explicit current states and recent messages;
- fake external context routed through an adapter.

### `/analytics`

Makes Strategy and Web Worker Offloading visible:

```text
PortfolioAnalytics contract
    ├── DirectAnalyticsStrategy
    └── WorkerAnalyticsStrategy
```

Both use the same pure synthetic algorithm. The route displays the selected implementation, progress, cancellation, results, and a small main-thread responsiveness indicator.

### `/panels`

Makes prefetching and degradation visible:

```text
hover/focus
    → preload lazy panel
    → activate normally
    → panel validates config
    → panel loads fake data
    → local ready/stale/degraded/failed state
```

The host owns Suspense and a local Error Boundary. A failed panel keeps its frame and does not crash siblings.

## Implementation rule

Every pattern needs three layers:

1. A clear source-code boundary.
2. A visible runtime projection.
3. One small interaction that proves the pattern works.

Avoid adding infrastructure that is not needed for one of those layers.

## Size guardrail

```text
3 new feature packages
4 Part 2 routes
1 bootstrap machine
1 workflow statechart
1 workspace actor
2 analytics strategies
1 Worker
3 panel types
```

The comprehensive pattern documents describe more alternatives than this small implementation will include.
