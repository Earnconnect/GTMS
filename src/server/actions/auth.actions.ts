"use server";

import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { registerSchema } from "@/server/validators/auth.schema";
import { resolveReferrer, ensureReferralCode } from "@/server/services/referral.service";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Register a new WORKER or REQUESTER and provision their wallet.
 * Admin accounts are seed-only and cannot be created here.
 */
export async function registerUser(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    ref: formData.get("ref") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role, ref } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const referredById = ref ? await resolveReferrer(ref) : null;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      referredById,
      // Every user gets a wallet. For workers it can only ever be credited
      // by earnings and debited by payouts (enforced in wallet.service).
      wallet: { create: {} },
    },
  });

  await ensureReferralCode(user.id);

  return { ok: true };
}
