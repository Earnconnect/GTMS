import type { Prisma, NotificationType } from "@prisma/client";
import { db } from "@/server/db";

type Tx = Prisma.TransactionClient;

export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  opts?: { body?: string; link?: string; tx?: Tx },
) {
  const client = opts?.tx ?? db;
  return client.notification.create({
    data: {
      userId,
      type,
      title,
      body: opts?.body,
      link: opts?.link,
    },
  });
}

export async function listNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
