import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { WorkForm } from "@/components/tasks/WorkForm";
import { UnitInput } from "@/components/tasks/UnitInput";
import { AbandonButton } from "@/components/tasks/AbandonButton";
import { parseFieldSchema } from "@/lib/fields";
import { formatMoney } from "@/lib/money";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const user = await requireRole("WORKER");

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { task: true },
  });
  if (!assignment) notFound();
  if (assignment.workerId !== user.id) redirect("/browse");
  if (assignment.status !== "RESERVED") redirect("/submissions");

  const schema = parseFieldSchema(assignment.task.fieldSchema);
  const expires = assignment.expiresAt;

  return (
    <div>
      <PageHeader
        title={assignment.task.title}
        subtitle={`Reward ${formatMoney(assignment.task.rewardPerUnit)} on approval`}
        action={<AbandonButton assignmentId={assignment.id} />}
      />

      {expires && (
        <p className="mb-4 text-sm text-amber-600">
          Reserved until {expires.toLocaleString()} — submit before it expires.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Instructions</h3>
          <p className="mb-4 whitespace-pre-wrap text-sm text-slate-600">
            {assignment.task.instructions}
          </p>
          <h3 className="mb-2 font-semibold">This unit</h3>
          <UnitInput data={assignment.inputData} />
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Your submission</h3>
          <WorkForm assignmentId={assignment.id} fields={schema.fields} />
        </Card>
      </div>
    </div>
  );
}
