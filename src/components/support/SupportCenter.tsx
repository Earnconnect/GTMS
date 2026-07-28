"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTicketAction,
  replyTicketAction,
  closeTicketAction,
  type FormState,
} from "@/server/actions/support.actions";
import { Button, Card, Input, Textarea, EmptyState, Label } from "@/components/ui";
import { StatusBadge } from "@/components/tasks/StatusBadge";

export type TicketView = {
  id: string;
  subject: string;
  status: string;
  requester: string;
  messages: { id: string; author: string; body: string; isStaff: boolean; createdAt: string }[];
};

export function SupportCenter({
  tickets,
  isAdmin,
  allowCreate,
}: {
  tickets: TicketView[];
  isAdmin: boolean;
  allowCreate: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(
    async (prev, fd) => {
      const res = await createTicketAction(prev, fd);
      if (res?.ok) router.refresh();
      return res;
    },
    undefined,
  );

  return (
    <div className="space-y-6">
      {allowCreate && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">New ticket</h2>
          <form action={action} className="space-y-3">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required />
            </div>
            <div>
              <Label htmlFor="body">How can we help?</Label>
              <Textarea id="body" name="body" rows={3} required />
            </div>
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Open ticket"}
            </Button>
          </form>
        </Card>
      )}

      {tickets.length === 0 ? (
        <EmptyState>No tickets.</EmptyState>
      ) : (
        tickets.map((t) => (
          <TicketThread key={t.id} ticket={t} isAdmin={isAdmin} />
        ))
      )}
    </div>
  );
}

function TicketThread({ ticket, isAdmin }: { ticket: TicketView; isAdmin: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const closed = ticket.status === "CLOSED";

  function act(fn: () => Promise<{ error?: string; ok?: boolean }>, clear?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        clear?.();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
          {isAdmin && <p className="text-xs text-slate-400">{ticket.requester}</p>}
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="mb-3 space-y-2">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-md p-2 text-sm ${
              m.isStaff ? "bg-brand-50" : "bg-slate-50"
            }`}
          >
            <span className="font-medium text-slate-700">
              {m.author}
              {m.isStaff ? " (staff)" : ""}
            </span>
            <p className="text-slate-700">{m.body}</p>
          </div>
        ))}
      </div>

      {!closed && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Write a reply…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button
            disabled={pending || !body.trim()}
            onClick={() => act(() => replyTicketAction(ticket.id, body), () => setBody(""))}
          >
            Reply
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => act(() => closeTicketAction(ticket.id))}
          >
            Close
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
