"use client";

import { useState } from "react";
import { resolveFraudFlagAction, setUserStatusAction } from "@/server/actions/admin.actions";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function FraudFlagActions({ flagId, userId }: { flagId: string; userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resolve = async () => {
    setLoading(true);
    await resolveFraudFlagAction(flagId);
    router.refresh();
    setLoading(false);
  };

  const suspend = async () => {
    setLoading(true);
    await setUserStatusAction(userId, "SUSPENDED");
    await resolveFraudFlagAction(flagId);
    router.refresh();
    setLoading(false);
  };

  const ban = async () => {
    setLoading(true);
    await setUserStatusAction(userId, "BANNED");
    await resolveFraudFlagAction(flagId);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={resolve} loading={loading} variant="secondary">Dismiss</Button>
      <Button onClick={suspend} loading={loading} variant="outline">Suspend User</Button>
      <Button onClick={ban} loading={loading} variant="danger">Ban User</Button>
    </div>
  );
}
