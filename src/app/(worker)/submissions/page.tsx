import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { OpenDisputeButton } from "@/components/disputes/OpenDisputeButton";
import { formatMoney } from "@/lib/money";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireRole("WORKER");
  const sp = await searchParams;

  const submissions = await db.submission.findMany({
    where: { workerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { assignment: { include: { task: true } } },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="My submissions" subtitle="Track your work and earnings." />

      {sp.submitted && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Submitted! The requester will review your work, or it auto-approves after
          the review window.
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState>
          No submissions yet. Head to{" "}
          <a href="/browse" className="text-brand-600 hover:underline">
            Browse tasks
          </a>
          .
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {s.assignment.task.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted {s.createdAt.toLocaleString()}
                    {s.rejectReason && (
                      <span className="ml-2 text-red-500">— {s.rejectReason}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {formatMoney(s.assignment.task.rewardPerUnit)}
                  </span>
                  <StatusBadge status={s.status} />
                  {s.status === "REJECTED" && (
                    <OpenDisputeButton submissionId={s.id} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
