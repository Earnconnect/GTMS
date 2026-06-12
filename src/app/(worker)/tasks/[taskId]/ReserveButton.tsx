"use client";

import { useState } from "react";
import { reserveTaskAction } from "@/server/actions/task.actions";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function ReserveButton({ taskId }: { taskId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const reserve = async () => {
    setLoading(true);
    setError(null);
    const result = await reserveTaskAction(taskId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.assignmentId) {
      router.push(`/work/${result.assignmentId}`);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <Button onClick={reserve} loading={loading} className="w-full">
        Reserve & Start Working
      </Button>
    </div>
  );
}
