"use server";

import { revalidatePath } from "next/cache";
import type { EmploymentStatus, Role, UserStatus } from "@prisma/client";
import { requireRole } from "@/server/rbac";
import { db } from "@/server/db";
import { processPayout, cancelPayout } from "@/server/services/payout.service";
import { paySalary } from "@/server/services/payroll.service";

export type ActionResult = { error?: string; ok?: boolean };

export async function setUserRoleAction(
  userId: string,
  role: Role,
): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.user.update({ where: { id: userId }, data: { role } });
    // Ensure the user has a wallet after a role change.
    const wallet = await db.walletAccount.findUnique({ where: { userId } });
    if (!wallet) await db.walletAccount.create({ data: { userId } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update role" };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserStatusAction(
  userId: string,
  status: UserStatus,
): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.user.update({ where: { id: userId }, data: { status } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update status" };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Onboard an existing account as an employee: sets their employment profile and
 * marks them EMPLOYED. The person must already have registered (direct
 * onboarding model — no public application flow).
 */
export async function onboardEmployeeAction(input: {
  userId: string;
  jobTitle: string;
  department?: string;
  salaryCents: number;
}): Promise<ActionResult> {
  await requireRole("ADMIN");
  const jobTitle = input.jobTitle.trim();
  if (!jobTitle) return { error: "Job title is required." };
  if (!Number.isInteger(input.salaryCents) || input.salaryCents < 0) {
    return { error: "Salary must be a non-negative whole number of cents." };
  }
  try {
    await db.user.update({
      where: { id: input.userId },
      data: {
        jobTitle,
        department: input.department?.trim() || null,
        salaryCents: input.salaryCents,
        employmentStatus: "EMPLOYED",
        hiredAt: new Date(),
        role: "WORKER", // internal role: "employee". Kept as WORKER to reuse RBAC.
      },
    });
    const wallet = await db.walletAccount.findUnique({ where: { userId: input.userId } });
    if (!wallet) await db.walletAccount.create({ data: { userId: input.userId } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not onboard employee" };
  }
  revalidatePath("/admin/employees");
  return { ok: true };
}

/** Update an employee's employment status (e.g. suspend or terminate). */
export async function setEmploymentStatusAction(
  userId: string,
  employmentStatus: EmploymentStatus,
): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await db.user.update({ where: { id: userId }, data: { employmentStatus } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update employment status" };
  }
  revalidatePath("/admin/employees");
  return { ok: true };
}

/** Pay an employee a manual salary amount (dollars entered in the UI). */
export async function paySalaryAction(input: {
  employeeId: string;
  amountCents: number;
  note?: string;
}): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  try {
    await paySalary({
      adminId: admin.id,
      employeeId: input.employeeId,
      amountCents: input.amountCents,
      note: input.note,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not pay salary" };
  }
  revalidatePath("/admin/employees");
  revalidatePath("/admin/ledger");
  return { ok: true };
}

export async function processPayoutAction(payoutId: string): Promise<ActionResult> {
  const admin = await requireRole("ADMIN");
  try {
    await processPayout(payoutId, admin.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not process payout" };
  }
  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function cancelPayoutAction(payoutId: string): Promise<ActionResult> {
  await requireRole("ADMIN");
  try {
    await cancelPayout(payoutId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not cancel payout" };
  }
  revalidatePath("/admin/payouts");
  return { ok: true };
}
