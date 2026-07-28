import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { KycForm } from "@/components/kyc/KycForm";

export default async function KycPage() {
  const user = await requireRole("WORKER");
  const me = await db.user.findUnique({
    where: { id: user.id },
    select: { kycStatus: true, kyc: true },
  });

  const status = me?.kycStatus ?? "NONE";

  return (
    <div>
      <PageHeader
        title="Identity verification (KYC)"
        subtitle="A one-time, free identity check required before withdrawing. It does not affect your access to tasks or earnings."
        action={status !== "NONE" ? <StatusBadge status={status} /> : undefined}
      />

      {status === "APPROVED" ? (
        <Card>
          <p className="text-sm text-green-700">
            Your identity is verified. You can withdraw your earnings from the
            Wallet page.
          </p>
        </Card>
      ) : (
        <Card>
          {status === "PENDING" && (
            <p className="mb-4 text-sm text-amber-600">
              Your submission is under review. You can resubmit if anything was
              incorrect.
            </p>
          )}
          {status === "REJECTED" && me?.kyc?.rejectReason && (
            <p className="mb-4 text-sm text-red-600">
              Rejected: {me.kyc.rejectReason}. Please correct and resubmit.
            </p>
          )}
          <KycForm />
        </Card>
      )}
    </div>
  );
}
