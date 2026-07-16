import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';

type PanelErrorBoundaryProps = {
  panelTitle: string;
  resetKey: number;
  onRetry(): void;
  onRemove(): void;
  children: ReactNode;
};

type PanelErrorBoundaryState = {
  error?: Error;
};

export class PanelErrorBoundary extends Component<
  PanelErrorBoundaryProps,
  PanelErrorBoundaryState
> {
  state: PanelErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): PanelErrorBoundaryState {
    return {
      error,
    };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A real UI could send sanitized diagnostics through an injected logger.
  }

  componentDidUpdate(previousProps: PanelErrorBoundaryProps) {
    if (
      previousProps.resetKey !== this.props.resetKey &&
      this.state.error
    ) {
      this.setState({
        error: undefined,
      });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <article className="dynamic-panel dynamic-panel--failed" role="alert">
        <div className="dynamic-panel__heading">
          <div>
            <p className="eyebrow">Failed locally</p>
            <h2>{this.props.panelTitle}</h2>
          </div>
          <span className="status-chip status-chip--failed">Failed</span>
        </div>
        <p>{this.state.error.message}</p>
        <div className="approval-actions">
          <button type="button" onClick={this.props.onRetry}>
            Retry
          </button>
          <button type="button" onClick={this.props.onRemove}>
            Remove panel
          </button>
        </div>
      </article>
    );
  }
}
