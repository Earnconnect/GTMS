import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { getOrCreateWallet } from "@/server/services/wallet.service";
import { PageHeader, Card } from "@/components/ui";
import { DepositForm } from "@/components/wallet/DepositForm";
import { StripeDepositForm } from "@/components/wallet/StripeDepositForm";
import { TxnTable } from "@/components/wallet/TxnTable";
import { formatMoney } from "@/lib/money";

const isStripe = process.env.PAYMENT_PROVIDER === "stripe";

export default async function RequesterWalletPage() {
  const user = await requireRole("REQUESTER");
  const wallet = await getOrCreateWallet(user.id);
  const txns = await db.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Fund your tasks and track spending." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Available balance</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatMoney(wallet.balance)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In escrow</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {formatMoney(wallet.escrowBalance)}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        {isStripe ? <StripeDepositForm /> : <DepositForm />}
        <p className="mt-3 text-xs text-slate-400">
          Using the <span className="font-medium">{isStripe ? "Stripe" : "simulated"}</span>{" "}
          payment provider.
          {!isStripe && " Set PAYMENT_PROVIDER=stripe to use real payments."}
        </p>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
      <TxnTable txns={txns} />
    </div>
  );
}
