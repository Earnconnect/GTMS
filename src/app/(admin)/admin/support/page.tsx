import { requireRole } from "@/server/rbac";
import { loadTicketViews } from "@/server/services/support.queries";
import { PageHeader } from "@/components/ui";
import { SupportCenter } from "@/components/support/SupportCenter";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const showAll = sp.all === "1";
  const tickets = await loadTicketViews(
    showAll ? {} : { status: { in: ["OPEN", "PENDING"] } },
  );
  return (
    <div>
      <PageHeader
        title="Support tickets"
        subtitle={showAll ? "All tickets." : "Open tickets."}
        action={
          <a
            href={showAll ? "/admin/support" : "/admin/support?all=1"}
            className="text-sm text-brand-600 hover:underline"
          >
            {showAll ? "Show open only" : "Show all"}
          </a>
        }
      />
      <SupportCenter tickets={tickets} isAdmin allowCreate={false} />
    </div>
  );
}
