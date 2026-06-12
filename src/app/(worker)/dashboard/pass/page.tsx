import { requireWorker } from "@/server/rbac";
import { getGtmsPassStatus } from "@/server/services/gtmspass.service";
import { formatMoney } from "@/lib/money";
import { GTMS_PASS_CENTS, FIRST_USER_DISCOUNT_PCT } from "@/lib/constants";
import { PurchaseButton } from "./PurchaseButton";
import Link from "next/link";
import {
  Gem, Crown, CheckCircle2, ArrowRight, Zap, ShieldCheck,
  TrendingUp, Tag, BarChart2, Gift,
} from "lucide-react";

const PERKS = [
  {
    Icon: TrendingUp,
    color: "#16A34A",
    bg:    "#F0FDF4",
    title: "400% Earnings Multiplier",
    body:  "Combination tasks pay 4× the standard reward. Where a regular task pays $1, a Combination task pays $4 — for the same type of work.",
  },
  {
    Icon: Gem,
    color: "#7C3AED",
    bg:    "#F5F3FF",
    title: "Exclusive VIP Task Pool",
    body:  "Combination tasks are a closed category, invisible to workers without the pass. Less competition means more available units for you.",
  },
  {
    Icon: ShieldCheck,
    color: "#0284C7",
    bg:    "#F0F9FF",
    title: "Priority Review Queue",
    body:  "VIP submissions are reviewed ahead of the standard queue, meaning faster approval and faster payouts on every task.",
  },
  {
    Icon: Zap,
    color: "#B45309",
    bg:    "#FFFBEB",
    title: "One-Time Unlock, Yours Forever",
    body:  "Pay once and keep access indefinitely. No monthly fees, no renewals. The pass is deducted directly from your earned wallet balance.",
  },
];

// Illustrative earnings comparison
const EARNINGS_ROWS = [
  { label: "5 tasks / day",   standard: 5,   vip: 20  },
  { label: "20 tasks / day",  standard: 20,  vip: 80  },
  { label: "50 tasks / day",  standard: 50,  vip: 200 },
  { label: "100 tasks / day", standard: 100, vip: 400 },
];

export default async function GtmsPassPage() {
  const user   = await requireWorker();
  const status = await getGtmsPassStatus(user.id);

  const hasDiscount = status.discountPct > 0;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Header ────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4"
          style={{ background: "linear-gradient(135deg, #B45309 0%, #D97706 100%)" }}
        >
          <Crown size={30} className="text-white" />
        </div>

        {hasDiscount && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide mb-3"
            style={{ background: "#FEF08A", color: "#713F12" }}
          >
            <Tag size={12} /> Exclusive {FIRST_USER_DISCOUNT_PCT}% First-User Offer
          </div>
        )}

        <h1
          className="text-[30px] font-extrabold mb-2"
          style={{ color: "#0F172A", letterSpacing: "-0.03em" }}
        >
          GTMS VIP Pass
        </h1>
        <p className="text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: "#64748B" }}>
          Unlock Combination tasks — a premium task category that pays <strong style={{ color: "#0F172A" }}>4× the standard rate</strong>. One purchase, permanent access.
        </p>
      </div>

      {/* ── ACTIVE STATE ──────────────────────────────── */}
      {status.active ? (
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%)", border: "2px solid #F59E0B" }}
        >
          <CheckCircle2 size={44} className="mx-auto mb-3" style={{ color: "#B45309" }} />
          <h2 className="text-[22px] font-extrabold mb-1" style={{ color: "#78350F" }}>
            Your GTMS Pass is Active
          </h2>
          <p className="text-[13.5px] mb-1" style={{ color: "#92400E" }}>
            Purchased on{" "}
            {status.purchasedAt
              ? new Date(status.purchasedAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })
              : "—"}
          </p>
          <p className="text-[13px] mb-6" style={{ color: "#B45309" }}>
            You have full access to all Combination VIP tasks.
          </p>
          <Link
            href="/browse?category=COMBINATION"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[14px] font-bold"
            style={{ background: "#B45309", color: "#fff" }}
          >
            Browse Combination Tasks <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* ── Intro story (first-time milestone users) ─ */}
          {status.firstMilestoneClaimed && (
            <div
              className="rounded-2xl p-5 mb-7 flex gap-4"
              style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
            >
              <Gift size={22} className="flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }} />
              <div>
                <p className="text-[14px] font-bold mb-1" style={{ color: "#166534" }}>
                  You've completed your first 10 tasks — here's your reward
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#15803D" }}>
                  As a thank-you for proving yourself on the platform, you've unlocked an exclusive{" "}
                  <strong>{FIRST_USER_DISCOUNT_PCT}% discount</strong> on the GTMS Pass. This offer is
                  one-time and tied to your account. It disappears once used.
                </p>
              </div>
            </div>
          )}

          {/* ── What is a Combination task? ───────────── */}
          <div className="mb-7">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.12em] mb-3"
              style={{ color: "#94A3B8" }}
            >
              What are Combination Tasks?
            </p>
            <div
              className="rounded-2xl p-5"
              style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
            >
              <p className="text-[14px] leading-relaxed" style={{ color: "#334155" }}>
                Combination tasks are a specialized set of multi-step micro-tasks that combine
                data verification, product analysis, and decision logic in a single submission.
                Because they require more thought than standard tasks, they pay substantially more —
                precisely <strong style={{ color: "#0F172A" }}>4× the standard unit reward</strong>.
              </p>
              <p className="text-[13.5px] leading-relaxed mt-3" style={{ color: "#475569" }}>
                Workers with a GTMS Pass and an accuracy score above 80% get exclusive access to
                this pool. Fewer workers in the pool means more units available to you, and a faster
                path to your daily earning targets.
              </p>
            </div>
          </div>

          {/* ── Earnings comparison table ─────────────── */}
          <div className="mb-7">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.12em] mb-3"
              style={{ color: "#94A3B8" }}
            >
              Daily earnings comparison (at $1.00 base / task)
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1.5px solid #E2E8F0" }}
            >
              <div
                className="grid grid-cols-3 px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-wide"
                style={{ background: "#F8FAFC", color: "#94A3B8", borderBottom: "1px solid #E2E8F0" }}
              >
                <span>Volume</span>
                <span className="text-center">Standard</span>
                <span className="text-center" style={{ color: "#B45309" }}>VIP (4×)</span>
              </div>
              {EARNINGS_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className="grid grid-cols-3 px-4 py-3 text-[13.5px]"
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    borderBottom: i < EARNINGS_ROWS.length - 1 ? "1px solid #F1F5F9" : "none",
                  }}
                >
                  <span className="font-medium" style={{ color: "#475569" }}>{row.label}</span>
                  <span className="text-center font-semibold" style={{ color: "#64748B" }}>
                    ${row.standard}.00
                  </span>
                  <span
                    className="text-center font-extrabold"
                    style={{ color: "#B45309" }}
                  >
                    ${row.vip}.00
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] mt-2 text-right" style={{ color: "#94A3B8" }}>
              * Illustrative. Actual rewards vary by task.
            </p>
          </div>

          {/* ── Perks grid ────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
            {PERKS.map(({ Icon, color, bg, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-5"
                style={{ background: bg, border: `1.5px solid ${color}22` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: color }}
                >
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-[13.5px] font-bold mb-1" style={{ color: "#0F172A" }}>{title}</p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "#64748B" }}>{body}</p>
              </div>
            ))}
          </div>

          {/* ── Requirements ──────────────────────────── */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] mb-3" style={{ color: "#94A3B8" }}>
              Requirements
            </p>
            <ul className="space-y-2">
              {[
                "80%+ accuracy score on your worker profile",
                `Balance of ${formatMoney(status.priceCents)} or more (deducted on purchase)`,
                "Account in good standing — not dormant or suspended",
              ].map(req => (
                <li key={req} className="flex items-start gap-2 text-[13px]" style={{ color: "#475569" }}>
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }} />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Wallet balance ────────────────────────── */}
          <div
            className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
            style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={15} style={{ color: "#15803D" }} />
              <span className="text-[13.5px] font-semibold" style={{ color: "#15803D" }}>
                Your wallet balance
              </span>
            </div>
            <span className="text-[17px] font-extrabold" style={{ color: "#15803D" }}>
              {formatMoney(status.walletBalance)}
            </span>
          </div>

          {/* ── CTA ───────────────────────────────────── */}
          <PurchaseButton
            canAfford={status.canAfford}
            priceCents={status.priceCents}
            originalPriceCents={status.originalPriceCents}
            discountPct={status.discountPct}
            savingsCents={status.savingsCents}
          />

          <p className="text-[12px] text-center mt-4" style={{ color: "#94A3B8" }}>
            One-time charge · Non-refundable · Permanent access · No subscription
          </p>
        </>
      )}
    </div>
  );
}
