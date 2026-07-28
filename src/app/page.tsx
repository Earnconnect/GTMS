import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-brand-700">
            GTMS
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <ButtonLink href="/register">Get started</ButtonLink>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Join the team • Real salary • Paid on time
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Get recruited, get to work, get paid
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          We recruit people to work with us and pay them a salary. Apply for an
          account, get onboarded by our team, and receive your pay directly in
          your wallet — withdraw any time. You never pay us a cent.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ButtonLink href="/register" className="px-6 py-3 text-base">
            Apply to join
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary" className="px-6 py-3 text-base">
            Sign in
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 sm:grid-cols-3">
        {[
          {
            title: "1 · Apply",
            body: "Create your account in seconds. No fees, no deposits — applying and joining is always free.",
          },
          {
            title: "2 · Get onboarded",
            body: "Our team reviews your account, sets your role and salary, and activates your employment.",
          },
          {
            title: "3 · Get paid",
            body: "Salary lands in your wallet. Verify your identity once, then withdraw your pay whenever you like.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        GTMS — recruit, employ, and pay your team.
      </footer>
    </main>
  );
}
