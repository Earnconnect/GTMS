import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardContent } from "@/components/ui";
import ReplyForm from "./ReplyForm";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireWorker();
  const { id } = await params;

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket || ticket.userId !== user.id) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={ticket.subject} description={`Ticket · ${ticket.status}`} />

      <div className="space-y-3 mb-4">
        {ticket.messages.map((m) => {
          const isMe = m.authorId === user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMe ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-900"
              }`}>
                {!isMe && (
                  <p className="text-xs font-medium text-gray-500 mb-1">Support Team</p>
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

      {ticket.status === "OPEN" && <ReplyForm ticketId={id} />}
    </div>
  );
}
