"use client";

import { useState } from "react";
import { publishTaskAction } from "@/server/actions/task.actions";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function TaskControls({
  task,
  userId,
}: {
  task: { id: string; status: string; requesterId: string };
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (task.requesterId !== userId) return null;

  const publish = async () => {
    setLoading(true);
    const result = await publishTaskAction(task.id);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      {task.status === "DRAFT" && (
        <Button onClick={publish} loading={loading} variant="primary">
          Publish Task
        </Button>
      )}
      {task.status === "ACTIVE" && (
        <span className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg">
          Live
        </span>
      )}
    </div>
  );
}
