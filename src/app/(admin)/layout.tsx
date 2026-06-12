import { requireAdmin } from "@/server/rbac";
import { AppShell } from "@/components/layout/AppShell";
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  Award,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  AlertCircle,
  BarChart2,
  FileText,
  Gavel,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/admin/users", label: "Users", icon: <Users /> },
  { href: "/admin/deposits", label: "Deposits", icon: <ArrowDownCircle /> },
  { href: "/admin/payouts", label: "Payouts", icon: <ArrowUpCircle /> },
  { href: "/admin/kyc", label: "KYC Review", icon: <ShieldCheck /> },
  { href: "/admin/memberships", label: "Memberships", icon: <Award /> },
  { href: "/admin/tasks", label: "Tasks", icon: <ClipboardList /> },
  { href: "/admin/submissions", label: "Submissions", icon: <ClipboardCheck /> },
  { href: "/admin/certifications", label: "Certifications", icon: <Gavel /> },
  { href: "/admin/fraud", label: "Fraud Flags", icon: <AlertTriangle /> },
  { href: "/admin/disputes", label: "Disputes", icon: <AlertCircle /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart2 /> },
  { href: "/admin/audit-log", label: "Audit Log", icon: <FileText /> },
];

const BOTTOM_NAV = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard />, matchPrefix: "/admin" },
  { href: "/admin/users", label: "Users", icon: <Users />, matchPrefix: "/admin/users" },
  { href: "/admin/deposits", label: "Deposits", icon: <ArrowDownCircle />, matchPrefix: "/admin/deposits" },
  { href: "/admin/payouts", label: "Payouts", icon: <ArrowUpCircle />, matchPrefix: "/admin/payouts" },
  { href: "/admin/submissions", label: "Submissions", icon: <ClipboardCheck />, matchPrefix: "/admin/submissions" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AppShell
      navItems={NAV}
      userEmail={user.email}
      userName={user.name ?? undefined}
      userRole="Admin"
      helpHref="/admin/support"
      notificationsHref="/admin/notifications"
      bottomNav={BOTTOM_NAV}
    >
      {children}
    </AppShell>
  );
}
