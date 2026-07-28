import type { Transaction } from "@prisma/client";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/ui";

export function TxnTable({ txns }: { txns: Transaction[] }) {
  if (txns.length === 0) {
    return <EmptyState>No transactions yet.</EmptyState>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {txns.map((t) => (
            <tr key={t.id} className="border-b border-slate-50 last:border-0">
              <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                {t.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-slate-700">{t.type.replaceAll("_", " ")}</td>
              <td className="px-4 py-2 text-slate-500">{t.description}</td>
              <td
                className={`px-4 py-2 text-right font-medium ${
                  t.amount >= 0 ? "text-green-600" : "text-slate-700"
                }`}
              >
                {t.amount >= 0 ? "+" : ""}
                {formatMoney(t.amount)}
              </td>
              <td className="px-4 py-2 text-right text-slate-500">
                {formatMoney(t.balanceAfter)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
