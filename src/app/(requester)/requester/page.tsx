import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Card, PageHeader, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function RequesterDashboard() {
  const user = await requireRole("REQUESTER");

  const [wallet, activeTasks, pendingReviews] = await Promise.all([
    db.walletAccount.findUnique({ where: { userId: user.id } }),
    db.task.count({ where: { requesterId: user.id, status: "ACTIVE" } }),
    db.submission.count({
      where: { status: "PENDING", assignment: { task: { requesterId: user.id } } },
    }),
  ]);

  const stats = [
    { label: "Available balance", value: formatMoney(wallet?.balance ?? 0) },
    { label: "In escrow", value: formatMoney(wallet?.escrowBalance ?? 0) },
    { label: "Active tasks", value: activeTasks },
    { label: "Pending reviews", value: pendingReviews },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome${user.name ? `, ${user.name}` : ""}`}
        subtitle="Post real work and pay only for approved deliverables."
        action={<ButtonLink href="/requester/tasks/new">New task</ButtonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
