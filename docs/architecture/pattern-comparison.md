# Part 2 Pattern Comparison

## Fast selection guide

| Problem | Use | Do not confuse it with |
| --- | --- | --- |
| Deployment choices must change without rebuilding | Runtime Configuration | Constructing services |
| Concrete services are created in scattered places | Composition Root | A service locator |
| One capability has interchangeable implementations | Strategy | Workflow states |
| One workflow has strict legal transitions | State Machine / Statechart | Shared global data |
| Several workflow instances run independently | Actor Model | Background threads |
| Startup tasks have dependencies and different criticality | Bootstrap Task Graph | A business workflow engine |
| CPU-heavy JavaScript blocks browser interaction | Web Worker Offloading | `startTransition` |
| A likely lazy feature should start loading early | Intent-Based Prefetching | Eager-loading everything |
| One optional panel may fail without losing the workspace | Graceful Capability Degradation | Hiding critical failures |

## Most important boundaries

### Runtime Configuration versus Composition Root

```text
Runtime Configuration:
analyticsStrategy = "worker"

Composition Root:
new WorkerAnalyticsStrategy(workerClient)
```

Configuration contains serializable choices. The root creates live objects.

### Strategy versus State Machine

```text
Strategy:
Which analytics implementation should run?

State Machine:
Which order-workflow transition is legal now?
```

### State Machine versus Actor Model

```text
Statechart:
behavior of one ticket

Actor system:
workspace with several ticket instances
```

### Actor Model versus Web Worker

```text
Actor:
owns state, mailbox, and lifecycle

Worker:
executes JavaScript on another browser thread
```

Actors normally remain on the main thread unless explicitly backed by a Worker.

### Lazy loading versus intent prefetching

```text
Lazy loading:
do not include the feature in the initial bundle

Intent prefetching:
start loading that lazy feature when activation becomes likely
```

### Error Boundary versus graceful degradation

```text
Error Boundary:
catches a React rendering error

Graceful degradation:
defines the safe local state, message, actions, and recovery path
```

## Library map

| Concern | Planned implementation |
| --- | --- |
| Routing and lazy routes | Existing React Router |
| Shared Part 1 application state | Existing Redux Toolkit |
| Existing action side effects | Existing redux-observable |
| Workflow and actors | XState v5 and `@xstate/react` |
| CPU offloading | Native module Web Worker |
| Panel render isolation | React Suspense and Error Boundary |
| Runtime configuration | Explicit TypeScript parser and validator |
| Dependency construction | Explicit TypeScript Composition Root |
| Prefetch registry | Small application-owned promise cache |

No additional framework should be added unless the native or existing project tools cannot keep the example readable.
