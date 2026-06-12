import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { Plus, Eye, ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "info" | "default" | "danger"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  PAUSED: "info",
  COMPLETED: "default",
  CANCELLED: "danger",
};

export default async function BusinessTasksPage() {
  const user = await requireBusiness();

  const tasks = await db.task.findMany({
    where: { requesterId: user.id },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const taskIds = tasks.map((t) => t.id);

  const submissionCounts = taskIds.length > 0
    ? await db.submission.groupBy({
        by: ["status"],
        where: { assignment: { taskId: { in: taskIds } } },
        _count: { _all: true },
      })
    : [];

  const pendingCount = submissionCounts.find((s) => s.status === "PENDING")?._count._all ?? 0;

  const activeCount = tasks.filter((t) => t.status === "ACTIVE").length;
  const draftCount = tasks.filter((t) => t.status === "DRAFT").length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const cancelledCount = tasks.filter((t) => t.status === "CANCELLED").length;

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">My Tasks</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            {pendingCount > 0
              ? `${pendingCount} submission${pendingCount !== 1 ? "s" : ""} pending review`
              : "Manage your workforce tasks"}
          </p>
        </div>
        <Link
          href="/business/tasks/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          <Plus className="w-4 h-4" />
          Post New Task
        </Link>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active",
            value: activeCount,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            label: "Draft",
            value: draftCount,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: <ClipboardList className="w-5 h-5 text-amber-500" />,
          },
          {
            label: "Completed",
            value: completedCount,
            color: "text-slate-600",
            bg: "bg-slate-50",
            icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
          },
          {
            label: "Pending Review",
            value: pendingCount,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: <Clock className="w-5 h-5 text-amber-500" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className={`mt-1.5 text-[28px] font-bold leading-none ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Post your first task to start collecting workforce data."
          action={
            <Link
              href="/business/tasks/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
            >
              <Plus className="w-4 h-4" />
              Post a Task
            </Link>
          }
        />
      ) : (
        <Card>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold text-slate-800">All Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Reward/Unit
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-medium text-slate-700 max-w-[200px] truncate">
                        {t.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-600">
                        {t.category.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[t.status] ?? "default"}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-700">{t._count.assignments}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-medium text-slate-700">
                        {formatMoney(t.rewardPerUnitCents)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/business/tasks/${t.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[12.5px] font-medium hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
