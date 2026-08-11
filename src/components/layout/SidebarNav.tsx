"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/cn";
import { NAV_ICONS, type NavItem } from "./navShared";

export type { NavItem };

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4">
      <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Menu
      </p>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));
        const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {active && (
              <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-brand-gradient" />
            )}
            {Icon && (
              <Icon
                className={clsx(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600",
                )}
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
