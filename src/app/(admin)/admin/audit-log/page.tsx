import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = 50;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count(),
  ]);

  const roleVariant: Record<string, "info" | "success" | "purple" | "default"> = {
    WORKER: "info",
    BUSINESS: "success",
    ADMIN: "purple",
  };

  return (
    <div>
      <PageHeader title="Audit Log" description={`${total.toLocaleString()} entries`} />

      <Card>
        <div className="divide-y divide-gray-100">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-4 px-6 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {l.actor?.name ?? l.actor?.email ?? "System"}
                  </span>
                  <Badge variant={roleVariant[l.actorRole] ?? "default"}>{l.actorRole}</Badge>
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {l.action}
                  </span>
                </div>
                {l.targetType && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {l.targetType}: {l.targetId?.slice(-12)}
                  </p>
                )}
                {l.ipAddress && (
                  <p className="text-xs text-gray-400">{l.ipAddress}</p>
                )}
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(l.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {total > pageSize && (
        <div className="flex justify-center gap-4 mt-6">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          {page * pageSize < total && (
            <a href={`?page=${page + 1}`} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
