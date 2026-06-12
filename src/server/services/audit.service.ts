"use server";

import { db } from "@/server/db";
import type { Prisma, Role } from "@/generated/prisma";

export async function logAudit(params: {
  actorId: string;
  actorRole: Role;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: params.ipAddress,
    },
  });
}
