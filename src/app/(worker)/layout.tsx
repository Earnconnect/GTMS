import { requireRole } from "@/server/rbac";
import { AppShell, type NavItem } from "@/components/layout/AppShell";

const WORKER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/wallet", label: "Pay & wallet", icon: "wallet" },
  { href: "/kyc", label: "Verification", icon: "verify" },
  { href: "/support", label: "Support", icon: "support" },
];

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("WORKER");
  return (
    <AppShell user={user} nav={WORKER_NAV}>
      {children}
    </AppShell>
  );
}
