import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { Card, CardContent, CardHeader, Badge, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

function getStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
  if (status === "APPROVED" || status === "AUTO_APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING") return "warning";
  return "default";
}

export default async function SubmissionsPage() {
  const user = await requireWorker();

  const submissions = await db.submission.findMany({
    where: { workerId: user.id },
    include: {
      assignment: {
        include: {
          task: { select: { title: true, category: true, rewardPerUnitCents: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalApproved = submissions.filter(
    (s) => s.status === "APPROVED" || s.status === "AUTO_APPROVED"
  ).length;
  const totalPending = submissions.filter(
    (s) => s.status === "PENDING"
  ).length;
  const totalRejected = submissions.filter((s) => s.status === "REJECTED").length;

  const totalEarnedCents = submissions
    .filter((s) => s.status === "APPROVED" || s.status === "AUTO_APPROVED")
    .reduce((sum, s) => sum + s.assignment.task.rewardPerUnitCents, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">My Submissions</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            Track the status of all your submitted work
          </p>
        </div>
        <Link
          href="/dashboard/tasks"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          Browse Tasks <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-slate-700">{submissions.length}</p>
              <p className="mt-1.5 text-[12px] text-slate-400">submissions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Approved</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-emerald-600">{totalApproved}</p>
              <p className="mt-1.5 text-[12px] text-slate-400">tasks</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-amber-600">{totalPending}</p>
              <p className="mt-1.5 text-[12px] text-slate-400">in review</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Earned</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none" style={{ color: "#F56565" }}>
                {formatMoney(totalEarnedCents)}
              </p>
              <p className="mt-1.5 text-[12px] text-slate-400">from approved</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Complete your first task to see submissions here."
          action={
            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
            >
              Browse Tasks
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-800">All Submissions</h2>
            </div>
            <span className="text-[12px] text-slate-400">{submissions.length} total</span>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Task
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      Reward
                    </th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => {
                    const isApproved = sub.status === "APPROVED" || sub.status === "AUTO_APPROVED";
                    return (
                      <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-[13.5px] font-medium text-slate-700 truncate max-w-[220px]">
                              {sub.assignment.task.title}
                            </p>
                            {sub.rejectReason && (
                              <p className="text-[11.5px] text-red-500 mt-0.5 truncate max-w-[220px]">
                                {sub.rejectReason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-[12.5px] text-slate-400">
                            {sub.assignment.task.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-[12.5px] text-slate-400">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={getStatusVariant(sub.status)}>
                            {sub.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isApproved ? (
                            <span className="text-[13.5px] font-semibold" style={{ color: "#F56565" }}>
                              {formatMoney(sub.assignment.task.rewardPerUnitCents)}
                            </span>
                          ) : (
                            <span className="text-[13px] text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/dashboard/submissions/${sub.id}`}
                            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-cyan-600 hover:text-cyan-700"
                          >
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
