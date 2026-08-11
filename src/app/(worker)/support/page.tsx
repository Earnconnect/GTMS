import { requireRole } from "@/server/rbac";
import { loadTicketViews } from "@/server/services/support.queries";
import { PageHeader } from "@/components/ui";
import { SupportCenter } from "@/components/support/SupportCenter";

export default async function WorkerSupportPage() {
  const user = await requireRole("WORKER");
  const tickets = await loadTicketViews({ userId: user.id });
  return (
    <div>
      <PageHeader
        eyebrow="Help center"
        title="Support"
        subtitle="Have a question about your role, onboarding, or pay? Reach our team here and we'll get back to you — we're glad to help."
      />
      <SupportCenter tickets={tickets} isAdmin={false} allowCreate />
    </div>
  );
}
