import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { ReserveButton } from "@/components/tasks/ReserveButton";
import { ComboButton } from "@/components/tasks/ComboButton";
import { parseFieldSchema } from "@/lib/fields";
import { formatMoney } from "@/lib/money";
import { COMBO_MAX_UNITS } from "@/lib/constants";

export default async function WorkerTaskDetail({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  await requireRole("WORKER");

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      requester: { select: { name: true, ratingAvg: true, ratingCount: true } },
      _count: { select: { assignments: { where: { status: "AVAILABLE" } } } },
    },
  });
  if (!task) notFound();
  // Workers only see live tasks; otherwise send them back to browse.
  if (task.status !== "ACTIVE") redirect("/browse");

  const available = task._count.assignments;
  const fields = parseFieldSchema(task.fieldSchema).fields;
  const comboMax = Math.min(task.maxPerWorker, COMBO_MAX_UNITS, available);

  return (
    <div>
      <PageHeader
        title={task.title}
        subtitle={task.description}
        action={<StatusBadge status={task.category} />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Reward / unit</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(task.rewardPerUnit)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Units available</p>
          <p className="mt-1 text-2xl font-semibold">{available}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Limit per worker</p>
          <p className="mt-1 text-2xl font-semibold">{task.maxPerWorker}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Instructions</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{task.instructions}</p>
          <p className="mt-4 text-xs text-slate-400">
            Posted by {task.requester.name ?? "Requester"}
            {task.requester.ratingCount > 0 &&
              ` • ★ ${task.requester.ratingAvg.toFixed(1)} (${task.requester.ratingCount})`}
          </p>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">What you&apos;ll submit</h3>
          <ul className="mb-5 space-y-1 text-sm text-slate-600">
            {fields.map((f) => (
              <li key={f.key}>
                <span className="font-medium text-slate-800">{f.label}</span>{" "}
                <span className="text-slate-400">
                  ({f.type}
                  {f.required ? ", required" : ""})
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Do one unit</span>
              <ReserveButton taskId={task.id} />
            </div>
            {task.maxPerWorker > 1 && comboMax >= 2 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Do a combo (up to {comboMax})
                </span>
                <ComboButton taskId={task.id} max={comboMax} />
              </div>
            )}
            <p className="text-xs text-slate-400">
              A combo just batches several units into one sitting — same pay per
              unit, each reviewed individually. No deposits, ever.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/browse" className="text-sm text-brand-600 hover:underline">
          ← Back to browse
        </Link>
      </div>
    </div>
  );
}
