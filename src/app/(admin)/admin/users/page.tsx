import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { UserControls } from "@/components/admin/UserControls";
import { formatMoney } from "@/lib/money";

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { wallet: true },
    take: 200,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="User management"
        subtitle="Manage everyone with access to the platform — assign roles, activate or suspend accounts, and keep permissions aligned with each person's responsibilities."
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2">Manage</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-800">{u.name ?? "—"}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-2 text-right text-slate-600">
                  {formatMoney(u.wallet?.balance ?? 0)}
                </td>
                <td className="px-4 py-2">
                  <UserControls userId={u.id} role={u.role} status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
