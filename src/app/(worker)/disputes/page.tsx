import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { DisputeThread, type DisputeView } from "@/components/disputes/DisputeThread";

export default async function WorkerDisputesPage() {
  const user = await requireRole("WORKER");

  const disputes = await db.dispute.findMany({
    where: { submission: { workerId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      submission: { include: { assignment: { include: { task: true } } } },
      messages: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });

  const views: DisputeView[] = disputes.map((d) => ({
    id: d.id,
    status: d.status,
    reason: d.reason,
    taskTitle: d.submission.assignment.task.title,
    resolutionNote: d.resolutionNote,
    messages: d.messages.map((m) => ({
      id: m.id,
      authorName: m.author.name ?? "User",
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return (
    <div>
      <PageHeader title="Disputes" subtitle="Disputes you've opened on rejected work." />
      {views.length === 0 ? (
        <EmptyState>No disputes. You can open one from a rejected submission.</EmptyState>
      ) : (
        <div className="space-y-4">
          {views.map((d) => (
            <DisputeThread key={d.id} dispute={d} canResolve={false} />
          ))}
        </div>
      )}
    </div>
  );
}
