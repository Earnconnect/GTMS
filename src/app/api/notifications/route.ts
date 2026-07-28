import { NextResponse } from "next/server";
import { currentUser } from "@/server/rbac";
import { listNotifications, markAllRead } from "@/server/services/notification.service";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ notifications: [] }, { status: 401 });
  const notifications = await listNotifications(user.id);
  return NextResponse.json({ notifications });
}

export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await markAllRead(user.id);
  return NextResponse.json({ ok: true });
}
