import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/server/actions/logout.action";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export type NavItem = { href: string; label: string };

const roleLabel: Record<Role, string> = {
  WORKER: "Employee",
  REQUESTER: "Recruiter",
  ADMIN: "Admin",
};

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
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <Link href="/" className="text-lg font-bold text-brand-700">
            GTMS
          </Link>
          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
            {roleLabel[user.role]}
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="md:pl-60">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="text-sm text-slate-500">
            {user.name ?? user.email}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user.id} />
            <form action={logoutAction}>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
