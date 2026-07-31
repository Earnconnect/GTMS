import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@prisma/client";
import { Wallet, LogOut } from "lucide-react";
import { logoutAction } from "@/server/actions/logout.action";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SidebarNav, type NavItem } from "@/components/layout/SidebarNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar } from "@/components/ui";

export type { NavItem };

const roleLabel: Record<Role, string> = {
  WORKER: "Employee",
  REQUESTER: "Recruiter",
  ADMIN: "Admin · HR",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-sm">
        <Wallet className="h-[18px] w-[18px]" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">GTMS</span>
    </Link>
  );
}

export function AppShell({
  user,
  nav,
  children,
}: {
  user: { name?: string | null; email: string; role: Role; id: string };
  nav: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Logo />
        </div>
        <SidebarNav items={nav} />
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={user.name} email={user.email} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {user.name ?? user.email}
              </p>
              <p className="truncate text-xs text-slate-400">{roleLabel[user.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-1.5">
            <MobileNav nav={nav} user={user} roleLabel={roleLabel[user.role]} />
            <span className="md:hidden">
              <Logo />
            </span>
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 md:inline-flex">
              {roleLabel[user.role]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} />
            <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
            <form action={logoutAction}>
              <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl animate-fade-in px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
