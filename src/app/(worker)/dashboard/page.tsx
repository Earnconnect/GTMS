import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { Badge, Card, PageHeader, ButtonLink } from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { listSalaryPayments } from "@/server/services/payroll.service";

export default async function EmployeeDashboard() {
  const user = await requireRole("WORKER");

  const [profile, wallet, payments] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: {
        jobTitle: true,
        department: true,
        salaryCents: true,
        employmentStatus: true,
        hiredAt: true,
        kycStatus: true,
      },
    }),
    db.walletAccount.findUnique({ where: { userId: user.id } }),
    listSalaryPayments(user.id, 10),
  ]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const onboarded = profile?.employmentStatus != null;

  const stats = [
    { label: "Available balance", value: formatMoney(wallet?.balance ?? 0) },
    { label: "Salary per period", value: formatMoney(profile?.salaryCents ?? 0) },
    { label: "Paid (recent)", value: formatMoney(totalPaid) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user.name ? `, ${user.name}` : ""}`}
        subtitle={
          onboarded
            ? `${profile?.jobTitle ?? "Employee"}${profile?.department ? ` · ${profile.department}` : ""}`
            : "Your account is set up. An administrator will complete your onboarding shortly."
        }
        action={<ButtonLink href="/wallet">Withdraw</ButtonLink>}
      />

      {onboarded && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Employment:</span>
          <Badge tone={profile?.employmentStatus === "EMPLOYED" ? "green" : "yellow"}>
            {profile?.employmentStatus}
          </Badge>
          {profile?.kycStatus !== "APPROVED" && (
            <span className="text-amber-600">
              · Verify your identity to enable withdrawals →{" "}
              <a href="/kyc" className="font-medium underline">
                Verification
              </a>
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Recent salary payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-600">{p.description ?? "Salary payment"}</td>
                  <td className="py-2 text-right text-slate-400">
                    {p.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-2 text-right font-medium text-green-700">
                    +{formatMoney(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
