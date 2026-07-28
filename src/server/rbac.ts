import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/server/auth";
import { ROLE_HOME } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
};

/** Returns the current session user or null. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

/** Require any authenticated, non-banned user. Redirects to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.status === "BANNED") redirect("/login?error=banned");
  return user;
}

/** Require a specific role (admins always pass). Redirects on mismatch. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  if (!roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}

/** Require an authenticated user permitted to perform mutations. */
export async function requireActiveUser(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.status !== "ACTIVE") {
    throw new Error("Your account is not active and cannot perform this action.");
  }
  return user;
}

/** Throw unless the current user owns the resource (or is an admin). */
export function assertOwner(ownerId: string, user: SessionUser): void {
  if (user.role === "ADMIN") return;
  if (ownerId !== user.id) {
    throw new Error("You do not have permission to access this resource.");
  }
}
