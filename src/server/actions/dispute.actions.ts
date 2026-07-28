"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser, requireRole, requireUser } from "@/server/rbac";
import {
  openDispute,
  postDisputeMessage,
  resolveDispute,
} from "@/server/services/dispute.service";

export type ActionResult = { error?: string; ok?: boolean };

export async function openDisputeAction(
  submissionId: string,
  reason: string,
): Promise<ActionResult> {
  const user = await requireRole("WORKER");
  await requireActiveUser();
  try {
    await openDispute(submissionId, user.id, reason);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not open dispute" };
  }
  revalidatePath("/disputes");
  revalidatePath("/submissions");
  return { ok: true };
}

export async function postDisputeMessageAction(
  disputeId: string,
  body: string,
): Promise<ActionResult> {
  const user = await requireActiveUser();
  try {
    await postDisputeMessage(disputeId, user.id, body);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not post message" };
  }
  revalidatePath("/disputes");
  revalidatePath("/requester/disputes");
  revalidatePath("/admin/disputes");
  return { ok: true };
}

export async function resolveDisputeAction(
  disputeId: string,
  decision: "WORKER" | "REQUESTER",
  note: string,
): Promise<ActionResult> {
  const user = await requireRole("ADMIN");
  await requireUser();
  try {
    await resolveDispute(disputeId, user.id, decision, note);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not resolve dispute" };
  }
  revalidatePath("/admin/disputes");
  return { ok: true };
}
