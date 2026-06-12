import { db } from "@/server/db";
import type { MembershipTier } from "@/generated/prisma";
import { notify } from "@/server/services/notification.service";
import { logAudit } from "@/server/services/audit.service";

export async function getEffectiveTier(userId: string): Promise<MembershipTier> {
  const membership = await db.membership.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  });

  if (!membership) return "BASIC";
  if (membership.status === "CANCELLED") return "BASIC";
  return membership.tier;
}

export async function activateMembership(params: {
  userId: string;
  tier: MembershipTier;
  adminId: string;
}) {
  const { userId, tier, adminId } = params;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.membership.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      activatedById: adminId,
    },
    update: {
      tier,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      activatedById: adminId,
      cancelAtPeriodEnd: false,
    },
  });

  await notify({
    userId,
    type: "MEMBERSHIP_ACTIVATED",
    title: "Membership Activated",
    body: `Your ${tier} membership has been activated.`,
    link: "/dashboard/membership",
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "MEMBERSHIP_ACTIVATED",
    targetType: "User",
    targetId: userId,
    metadata: { tier },
  });
}

export async function cancelMembership(params: {
  userId: string;
  adminId: string;
}) {
  const { userId, adminId } = params;

  const membership = await db.membership.findUnique({ where: { userId } });
  if (!membership) throw new Error("No active membership");

  await db.membership.update({
    where: { userId },
    data: { status: "CANCELLED", cancelAtPeriodEnd: true },
  });

  await notify({
    userId,
    type: "MEMBERSHIP_CANCELLED",
    title: "Membership Cancelled",
    body: "Your membership has been cancelled.",
    link: "/dashboard/membership",
  });

  await logAudit({
    actorId: adminId,
    actorRole: "ADMIN",
    action: "MEMBERSHIP_CANCELLED",
    targetType: "User",
    targetId: userId,
  });
}
