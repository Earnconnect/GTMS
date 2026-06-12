import type {
  MembershipTier,
  CareerLevel,
  WorkerCertStatus,
  CertificationSlug,
  TaskCategory,
} from "@/generated/prisma";
import { tierOrdinal } from "@/lib/membership";
import { levelOrdinal } from "@/lib/career";

interface WorkerProfile {
  role: string;
  kycStatus: string;
  careerLevel: CareerLevel;
  accuracyScore: number;
  membershipTier?: MembershipTier | null;
  gtmsPassActive?: boolean;
  certifications: Array<{
    status: WorkerCertStatus;
    certification: { slug: CertificationSlug };
  }>;
}

interface TaskRequirements {
  category: TaskCategory;
  requiredMembershipTier: MembershipTier;
  requiredCareerLevel: CareerLevel;
  requiredCertifications: string[];
  minAccuracyScore: number;
  rewardPerUnitCents: number;
}

export function canAccessTask(
  worker: WorkerProfile,
  task: TaskRequirements
): { allowed: boolean; reason?: string } {
  const effectiveTier: MembershipTier = worker.membershipTier ?? "BASIC";

  // Combination VIP tasks require GTMS Pass and 80%+ accuracy
  if (task.category === "COMBINATION") {
    if (!worker.gtmsPassActive) {
      return { allowed: false, reason: "Requires GTMS Pass ($300)" };
    }
    if (worker.accuracyScore < 80) {
      return {
        allowed: false,
        reason: `VIP tasks require 80%+ accuracy (yours: ${Math.round(worker.accuracyScore)}%)`,
      };
    }
  }

  if (tierOrdinal(effectiveTier) < tierOrdinal(task.requiredMembershipTier)) {
    return { allowed: false, reason: `Requires ${task.requiredMembershipTier} membership` };
  }

  if (levelOrdinal(worker.careerLevel) < levelOrdinal(task.requiredCareerLevel)) {
    return { allowed: false, reason: `Requires ${task.requiredCareerLevel} career level` };
  }

  if (worker.accuracyScore < task.minAccuracyScore) {
    return {
      allowed: false,
      reason: `Requires ${task.minAccuracyScore}% accuracy score`,
    };
  }

  if (task.rewardPerUnitCents > 500 && worker.kycStatus !== "APPROVED") {
    return { allowed: false, reason: "KYC verification required for high-value tasks" };
  }

  for (const slug of task.requiredCertifications) {
    const cert = worker.certifications.find(
      (c) => c.certification.slug === slug && c.status === "PASSED"
    );
    if (!cert) {
      return { allowed: false, reason: `Requires ${slug} certification` };
    }
  }

  return { allowed: true };
}
