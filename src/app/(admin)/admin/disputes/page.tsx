import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { DisputeThread, type DisputeView } from "@/components/disputes/DisputeThread";

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const showAll = sp.all === "1";

  const disputes = await db.dispute.findMany({
    where: showAll ? {} : { status: { in: ["OPEN", "UNDER_REVIEW"] } },
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
      <PageHeader
        title="Disputes"
        subtitle={showAll ? "All disputes." : "Open disputes awaiting resolution."}
        action={
          <a
            href={showAll ? "/admin/disputes" : "/admin/disputes?all=1"}
            className="text-sm text-brand-600 hover:underline"
          >
            {showAll ? "Show open only" : "Show all"}
          </a>
        }
      />
      {views.length === 0 ? (
        <EmptyState>No disputes to resolve.</EmptyState>
      ) : (
        <div className="space-y-4">
          {views.map((d) => (
            <DisputeThread key={d.id} dispute={d} canResolve />
          ))}
        </div>
      )}
    </div>
  );
}
