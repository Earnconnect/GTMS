import Link from "next/link";
import { AnimateIn } from "@/components/ui/AnimateIn";
import {
  Search, Package, ShieldCheck, Cpu,
  UserCheck, BarChart2, Trophy, GraduationCap,
  ShieldAlert, Scale, Smartphone, Bell, Users,
  ArrowRight, ChevronDown, CheckCircle2, Star,
} from "lucide-react";

// Font is loaded via <link> in layout.tsx — Turbopack-safe
const jakartaStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

// ── Brand palette ─────────────────────────────────────────────────────────────
const sky     = "#0EA5E9";
const skyDark = "#0284C7";
const ink     = "#0F172A";
const slate5  = "#475569";
const slate4  = "#94A3B8";
const lightBg = "#F7F9FC";
const border  = "#E8EEF6";

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Check() {
  return (
    <CheckCircle2
      size={15}
      strokeWidth={2.5}
      className="flex-shrink-0 mt-[2px]"
      style={{ color: sky }}
    />
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
      >
        <svg viewBox="0 0 20 20" className="w-[18px] h-[18px]" fill="white">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm5.99 7.176A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      </div>
      <span
        className="font-bold text-[15px] tracking-tight"
        style={{ color: light ? "#fff" : ink }}
      >
        GTMS Network
      </span>
    </div>
  );
}

function SectionWrap({
  id,
  bg,
  children,
}: {
  id?: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-24" style={{ background: bg ?? "#fff" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">{children}</div>
    </section>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase mb-4"
      style={{ background: "rgba(14,165,233,0.08)", color: skyDark }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[32px] sm:text-[42px] font-extrabold leading-[1.08] mb-4"
      style={{ color: ink, letterSpacing: "-0.025em" }}
    >
      {children}
    </h2>
  );
}

function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(130deg, #0EA5E9 0%, #6366F1 60%, #8B5CF6 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gradPan 5s ease infinite",
      }}
    >
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ ...jakartaStyle, color: slate5 }}>

      {/* ════════════════════════ NAV ════════════════════════ */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-[60px] flex items-center"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-0.5 text-[13px] font-medium" style={{ color: slate5 }}>
            {(["How it works", "Categories", "Pricing", "FAQ"] as const).map((l, i) => {
              const hrefs = ["#how", "#categories", "#pricing", "#faq"];
              return (
                <a
                  key={l}
                  href={hrefs[i]}
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  style={{ color: slate5 }}
                >
                  {l}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-[13px] font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              style={{ color: ink }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
            >
              Get started <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-[60px]"
        style={{ background: "#fff" }}
      >
        {/* subtle ambient glow — not a blob, just a soft wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 65% -5%, rgba(14,165,233,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 45% at 5% 90%, rgba(99,102,241,0.05) 0%, transparent 65%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-24 text-center">

          {/* badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-8"
            style={{
              background: "rgba(14,165,233,0.07)",
              border: "1px solid rgba(14,165,233,0.18)",
              color: skyDark,
              animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: sky }}
            />
            12,400+ workers earning globally — join them today
          </div>

          {/* headline */}
          <h1
            className="font-extrabold leading-[1.05] mb-6"
            style={{
              color: ink,
              fontSize: "clamp(40px, 7vw, 72px)",
              letterSpacing: "-0.03em",
              animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.15s both",
            }}
          >
            Earn More. Work Smarter.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(130deg, #0EA5E9 0%, #6366F1 55%, #8B5CF6 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradPan 5s ease infinite",
              }}
            >
              Get Paid Faster.
            </span>
          </h1>

          {/* subheading */}
          <p
            className="text-[17px] leading-[1.75] max-w-[520px] mx-auto mb-10"
            style={{
              color: slate5,
              animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.28s both",
            }}
          >
            GTMS connects skilled remote workers with businesses needing data
            verification, fraud detection, and AI training — done right, paid fast.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
            style={{ animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.4s both" }}
          >
            <Link
              href="/register?role=WORKER"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[14.5px] font-bold text-white rounded-2xl shadow-lg hover:shadow-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
            >
              Start earning today <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/register?role=BUSINESS"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-[14.5px] font-bold rounded-2xl border hover:bg-slate-50 hover:scale-[1.01] transition-all duration-200"
              style={{ borderColor: border, color: ink }}
            >
              Post tasks for my business
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-stretch justify-center"
            style={{ animation: "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.52s both" }}
          >
            {[
              { n: "$2.8M+",  l: "Total paid out"       },
              { n: "1.2M+",   l: "Tasks completed"      },
              { n: "12,400+", l: "Active workers"       },
              { n: "4.9 ★",   l: "Worker satisfaction"  },
            ].map((s, i) => (
              <div
                key={s.l}
                className="px-6 sm:px-9 py-4 text-center"
                style={{
                  borderLeft: i !== 0 ? `1px solid ${border}` : undefined,
                }}
              >
                <p
                  className="text-[28px] sm:text-[32px] font-extrabold leading-none mb-1"
                  style={{ color: ink, letterSpacing: "-0.025em" }}
                >
                  {s.n}
                </p>
                <p className="text-[12.5px] font-medium" style={{ color: slate4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ TRUST BAR ════════════════════════ */}
      <div style={{ background: lightBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: slate4 }}>
            Used by teams at
          </span>
          {["E-commerce Platforms", "Fintech Companies", "AI Research Labs", "Retail Brands", "Logistics Networks"].map(n => (
            <span key={n} className="text-[13px] font-bold" style={{ color: "#CBD5E1" }}>{n}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <SectionWrap id="how" bg={lightBg}>
        <AnimateIn className="text-center mb-14">
          <SectionTag>Simple Process</SectionTag>
          <SectionHeading>Up and running in minutes</SectionHeading>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: slate5 }}>
            No experience needed for entry-level tasks. Start free, upgrade as you grow.
          </p>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimateIn delay={0}>
            <div className="bg-white rounded-3xl p-7 h-full" style={{ border: `1px solid ${border}` }}>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold mb-6"
                style={{ background: "rgba(14,165,233,0.07)", color: skyDark }}
              >
                <Users size={12} /> For Workers
              </div>
              <div className="space-y-5">
                {[
                  { t: "Create your account",   d: "Register, complete KYC verification, and set up your worker profile in minutes." },
                  { t: "Browse available tasks", d: "Find tasks matched to your skill level — from basic data entry to advanced fraud detection." },
                  { t: "Complete & submit work", d: "Guided form with field validation, live instructions, and one-click submission." },
                  { t: "Get reviewed & paid",    d: "Our 5-stage QA pipeline approves work and credits your wallet instantly." },
                ].map((s, i) => (
                  <div key={s.t} className="flex gap-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11.5px] font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold mb-0.5" style={{ color: ink }}>{s.t}</p>
                      <p className="text-[13px] leading-relaxed" style={{ color: slate5 }}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <div className="bg-white rounded-3xl p-7 h-full" style={{ border: `1px solid ${border}` }}>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold mb-6"
                style={{ background: "rgba(99,102,241,0.08)", color: "#4F46E5" }}
              >
                <Package size={12} /> For Businesses
              </div>
              <div className="space-y-5">
                {[
                  { t: "Post your task",         d: "Define requirements, field schema, worker eligibility, and pay-per-unit in minutes." },
                  { t: "Workers get assigned",   d: "Eligible workers reserve units and complete work within your defined time window." },
                  { t: "Review submissions",     d: "Approve or reject with full data visibility from your business dashboard." },
                  { t: "Scale with confidence",  d: "5-stage QA pipeline including peer review and AI audit ensures consistent quality." },
                ].map((s, i) => (
                  <div key={s.t} className="flex gap-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11.5px] font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold mb-0.5" style={{ color: ink }}>{s.t}</p>
                      <p className="text-[13px] leading-relaxed" style={{ color: slate5 }}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </SectionWrap>

      {/* ════════════════════════ CATEGORIES ════════════════════════ */}
      <SectionWrap id="categories" bg="#fff">
        <AnimateIn className="text-center mb-14">
          <SectionTag>Task Library</SectionTag>
          <SectionHeading>Real work. Real pay.</SectionHeading>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: slate5 }}>
            16 professionally curated task types across 4 categories. New tasks added weekly.
          </p>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              Icon: Search,     accent: "#3B82F6", bg: "#EFF6FF",
              tag: "Product Intelligence",
              earn: "$0.95 – $2.00 / unit",
              tasks: ["Amazon Listing Verification", "Review Authenticity Check", "Competitor Price Monitoring", "Brand Compliance Audit"],
              desc: "Verify product listings, detect fake reviews, and audit brand guidelines across marketplaces.",
            },
            {
              Icon: Package,    accent: "#EF4444", bg: "#FEF2F2",
              tag: "Order Operations",
              earn: "$0.75 – $2.25 / unit",
              tasks: ["Shipping Address Validation", "Order Data Entry Verification", "Returns Fraud Detection", "Inventory Investigation"],
              desc: "Validate shipping data, detect fraudulent returns, and investigate stock discrepancies at scale.",
            },
            {
              Icon: ShieldCheck, accent: "#10B981", bg: "#ECFDF5",
              tag: "Transaction Verification",
              earn: "$0.65 – $3.50 / unit",
              tasks: ["Credit Card Fraud Screening", "Bank Statement Categorization", "Invoice Verification", "Crypto AML Compliance"],
              desc: "Screen financial transactions for fraud, categorize expenses, and ensure regulatory compliance.",
            },
            {
              Icon: Cpu,        accent: "#8B5CF6", bg: "#F5F3FF",
              tag: "AI & Data Intelligence",
              earn: "$0.55 – $1.60 / unit",
              tasks: ["Image Alt-Text Generation", "Customer Sentiment Analysis", "AI Training Data QA", "SEO Description Writing"],
              desc: "Label data, classify sentiment, and review AI training sets for machine learning pipelines.",
            },
          ].map((cat, i) => (
            <AnimateIn key={cat.tag} delay={i * 55}>
              <div
                className="bg-white rounded-3xl p-6 h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
                style={{ border: `1px solid ${border}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.bg }}
                  >
                    <cat.Icon size={20} style={{ color: cat.accent }} />
                  </div>
                  <span
                    className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cat.bg, color: cat.accent }}
                  >
                    {cat.earn}
                  </span>
                </div>
                <h3 className="text-[15.5px] font-bold mb-1.5" style={{ color: ink }}>{cat.tag}</h3>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: slate5 }}>{cat.desc}</p>
                <ul className="space-y-1.5">
                  {cat.tasks.map(t => (
                    <li key={t} className="flex items-center gap-2 text-[13px]" style={{ color: slate5 }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.accent }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrap>

      {/* ════════════════════════ FOR WORKERS ════════════════════════ */}
      <SectionWrap id="workers" bg={lightBg}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <AnimateIn>
            <SectionTag>For Workers</SectionTag>
            <SectionHeading>
              Your skills have{" "}
              <GradText>real market value</GradText>
            </SectionHeading>
            <p className="text-[15px] leading-[1.75] mb-8" style={{ color: slate5 }}>
              Thousands of remote workers earn consistent income completing data verification,
              review, and AI training tasks. No commute, no fixed hours — just results.
            </p>
            <ul className="space-y-3 mb-9">
              {[
                "Work from anywhere — laptop or smartphone",
                "5-tier career progression with increasing pay",
                "Certifications unlock higher-paying task categories",
                "Weekly, bi-weekly, or same-day payout options",
                "Live accuracy score and performance dashboard",
                "Earn $5 referral bonus for every worker you invite",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[14px]" style={{ color: slate5 }}>
                  <Check /> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=WORKER"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold text-white rounded-2xl shadow-md hover:shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
            >
              Join as a worker <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </AnimateIn>

          {/* Career progression card */}
          <AnimateIn delay={100}>
            <div
              className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
              style={{ border: `1px solid ${border}` }}
            >
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: slate4 }}>
                  Career Progression
                </p>
                <p className="text-[13px]" style={{ color: slate5 }}>Complete more tasks to unlock higher rewards</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { l: "Digital Associate",       tasks: "Start here",               earn: "≤ $2.00",  pct: 20,  c: "#94A3B8" },
                  { l: "Certified Reviewer",      tasks: "50+ tasks · 70% accuracy", earn: "≤ $5.00",  pct: 40,  c: sky      },
                  { l: "Senior Verifier",         tasks: "200+ · 80% accuracy",      earn: "≤ $10.00", pct: 60,  c: "#6366F1"},
                  { l: "Verification Specialist", tasks: "500+ · 88% accuracy",      earn: "≤ $15.00", pct: 80,  c: "#8B5CF6"},
                  { l: "Team Supervisor",         tasks: "1,000+ · 92% accuracy",    earn: "≤ $20.00", pct: 100, c: "#F59E0B"},
                ].map((lv, i) => (
                  <div
                    key={lv.l}
                    className="rounded-2xl px-3.5 py-3 flex items-center gap-3"
                    style={{ background: lightBg }}
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: lv.c }}
                    >
                      L{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[12.5px] font-semibold truncate mr-2" style={{ color: ink }}>{lv.l}</p>
                        <p className="text-[12px] font-bold flex-shrink-0" style={{ color: "#059669" }}>{lv.earn}/task</p>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: border }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${lv.pct}%`, background: lv.c }}
                        />
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: slate4 }}>{lv.tasks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>
      </SectionWrap>

      {/* ════════════════════════ FOR BUSINESS ════════════════════════ */}
      <SectionWrap id="business" bg="#fff">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* QA pipeline card */}
          <AnimateIn delay={80} className="order-2 lg:order-1">
            <div
              className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
              style={{ border: `1px solid ${border}` }}
            >
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${border}` }}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: slate4 }}>
                  5-Stage QA Pipeline
                </p>
                <p className="text-[13px]" style={{ color: slate5 }}>Every submission verified before you pay</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { n: "Worker Submission",   d: "Field validation + guided work interface",   c: sky,       bg: "rgba(14,165,233,0.06)"  },
                  { n: "Peer Review",         d: "Certified reviewer verifies output",         c: "#6366F1", bg: "rgba(99,102,241,0.06)"  },
                  { n: "Senior Verification", d: "Expert cross-checks complex edge cases",     c: "#8B5CF6", bg: "rgba(139,92,246,0.06)"  },
                  { n: "AI Audit",            d: "Automated format & outlier detection",       c: "#F59E0B", bg: "rgba(245,158,11,0.06)"  },
                  { n: "Final Approval",      d: "Confirmed — payment credited to worker",     c: "#10B981", bg: "rgba(16,185,129,0.06)"  },
                ].map((s, i) => (
                  <div
                    key={s.n}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-2xl"
                    style={{ background: s.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: s.c }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: ink }}>{s.n}</p>
                      <p className="text-[12px]" style={{ color: slate5 }}>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Copy */}
          <AnimateIn className="order-1 lg:order-2">
            <SectionTag>For Businesses</SectionTag>
            <SectionHeading>
              Scale your data{" "}
              <span
                style={{
                  background: "linear-gradient(130deg, #6366F1, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                operations faster
              </span>
            </SectionHeading>
            <p className="text-[15px] leading-[1.75] mb-8" style={{ color: slate5 }}>
              Post tasks in minutes. Access a pre-vetted, skilled workforce on demand.
              Set your quality bar and GTMS handles assignment, QA, and payments.
            </p>
            <ul className="space-y-3 mb-9">
              {[
                "Task field schema builder — no engineering needed",
                "Workers auto-matched by tier, certs, and accuracy",
                "Real-time submission monitoring and approval",
                "Transparent per-unit pricing, no surprise fees",
                "Dedicated dispute resolution for edge cases",
                "Full audit trail and fraud protection included",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-[14px]" style={{ color: slate5 }}>
                  <Check /> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=BUSINESS"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold text-white rounded-2xl shadow-md hover:shadow-lg hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Start posting tasks <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </AnimateIn>
        </div>
      </SectionWrap>

      {/* ════════════════════════ PRICING ════════════════════════ */}
      <SectionWrap id="pricing" bg={lightBg}>
        <AnimateIn className="text-center mb-14">
          <SectionTag>Worker Plans</SectionTag>
          <SectionHeading>Simple, transparent pricing</SectionHeading>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: slate5 }}>
            Start free. Upgrade as you grow. Your plan determines which tasks you can access.
          </p>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {[
            {
              name: "Basic",        price: "$29",  featured: false,
              tagline: "Perfect for getting started",
              features: ["20 tasks per day", "Up to $2.00 per task", "Weekly payouts", "Entry-level tasks", "Accuracy dashboard", "Community support"],
              href: "/register?role=WORKER",
            },
            {
              name: "Professional", price: "$79",  featured: true,
              tagline: "For serious earners",
              features: ["100 tasks per day", "Up to $10.00 per task", "Bi-weekly payouts", "All task categories", "QA pipeline tasks", "Priority support"],
              href: "/register?role=WORKER&plan=pro",
            },
            {
              name: "Executive",    price: "$199", featured: false,
              tagline: "Maximum earning potential",
              features: ["500 tasks per day", "Up to $20.00 per task", "Next-day payouts", "Executive-tier tasks", "Crypto AML & advanced", "Dedicated manager"],
              href: "/register?role=WORKER&plan=exec",
            },
          ].map((plan, i) => (
            <AnimateIn key={plan.name} delay={i * 65}>
              <div
                className={`relative flex flex-col rounded-3xl h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 ${plan.featured ? "shadow-[0_8px_48px_rgba(14,165,233,0.15)]" : "shadow-[0_2px_16px_rgba(0,0,0,0.05)]"}`}
                style={{
                  background: "#fff",
                  border: plan.featured ? "1.5px solid rgba(14,165,233,0.35)" : `1.5px solid ${border}`,
                }}
              >
                {plan.featured && (
                  <div
                    className="h-[3px] w-full"
                    style={{ background: "linear-gradient(90deg, #0EA5E9, #6366F1)" }}
                  />
                )}
                {plan.featured && (
                  <div className="absolute top-[3px] left-1/2 -translate-x-1/2">
                    <span
                      className="inline-flex items-center px-3.5 py-1 text-[10.5px] font-bold text-white rounded-b-xl"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-6 pt-2">
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2"
                      style={{ color: plan.featured ? skyDark : slate4 }}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-end gap-1">
                      <span
                        className="text-[46px] font-extrabold leading-none"
                        style={{ color: ink, letterSpacing: "-0.03em" }}
                      >
                        {plan.price}
                      </span>
                      <span className="text-[13px] mb-1.5" style={{ color: slate4 }}>/mo</span>
                    </div>
                    <p className="text-[13px] mt-1.5" style={{ color: slate5 }}>{plan.tagline}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13.5px]" style={{ color: slate5 }}>
                        <Check /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[13.5px] font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.01] ${plan.featured ? "text-white shadow-md" : ""}`}
                    style={
                      plan.featured
                        ? { background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }
                        : { background: lightBg, color: ink, border: `1.5px solid ${border}` }
                    }
                  >
                    Get {plan.name}
                    {plan.featured && <ArrowRight size={14} strokeWidth={2.5} />}
                  </Link>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
        <p className="text-center text-[12px] mt-5" style={{ color: slate4 }}>
          Membership is activated by our team within 24 hours of payment.
        </p>
      </SectionWrap>

      {/* ════════════════════════ FEATURES ════════════════════════ */}
      <SectionWrap bg="#fff">
        <AnimateIn className="text-center mb-14">
          <SectionTag>Platform Features</SectionTag>
          <SectionHeading>Everything you need, built in</SectionHeading>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { Icon: UserCheck,     t: "Identity Verification (KYC)", d: "Secure document-based verification ensures every worker and business is legitimate." },
            { Icon: BarChart2,     t: "Real-Time Score Tracking",    d: "Accuracy, speed, and consistency scores update after every completed task." },
            { Icon: Trophy,        t: "Weekly Leaderboards",         d: "Compete with top performers and earn recognition for consistent output." },
            { Icon: GraduationCap, t: "Certification System",        d: "Earn certs in Product Review, Commerce Ops, Verification, and AI Evaluation." },
            { Icon: ShieldAlert,   t: "Fraud Detection Engine",      d: "Velocity checks, device fingerprinting, and duplicate detection protect all parties." },
            { Icon: Scale,         t: "Fast Dispute Resolution",     d: "Transparent workflow with admin mediation and fair resolution for both sides." },
            { Icon: Smartphone,    t: "Mobile-First Platform",       d: "Full-featured mobile experience — work and manage your account anywhere." },
            { Icon: Bell,          t: "Smart Notifications",         d: "Get notified about task approvals, payouts, level-ups, and more." },
            { Icon: Users,         t: "Referral Program",            d: "Earn $5 for every worker you refer who completes their first approved task." },
          ].map((f, i) => (
            <AnimateIn key={f.t} delay={i * 35}>
              <div
                className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
                style={{ border: `1px solid ${border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5"
                  style={{ background: "rgba(14,165,233,0.08)" }}
                >
                  <f.Icon size={18} style={{ color: sky }} />
                </div>
                <h3 className="text-[14px] font-semibold mb-1.5" style={{ color: ink }}>{f.t}</h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: slate5 }}>{f.d}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrap>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <SectionWrap bg={lightBg}>
        <AnimateIn className="text-center mb-14">
          <SectionTag>Success Stories</SectionTag>
          <SectionHeading>Real workers, real earnings</SectionHeading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: "Sarah K.",   role: "Senior Verifier",         loc: "Lagos, Nigeria",      earn: "$1,240 / mo", q: "I went from Digital Associate to Senior Verifier in 3 months. The certification system genuinely unlocks better-paying work. GTMS pays on time, every time." },
            { name: "Michael T.", role: "Certified Reviewer",      loc: "Manila, Philippines", earn: "$840 / mo",   q: "The task instructions are clear and the QA feedback helps you improve. I've never had a dispute that wasn't resolved fairly within 48 hours." },
            { name: "Amara O.",   role: "Verification Specialist", loc: "Nairobi, Kenya",      earn: "$1,650 / mo", q: "The accuracy dashboard showed me exactly where I was losing points. Fixed my approach and my earnings jumped 40% in six weeks." },
          ].map((t, i) => (
            <AnimateIn key={t.name} delay={i * 65}>
              <div
                className="bg-white rounded-3xl p-6 flex flex-col h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
                style={{ border: `1px solid ${border}` }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill="#FBBF24" stroke="none" />
                  ))}
                </div>
                <p className="text-[13.5px] leading-[1.7] flex-1 mb-5" style={{ color: slate5 }}>
                  &ldquo;{t.q}&rdquo;
                </p>
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: `1px solid ${border}` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #6366F1)" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold leading-none mb-0.5" style={{ color: ink }}>{t.name}</p>
                      <p className="text-[11.5px]" style={{ color: slate4 }}>{t.role} · {t.loc}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: "#059669" }}>{t.earn}</span>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrap>

      {/* ════════════════════════ FAQ ════════════════════════ */}
      <SectionWrap id="faq" bg="#fff">
        <AnimateIn className="text-center mb-12">
          <SectionTag>FAQ</SectionTag>
          <SectionHeading>Common questions</SectionHeading>
        </AnimateIn>
        <div className="max-w-2xl mx-auto space-y-2">
          {[
            { q: "How do I get paid?", a: "Earnings credit your in-platform wallet upon task approval. Request a payout to your bank or mobile money once you hit the $5 minimum. Payout speed depends on your tier — Basic (weekly) up to Executive (next-day)." },
            { q: "How long does review take?", a: "Most submissions are reviewed within 48 hours. QA-enabled tasks go through a 5-stage pipeline: worker submission → peer review → senior verification → AI audit → final approval. You're notified at every stage." },
            { q: "What if my submission is rejected?", a: "You'll receive specific feedback explaining why. Rejections impact your accuracy score, so review carefully. You can open a dispute if you believe the rejection was unfair — admin mediates within 24–48 hours." },
            { q: "Do I need special equipment?", a: "No. A reliable internet connection and any modern device is all you need. The platform is fully mobile-optimized. Some advanced data-entry tasks work best on a desktop." },
            { q: "How do certifications work?", a: "Pass timed multiple-choice exams to earn certifications. Each cert unlocks higher-paying tasks in that category and boosts your profile ranking." },
            { q: "Can businesses post any type of task?", a: "Tasks must fall within our four supported categories. All tasks are reviewed by our team before going live to ensure they are appropriate, feasible, and correctly priced." },
          ].map(faq => (
            <details
              key={faq.q}
              className="group rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${border}` }}
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none list-none bg-white hover:bg-slate-50 transition-colors">
                <span className="text-[14.5px] font-semibold" style={{ color: ink }}>{faq.q}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className="flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: slate4 }}
                />
              </summary>
              <div className="px-5 pb-5 pt-1 bg-white">
                <p className="text-[13.5px] leading-[1.75]" style={{ color: slate5 }}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </SectionWrap>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 55%, #8B5CF6 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <AnimateIn className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-7"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Free to join · No credit card required
          </div>
          <h2
            className="font-extrabold text-white mb-5"
            style={{
              fontSize: "clamp(32px, 6vw, 52px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Start earning today
          </h2>
          <p
            className="text-[16px] leading-[1.7] mb-10 max-w-lg mx-auto"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Join 12,400+ workers already earning on GTMS. Create your account in minutes
            and complete your first task today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register?role=WORKER"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 text-[14.5px] font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "#fff", color: ink }}
            >
              Create free worker account <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/register?role=BUSINESS"
              className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 text-[14.5px] font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
              }}
            >
              I&apos;m a business →
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer style={{ background: "#09111F" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Logo light />
              <p
                className="text-[13px] leading-relaxed mt-3.5 max-w-[200px]"
                style={{ color: "#475569" }}
              >
                The professional digital workforce network for remote verification work worldwide.
              </p>
            </div>
            {[
              { h: "Workers",  l: ["Browse Tasks", "Career Levels", "Certifications", "Leaderboard", "Referral Program"] },
              { h: "Business", l: ["Post a Task", "QA Pipeline", "Task Categories", "Reports", "API Access"] },
              { h: "Company",  l: ["About Us", "Privacy Policy", "Terms of Service", "Contact", "Status"] },
            ].map(col => (
              <div key={col.h}>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4"
                  style={{ color: "#475569" }}
                >
                  {col.h}
                </p>
                <ul className="space-y-2.5">
                  {col.l.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] transition-colors hover:text-white"
                        style={{ color: "#475569" }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[12px]" style={{ color: "#334155" }}>
              © 2026 GTMS Network. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-[12px]" style={{ color: "#334155" }}>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
