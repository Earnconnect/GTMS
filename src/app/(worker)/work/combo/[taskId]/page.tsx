import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui";
import { ComboWorker, type ComboUnit } from "@/components/tasks/ComboWorker";
import { parseFieldSchema } from "@/lib/fields";
import { formatMoney } from "@/lib/money";

export default async function ComboWorkPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const user = await requireRole("WORKER");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) notFound();

  const reserved = await db.assignment.findMany({
    where: { taskId, workerId: user.id, status: "RESERVED" },
    orderBy: { unitIndex: "asc" },
  });
  if (reserved.length === 0) redirect("/browse");

  const fields = parseFieldSchema(task.fieldSchema).fields;
  const units: ComboUnit[] = reserved.map((a) => ({
    assignmentId: a.id,
    inputData: (a.inputData as Record<string, unknown> | null) ?? null,
  }));

  return (
    <div>
      <PageHeader
        title={`Combo — ${task.title}`}
        subtitle={`${units.length} units reserved • ${formatMoney(
          task.rewardPerUnit,
        )} each on approval`}
      />
      <ComboWorker
        units={units}
        fields={fields}
        instructions={task.instructions}
        rewardPerUnit={task.rewardPerUnit}
      />
    </div>
  );
}
