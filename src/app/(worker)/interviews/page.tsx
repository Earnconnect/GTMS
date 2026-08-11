import Link from "next/link";
import { Video, Calendar, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Badge, SectionCard, EmptyState } from "@/components/ui";

const STATUS_TONE: Record<string, "gray" | "yellow" | "green" | "red"> = {
  SCHEDULED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
  NO_SHOW: "red",
};

export default async function InterviewsPage() {
  const user = await requireRole("WORKER");
  const interviews = await db.interview.findMany({
    where: { application: { applicantId: user.id } },
    orderBy: { scheduledAt: "desc" },
    include: { application: { include: { job: { select: { title: true, department: true } } } } },
  });

  const upcoming = interviews.filter((i) => i.status === "SCHEDULED");
  const past = interviews.filter((i) => i.status !== "SCHEDULED");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recruiting"
        title="Interviews"
        subtitle="Your upcoming and past interviews, all in one place. Join secure video rooms right here when it's time — no external tools or downloads required."
      />

      {interviews.length === 0 ? (
        <EmptyState icon={<Video className="h-5 w-5" />} title="No interviews scheduled">
          When a recruiter schedules an interview for one of your applications, it&apos;ll appear here.
          <div className="mt-4">
            <Link href="/jobs" className="font-medium text-brand-600 hover:underline">
              Browse job placements →
            </Link>
          </div>
        </EmptyState>
      ) : (
        <>
          {upcoming.length > 0 && (
            <SectionCard title="Upcoming" description="Join a few minutes early to test your setup.">
              <ul className="space-y-3">
                {upcoming.map((i) => (
                  <li
                    key={i.id}
                    className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {i.application.job.title} · {i.round}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {i.scheduledAt.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {i.durationMins} min
                        </span>
                        <span>Code {i.meetingCode}</span>
                      </div>
                    </div>
                    <Link
                      href={`/interview/${i.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      <Video className="h-4 w-4" /> Join room
                    </Link>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {past.length > 0 && (
            <SectionCard title="Past interviews">
              <ul className="divide-y divide-slate-100">
                {past.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {i.application.job.title} · {i.round}
                      </p>
                      <p className="text-xs text-slate-400">{i.scheduledAt.toLocaleString()}</p>
                      {i.feedback && <p className="mt-1 text-xs text-slate-500">Feedback: {i.feedback}</p>}
                    </div>
                    <Badge tone={STATUS_TONE[i.status]}>
                      {i.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                      {i.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </>
      )}

      <div className="flex justify-end">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
          Back to placements <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
