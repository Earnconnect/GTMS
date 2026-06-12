"use client";

import { useActionState } from "react";
import { requestPayoutAction } from "@/server/actions/wallet.actions";
import { Button, Input, Select, FormField, Alert, Card, CardContent, PageHeader } from "@/components/ui";

export default function PayoutPage() {
  const [state, action, isPending] = useActionState(requestPayoutAction, {});

  return (
    <div className="max-w-lg">
      <PageHeader title="Request Payout" description="Withdraw your earnings to your bank or mobile account" />

      <Card>
        <CardContent className="pt-6">
          {state.success && (
            <Alert variant="success" className="mb-4">
              Payout request submitted! Your balance has been reserved and will be processed soon.
            </Alert>
          )}
          {state.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

          <form action={action} className="space-y-4">
            <FormField label="Amount (USD)" required>
              <Input type="number" name="amount" placeholder="25.00" min="5" step="0.01" required />
              <p className="mt-1 text-xs text-gray-500">Minimum payout: $5.00</p>
            </FormField>

            <FormField label="Payout Method" required>
              <Select name="method" required>
                <option value="">Select method...</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Cryptocurrency</option>
              </Select>
            </FormField>

            <FormField label="Account Name" required>
              <Input name="accountName" placeholder="John Smith" required />
            </FormField>

            <FormField label="Account Number / Address" required>
              <Input name="accountNumber" placeholder="Account number, wallet address, or email" required />
            </FormField>

            <FormField label="Bank / Provider Name">
              <Input name="bankName" placeholder="Bank or service provider name" />
            </FormField>

            <div className="pt-2">
              <Button type="submit" className="w-full" loading={isPending}>
                Submit Payout Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
