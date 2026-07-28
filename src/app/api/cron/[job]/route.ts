import { NextResponse } from "next/server";
import { expireReservations } from "@/server/services/assignment.service";
import { autoApproveExpired } from "@/server/services/review.service";

/**
 * Scheduled jobs. Call with a Bearer token matching CRON_SECRET, e.g.
 *   GET /api/cron/expire-reservations
 *   GET /api/cron/auto-approve
 * Configure these in Vercel Cron or any external scheduler.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job } = await params;

  switch (job) {
    case "expire-reservations": {
      const count = await expireReservations();
      return NextResponse.json({ job, expired: count });
    }
    case "auto-approve": {
      const count = await autoApproveExpired();
      return NextResponse.json({ job, approved: count });
    }
    default:
      return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 404 });
  }
}
