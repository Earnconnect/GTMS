import Link from "next/link";
import {
  Users,
  UserCheck,
  Banknote,
  ArrowDownToLine,
  UserPlus,
  ArrowRight,
  Building2,
} from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, StatCard, SectionCard, Avatar, EmptyState, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { SYSTEM_USER_EMAIL } from "@/lib/constants";

export default async function AdminOverview() {
  await requireRole("ADMIN");

  const [totalEmployees, activeEmployees, awaitingOnboarding, pendingPayouts, salaryAgg, systemUser, recentPayments] =
    await Promise.all([
      db.user.count({ where: { employmentStatus: { not: null } } }),
      db.user.count({ where: { employmentStatus: "EMPLOYED" } }),
      db.user.count({ where: { employmentStatus: null, role: "WORKER", email: { not: SYSTEM_USER_EMAIL } } }),
      db.payout.aggregate({
        _count: true,
        _sum: { amount: true },
        where: { status: { in: ["REQUESTED", "APPROVED", "PROCESSING"] } },
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
        where: { type: "SALARY", amount: { gt: 0 } },
      }),
      db.user.findUnique({ where: { email: SYSTEM_USER_EMAIL }, include: { wallet: true } }),
      db.transaction.findMany({
        where: { type: "SALARY", amount: { gt: 0 } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { wallet: { include: { user: { select: { name: true, email: true } } } } },
      }),
    ]);

  const totalPaid = salaryAgg._sum.amount ?? 0;
  const pendingAmount = pendingPayouts._sum.amount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Company overview"
        subtitle="A real-time snapshot of your workforce and payroll — headcount, salary paid to date, pending withdrawals, and everyone still awaiting onboarding, all in one place."
        action={
          <ButtonLink href="/admin/employees" className="gap-2">
            <UserPlus className="h-4 w-4" /> Onboard employee
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total employees" value={totalEmployees} icon={<Users className="h-5 w-5" />} tone="brand" hint={`${activeEmployees} active`} />
        <StatCard label="Total salary paid" value={formatMoney(totalPaid)} icon={<Banknote className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Pending withdrawals" value={pendingPayouts._count} icon={<ArrowDownToLine className="h-5 w-5" />} tone="amber" hint={pendingPayouts._count ? formatMoney(pendingAmount) : "None pending"} />
        <StatCard label="Awaiting onboarding" value={awaitingOnboarding} icon={<UserPlus className="h-5 w-5" />} tone="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent salary payments"
            description="Latest payroll credited to employees."
            action={<Link href="/admin/ledger" className="text-xs font-medium text-brand-600 hover:underline">View ledger</Link>}
          >
            {recentPayments.length === 0 ? (
              <EmptyState icon={<Banknote className="h-5 w-5" />} title="No payments yet">
                Onboard an employee and pay them from the Employees page.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <Avatar name={p.wallet.user.name} email={p.wallet.user.email} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {p.wallet.user.name ?? p.wallet.user.email}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {p.description ?? "Salary payment"} · {p.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 tabular-nums">
                      +{formatMoney(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Company wallet" description="Funds salaries are paid from.">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {formatMoney(systemUser?.wallet?.balance ?? 0)}
                </p>
                <p className="text-xs text-slate-400">Available to fund payroll</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Quick actions">
            <div className="space-y-2">
              {[
                { href: "/admin/employees", label: "Onboard & pay employees", icon: Users },
                { href: "/admin/payouts", label: "Process withdrawals", icon: ArrowDownToLine },
                { href: "/admin/kyc", label: "Review verifications", icon: UserCheck },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                >
                  <a.icon className="h-4 w-4 text-slate-400" />
                  {a.label}
                  <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
