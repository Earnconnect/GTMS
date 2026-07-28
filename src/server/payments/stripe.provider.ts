import Stripe from "stripe";
import type {
  ChargeInput,
  PaymentProvider,
  PayoutInput,
  ProviderResult,
  WebhookEvent,
} from "./provider";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });
}

/**
 * Stripe Connect provider.
 *
 * Deposit flow:
 *   1. /api/stripe/payment-intent creates a PaymentIntent via charge() and
 *      returns the client_secret to the browser.
 *   2. The browser confirms with Stripe Elements (no redirect for cards).
 *   3. Stripe fires payment_intent.succeeded → /api/stripe/webhook →
 *      creditDeposit() credits the requester wallet.
 *
 * Payout flow:
 *   1. Worker links a Stripe Express account via ensurePayee().
 *   2. Admin processes payout → payout() transfers funds to the
 *      worker's connected account.
 *
 * Guardrail: there is no method that pulls money FROM a worker.
 */
export class StripeProvider implements PaymentProvider {
  readonly name = "stripe";

  /** Creates a PaymentIntent; returns its id as providerRef and the
   *  client_secret inside raw so the browser can confirm. */
  async charge(input: ChargeInput): Promise<ProviderResult> {
    const stripe = getStripe();
    try {
      const intent = await stripe.paymentIntents.create(
        {
          amount: input.amountCents,
          currency: "usd",
          description: input.description ?? "GTMS deposit",
          metadata: {
            userId: input.userId,
            amountCents: String(input.amountCents),
          },
        },
        { idempotencyKey: input.idempotencyKey },
      );
      return {
        ok: true,
        providerRef: intent.id,
        raw: { clientSecret: intent.client_secret },
      };
    } catch (err) {
      return { ok: false, providerRef: "", error: (err as Error).message };
    }
  }

  /** Transfers funds to a worker's Stripe Connect Express account. */
  async payout(input: PayoutInput): Promise<ProviderResult> {
    if (!input.destination) {
      return {
        ok: false,
        providerRef: "",
        error: "Worker has no Stripe Connect account. Ask them to link one in Wallet settings.",
      };
    }
    const stripe = getStripe();
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: input.amountCents,
          currency: "usd",
          destination: input.destination,
          description: input.description ?? "GTMS worker payout",
          metadata: { userId: input.userId },
        },
        { idempotencyKey: input.idempotencyKey },
      );
      return { ok: true, providerRef: transfer.id };
    } catch (err) {
      return { ok: false, providerRef: "", error: (err as Error).message };
    }
  }

  /**
   * Creates (or retrieves) a Stripe Connect Express account for a worker and
   * returns an onboarding link. Returns { ready: true } if already onboarded.
   */
  async ensurePayee(userId: string): Promise<{ ready: boolean; onboardingUrl?: string }> {
    const stripe = getStripe();
    const { db } = await import("@/server/db");

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeConnectId: true },
    });
    if (!user) throw new Error("User not found");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    let accountId = user.stripeConnectId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email ?? undefined,
        metadata: { userId },
      });
      accountId = account.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeConnectId: accountId },
      });
    }

    // Check if onboarding is complete.
    const account = await stripe.accounts.retrieve(accountId);
    if (account.charges_enabled && account.payouts_enabled) {
      return { ready: true };
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/api/stripe/connect?refresh=1`,
      return_url: `${appUrl}/api/stripe/connect/return`,
      type: "account_onboarding",
    });

    return { ready: false, onboardingUrl: link.url };
  }

  /** Verifies a Stripe webhook signature and returns a normalised event. */
  async verifyWebhook(req: Request): Promise<WebhookEvent> {
    const stripe = getStripe();
    const signature = req.headers.get("stripe-signature") ?? "";
    const body = await req.text();
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
      return {
        type: event.type,
        providerRef: (event.data.object as { id: string }).id,
        ok: true,
      };
    } catch {
      return { type: "", providerRef: "", ok: false };
    }
  }
}
