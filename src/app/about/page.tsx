import type { Metadata } from "next";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Gauge,
  Users,
  Briefcase,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "About GTMS — Our mission and values",
  description:
    "GTMS unifies recruiting, onboarding, training, and payroll into one secure platform. Learn about our mission, what we do, and the values that guide how we build.",
};

const VALUES = [
  {
    icon: HeartHandshake,
    title: "People first",
    body:
      "Every feature is measured against a simple test: does it make working here better for the people we hire? Their experience — clear, respectful, and human — comes before everything else.",
  },
  {
    icon: ShieldCheck,
    title: "Security by default",
    body:
      "We treat personal and financial data as a responsibility, not an afterthought. Private storage, role-based access, and one-way payroll are built into the foundation, not bolted on.",
  },
  {
    icon: Sparkles,
    title: "Clarity & transparency",
    body:
      "No hidden mechanics, no confusing fine print. People always know where they stand — what they've earned, what's next in their onboarding, and exactly how their money moves.",
  },
  {
    icon: Gauge,
    title: "Momentum",
    body:
      "Great teams lose energy waiting on paperwork and approvals. We remove the friction between hiring someone and setting them up to do their best work.",
  },
];

const WHAT_WE_DO = [
  { icon: Briefcase, title: "Recruit & place", body: "Post roles, review applicants, interview, and place talent — all in one pipeline." },
  { icon: GraduationCap, title: "Onboard & train", body: "Guided onboarding, secure document verification, and a built-in training bootcamp." },
  { icon: Wallet, title: "Pay & support", body: "Salaries paid directly to each employee's wallet, with clear history and easy withdrawals." },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-center shadow-card">
      <p className="font-display text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/60">
        <div className="pointer-events-none absolute -left-40 -top-10 h-96 w-96 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
            <Users className="h-3.5 w-3.5" /> About GTMS
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            We&apos;re building the platform a modern workforce deserves
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            GTMS brings recruiting, onboarding, training, and payroll together in one secure
            system of record — so organizations can hire, develop, and pay their people without
            stitching together a dozen disconnected tools.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">Our mission</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Make employment simple, secure, and human
            </h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <p>
                Hiring someone should be the start of a great experience — not the beginning of a
                paperwork marathon. Yet most teams still run their workforce across spreadsheets,
                email threads, and payment tools that were never designed to talk to each other.
              </p>
              <p>
                We started GTMS to close that gap. One platform that follows every employee through
                their entire journey: the application, the interview, the offer, onboarding,
                training, day-to-day work, and every paycheck that follows — accurate, connected,
                and protected at each step.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat value="6" label="Integrated modules" />
            <Stat value="1" label="System of record" />
            <Stat value="100%" label="Company-funded payroll" />
            <Stat value="24/7" label="Access to your records" />
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-y border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">What we do</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              The full employee lifecycle, in one place
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {WHAT_WE_DO.map((w) => (
              <div key={w.title} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <w.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">Our values</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">What guides how we build</h2>
          <p className="mt-3 text-slate-600">
            A few principles shape every decision we make — from the smallest interaction to the way
            we handle your most sensitive data.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="flex gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100">
                <v.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-mesh px-8 py-14 text-center shadow-elevated sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Join the team</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            Explore open roles and start your journey — from your first application to every paycheck.
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
