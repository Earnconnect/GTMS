import { db } from "@/server/db";
import type { NotificationType } from "@/generated/prisma";

export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return db.notification.create({ data: params });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, readAt: null },
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
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
