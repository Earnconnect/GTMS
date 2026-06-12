"use client";

import { useActionState, useState } from "react";
import { openDisputeAction } from "@/server/actions/dispute.actions";
import { Button, Input, Textarea, FormField, Alert } from "@/components/ui";

export default function OpenDisputeButton() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(openDisputeAction, {});

  if (state.success && state.disputeId) {
    window.location.href = `/dashboard/disputes/${state.disputeId}`;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Open Dispute
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Open a Dispute</h2>

            {state.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

            <form action={action} className="space-y-4">
              <FormField label="Task ID (optional)">
                <Input name="taskId" placeholder="task id if related to a task" />
              </FormField>
              <FormField label="Submission ID (optional)">
                <Input name="submissionId" placeholder="submission id if related to a submission" />
              </FormField>
              <FormField label="Reason" required>
                <Textarea name="reason" rows={4} placeholder="Describe the issue..." required />
              </FormField>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" loading={isPending}>
                  Submit Dispute
                </Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
