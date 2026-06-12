import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, Plus, RefreshCw } from "lucide-react";

const txnColor: Record<string, string> = {
  DEPOSIT: "text-emerald-600",
  EARNING: "text-emerald-600",
  PAYOUT: "text-red-500",
  PLATFORM_FEE: "text-slate-500",
  SUBSCRIPTION_FEE: "text-orange-500",
  REFUND: "text-blue-600",
};

const txnPrefix: Record<string, string> = {
  DEPOSIT: "+",
  EARNING: "+",
  REFUND: "+",
  PAYOUT: "-",
  PLATFORM_FEE: "-",
  SUBSCRIPTION_FEE: "-",
};

export default async function BusinessWalletPage() {
  const user = await requireBusiness();

  const wallet = await db.walletAccount.findUnique({ where: { userId: user.id } });

  const [transactions, deposits] = await Promise.all([
    wallet
      ? db.transaction.findMany({
          where: { walletId: wallet.id },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : [],
    db.deposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const pendingDeposits = deposits.filter((d) => d.status === "PENDING").length;
  const totalDeposited = deposits
    .filter((d) => d.status === "APPROVED")
    .reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Wallet</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            Fund your account to pay workers
          </p>
        </div>
        <Link
          href="/business/wallet/deposit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          <Plus className="w-4 h-4" />
          Add Funds
        </Link>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Available Balance</p>
              <p className="mt-2 text-[32px] font-bold leading-none text-emerald-600">
                {formatMoney(wallet?.balanceCents ?? 0)}
              </p>
              <p className="mt-2 text-[12.5px] text-slate-400">Ready to fund tasks</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/business/wallet/deposit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
            >
              <Plus className="w-4 h-4" />
              Add Funds
            </Link>
          </div>
        </div>

        <StatCard
          label="Pending Deposits"
          value={pendingDeposits}
          sub="awaiting approval"
          color="yellow"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Total Deposited"
          value={formatMoney(totalDeposited)}
          sub="all time"
          color="cyan"
          icon={<ArrowDownCircle className="w-5 h-5" />}
        />
      </div>

      {/* Deposit Requests */}
      {deposits.length > 0 && (
        <Card className="mb-5">
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Deposit Requests</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] font-semibold text-emerald-600">
                        +{formatMoney(d.amountCents)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13.5px] text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          d.status === "APPROVED"
                            ? "success"
                            : d.status === "REJECTED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h2 className="text-[15px] font-semibold text-slate-800">Transaction History</h2>
        </CardHeader>
        {transactions.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-[13.5px] text-slate-600 font-medium">No transactions yet</p>
            <p className="text-[12.5px] text-slate-400 mt-1">Add funds to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const isCredit = ["EARNING", "DEPOSIT", "REFUND"].includes(t.type);
                  return (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-[13.5px] font-medium text-slate-700">
                          {t.description ?? t.type.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isCredit ? (
                            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ArrowUpCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className="text-[12.5px] text-slate-500">{t.type.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13.5px] text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-[13.5px] font-semibold ${txnColor[t.type] ?? "text-slate-700"}`}>
                          {txnPrefix[t.type] ?? ""}{formatMoney(t.amountCents)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
