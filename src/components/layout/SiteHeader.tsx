import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { BrandLogo } from "@/components/BrandLogo";

const LINKS: [string, string][] = [
  ["Platform", "/#modules"],
  ["Security", "/#security"],
  ["About", "/about"],
  ["FAQ", "/#faq"],
];

/** Public marketing header shared across the landing, about, and legal pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <BrandLogo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 md:inline-flex"
            >
              {label}
            </Link>
          ))}
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
          <ButtonLink href="/register">Apply now</ButtonLink>
        </nav>
      </div>
    </header>
  );
}
