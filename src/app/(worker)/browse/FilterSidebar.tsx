"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, Package, ShieldCheck, Cpu, Gem } from "lucide-react";

const CATEGORIES = [
  { value: "all",                       label: "All Categories",           Icon: null          },
  { value: "PRODUCT_INTELLIGENCE",      label: "Product Intelligence",     Icon: Search        },
  { value: "ORDER_OPERATIONS",          label: "Order Operations",         Icon: Package       },
  { value: "TRANSACTION_VERIFICATION",  label: "Transaction Verification", Icon: ShieldCheck   },
  { value: "AI_DATA_INTELLIGENCE",      label: "AI & Data Intelligence",   Icon: Cpu           },
  { value: "COMBINATION",               label: "Combination (VIP)",        Icon: Gem           },
] as const;

const TIERS = [
  { value: "all",           label: "All Levels"          },
  { value: "BASIC",         label: "Basic (Entry Level)" },
  { value: "PROFESSIONAL",  label: "Professional"        },
  { value: "EXECUTIVE",     label: "Executive"           },
] as const;

// Decorative histogram heights (% of max bar height)
const HIST = [3,5,8,13,19,26,33,40,44,42,38,33,27,21,16,12,8,6,4,3];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-colors"
      style={{
        background:   checked ? "#0F172A" : "#fff",
        borderColor:  checked ? "#0F172A" : "#CBD5E1",
      }}
    >
      {checked && (
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
          <path d="M2 5.2l2.4 2.4 3.6-4.4" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </span>
  );
}

export function FilterSidebar() {
  const router    = useRouter();
  const sp        = useSearchParams();
  const category  = sp.get("category") ?? "all";
  const tier      = sp.get("tier")     ?? "all";

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value === "all") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`/browse?${next.toString()}`);
    },
    [router, sp],
  );

  return (
    <aside className="w-64 flex-shrink-0">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[15px] font-bold" style={{ color: "#0F172A" }}>Filters</p>
        {(category !== "all" || tier !== "all") && (
          <button
            onClick={() => router.push("/browse")}
            className="text-[12px] font-semibold hover:underline"
            style={{ color: "#0EA5E9" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Task Category ─────────────────────────────── */}
      <div className="mb-7">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94A3B8" }}>
          Task Category
        </p>
        <ul className="space-y-0.5">
          {CATEGORIES.map(c => {
            const active = category === c.value;
            return (
              <li key={c.value}>
                <button
                  onClick={() => update("category", c.value)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors text-left hover:bg-slate-100"
                  style={{ color: active ? "#0F172A" : "#475569" }}
                >
                  <Checkbox checked={active} />
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Reward Range ──────────────────────────────── */}
      <div className="mb-7">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94A3B8" }}>
          Reward Range
        </p>
        {/* histogram */}
        <div className="flex items-end gap-[2.5px] h-12 mb-2">
          {HIST.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[2px] transition-colors"
              style={{ height: `${(h / 44) * 100}%`, background: "#E2E8F0" }}
            />
          ))}
        </div>
        {/* range */}
        <div className="relative">
          <input
            type="range"
            min={50}
            max={350}
            step={25}
            defaultValue={50}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: "#0F172A" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] font-semibold" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
            <span>$</span><span>0.50</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] font-semibold" style={{ borderColor: "#E2E8F0", color: "#475569" }}>
            <span>$</span><span>3.50</span>
          </div>
        </div>
      </div>

      {/* ── Membership Tier ───────────────────────────── */}
      <div className="mb-7">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94A3B8" }}>
          Membership Tier
        </p>
        <ul className="space-y-0.5">
          {TIERS.map(t => {
            const active = tier === t.value;
            return (
              <li key={t.value}>
                <button
                  onClick={() => update("tier", t.value)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors text-left hover:bg-slate-100"
                  style={{ color: active ? "#0F172A" : "#475569" }}
                >
                  <Checkbox checked={active} />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Work Style ────────────────────────────────── */}
      <div>
        <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94A3B8" }}>
          Availability
        </p>
        <ul className="space-y-0.5">
          {[
            { value: "all",      label: "All tasks"       },
            { value: "qa",       label: "QA Reviewed"     },
            { value: "nocert",   label: "No certification required" },
          ].map(opt => (
            <li key={opt.value}>
              <button
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors text-left hover:bg-slate-100"
                style={{ color: "#475569" }}
              >
                <Checkbox checked={opt.value === "all"} />
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
