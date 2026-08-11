import { ShieldCheck, BadgeCheck, Banknote } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-hero-mesh p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <BrandLogo light />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/80 ring-1 ring-inset ring-white/15">
            Workforce &amp; Payroll
          </span>
          <h2 className="mt-5 max-w-md text-[2.1rem] font-semibold leading-[1.15] tracking-[-0.02em]">
            One platform for your entire team.
          </h2>
          <p className="mt-3 max-w-sm leading-relaxed text-white/75">
            Recruiting, onboarding, training, and payroll — a single, secure
            workspace that carries every employee from application to paycheck.
          </p>
          <ul className="mt-8 space-y-3.5 text-sm text-white/90">
            {[
              [BadgeCheck, "Guided onboarding and document verification"],
              [Banknote, "Salaries paid directly to your wallet"],
              [ShieldCheck, "Withdraw your earnings on your terms"],
            ].map(([Icon, text]) => (
              <li key={text as string} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-inset ring-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                {text as string}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/55">
          © GTMS — enterprise recruiting &amp; payroll platform.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--background)] px-4 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <BrandLogo />
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white p-8 shadow-soft ring-1 ring-inset ring-slate-900/[0.02]">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Protected by enterprise-grade security · Your data stays private.
        </p>
      </div>
    </div>
  );
}
