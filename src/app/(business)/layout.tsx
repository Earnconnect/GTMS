import { requireBusiness } from "@/server/rbac";
import { AppShell } from "@/components/layout/AppShell";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Wallet,
  BarChart2,
  AlertCircle,
} from "lucide-react";

const NAV = [
  { href: "/business/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/business/tasks", label: "My Tasks", icon: <ClipboardList /> },
  { href: "/business/tasks/new", label: "Post New Task", icon: <PlusCircle /> },
  { href: "/business/wallet", label: "Wallet", icon: <Wallet /> },
  { href: "/business/reports", label: "Reports", icon: <BarChart2 /> },
  { href: "/business/disputes", label: "Disputes", icon: <AlertCircle /> },
];

const BOTTOM_NAV = [
  { href: "/business/dashboard", label: "Home", icon: <LayoutDashboard />, matchPrefix: "/business/dashboard" },
  { href: "/business/tasks", label: "Tasks", icon: <ClipboardList />, matchPrefix: "/business/tasks" },
  { href: "/business/tasks/new", label: "Post Task", icon: <PlusCircle />, matchPrefix: "/business/tasks/new" },
  { href: "/business/wallet", label: "Wallet", icon: <Wallet />, matchPrefix: "/business/wallet" },
  { href: "/business/reports", label: "Reports", icon: <BarChart2 />, matchPrefix: "/business/reports" },
];

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const user = await requireBusiness();

  return (
    <AppShell
      navItems={NAV}
      userEmail={user.email}
      userName={user.name ?? undefined}
      userRole="Business"
      helpHref="/business/support"
      settingsHref="/business/settings"
      notificationsHref="/business/notifications"
      bottomNav={BOTTOM_NAV}
    >
      {children}
    </AppShell>
  );
}
