"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth";
import { registerUser } from "@/server/actions/auth.actions";

/** Register, then immediately sign the new user in. Returns an error or redirects. */
export async function registerAction(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const result = await registerUser(formData);
  if (!result.ok) return result.error;

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but automatic sign-in failed. Please sign in.";
    }
    throw error;
  }
  return undefined;
}
