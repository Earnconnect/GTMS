import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getPaymentProvider } from "@/server/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/connect
 *
 * Initiates (or resumes) Stripe Connect Express onboarding for a worker.
 * Redirects to the Stripe-hosted onboarding flow.
 * Also used as the refresh_url if onboarding is incomplete.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = getPaymentProvider();
  if (!provider.ensurePayee) {
    return NextResponse.json({ error: "Connect not supported by current payment provider" }, { status: 400 });
  }

  try {
    const result = await provider.ensurePayee(session.user.id);

    if (result.ready) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.redirect(`${appUrl}/wallet?stripe_connected=1`);
    }

    if (result.onboardingUrl) {
      return NextResponse.redirect(result.onboardingUrl);
    }

    return NextResponse.json({ error: "Could not generate onboarding URL" }, { status: 500 });
  } catch (err) {
    console.error("[stripe/connect]", err);
    return NextResponse.json({ error: "Stripe Connect error" }, { status: 500 });
  }
}
