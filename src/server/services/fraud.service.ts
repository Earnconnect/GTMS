import { db } from "@/server/db";
import { createHash } from "crypto";
import type { FraudSeverity, Prisma } from "@/generated/prisma";

export function computeFingerprint(userAgent: string, ip: string, acceptLanguage?: string): string {
  const raw = `${userAgent}|${ip}|${acceptLanguage ?? ""}`;
  return createHash("sha256").update(raw).digest("hex");
}

export async function recordDevice(params: {
  userId: string;
  userAgent: string;
  ipAddress: string;
  acceptLanguage?: string;
}) {
  const { userId, userAgent, ipAddress, acceptLanguage } = params;
  const fingerprint = computeFingerprint(userAgent, ipAddress, acceptLanguage);

  const existing = await db.deviceSession.findFirst({
    where: { userId, fingerprint },
  });

  if (existing) {
    await db.deviceSession.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date(), ipAddress },
    });
    return existing;
  }

  const newDevice = await db.deviceSession.create({
    data: { userId, fingerprint, ipAddress, userAgent, status: "TRUSTED" },
  });

  const completedCount = await db.submission.count({
    where: { workerId: userId, status: { in: ["APPROVED", "AUTO_APPROVED"] } },
  });

  if (completedCount > 50) {
    await createFraudFlag({
      userId,
      flagType: "DEVICE_CHANGE",
      severity: "LOW",
      metadata: { fingerprint, ipAddress, userAgent },
    });
  }

  return newDevice;
}

export async function createFraudFlag(params: {
  userId: string;
  flagType: string;
  severity: FraudSeverity;
  metadata?: Record<string, unknown>;
}) {
  return db.fraudFlag.create({
    data: {
      ...params,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function checkVelocity(workerId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const count = await db.submission.count({
    where: { workerId, createdAt: { gte: oneHourAgo } },
  });

  if (count > 30) {
    await createFraudFlag({
      userId: workerId,
      flagType: "SUSPICIOUS_VELOCITY",
      severity: "MEDIUM",
      metadata: { submissionsInLastHour: count },
    });
    return true;
  }
  return false;
}

export async function resolveFraudFlag(params: {
  flagId: string;
  adminId: string;
}) {
  return db.fraudFlag.update({
    where: { id: params.flagId },
    data: { resolvedAt: new Date(), resolvedById: params.adminId },
  });
}

export async function getUnresolvedFlags(limit = 50) {
  return db.fraudFlag.findMany({
    where: { resolvedAt: null },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
