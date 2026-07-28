import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function LeaderboardPage() {
  const me = await requireRole("WORKER");

  // Rank workers by total approved earnings.
  const grouped = await db.transaction.groupBy({
    by: ["walletId"],
    where: { type: "EARNING" },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
    take: 20,
  });

  const wallets = await db.walletAccount.findMany({
    where: { id: { in: grouped.map((g) => g.walletId) } },
    include: { user: { select: { id: true, name: true } } },
  });
  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  const rows = grouped
    .map((g) => ({
      walletId: g.walletId,
      earnings: g._sum.amount ?? 0,
      approved: g._count,
      user: walletMap.get(g.walletId)?.user,
    }))
    .filter((r) => r.user);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Top earners — based on approved deliverables."
      />
      {rows.length === 0 ? (
        <EmptyState>No earnings yet. Be the first!</EmptyState>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Worker</th>
                <th className="py-2 text-right">Approved</th>
                <th className="py-2 text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.walletId}
                  className={`border-t border-slate-100 ${
                    r.user?.id === me.id ? "bg-brand-50" : ""
                  }`}
                >
                  <td className="py-2 font-semibold text-slate-500">{i + 1}</td>
                  <td className="py-2 text-slate-800">
                    {r.user?.name ?? "Worker"}
                    {r.user?.id === me.id && (
                      <span className="ml-2 text-xs text-brand-600">(you)</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-slate-600">{r.approved}</td>
                  <td className="py-2 text-right font-medium">
                    {formatMoney(r.earnings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
