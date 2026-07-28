import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Card, PageHeader } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function AdminOverview() {
  await requireRole("ADMIN");

  const [users, tasks, openDisputes, pendingPayouts, escrowAgg] = await Promise.all([
    db.user.count(),
    db.task.count(),
    db.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    db.payout.count({ where: { status: { in: ["REQUESTED", "APPROVED", "PROCESSING"] } } }),
    db.escrowHold.aggregate({
      _sum: { amountTotal: true, amountReleased: true, amountRefunded: true },
      where: { status: { in: ["HELD", "PARTIAL"] } },
    }),
  ]);

  const heldEscrow =
    (escrowAgg._sum.amountTotal ?? 0) -
    (escrowAgg._sum.amountReleased ?? 0) -
    (escrowAgg._sum.amountRefunded ?? 0);

  const stats = [
    { label: "Users", value: users },
    { label: "Tasks", value: tasks },
    { label: "Open disputes", value: openDisputes },
    { label: "Pending payouts", value: pendingPayouts },
    { label: "Escrow held", value: formatMoney(heldEscrow) },
  ];

  return (
    <div>
      <PageHeader title="Admin overview" subtitle="Platform health at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
