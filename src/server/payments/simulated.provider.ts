import type {
  ChargeInput,
  PaymentProvider,
  PayoutInput,
  ProviderResult,
} from "./provider";

/**
 * Simulated provider: no real money moves. Deposits and payouts "succeed"
 * instantly and return a deterministic-ish reference. Used for local dev and
 * demos. The DB ledger remains the source of truth.
 */
export class SimulatedProvider implements PaymentProvider {
  readonly name = "simulated";

  async charge(input: ChargeInput): Promise<ProviderResult> {
    if (input.amountCents <= 0) {
      return { ok: false, providerRef: "", error: "Amount must be positive" };
    }
    return { ok: true, providerRef: `sim_charge_${input.idempotencyKey}` };
  }

  async payout(input: PayoutInput): Promise<ProviderResult> {
    if (input.amountCents <= 0) {
      return { ok: false, providerRef: "", error: "Amount must be positive" };
    }
    return { ok: true, providerRef: `sim_payout_${input.idempotencyKey}` };
  }

  async ensurePayee() {
    return { ready: true };
  }
}
