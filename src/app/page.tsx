import Link from "next/link";
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
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { BrandLogo } from "@/components/BrandLogo";

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
                <p className="mt-2 text-lg font-semibold text-slate-900">{s.v}</p>
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

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/60 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <BrandLogo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <ButtonLink href="/register">Apply now</ButtonLink>
          </nav>
        </div>
      </header>

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
              GTMS brings recruiting, onboarding, training, and payroll into one elegant
              workspace. Place talent into roles, run payroll in a click, and give every
              employee a seamless experience from application to paycheck.
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

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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

      {/* For teams — with imagery */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
              Everything your workforce needs, in one place
            </h2>
            <p className="mt-4 text-slate-600">
              Replace the patchwork of spreadsheets and disconnected tools. GTMS unifies the
              full employee journey so your people can focus on the work that matters.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                [Video, "Virtual interviews", "Schedule and run interviews without leaving the platform."],
                [ShieldCheck, "Secure document verification", "Collect and verify onboarding documents with confidence."],
                [Banknote, "Salaries to the wallet", "Pay your team and let them withdraw on their terms."],
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
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">From application to first paycheck</h2>
          <p className="mt-2 text-slate-600">A guided journey for every new hire.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: UserPlus, step: "01", title: "Apply & get placed", body: "Create your profile, submit your CV, and get matched to a role by our team." },
            { icon: GraduationCap, step: "02", title: "Onboard & train", body: "Verify your documents, set up benefits, and complete your onboarding bootcamp." },
            { icon: ArrowDownToLine, step: "03", title: "Work & get paid", body: "Take on assignments, earn your salary, and withdraw to your preferred method." },
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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-mesh px-8 py-14 text-center shadow-elevated sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to build your team?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            Join GTMS today and give your workforce the professional experience they deserve.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-3">
            <ButtonLink href="/register" size="lg" variant="secondary" className="gap-2">
              Get started <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <BrandLogo />
          <p className="text-sm text-slate-500">© GTMS — recruiting, employment &amp; payroll.</p>
        </div>
      </footer>
    </main>
  );
}
