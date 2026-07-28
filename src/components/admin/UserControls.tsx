"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role, UserStatus } from "@prisma/client";
import { setUserRoleAction, setUserStatusAction } from "@/server/actions/admin.actions";
import { Button, Select } from "@/components/ui";

export function UserControls({
  userId,
  role,
  status,
}: {
  userId: string;
  role: Role;
  status: UserStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={role}
        disabled={pending}
        onChange={(e) => run(() => setUserRoleAction(userId, e.target.value as Role))}
        className="w-36"
      >
        <option value="WORKER">WORKER</option>
        <option value="REQUESTER">REQUESTER</option>
        <option value="ADMIN">ADMIN</option>
      </Select>
      {status === "ACTIVE" ? (
        <Button
          variant="danger"
          disabled={pending}
          onClick={() => run(() => setUserStatusAction(userId, "SUSPENDED"))}
        >
          Suspend
        </Button>
      ) : (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => setUserStatusAction(userId, "ACTIVE"))}
        >
          Reactivate
        </Button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
