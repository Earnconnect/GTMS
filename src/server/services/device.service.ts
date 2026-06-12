import { createHash } from "crypto";
import { db } from "@/server/db";

export function computeFingerprint(userAgent: string, ip: string): string {
  return createHash("sha256")
    .update(`${userAgent}|${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export async function recordDevice(params: {
  userId: string;
  fingerprint: string;
  ipAddress: string;
}) {
  const { userId, fingerprint, ipAddress } = params;

  const existing = await db.deviceSession.findFirst({
    where: { userId, fingerprint },
  });

  if (existing) {
    return db.deviceSession.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date(), ipAddress },
    });
  }

  const [priorDevices, approvedCount] = await Promise.all([
    db.deviceSession.count({ where: { userId } }),
    db.submission.count({ where: { workerId: userId, status: "APPROVED" } }),
  ]);

  const status = priorDevices > 0 && approvedCount > 50 ? "SUSPICIOUS" : "TRUSTED";

  if (status === "SUSPICIOUS") {
    await db.fraudFlag.create({
      data: {
        userId,
        flagType: "DEVICE_CHANGE",
        severity: "LOW",
        metadata: { fingerprint, ipAddress } as never,
      },
    });
  }

  return db.deviceSession.create({
    data: { userId, fingerprint, ipAddress, status, lastSeenAt: new Date() },
  });
}

export async function blockDevice(deviceId: string) {
  return db.deviceSession.update({
    where: { id: deviceId },
    data: { status: "BLOCKED" },
  });
}
