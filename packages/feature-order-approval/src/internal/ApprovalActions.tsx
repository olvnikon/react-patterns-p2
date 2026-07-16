import type { OrderApprovalStatus } from '../model/orderApprovalTypes';

type ApprovalActionsProps = {
  status: OrderApprovalStatus;
  canApprove: boolean;
  canReject: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
};

export function ApprovalActions({
  status,
  canApprove,
  canReject,
  onApprove,
  onReject,
  onReset,
}: ApprovalActionsProps) {
  return (
    <div className="approval-actions">
      <button type="button" disabled={!canApprove} onClick={onApprove}>
        Approve
      </button>
      <button type="button" disabled={!canReject} onClick={onReject}>
        Reject
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
      <span>Status: {status}</span>
    </div>
  );
}
