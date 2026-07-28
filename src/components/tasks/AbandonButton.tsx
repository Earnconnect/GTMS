"use client";

import { useTransition } from "react";
import { abandonUnitAction } from "@/server/actions/assignment.actions";
import { Button } from "@/components/ui";

export function AbandonButton({ assignmentId }: { assignmentId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={() => start(() => abandonUnitAction(assignmentId))}
    >
      Give up unit
    </Button>
  );
}
