import { requireBusiness } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardHeader, CardContent, StatCard, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
  Inbox,
} from "lucide-react";

export default async function BusinessDashboardPage() {
  const user = await requireBusiness();

  const [wallet, tasks] = await Promise.all([
    db.walletAccount.findUnique({ where: { userId: user.id } }),
    db.task.findMany({
      where: { requesterId: user.id },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const taskCounts = await db.task.groupBy({
    by: ["status"],
    where: { requesterId: user.id },
    _count: { _all: true },
  });

  const active = taskCounts.find((t) => t.status === "ACTIVE")?._count._all ?? 0;
  const draft = taskCounts.find((t) => t.status === "DRAFT")?._count._all ?? 0;
  const total = taskCounts.reduce((s, t) => s + t._count._all, 0);

  const pendingReviews = await db.submission.count({
    where: {
      assignment: { task: { requesterId: user.id } },
      status: "PENDING",
    },
  });

  const totalApproved = await db.submission.count({
    where: {
      assignment: { task: { requesterId: user.id } },
      status: { in: ["APPROVED", "AUTO_APPROVED"] },
    },
  });

  const totalSubmissions = await db.submission.count({
    where: {
      assignment: { task: { requesterId: user.id } },
    },
  });

  const approvalRate =
    totalSubmissions > 0
      ? ((totalApproved / totalSubmissions) * 100).toFixed(0)
      : "0";

  const totalSpent = await db.transaction.aggregate({
    where: {
      wallet: { userId: user.id },
      type: { in: ["PAYOUT", "PLATFORM_FEE"] },
    },
    _sum: { amountCents: true },
  });

  const statusStyle: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-600",
    DRAFT: "bg-amber-50 text-amber-600",
    PAUSED: "bg-blue-50 text-blue-600",
    COMPLETED: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-red-50 text-red-600",
  };

  const displayName = (user as { name?: string | null }).name ?? "Business";

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-600">
            Here&apos;s an overview of your workforce tasks and activity
          </p>
        </div>
        <Link
          href="/business/tasks/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          <Plus className="w-4 h-4" />
          New Task
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Tasks"
          value={active}
          sub={`${draft} in draft`}
          color="cyan"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <StatCard
          label="Total Submissions"
          value={totalSubmissions}
          color="purple"
          icon={<Inbox className="w-5 h-5" />}
        />
        <StatCard
          label="Approval Rate"
          value={`${approvalRate}%`}
          color="green"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Wallet Balance"
          value={formatMoney(wallet?.balanceCents ?? 0)}
          color="emerald"
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      {/* Pending review alert */}
      {pendingReviews > 0 && (
        <Link
          href="/business/tasks"
          className="flex items-center justify-between px-5 py-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-800">
                {pendingReviews} submission{pendingReviews !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-[12.5px] text-amber-600">Click to review and approve workers&apos; submissions</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
        </Link>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Tasks - spans 2 cols */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-[15px] font-semibold text-slate-800">Recent Tasks</h2>
              <Link
                href="/business/tasks"
                className="text-[12.5px] text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {tasks.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-[13.5px] text-slate-600 font-medium">No tasks yet</p>
                  <p className="text-[12.5px] text-slate-400 mt-1">Create your first task to get started</p>
                </div>
              ) : (
                tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/business/tasks/${t.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-slate-700 truncate">{t.title}</p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5">
                        {t._count.assignments} unit{t._count.assignments !== 1 ? "s" : ""} ·{" "}
                        {formatMoney(t.rewardPerUnitCents)}/unit
                      </p>
                    </div>
                    <span
                      className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold flex-shrink-0 ${
                        statusStyle[t.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-[15px] font-semibold text-slate-800">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link
                href="/business/tasks/new"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[13.5px] font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                Post New Task
              </Link>
              <Link
                href="/business/wallet"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-[13.5px] font-semibold hover:bg-slate-200 transition-colors"
              >
                <Wallet className="w-4 h-4 flex-shrink-0" />
                Add Funds to Wallet
              </Link>
              <Link
                href="/business/reports"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-[13.5px] font-semibold hover:bg-slate-200 transition-colors"
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                View Reports
              </Link>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <Card>
            <CardHeader>
              <h2 className="text-[15px] font-semibold text-slate-800">Summary</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Tasks", value: total, icon: <ClipboardList className="w-4 h-4" /> },
                { label: "Active Tasks", value: active, icon: <CheckCircle2 className="w-4 h-4" /> },
                { label: "Pending Reviews", value: pendingReviews, icon: <Clock className="w-4 h-4" /> },
                { label: "Total Approved", value: totalApproved, icon: <CheckCircle2 className="w-4 h-4" /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13.5px] text-slate-600">
                    <span className="text-slate-400">{item.icon}</span>
                    {item.label}
                  </div>
                  <span className="text-[13.5px] font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[13.5px] text-slate-600">Total Spent</span>
                <span className="text-[13.5px] font-semibold" style={{ color: "#F56565" }}>
                  {formatMoney(totalSpent._sum.amountCents ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
