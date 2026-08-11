import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/** Shared page frame for legal documents (privacy, terms). */
export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-slate-200/60 bg-white/50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">Legal</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-slate-400">Last updated: {updated}</p>
          {intro && <p className="mt-4 leading-relaxed text-slate-600">{intro}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-8 text-sm leading-relaxed text-slate-600 [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_h2]:mb-1 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
