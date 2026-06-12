"use client";

import { useActionState } from "react";
import { requestDepositAction } from "@/server/actions/wallet.actions";
import { Button, Input, FormField, Alert, Card, CardContent, PageHeader } from "@/components/ui";

export default function BusinessDepositPage() {
  const [state, action, isPending] = useActionState(requestDepositAction, {});

  return (
    <div className="max-w-md">
      <PageHeader title="Add Funds" description="Submit a deposit request to fund your account" />

      <Card>
        <CardContent className="pt-6">
          {state.success && (
            <Alert variant="success" className="mb-4">
              Deposit request submitted. Our team will verify and credit your account within 1 business day.
            </Alert>
          )}
          {state.error && <Alert variant="danger" className="mb-4">{state.error}</Alert>}

          <form action={action} className="space-y-4">
            <FormField label="Amount (USD)" required>
              <Input name="amount" type="number" step="0.01" min="10" placeholder="100.00" required />
            </FormField>

            <FormField label="Payment Proof URL">
              <Input name="proofUrl" type="url" placeholder="https://..." />
              <p className="mt-1 text-xs text-gray-500">
                Upload screenshot of payment confirmation and paste the URL here
              </p>
            </FormField>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Payment Instructions</p>
              <p>Transfer funds via bank transfer or crypto and submit proof here. Our team reviews within 24 hours.</p>
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Submit Deposit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
