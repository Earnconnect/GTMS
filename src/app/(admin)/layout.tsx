import { requireRole } from "@/server/rbac";
import { AppShell, type NavItem } from "@/components/layout/AppShell";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/users", label: "Accounts" },
  { href: "/admin/kyc", label: "Verification" },
  { href: "/admin/payouts", label: "Withdrawals" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/ledger", label: "Ledger" },
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
