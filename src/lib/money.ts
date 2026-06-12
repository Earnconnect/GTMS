export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function toDollars(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(toDollars(cents));
}

export function feeFromBps(amountCents: number, feeBps: number): number {
  return Math.floor((amountCents * feeBps) / 10000);
}
