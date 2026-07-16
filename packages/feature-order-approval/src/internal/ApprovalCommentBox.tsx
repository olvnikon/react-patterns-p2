type ApprovalCommentBoxProps = {
  comment: string;
  onCommentChange: (comment: string) => void;
};

export function ApprovalCommentBox({
  comment,
  onCommentChange,
}: ApprovalCommentBoxProps) {
  return (
    <label className="form-field">
      <span>Approval comment</span>
      <textarea
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
        placeholder="Add a generic review comment"
        rows={5}
      />
    </label>
  );
}
