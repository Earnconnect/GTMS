import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, EmptyState, Badge } from "@/components/ui";
import Link from "next/link";
import { AlertTriangle, MessageSquare } from "lucide-react";

export default async function BusinessDisputesPage() {
  const user = await requireBusiness();

  const disputes = await db.dispute.findMany({
    where: {
      task: { requesterId: user.id },
    },
    include: {
      openedBy: { select: { name: true } },
      task: { select: { title: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusVariant: Record<string, "warning" | "info" | "success" | "default"> = {
    OPEN: "warning",
    IN_REVIEW: "info",
    RESOLVED: "success",
    CLOSED: "default",
  };

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const underReviewCount = disputes.filter((d) => d.status === "IN_REVIEW").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED" || d.status === "CLOSED").length;

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 mb-6">
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Disputes</h1>
        <p className="mt-1 text-[13.5px] text-slate-600">
          {disputes.length > 0
            ? `${disputes.length} dispute${disputes.length !== 1 ? "s" : ""} raised about your tasks`
            : "Disputes raised about your tasks"}
        </p>
      </div>

      {/* Stats */}
      {disputes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Open", value: openCount, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Under Review", value: underReviewCount, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Resolved", value: resolvedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80"
            >
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`mt-1.5 text-[28px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {disputes.length === 0 ? (
        <EmptyState
          title="No disputes"
          description="No disputes have been raised about your tasks."
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">All Disputes</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Task / Worker
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-medium text-slate-700 max-w-[180px] truncate">
                        {d.task?.title ?? "Unknown Task"}
                      </p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5">
                        by {d.openedBy.name ?? "Worker"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-600 max-w-[200px] truncate">{d.reason}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[13.5px] text-slate-600">{d._count.messages}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[d.status] ?? "default"}>
                        {d.status.replace("_", " ")}
                      </Badge>
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
