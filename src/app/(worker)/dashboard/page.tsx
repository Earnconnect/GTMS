import Link from "next/link";
import {
  Wallet,
  Banknote,
  TrendingUp,
  BadgeCheck,
  ArrowRight,
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, PageHeader, StatCard, SectionCard, EmptyState, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { listSalaryPayments } from "@/server/services/payroll.service";
import { getOnboardingProgress } from "@/server/services/onboarding.service";

const QUICK_LINKS = [
  { href: "/assignments", label: "My work", desc: "Assigned jobs", icon: ClipboardList },
  { href: "/onboarding", label: "Onboarding", desc: "Documents & 401(k)", icon: ClipboardCheck },
  { href: "/jobs", label: "Job placements", desc: "Browse & apply", icon: Briefcase },
  { href: "/training", label: "Bootcamp", desc: "Courses & progress", icon: GraduationCap },
];

export default async function EmployeeDashboard() {
  const user = await requireRole("WORKER");

  const [profile, wallet, payments, progress] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: {
        jobTitle: true,
        department: true,
        salaryCents: true,
        employmentStatus: true,
        hiredAt: true,
        kycStatus: true,
      },
    }),
    db.walletAccount.findUnique({ where: { userId: user.id } }),
    listSalaryPayments(user.id, 6),
    getOnboardingProgress(user.id),
  ]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const onboarded = profile?.employmentStatus != null;
  const verified = profile?.kycStatus === "APPROVED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        subtitle={
          onboarded
            ? `${profile?.jobTitle ?? "Employee"}${profile?.department ? ` · ${profile.department}` : ""}`
            : "Your account is set up. An administrator will complete your onboarding shortly."
        }
        action={
          <ButtonLink href="/onboarding" className="gap-2">
            <ClipboardCheck className="h-4 w-4" /> Continue onboarding
          </ButtonLink>
        }
      />

      {!verified && onboarded && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          Verify your identity to enable withdrawals.
          <Link href="/kyc" className="ml-auto font-semibold underline">
            Verify now
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatMoney(wallet?.balance ?? 0)} icon={<Wallet className="h-5 w-5" />} tone="brand" />
        <StatCard label="Salary per period" value={formatMoney(profile?.salaryCents ?? 0)} icon={<Banknote className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Paid (recent)" value={formatMoney(totalPaid)} icon={<TrendingUp className="h-5 w-5" />} tone="slate" />
      </div>

      {/* Quick access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <q.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{q.label}</p>
              <p className="text-xs text-slate-400">{q.desc}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Recent salary payments" description="Money credited to your wallet.">
            {payments.length === 0 ? (
              <EmptyState icon={<Banknote className="h-5 w-5" />} title="No payments yet">
                Once you&apos;re onboarded and paid, your salary history appears here.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {p.description ?? "Salary payment"}
                      </p>
                      <p className="text-xs text-slate-400">{p.createdAt.toLocaleString()}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-emerald-700 tabular-nums">
                      +{formatMoney(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Onboarding"
          description={`${progress.completed} of ${progress.total} steps complete`}
          action={<Link href="/onboarding" className="text-xs font-medium text-brand-600 hover:underline">Open</Link>}
        >
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <ul className="space-y-2">
            {progress.steps.map((s) => (
              <li key={s.key} className="flex items-center justify-between text-sm">
                <span className={s.done ? "text-slate-800" : "text-slate-500"}>{s.label}</span>
                <Badge tone={s.done ? "green" : "gray"}>{s.done ? "Done" : "To do"}</Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
