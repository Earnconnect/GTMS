import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, EmptyState, Badge } from "@/components/ui";
import Link from "next/link";
import NewTicketButton from "./NewTicketButton";

function ticketBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <Badge variant="success">Open</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="warning">In Progress</Badge>;
    case "RESOLVED":
      return <Badge variant="default">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="default">Closed</Badge>;
    default:
      return <Badge variant="default">{status.replace("_", " ")}</Badge>;
  }
}

export default async function SupportPage() {
  const user = await requireWorker();

  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: "desc" },
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  return (
    <div>
      <PageHeader
        title="Support"
        description="Get help from our support team"
        action={<NewTicketButton />}
      />

      {/* Stats */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Total Tickets</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-slate-700">{tickets.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Open</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-emerald-600">{openCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Resolved</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-slate-500">{resolvedCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Avg. Messages</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-cyan-600">
              {tickets.length > 0
                ? Math.round(tickets.reduce((sum, t) => sum + t._count.messages, 0) / tickets.length)
                : 0}
            </p>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <Card>
          <div className="py-4">
            <EmptyState
              title="No support tickets"
              description="You haven't submitted any support requests yet. Use the button above to create one."
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Your Tickets</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left">
                    Subject
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-center hidden md:table-cell">
                    Messages
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left hidden sm:table-cell">
                    Submitted
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/support/${t.id}`} className="block">
                        <p className="text-[13.5px] font-semibold text-slate-700 hover:text-cyan-600 transition-colors">
                          {t.subject}
                        </p>
                        <p className="text-[12px] text-slate-400 mt-0.5 sm:hidden">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-[13px] text-slate-500">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/>
                        </svg>
                        {t._count.messages}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-[13px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/dashboard/support/${t.id}`}>
                        {ticketBadge(t.status)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
