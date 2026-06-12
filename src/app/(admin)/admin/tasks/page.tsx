import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export default async function AdminTasksPage() {
  await requireAdmin();

  const tasks = await db.task.findMany({
    include: {
      requester: { select: { name: true, email: true } },
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const pendingSubmissions = await db.submission.count({ where: { status: "PENDING" } });

  const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "danger"> = {
    ACTIVE: "success",
    DRAFT: "warning",
    PAUSED: "info",
    COMPLETED: "default",
    CANCELLED: "danger",
  };

  return (
    <div>
      <PageHeader title="Tasks" description={`${tasks.length} total · ${pendingSubmissions} submissions pending`} />

      <Card>
        <div className="divide-y divide-gray-100">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <Badge variant={statusVariant[t.status] ?? "default"}>{t.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {t.requester.name ?? t.requester.email} · {t.category.replace("_", " ")} · {t._count.assignments} units · {formatMoney(t.rewardPerUnitCents)}/unit
                </p>
                <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
