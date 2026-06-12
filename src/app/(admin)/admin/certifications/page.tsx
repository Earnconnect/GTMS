import { requireAdmin } from "@/server/rbac";
import { db } from "@/server/db";
import { PageHeader, Card, CardContent, Badge } from "@/components/ui";

export default async function AdminCertificationsPage() {
  await requireAdmin();

  const certifications = await db.certification.findMany({
    orderBy: { slug: "asc" },
  });

  const certStats = await Promise.all(
    certifications.map(async (cert) => {
      const [passed, failed, inProgress] = await Promise.all([
        db.workerCertification.count({ where: { certificationId: cert.id, status: "PASSED" } }),
        db.workerCertification.count({ where: { certificationId: cert.id, status: "FAILED" } }),
        db.workerCertification.count({ where: { certificationId: cert.id, status: "IN_PROGRESS" } }),
      ]);
      return { cert, passed, failed, inProgress };
    })
  );

  return (
    <div>
      <PageHeader
        title="Certifications"
        description="Manage certification catalog and worker qualification stats"
      />

      <div className="space-y-4">
        {certStats.map(({ cert, passed, failed, inProgress }) => {
          const total = passed + failed + inProgress;

          return (
            <Card key={cert.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                      <Badge variant="default">{cert.slug}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{cert.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Passing Score</p>
                        <p className="font-semibold text-gray-900">{cert.passingScore}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Min Accuracy</p>
                        <p className="font-semibold text-gray-900">{cert.requiredAccuracyScore}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Valid For</p>
                        <p className="font-semibold text-gray-900">{cert.validityDays} days</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Earned</p>
                        <p className="font-semibold text-green-600">{passed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {total > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm">
                    <span>
                      <span className="text-green-600 font-medium">{passed}</span>
                      <span className="text-gray-400 ml-1">passed</span>
                    </span>
                    <span>
                      <span className="text-red-600 font-medium">{failed}</span>
                      <span className="text-gray-400 ml-1">failed</span>
                    </span>
                    <span>
                      <span className="text-yellow-600 font-medium">{inProgress}</span>
                      <span className="text-gray-400 ml-1">in progress</span>
                    </span>
                    <span className="text-gray-400">
                      {Math.round((passed / total) * 100)}% pass rate
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
