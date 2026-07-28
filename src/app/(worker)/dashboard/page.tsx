import Link from "next/link";
import { Wallet, Banknote, TrendingUp, BadgeCheck, ArrowRight, Briefcase } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, PageHeader, StatCard, SectionCard, EmptyState, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { listSalaryPayments } from "@/server/services/payroll.service";

export default async function EmployeeDashboard() {
  const user = await requireRole("WORKER");

  const [profile, wallet, payments] = await Promise.all([
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
    listSalaryPayments(user.id, 10),
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
          <ButtonLink href="/wallet" className="gap-2">
            <ArrowRight className="h-4 w-4" /> Go to wallet
          </ButtonLink>
        }
      />

      {/* Status banners */}
      {!onboarded && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Briefcase className="h-5 w-5 shrink-0" />
          You&apos;re registered and awaiting onboarding. Once our team activates
          your employment and sets your salary, it&apos;ll show up here.
        </div>
      )}
      {onboarded && !verified && (
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

        <SectionCard title="Employment">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                {onboarded ? (
                  <Badge tone={profile?.employmentStatus === "EMPLOYED" ? "green" : "yellow"}>
                    {profile?.employmentStatus}
                  </Badge>
                ) : (
                  <Badge tone="gray">Not onboarded</Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-800">{profile?.jobTitle ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Department</dt>
              <dd className="font-medium text-slate-800">{profile?.department ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Verification</dt>
              <dd>
                <Badge tone={verified ? "green" : "yellow"}>{profile?.kycStatus ?? "NONE"}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Hired</dt>
              <dd className="font-medium text-slate-800">
                {profile?.hiredAt ? profile.hiredAt.toLocaleDateString() : "—"}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
