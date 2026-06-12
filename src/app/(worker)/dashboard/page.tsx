import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, StatCard, Card, CardContent, CardHeader, Badge, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { CAREER_REQUIREMENTS } from "@/lib/career";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  Target,
  TrendingUp,
  ChevronRight,
  ClipboardList,
  Award,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Star,
  Gem,
  Crown,
  Tag,
} from "lucide-react";

export default async function WorkerDashboardPage() {
  const user = await requireWorker();

  const [wallet, recentSubs, activeTasks, membership] = await Promise.all([
    db.walletAccount.findUnique({ where: { userId: user.id }, select: { balanceCents: true } }),
    db.submission.findMany({
      where: { workerId: user.id },
      include: { assignment: { include: { task: { select: { title: true, category: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.assignment.count({ where: { workerId: user.id, status: "RESERVED" } }),
    db.membership.findUnique({ where: { userId: user.id } }),
  ]);

  const workerUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      totalEarnedCents: true,
      careerLevel: true,
      accuracyScore: true,
      trustScore: true,
      kycStatus: true,
      firstMilestoneClaimed: true,
      gtmsPassActive: true,
      gtmsPassDiscountPct: true,
    },
  });

  const careerLabel = CAREER_REQUIREMENTS[workerUser?.careerLevel ?? "DIGITAL_ASSOCIATE"].label;

  const firstName = user.name?.split(" ")[0] ?? "Worker";

  function getSubStatusVariant(status: string): "success" | "danger" | "warning" | "default" {
    if (status === "APPROVED" || status === "AUTO_APPROVED") return "success";
    if (status === "REJECTED") return "danger";
    if (status === "PENDING") return "warning";
    return "default";
  }

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-800 leading-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-[13.5px] text-slate-600">Here&apos;s your workforce overview for today</p>
        </div>
        <Link
          href="/dashboard/tasks"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm"
          style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
        >
          Browse Tasks <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KYC Banner */}
      {workerUser?.kycStatus !== "APPROVED" && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-800">Complete KYC to unlock payouts</p>
              <p className="text-[12.5px] text-amber-600 mt-0.5">Identity verification required for withdrawals</p>
            </div>
          </div>
          <Link
            href="/dashboard/kyc"
            className="flex-shrink-0 text-[13px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Verify now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* VIP Combination Intro Card — shown after 10-task milestone until pass is purchased */}
      {workerUser?.firstMilestoneClaimed && !workerUser?.gtmsPassActive && (
        <div
          className="mb-6 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #78350F 0%, #B45309 45%, #D97706 100%)" }}
        >
          <div className="px-5 py-4">
            {/* badge row */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.15)", color: "#FDE68A" }}
              >
                <Tag size={10} /> {workerUser.gtmsPassDiscountPct}% First-User Discount
              </span>
              <Crown size={18} className="opacity-60 text-white" />
            </div>

            {/* copy */}
            <h3
              className="text-[20px] font-extrabold text-white leading-tight mb-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              You've unlocked Combination VIP tasks
            </h3>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.78)" }}>
              You completed your first 10 tasks — well done. You now qualify for
              Combination tasks that pay <strong className="text-white">4× the standard rate</strong>.
              Your exclusive discount brings the GTMS Pass from{" "}
              <span className="line-through opacity-60">$300</span> down to{" "}
              <strong className="text-white">
                ${((30000 * (100 - (workerUser.gtmsPassDiscountPct ?? 0)) / 100) / 100).toFixed(2)}
              </strong>.
            </p>

            {/* example earnings strip */}
            <div
              className="flex items-center gap-4 px-4 py-3 rounded-xl mb-4"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              <div className="text-center flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Standard task</p>
                <p className="text-[18px] font-extrabold text-white">$1.00</p>
              </div>
              <div className="w-px h-8 bg-white opacity-20" />
              <div className="text-center flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#FDE68A" }}>Combination task</p>
                <p className="text-[18px] font-extrabold" style={{ color: "#FDE68A" }}>$4.00</p>
              </div>
              <div className="w-px h-8 bg-white opacity-20" />
              <div className="text-center flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Multiplier</p>
                <p className="text-[18px] font-extrabold text-white">400%</p>
              </div>
            </div>

            <Link
              href="/dashboard/pass"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13.5px] font-bold transition-opacity hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff" }}
            >
              <Gem size={15} /> Claim your discount <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Hero Card */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutDashboard className="w-4 h-4 opacity-80" />
              <span className="text-[12.5px] font-medium opacity-80 uppercase tracking-wider">Dashboard</span>
            </div>
            <h2 className="text-[20px] font-bold leading-tight">{firstName}&apos;s Workspace</h2>
            <p className="text-[13px] opacity-80 mt-1">Keep going — every task builds your career</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star className="w-3.5 h-3.5" />
              <span className="text-[12px] font-semibold">{careerLabel}</span>
            </div>
            <p className="text-[12px] opacity-70 mt-2">
              Trust: {workerUser?.trustScore?.toFixed(0) ?? 50}/100
            </p>
          </div>
        </div>
        <div className="relative mt-4 pt-4 border-t border-white/20 grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[11.5px] opacity-70 uppercase tracking-wide">Balance</p>
            <p className="text-[17px] font-bold mt-0.5">{formatMoney(wallet?.balanceCents ?? 0)}</p>
          </div>
          <div>
            <p className="text-[11.5px] opacity-70 uppercase tracking-wide">Active</p>
            <p className="text-[17px] font-bold mt-0.5">{activeTasks} tasks</p>
          </div>
          <div>
            <p className="text-[11.5px] opacity-70 uppercase tracking-wide">Accuracy</p>
            <p className="text-[17px] font-bold mt-0.5">{workerUser?.accuracyScore?.toFixed(1) ?? 50}%</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Wallet Balance"
          value={formatMoney(wallet?.balanceCents ?? 0)}
          color="cyan"
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          label="Total Earned"
          value={formatMoney(workerUser?.totalEarnedCents ?? 0)}
          color="emerald"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Active Tasks"
          value={activeTasks}
          color="amber"
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Accuracy Score"
          value={`${workerUser?.accuracyScore?.toFixed(1) ?? 50}%`}
          color="violet"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <h2 className="text-[15px] font-semibold text-slate-800">Recent Submissions</h2>
            </div>
            <Link
              href="/dashboard/submissions"
              className="text-[12.5px] font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {recentSubs.length === 0 ? (
              <EmptyState
                title="No submissions yet"
                description="Browse tasks to get started earning."
              />
            ) : (
              <div>
                {recentSubs.map((sub, idx) => (
                  <Link
                    key={sub.id}
                    href={`/dashboard/submissions/${sub.id}`}
                    className={`flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors ${
                      idx < recentSubs.length - 1 ? "border-b border-slate-50" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-slate-700 truncate">
                        {sub.assignment.task.title}
                      </p>
                      <p className="text-[12px] text-slate-400 mt-0.5">
                        {sub.assignment.task.category.replace(/_/g, " ")} &middot;{" "}
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <Badge variant={getSubStatusVariant(sub.status)}>
                        {sub.status.replace("_", " ")}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Quick Actions */}
        <div className="space-y-4">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                <h2 className="text-[15px] font-semibold text-slate-800">Account Status</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 px-0 py-0">
              <Link
                href="/dashboard/career"
                className="flex items-center justify-between px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <p className="text-[12px] text-slate-400 uppercase tracking-wide font-medium">Career Level</p>
                  <p className="text-[13.5px] font-semibold text-slate-700 mt-0.5">{careerLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-cyan-600 font-medium">Progress</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>

              <Link
                href="/dashboard/membership"
                className="flex items-center justify-between px-6 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <p className="text-[12px] text-slate-400 uppercase tracking-wide font-medium">Membership</p>
                  <p className="text-[13.5px] font-semibold text-slate-700 mt-0.5">
                    {membership?.tier ?? "No Plan"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-cyan-600 font-medium">
                    {membership ? "Manage" : "Upgrade"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>

              <Link
                href="/dashboard/performance"
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <p className="text-[12px] text-slate-400 uppercase tracking-wide font-medium">Trust Score</p>
                  <p className="text-[13.5px] font-semibold text-slate-700 mt-0.5">
                    {workerUser?.trustScore?.toFixed(1) ?? 50}
                    <span className="text-slate-400 font-normal">/100</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-cyan-600 font-medium">Details</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-[15px] font-semibold text-slate-800">Quick Actions</h2>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <Link
                href="/dashboard/tasks"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition-colors"
              >
                <Target className="w-5 h-5 text-cyan-600" />
                <span className="text-[11.5px] font-semibold text-cyan-700 text-center leading-tight">Browse Tasks</span>
              </Link>
              <Link
                href="/dashboard/wallet"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span className="text-[11.5px] font-semibold text-emerald-700 text-center leading-tight">My Wallet</span>
              </Link>
              <Link
                href="/dashboard/certifications"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors"
              >
                <Award className="w-5 h-5 text-violet-600" />
                <span className="text-[11.5px] font-semibold text-violet-700 text-center leading-tight">Certificates</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
