import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { ensureReferralCode } from "@/server/services/referral.service";
import { PageHeader, Card } from "@/components/ui";
import { ReferralLink } from "@/components/referrals/ReferralLink";
import { formatMoney } from "@/lib/money";
import { REFERRAL_BONUS_CENTS } from "@/lib/constants";

export default async function ReferralsPage() {
  const user = await requireRole("WORKER");
  const code = await ensureReferralCode(user.id);

  const [invitees, bonusAgg] = await Promise.all([
    db.user.findMany({
      where: { referredById: user.id },
      select: { name: true, email: true, createdAt: true, referralBonusAwarded: true },
      orderBy: { createdAt: "desc" },
    }),
    db.transaction.aggregate({
      where: {
        wallet: { userId: user.id },
        type: "REFERRAL_BONUS",
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Refer & earn"
        subtitle={`Earn ${formatMoney(
          REFERRAL_BONUS_CENTS,
        )} (paid by the platform) when someone you invite completes their first task.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Invites</p>
          <p className="mt-1 text-2xl font-semibold">{invitees.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Bonus earned</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatMoney(bonusAgg._sum.amount ?? 0)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <p className="mb-2 text-sm font-medium text-slate-700">Your invite link</p>
        <ReferralLink code={code} />
        <p className="mt-3 text-xs text-slate-400">
          Bonuses are funded by GTMS — your invitees never pay or deposit anything.
        </p>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Your invitees</h2>
      {invitees.length === 0 ? (
        <p className="text-sm text-slate-500">No invitees yet. Share your link!</p>
      ) : (
        <div className="space-y-2">
          {invitees.map((i) => (
            <Card key={i.email}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{i.name ?? i.email}</span>
                <span className={i.referralBonusAwarded ? "text-green-600" : "text-slate-400"}>
                  {i.referralBonusAwarded ? "Bonus earned" : "Pending first task"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
