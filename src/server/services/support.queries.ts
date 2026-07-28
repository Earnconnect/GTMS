import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { TicketView } from "@/components/support/SupportCenter";

/** Load tickets matching a filter and map them to the client view shape. */
export async function loadTicketViews(
  where: Prisma.SupportTicketWhereInput,
): Promise<TicketView[]> {
  const tickets = await db.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true } } },
      },
    },
    take: 100,
  });

  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    requester: t.user.name ?? t.user.email,
    messages: t.messages.map((m) => ({
      id: m.id,
      author: m.author.name ?? "User",
      body: m.body,
      isStaff: m.isStaff,
      createdAt: m.createdAt.toISOString(),
    })),
  }));
}
