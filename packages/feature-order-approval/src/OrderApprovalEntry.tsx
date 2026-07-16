import { OrderApprovalView } from './internal/OrderApprovalView';

type OrderApprovalEntryProps = {
  orderId: string;
};

export function OrderApprovalEntry({ orderId }: OrderApprovalEntryProps) {
  return <OrderApprovalView orderId={orderId} />;
}
