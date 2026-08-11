import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, FileText, MessagesSquare } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, SectionCard, Avatar } from "@/components/ui";
import { AssignmentReview } from "@/components/admin/AssignWork";
import { AssignmentThread } from "@/components/work/AssignmentThread";

const STATUS_TONE: Record<string, "gray" | "yellow" | "blue" | "green" | "red"> = {
  ASSIGNED: "blue",
  IN_PROGRESS: "yellow",
  SUBMITTED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default async function AdminAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireRole("ADMIN");

  const a = await db.jobAssignment.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, name: true, email: true, jobTitle: true, department: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!a) notFound();

  const thread = a.messages.map((m) => ({
    id: m.id,
    body: m.body,
    isStaff: m.isStaff,
    authorId: m.authorId,
    authorName: m.author.name,
    authorEmail: m.author.email,
    createdAt: m.createdAt,
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin/assignments" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to assignments
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={a.employee.name} email={a.employee.email} size={44} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{a.title}</h1>
            <p className="text-sm text-slate-500">
              {a.employee.name ?? a.employee.email}
              {a.employee.jobTitle ? ` · ${a.employee.jobTitle}` : ""}
            </p>
          </div>
        </div>
        <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
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

      <SectionCard title="Assignment brief">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{a.brief}</p>
      </SectionCard>

      {a.submissionNote && (
        <SectionCard title="Submitted work" action={<FileText className="h-4 w-4 text-slate-400" />}>
          <p className="whitespace-pre-line text-sm text-slate-600">{a.submissionNote}</p>
          {a.status === "SUBMITTED" && (
            <div className="mt-2">
              <AssignmentReview assignmentId={a.id} />
            </div>
          )}
        </SectionCard>
      )}

      {a.status === "SUBMITTED" && !a.submissionNote && (
        <SectionCard title="Review">
          <AssignmentReview assignmentId={a.id} />
        </SectionCard>
      )}

      {a.reviewNote && (
        <SectionCard title="Your feedback">
          <p className="text-sm text-slate-600">{a.reviewNote}</p>
        </SectionCard>
      )}

      <SectionCard
        title="Discussion"
        description="Talk to the employee about this assignment."
        action={<MessagesSquare className="h-4 w-4 text-slate-400" />}
      >
        <AssignmentThread assignmentId={a.id} messages={thread} meId={admin.id} />
      </SectionCard>
    </div>
  );
}
