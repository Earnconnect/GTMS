import { Briefcase, ClipboardList } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, StatCard, SectionCard, Avatar, EmptyState } from "@/components/ui";
import { AssignForm, AssignmentReview } from "@/components/admin/AssignWork";
import { SYSTEM_USER_EMAIL } from "@/lib/constants";

const STATUS_TONE: Record<string, "gray" | "yellow" | "blue" | "green" | "red"> = {
  ASSIGNED: "blue",
  IN_PROGRESS: "yellow",
  SUBMITTED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function AdminAssignmentsPage() {
  await requireRole("ADMIN");

  const [assignments, employees, jobs, templates] = await Promise.all([
    db.jobAssignment.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: { employee: { select: { name: true, email: true } } },
    }),
    db.user.findMany({
      where: { employmentStatus: { not: null }, email: { not: SYSTEM_USER_EMAIL } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, jobTitle: true, department: true },
    }),
    db.jobPosting.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    db.assignmentTemplate.findMany({
      where: { active: true },
      orderBy: [{ role: "asc" }, { title: "asc" }],
      select: { id: true, title: true, brief: true, role: true, department: true, estimatedHours: true, difficulty: true },
    }),
  ]);

  const submitted = assignments.filter((a) => a.status === "SUBMITTED").length;
  const active = assignments.filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS").length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Work assignments" subtitle="Assign jobs to employees and review their submitted work." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active" value={active} icon={<Briefcase className="h-5 w-5" />} tone="brand" />
        <StatCard label="Awaiting review" value={submitted} icon={<ClipboardList className="h-5 w-5" />} tone="amber" />
        <StatCard label="Completed" value={completed} icon={<ClipboardList className="h-5 w-5" />} tone="emerald" />
      </div>

      <SectionCard
        title="Assign work"
        description={`Pick from ${templates.length} ready-made assignments matched to the employee's role, or write your own.`}
      >
        <AssignForm employees={employees} jobs={jobs} templates={templates} />
      </SectionCard>

      {assignments.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No assignments yet">
          Assign work above, or place a candidate in Job placements to auto-create their first assignment.
        </EmptyState>
      ) : (
        <SectionCard title="All assignments">
          <ul className="space-y-4">
            {assignments.map((a) => (
              <li key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={a.employee.name} email={a.employee.email} size={34} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-400">
                        {a.employee.name ?? a.employee.email}
                        {a.dueAt ? ` · due ${a.dueAt.toLocaleDateString()}` : ""}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.brief}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
                </div>
                {a.submissionNote && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Submission:</span> {a.submissionNote}
                  </p>
                )}
                {a.status === "SUBMITTED" && <AssignmentReview assignmentId={a.id} />}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
