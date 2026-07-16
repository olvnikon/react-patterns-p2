import { OrderApprovalEntry } from '@demo/feature-order-approval';
import { useParams } from 'react-router-dom';

export function OrderApprovalRoute() {
  const { orderId } = useParams();

  return <OrderApprovalEntry orderId={orderId ?? 'ORD-1001'} />;
}
