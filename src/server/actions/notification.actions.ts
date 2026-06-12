"use server";

import { auth } from "@/server/auth";
import { markAllRead } from "@/server/services/notification.service";
import { revalidatePath } from "next/cache";

export async function markAllReadAction() {
  const session = await auth();
  if (!session?.user?.id) return;
  await markAllRead(session.user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/business/notifications");
  revalidatePath("/admin/notifications");
}
