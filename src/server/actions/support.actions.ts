"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/server/rbac";
import { db } from "@/server/db";
import {
  createTicket,
  postTicketMessage,
  closeTicket,
} from "@/server/services/support.service";

export type FormState = { error?: string; ok?: boolean } | undefined;
export type ActionResult = { error?: string; ok?: boolean };

export async function createTicketAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireActiveUser();
  try {
    await createTicket(
      user.id,
      String(formData.get("subject") ?? ""),
      String(formData.get("body") ?? ""),
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create ticket" };
  }
  revalidatePath("/support");
  revalidatePath("/requester/support");
  return { ok: true };
}

export async function replyTicketAction(
  ticketId: string,
  body: string,
): Promise<ActionResult> {
  const user = await requireActiveUser();
  const isStaff = user.role === "ADMIN";
  // Non-staff may only reply to their own ticket (enforced in the service).
  try {
    await postTicketMessage(ticketId, user.id, body, isStaff);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not reply" };
  }
  revalidatePath("/support");
  revalidatePath("/requester/support");
  revalidatePath("/admin/support");
  return { ok: true };
}

export async function closeTicketAction(ticketId: string): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    if (user.role !== "ADMIN") {
      const t = await db.supportTicket.findUnique({
        where: { id: ticketId },
        select: { userId: true },
      });
      if (!t || t.userId !== user.id) throw new Error("Not your ticket");
    }
    await closeTicket(ticketId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not close ticket" };
  }
  revalidatePath("/support");
  revalidatePath("/requester/support");
  revalidatePath("/admin/support");
  return { ok: true };
}
