import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import FraudFlagActions from "./FraudFlagActions";

export default async function AdminFraudPage() {
  await requireAdmin();

  const flags = await db.fraudFlag.findMany({
    where: { resolvedAt: null },
    include: {
      user: { select: { name: true, email: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const resolved = await db.fraudFlag.findMany({
    where: { resolvedAt: { not: null } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { resolvedAt: "desc" },
    take: 20,
  });

  const severityVariant: Record<string, "warning" | "danger" | "info"> = {
    LOW: "info",
    MEDIUM: "warning",
    HIGH: "danger",
  };

  return (
    <div>
      <PageHeader title="Fraud Flags" description={`${flags.length} active flags`} />

      {flags.length > 0 && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Flags</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {flags.map((f) => (
              <div key={f.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{f.user.name ?? f.user.email}</p>
                      <Badge variant={severityVariant[f.severity] ?? "default"}>{f.severity}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{f.flagType}</p>
                    <p className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <FraudFlagActions flagId={f.id} userId={f.userId} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {resolved.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Resolved</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {resolved.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-gray-900">{f.user.name ?? f.user.email}</p>
                  <p className="text-xs text-gray-400">{f.flagType}</p>
                </div>
                <span className="text-xs text-gray-500">
                  Resolved {f.resolvedAt && new Date(f.resolvedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
