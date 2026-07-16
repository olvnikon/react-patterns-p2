export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export type Money = {
  value: number;
  currency: CurrencyCode;
};
