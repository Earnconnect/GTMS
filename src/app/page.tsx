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
} from "lucide-react";
import { ButtonLink } from "@/components/ui";

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2">
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Recruiting &amp; payroll, done right
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Get recruited, get to work,{" "}
            <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
              get paid
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            We recruit people to work with us and pay them a salary. Apply for an
            account, get onboarded by our team, and receive your pay directly in
            your wallet — withdraw any time. You never pay us a cent.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <ButtonLink href="/register" size="lg" className="gap-2">
              Apply to join <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              Sign in
            </ButtonLink>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Free to apply · No deposits · Withdraw anytime
          </p>
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
              body: "Salary lands in your wallet. Verify your identity once, then withdraw whenever you like.",
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
