import { requireWorker } from "@/server/rbac";
import { AppShell } from "@/components/layout/AppShell";
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  Wallet,
  Award,
  GraduationCap,
  TrendingUp,
  BarChart2,
  Trophy,
  Users,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/browse", label: "Browse Tasks", icon: <Search /> },
  { href: "/dashboard/submissions", label: "My Work", icon: <ClipboardList /> },
  { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet /> },
  { href: "/dashboard/membership", label: "Membership", icon: <Award /> },
  { href: "/dashboard/certifications", label: "Certifications", icon: <GraduationCap /> },
  { href: "/dashboard/career", label: "Career", icon: <TrendingUp /> },
  { href: "/dashboard/performance", label: "Performance", icon: <BarChart2 /> },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy /> },
  { href: "/dashboard/referrals", label: "Referrals", icon: <Users /> },
  { href: "/dashboard/kyc", label: "KYC / Identity", icon: <ShieldCheck /> },
  { href: "/dashboard/disputes", label: "Disputes", icon: <AlertCircle /> },
];

const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: <LayoutDashboard />, matchPrefix: "/dashboard" },
  { href: "/browse", label: "Browse", icon: <Search />, matchPrefix: "/browse" },
  { href: "/dashboard/submissions", label: "My Work", icon: <ClipboardList />, matchPrefix: "/dashboard/submissions" },
  { href: "/dashboard/wallet", label: "Wallet", icon: <Wallet />, matchPrefix: "/dashboard/wallet" },
  { href: "/dashboard/career", label: "Career", icon: <TrendingUp />, matchPrefix: "/dashboard/career" },
];

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireWorker();

  return (
    <AppShell
      navItems={NAV}
      userEmail={user.email}
      userName={user.name ?? undefined}
      userRole="Worker"
      helpHref="/dashboard/support"
      settingsHref="/dashboard/settings"
      notificationsHref="/dashboard/notifications"
      bottomNav={BOTTOM_NAV}
    >
      {children}
    </AppShell>
  );
}
