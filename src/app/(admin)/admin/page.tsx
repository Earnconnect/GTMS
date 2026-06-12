import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    totalUsers,
    activeWorkers,
    pendingDeposits,
    pendingPayouts,
    pendingKyc,
    pendingSubmissions,
    openDisputes,
    openFraudFlags,
    systemWallet,
    todayEarnings,
  ] = await Promise.all([
    db.user.count({ where: { role: { not: "ADMIN" } } }),
    db.user.count({ where: { role: "WORKER", status: "ACTIVE" } }),
    db.deposit.count({ where: { status: "PENDING" } }),
    db.payout.count({ where: { status: "REQUESTED" } }),
    db.kycSubmission.count({ where: { status: "PENDING" } }),
    db.submission.count({ where: { status: "PENDING" } }),
    db.dispute.count({ where: { status: "OPEN" } }),
    db.fraudFlag.count({ where: { resolvedAt: null } }),
    db.walletAccount.findFirst({ where: { user: { role: "ADMIN" } }, select: { balanceCents: true } }),
    db.transaction.aggregate({
      where: {
        type: "PLATFORM_FEE",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { amountCents: true },
    }),
  ]);

  const alerts = [
    { label: "Pending Deposits", count: pendingDeposits, href: "/admin/deposits", color: "amber" },
    { label: "Pending Payouts", count: pendingPayouts, href: "/admin/payouts", color: "orange" },
    { label: "KYC Reviews", count: pendingKyc, href: "/admin/kyc", color: "blue" },
    { label: "Submissions to Review", count: pendingSubmissions, href: "/admin/tasks", color: "purple" },
    { label: "Open Disputes", count: openDisputes, href: "/admin/disputes", color: "red" },
    { label: "Fraud Flags", count: openFraudFlags, href: "/admin/fraud", color: "red" },
  ].filter((a) => a.count > 0);

  return (
    <div>
      <PageHeader title="Admin Overview" description="Platform-wide operations dashboard" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers} color="indigo" />
        <StatCard label="Active Workers" value={activeWorkers} color="green" />
        <StatCard label="System Revenue Today" value={formatMoney(todayEarnings._sum.amountCents ?? 0)} color="yellow" />
        <StatCard label="System Wallet" value={formatMoney(systemWallet?.balanceCents ?? 0)} color="purple" />
      </div>

      {alerts.length > 0 && (
        <Card className="mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Requires Attention</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {alerts.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{a.label}</span>
                <span className="text-sm font-bold text-red-600">{a.count}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Manage Users", href: "/admin/users", desc: "View, suspend, or ban accounts" },
          { title: "Deposit Queue", href: "/admin/deposits", desc: `${pendingDeposits} pending` },
          { title: "Payout Queue", href: "/admin/payouts", desc: `${pendingPayouts} awaiting processing` },
          { title: "KYC Review", href: "/admin/kyc", desc: `${pendingKyc} awaiting review` },
          { title: "Analytics", href: "/admin/analytics", desc: "Revenue, growth, and engagement charts" },
          { title: "Audit Log", href: "/admin/audit-log", desc: "Full history of all admin actions" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-gray-900">{card.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
