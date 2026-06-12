import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { generateMfaSetup } from "@/server/services/mfa.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, mfaEnabled: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.mfaEnabled) {
    return NextResponse.json({ error: "MFA already enabled" }, { status: 400 });
  }

  const { secret, qrDataUrl } = await generateMfaSetup(session.user.id, user.email);
  return NextResponse.json({ secret, qrDataUrl });
}
