import Link from "next/link";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, ButtonLink, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatMoney } from "@/lib/money";

export default async function RequesterTasksPage() {
  const user = await requireRole("REQUESTER");

  const tasks = await db.task.findMany({
    where: { requesterId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="My tasks"
        subtitle="Tasks you've created."
        action={<ButtonLink href="/requester/tasks/new">New task</ButtonLink>}
      />

      {tasks.length === 0 ? (
        <EmptyState>You haven&apos;t created any tasks yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link key={t.id} href={`/requester/tasks/${t.id}`}>
              <Card className="transition hover:border-brand-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{t.title}</h3>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {t.category} • {t.totalUnits} units •{" "}
                      {formatMoney(t.rewardPerUnit)}/unit
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
