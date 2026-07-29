import { NextResponse } from "next/server";
import { currentUser } from "@/server/rbac";
import { db } from "@/server/db";

/**
 * Serves an employee's CV. Access is limited to the CV owner and admins.
 * For a private Blob URL we fetch it server-side with the store token and
 * stream it back — the token never reaches the browser. External links (a
 * pasted URL) are redirected to directly.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.id !== userId && me.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { cvUrl: true, cvFileName: true },
  });
  if (!user?.cvUrl) return NextResponse.json({ error: "No CV on file" }, { status: 404 });

  // External link (not a Blob URL) — just redirect.
  if (!user.cvUrl.includes(".blob.vercel-storage.com")) {
    return NextResponse.redirect(user.cvUrl);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

  const upstream = await fetch(user.cvUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Unable to load CV" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "application/octet-stream");
  headers.set("Content-Disposition", `inline; filename="${user.cvFileName ?? "cv"}"`);
  headers.set("Cache-Control", "private, no-store");
  return new NextResponse(upstream.body, { headers });
}
