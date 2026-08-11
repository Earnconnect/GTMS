"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, LogOut, MoreHorizontal, Circle } from "lucide-react";
import { clsx } from "@/lib/cn";
import { logoutAction } from "@/server/actions/logout.action";
import { NAV_ICONS, type NavItem } from "./navShared";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar } from "@/components/ui";

export function MobileNav({
  nav,
  user,
  roleLabel,
}: {
  nav: NavItem[];
  user: { name?: string | null; email: string };
  roleLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const tabs = nav.slice(0, 4);
  const anyMoreActive = nav.slice(4).some((i) => isActive(i.href));

  return (
    <>
      {/* Bottom tab bar — always visible on mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(16,24,40,0.05)] backdrop-blur md:hidden">
        {tabs.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon ? NAV_ICONS[item.icon] ?? Circle : Circle;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-brand-700" : "text-slate-500",
              )}
            >
              <Icon className={clsx("h-[22px] w-[22px]", active ? "text-brand-600" : "text-slate-400")} />
              <span className="max-w-[74px] truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="More"
          className={clsx(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
            anyMoreActive ? "text-brand-700" : "text-slate-500",
          )}
        >
          <MoreHorizontal className={clsx("h-[22px] w-[22px]", anyMoreActive ? "text-brand-600" : "text-slate-400")} />
          More
        </button>
      </nav>

      {/* Full-menu drawer */}
      <div
        className={clsx("fixed inset-0 z-50 md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={clsx(
            "absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={clsx(
            "absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-white shadow-soft transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
            <span onClick={() => setOpen(false)}>
              <BrandLogo />
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            {nav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon ? NAV_ICONS[item.icon] : undefined;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {Icon && <Icon className={clsx("h-5 w-5 shrink-0", active ? "text-brand-600" : "text-slate-400")} />}
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar name={user.name} email={user.email} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{user.name ?? user.email}</p>
                <p className="truncate text-xs text-slate-400">{roleLabel}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <LogOut className="h-5 w-5 text-slate-400" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
