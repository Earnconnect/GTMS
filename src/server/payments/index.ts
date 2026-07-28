import type { PaymentProvider } from "./provider";
import { SimulatedProvider } from "./simulated.provider";
import { StripeProvider } from "./stripe.provider";

let provider: PaymentProvider | undefined;

/** Returns the configured payment provider singleton. */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  const choice = (process.env.PAYMENT_PROVIDER ?? "simulated").toLowerCase();
  provider = choice === "stripe" ? new StripeProvider() : new SimulatedProvider();
  return provider;
}

export type { PaymentProvider } from "./provider";
