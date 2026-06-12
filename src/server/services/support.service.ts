import { db } from "@/server/db";
import { notify } from "@/server/services/notification.service";

export async function createTicket(params: {
  userId: string;
  subject: string;
  body: string;
}) {
  const { userId, subject, body } = params;

  const ticket = await db.supportTicket.create({
    data: { userId, subject, status: "OPEN" },
  });

  await db.ticketMessage.create({
    data: { ticketId: ticket.id, authorId: userId, body },
  });

  return ticket;
}

export async function postTicketMessage(params: {
  ticketId: string;
  authorId: string;
  body: string;
}) {
  const msg = await db.ticketMessage.create({ data: params });

  const ticket = await db.supportTicket.findUnique({ where: { id: params.ticketId } });
  if (ticket && ticket.userId !== params.authorId) {
    await notify({
      userId: ticket.userId,
      type: "SUPPORT_REPLY",
      title: "Support Reply",
      body: "Your support ticket has a new reply.",
      link: `/dashboard/support/${params.ticketId}`,
    });
  }

  return msg;
}

export async function closeTicket(ticketId: string, adminId: string) {
  return db.supportTicket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });
}
