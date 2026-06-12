"use client";

import { useState } from "react";
import { setUserStatusAction, activateMembershipAction } from "@/server/actions/admin.actions";
import { Button, Select } from "@/components/ui";
import { useRouter } from "next/navigation";
import type { MembershipTier } from "@/generated/prisma";

export default function UserAdminControls({
  userId,
  currentStatus,
  tier,
}: {
  userId: string;
  currentStatus: string;
  tier?: MembershipTier;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(tier ?? "BASIC");

  const setStatus = async (status: "ACTIVE" | "SUSPENDED" | "BANNED") => {
    setLoading(true);
    await setUserStatusAction(userId, status);
    router.refresh();
    setLoading(false);
  };

  const activateMembership = async () => {
    setLoading(true);
    await activateMembershipAction(userId, selectedTier);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Account Status</p>
        <div className="flex gap-2 flex-wrap">
          {currentStatus !== "ACTIVE" && (
            <Button onClick={() => setStatus("ACTIVE")} loading={loading} variant="secondary">
              Activate
            </Button>
          )}
          {currentStatus !== "SUSPENDED" && (
            <Button onClick={() => setStatus("SUSPENDED")} loading={loading} variant="outline">
              Suspend
            </Button>
          )}
          {currentStatus !== "BANNED" && (
            <Button onClick={() => setStatus("BANNED")} loading={loading} variant="danger">
              Ban
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Activate Membership</p>
        <div className="flex gap-2">
          <Select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as MembershipTier)}
            className="flex-1"
          >
            <option value="BASIC">Basic</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="EXECUTIVE">Executive</option>
          </Select>
          <Button onClick={activateMembership} loading={loading} variant="secondary">
            Activate
          </Button>
        </div>
      </div>
    </div>
  );
}
