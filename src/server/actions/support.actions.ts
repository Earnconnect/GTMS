"use server";

import { requireUser } from "@/server/rbac";
import { createTicket, postTicketMessage } from "@/server/services/support.service";
import { revalidatePath } from "next/cache";

export type SupportActionResult = { error?: string; success?: boolean; ticketId?: string };

export async function createTicketAction(
  _prev: SupportActionResult,
  formData: FormData
): Promise<SupportActionResult> {
  const user = await requireUser();
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;

  if (!subject || !body) return { error: "Subject and message required" };

  try {
    const ticket = await createTicket({ userId: user.id, subject, body });
    revalidatePath("/dashboard/support");
    return { success: true, ticketId: ticket.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create ticket" };
  }
}

export async function postTicketMessageAction(
  _prev: SupportActionResult,
  formData: FormData
): Promise<SupportActionResult> {
  const user = await requireUser();
  const ticketId = formData.get("ticketId") as string;
  const body = formData.get("body") as string;

  if (!ticketId || !body) return { error: "Message body required" };

  try {
    await postTicketMessage({ ticketId, authorId: user.id, body });
    revalidatePath(`/dashboard/support/${ticketId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to post message" };
  }
}
