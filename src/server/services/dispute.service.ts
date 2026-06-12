import { db } from "@/server/db";
import { logAudit } from "@/server/services/audit.service";
import { notify } from "@/server/services/notification.service";

export async function openDispute(params: {
  openedById: string;
  reason: string;
  taskId?: string;
  submissionId?: string;
}) {
  return db.dispute.create({ data: { ...params, status: "OPEN" } });
}

export async function postDisputeMessage(params: {
  disputeId: string;
  authorId: string;
  body: string;
}) {
  const msg = await db.disputeMessage.create({ data: params });

  const dispute = await db.dispute.findUnique({ where: { id: params.disputeId } });
  if (dispute && dispute.openedById !== params.authorId) {
    await notify({
      userId: dispute.openedById,
      type: "DISPUTE_UPDATE",
      title: "Dispute Update",
      body: "A new message has been added to your dispute.",
      link: `/dashboard/disputes/${params.disputeId}`,
    });
  }

  return msg;
}

export async function resolveDispute(params: {
  disputeId: string;
  adminId: string;
  resolution: string;
}) {
  const { disputeId, adminId, resolution } = params;

  const dispute = await db.dispute.update({
    where: { id: disputeId },
    data: { status: "RESOLVED", resolvedById: adminId, resolvedAt: new Date(), resolution },
  });

  await notify({
    userId: dispute.openedById,
    type: "DISPUTE_UPDATE",
    title: "Dispute Resolved",
    body: `Your dispute has been resolved: ${resolution}`,
    link: `/dashboard/disputes/${disputeId}`,
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "DISPUTE_RESOLVED",
    targetType: "Dispute",
    targetId: disputeId,
    metadata: { resolution },
  });

  return dispute;
}
