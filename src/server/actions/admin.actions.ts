"use server";

import { requireAdmin } from "@/server/rbac";
import { approveDeposit, rejectDeposit } from "@/server/services/deposit.service";
import { processPayout, cancelPayout } from "@/server/services/payout.service";
import { activateMembership, cancelMembership } from "@/server/services/membership.service";
import { approveKyc, rejectKyc } from "@/server/services/kyc.service";
import { approveSubmission, rejectSubmission } from "@/server/services/review.service";
import { resolveDispute } from "@/server/services/dispute.service";
import { resolveFraudFlag } from "@/server/services/fraud.service";
import { logAudit } from "@/server/services/audit.service";
import { postTransaction } from "@/server/services/wallet.service";
import { notify } from "@/server/services/notification.service";
import { db } from "@/server/db";
import type { MembershipTier } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type AdminActionResult = { error?: string; success?: boolean };

export async function approveDepositAction(depositId: string, adminNote?: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await approveDeposit({ depositId, adminId: admin.id, adminNote });
    revalidatePath("/admin/deposits");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function rejectDepositAction(depositId: string, adminNote: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await rejectDeposit({ depositId, adminId: admin.id, adminNote });
    revalidatePath("/admin/deposits");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function processPayoutAction(payoutId: string, adminNote?: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await processPayout({ payoutId, adminId: admin.id, adminNote });
    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function cancelPayoutAction(payoutId: string, reason: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await cancelPayout({ payoutId, adminId: admin.id, reason });
    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function activateMembershipAction(userId: string, tier: MembershipTier): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await activateMembership({ userId, tier, adminId: admin.id });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function approveKycAction(submissionId: string, adminNote?: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await approveKyc({ submissionId, adminId: admin.id, adminNote });
    revalidatePath("/admin/kyc");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function rejectKycAction(submissionId: string, adminNote: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await rejectKyc({ submissionId, adminId: admin.id, adminNote });
    revalidatePath("/admin/kyc");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function approveSubmissionAction(submissionId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await approveSubmission({ submissionId, reviewerId: admin.id });
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function rejectSubmissionAction(submissionId: string, reason: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await rejectSubmission({ submissionId, reviewerId: admin.id, reason });
    revalidatePath("/admin/tasks");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setUserStatusAction(userId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED"): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await db.user.update({ where: { id: userId }, data: { status } });
    await logAudit({
      actorId: admin.id,
      actorRole: "ADMIN",
      action: `USER_STATUS_${status}`,
      targetType: "User",
      targetId: userId,
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function resolveDisputeAction(disputeId: string, resolution: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await resolveDispute({ disputeId, adminId: admin.id, resolution });
    revalidatePath("/admin/disputes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function resolveFraudFlagAction(flagId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await resolveFraudFlag({ flagId, adminId: admin.id });
    revalidatePath("/admin/fraud");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminApproveSubmissionAction(submissionId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await approveSubmission({ submissionId, reviewerId: admin.id });
    revalidatePath("/admin/submissions");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminRejectSubmissionAction(submissionId: string, reason: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  try {
    await rejectSubmission({ submissionId, reviewerId: admin.id, reason });
    revalidatePath("/admin/submissions");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function adminCreditAccountAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin();
  try {
    const userId = formData.get("userId") as string;
    const amountCents = Math.round(parseFloat(formData.get("amount") as string) * 100);
    const type = formData.get("type") as "ADMIN_CREDIT" | "LOAN";
    const reason = formData.get("reason") as string;

    if (!userId || isNaN(amountCents) || amountCents <= 0) {
      return { error: "Invalid input" };
    }

    const wallet = await db.walletAccount.findUnique({ where: { userId }, select: { id: true } });
    if (!wallet) return { error: "User has no wallet" };

    await postTransaction({
      walletId: wallet.id,
      type,
      amountCents,
      description: reason || `Admin ${type === "LOAN" ? "loan" : "credit"} to account`,
      metadata: { adminAction: true },
    });

    await notify({
      userId,
      type: "DEPOSIT_APPROVED",
      title: type === "LOAN" ? "Loan credited to your account" : "Account credit applied",
      body: `$${(amountCents / 100).toFixed(2)} has been added to your wallet.`,
      link: "/dashboard/wallet",
    });

    revalidatePath("/admin/users/" + userId);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}
