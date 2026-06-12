import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, EmptyState } from "@/components/ui";
import Link from "next/link";
import NewTicketButton from "./NewTicketButton";
import { MessageSquare, ChevronRight } from "lucide-react";

export default async function BusinessSupportPage() {
  const user = await requireBusiness();

  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: "desc" },
  });

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const closedCount = tickets.filter((t) => t.status !== "OPEN").length;

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Support</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            {tickets.length > 0
              ? `${openCount} open · ${closedCount} closed`
              : "Get help from our team"}
          </p>
        </div>
        <NewTicketButton />
      </div>

      {/* Stats row (only if have tickets) */}
      {tickets.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Open Tickets", value: openCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Closed Tickets", value: closedCount, color: "text-slate-600", bg: "bg-slate-50" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80"
            >
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`mt-1.5 text-[28px] font-bold leading-none ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tickets.length === 0 ? (
        <EmptyState
          title="No support tickets"
          description="Submit a support request if you need help. Our team typically responds within 24 hours."
          action={<NewTicketButton />}
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Your Tickets</h2>
          </CardHeader>
          <div className="divide-y divide-slate-50">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href={`/business/support/${t.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    t.status === "OPEN" ? "bg-emerald-50" : "bg-slate-100"
                  }`}
                >
                  <MessageSquare
                    className={`w-4.5 h-4.5 ${
                      t.status === "OPEN" ? "text-emerald-500" : "text-slate-400"
                    }`}
                    style={{ width: 18, height: 18 }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-slate-700 truncate">{t.subject}</p>
                  <p className="text-[12.5px] text-slate-400 mt-0.5">
                    {new Date(t.createdAt).toLocaleDateString()} · {t._count.messages} message{t._count.messages !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
                      t.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
