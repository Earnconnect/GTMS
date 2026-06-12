"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { purchaseGtmsPassAction } from "@/server/actions/gtmspass.actions";
import { Gem, Loader2, Tag } from "lucide-react";
import { formatMoney } from "@/lib/money";

interface Props {
  canAfford: boolean;
  priceCents: number;
  originalPriceCents: number;
  discountPct: number;
  savingsCents: number;
}

export function PurchaseButton({ canAfford, priceCents, originalPriceCents, discountPct, savingsCents }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePurchase() {
    setError(null);
    setLoading(true);
    const result = await purchaseGtmsPassAction();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/browse?category=COMBINATION");
    }
  }

  return (
    <div>
      {/* discount callout */}
      {discountPct > 0 && (
        <div
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "linear-gradient(90deg, #FFFBEB 0%, #FEF9C3 100%)", border: "1.5px solid #F59E0B" }}
        >
          <Tag size={16} style={{ color: "#B45309", flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-[13px] font-bold" style={{ color: "#78350F" }}>
              First-user discount applied — {discountPct}% off
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#92400E" }}>
              You save {formatMoney(savingsCents)}. This offer is available once and expires when used.
            </p>
          </div>
        </div>
      )}

      {/* pricing */}
      <div className="flex items-baseline gap-3 mb-4 justify-center">
        {discountPct > 0 && (
          <span className="text-[18px] font-bold line-through" style={{ color: "#94A3B8" }}>
            {formatMoney(originalPriceCents)}
          </span>
        )}
        <span className="text-[32px] font-extrabold" style={{ color: "#0F172A", letterSpacing: "-0.03em" }}>
          {formatMoney(priceCents)}
        </span>
        {discountPct > 0 && (
          <span
            className="px-2 py-0.5 rounded-lg text-[12px] font-extrabold"
            style={{ background: "#FEF08A", color: "#713F12" }}
          >
            -{discountPct}%
          </span>
        )}
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-[13.5px] font-medium"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={loading || !canAfford}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(90deg, #B45309 0%, #D97706 100%)", color: "#fff" }}
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Processing...</>
        ) : (
          <><Gem size={18} /> Activate GTMS Pass{discountPct > 0 ? ` — ${formatMoney(priceCents)}` : ` — ${formatMoney(priceCents)}`}</>
        )}
      </button>

      {!canAfford && (
        <p className="mt-3 text-[13px] text-center font-medium" style={{ color: "#DC2626" }}>
          Insufficient balance — deposit at least {formatMoney(priceCents)} to proceed.
        </p>
      )}
    </div>
  );
}
