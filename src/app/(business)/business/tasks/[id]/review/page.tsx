import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, CardContent } from "@/components/ui";
import ReviewActions from "./ReviewActions";
import Link from "next/link";
import { ChevronRight, UserCircle, CheckCircle2, Clock } from "lucide-react";

export default async function TaskReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireBusiness();
  const { id } = await params;

  const task = await db.task.findUnique({ where: { id, requesterId: user.id } });
  if (!task) notFound();

  const submissions = await db.submission.findMany({
    where: { assignment: { taskId: id }, status: "PENDING" },
    include: {
      worker: { select: { name: true, accuracyScore: true } },
      assignment: { select: { unitIndex: true, inputData: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12.5px] text-slate-400 pt-6 mb-4">
        <Link href="/business/tasks" className="hover:text-slate-600 transition-colors">Tasks</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/business/tasks/${id}`} className="hover:text-slate-600 transition-colors truncate max-w-[150px]">
          {task.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600">Review</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Review Submissions</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            {submissions.length > 0
              ? `${submissions.length} pending submission${submissions.length !== 1 ? "s" : ""} for "${task.title}"`
              : `All submissions for "${task.title}" have been reviewed`}
          </p>
        </div>
        {submissions.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-[13px] font-semibold text-amber-700">{submissions.length} pending</span>
          </div>
        )}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-[15px] font-semibold text-slate-800">All caught up!</p>
            <p className="text-[13.5px] text-slate-500 mt-1">All submissions have been reviewed.</p>
            <Link
              href={`/business/tasks/${id}`}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
            >
              Back to Task
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 pb-8">
          {submissions.map((s, index) => {
            const data = s.data as Record<string, unknown>;
            const inputData = s.assignment.inputData as Record<string, unknown> | null;
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-slate-800">
                          {s.worker.name ?? "Worker"} — Unit #{s.assignment.unitIndex + 1}
                        </p>
                        <p className="text-[12.5px] text-slate-400 mt-0.5">
                          Accuracy: {s.worker.accuracyScore.toFixed(1)}% · Submitted{" "}
                          {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[12px] font-semibold text-amber-700">Pending Review</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input data context */}
                  {inputData && Object.keys(inputData).length > 0 && (
                    <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-100">
                      <p className="text-[12px] font-semibold text-cyan-700 uppercase tracking-wider mb-2">
                        Input / Context
                      </p>
                      <dl className="space-y-1.5">
                        {Object.entries(inputData).map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-[12.5px]">
                            <dt className="font-semibold text-cyan-800 flex-shrink-0">{k}:</dt>
                            <dd className="text-cyan-700">{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Submission data */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Worker&apos;s Submission
                    </p>
                    <dl className="space-y-3">
                      {Object.entries(data).map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{k}</dt>
                          <dd className="text-[13.5px] text-slate-800 mt-0.5 font-medium">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    <ReviewActions submissionId={s.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
