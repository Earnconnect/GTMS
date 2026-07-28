import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, assertOwner } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, ButtonLink } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { TaskControls } from "@/components/tasks/TaskControls";
import { formatMoney, feeFromBps } from "@/lib/money";
import { PLATFORM_FEE_BPS } from "@/lib/constants";
import { parseFieldSchema } from "@/lib/fields";

export default async function RequesterTaskDetail({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const user = await requireRole("REQUESTER");

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      escrowHold: true,
      assignments: { select: { status: true } },
    },
  });
  if (!task) notFound();
  assertOwner(task.requesterId, user);

  const counts = task.assignments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const pendingReview = counts["SUBMITTED"] ?? 0;
  const feePerUnit = feeFromBps(task.rewardPerUnit, PLATFORM_FEE_BPS);
  const schema = parseFieldSchema(task.fieldSchema);

  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={task.description}
        action={<StatusBadge status={task.status} />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Reward / unit</p>
          <p className="mt-1 text-xl font-semibold">{formatMoney(task.rewardPerUnit)}</p>
          <p className="text-xs text-slate-400">+ {formatMoney(feePerUnit)} fee</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Units</p>
          <p className="mt-1 text-xl font-semibold">{task.totalUnits}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending review</p>
          <p className="mt-1 text-xl font-semibold">{pendingReview}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In escrow</p>
          <p className="mt-1 text-xl font-semibold">
            {formatMoney(
              task.escrowHold
                ? task.escrowHold.amountTotal -
                    task.escrowHold.amountReleased -
                    task.escrowHold.amountRefunded
                : 0,
            )}
          </p>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TaskControls taskId={task.id} status={task.status} />
        {pendingReview > 0 && (
          <ButtonLink href={`/requester/tasks/${task.id}/review`} variant="secondary">
            Review submissions ({pendingReview})
          </ButtonLink>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Instructions</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{task.instructions}</p>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">Output form</h3>
          <ul className="space-y-1 text-sm text-slate-600">
            {schema.fields.map((f) => (
              <li key={f.key}>
                <span className="font-medium text-slate-800">{f.label}</span>{" "}
                <span className="text-slate-400">
                  ({f.type}
                  {f.required ? ", required" : ""})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["AVAILABLE", "RESERVED", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"].map(
          (s) =>
            counts[s] ? (
              <Card key={s}>
                <p className="text-xs text-slate-500">{s}</p>
                <p className="text-lg font-semibold">{counts[s]}</p>
              </Card>
            ) : null,
        )}
      </div>

      <div className="mt-6">
        <Link href="/requester/tasks" className="text-sm text-brand-600 hover:underline">
          ← Back to tasks
        </Link>
      </div>
    </div>
  );
}
