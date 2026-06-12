"use client";

import { useState, useRef } from "react";
import { adminCreditAccountAction } from "@/server/actions/admin.actions";
import { Button, Input, Select, FormField } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function CreditAccountForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.set("userId", userId);

    const result = await adminCreditAccountAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      formRef.current?.reset();
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Amount ($)" required>
          <Input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
          />
        </FormField>

        <FormField label="Type" required>
          <Select name="type" defaultValue="ADMIN_CREDIT">
            <option value="ADMIN_CREDIT">Admin Credit</option>
            <option value="LOAN">Loan</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Reason / Note">
        <Input
          name="reason"
          type="text"
          placeholder="e.g. Compensation for missed task payout"
        />
      </FormField>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600 font-medium">
          Credit applied successfully.
        </p>
      )}

      <Button type="submit" loading={loading} variant="primary">
        Apply Credit / Loan
      </Button>
    </form>
  );
}
