import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";

export default async function AdminDisputesPage() {
  await requireAdmin();

  const disputes = await db.dispute.findMany({
    include: {
      openedBy: { select: { name: true, email: true } },
      task: { select: { title: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const statusVariant: Record<string, "warning" | "info" | "success" | "default"> = {
    OPEN: "warning",
    UNDER_REVIEW: "info",
    RESOLVED: "success",
    CLOSED: "default",
  };

  return (
    <div>
      <PageHeader title="Disputes" description={`${disputes.length} total`} />

      {disputes.length === 0 ? (
        <EmptyState title="No disputes" description="No disputes have been filed." />
      ) : (
        <Card>
          <div className="divide-y divide-gray-100">
            {disputes.map((d) => (
              <Link
                key={d.id}
                href={`/admin/disputes/${d.id}`}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {d.task?.title ?? "General"} — {d.openedBy.name ?? d.openedBy.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(d.createdAt).toLocaleDateString()} · {d._count.messages} messages
                  </p>
                </div>
                <Badge variant={statusVariant[d.status] ?? "default"}>{d.status.replace("_", " ")}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
