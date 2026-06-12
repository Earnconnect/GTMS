import { requireWorker } from "@/server/rbac";
import { db } from "@/server/db";
import { browseTasks } from "@/server/services/task.service";
import { canAccessTask } from "@/lib/permissions";
import { EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { Suspense } from "react";
import type { TaskCategory, MembershipTier } from "@/generated/prisma";
import {
  MapPin, Clock, Search, Package, ShieldCheck, Cpu,
  Bookmark, ChevronRight, Zap, Gem, Crown, Lock,
} from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

// ── Category config ───────────────────────────────────────────────────────────
const CAT_CONFIG: Record<
  TaskCategory,
  { label: string; cardBg: string; iconBg: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  PRODUCT_INTELLIGENCE:    { label: "Product Intelligence",    cardBg: "#EDE9FE", iconBg: "#7C3AED", Icon: Search      },
  ORDER_OPERATIONS:        { label: "Order Operations",        cardBg: "#FFE4E6", iconBg: "#E11D48", Icon: Package     },
  TRANSACTION_VERIFICATION:{ label: "Transaction Verification",cardBg: "#DCFCE7", iconBg: "#16A34A", Icon: ShieldCheck },
  AI_DATA_INTELLIGENCE:    { label: "AI & Data Intelligence",  cardBg: "#DBEAFE", iconBg: "#2563EB", Icon: Cpu         },
  COMBINATION:             { label: "Combination VIP",         cardBg: "#FEF9C3", iconBg: "#B45309", Icon: Gem         },
};

const TIER_LABEL: Record<MembershipTier, string> = {
  BASIC:        "Entry Level",
  PROFESSIONAL: "Professional",
  EXECUTIVE:    "Executive",
};

function relativeDate(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

// ── Promoted card ─────────────────────────────────────────────────────────────
function PromoCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[280px]"
      style={{ background: "linear-gradient(140deg, #1E1B4B 0%, #4C1D95 55%, #6D28D9 100%)" }}
    >
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-5"
          style={{ background: "rgba(255,255,255,0.12)", color: "#C4B5FD" }}
        >
          <Zap size={11} /> Top earners
        </span>
        <h3 className="text-[24px] font-extrabold text-white leading-tight mb-2" style={{ letterSpacing: "-0.02em" }}>
          Unlock higher-earning tasks
        </h3>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          Upgrade to Professional and earn up to $10 per task — 100 tasks per day,
          bi-weekly payouts, QA pipeline access.
        </p>
      </div>
      <Link
        href="/dashboard/membership"
        className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl text-[13.5px] font-bold transition-opacity hover:opacity-90"
        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
      >
        Upgrade plan <ChevronRight size={15} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

// ── VIP Combination promo card ────────────────────────────────────────────────
function VipPromoCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col justify-between p-6 min-h-[280px]"
      style={{ background: "linear-gradient(140deg, #78350F 0%, #B45309 50%, #D97706 100%)" }}
    >
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-5"
          style={{ background: "rgba(255,255,255,0.15)", color: "#FDE68A" }}
        >
          <Gem size={11} /> VIP Access
        </span>
        <h3 className="text-[22px] font-extrabold text-white leading-tight mb-2" style={{ letterSpacing: "-0.02em" }}>
          Earn 400% with Combination Tasks
        </h3>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          Unlock VIP Combination tasks with a one-time GTMS Pass. Requires 80%+ accuracy.
          Deductible from your earned balance.
        </p>
      </div>
      <Link
        href="/dashboard/pass"
        className="mt-6 inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl text-[13.5px] font-bold transition-opacity hover:opacity-90"
        style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
      >
        Get GTMS Pass — $300 <ChevronRight size={15} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  access,
}: {
  task: Awaited<ReturnType<typeof browseTasks>>["tasks"][number];
  access: { allowed: boolean; reason?: string };
}) {
  const cfg  = CAT_CONFIG[task.category];
  const Icon = cfg.Icon;
  const units = task._count.assignments;
  const isVip = task.category === "COMBINATION";
  const needsPass = !access.allowed && access.reason?.includes("GTMS Pass");

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      style={{
        background: isVip
          ? "linear-gradient(145deg, #FFFBEB 0%, #FEF9C3 60%, #FDE68A 100%)"
          : cfg.cardBg,
        border: isVip ? "1.5px solid #F59E0B" : "1.5px solid transparent",
      }}
    >
      {/* VIP banner */}
      {isVip && (
        <div
          className="flex items-center gap-1.5 px-5 py-2 text-[11px] font-bold uppercase tracking-widest"
          style={{ background: "linear-gradient(90deg, #B45309 0%, #D97706 100%)", color: "#fff" }}
        >
          <Crown size={11} /> VIP Task · 400% Earnings Multiplier
        </div>
      )}

      {/* top: reward + icon */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between">
        <div>
          <p className="text-[26px] font-extrabold leading-none" style={{ color: "#0F172A", letterSpacing: "-0.025em" }}>
            {formatMoney(task.rewardPerUnitCents)}
          </p>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>/unit</p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.iconBg }}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>

      {/* title + category */}
      <div className="px-5 pb-4">
        <h3 className="text-[15px] font-bold leading-snug line-clamp-2 mb-0.5" style={{ color: "#0F172A" }}>
          {task.title}
        </h3>
        <p className="text-[13px] font-medium" style={{ color: "#64748B" }}>{cfg.label}</p>
      </div>

      {/* meta: location + date + units */}
      <div className="px-5 pb-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#64748B" }}>
          <MapPin size={12} className="flex-shrink-0" />
          <span>Remote</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#64748B" }}>
          <Clock size={12} className="flex-shrink-0" />
          <span>{relativeDate(task.createdAt)}</span>
          <span style={{ color: "#CBD5E1" }}>·</span>
          <span>{units.toLocaleString()} unit{units !== 1 ? "s" : ""} available</span>
        </div>
      </div>

      {/* tags */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {isVip && (
          <span
            className="px-2.5 py-1 rounded-full text-[11.5px] font-bold"
            style={{ background: "#B45309", color: "#fff" }}
          >
            80%+ Accuracy Required
          </span>
        )}
        <span
          className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
          style={{ background: "rgba(255,255,255,0.7)", color: "#475569", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          {TIER_LABEL[task.requiredMembershipTier]}
        </span>
        {task.qaEnabled && (
          <span
            className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
            style={{ background: "rgba(255,255,255,0.7)", color: "#475569", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            QA Reviewed
          </span>
        )}
        {task.requiredCertifications.length > 0 && (
          <span
            className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
            style={{ background: "rgba(255,255,255,0.7)", color: "#475569", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            Cert required
          </span>
        )}
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {needsPass ? (
          <Link
            href="/dashboard/pass"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[13.5px] font-bold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #B45309 0%, #D97706 100%)", color: "#fff" }}
          >
            <Lock size={13} /> Get GTMS Pass
          </Link>
        ) : (
          <Link
            href={`/tasks/${task.id}`}
            className="flex-1 inline-flex items-center justify-center py-2.5 rounded-2xl text-[13.5px] font-bold transition-opacity hover:opacity-90"
            style={
              access.allowed
                ? { background: "#0F172A", color: "#fff" }
                : { background: "rgba(0,0,0,0.08)", color: "#94A3B8", cursor: "not-allowed", pointerEvents: "none" }
            }
          >
            {access.allowed ? "Start Task" : "Locked"}
          </Link>
        )}
        <button
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/60"
          style={{ background: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(0,0,0,0.07)" }}
          aria-label="Save task"
        >
          <Bookmark size={15} style={{ color: "#64748B" }} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BrowseTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tier?: string; page?: string }>;
}) {
  const user   = await requireWorker();
  const params = await searchParams;

  const category  = params.category as TaskCategory | undefined;
  const tier      = params.tier     as MembershipTier | undefined;
  const page      = parseInt(params.page ?? "1");

  const [{ tasks, total }, worker] = await Promise.all([
    browseTasks({ category, tier, page }),
    db.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        status: true,
        kycStatus: true,
        careerLevel: true,
        accuracyScore: true,
        gtmsPassActive: true,
        membership: { select: { tier: true, status: true } },
        certifications: {
          where: { status: "PASSED" },
          include: { certification: { select: { slug: true } } },
        },
      },
    }),
  ]);

  const workerProfile = worker!;
  const effectiveTier =
    workerProfile.membership?.status === "ACTIVE"
      ? workerProfile.membership.tier
      : ("BASIC" as const);

  const isDormant = workerProfile.status === "DORMANT";

  return (
    <div>
      {/* Dormancy warning banner */}
      {isDormant && (
        <div
          className="mb-6 flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
        >
          <Lock size={18} style={{ color: "#DC2626", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold" style={{ color: "#991B1B" }}>
              Account Dormant — Task access suspended
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "#DC2626" }}>
              Your wallet balance reached $0. Deposit funds to reactivate your account and resume working.
            </p>
          </div>
          <Link
            href="/dashboard/wallet"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold"
            style={{ background: "#DC2626", color: "#fff" }}
          >
            Deposit Now
          </Link>
        </div>
      )}

      <div className="flex gap-7 items-start">
        {/* ── Filter sidebar ─────────────────────────── */}
        <Suspense
          fallback={
            <aside className="w-64 flex-shrink-0 space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </aside>
          }
        >
          <FilterSidebar />
        </Suspense>

        {/* ── Main content ───────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[20px] font-extrabold" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
                Available Tasks
              </h1>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold text-white"
                style={{ background: "#0F172A" }}
              >
                {total}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: "#94A3B8" }}>
              <Clock size={13} />
              <span>Updated just now</span>
            </div>
          </div>

          {/* grid */}
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100">
              <EmptyState
                title="No tasks available"
                description="Try adjusting your filters or check back later."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* slot 0 */}
              {tasks[0] && (
                <TaskCard
                  task={tasks[0]}
                  access={canAccessTask({ ...workerProfile, membershipTier: effectiveTier }, tasks[0])}
                />
              )}

              {/* promo card at position 1 — VIP if no pass yet, otherwise standard */}
              {workerProfile.gtmsPassActive ? <PromoCard /> : <VipPromoCard />}

              {/* slot 1 onwards */}
              {tasks.slice(1).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  access={canAccessTask({ ...workerProfile, membershipTier: effectiveTier }, task)}
                />
              ))}
            </div>
          )}

          {/* pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/browse?${category ? `category=${category}&` : ""}${tier ? `tier=${tier}&` : ""}page=${page - 1}`}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors hover:bg-slate-100"
                  style={{ border: "1px solid #E2E8F0", color: "#475569" }}
                >
                  ← Previous
                </Link>
              )}
              <span className="px-4 py-2 text-[13px] font-medium" style={{ color: "#94A3B8" }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              {page * 20 < total && (
                <Link
                  href={`/browse?${category ? `category=${category}&` : ""}${tier ? `tier=${tier}&` : ""}page=${page + 1}`}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors hover:bg-slate-100"
                  style={{ border: "1px solid #E2E8F0", color: "#475569" }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
