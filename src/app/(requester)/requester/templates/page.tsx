import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, EmptyState, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export default async function TemplatesPage() {
  const user = await requireRole("REQUESTER");
  const templates = await db.taskTemplate.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Reusable task definitions."
        action={<ButtonLink href="/requester/tasks/new">New task</ButtonLink>}
      />
      {templates.length === 0 ? (
        <EmptyState>
          No templates yet. Create tasks from the New task page; saved templates will
          appear here.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{t.title}</h3>
                  <p className="text-sm text-slate-500">{t.category}</p>
                </div>
                <span className="text-sm text-slate-600">
                  {formatMoney(t.defaultReward)}/unit
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
