import { requireRole } from "@/server/rbac";
import { AppShell, type NavItem } from "@/components/layout/AppShell";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/employees", label: "Employees", icon: "users" },
  { href: "/admin/users", label: "Accounts", icon: "shield" },
  { href: "/admin/kyc", label: "Verification", icon: "verify" },
  { href: "/admin/payouts", label: "Withdrawals", icon: "withdrawals" },
  { href: "/admin/support", label: "Support", icon: "support" },
  { href: "/admin/ledger", label: "Ledger", icon: "ledger" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("ADMIN");
  return (
    <AppShell user={user} nav={ADMIN_NAV}>
      {children}
    </AppShell>
  );
}
