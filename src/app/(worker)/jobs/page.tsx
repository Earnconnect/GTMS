import { MapPin, Briefcase, Building2, Banknote, CheckCircle2, Clock } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, EmptyState } from "@/components/ui";
import { ApplyButton } from "@/components/jobs/ApplyButton";
import { formatMoney } from "@/lib/money";

const TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  REMOTE: "Remote",
  INTERNSHIP: "Internship",
};

const APP_TONE: Record<string, "gray" | "yellow" | "green" | "blue" | "red"> = {
  APPLIED: "blue",
  UNDER_REVIEW: "yellow",
  INTERVIEW: "yellow",
  PLACED: "green",
  REJECTED: "red",
  WITHDRAWN: "gray",
};

function salaryRange(min: number | null, max: number | null) {
  if (!min && !max) return null;
  if (min && max) return `${formatMoney(min)} – ${formatMoney(max)}`;
  return formatMoney((min ?? max)!);
}

export default async function JobsPage() {
  const user = await requireRole("WORKER");

  const [jobs, myApps, me] = await Promise.all([
    db.jobPosting.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    }),
    db.jobApplication.findMany({
      where: { applicantId: user.id },
      include: { job: { select: { title: true, department: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({ where: { id: user.id }, select: { cvUrl: true } }),
  ]);

  const appliedMap = new Map(myApps.map((a) => [a.jobId, a.status]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Careers"
        title="Job placements"
        subtitle="Explore open roles across the organization. Submit your application and our recruiting team will review your profile and place you where you'll thrive."
      />

      {myApps.length > 0 && (
        <SectionCard title="My applications" description="Roles you've applied to and where they stand.">
          <ul className="divide-y divide-slate-100">
            {myApps.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.job.title}</p>
                  <p className="text-xs text-slate-400">{a.job.department}</p>
                </div>
                <Badge tone={APP_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {jobs.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No open roles right now">
          Check back soon — new placements are posted regularly.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => {
            const status = appliedMap.get(job.id);
            const pay = salaryRange(job.salaryMinCents, job.salaryMaxCents);
            return (
              <div
                key={job.id}
                className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                    </div>
                  </div>
                  <Badge tone="blue">{TYPE_LABEL[job.type] ?? job.type}</Badge>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{job.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="text-sm">
                    {pay ? (
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                        <Banknote className="h-4 w-4 text-emerald-600" /> {pay}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{job._count.applications} applicants</span>
                    )}
                  </div>
                  {status ? (
                    <Badge tone={APP_TONE[status]}>
                      {status === "PLACED" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {status.replace("_", " ")}
                    </Badge>
                  ) : (
                    <ApplyButton jobId={job.id} hasCv={Boolean(me?.cvUrl)} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
