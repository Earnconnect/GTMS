"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, MessagesSquare } from "lucide-react";
import { postAssignmentMessageAction } from "@/server/actions/work.actions";
import { Avatar, Button } from "@/components/ui";
import { clsx } from "@/lib/cn";

export type ThreadMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  authorId: string;
  authorName: string | null;
  authorEmail: string;
  createdAt: Date;
};

export function AssignmentThread({
  assignmentId,
  messages,
  meId,
}: {
  assignmentId: string;
  messages: ThreadMessage[];
  meId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function send() {
    const text = body.trim();
    if (!text) return;
    setError(null);
    start(async () => {
      const res = await postAssignmentMessageAction({ assignmentId, body: text });
      if (res.error) setError(res.error);
      else {
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
          <MessagesSquare className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          No messages yet. Start the conversation about this assignment.
        </div>
      ) : (
        <ul className="max-h-[26rem] space-y-4 overflow-y-auto pr-1">
          {messages.map((m) => {
            const mine = m.authorId === meId;
            return (
              <li key={m.id} className={clsx("flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
                <Avatar name={m.authorName} email={m.authorEmail} size={30} />
                <div className={clsx("max-w-[78%]", mine ? "items-end text-right" : "items-start")}>
                  <div className="mb-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500">
                      {mine ? "You" : m.authorName ?? m.authorEmail}
                    </span>
                    {m.isStaff && (
                      <span className="rounded-full bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">Admin</span>
                    )}
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div
                    className={clsx(
                      "inline-block whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm",
                      mine
                        ? "rounded-br-sm bg-brand-gradient text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-700",
                    )}
                  >
                    {m.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
          rows={2}
          placeholder="Write a message… (Ctrl/⌘ + Enter to send)"
          disabled={pending}
          className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
        <Button onClick={send} disabled={pending || !body.trim()} className="gap-1">
          <Send className="h-4 w-4" /> {pending ? "…" : "Send"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
