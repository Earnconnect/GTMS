import { NextResponse } from "next/server";
import Stripe from "stripe";
import { creditDeposit } from "@/server/services/wallet.service";

export const runtime = "nodejs";

// Must not parse the body — Stripe signature verification needs the raw bytes.
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events. Register this URL in your Stripe dashboard
 * and set STRIPE_WEBHOOK_SECRET to the signing secret.
 *
 * Events handled:
 *   payment_intent.succeeded → credit requester wallet balance.
 */
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    console.error("[stripe/webhook] signature verification failed:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { userId, amountCents } = intent.metadata ?? {};

      if (!userId || !amountCents) {
        console.warn("[stripe/webhook] payment_intent.succeeded missing metadata", intent.id);
        break;
      }

      try {
        await creditDeposit(userId, parseInt(amountCents, 10), intent.id);
        console.log(`[stripe/webhook] credited ${amountCents}¢ to user ${userId} (${intent.id})`);
      } catch (err) {
        console.error("[stripe/webhook] creditDeposit failed:", err);
        // Return 500 so Stripe retries.
        return new Response("Internal error — will retry", { status: 500 });
      }
      break;
    }

    default:
      // Ignore unhandled events.
      break;
  }

  return NextResponse.json({ received: true });
}
