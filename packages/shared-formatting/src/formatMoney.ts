import type { Money } from '@demo/shared-types';

export function formatMoney(amount: Money) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
    maximumFractionDigits: 0,
  }).format(amount.value);
}
