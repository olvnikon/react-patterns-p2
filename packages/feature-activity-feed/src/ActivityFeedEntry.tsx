type ActivityFeedEntryProps = {
  userId: string;
};

export function ActivityFeedEntry({ userId }: ActivityFeedEntryProps) {
  return (
    <article className="workspace-panel">
      <h2>Activity Feed</h2>
      <p>{userId}</p>
      <ul className="placeholder-list">
        <li>
          <span>Order reviewed</span>
          <strong>Today</strong>
        </li>
        <li>
          <span>Report generated</span>
          <strong>Today</strong>
        </li>
        <li>
          <span>Approval completed</span>
          <strong>Today</strong>
        </li>
      </ul>
    </article>
  );
}
