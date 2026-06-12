import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardContent, StatCard } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    weekRevenue,
    totalUsers,
    newUsersLast30,
    totalTasks,
    totalSubmissions,
    approvedSubmissions,
    membershipBreakdown,
    careerBreakdown,
  ] = await Promise.all([
    db.transaction.aggregate({ where: { type: "PLATFORM_FEE" }, _sum: { amountCents: true } }),
    db.transaction.aggregate({
      where: { type: "PLATFORM_FEE", createdAt: { gte: sevenDaysAgo } },
      _sum: { amountCents: true },
    }),
    db.user.count({ where: { role: { not: "ADMIN" } } }),
    db.user.count({ where: { role: { not: "ADMIN" }, createdAt: { gte: thirtyDaysAgo } } }),
    db.task.count(),
    db.submission.count(),
    db.submission.count({ where: { status: { in: ["APPROVED", "AUTO_APPROVED"] } } }),
    db.membership.groupBy({ by: ["tier"], _count: { _all: true } }),
    db.user.groupBy({ by: ["careerLevel"], where: { role: "WORKER" }, _count: { _all: true } }),
  ]);

  const approvalRate = totalSubmissions > 0
    ? ((approvedSubmissions / totalSubmissions) * 100).toFixed(1)
    : "0.0";

  return (
    <div>
      <PageHeader title="Analytics" description="Platform performance metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Platform Revenue" value={formatMoney(totalRevenue._sum.amountCents ?? 0)} color="green" />
        <StatCard label="Revenue (7 days)" value={formatMoney(weekRevenue._sum.amountCents ?? 0)} color="indigo" />
        <StatCard label="Total Users" value={totalUsers} color="purple" />
        <StatCard label="New Users (30d)" value={newUsersLast30} color="yellow" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tasks" value={totalTasks} color="indigo" />
        <StatCard label="Total Submissions" value={totalSubmissions} color="purple" />
        <StatCard label="Approved Submissions" value={approvedSubmissions} color="green" />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Membership Breakdown</h2>
          </div>
          <CardContent className="pt-4 space-y-3">
            {membershipBreakdown.map((m) => (
              <div key={m.tier} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{m.tier}</span>
                <span className="text-sm font-semibold text-gray-900">{m._count._all}</span>
              </div>
            ))}
            {membershipBreakdown.length === 0 && (
              <p className="text-sm text-gray-500">No memberships yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Worker Career Distribution</h2>
          </div>
          <CardContent className="pt-4 space-y-3">
            {careerBreakdown.map((c) => (
              <div key={c.careerLevel} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.careerLevel.replace("_", " ")}</span>
                <span className="text-sm font-semibold text-gray-900">{c._count._all}</span>
              </div>
            ))}
            {careerBreakdown.length === 0 && (
              <p className="text-sm text-gray-500">No workers yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
