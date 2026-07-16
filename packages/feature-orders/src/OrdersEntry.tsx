type OrdersEntryProps = {
  selectedDeskId: string;
  selectedPortfolioId: string;
};

export function OrdersEntry({
  selectedDeskId,
  selectedPortfolioId,
}: OrdersEntryProps) {
  return (
    <section className="page-section">
      <div>
        <p className="eyebrow">Orders</p>
        <h1>Orders Workspace</h1>
      </div>
      <article className="workspace-panel">
        <h2>Current Selection</h2>
        <dl>
          <div>
            <dt>Desk</dt>
            <dd>{selectedDeskId}</dd>
          </div>
          <div>
            <dt>Portfolio</dt>
            <dd>{selectedPortfolioId}</dd>
          </div>
        </dl>
      </article>
      <article className="workspace-panel">
        <h2>Order Blotter</h2>
        <ul className="placeholder-list">
          <li>
            <span>ORD-1001</span>
            <strong>Pending</strong>
          </li>
          <li>
            <span>ORD-1002</span>
            <strong>Reviewed</strong>
          </li>
          <li>
            <span>ORD-1003</span>
            <strong>Draft</strong>
          </li>
        </ul>
      </article>
    </section>
  );
}
