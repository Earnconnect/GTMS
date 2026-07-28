import Link from "next/link";
import { requireRole } from "@/server/rbac";
import { browseTasks } from "@/server/services/task.service";
import { PageHeader, Card, EmptyState, Input, Select, Button } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { ReserveButton } from "@/components/tasks/ReserveButton";
import { ComboButton } from "@/components/tasks/ComboButton";
import { formatMoney, toCents } from "@/lib/money";
import { TASK_CATEGORIES, COMBO_MAX_UNITS } from "@/lib/constants";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("WORKER");
  const sp = await searchParams;

  const tasks = await browseTasks({
    q: sp.q,
    category: sp.category || undefined,
    minRewardCents: sp.minReward ? toCents(sp.minReward) : undefined,
    sort: sp.sort === "reward" ? "reward" : "newest",
  });

  return (
    <div>
      <PageHeader title="Browse tasks" subtitle="Find real work to do." />

      <form className="mb-6 grid gap-3 sm:grid-cols-5" method="get">
        <Input name="q" placeholder="Search…" defaultValue={sp.q ?? ""} className="sm:col-span-2" />
        <Select name="category" defaultValue={sp.category ?? ""}>
          <option value="">All categories</option>
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={sp.sort ?? "newest"}>
          <option value="newest">Newest</option>
          <option value="reward">Highest reward</option>
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {tasks.length === 0 ? (
        <EmptyState>No tasks available right now. Check back soon.</EmptyState>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="font-semibold text-slate-900 hover:text-brand-600 hover:underline"
                    >
                      {t.title}
                    </Link>
                    <StatusBadge status={t.category} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{t.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    by {t.requester.name ?? "Requester"} • {t.totalUnits} units
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {formatMoney(t.rewardPerUnit)}
                    </p>
                    <p className="text-xs text-slate-400">per unit</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ReserveButton taskId={t.id} />
                    {t.maxPerWorker > 1 && (
                      <ComboButton
                        taskId={t.id}
                        max={Math.min(t.maxPerWorker, COMBO_MAX_UNITS)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
