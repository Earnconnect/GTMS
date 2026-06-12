import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { TrendingUp, ClipboardList, CheckCircle2, DollarSign, BarChart2 } from "lucide-react";

const statusVariant: Record<string, "success" | "warning" | "danger" | "default" | "info"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  PAUSED: "info",
  COMPLETED: "default",
  CANCELLED: "danger",
};

export default async function BusinessReportsPage() {
  const user = await requireBusiness();

  const [tasks, submissionStats] = await Promise.all([
    db.task.findMany({
      where: { requesterId: user.id },
      select: {
        id: true,
        title: true,
        rewardPerUnitCents: true,
        status: true,
        createdAt: true,
      },
    }),
    db.submission.groupBy({
      by: ["status"],
      where: { assignment: { task: { requesterId: user.id } } },
      _count: { _all: true },
    }),
  ]);

  const totalSpent = await db.transaction.aggregate({
    where: {
      wallet: { userId: user.id },
      type: { in: ["PLATFORM_FEE"] },
    },
    _sum: { amountCents: true },
  });

  const approved = submissionStats.find((s) => s.status === "APPROVED")?._count._all ?? 0;
  const autoApproved = submissionStats.find((s) => s.status === "AUTO_APPROVED")?._count._all ?? 0;
  const rejected = submissionStats.find((s) => s.status === "REJECTED")?._count._all ?? 0;
  const pending = submissionStats.find((s) => s.status === "PENDING")?._count._all ?? 0;
  const total = approved + autoApproved + rejected + pending;

  const approvalRate = total > 0 ? (((approved + autoApproved) / total) * 100).toFixed(1) : "0.0";

  const tasksByStatus = ["ACTIVE", "DRAFT", "PAUSED", "COMPLETED", "CANCELLED"].reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<string, typeof tasks>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 mb-6">
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Reports</h1>
        <p className="mt-1 text-[13.5px] text-slate-600">
          Workforce performance data for your tasks
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          color="cyan"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <StatCard
          label="Total Submissions"
          value={total}
          color="purple"
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatCard
          label="Approval Rate"
          value={`${approvalRate}%`}
          color="green"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Platform Fees Paid"
          value={formatMoney(totalSpent._sum.amountCents ?? 0)}
          color="yellow"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Submission Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Submission Breakdown</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Approved",
                count: approved + autoApproved,
                color: "text-emerald-600",
                bar: "bg-emerald-400",
                pct: total > 0 ? ((approved + autoApproved) / total) * 100 : 0,
              },
              {
                label: "Pending",
                count: pending,
                color: "text-amber-600",
                bar: "bg-amber-400",
                pct: total > 0 ? (pending / total) * 100 : 0,
              },
              {
                label: "Rejected",
                count: rejected,
                color: "text-red-500",
                bar: "bg-red-400",
                pct: total > 0 ? (rejected / total) * 100 : 0,
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13.5px] text-slate-700">{s.label}</span>
                  <span className={`text-[13.5px] font-semibold ${s.color}`}>{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.bar} transition-all duration-500`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {total === 0 && (
              <p className="text-[13.5px] text-slate-400 text-center py-2">No submissions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Task Status */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Task Status</h2>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {["ACTIVE", "DRAFT", "PAUSED", "COMPLETED", "CANCELLED"].map((status) => {
              const count = tasksByStatus[status]?.length ?? 0;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={statusVariant[status] ?? "default"}>{status}</Badge>
                  <span className="text-[13.5px] font-semibold text-slate-800">{count}</span>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <p className="text-[13.5px] text-slate-400 text-center py-2">No tasks yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost per Task Table */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">Cost per Task</h2>
        </CardHeader>
        {tasks.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[13.5px] text-slate-500">No tasks to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Reward/Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-medium text-slate-700 max-w-[220px] truncate">
                        {t.title}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[t.status] ?? "default"}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-[13.5px] font-semibold text-slate-700">
                        {formatMoney(t.rewardPerUnitCents)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
