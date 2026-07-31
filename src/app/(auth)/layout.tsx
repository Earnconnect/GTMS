import Link from "next/link";
import { Wallet, ShieldCheck, BadgeCheck, Banknote } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-600 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">GTMS</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            One platform for your entire team.
          </h2>
          <p className="mt-3 max-w-sm text-white/80">
            Recruiting, onboarding, training, and payroll — a seamless experience
            from application to paycheck.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            {[
              [BadgeCheck, "Guided onboarding and document verification"],
              [Banknote, "Salaries paid directly to your wallet"],
              [ShieldCheck, "Withdraw your earnings on your terms"],
            ].map(([Icon, text]) => (
              <li key={text as string} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text as string}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {" "}GTMS — recruiting &amp; payroll platform.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--background)] px-4 py-12 lg:w-1/2">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-xl font-bold text-slate-900 lg:hidden"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-emerald-500 text-white">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
          GTMS
        </Link>
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-7 shadow-soft">
          {children}
        </div>
      </div>
    </div>
  );
}
