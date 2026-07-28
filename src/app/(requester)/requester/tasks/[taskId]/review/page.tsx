import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole, assertOwner } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui";
import { ReviewQueue, type QueueItem } from "@/components/review/ReviewQueue";
import { parseFieldSchema } from "@/lib/fields";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const user = await requireRole("REQUESTER");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) notFound();
  assertOwner(task.requesterId, user);

  const submissions = await db.submission.findMany({
    where: { status: "PENDING", assignment: { taskId } },
    orderBy: { createdAt: "asc" },
    include: { worker: { select: { name: true } }, assignment: true },
  });

  const fields = parseFieldSchema(task.fieldSchema).fields;
  const items: QueueItem[] = submissions.map((s) => ({
    id: s.id,
    workerName: s.worker.name ?? "Worker",
    createdAt: s.createdAt.toISOString(),
    data: (s.data as Record<string, unknown>) ?? {},
    inputData: (s.assignment.inputData as Record<string, unknown> | null) ?? null,
  }));

  return (
    <div>
      <PageHeader
        title={`Review — ${task.title}`}
        subtitle="Approve to release payment; reject with a reason."
        action={
          <Link
            href={`/requester/tasks/${taskId}`}
            className="text-sm text-brand-600 hover:underline"
          >
            ← Task
          </Link>
        }
      />
      <ReviewQueue items={items} fields={fields} />
    </div>
  );
}
