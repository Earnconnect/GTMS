"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Wallet,
  BadgeCheck,
  LifeBuoy,
  BarChart3,
  ArrowDownToLine,
  BookOpenCheck,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  FileWarning,
  ClipboardCheck,
  ClipboardList,
  Video,
  Library,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "@/lib/cn";

export type NavItem = { href: string; label: string; icon?: string };

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  onboard: UserPlus,
  wallet: Wallet,
  verify: BadgeCheck,
  support: LifeBuoy,
  analytics: BarChart3,
  withdrawals: ArrowDownToLine,
  ledger: BookOpenCheck,
  shield: ShieldCheck,
  jobs: Briefcase,
  training: GraduationCap,
  reports: FileWarning,
  onboarding: ClipboardCheck,
  interview: Video,
  work: ClipboardList,
  catalog: Library,
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-4">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));
        const Icon = item.icon ? ICONS[item.icon] : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {Icon && (
              <Icon
                className={clsx(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600",
                )}
              />
            )}
            {item.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
          </Link>
        );
      })}
    </nav>
  );
}
