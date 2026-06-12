import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import TaskControls from "./TaskControls";
import Link from "next/link";
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  DollarSign,
} from "lucide-react";

const submissionVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  AUTO_APPROVED: "success",
  REJECTED: "danger",
};

export default async function BusinessTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireBusiness();
  const { id } = await params;

  const task = await db.task.findUnique({
    where: { id, requesterId: user.id },
  });

  if (!task) notFound();

  const [available, submitted, approved, pending] = await Promise.all([
    db.assignment.count({ where: { taskId: id, status: "AVAILABLE" } }),
    db.assignment.count({ where: { taskId: id, status: "SUBMITTED" } }),
    db.assignment.count({ where: { taskId: id, status: "APPROVED" } }),
    db.submission.count({ where: { assignment: { taskId: id }, status: "PENDING" } }),
  ]);

  const rejected = await db.submission.count({
    where: { assignment: { taskId: id }, status: "REJECTED" },
  });

  const recentSubmissions = await db.submission.findMany({
    where: { assignment: { taskId: id } },
    include: {
      worker: { select: { name: true } },
      assignment: { select: { unitIndex: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const statusStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-600",
    DRAFT: "bg-amber-50 text-amber-600",
    PAUSED: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12.5px] text-slate-400 pt-6 mb-4">
        <Link href="/business/tasks" className="hover:text-slate-600 transition-colors">Tasks</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 truncate max-w-[200px]">{task.title}</span>
      </div>

      {/* Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-[22px] font-bold text-slate-800 leading-tight">{task.title}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
              statusStyle[task.status] ?? "bg-slate-100 text-slate-600"
            }`}>
              {task.status}
            </span>
          </div>
          <p className="text-[13.5px] text-slate-600">{task.category.replace(/_/g, " ")}</p>
        </div>
        <div className="flex-shrink-0">
          <TaskControls
            task={{ id: task.id, status: task.status, requesterId: task.requesterId }}
            userId={user.id}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Available</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-slate-800">{available}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Pending Review</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-amber-600">{pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Approved</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-emerald-600">{approved}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Reward/Unit</p>
              <p className="mt-1.5 text-[28px] font-bold leading-none text-cyan-600">
                {formatMoney(task.rewardPerUnitCents)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <Card className="mb-5">
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Description</h2>
          </CardHeader>
          <CardContent>
            <p className="text-[13.5px] text-slate-600 leading-relaxed">{task.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Pending Review Banner */}
      {pending > 0 && (
        <Link
          href={`/business/tasks/${id}/review`}
          className="flex items-center justify-between px-5 py-4 mb-5 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-800">
                {pending} submission{pending !== 1 ? "s" : ""} waiting for review
              </p>
              <p className="text-[12.5px] text-amber-600">Click to approve or reject</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
        </Link>
      )}

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-800">Recent Submissions</h2>
          {pending > 0 && (
            <Link
              href={`/business/tasks/${id}/review`}
              className="text-[12.5px] text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1"
            >
              Review Pending <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </CardHeader>
        {recentSubmissions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[13.5px] text-slate-600 font-medium">No submissions yet</p>
            <p className="text-[12.5px] text-slate-400 mt-1">
              {task.status === "DRAFT"
                ? "Publish the task to start receiving submissions"
                : "Workers haven't submitted yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-medium text-slate-700">
                        {s.worker.name ?? "Worker"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-600">
                        #{s.assignment.unitIndex + 1}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-500">
                        {new Date(s.createdAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={submissionVariant[s.status] ?? "default"}>
                        {s.status.replace("_", " ")}
                      </Badge>
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
