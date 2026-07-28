import { FileWarning, MessageSquare } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, EmptyState } from "@/components/ui";
import { ReportForm } from "@/components/reports/ReportForm";

const STATUS_TONE: Record<string, "gray" | "yellow" | "green" | "red"> = {
  SUBMITTED: "yellow",
  UNDER_REVIEW: "yellow",
  RESOLVED: "green",
  DISMISSED: "gray",
};

const PRIORITY_TONE: Record<string, "gray" | "yellow" | "red"> = {
  low: "gray",
  normal: "gray",
  high: "yellow",
  urgent: "red",
};

export default async function ReportsPage() {
  const user = await requireRole("WORKER");
  const reports = await db.jobReport.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Submit progress updates, flag issues, or report incidents to the team."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionCard title="New report" description="We review every submission.">
            <ReportForm />
          </SectionCard>
        </div>

        <div className="lg:col-span-3">
          <SectionCard title="My reports" description="Everything you've submitted and its status.">
            {reports.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No reports yet">
                Your submitted reports will show up here.
              </EmptyState>
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileWarning className="h-4 w-4 text-slate-400" />
                          <p className="truncate text-sm font-semibold text-slate-800">{r.subject}</p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.body}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
                        <span className="text-[11px] text-slate-400">{r.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge tone="gray">{r.category}</Badge>
                      <Badge tone={PRIORITY_TONE[r.priority] ?? "gray"}>{r.priority}</Badge>
                    </div>
                    {r.resolutionNote && (
                      <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        Response: {r.resolutionNote}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
