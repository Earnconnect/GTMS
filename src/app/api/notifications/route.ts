import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getUnreadCount } from "@/server/services/notification.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ count: 0 });
  }
  const count = await getUnreadCount(session.user.id);
  return NextResponse.json({ count });
}
