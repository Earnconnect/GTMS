import { requireRole } from "@/server/rbac";
import { AppShell, type NavItem } from "@/components/layout/AppShell";

const REQUESTER_NAV: NavItem[] = [
  { href: "/requester", label: "Dashboard" },
  { href: "/requester/tasks", label: "My tasks" },
  { href: "/requester/tasks/new", label: "New task" },
  { href: "/requester/templates", label: "Templates" },
  { href: "/requester/wallet", label: "Wallet" },
  { href: "/requester/disputes", label: "Disputes" },
  { href: "/requester/support", label: "Support" },
];

export default async function RequesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("REQUESTER");
  return (
    <AppShell user={user} nav={REQUESTER_NAV}>
      {children}
    </AppShell>
  );
}
