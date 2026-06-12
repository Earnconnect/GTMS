"use client";

import { useActionState } from "react";
import { postTicketMessageAction } from "@/server/actions/support.actions";
import { Button, Textarea } from "@/components/ui";

export default function ReplyForm({ ticketId }: { ticketId: string }) {
  const [, action, isPending] = useActionState(postTicketMessageAction, {});

  return (
    <form action={action} className="flex gap-2 items-end">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="flex-1">
        <Textarea name="body" rows={2} placeholder="Write a reply..." required />
      </div>
      <Button type="submit" loading={isPending} className="flex-shrink-0">
        Send
      </Button>
    </form>
  );
}
