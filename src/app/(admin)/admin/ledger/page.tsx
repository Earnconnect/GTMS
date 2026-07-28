import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { reconcileWallet } from "@/server/services/wallet.service";
import { PageHeader, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function AdminLedgerPage() {
  await requireRole("ADMIN");

  const wallets = await db.walletAccount.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  const reconciliations = await Promise.all(
    wallets.map(async (w) => ({
      wallet: w,
      recon: await reconcileWallet(w.id),
    })),
  );

  const allOk = reconciliations.every((r) => r.recon.balanceOk && r.recon.escrowOk);

  const recentTxns = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { wallet: { include: { user: { select: { email: true } } } } },
  });

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="Double-entry integrity across all wallets."
        action={
          allOk ? (
            <Badge tone="green">All reconciled</Badge>
          ) : (
            <Badge tone="red">Drift detected</Badge>
          )
        }
      />

      <h2 className="mb-3 text-lg font-semibold">Wallet reconciliation</h2>
      <div className="mb-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Wallet</th>
              <th className="px-4 py-2 text-right">Cached</th>
              <th className="px-4 py-2 text-right">Computed</th>
              <th className="px-4 py-2 text-right">Escrow (cached/computed)</th>
              <th className="px-4 py-2">OK?</th>
            </tr>
          </thead>
          <tbody>
            {reconciliations.map(({ wallet, recon }) => (
              <tr key={wallet.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2">
                  <div className="text-slate-700">{wallet.user.email}</div>
                  <div className="text-xs text-slate-400">{wallet.user.role}</div>
                </td>
                <td className="px-4 py-2 text-right">{formatMoney(recon.cachedBalance)}</td>
                <td className="px-4 py-2 text-right">{formatMoney(recon.computedBalance)}</td>
                <td className="px-4 py-2 text-right">
                  {formatMoney(recon.cachedEscrow)} / {formatMoney(recon.computedEscrow)}
                </td>
                <td className="px-4 py-2">
                  {recon.balanceOk && recon.escrowOk ? (
                    <Badge tone="green">OK</Badge>
                  ) : (
                    <Badge tone="red">Drift</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Recent transactions</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Wallet</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {recentTxns.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-slate-500">
                  {t.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-slate-600">{t.wallet.user.email}</td>
                <td className="px-4 py-2 text-slate-700">{t.type.replaceAll("_", " ")}</td>
                <td className="px-4 py-2 text-right">{formatMoney(t.amount)}</td>
                <td className="px-4 py-2 text-right text-slate-500">
                  {formatMoney(t.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
