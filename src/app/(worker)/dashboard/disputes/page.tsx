import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, EmptyState, Badge } from "@/components/ui";
import Link from "next/link";
import OpenDisputeButton from "./OpenDisputeButton";

function disputeBadge(status: string) {
  switch (status) {
    case "OPEN":
      return <Badge variant="warning">Open</Badge>;
    case "IN_REVIEW":
      return <Badge variant="info">In Review</Badge>;
    case "RESOLVED":
      return <Badge variant="success">Resolved</Badge>;
    case "CLOSED":
      return <Badge variant="default">Closed</Badge>;
    default:
      return <Badge variant="default">{status.replace("_", " ")}</Badge>;
  }
}

export default async function DisputesPage() {
  const user = await requireWorker();

  const disputes = await db.dispute.findMany({
    where: { openedById: user.id },
    include: {
      task: { select: { title: true } },
      submission: { select: { id: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const reviewCount = disputes.filter((d) => d.status === "IN_REVIEW").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED").length;

  return (
    <div>
      <PageHeader
        title="Disputes"
        description="Raise and track disputes about tasks or submissions"
        action={<OpenDisputeButton />}
      />

      {/* Stats row */}
      {disputes.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Total</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-slate-700">{disputes.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Open</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-amber-500">{openCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Under Review</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-blue-500">{reviewCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Resolved</p>
            <p className="mt-1.5 text-[28px] font-bold leading-none text-emerald-600">{resolvedCount}</p>
          </div>
        </div>
      )}

      {disputes.length === 0 ? (
        <Card>
          <div className="py-4">
            <EmptyState
              title="No disputes"
              description="You haven't opened any disputes yet. If you have an issue with a task or submission, use the button above."
            />
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">All Disputes</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left">
                    Subject
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left hidden sm:table-cell">
                    Reason
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-center hidden md:table-cell">
                    Messages
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-left hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 px-4 py-3 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => {
                  const subject = d.task?.title
                    ? d.task.title
                    : d.submission
                    ? `Submission #${d.submission.id.slice(-8)}`
                    : "General Dispute";

                  return (
                    <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/dashboard/disputes/${d.id}`}
                          className="block"
                        >
                          <p className="text-[13.5px] font-semibold text-slate-700 hover:text-cyan-600 transition-colors truncate max-w-[180px]">
                            {subject}
                          </p>
                          <p className="text-[12px] text-slate-400 mt-0.5 sm:hidden">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-[13px] text-slate-500 truncate max-w-[200px]">{d.reason}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-[13px] text-slate-500">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/>
                          </svg>
                          {d._count.messages}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-[13px] text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/dashboard/disputes/${d.id}`}>
                          {disputeBadge(d.status)}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
