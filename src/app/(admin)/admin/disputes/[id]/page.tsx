import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardContent } from "@/components/ui";
import ResolveDisputeForm from "./ResolveDisputeForm";

export default async function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;

  const dispute = await db.dispute.findUnique({
    where: { id },
    include: {
      openedBy: { select: { name: true, email: true } },
      task: { select: { title: true } },
      messages: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!dispute) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Dispute: ${dispute.task?.title ?? "General"}`}
        description={`Opened by ${dispute.openedBy.name ?? dispute.openedBy.email} · ${dispute.status}`}
      />

      <Card className="mb-4">
        <CardContent className="pt-5">
          <p className="text-sm text-gray-700">{dispute.reason}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(dispute.createdAt).toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-6">
        {dispute.messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-600">
                {m.author.name?.charAt(0) ?? m.author.role.charAt(0)}
              </span>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <p className="text-xs font-medium text-gray-500 mb-1">
                {m.author.name ?? m.author.role}
              </p>
              <p className="text-sm text-gray-900">{m.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      {dispute.status !== "RESOLVED" && dispute.status !== "CLOSED" && (
        <ResolveDisputeForm disputeId={id} adminId={admin.id} />
      )}
    </div>
  );
}
