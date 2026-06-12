import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardContent, CardHeader, Badge } from "@/components/ui";
import { TIER_LIMITS } from "@/lib/membership";
import { formatMoney } from "@/lib/money";
import type { MembershipTier } from "@/generated/prisma";
import Link from "next/link";

const TIER_FEATURES: Record<MembershipTier, string[]> = {
  BASIC: [
    "Access to entry-level tasks",
    "Up to 20 tasks per day",
    "Standard support",
    "Weekly withdrawals",
    "1 certification slot/month",
  ],
  PROFESSIONAL: [
    "Higher task allocation (100/day)",
    "Access to QA pipeline tasks",
    "Faster withdrawals (twice weekly)",
    "Priority task assignment",
    "2 certification slots/month",
  ],
  EXECUTIVE: [
    "Premium project access (500/day)",
    "All QA pipeline tasks",
    "Next-business-day withdrawals",
    "Dedicated account assistance",
    "4 certification slots/month",
  ],
};

const TIER_ICONS: Record<MembershipTier, React.ReactNode> = {
  BASIC: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
    </svg>
  ),
  PROFESSIONAL: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
    </svg>
  ),
  EXECUTIVE: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/>
    </svg>
  ),
};

const TIER_GRADIENTS: Record<MembershipTier, string> = {
  BASIC: "from-slate-400 to-slate-500",
  PROFESSIONAL: "from-cyan-500 to-blue-600",
  EXECUTIVE: "from-violet-500 to-purple-700",
};

export default async function MembershipPage() {
  const user = await requireWorker();

  const membership = await db.membership.findUnique({ where: { userId: user.id } });

  const payoutLabel: Record<string, string> = {
    WEEKLY: "Weekly",
    BIWEEKLY: "Twice weekly",
    INSTANT: "Next business day",
  };

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        description="Upgrade your plan to access more tasks and higher rewards"
      />

      {/* Current plan banner */}
      {membership && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-emerald-800">
                Active Plan: <span className="font-bold">{TIER_LIMITS[membership.tier].label}</span>
              </p>
              <p className="text-[12.5px] text-emerald-600">
                Renews {new Date(membership.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {(["BASIC", "PROFESSIONAL", "EXECUTIVE"] as MembershipTier[]).map((tier) => {
          const config = TIER_LIMITS[tier];
          const isCurrent = membership?.tier === tier && membership.status === "ACTIVE";
          const features = TIER_FEATURES[tier];
          const isPro = tier === "PROFESSIONAL";

          return (
            <div
              key={tier}
              className={`relative rounded-2xl border transition-all ${
                isPro
                  ? "border-cyan-200 shadow-[0_4px_24px_rgba(6,182,212,0.15)]"
                  : "border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              } bg-white overflow-hidden`}
            >
              {isPro && (
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: "linear-gradient(90deg,#06B6D4,#0284C7)" }}
                />
              )}

              {isPro && (
                <div className="absolute -top-0.5 right-5">
                  <div
                    className="text-white text-[11px] font-bold px-3 py-1 rounded-b-lg"
                    style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                  >
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Icon + tier name */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_GRADIENTS[tier]} flex items-center justify-center text-white mb-4`}>
                  {TIER_ICONS[tier]}
                </div>

                <h3 className="text-[17px] font-bold text-slate-800">{config.label}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-[32px] font-bold text-slate-900 leading-none">
                    {formatMoney(config.monthlyFeeCents)}
                  </span>
                  <span className="text-[13.5px] text-slate-400 mb-1">/month</span>
                </div>

                {/* Key specs */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Tasks/day</p>
                    <p className="text-[16px] font-bold text-slate-800 mt-0.5">{config.tasksPerDay}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Max reward</p>
                    <p className="text-[16px] font-bold mt-0.5" style={{ color: "#F56565" }}>
                      {formatMoney(config.maxRewardPerTaskCents)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">Payout schedule</p>
                  <p className="text-[14px] font-semibold text-slate-800 mt-0.5">
                    {payoutLabel[config.payoutSchedule] ?? config.payoutSchedule}
                  </p>
                </div>

                {/* Features */}
                <ul className="mt-5 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPro ? "text-cyan-500" : "text-emerald-500"}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6">
                  {isCurrent ? (
                    <div className="w-full py-2.5 px-4 text-center text-[13.5px] font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      Your Current Plan
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/wallet/deposit"
                      className={`flex items-center justify-center w-full py-2.5 px-4 text-center text-[13.5px] font-semibold rounded-xl transition-all ${
                        isPro
                          ? "text-white shadow-sm hover:opacity-90"
                          : "text-slate-700 bg-slate-100 hover:bg-slate-200"
                      }`}
                      style={isPro ? { background: "linear-gradient(135deg,#06B6D4,#0284C7)" } : undefined}
                    >
                      Deposit {formatMoney(config.monthlyFeeCents)} to activate
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to upgrade */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">How to upgrade</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Deposit the fee", desc: "Transfer the plan amount to your GTMS wallet." },
              { step: "2", title: "Contact support", desc: "Send an upgrade request to admin or support." },
              { step: "3", title: "Plan activated", desc: "Your plan is upgraded within 24 hours." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                >
                  {s.step}
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-slate-800">{s.title}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
