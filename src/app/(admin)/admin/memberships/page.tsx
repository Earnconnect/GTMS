import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AdminMembershipsPage() {
  await requireAdmin();

  const memberships = await db.membership.findMany({
    include: { user: { select: { name: true, email: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const tierVariant: Record<string, "info" | "success" | "purple"> = {
    BASIC: "info",
    PROFESSIONAL: "success",
    EXECUTIVE: "purple",
  };

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    ACTIVE: "success",
    PAST_DUE: "warning",
    CANCELLED: "danger",
  };

  const counts = memberships.reduce((acc, m) => {
    acc[m.tier] = (acc[m.tier] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <PageHeader title="Memberships" description={`${memberships.length} total`} />

      <div className="flex gap-4 mb-6">
        {Object.entries(counts).map(([tier, count]) => (
          <div key={tier} className="px-4 py-3 bg-white rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500">{tier}</p>
            <p className="text-2xl font-bold text-gray-900">{count as number}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {memberships.map((m) => (
            <Link
              key={m.id}
              href={`/admin/users/${m.user.id}`}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{m.user.name ?? m.user.email}</p>
                <p className="text-xs text-gray-400">
                  {m.currentPeriodStart && new Date(m.currentPeriodStart).toLocaleDateString()} —{" "}
                  {m.currentPeriodEnd && new Date(m.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tierVariant[m.tier] ?? "default"}>{m.tier}</Badge>
                <Badge variant={statusVariant[m.status] ?? "default"}>{m.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
