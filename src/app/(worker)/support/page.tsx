import { requireRole } from "@/server/rbac";
import { loadTicketViews } from "@/server/services/support.queries";
import { PageHeader } from "@/components/ui";
import { SupportCenter } from "@/components/support/SupportCenter";

export default async function WorkerSupportPage() {
  const user = await requireRole("WORKER");
  const tickets = await loadTicketViews({ userId: user.id });
  return (
    <div>
      <PageHeader title="Support" subtitle="Get help from our team." />
      <SupportCenter tickets={tickets} isAdmin={false} allowCreate />
    </div>
  );
}
