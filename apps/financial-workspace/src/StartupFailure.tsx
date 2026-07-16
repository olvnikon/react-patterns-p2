type StartupFailureProps = {
  error: unknown;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The application could not be created.';
}

export function StartupFailure({ error }: StartupFailureProps) {
  return (
    <main className="startup-failure">
      <section className="workspace-panel" role="alert">
        <p className="eyebrow">Startup failed</p>
        <h1>Financial Workspace is unavailable</h1>
        <p>{getErrorMessage(error)}</p>
        <p>
          Check the local resources.json file and reload the application. No
          feature code was mounted with invalid configuration.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </section>
    </main>
  );
}
