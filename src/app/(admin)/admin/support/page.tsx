import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import Link from "next/link";
import AdminTicketActions from "./AdminTicketActions";

export default async function AdminSupportPage() {
  await requireAdmin();

  const tickets = await db.supportTicket.findMany({
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader title="Support Tickets" description={`${tickets.filter((t) => t.status === "OPEN").length} open`} />

      {tickets.length === 0 ? (
        <EmptyState title="No tickets" description="No support tickets yet." />
      ) : (
        <Card>
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <div key={t.id} className="px-6 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.subject}</p>
                    <p className="text-xs text-gray-500">
                      {t.user.name ?? t.user.email} · {new Date(t.createdAt).toLocaleDateString()} · {t._count.messages} messages
                    </p>
                    {t.messages[0] && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.messages[0].body}</p>
                    )}
                  </div>
                  <Badge variant={t.status === "OPEN" ? "warning" : "default"}>{t.status}</Badge>
                </div>
                {t.status === "OPEN" && (
                  <AdminTicketActions ticketId={t.id} userId={t.userId} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
