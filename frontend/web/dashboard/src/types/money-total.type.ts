/** An amount in minor units for one currency, as the analytics endpoint reports it. */
export interface MoneyTotal {
  currency: string;
  total_amount_minor: number;
}
