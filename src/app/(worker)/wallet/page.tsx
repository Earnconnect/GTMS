import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { getOrCreateWallet } from "@/server/services/wallet.service";
import { PageHeader, Card } from "@/components/ui";
import { PayoutForm } from "@/components/wallet/PayoutForm";
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
      where: { walletId: wallet.id, type: "EARNING" },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Your earnings. Withdraw any time above the minimum — no fees, no unlocks."
      />

      {sp.stripe_connected === "1" && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Stripe account linked. Payouts will be sent directly to your bank once approved.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Available to withdraw</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatMoney(wallet.balance)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Lifetime earnings</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatMoney(lifetime._sum.amount ?? 0)}
          </p>
        </Card>
      </div>

      {!kycApproved && (
        <div className="mb-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Complete{" "}
          <a href="/kyc" className="font-medium underline">
            identity verification
          </a>{" "}
          to withdraw your earnings. It&apos;s a one-time, free check — your tasks
          and earnings are unaffected.
        </div>
      )}

      {isStripe && (
        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Payout account</h2>
          <StripeConnectButton isConnected={stripeConnected} />
          {!stripeConnected && (
            <p className="mt-2 text-xs text-slate-400">
              You can still request payouts without a connected account — admin will
              process them manually. Connecting enables automatic bank transfers.
            </p>
          )}
        </Card>
      )}

      <Card className="mb-6">
        <PayoutForm balance={wallet.balance} minPayout={MIN_PAYOUT_CENTS} />
      </Card>

      {payouts.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Payouts</h2>
          <div className="space-y-2">
            {payouts.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {p.createdAt.toLocaleDateString()} — {formatMoney(p.amount)}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
      <TxnTable txns={txns} />
    </div>
  );
}
