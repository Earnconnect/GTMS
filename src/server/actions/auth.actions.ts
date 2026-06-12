"use server";

import { hash } from "bcryptjs";
import { db } from "@/server/db";
import { RegisterSchema } from "@/server/validators/auth.schema";
import { signIn, signOut } from "@/server/auth";
import { ROLE_HOME, WELCOME_BONUS_CENTS } from "@/lib/constants";
import { redirect } from "next/navigation";
import { notify } from "@/server/services/notification.service";

export type ActionResult = { error?: string; success?: boolean };

function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    referralCode: formData.get("referralCode") || undefined,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, role, referralCode } = parsed.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) return { error: "Email already registered" };

  let referredById: string | undefined;
  if (referralCode) {
    const referrer = await db.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (referrer) referredById = referrer.id;
  }

  const passwordHash = await hash(password, 12);
  const newReferralCode = generateReferralCode();

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      referralCode: newReferralCode,
      referredById,
      kycStatus: "UNSUBMITTED",
      wallet: { create: { currency: "USD" } },
    },
    select: { id: true, wallet: { select: { id: true } }, role: true },
  });

  if (referredById) {
    await db.referral.create({
      data: { referrerId: referredById, refereeId: user.id },
    });
  }

  // Credit a welcome bonus to new Workers so they can start earning immediately
  if (role === "WORKER" && user.wallet?.id) {
    await db.$transaction(async (tx) => {
      await tx.walletAccount.update({
        where: { id: user.wallet!.id },
        data: { balanceCents: { increment: WELCOME_BONUS_CENTS } },
      });
      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "WELCOME_BONUS",
          amountCents: WELCOME_BONUS_CENTS,
          status: "COMPLETED",
          description: "Welcome bonus — thanks for joining GTMS Network!",
        },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { welcomeBonusClaimed: true },
      });
    });

    // Send welcome notification
    await notify({
      userId: user.id,
      type: "WELCOME_BONUS",
      title: `Welcome to GTMS Network, ${name?.split(" ")[0] ?? "there"}!`,
      body: `We've credited $${(WELCOME_BONUS_CENTS / 100).toFixed(2)} to your wallet to get you started. Complete your first 10 tasks to unlock a special offer.`,
      link: "/browse",
    }).catch(() => {});
  }

  return { success: true };
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || undefined;

  const dbUser = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Invalid email or password" };
  }

  const home = ROLE_HOME[dbUser?.role ?? "WORKER"] ?? "/dashboard";
  redirect(callbackUrl ?? home);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
