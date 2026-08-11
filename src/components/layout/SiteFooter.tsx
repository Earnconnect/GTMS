import Link from "next/link";
import { ShieldCheck, Mail, Globe, Clock } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const COLUMNS: { h: string; links: [string, string][] }[] = [
  {
    h: "Platform",
    links: [
      ["Modules", "/#modules"],
      ["How it works", "/#how"],
      ["Security", "/#security"],
      ["FAQ", "/#faq"],
    ],
  },
  {
    h: "Company",
    links: [
      ["About", "/about"],
      ["Careers", "/register"],
      ["Contact", "mailto:support@gtms.app"],
    ],
  },
  {
    h: "Legal",
    links: [
      ["Privacy Policy", "/legal/privacy"],
      ["Terms of Service", "/legal/terms"],
    ],
  },
];

/** Public marketing footer shared across the landing, about, and legal pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The workforce &amp; payroll platform that carries every employee securely from
              application to paycheck — recruiting, onboarding, training, and payroll in one place.
            </p>
            <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-500">
              <a href="mailto:support@gtms.app" className="inline-flex items-center gap-2 hover:text-brand-700">
                <Mail className="h-4 w-4 text-slate-400" /> support@gtms.app
              </a>
              <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" /> Available worldwide</span>
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> Support Mon–Fri, 9–6</span>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.h}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{col.h}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-slate-600 transition-colors hover:text-brand-700">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© GTMS — recruiting, employment &amp; payroll platform. All rights reserved.</p>
          <p className="inline-flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Enterprise-grade security</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
