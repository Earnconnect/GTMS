import { Wallet as WalletIcon, TrendingUp, BadgeCheck, CheckCircle2, Landmark } from "lucide-react";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { getOrCreateWallet } from "@/server/services/wallet.service";
import { PageHeader, StatCard, SectionCard } from "@/components/ui";
import { PayoutForm } from "@/components/wallet/PayoutForm";
import { WithdrawalMethodForm } from "@/components/wallet/WithdrawalMethodForm";
import { StripeConnectButton } from "@/components/wallet/StripeConnectButton";
import { TxnTable } from "@/components/wallet/TxnTable";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatMoney } from "@/lib/money";
import { MIN_PAYOUT_CENTS } from "@/lib/constants";

const isStripe = process.env.PAYMENT_PROVIDER === "stripe";

export default async function WorkerWalletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await requireRole("WORKER");
  const wallet = await getOrCreateWallet(user.id);
  const me = await db.user.findUnique({
    where: { id: user.id },
    select: { kycStatus: true, stripeConnectId: true },
  });
  const kycApproved = me?.kycStatus === "APPROVED";
  const stripeConnected = Boolean(me?.stripeConnectId);
  const method = await db.withdrawalMethod.findUnique({ where: { userId: user.id } });

  const [txns, payouts, lifetime] = await Promise.all([
    db.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.payout.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.transaction.aggregate({
      where: { walletId: wallet.id, type: "SALARY", amount: { gt: 0 } },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pay & wallet"
        subtitle="Track your earnings and withdraw to your preferred method."
      />

      {sp.stripe_connected === "1" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Stripe account linked. Payouts will be sent to your bank once approved.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Available to withdraw" value={formatMoney(wallet.balance)} icon={<WalletIcon className="h-5 w-5" />} tone="brand" />
        <StatCard label="Total salary received" value={formatMoney(lifetime._sum.amount ?? 0)} icon={<TrendingUp className="h-5 w-5" />} tone="emerald" />
      </div>

      {!kycApproved && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <BadgeCheck className="h-5 w-5 shrink-0" />
          <span>
            Complete{" "}
            <a href="/kyc" className="font-semibold underline">
              identity verification
            </a>{" "}
            to withdraw. It&apos;s a one-time, free check — it does not affect your
            salary.
          </span>
        </div>
      )}

      {isStripe && (
        <SectionCard title="Payout account" description="Connect a bank for automatic transfers.">
          <StripeConnectButton isConnected={stripeConnected} />
          {!stripeConnected && (
            <p className="mt-2 text-xs text-slate-400">
              You can still request payouts without a connected account — admin will
              process them manually.
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="Withdrawal details"
        description="Where your payouts are sent."
        action={
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Landmark className="h-4 w-4" />
          </span>
        }
      >
        <WithdrawalMethodForm
          method={
            method
              ? {
                  type: method.type,
                  accountName: method.accountName,
                  institution: method.institution,
                  accountLast4: method.accountLast4,
                  currency: method.currency,
                  country: method.country,
                }
              : null
          }
        />
      </SectionCard>

      <SectionCard title="Withdraw" description="Request a payout from your available balance.">
        {!method && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <Landmark className="h-4 w-4 shrink-0" />
            Add your withdrawal details above before requesting a payout.
          </div>
        )}
        <PayoutForm balance={wallet.balance} minPayout={MIN_PAYOUT_CENTS} />
      </SectionCard>

      {payouts.length > 0 && (
        <SectionCard title="Withdrawals" description="Your payout requests and their status.">
          <ul className="divide-y divide-slate-100">
            {payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 tabular-nums">
                    {formatMoney(p.amount)}
                  </p>
                  <p className="text-xs text-slate-400">{p.createdAt.toLocaleString()}</p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Transactions" description="Every credit and debit on your wallet.">
        <TxnTable txns={txns} />
      </SectionCard>
    </div>
  );
}
