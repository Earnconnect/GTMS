import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  ShieldCheck,
  ChevronRight,
  User,
  Users,
  Star,
  Bot,
  Gavel,
} from "lucide-react";

const QA_STAGES = ["WORKER", "PEER_REVIEW", "SENIOR_VERIFICATION", "AI_AUDIT", "FINAL_APPROVAL"] as const;

type QAStage = typeof QA_STAGES[number];

const STAGE_META: Record<QAStage, { label: string; icon: React.ReactNode; description: string }> = {
  WORKER: {
    label: "Worker Submission",
    icon: <User className="w-4 h-4" />,
    description: "Initial submission by worker",
  },
  PEER_REVIEW: {
    label: "Peer Review",
    icon: <Users className="w-4 h-4" />,
    description: "Review by fellow workers",
  },
  SENIOR_VERIFICATION: {
    label: "Senior Verification",
    icon: <Star className="w-4 h-4" />,
    description: "Verification by senior worker",
  },
  AI_AUDIT: {
    label: "AI Audit",
    icon: <Bot className="w-4 h-4" />,
    description: "Automated quality check",
  },
  FINAL_APPROVAL: {
    label: "Final Approval",
    icon: <Gavel className="w-4 h-4" />,
    description: "Admin final review",
  },
};

function getStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
  if (status === "APPROVED" || status === "AUTO_APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  if (status === "PENDING") return "warning";
  return "default";
}

function getQAStatusStyles(status: string | undefined) {
  if (!status) return { dot: "bg-slate-200", badge: "bg-slate-100 text-slate-400", line: "bg-slate-100" };
  switch (status) {
    case "PASSED":
      return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600", line: "bg-emerald-200" };
    case "FAILED":
      return { dot: "bg-red-500", badge: "bg-red-50 text-red-600", line: "bg-red-200" };
    case "PENDING":
      return { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600", line: "bg-amber-100" };
    case "SKIPPED":
      return { dot: "bg-slate-300", badge: "bg-slate-100 text-slate-400", line: "bg-slate-100" };
    default:
      return { dot: "bg-slate-200", badge: "bg-slate-100 text-slate-400", line: "bg-slate-100" };
  }
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireWorker();
  const { id } = await params;

  const submission = await db.submission.findUnique({
    where: { id, workerId: user.id },
    include: {
      assignment: {
        include: {
          task: { select: { title: true, rewardPerUnitCents: true, qaEnabled: true, category: true } },
        },
      },
      qaStages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!submission) notFound();

  const data = submission.data as Record<string, unknown>;
  const isApproved = submission.status === "APPROVED" || submission.status === "AUTO_APPROVED";
  const isRejected = submission.status === "REJECTED";

  return (
    <div className="max-w-2xl">
      {/* Page Header */}
      <div className="pt-6 pb-4">
        <Link
          href="/dashboard/submissions"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Submissions
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-slate-800 leading-tight">
              {submission.assignment.task.title}
            </h1>
            <p className="mt-1 text-[13.5px] text-slate-500 flex items-center gap-1.5">
              <span>{submission.assignment.task.category.replace(/_/g, " ")}</span>
              <span className="text-slate-300">&middot;</span>
              <span>Submitted {new Date(submission.createdAt).toLocaleString()}</span>
            </p>
          </div>
          <Badge variant={getStatusVariant(submission.status)} className="flex-shrink-0 mt-1">
            {submission.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Status Banner */}
      {isRejected && submission.rejectReason && (
        <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-red-800">Submission Rejected</p>
            <p className="text-[13px] text-red-700 mt-1 leading-relaxed">{submission.rejectReason}</p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-emerald-800">Submission Approved</p>
            <p className="text-[13px] text-emerald-700 mt-0.5">
              {formatMoney(submission.assignment.task.rewardPerUnitCents)} has been credited to your wallet.
            </p>
          </div>
        </div>
      )}

      {!isApproved && !isRejected && (
        <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-amber-800">Under Review</p>
            <p className="text-[13px] text-amber-700 mt-0.5">
              Your submission is currently being reviewed. Check back soon.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <p className="text-[12px] text-slate-500 uppercase tracking-wide font-medium">Status</p>
            </div>
            <Badge variant={getStatusVariant(submission.status)}>
              {submission.status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <p className="text-[12px] text-slate-500 uppercase tracking-wide font-medium">Reward</p>
            </div>
            <p
              className="text-[22px] font-bold leading-tight"
              style={{ color: isApproved ? "#10B981" : "#94A3B8" }}
            >
              {formatMoney(submission.assignment.task.rewardPerUnitCents)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submitted Data */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-[15px] font-semibold text-slate-800">Your Submission</h2>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(data).length === 0 ? (
            <p className="text-[13.5px] text-slate-400">No submission data recorded.</p>
          ) : (
            <dl className="space-y-3">
              {Object.entries(data).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3">
                  <dt className="text-[12px] text-slate-400 uppercase tracking-wide font-medium col-span-1 pt-0.5">
                    {k.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-[13.5px] text-slate-700 col-span-2 break-words">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* QA Pipeline */}
      {submission.assignment.task.qaEnabled && submission.qaStages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-800">QA Pipeline</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {QA_STAGES.map((stage, i) => {
                const review = submission.qaStages.find((r) => r.stage === stage);
                const styles = getQAStatusStyles(review?.status);
                const meta = STAGE_META[stage];
                const isLast = i === QA_STAGES.length - 1;

                return (
                  <div key={stage} className="relative flex gap-4">
                    {/* Vertical line connector */}
                    {!isLast && (
                      <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${styles.line}`} />
                    )}

                    {/* Dot */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        review ? styles.dot : "bg-slate-100"
                      } ${review ? "shadow-sm" : ""}`}>
                        <span className={review ? "text-white" : "text-slate-400"}>
                          {meta.icon}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 flex items-center justify-between pb-5 ${isLast ? "pb-0" : ""}`}>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-700">{meta.label}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">{meta.description}</p>
                        {review?.notes && (
                          <p className="text-[12.5px] text-slate-500 mt-1 italic">&ldquo;{review.notes}&rdquo;</p>
                        )}
                      </div>
                      {review ? (
                        <span
                          className={`flex-shrink-0 ml-3 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${styles.badge}`}
                        >
                          {review.status}
                        </span>
                      ) : (
                        <span className="flex-shrink-0 ml-3 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold bg-slate-100 text-slate-400">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
