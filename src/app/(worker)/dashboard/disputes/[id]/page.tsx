import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardContent } from "@/components/ui";
import ReplyForm from "./ReplyForm";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireWorker();
  const { id } = await params;

  const dispute = await db.dispute.findUnique({
    where: { id },
    include: {
      task: { select: { title: true } },
      messages: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!dispute || dispute.openedById !== user.id) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Dispute"
        description={dispute.task?.title ?? "General Dispute"}
      />

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <span className="text-sm font-semibold text-gray-900">{dispute.status.replace("_", " ")}</span>
          </div>
          <p className="text-sm text-gray-700">{dispute.reason}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(dispute.createdAt).toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-4">
        {dispute.messages.map((m) => {
          const isMe = m.authorId === user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMe ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-900"
              }`}>
                {!isMe && (
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {m.author.name ?? m.author.role}
                  </p>
                )}
                <p className="text-sm">{m.body}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {dispute.status !== "RESOLVED" && dispute.status !== "CLOSED" && (
        <ReplyForm disputeId={id} />
      )}
    </div>
  );
}
