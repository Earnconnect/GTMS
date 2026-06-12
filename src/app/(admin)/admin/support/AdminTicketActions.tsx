"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function AdminTicketActions({ ticketId, userId }: { ticketId: string; userId: string }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const send = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("ticketId", ticketId);
      fd.set("body", reply);
      // Import dynamically to avoid issues
      const { postTicketMessageAction } = await import("@/server/actions/support.actions");
      await postTicketMessageAction({}, fd);
      setReply("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      <Input
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Reply to user..."
        className="flex-1 text-sm"
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <Button onClick={send} loading={loading} variant="secondary">Reply</Button>
    </div>
  );
}
