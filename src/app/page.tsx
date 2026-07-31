import Link from "next/link";
import {
  Wallet,
  ShieldCheck,
  BadgeCheck,
  Banknote,
  UserPlus,
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  FileWarning,
  ClipboardCheck,
  PiggyBank,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";

const PLATFORM_FEATURES = [
  { icon: ClipboardCheck, title: "Guided onboarding", body: "A step-by-step flow with document verification, benefits, and training." },
  { icon: Briefcase, title: "Job placements", body: "An internal roles board — apply and get placed through a real pipeline." },
  { icon: GraduationCap, title: "Bootcamp & training", body: "Structured courses to ramp new hires with progress tracking." },
  { icon: PiggyBank, title: "401(k) benefits", body: "Enroll, set your contribution, and see your employer match." },
  { icon: FileWarning, title: "Employee reports", body: "Submit progress, flag issues, and track resolutions." },
  { icon: Banknote, title: "Salary & payroll", body: "Get paid to your wallet and withdraw — company to employee only." },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-sm">
        <Wallet className="h-[18px] w-[18px]" />
      </span>
      <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        GTMS
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <ButtonLink href="/register">Apply to join</ButtonLink>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-brand-50 via-emerald-50/40 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(#99f6e4 0.9px, transparent 0.9px)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black, transparent 55%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 55%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              We&apos;re hiring — start your application today
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              A career that pays you{" "}
              <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
                what you&apos;re worth
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Join GTMS and we&apos;ll take you from application to first paycheck —
              guided onboarding, paid training, real placements, and a salary sent
              straight to your wallet. Set your withdrawal details once and cash out
              whenever you like. Joining is always free.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/register" size="lg" className="gap-2">
                Apply to join <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="secondary">
                Sign in
              </ButtonLink>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Free to apply · No deposits · Withdraw anytime
            </p>
          </div>

          {/* Product preview graphic */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/40 to-emerald-200/40 blur-2xl" />
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-xs font-medium text-slate-400">GTMS · Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  ["Employees", "128", "from-brand-500 to-brand-600"],
                  ["Paid this run", "$92k", "from-emerald-500 to-emerald-600"],
                  ["Onboarding", "94%", "from-teal-500 to-emerald-500"],
                ].map(([label, val, grad]) => (
                  <div key={label as string} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className={`mb-2 grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${grad} text-white`}>
                      <Banknote className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-800">{val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {[70, 45, 88].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-emerald-400" />
                    <div className="flex-1">
                      <div className="h-2 w-24 rounded-full bg-slate-200" />
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Paid</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] text-slate-400">Onboarding complete</p>
                  <p className="text-xs font-semibold text-slate-800">Welcome aboard 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: UserPlus,
              step: "01",
              title: "Apply",
              body: "Create your account in seconds. Applying and joining is always free — no fees, no deposits.",
            },
            {
              icon: BadgeCheck,
              step: "02",
              title: "Get onboarded",
              body: "Our team reviews your account, sets your role and salary, and activates your employment.",
            },
            {
              icon: ArrowDownToLine,
              step: "03",
              title: "Get paid",
              body: "Salary lands in your wallet. Add your withdrawal details once, verify your identity, and cash out whenever you like.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-300">{f.step}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Everything you need, from day one
          </h2>
          <p className="mt-3 text-slate-600">
            One professional platform for your whole journey — applications,
            interviews, onboarding, training, benefits, and getting paid.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-emerald-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust band */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
          <div className="grid gap-8 p-8 sm:grid-cols-2 sm:p-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Safe by design
              </h2>
              <p className="mt-3 text-slate-600">
                Money flows in one direction only:{" "}
                <span className="font-semibold text-slate-900">company → employee</span>.
                Employees are never asked to deposit, pay activation fees, or buy a
                pass to withdraw their earnings.
              </p>
              <div className="mt-6">
                <ButtonLink href="/register" className="gap-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-1">
              {[
                [Banknote, "Salary paid to your wallet", "Credited by your employer, tracked to the cent."],
                [ShieldCheck, "No pay-to-withdraw", "Withdraw above a small flat minimum — no unlock fees."],
                [BadgeCheck, "One-time verification", "Standard identity check to enable cash-out. That's it."],
              ].map(([Icon, title, body]) => (
                <li key={title as string} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title as string}</p>
                    <p className="text-sm text-slate-500">{body as string}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-sm text-slate-500">
            GTMS — recruit, employ, and pay your team.
          </p>
        </div>
      </footer>
    </main>
  );
}
