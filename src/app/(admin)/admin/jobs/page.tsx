import { Briefcase, Users } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, Avatar, EmptyState } from "@/components/ui";
import { CreateJobForm, JobStatusToggle, ApplicationDecision } from "@/components/admin/JobAdmin";
import { InterviewScheduler } from "@/components/admin/InterviewScheduler";
import { formatMoney } from "@/lib/money";

const APP_TONE: Record<string, "gray" | "yellow" | "green" | "blue" | "red"> = {
  APPLIED: "blue",
  UNDER_REVIEW: "yellow",
  INTERVIEW: "yellow",
  PLACED: "green",
  REJECTED: "red",
  WITHDRAWN: "gray",
};

export default async function AdminJobsPage() {
  await requireRole("ADMIN");
  const jobs = await db.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: { applicant: { select: { id: true, name: true, email: true, cvUrl: true } }, interview: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Job placements" subtitle="Post roles and move applicants through the pipeline." />

      <SectionCard title="Create a placement" description="Publish an internal role for your team to apply to.">
        <CreateJobForm />
      </SectionCard>

      {jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No roles yet">
          Post your first placement above.
        </EmptyState>
      ) : (
        jobs.map((job) => (
          <SectionCard
            key={job.id}
            title={job.title}
            description={`${job.department} · ${job.location} · ${job.applications.length} applicant(s)`}
            action={
              <div className="flex items-center gap-2">
                <Badge tone={job.status === "OPEN" ? "green" : "gray"}>{job.status}</Badge>
                <JobStatusToggle jobId={job.id} status={job.status} />
              </div>
            }
          >
            {(job.salaryMinCents || job.salaryMaxCents) && (
              <p className="mb-3 text-sm font-medium text-slate-700">
                {formatMoney(job.salaryMinCents ?? job.salaryMaxCents ?? 0)}
                {job.salaryMaxCents && job.salaryMinCents ? ` – ${formatMoney(job.salaryMaxCents)}` : ""}
              </p>
            )}
            {job.applications.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" /> No applicants yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {job.applications.map((a) => (
                  <li key={a.id} className="space-y-3 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.applicant.name} email={a.applicant.email} size={34} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {a.applicant.name ?? a.applicant.email}
                          </p>
                          {a.coverNote && <p className="truncate text-xs text-slate-400">{a.coverNote}</p>}
                          {a.applicant.cvUrl && (
                            <a
                              href={`/api/cv/${a.applicant.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-brand-600 hover:underline"
                            >
                              View CV →
                            </a>
                          )}
                        </div>
                        <Badge tone={APP_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
                      </div>
                      <ApplicationDecision applicationId={a.id} />
                    </div>
                    <InterviewScheduler
                      applicationId={a.id}
                      interview={
                        a.interview
                          ? {
                              id: a.interview.id,
                              scheduledAt: a.interview.scheduledAt.toISOString(),
                              round: a.interview.round,
                              status: a.interview.status,
                              meetingCode: a.interview.meetingCode,
                            }
                          : null
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        ))
      )}
    </div>
  );
}
