import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { PayoutControls } from "@/components/admin/PayoutControls";
import { formatMoney } from "@/lib/money";

export default async function AdminPayoutsPage() {
  await requireRole("ADMIN");
  const payouts = await db.payout.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 200,
  });

  const pending = payouts.filter((p) =>
    ["REQUESTED", "APPROVED", "PROCESSING"].includes(p.status),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Payroll"
        title="Withdrawals"
        subtitle="Review and process the withdrawal requests your team submits, releasing verified balances to their chosen payout method."
      />
      {payouts.length === 0 ? (
        <EmptyState>No payouts yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Worker</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">
                      {p.user.name ?? p.user.email}
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.createdAt.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatMoney(p.amount)}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2">
                    {["REQUESTED", "APPROVED"].includes(p.status) ? (
                      <PayoutControls payoutId={p.id} />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-sm text-slate-500">{pending.length} pending.</p>
    </div>
  );
}
