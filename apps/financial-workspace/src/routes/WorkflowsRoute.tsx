import {
  OrderTicketEntry,
  type OrderTicketLogic,
} from '@demo/feature-workflow-lab';

type WorkflowsRouteProps = {
  orderTicketLogic: OrderTicketLogic;
};

export function WorkflowsRoute({
  orderTicketLogic,
}: WorkflowsRouteProps) {
  return (
    <OrderTicketEntry
      logic={orderTicketLogic}
      ticketId="TICKET-DEMO-01"
    />
  );
}
