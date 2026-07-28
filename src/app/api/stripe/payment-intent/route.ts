import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/server/auth";
import { getPaymentProvider } from "@/server/payments";

export const runtime = "nodejs";

/**
 * POST /api/stripe/payment-intent
 * Body: { amountCents: number }
 *
 * Creates a Stripe PaymentIntent and returns its client_secret so the browser
 * can confirm the payment with Stripe Elements. Requester-only.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "REQUESTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let amountCents: number;
  try {
    const body = await req.json();
    amountCents = Number(body.amountCents);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "amountCents must be a positive integer" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const result = await provider.charge({
    userId: session.user.id,
    amountCents,
    idempotencyKey: randomUUID(),
    description: "GTMS account deposit",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const raw = result.raw as { clientSecret: string };
  return NextResponse.json({ clientSecret: raw.clientSecret, providerRef: result.providerRef });
}
