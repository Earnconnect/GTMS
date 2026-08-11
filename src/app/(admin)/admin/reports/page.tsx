import { FileWarning } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, StatCard, Avatar, EmptyState } from "@/components/ui";
import { ReportReview } from "@/components/admin/ReportReview";

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

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const [reports, open] = await Promise.all([
    db.jobReport.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { author: { select: { name: true, email: true } } },
    }),
    db.jobReport.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Employee reports"
        subtitle="Stay on top of the progress updates, issues, and incidents your team raises — review each report and resolve it so nothing falls through the cracks."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={open} icon={<FileWarning className="h-5 w-5" />} tone="amber" />
        <StatCard label="Total" value={reports.length} icon={<FileWarning className="h-5 w-5" />} tone="slate" />
        <StatCard label="Resolved" value={reports.filter((r) => r.status === "RESOLVED").length} icon={<FileWarning className="h-5 w-5" />} tone="emerald" />
      </div>

      {reports.length === 0 ? (
        <EmptyState icon={<FileWarning className="h-5 w-5" />} title="No reports yet">
          Employee reports will appear here for review.
        </EmptyState>
      ) : (
        <SectionCard title="All reports">
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.author.name} email={r.author.email} size={34} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{r.subject}</p>
                      <p className="text-xs text-slate-400">
                        {r.author.name ?? r.author.email} · {r.createdAt.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{r.body}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Badge>
                    <div className="flex gap-1">
                      <Badge tone="gray">{r.category}</Badge>
                      <Badge tone={PRIORITY_TONE[r.priority] ?? "gray"}>{r.priority}</Badge>
                    </div>
                  </div>
                </div>
                {r.resolutionNote && (
                  <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    Response: {r.resolutionNote}
                  </p>
                )}
                {r.status !== "RESOLVED" && r.status !== "DISMISSED" && <ReportReview reportId={r.id} />}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
