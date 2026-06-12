import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/unauthorized");
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireWorker() {
  return requireRole("WORKER");
}

export async function requireBusiness() {
  return requireRole("BUSINESS");
}
