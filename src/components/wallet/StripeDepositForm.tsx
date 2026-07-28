"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Input, Label } from "@/components/ui";

// Singleton promise — avoids re-loading the Stripe.js script on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Inner form rendered once we have a clientSecret ──────────────────────────

function CheckoutForm({
  amountLabel,
  onSuccess,
}: {
  amountLabel: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(undefined);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      // "if_required" avoids a full-page redirect for standard card payments.
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setBusy(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Charging <span className="font-semibold">{amountLabel}</span> to your card.
      </p>
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={!stripe || busy} className="w-full">
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </form>
  );
}

// ── Outer component: amount entry → PI creation → payment ────────────────────

type Step = "amount" | "payment" | "success";

export function StripeDepositForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amountStr, setAmountStr] = useState("50");
  const [clientSecret, setClientSecret] = useState<string>();
  const [amountLabel, setAmountLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleContinue = useCallback(async () => {
    const dollars = parseFloat(amountStr);
    if (!dollars || dollars <= 0) {
      setError("Enter a valid amount");
      return;
    }
    const amountCents = Math.round(dollars * 100);
    setLoading(true);
    setError(undefined);

    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      const data = await res.json() as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret) {
        setError(data.error ?? "Could not start payment");
        return;
      }
      setClientSecret(data.clientSecret);
      setAmountLabel(`$${dollars.toFixed(2)}`);
      setStep("payment");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }, [amountStr]);

  const handleSuccess = useCallback(() => {
    setStep("success");
    // Refresh server data so the new balance shows immediately.
    router.refresh();
  }, [router]);

  if (step === "success") {
    return (
      <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
        Payment received — your balance will update momentarily once Stripe
        confirms (usually within a few seconds).
      </div>
    );
  }

  if (step === "payment" && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <CheckoutForm amountLabel={amountLabel} onSuccess={handleSuccess} />
        <button
          onClick={() => setStep("amount")}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600"
        >
          ← Change amount
        </button>
      </Elements>
    );
  }

  // Step: amount entry
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="stripe-amount">Add funds (USD)</Label>
        <Input
          id="stripe-amount"
          name="amount"
          type="number"
          step="0.01"
          min="1"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleContinue} disabled={loading} className="w-full">
        {loading ? "Loading…" : "Continue to payment"}
      </Button>
    </div>
  );
}
