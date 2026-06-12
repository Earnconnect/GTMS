"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/server/actions/auth.actions";
import { NotificationBell } from "./NotificationBell";
import { MobileBottomNav, type BottomNavItem } from "./MobileBottomNav";
import {
  Search,
  Moon,
  Globe,
  LogOut,
  HelpCircle,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface AppShellProps {
  navItems: NavItem[];
  userEmail?: string;
  userName?: string;
  userRole?: string;
  children: React.ReactNode;
  helpHref?: string;
  settingsHref?: string;
  notificationsHref?: string;
  /** Up to 5 items shown in the mobile bottom tab bar */
  bottomNav?: BottomNavItem[];
}

type SidebarContentProps = Omit<AppShellProps, "children"> & {
  pathname: string;
  onClose?: () => void;
};

function SidebarContent({
  navItems,
  userEmail,
  userName,
  userRole,
  helpHref,
  settingsHref,
  pathname,
  onClose,
}: SidebarContentProps) {
  const roleColor = {
    Worker: "from-cyan-500 to-blue-600",
    Business: "from-violet-500 to-purple-600",
    Admin: "from-rose-500 to-red-600",
  }[userRole ?? "Worker"] ?? "from-cyan-500 to-blue-600";

  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br",
              roleColor
            )}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-[15px]">GTMS</p>
            <p className="text-[11px] text-slate-400 font-medium capitalize">
              {(userRole ?? "portal").toLowerCase()} portal
            </p>
          </div>
        </div>
        {/* Mobile close */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User pill */}
      <div className="mx-4 mb-4 px-3 py-2.5 rounded-xl bg-slate-50 flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 bg-gradient-to-br shadow-sm",
            roleColor
          )}
        >
          {userName?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-700 truncate">
            {userName ?? "User"}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        <p className="px-3 pb-2 text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/browse" &&
              !item.href.endsWith("/dashboard") &&
              pathname.startsWith(item.href + "/")) ||
            (item.href.endsWith("/dashboard") && pathname === item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-all duration-100",
                isActive
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <span
                className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 [&>svg]:w-full [&>svg]:h-full",
                  isActive ? "text-cyan-500" : "text-slate-400"
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pt-3 pb-4 border-t border-slate-100 space-y-0.5">
        {helpHref && (
          <Link
            href={helpHref}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <HelpCircle className="w-[18px] h-[18px] flex-shrink-0 text-slate-400" />
            Help center
          </Link>
        )}
        {settingsHref && (
          <Link
            href={settingsHref}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium transition-colors",
              pathname === settingsHref || pathname.startsWith(settingsHref + "/")
                ? "bg-cyan-50 text-cyan-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0 text-slate-400" />
            Settings
          </Link>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export function AppShell({
  navItems,
  userEmail,
  userName,
  userRole,
  children,
  helpHref,
  settingsHref,
  notificationsHref = "/dashboard/notifications",
  bottomNav,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const sharedProps = { navItems, userEmail, userName, userRole, helpHref, settingsHref };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#EEF2F8" }}>
      {/* ── Desktop Sidebar ────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-[240px] flex-shrink-0 bg-white flex-col border-r border-slate-100/80"
        style={{ boxShadow: "2px 0 16px rgba(0,0,0,0.04)" }}
      >
        <SidebarContent {...sharedProps} pathname={pathname} />
      </aside>

      {/* ── Mobile Sidebar Overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          onClick={closeSidebar}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          {/* Panel */}
          <aside
            className="relative z-50 w-[260px] bg-white flex flex-col h-full overflow-y-auto"
            style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent {...sharedProps} pathname={pathname} onClose={closeSidebar} />
          </aside>
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="flex-shrink-0 h-[62px] px-4 lg:px-6 flex items-center gap-3 bg-white/60 backdrop-blur-md border-b border-slate-100/60">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand on mobile */}
          <div className="lg:hidden flex-1 flex items-center gap-2">
            <span className="font-bold text-slate-800 text-[15px]">GTMS</span>
            <span className="text-[11px] text-slate-400 capitalize">{(userRole ?? "").toLowerCase()}</span>
          </div>

          {/* Search — desktop */}
          <div className="hidden lg:flex flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-9 bg-slate-100 rounded-xl pl-9 pr-4 text-[13px] text-slate-700 placeholder:text-slate-400 border-0 outline-none focus:ring-2 focus:ring-cyan-300/40 focus:bg-white transition-all"
            />
          </div>

          <div className="flex-1 lg:flex-none" />

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Mobile search */}
            <button className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100">
              <Search className="w-4 h-4" />
            </button>
            <button className="hidden sm:flex w-9 h-9 rounded-xl bg-white shadow-sm items-center justify-center text-slate-500 hover:text-slate-700 border border-slate-100 transition-colors">
              <Moon className="w-4 h-4" />
            </button>
            <button className="hidden sm:flex w-9 h-9 rounded-xl bg-white shadow-sm items-center justify-center text-slate-500 hover:text-slate-700 border border-slate-100 transition-colors">
              <Globe className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
              <NotificationBell href={notificationsHref} />
            </div>
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-bold select-none cursor-pointer shadow-sm"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
              title={userEmail}
            >
              {userName?.charAt(0).toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        {/* Page scroll container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-8">
            {children}
          </div>
          {/* Mobile bottom nav (includes its own spacer div) */}
          {bottomNav && bottomNav.length > 0 && (
            <MobileBottomNav items={bottomNav} />
          )}
        </div>
      </main>
    </div>
  );
}
