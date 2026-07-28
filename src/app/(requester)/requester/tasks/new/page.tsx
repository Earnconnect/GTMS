import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import { formatMoney } from "@/lib/money";

export default async function NewTaskPage() {
  const user = await requireRole("REQUESTER");
  const wallet = await db.walletAccount.findUnique({ where: { userId: user.id } });

  return (
    <div>
      <PageHeader
        title="Create a task"
        subtitle="Define real work, fund it from your balance, and publish to workers."
      />
      <Card className="mb-6">
        <p className="text-sm text-slate-600">
          Available balance:{" "}
          <span className="font-semibold text-slate-900">
            {formatMoney(wallet?.balance ?? 0)}
          </span>
          . Publishing locks reward + platform fee per unit in escrow. You only pay
          for deliverables you approve; unused escrow is refunded.
        </p>
      </Card>
      <NewTaskForm />
    </div>
  );
}
