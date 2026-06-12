import { requireWorker } from "@/server/rbac";
import { getCertificationCatalog, getWorkerCertifications } from "@/server/services/certification.service";
import { Badge, Button, EmptyState, StatCard } from "@/components/ui";
import Link from "next/link";
import { Award, BookOpen, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const CERT_DESCRIPTIONS: Record<string, string> = {
  PRODUCT_REVIEW: "Evaluate product listings, descriptions, images, and pricing for quality and accuracy.",
  COMMERCE_OPS: "Support e-commerce operations including order validation and fulfillment verification.",
  VERIFICATION: "Perform transaction verification, merchant validation, and compliance checks.",
  AI_EVALUATION: "Label data, evaluate AI outputs, and perform classification tasks.",
};

const CERT_ICONS: Record<string, React.ReactNode> = {
  PRODUCT_REVIEW: <BookOpen className="w-5 h-5" />,
  COMMERCE_OPS: <CheckCircle2 className="w-5 h-5" />,
  VERIFICATION: <Award className="w-5 h-5" />,
  AI_EVALUATION: <Clock className="w-5 h-5" />,
};

export default async function CertificationsPage() {
  const user = await requireWorker();

  const [catalog, workerCerts] = await Promise.all([
    getCertificationCatalog(),
    getWorkerCertifications(user.id),
  ]);

  const certMap = new Map(workerCerts.map((wc) => [wc.certificationId, wc]));

  const earned = workerCerts.filter((wc) => wc.status === "PASSED").length;
  const inProgress = workerCerts.filter((wc) => wc.status === "IN_PROGRESS").length;
  const available = catalog.length - earned;

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Certifications</h1>
        <p className="mt-1 text-[13.5px] text-slate-500">
          Earn certifications to unlock higher-paying tasks
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Earned"
          value={earned}
          sub="active certifications"
          color="emerald"
          icon={<CheckCircle2 />}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          sub="exams started"
          color="amber"
          icon={<Clock />}
        />
        <StatCard
          label="Available"
          value={available}
          sub="to unlock"
          color="cyan"
          icon={<Award />}
        />
        <StatCard
          label="Total"
          value={catalog.length}
          sub="in catalog"
          color="purple"
          icon={<BookOpen />}
        />
      </div>

      {/* Certification Cards Grid */}
      {catalog.length === 0 ? (
        <EmptyState
          title="No certifications available"
          description="Check back later for certification opportunities."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {catalog.map((cert) => {
            const workerCert = certMap.get(cert.id);
            const isPassed = workerCert?.status === "PASSED";
            const isExpired = workerCert?.status === "EXPIRED";
            const isInProgress = workerCert?.status === "IN_PROGRESS";
            const isFailed = workerCert?.status === "FAILED";

            const statusBadge = isPassed && !isExpired ? (
              <span className="bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                EARNED
              </span>
            ) : isExpired ? (
              <span className="bg-amber-50 text-amber-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                EXPIRED
              </span>
            ) : isInProgress ? (
              <span className="bg-amber-50 text-amber-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                IN PROGRESS
              </span>
            ) : isFailed ? (
              <span className="bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                FAILED
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold">
                AVAILABLE
              </span>
            );

            const iconBg = isPassed && !isExpired
              ? "bg-emerald-50"
              : isExpired || isFailed
              ? "bg-red-50"
              : isInProgress
              ? "bg-amber-50"
              : "bg-cyan-50";

            const iconColor = isPassed && !isExpired
              ? "text-emerald-500"
              : isExpired || isFailed
              ? "text-red-400"
              : isInProgress
              ? "text-amber-500"
              : "text-cyan-500";

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80 flex flex-col"
              >
                <div className="p-5 flex-1">
                  {/* Icon + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                      {CERT_ICONS[cert.slug] ?? <Award className="w-5 h-5" />}
                    </div>
                    {statusBadge}
                  </div>

                  {/* Name + Description */}
                  <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">{cert.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {CERT_DESCRIPTIONS[cert.slug] || cert.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Passing score</p>
                      <p className="text-[13px] text-slate-700 font-semibold">{cert.passingScore}%</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Valid for</p>
                      <p className="text-[13px] text-slate-700 font-semibold">{cert.validityDays}d</p>
                    </div>
                    {workerCert?.score != null && (
                      <>
                        <div className="w-px h-8 bg-slate-100" />
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">Your score</p>
                          <p className={`text-[13px] font-semibold ${isPassed ? "text-emerald-600" : "text-red-500"}`}>
                            {workerCert.score}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {isPassed && workerCert?.expiresAt && (
                    <p className="mt-2 text-[11.5px] text-slate-400">
                      Expires{" "}
                      <span className="font-medium text-slate-500">
                        {new Date(workerCert.expiresAt).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>

                {/* CTA Footer */}
                <div className="px-5 pb-5">
                  <Link href={`/dashboard/certifications/${cert.slug.toLowerCase()}`} className="block">
                    <Button
                      variant={isPassed && !isExpired ? "outline" : "primary"}
                      className="w-full h-10 justify-center gap-2"
                    >
                      {isPassed && !isExpired
                        ? "View Certificate"
                        : isExpired
                        ? "Recertify"
                        : isFailed
                        ? "Retake Exam"
                        : "Take Exam"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
