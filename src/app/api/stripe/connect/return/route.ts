import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/connect/return
 *
 * Stripe redirects workers here after completing Connect onboarding.
 * The account may or may not be fully verified yet (Stripe reviews async).
 * Just redirect to the wallet page with a success indicator.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/wallet?stripe_connected=1`);
}
