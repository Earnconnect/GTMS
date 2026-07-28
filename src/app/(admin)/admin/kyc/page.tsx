import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, EmptyState, Card } from "@/components/ui";
import { KycControls } from "@/components/admin/KycControls";

export default async function AdminKycPage() {
  await requireRole("ADMIN");
  const pending = await db.kycSubmission.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <PageHeader title="KYC review" subtitle="Approve or reject identity verifications." />
      {pending.length === 0 ? (
        <EmptyState>No pending KYC submissions.</EmptyState>
      ) : (
        <div className="space-y-3">
          {pending.map((k) => (
            <Card key={k.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm">
                  <div className="font-medium text-slate-800">
                    {k.fullName}{" "}
                    <span className="text-slate-400">({k.user.email})</span>
                  </div>
                  <div className="text-slate-500">
                    {k.country} • {k.docType} • {k.docNumber}
                  </div>
                </div>
                <KycControls userId={k.userId} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
