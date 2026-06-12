"use client";

import { useActionState } from "react";
import { requestDepositAction } from "@/server/actions/wallet.actions";
import { Button, Input, Select, FormField, Alert, Card, CardContent, CardHeader } from "@/components/ui";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Link2,
  AlertCircle,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Submit Request",
    description: "Fill in your deposit amount and payment method details below.",
  },
  {
    step: "2",
    title: "Admin Verification",
    description: "Our admin team verifies your payment — usually within 24 hours.",
  },
  {
    step: "3",
    title: "Funds Credited",
    description: "Once approved, your wallet balance is updated instantly.",
  },
];

export default function DepositPage() {
  const [state, action, isPending] = useActionState(requestDepositAction, {});

  return (
    <div>
      {/* Page Header */}
      <div className="pt-6 pb-4">
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Wallet
        </Link>
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Request Deposit</h1>
        <p className="mt-1 text-[13.5px] text-slate-600">
          Submit a deposit request and our team will review and credit your account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Form */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <h2 className="text-[15px] font-semibold text-slate-800">Deposit Details</h2>
              </div>
            </CardHeader>
            <CardContent>
              {state.success && (
                <Alert variant="success" className="mb-5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Request submitted successfully!</p>
                      <p className="text-[12.5px] mt-0.5 opacity-80">
                        Admin will review within 24 hours and credit your wallet.
                      </p>
                    </div>
                  </div>
                </Alert>
              )}
              {state.error && (
                <Alert variant="danger" className="mb-5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{state.error}</span>
                  </div>
                </Alert>
              )}

              <form action={action} className="space-y-5">
                <FormField label="Amount (USD)" required>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13.5px] font-medium">$</span>
                    <Input
                      type="number"
                      name="amount"
                      placeholder="50.00"
                      min="1"
                      step="0.01"
                      required
                      className="pl-8"
                    />
                  </div>
                </FormField>

                <FormField label="Payment Method" required>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </span>
                    <Select name="paymentMethod" required className="pl-10">
                      <option value="">Select method...</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="paypal">PayPal</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                </FormField>

                <FormField label="Payment Proof URL (optional)">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Link2 className="w-4 h-4 text-slate-400" />
                    </span>
                    <Input
                      name="proofUrl"
                      placeholder="https://..."
                      type="url"
                      className="pl-10"
                    />
                  </div>
                  <p className="mt-1.5 text-[12px] text-slate-400">
                    Paste a screenshot URL showing your payment confirmation
                  </p>
                </FormField>

                <Button
                  type="submit"
                  className="w-full h-11"
                  loading={isPending}
                >
                  Submit Deposit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-500" />
                <h2 className="text-[15px] font-semibold text-slate-800">How Deposits Work</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-slate-700">{item.title}</p>
                    <p className="text-[12.5px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Important note */}
          <div className="rounded-2xl bg-blue-50 border border-blue-100 px-5 py-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-blue-800 mb-1">Manual Review Process</p>
                <p className="text-[12.5px] text-blue-700 leading-relaxed">
                  All deposits are manually reviewed by our admin team. Providing clear payment proof helps speed up the approval process. Typical review time is under 24 hours on business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
