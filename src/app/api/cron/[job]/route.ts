import { NextRequest, NextResponse } from "next/server";
import { expireReservations } from "@/server/services/assignment.service";
import { autoApproveExpired } from "@/server/services/review.service";
import { snapshotLeaderboard } from "@/server/services/leaderboard.service";
import { db } from "@/server/db";

function authCheck(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ job: string }> }
) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job } = await params;

  try {
    switch (job) {
      case "expire-reservations": {
        const count = await expireReservations();
        return NextResponse.json({ ok: true, expired: count });
      }
      case "auto-approve": {
        const count = await autoApproveExpired();
        return NextResponse.json({ ok: true, autoApproved: count });
      }
      case "leaderboard-snapshot": {
        await Promise.all([
          snapshotLeaderboard("WEEKLY"),
          snapshotLeaderboard("MONTHLY"),
          snapshotLeaderboard("ALL_TIME"),
        ]);
        return NextResponse.json({ ok: true });
      }
      case "cert-expiry-check": {
        const now = new Date();
        const expired = await db.workerCertification.updateMany({
          where: { status: "PASSED", expiresAt: { lt: now } },
          data: { status: "EXPIRED" },
        });
        return NextResponse.json({ ok: true, expired: expired.count });
      }
      default:
        return NextResponse.json({ error: "Unknown job" }, { status: 404 });
    }
  } catch (e) {
    console.error(`Cron job ${job} failed:`, e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Job failed" },
      { status: 500 }
    );
  }
}
