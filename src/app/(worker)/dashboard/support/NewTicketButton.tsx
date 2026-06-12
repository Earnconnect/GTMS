"use client";

import { useActionState, useState } from "react";
import { createTicketAction } from "@/server/actions/support.actions";
import { Button, Input, Textarea, FormField, Alert } from "@/components/ui";

export default function NewTicketButton() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(createTicketAction, {});

  if (state.success && state.ticketId) {
    window.location.href = `/dashboard/support/${state.ticketId}`;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        New Ticket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Support Ticket</h2>

            {state.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

            <form action={action} className="space-y-4">
              <FormField label="Subject" required>
                <Input name="subject" placeholder="Brief description of your issue" required />
              </FormField>
              <FormField label="Message" required>
                <Textarea name="body" rows={4} placeholder="Describe your issue in detail..." required />
              </FormField>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" loading={isPending}>
                  Submit
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
