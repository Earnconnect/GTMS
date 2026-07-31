/**
 * A discreet indicator shown only while the platform isn't processing real
 * payments. Once PAYMENT_PROVIDER=stripe, this renders nothing.
 */
export function DemoBadge() {
  if ((process.env.PAYMENT_PROVIDER ?? "simulated").toLowerCase() === "stripe") {
    return null;
  }
  return (
    <span
      title="Preview environment — live payouts are enabled once billing is connected."
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Preview
    </span>
  );
}
