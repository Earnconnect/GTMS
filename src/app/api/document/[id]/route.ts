import { NextResponse } from "next/server";
import { currentUser } from "@/server/rbac";
import { db } from "@/server/db";

/**
 * Serves an uploaded onboarding document. Access is limited to the document
 * owner and admins. Private Blob files are streamed server-side with the store
 * token (never exposed to the browser); external links redirect.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await db.onboardingDocument.findUnique({
    where: { id },
    select: { userId: true, fileUrl: true, fileName: true },
  });
  if (!doc?.fileUrl) return NextResponse.json({ error: "No file on record" }, { status: 404 });
  if (me.id !== doc.userId && me.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!doc.fileUrl.includes(".blob.vercel-storage.com")) {
    return NextResponse.redirect(doc.fileUrl);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Storage not configured" }, { status: 500 });

  const upstream = await fetch(doc.fileUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Unable to load document" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "application/octet-stream");
  headers.set("Content-Disposition", `inline; filename="${doc.fileName ?? "document"}"`);
  headers.set("Cache-Control", "private, no-store");
  return new NextResponse(upstream.body, { headers });
}
