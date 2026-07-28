"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface Props {
  /** Whether the worker already has a fully-onboarded Connect account. */
  isConnected: boolean;
}

/**
 * Links (or re-links) a worker's Stripe Express account.
 * Clicking redirects to /api/stripe/connect which initiates the Stripe-hosted
 * onboarding flow.
 */
export function StripeConnectButton({ isConnected }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    window.location.href = "/api/stripe/connect";
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        Stripe payout account connected
        <button
          onClick={handleClick}
          disabled={loading}
          className="ml-2 text-slate-400 underline hover:text-slate-600 disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Manage"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">
        Connect a Stripe Express account to receive payouts directly to your bank.
      </p>
      <Button onClick={handleClick} disabled={loading} variant="secondary">
        {loading ? "Redirecting to Stripe…" : "Connect Stripe account"}
      </Button>
    </div>
  );
}
