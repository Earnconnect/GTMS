"use client";

import { useActionState } from "react";
import { submitKycAction } from "@/server/actions/kyc.actions";
import { Button, Input, Select, FormField, Alert, Card, CardContent, CardHeader, PageHeader } from "@/components/ui";

export default function KycPage() {
  const [state, action, isPending] = useActionState(submitKycAction, {});

  return (
    <div>
      <PageHeader
        title="Identity Verification"
        description="Submit your KYC documents to unlock withdrawals"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <h2 className="text-[15px] font-semibold text-slate-800">Document Submission</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">
              All fields marked with * are required
            </p>
          </CardHeader>
          <CardContent>
            {state.success ? (
              <div className="flex flex-col items-center text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                >
                  <svg className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                </div>
                <h3 className="text-[17px] font-bold text-slate-800 mb-2">Documents Submitted!</h3>
                <p className="text-[13.5px] text-slate-500 max-w-[260px]">
                  Our team will review your documents within 1–2 business days.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  <span className="text-[12.5px] font-semibold text-amber-700">Review pending — check back soon</span>
                </div>
              </div>
            ) : (
              <>
                {state.error && (
                  <Alert variant="danger" className="mb-4">{state.error}</Alert>
                )}

                <form action={action} className="space-y-4">
                  <FormField label="Document Type" required>
                    <Select name="docType" required>
                      <option value="">Select document type...</option>
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                    </Select>
                  </FormField>

                  <FormField label="Document Number" required>
                    <Input
                      name="docNumber"
                      placeholder="Enter document number"
                      required
                    />
                  </FormField>

                  <FormField label="Document Front Image URL" required>
                    <Input
                      name="docFrontUrl"
                      type="url"
                      placeholder="https://..."
                      required
                    />
                    <p className="mt-1.5 text-[12px] text-slate-400">
                      Upload to a file hosting service and paste the URL here
                    </p>
                  </FormField>

                  <FormField label="Document Back Image URL">
                    <Input
                      name="docBackUrl"
                      type="url"
                      placeholder="https://... (optional)"
                    />
                  </FormField>

                  <FormField label="Selfie with Document URL">
                    <Input
                      name="selfieUrl"
                      type="url"
                      placeholder="https://... (optional)"
                    />
                  </FormField>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-11"
                      loading={isPending}
                      style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)", border: "none" }}
                    >
                      {isPending ? "Submitting..." : "Submit KYC Documents"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info sidebar */}
        <div className="space-y-4">
          {/* Why KYC */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                </div>
                <h3 className="text-[15px] font-semibold text-slate-800">Why is KYC required?</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">
                Identity verification helps us prevent fraud, comply with financial regulations,
                and protect our workforce community. Your documents are securely stored and only
                reviewed by authorized staff.
              </p>
            </CardContent>
          </Card>

          {/* Process steps */}
          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-slate-800">Verification Process</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Submit documents",
                    desc: "Upload your ID, passport, or driver's license details.",
                  },
                  {
                    step: "2",
                    title: "Under review",
                    desc: "Our team reviews within 1–2 business days.",
                  },
                  {
                    step: "3",
                    title: "Approved",
                    desc: "Withdrawals and premium features are unlocked.",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#06B6D4,#0284C7)" }}
                    >
                      {s.step}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-700">{s.title}</p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accepted documents */}
          <Card>
            <CardHeader>
              <h3 className="text-[15px] font-semibold text-slate-800">Accepted Documents</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {[
                  { icon: "🪪", label: "National ID Card", sub: "Front & back required" },
                  { icon: "📘", label: "Passport", sub: "Photo page required" },
                  { icon: "🚗", label: "Driver's License", sub: "Front & back recommended" },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <span className="text-xl">{doc.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">{doc.label}</p>
                      <p className="text-[11.5px] text-slate-400">{doc.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
