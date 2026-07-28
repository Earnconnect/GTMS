import { db } from "@/server/db";
import { notify } from "./notification.service";

export class SupportError extends Error {}

export async function createTicket(userId: string, subject: string, body: string) {
  if (!subject.trim() || !body.trim()) {
    throw new SupportError("Subject and message are required");
  }
  return db.supportTicket.create({
    data: {
      userId,
      subject: subject.trim(),
      status: "OPEN",
      messages: { create: { authorId: userId, body: body.trim(), isStaff: false } },
    },
  });
}

export async function postTicketMessage(
  ticketId: string,
  authorId: string,
  body: string,
  isStaff: boolean,
) {
  if (!body.trim()) throw new SupportError("Message cannot be empty");
  const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new SupportError("Ticket not found");
  if (!isStaff && ticket.userId !== authorId) {
    throw new SupportError("Not your ticket");
  }
  if (ticket.status === "CLOSED") throw new SupportError("Ticket is closed");

  await db.$transaction(async (tx) => {
    await tx.ticketMessage.create({
      data: { ticketId, authorId, body: body.trim(), isStaff },
    });
    await tx.supportTicket.update({
      where: { id: ticketId },
      data: { status: isStaff ? "PENDING" : "OPEN" },
    });
    if (isStaff) {
      await notify(ticket.userId, "SYSTEM", "Support replied to your ticket", {
        body: ticket.subject,
        link: "/support",
        tx,
      });
    }
  });
}

export async function closeTicket(ticketId: string) {
  return db.supportTicket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });
}
