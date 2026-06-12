import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const users = await db.user.findMany({
    where: {
      AND: [
        params.role ? { role: params.role as never } : {},
        params.status ? { status: params.status as never } : {},
        params.q
          ? { OR: [{ name: { contains: params.q, mode: "insensitive" } }, { email: { contains: params.q, mode: "insensitive" } }] }
          : {},
      ],
    },
    include: {
      membership: { select: { tier: true, status: true } },
      _count: { select: { workerSubs: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const roleVariant: Record<string, "info" | "success" | "purple"> = {
    WORKER: "info",
    BUSINESS: "success",
    ADMIN: "purple",
  };

  const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
    ACTIVE: "success",
    SUSPENDED: "warning",
    BANNED: "danger",
    PENDING_KYC: "default",
  };

  return (
    <div>
      <PageHeader title="Users" description={`${users.length} users`} />

      <div className="flex gap-3 mb-6">
        {["", "WORKER", "BUSINESS", "ADMIN"].map((role) => (
          <a
            key={role}
            href={role ? `?role=${role}` : "?"}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
              (params.role ?? "") === role
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {role || "All"}
          </a>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-gray-100">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/admin/users/${u.id}`}
              className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{u.name ?? "—"}</p>
                  <Badge variant={roleVariant[u.role] ?? "default"}>{u.role}</Badge>
                </div>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant[u.status] ?? "default"}>{u.status}</Badge>
                {u.membership && (
                  <p className="text-xs text-gray-400 mt-0.5">{u.membership.tier}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
