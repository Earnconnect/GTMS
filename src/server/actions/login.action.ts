"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth";

/** Server action for the login form. Returns an error string or redirects. */
export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    // Re-throw redirect (and other) control-flow errors.
    throw error;
  }
  return undefined;
}
