import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardContent, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import UserAdminControls from "./UserAdminControls";
import CreditAccountForm from "./CreditAccountForm";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      membership: true,
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      certifications: { include: { certification: { select: { title: true } } } },
    },
  });

  if (!user) notFound();

  const [submissionCount, depositCount] = await Promise.all([
    db.submission.count({ where: { workerId: id } }),
    db.deposit.count({ where: { userId: id } }),
  ]);

  const txnBadge: Record<string, "success" | "info" | "danger" | "warning" | "default"> = {
    DEPOSIT: "success",
    EARNING: "success",
    REFUND: "info",
    REFERRAL_BONUS: "cyan" as "info",
    ADMIN_CREDIT: "info",
    LOAN: "warning",
    PAYOUT: "danger",
    PLATFORM_FEE: "danger",
    MEMBERSHIP_FEE: "danger",
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title={user.name ?? user.email} description={`${user.role} · ${user.status}`} />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Wallet Balance</p>
            <p className="text-xl font-bold text-green-600">{formatMoney(user.wallet?.balanceCents ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Total Earned</p>
            <p className="text-xl font-bold text-gray-900">{formatMoney(user.totalEarnedCents)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Account Details</h2>
        </div>
        <CardContent className="pt-4 space-y-2">
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
          <Row label="Status" value={user.status} />
          <Row label="KYC" value={user.kycStatus} />
          <Row label="Career Level" value={user.careerLevel} />
          <Row label="Accuracy Score" value={`${user.accuracyScore.toFixed(1)}%`} />
          <Row label="Trust Score" value={`${user.trustScore.toFixed(1)}`} />
          <Row label="Submissions" value={String(submissionCount)} />
          <Row label="Deposits" value={String(depositCount)} />
          {user.membership && (
            <Row label="Membership" value={`${user.membership.tier} (${user.membership.status})`} />
          )}
        </CardContent>
      </Card>

      <UserAdminControls userId={id} currentStatus={user.status} tier={user.membership?.tier} />

      {/* Credit / Loan section */}
      <Card className="mt-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Credit / Loan Account</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add funds directly to this user&apos;s wallet as an admin credit or loan.
          </p>
        </div>
        <CardContent className="pt-4">
          {user.wallet ? (
            <CreditAccountForm userId={id} />
          ) : (
            <p className="text-sm text-slate-400">This user has no wallet yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {user.wallet && user.wallet.transactions.length > 0 && (
        <Card className="mt-4">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {user.wallet.transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-slate-700">{txn.description}</p>
                  <p className="text-[11.5px] text-slate-400">
                    {new Date(txn.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatMoney(txn.amountCents)}
                  </span>
                  <Badge variant={txnBadge[txn.type] ?? "default"}>
                    {txn.type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
