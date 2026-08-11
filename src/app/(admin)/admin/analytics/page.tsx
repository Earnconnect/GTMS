import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { formatMoney } from "@/lib/money";

async function sumByType(type: "DEPOSIT" | "EARNING" | "FEE" | "PAYOUT" | "REFERRAL_BONUS") {
  const agg = await db.transaction.aggregate({
    where: { type, amount: { gt: 0 } },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export default async function AdminAnalyticsPage() {
  await requireRole("ADMIN");

  const [
    workers,
    requesters,
    deposits,
    earnings,
    fees,
    payouts,
    referralBonuses,
    tasksByStatus,
    kycPending,
    openTickets,
    openDisputes,
  ] = await Promise.all([
    db.user.count({ where: { role: "WORKER" } }),
    db.user.count({ where: { role: "REQUESTER" } }),
    sumByType("DEPOSIT"),
    sumByType("EARNING"),
    sumByType("FEE"),
    sumByType("PAYOUT"),
    sumByType("REFERRAL_BONUS"),
    db.task.groupBy({ by: ["status"], _count: true }),
    db.user.count({ where: { kycStatus: "PENDING" } }),
    db.supportTicket.count({ where: { status: { in: ["OPEN", "PENDING"] } } }),
    db.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
  ]);

  const money = [
    { label: "Total deposits (in)", value: formatMoney(deposits) },
    { label: "Worker earnings", value: formatMoney(earnings) },
    { label: "Platform fees", value: formatMoney(fees) },
    { label: "Payouts (out)", value: formatMoney(payouts) },
    { label: "Referral bonuses paid", value: formatMoney(referralBonuses) },
  ];

  const ops = [
    { label: "Workers", value: workers },
    { label: "Requesters", value: requesters },
    { label: "KYC pending", value: kycPending },
    { label: "Open tickets", value: openTickets },
    { label: "Open disputes", value: openDisputes },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Understand how money and work move through your organization — payroll totals, balances, and operational activity across the platform at a glance."
      />

      <h2 className="mb-3 text-lg font-semibold">Money</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {money.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Operations</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ops.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Tasks by status</h2>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {tasksByStatus.map((t) => (
          <Card key={t.status}>
            <p className="text-xs text-slate-500">{t.status}</p>
            <p className="mt-1 text-lg font-semibold">{t._count}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
