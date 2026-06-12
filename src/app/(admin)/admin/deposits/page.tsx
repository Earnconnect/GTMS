import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import DepositActions from "./DepositActions";

export default async function AdminDepositsPage() {
  await requireAdmin();

  const deposits = await db.deposit.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const recent = await db.deposit.findMany({
    where: { status: { not: "PENDING" } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader title="Deposit Queue" description={`${deposits.length} pending`} />

      {deposits.length > 0 && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending Deposits</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {deposits.map((d) => (
              <div key={d.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {d.user.name ?? d.user.email}
                    </p>
                    <p className="text-xs text-gray-500">{d.user.email}</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{formatMoney(d.amountCents)}</p>
                    <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  {d.proofUrl && (
                    <a
                      href={d.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 underline"
                    >
                      View Proof
                    </a>
                  )}
                </div>
                <DepositActions depositId={d.id} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {recent.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Deposits</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.user.name ?? d.user.email}</p>
                  <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-green-600">{formatMoney(d.amountCents)}</span>
                  <Badge variant={d.status === "APPROVED" ? "success" : "danger"}>{d.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
