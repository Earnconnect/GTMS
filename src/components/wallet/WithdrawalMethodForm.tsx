"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PayoutMethodType } from "@prisma/client";
import { Landmark, CreditCard, Smartphone, Wallet, ShieldCheck, Pencil } from "lucide-react";
import { saveWithdrawalMethodAction } from "@/server/actions/withdrawal.actions";
import { Button, Input, Label, Select } from "@/components/ui";

const TYPE_META: Record<PayoutMethodType, { label: string; icon: typeof Landmark; field: string }> = {
  BANK: { label: "Bank transfer", icon: Landmark, field: "Account number" },
  PAYPAL: { label: "PayPal", icon: Wallet, field: "PayPal email or ID" },
  MOBILE_MONEY: { label: "Mobile money", icon: Smartphone, field: "Mobile number" },
  CARD: { label: "Debit card", icon: CreditCard, field: "Card number" },
};

export function WithdrawalMethodForm({
  method,
}: {
  method: { type: PayoutMethodType; accountName: string; institution: string | null; accountLast4: string; currency: string; country: string | null } | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!method);
  const [type, setType] = useState<PayoutMethodType>(method?.type ?? "BANK");

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveWithdrawalMethodAction({
        type: String(formData.get("type")) as PayoutMethodType,
        accountName: String(formData.get("accountName") ?? ""),
        institution: String(formData.get("institution") ?? ""),
        accountNumber: String(formData.get("accountNumber") ?? ""),
        country: String(formData.get("country") ?? ""),
        currency: String(formData.get("currency") ?? "USD"),
      });
      if (res.error) setError(res.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  if (method && !editing) {
    const Icon = TYPE_META[method.type].icon;
    return (
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {TYPE_META[method.type].label} ···· {method.accountLast4}
          </p>
          <p className="text-xs text-slate-400">
            {method.accountName}
            {method.institution ? ` · ${method.institution}` : ""} · {method.currency}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)} className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </div>
    );
  }

  const meta = TYPE_META[type];

  return (
    <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="type">Method</Label>
        <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as PayoutMethodType)}>
          {Object.entries(TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="accountName">Account holder name</Label>
        <Input id="accountName" name="accountName" required defaultValue={method?.accountName} placeholder="Jane Doe" />
      </div>
      <div>
        <Label htmlFor="institution">{type === "BANK" ? "Bank name" : "Provider"}</Label>
        <Input id="institution" name="institution" defaultValue={method?.institution ?? ""} placeholder={type === "BANK" ? "First National Bank" : "Provider"} />
      </div>
      <div>
        <Label htmlFor="accountNumber">{meta.field}</Label>
        <Input id="accountNumber" name="accountNumber" required placeholder="•••• •••• 1234" autoComplete="off" />
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" defaultValue={method?.country ?? ""} placeholder="United States" />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select id="currency" name="currency" defaultValue={method?.currency ?? "USD"}>
          {["USD", "EUR", "GBP", "NGN", "CAD", "KES"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save withdrawal details"}
        </Button>
        {method && (
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-400 sm:col-span-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        For your security we store only the last 4 digits. Payouts are simulated in this environment.
      </p>
    </form>
  );
}
