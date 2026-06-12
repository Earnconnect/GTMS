import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";
import { logAudit } from "@/server/services/audit.service";

export async function submitKyc(params: {
  userId: string;
  docType: string;
  docNumber: string;
  docFrontUrl: string;
  docBackUrl?: string;
  selfieUrl?: string;
}) {
  const existing = await db.kycSubmission.findFirst({
    where: { userId: params.userId, status: "PENDING" },
  });
  if (existing) throw new Error("You already have a pending KYC submission");

  await db.$transaction(async (tx) => {
    await tx.kycSubmission.create({ data: { ...params, status: "PENDING" } });
    await tx.user.update({
      where: { id: params.userId },
      data: { kycStatus: "PENDING" },
    });
  });
}

export async function approveKyc(params: {
  submissionId: string;
  adminId: string;
  adminNote?: string;
}) {
  const { submissionId, adminId, adminNote } = params;

  const sub = await db.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!sub) throw new Error("KYC submission not found");
  if (sub.status !== "PENDING") throw new Error("KYC already reviewed");

  await db.$transaction(async (tx) => {
    await tx.kycSubmission.update({
      where: { id: submissionId },
      data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date(), adminNote },
    });
    await tx.user.update({
      where: { id: sub.userId },
      data: { kycStatus: "APPROVED" },
    });
  });

  await notify({
    userId: sub.userId,
    type: "KYC_APPROVED",
    title: "KYC Approved",
    body: "Your identity has been verified. You can now request payouts.",
    link: "/dashboard/wallet",
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "KYC_APPROVED",
    targetType: "User",
    targetId: sub.userId,
  });
}

export async function rejectKyc(params: {
  submissionId: string;
  adminId: string;
  adminNote: string;
}) {
  const { submissionId, adminId, adminNote } = params;

  const sub = await db.kycSubmission.findUnique({ where: { id: submissionId } });
  if (!sub) throw new Error("KYC submission not found");

  await db.$transaction(async (tx) => {
    await tx.kycSubmission.update({
      where: { id: submissionId },
      data: { status: "REJECTED", reviewedById: adminId, reviewedAt: new Date(), adminNote },
    });
    await tx.user.update({
      where: { id: sub.userId },
      data: { kycStatus: "REJECTED" },
    });
  });

  await notify({
    userId: sub.userId,
    type: "KYC_REJECTED",
    title: "KYC Rejected",
    body: adminNote || "Your KYC submission has been rejected. Please resubmit.",
    link: "/dashboard/kyc",
  });
}
