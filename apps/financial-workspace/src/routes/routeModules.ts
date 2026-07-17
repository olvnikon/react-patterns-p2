// Intent handlers and router activation call the same cached import functions.
let reportsRoutePromise:
  | Promise<typeof import('./ReportsRoute')>
  | undefined;
let analyticsRoutePromise:
  | Promise<typeof import('./AnalyticsRoute')>
  | undefined;
let workflowsRoutePromise:
  | Promise<typeof import('./WorkflowsRoute')>
  | undefined;
let panelsRoutePromise:
  | Promise<typeof import('./PanelsRoute')>
  | undefined;

export function loadReportsRoute() {
  reportsRoutePromise ??= import('./ReportsRoute');
  return reportsRoutePromise;
}

export function loadAnalyticsRoute() {
  analyticsRoutePromise ??= import('./AnalyticsRoute');
  return analyticsRoutePromise;
}

export function loadWorkflowsRoute() {
  workflowsRoutePromise ??= import('./WorkflowsRoute');
  return workflowsRoutePromise;
}

export function loadPanelsRoute() {
  panelsRoutePromise ??= import('./PanelsRoute');
  return panelsRoutePromise;
}
