"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Treat any path starting with this prefix as active (defaults to href) */
  matchPrefix?: string;
}

export function MobileBottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer so content isn't hidden behind the bar */}
      <div className="h-[68px] lg:hidden flex-shrink-0" />

      {/* Fixed bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch bg-white border-t border-slate-200"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.07)" }}
      >
        {items.map((item) => {
          const prefix = item.matchPrefix ?? item.href;
          const isActive =
            pathname === item.href ||
            (prefix !== "/" && pathname.startsWith(prefix));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-safe-or-2 min-w-0 transition-colors",
                isActive ? "text-cyan-600" : "text-slate-400"
              )}
              style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))" }}
            >
              {/* Active indicator dot above icon */}
              <span
                className={cn(
                  "w-1 h-1 rounded-full mb-0.5 transition-all",
                  isActive ? "bg-cyan-500 scale-100" : "bg-transparent scale-0"
                )}
              />
              <span
                className={cn(
                  "w-5 h-5 [&>svg]:w-full [&>svg]:h-full transition-transform",
                  isActive ? "scale-110" : "scale-100"
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold leading-none tracking-wide transition-colors truncate max-w-full px-1",
                  isActive ? "text-cyan-600" : "text-slate-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
