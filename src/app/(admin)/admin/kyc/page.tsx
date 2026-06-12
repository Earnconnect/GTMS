import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import KycActions from "./KycActions";

export default async function AdminKycPage() {
  await requireAdmin();

  const pending = await db.kycSubmission.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const recent = await db.kycSubmission.findMany({
    where: { status: { not: "PENDING" } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { reviewedAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader title="KYC Review" description={`${pending.length} pending`} />

      {pending.length > 0 && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending KYC Submissions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((k) => (
              <div key={k.id} className="px-6 py-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900">{k.user.name ?? k.user.email}</p>
                  <p className="text-xs text-gray-500">{k.user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {k.docType.replace("_", " ")} · #{k.docNumber} · {new Date(k.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <a href={k.docFrontUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                      Front Doc
                    </a>
                    {k.docBackUrl && (
                      <a href={k.docBackUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                        Back Doc
                      </a>
                    )}
                    {k.selfieUrl && (
                      <a href={k.selfieUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                        Selfie
                      </a>
                    )}
                  </div>
                </div>
                <KycActions submissionId={k.id} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {recent.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((k) => (
              <div key={k.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{k.user.name ?? k.user.email}</p>
                  <p className="text-xs text-gray-400">{k.docType.replace("_", " ")}</p>
                </div>
                <Badge variant={k.status === "APPROVED" ? "success" : "danger"}>{k.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
