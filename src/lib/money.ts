// All money is stored as integer minor units (cents). Never use floats for money.

/** Format integer cents as a currency string, e.g. 1234 -> "$12.34". */
export function formatMoney(cents: number, currency = "USD"): string {
  const amount = (cents ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/** Parse a user-entered dollar string/number into integer cents. */
export function toCents(dollars: string | number): number {
  const n = typeof dollars === "string" ? Number(dollars) : dollars;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Convert integer cents to a plain dollar number (for inputs/display only). */
export function toDollars(cents: number): number {
  return (cents ?? 0) / 100;
}

/** Apply a basis-points fee to an amount of cents, returning the fee in cents. */
export function feeFromBps(cents: number, bps: number): number {
  return Math.round((cents * bps) / 10_000);
}
