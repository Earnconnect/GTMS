import type { Metadata } from "next";
import Image from "next/image";
import {
  ShieldCheck,
  BadgeCheck,
  Banknote,
  UserPlus,
  ArrowDownToLine,
  ArrowRight,
  GraduationCap,
  Video,
  Briefcase,
  TrendingUp,
  Building2,
  Sparkles,
  ClipboardList,
  Wallet,
  Lock,
  FileCheck2,
  ScrollText,
  Users,
  CheckCircle2,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "GTMS — Recruiting, Onboarding & Payroll in one platform",
  description:
    "GTMS is an enterprise workforce platform that unifies recruiting, onboarding, training, assignments, and payroll — carrying every employee securely from application to paycheck.",
};

/* A polished product-preview mockup for the hero (self-contained). */
function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-elevated ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 text-xs font-medium text-slate-400">GTMS — Payroll overview</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Team", v: "128", i: Building2, t: "text-brand-700 bg-brand-50" },
              { l: "Paid this month", v: "$412k", i: Banknote, t: "text-emerald-700 bg-emerald-50" },
              { l: "Placements", v: "37", i: Briefcase, t: "text-slate-700 bg-slate-100" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-100 p-3">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${s.t}`}>
                  <s.i className="h-4 w-4" />
                </span>
                <p className="font-display mt-2 text-lg font-semibold text-slate-900">{s.v}</p>
                <p className="text-[11px] text-slate-400">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Payroll run</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Completed</span>
            </div>
            <div className="flex items-end gap-1.5">
              {[40, 62, 48, 78, 56, 88, 70, 96].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-brand-gradient" style={{ height: `${h}px`, opacity: 0.35 + i * 0.08 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* floating chip */}
      <div className="animate-float absolute -bottom-5 -left-5 hidden rounded-xl border border-white/70 bg-white p-3 shadow-card sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-800">Salary credited</p>
            <p className="text-[11px] text-slate-400">+$3,200 · on time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const MODULES = [
  {
    icon: Briefcase,
    title: "Recruiting & placement",
    body:
      "Publish open roles, receive applications with attached CVs, run structured virtual interviews, and place candidates into positions — a single pipeline from applicant to hire.",
    points: ["Job postings & applications", "CV submission & review", "Candidate placement"],
  },
  {
    icon: FileCheck2,
    title: "Onboarding & verification",
    body:
      "Give every new hire a guided checklist. Collect and verify identity and employment documents, capture benefit elections, and track each step through to completion.",
    points: ["Document upload & review", "Identity verification", "Admin-configurable requirements"],
  },
  {
    icon: GraduationCap,
    title: "Training & bootcamp",
    body:
      "Assign structured courses and modules, monitor progress in real time, and issue completion certificates that get new hires productive from day one.",
    points: ["Courses & modules", "Progress tracking", "Completion certificates"],
  },
  {
    icon: ClipboardList,
    title: "Assignments & work",
    body:
      "Assign real work matched to each role, let employees start and submit deliverables, review the results, and collaborate in a discussion thread on every assignment.",
    points: ["Role-based assignment catalog", "Submit & review workflow", "Per-assignment messaging"],
  },
  {
    icon: Wallet,
    title: "Payroll & wallet",
    body:
      "Pay salaries directly to each employee's in-platform wallet, keep a complete ledger of every transaction, and let people set withdrawal methods and cash out on their terms.",
    points: ["Direct salary payments", "Full transaction ledger", "Employee-managed payouts"],
  },
  {
    icon: Video,
    title: "Virtual interviews",
    body:
      "Schedule and run interviews inside the platform with secure video rooms — no external meeting tools, links, or downloads required for either side.",
    points: ["In-platform video", "Scheduling & reminders", "No external tools"],
  },
];

const SECURITY = [
  {
    icon: Lock,
    title: "Encrypted document storage",
    body:
      "Sensitive documents are stored in private, access-controlled storage and served only to their owner or an authorized administrator.",
  },
  {
    icon: Users,
    title: "Role-based access control",
    body:
      "Every action is gated by role — employee, recruiter, or administrator — so people see exactly what they need and nothing more.",
  },
  {
    icon: ScrollText,
    title: "Complete audit trail",
    body:
      "Every payment and balance change is written to an immutable ledger, giving you an accurate, audit-ready record of all financial activity.",
  },
  {
    icon: ShieldCheck,
    title: "One-way payroll security",
    body:
      "Money moves in one direction only — from the company to your team. Employees never deposit funds or expose banking credentials to earn.",
  },
];

const FAQ = [
  {
    q: "How does payroll work?",
    a: "Administrators run salary payments that are credited directly to each employee's in-platform wallet. Every payment is recorded in a full ledger, and employees can review their complete pay history at any time.",
  },
  {
    q: "Is my personal information secure?",
    a: "Yes. Identity and onboarding documents are held in private, access-controlled storage and are only ever visible to you and authorized administrators. Access across the platform is governed by strict role-based permissions.",
  },
  {
    q: "What do I need to get onboarded?",
    a: "After you're placed in a role, your onboarding checklist guides you through profile details, document verification, benefit elections, and a short training bootcamp. Your administrator can tailor the exact documents required.",
  },
  {
    q: "Do I need any external tools for interviews or training?",
    a: "No. Interviews run in secure video rooms inside the platform, and all training courses and modules are delivered natively — there's nothing extra to install for you or your interviewer.",
  },
  {
    q: "How do withdrawals work?",
    a: "Once you've verified your identity, you can add a withdrawal method and cash out your available balance. Funds only ever flow from the company to you — you'll never be asked to deposit money to get paid.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> The modern workforce &amp; payroll platform
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Hire, onboard, and <span className="text-gradient">pay your team</span> with confidence
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              GTMS unifies recruiting, onboarding, training, assignments, and payroll in one
              secure workspace. Place talent into roles, get new hires productive fast, and run
              payroll with complete visibility — from the first application to every paycheck.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/register" size="lg" className="gap-2">
                Get started <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="secondary">
                Sign in
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              {["Guided onboarding", "Paid training", "On-time payroll"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:pl-6">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="border-y border-slate-200/60 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
            One platform for the entire employee lifecycle
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              [Lock, "Encrypted storage"],
              [Users, "Role-based access"],
              [ScrollText, "Audit-ready ledger"],
              [ShieldCheck, "One-way payroll"],
            ].map(([Icon, label]) => (
              <div key={label as string} className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                <Icon className="h-4 w-4 text-brand-600" /> {label as string}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: UserPlus, title: "Effortless hiring", body: "Post roles, review applicants, run virtual interviews, and place talent — all in one pipeline." },
            { icon: GraduationCap, title: "Onboarding & training", body: "Guided document verification, benefits enrollment, and a built-in bootcamp that gets new hires productive fast." },
            { icon: ArrowDownToLine, title: "Payroll & payouts", body: "Pay salaries in a click and let employees track earnings and withdraw with ease." },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform modules — detailed */}
      <section id="modules" className="scroll-mt-20 border-y border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">The platform</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every stage of employment, connected
            </h2>
            <p className="mt-3 text-slate-600">
              Six integrated modules replace the patchwork of spreadsheets and disconnected tools —
              so your people, documents, and payments all live in one secure system of record.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div key={m.title} className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
                  <m.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{m.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{m.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For teams — with imagery */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-brand-gradient opacity-10 blur-2xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-gradient shadow-elevated ring-1 ring-black/5">
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="A modern team collaborating"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover mix-blend-luminosity opacity-90"
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">For growing teams</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Built to run a workforce, end to end
            </h2>
            <p className="mt-4 text-slate-600">
              GTMS is designed for organizations that want to hire, develop, and pay their people
              without stitching together half a dozen systems. From the day a candidate applies to
              the day their salary lands, every record lives in one connected platform — accurate,
              searchable, and secure.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                [Video, "Virtual interviews", "Schedule and run interviews in secure, in-platform video rooms."],
                [ShieldCheck, "Secure document verification", "Collect and verify onboarding documents with private, access-controlled storage."],
                [Banknote, "Salaries to the wallet", "Pay your team directly and let them withdraw on their own terms."],
              ].map(([Icon, t, b]) => (
                <li key={t as string} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t as string}</p>
                    <p className="text-sm text-slate-500">{b as string}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">How it works</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">From application to first paycheck</h2>
          <p className="mt-2 text-slate-600">A guided journey for every new hire — in three clear stages.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: UserPlus, step: "01", title: "Apply & get placed", body: "Create your profile, submit your CV, and get matched to a role by our team through a structured interview." },
            { icon: GraduationCap, step: "02", title: "Onboard & train", body: "Verify your documents, set up benefits, and complete your onboarding bootcamp to get up to speed." },
            { icon: ArrowDownToLine, step: "03", title: "Work & get paid", body: "Take on assignments, earn your salary directly to your wallet, and withdraw to your preferred method." },
          ].map((f) => (
            <div key={f.title} className="relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl font-bold text-slate-200/80">{f.step}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & trust */}
      <section id="security" className="scroll-mt-20 border-y border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">Security &amp; trust</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your people&apos;s data, protected by design
            </h2>
            <p className="mt-3 text-slate-600">
              Security isn&apos;t a feature bolted on at the end — it&apos;s built into how the platform
              stores documents, controls access, and handles every payment.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {SECURITY.map((s) => (
              <div key={s.title} className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">FAQ</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Questions, answered</h2>
          <p className="mt-2 text-slate-600">Everything you need to know before you get started.</p>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card [&_summary]:list-none">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                {item.q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">
                  <span className="text-lg leading-none">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-mesh px-8 py-14 text-center shadow-elevated sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to build your team?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            Join GTMS today and give your workforce the professional experience they deserve —
            from their first application to every paycheck.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-3">
            <ButtonLink href="/register" size="lg" variant="secondary" className="gap-2">
              Get started <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
