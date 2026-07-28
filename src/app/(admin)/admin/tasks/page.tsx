import Link from "next/link";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatMoney } from "@/lib/money";

export default async function AdminTasksPage() {
  await requireRole("ADMIN");
  const tasks = await db.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { name: true, email: true } } },
    take: 200,
  });

  return (
    <div>
      <PageHeader title="Tasks" subtitle="All tasks across the platform." />
      {tasks.length === 0 ? (
        <EmptyState>No tasks yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2">Requester</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Reward</th>
                <th className="px-4 py-2 text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/requester/tasks/${t.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {t.title}
                    </Link>
                    <div className="text-xs text-slate-400">{t.category}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {t.requester.name ?? t.requester.email}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-2 text-right">{formatMoney(t.rewardPerUnit)}</td>
                  <td className="px-4 py-2 text-right">{t.totalUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
