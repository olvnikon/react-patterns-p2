# Part 2 Live Demo Walkthrough

## Recommended order

The full walkthrough should take roughly 20–30 minutes. Each stop should explain one primary distinction rather than every implementation detail.

## 1. Start the application

Open `/architecture`, introduce the nine responsibilities, and then continue to
`/startup`.

Show:

- values loaded from `resources.json`;
- the typed config projection;
- bootstrap tasks running in parallel;
- the Main View Ready marker;
- Composition Root diagnostics.

Say:

> Configuration describes choices. The Composition Root turns those choices into application objects.

Trigger one optional bootstrap failure and retry it. If demonstrating a critical failure, use an isolated restart control rather than breaking the current presentation session.

## 2. Compare analytics strategies

Open `/analytics`.

Show:

- the stable `PortfolioAnalytics` capability;
- the selected Direct or Worker implementation;
- the same fake input and result shape;
- a responsiveness indicator while the Worker calculation runs.
- the application restart that changes `resources.json` profile and causes the
  Composition Root to select the other Strategy.

Say:

> Strategy chooses the implementation. The Worker changes the execution thread.

Cancel one calculation and start a new one to show stale-result protection.

## 3. Run one explicit workflow

Open `/workflows` in single-ticket mode.

Move through:

```text
editing
→ checking
→ confirming
→ submitting
→ accepted
```

Then demonstrate:

```text
submitting
→ outcome unknown
→ reconciling
→ accepted or failed
```

Say:

> A timeout describes the browser's knowledge, not necessarily the final business outcome.

All behavior remains fake and local.

## 4. Run several actors

Switch `/workflows` to multi-ticket mode.

Show:

- three independent ticket actors;
- different states at the same time;
- a targeted external instrument message;
- a workspace-wide BUY or SELL command;
- an accepted child reporting a fact to the parent mailbox;
- closing a ticket and stopping its actor.

Say:

> The statechart defines behavior. Actors run independent instances of that behavior.

Point out that these actors normally execute on the main browser thread.

## 5. Demonstrate intent prefetching

Return to navigation or the panel catalogue.

Show:

- a lazy item in `idle`;
- hover or keyboard focus changing it to `loading`;
- activation reusing the same promise;
- `/startup` showing the same registry entry as `ready`;
- normal activation still working without prefetch.

Say:

> Lazy loading reduces the initial bundle. Intent prefetching reduces the wait after likely intent.

## 6. Demonstrate local degradation

Open `/panels`.

Show:

- three sibling panel frames;
- one slow panel;
- one stale or degraded panel;
- one simulated local failure;
- Retry and Remove;
- siblings remaining usable.

Say:

> The Error Boundary catches the failure. The degradation policy defines the safe remaining UI.

Finish by showing that critical startup failures are not treated as optional panel degradation.

## Closing pattern map

```text
Runtime Configuration chooses
Composition Root wires
Strategy varies
Statecharts constrain
Actors coordinate
Bootstrap Graph schedules
Workers offload
Intent Prefetching anticipates
Graceful Degradation contains
```
