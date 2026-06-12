import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import PayoutActions from "./PayoutActions";

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const pending = await db.payout.findMany({
    where: { status: "REQUESTED" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const recent = await db.payout.findMany({
    where: { status: { not: "REQUESTED" } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const statusVariant: Record<string, "warning" | "success" | "danger" | "info" | "default"> = {
    REQUESTED: "warning",
    PROCESSING: "info",
    COMPLETED: "success",
    CANCELLED: "default",
    FAILED: "danger",
  };

  return (
    <div>
      <PageHeader title="Payout Queue" description={`${pending.length} awaiting processing`} />

      {pending.length > 0 && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending Payouts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((p) => {
              const details = p.details as Record<string, string> | null;
              return (
                <div key={p.id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.user.name ?? p.user.email}</p>
                      <p className="text-xs text-gray-500">{p.user.email}</p>
                      <p className="text-lg font-bold text-red-600 mt-1">{formatMoney(p.amountCents)}</p>
                      <p className="text-xs text-gray-400">{p.method} · {new Date(p.createdAt).toLocaleString()}</p>
                      {details && (
                        <div className="mt-1">
                          {Object.entries(details).map(([k, v]) => (
                            <p key={k} className="text-xs text-gray-600">{k}: {v}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <PayoutActions payoutId={p.id} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {recent.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Payouts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.user.name ?? p.user.email}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-600">{formatMoney(p.amountCents)}</span>
                  <Badge variant={statusVariant[p.status] ?? "default"}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
