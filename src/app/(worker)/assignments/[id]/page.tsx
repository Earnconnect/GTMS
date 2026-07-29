import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, SectionCard } from "@/components/ui";
import { StartButton, SubmitWork } from "@/components/work/AssignmentActions";

const STATUS_TONE: Record<string, "gray" | "yellow" | "blue" | "green" | "red"> = {
  ASSIGNED: "blue",
  IN_PROGRESS: "yellow",
  SUBMITTED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("WORKER");

  const a = await db.jobAssignment.findUnique({
    where: { id },
    include: { job: { select: { department: true, location: true } } },
  });
  if (!a || a.employeeId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <Link href="/assignments" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to my work
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{a.title}</h1>
          <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          {a.job?.department && <span>{a.job.department}</span>}
          {a.dueAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Due {a.dueAt.toLocaleDateString()}
            </span>
          )}
          {a.startedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> Started {a.startedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <SectionCard title="Assignment brief" description="What you need to do.">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{a.brief}</p>
      </SectionCard>

      {a.status === "ASSIGNED" && (
        <SectionCard title="Ready to begin?" description="Start the assignment when you're ready to work on it.">
          <StartButton assignmentId={a.id} />
        </SectionCard>
      )}

      {a.status === "IN_PROGRESS" && (
        <SectionCard title="Submit your work" description="When you're done, summarize what you completed and submit for review.">
          <SubmitWork assignmentId={a.id} />
        </SectionCard>
      )}

      {a.status === "SUBMITTED" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Clock className="h-5 w-5 shrink-0" />
          Submitted for review — your manager will get back to you shortly.
        </div>
      )}

      {a.status === "COMPLETED" && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Approved and completed{a.completedAt ? ` on ${a.completedAt.toLocaleDateString()}` : ""}. Nice work!
        </div>
      )}

      {a.submissionNote && (
        <SectionCard title="Your submission" action={<FileText className="h-4 w-4 text-slate-400" />}>
          <p className="whitespace-pre-line text-sm text-slate-600">{a.submissionNote}</p>
        </SectionCard>
      )}

      {a.reviewNote && (
        <SectionCard title="Reviewer feedback">
          <p className="text-sm text-slate-600">{a.reviewNote}</p>
        </SectionCard>
      )}
    </div>
  );
}
