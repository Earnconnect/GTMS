// Client-safe role helpers (no server imports). Source of truth for RBAC is on the server.
import type { Role } from "@prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  WORKER: "/dashboard",
  REQUESTER: "/requester",
  ADMIN: "/admin",
};

export function isAdmin(role?: Role | null): boolean {
  return role === "ADMIN";
}

export function isRequester(role?: Role | null): boolean {
  return role === "REQUESTER" || role === "ADMIN";
}

export function isWorker(role?: Role | null): boolean {
  return role === "WORKER";
}

/**
 * Guardrail: only requesters (and admins) may ever add funds.
 * Workers can never deposit — money flows requester -> worker only.
 */
export function canDeposit(role?: Role | null): boolean {
  return role === "REQUESTER" || role === "ADMIN";
}
