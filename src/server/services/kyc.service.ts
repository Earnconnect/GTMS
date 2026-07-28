import { db } from "@/server/db";
import { notify } from "./notification.service";

export class KycError extends Error {}

/** Submit (or resubmit) KYC details. Sets the user's status to PENDING. */
export async function submitKyc(
  userId: string,
  data: { fullName: string; country: string; docType: string; docNumber: string },
) {
  if (!data.fullName.trim() || !data.docNumber.trim()) {
    throw new KycError("Full name and document number are required");
  }

  await db.$transaction(async (tx) => {
    await tx.kycSubmission.upsert({
      where: { userId },
      create: { userId, ...data, status: "PENDING" },
      update: { ...data, status: "PENDING", rejectReason: null },
    });
    await tx.user.update({ where: { id: userId }, data: { kycStatus: "PENDING" } });
  });
}

/** Admin reviews a KYC submission. */
export async function reviewKyc(
  userId: string,
  adminId: string,
  approve: boolean,
  reason?: string,
) {
  const submission = await db.kycSubmission.findUnique({ where: { userId } });
  if (!submission) throw new KycError("No KYC submission found");

  const status = approve ? "APPROVED" : "REJECTED";
  await db.$transaction(async (tx) => {
    await tx.kycSubmission.update({
      where: { userId },
      data: {
        status,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectReason: approve ? null : (reason ?? "Not provided"),
      },
    });
    await tx.user.update({ where: { id: userId }, data: { kycStatus: status } });
    await notify(
      userId,
      "SYSTEM",
      approve ? "Identity verified" : "Identity verification rejected",
      {
        body: approve
          ? "You can now withdraw your earnings."
          : `Reason: ${reason ?? "Not provided"}. You may resubmit.`,
        link: "/wallet",
        tx,
      },
    );
  });
}
