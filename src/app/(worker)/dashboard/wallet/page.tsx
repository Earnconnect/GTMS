import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { Card, CardContent, CardHeader, Badge, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Send,
  AlertTriangle,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Gift,
} from "lucide-react";

const CREDIT_TYPES = ["EARNING", "DEPOSIT", "REFUND", "REFERRAL_BONUS"];

function getTxnIcon(type: string) {
  if (CREDIT_TYPES.includes(type)) return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
  return <ArrowUpRight className="w-4 h-4 text-red-400" />;
}

function getTxnTypeIcon(type: string) {
  switch (type) {
    case "EARNING": return <TrendingUp className="w-3.5 h-3.5" />;
    case "DEPOSIT": return <ArrowDownLeft className="w-3.5 h-3.5" />;
    case "WITHDRAWAL": return <ArrowUpRight className="w-3.5 h-3.5" />;
    case "REFUND": return <RefreshCw className="w-3.5 h-3.5" />;
    case "REFERRAL_BONUS": return <Gift className="w-3.5 h-3.5" />;
    default: return null;
  }
}

function getDepositStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warning";
}

function getPayoutStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "danger";
  return "warning";
}

export default async function WorkerWalletPage() {
  const user = await requireWorker();

  const [wallet, deposits, payouts, worker] = await Promise.all([
    db.walletAccount.findUnique({
      where: { userId: user.id },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
    }),
    db.deposit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.payout.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.user.findUnique({ where: { id: user.id }, select: { kycStatus: true, totalEarnedCents: true } }),
  ]);

  const kycApproved = worker?.kycStatus === "APPROVED";

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">My Wallet</h1>
          <p className="mt-1 text-[13.5px] text-slate-600">Manage your earnings, deposits, and withdrawals</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link
            href="/dashboard/wallet/deposit"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
            style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
          >
            <Plus className="w-4 h-4" /> Deposit
          </Link>
          <Link
            href={kycApproved ? "/dashboard/wallet/payout" : "#"}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
              kycApproved
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* KYC Warning */}
      {!kycApproved && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-800">KYC required to make withdrawals</p>
              <p className="text-[12.5px] text-amber-600 mt-0.5">Complete identity verification to enable payouts</p>
            </div>
          </div>
          <Link
            href="/dashboard/kyc"
            className="flex-shrink-0 text-[13px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Verify <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Balance Hero Card */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white" />
          <div className="absolute -bottom-14 -left-10 w-44 h-44 rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 opacity-80" />
            <span className="text-[12.5px] font-medium opacity-80 uppercase tracking-wider">Available Balance</span>
          </div>
          <p className="text-[42px] font-bold leading-none mb-1">
            {formatMoney(wallet?.balanceCents ?? 0)}
          </p>
          <p className="text-[13px] opacity-70 mb-5">
            Total earned all-time: {formatMoney(worker?.totalEarnedCents ?? 0)}
          </p>
          <div className="flex gap-3 sm:hidden">
            <Link
              href="/dashboard/wallet/deposit"
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Deposit
            </Link>
            <Link
              href={kycApproved ? "/dashboard/wallet/payout" : "#"}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                kycApproved
                  ? "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  : "bg-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" /> Withdraw
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-800">Transaction History</h2>
            </div>
            {wallet?.transactions && wallet.transactions.length > 0 && (
              <span className="text-[12px] text-slate-400">{wallet.transactions.length} records</span>
            )}
          </CardHeader>
          <CardContent className="px-0 py-0">
            {!wallet?.transactions?.length ? (
              <EmptyState title="No transactions yet" description="Your transaction history will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
                      <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Description</th>
                      <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                      <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.transactions.map((txn) => {
                      const isCredit = CREDIT_TYPES.includes(txn.type);
                      return (
                        <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={isCredit ? "text-emerald-500" : "text-rose-400"}>
                                {getTxnTypeIcon(txn.type)}
                              </span>
                              <span className="text-[11.5px] text-slate-500 hidden sm:block">{txn.type.replace(/_/g, " ")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-[13.5px] text-slate-700 truncate max-w-[160px]">{txn.description}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-[12.5px] text-slate-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span
                              className={`text-[13.5px] font-semibold ${isCredit ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {isCredit ? "+" : "-"}{formatMoney(txn.amountCents)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposits & Payouts */}
        <div className="space-y-6">
          {/* Recent Deposits */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-slate-500" />
                <h2 className="text-[15px] font-semibold text-slate-800">Recent Deposits</h2>
              </div>
              <Link
                href="/dashboard/wallet/deposit"
                className="text-[12px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
              >
                New <Plus className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {!deposits.length ? (
                <div className="px-6 py-6 text-center">
                  <p className="text-[13px] text-slate-400">No deposits yet.</p>
                  <Link
                    href="/dashboard/wallet/deposit"
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    Request your first deposit <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div>
                  {deposits.map((d, idx) => (
                    <div
                      key={d.id}
                      className={`flex items-center justify-between px-6 py-3.5 ${
                        idx < deposits.length - 1 ? "border-b border-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-slate-700">{formatMoney(d.amountCents)}</p>
                          <p className="text-[12px] text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={getDepositStatusVariant(d.status)}>{d.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payouts */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-slate-500" />
                <h2 className="text-[15px] font-semibold text-slate-800">Recent Payouts</h2>
              </div>
              {kycApproved && (
                <Link
                  href="/dashboard/wallet/payout"
                  className="text-[12px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                >
                  Request <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="px-0 py-0">
              {!payouts.length ? (
                <div className="px-6 py-6 text-center">
                  <p className="text-[13px] text-slate-400">No payouts yet.</p>
                  {kycApproved ? (
                    <Link
                      href="/dashboard/wallet/payout"
                      className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      Request a withdrawal <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <p className="mt-1 text-[12px] text-amber-600">Complete KYC to enable withdrawals</p>
                  )}
                </div>
              ) : (
                <div>
                  {payouts.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-6 py-3.5 ${
                        idx < payouts.length - 1 ? "border-b border-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-slate-700">{formatMoney(p.amountCents)}</p>
                          <p className="text-[12px] text-slate-400">
                            {p.method} &middot; {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getPayoutStatusVariant(p.status)}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
