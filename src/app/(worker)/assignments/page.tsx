import Link from "next/link";
import { Briefcase, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, StatCard, EmptyState } from "@/components/ui";

const STATUS_TONE: Record<string, "gray" | "yellow" | "blue" | "green" | "red"> = {
  ASSIGNED: "blue",
  IN_PROGRESS: "yellow",
  SUBMITTED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function AssignmentsPage() {
  const user = await requireRole("WORKER");
  const assignments = await db.jobAssignment.findMany({
    where: { employeeId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const active = assignments.filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS").length;
  const inReview = assignments.filter((a) => a.status === "SUBMITTED").length;
  const done = assignments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <PageHeader title="My work" subtitle="Jobs assigned to you. Start one, do the work, and submit it for review." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={active} icon={<Briefcase className="h-5 w-5" />} tone="brand" />
        <StatCard label="In review" value={inReview} icon={<Clock className="h-5 w-5" />} tone="amber" />
        <StatCard label="Completed" value={done} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No assignments yet">
          When you&apos;re placed in a role or assigned a job, it&apos;ll appear here to start working on.
          <div className="mt-4">
            <Link href="/jobs" className="font-medium text-brand-600 hover:underline">
              Browse job placements →
            </Link>
          </div>
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/assignments/${a.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">{a.title}</h3>
                <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{a.brief}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>
                  {a.dueAt ? `Due ${a.dueAt.toLocaleDateString()}` : "No due date"}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-brand-600">
                  {a.status === "ASSIGNED" ? "Start" : a.status === "COMPLETED" ? "View" : "Open"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
