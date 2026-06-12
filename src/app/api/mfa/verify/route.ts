import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { verifyMfaCode, enableMfa, disableMfa } from "@/server/services/mfa.service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const valid = await verifyMfaCode(session.user.id, code as string);
  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await enableMfa(session.user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await disableMfa(session.user.id);
  return NextResponse.json({ ok: true });
}
