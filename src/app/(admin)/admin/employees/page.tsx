import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, PageHeader } from "@/components/ui";
import { EmployeeControls } from "@/components/admin/EmployeeControls";
import { OnboardEmployeeForm } from "@/components/admin/OnboardEmployeeForm";
import { formatMoney } from "@/lib/money";
import { SYSTEM_USER_EMAIL } from "@/lib/constants";

const STATUS_TONE = {
  ONBOARDING: "yellow",
  EMPLOYED: "green",
  SUSPENDED: "yellow",
  TERMINATED: "red",
} as const;

export default async function AdminEmployeesPage() {
  await requireRole("ADMIN");

  const employees = await db.user.findMany({
    where: { employmentStatus: { not: null } },
    orderBy: { hiredAt: "desc" },
    include: { wallet: true },
    take: 500,
  });

  // Accounts that could be onboarded: registered, not yet an employee, not the
  // system wallet, not admins.
  const candidates = await db.user.findMany({
    where: {
      employmentStatus: null,
      role: { not: "ADMIN" },
      email: { not: SYSTEM_USER_EMAIL },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Onboard recruits and pay salaries. Money flows company → employee only."
      />

      <OnboardEmployeeForm candidates={candidates} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Balance</th>
              <th className="px-4 py-2 text-right">Pay</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-800">{e.name ?? "—"}</div>
                  <div className="text-xs text-slate-400">{e.email}</div>
                </td>
                <td className="px-4 py-2 text-slate-600">
                  <div>{e.jobTitle ?? "—"}</div>
                  <div className="text-xs text-slate-400">{e.department ?? ""}</div>
                </td>
                <td className="px-4 py-2">
                  <Badge tone={STATUS_TONE[e.employmentStatus ?? "ONBOARDING"]}>
                    {e.employmentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right text-slate-600">
                  {formatMoney(e.wallet?.balance ?? 0)}
                </td>
                <td className="px-4 py-2">
                  <EmployeeControls
                    employeeId={e.id}
                    employmentStatus={e.employmentStatus}
                    defaultSalaryCents={e.salaryCents}
                  />
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  No employees yet. Onboard someone above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
