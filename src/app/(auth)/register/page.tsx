"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/server/actions/auth.actions";
import { Button, Input, Alert, FormField } from "@/components/ui";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Gift,
  Briefcase,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, formData: FormData) => {
      const result = await registerAction(prev, formData);
      if (result.success) router.push("/login?registered=1");
      return result;
    },
    {}
  );

  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"WORKER" | "BUSINESS">("WORKER");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Create your account</h1>
        <p className="text-[13.5px] text-slate-500 mt-1">Join the GTMS Network today</p>
      </div>

      {/* Error alert */}
      {state.error && (
        <Alert variant="danger" className="mb-5">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75-2a1 1 0 110-2 1 1 0 010 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{state.error}</span>
          </div>
        </Alert>
      )}

      <form action={action} className="space-y-4">
        {/* Role selector */}
        <div>
          <p className="text-[13px] font-semibold text-slate-700 mb-2">
            I want to join as <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Worker card */}
            <button
              type="button"
              onClick={() => setSelectedRole("WORKER")}
              className={[
                "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-150 cursor-pointer",
                selectedRole === "WORKER"
                  ? "border-cyan-400 bg-cyan-50/60 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {selectedRole === "WORKER" && (
                <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-cyan-500" />
              )}
              <div
                className={[
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  selectedRole === "WORKER" ? "bg-cyan-100" : "bg-slate-100",
                ].join(" ")}
              >
                <Wrench
                  className={[
                    "w-5 h-5",
                    selectedRole === "WORKER" ? "text-cyan-600" : "text-slate-500",
                  ].join(" ")}
                />
              </div>
              <div>
                <p
                  className={[
                    "text-[13px] font-bold",
                    selectedRole === "WORKER" ? "text-cyan-700" : "text-slate-700",
                  ].join(" ")}
                >
                  Worker
                </p>
                <p className="text-[11.5px] text-slate-400 mt-0.5 leading-tight">
                  Complete tasks &amp; earn
                </p>
              </div>
            </button>

            {/* Business card */}
            <button
              type="button"
              onClick={() => setSelectedRole("BUSINESS")}
              className={[
                "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-150 cursor-pointer",
                selectedRole === "BUSINESS"
                  ? "border-cyan-400 bg-cyan-50/60 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              {selectedRole === "BUSINESS" && (
                <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-cyan-500" />
              )}
              <div
                className={[
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  selectedRole === "BUSINESS" ? "bg-cyan-100" : "bg-slate-100",
                ].join(" ")}
              >
                <Briefcase
                  className={[
                    "w-5 h-5",
                    selectedRole === "BUSINESS" ? "text-cyan-600" : "text-slate-500",
                  ].join(" ")}
                />
              </div>
              <div>
                <p
                  className={[
                    "text-[13px] font-bold",
                    selectedRole === "BUSINESS" ? "text-cyan-700" : "text-slate-700",
                  ].join(" ")}
                >
                  Business
                </p>
                <p className="text-[11.5px] text-slate-400 mt-0.5 leading-tight">
                  Post tasks &amp; hire
                </p>
              </div>
            </button>
          </div>
          {/* Hidden input to submit selected role */}
          <input type="hidden" name="role" value={selectedRole} />
        </div>

        {/* Full name */}
        <FormField label="Full name" required>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              name="name"
              placeholder="John Smith"
              required
              autoComplete="name"
              className="pl-10"
            />
          </div>
        </FormField>

        {/* Email */}
        <FormField label="Email address" required>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-10"
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField label="Password" required>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        {/* Referral code */}
        <FormField label="Referral code (optional)">
          <div className="relative">
            <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              name="referralCode"
              placeholder="Enter referral code"
              className="pl-10"
            />
          </div>
        </FormField>

        {/* Terms note */}
        <p className="text-[11.5px] text-slate-400 leading-relaxed">
          By creating an account you agree to our{" "}
          <span className="text-cyan-600 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-cyan-600 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
          .
        </p>

        {/* Submit */}
        <div className="pt-1">
          <Button
            type="submit"
            loading={isPending}
            className="w-full h-11 font-semibold text-[14px] rounded-xl shadow-md shadow-cyan-200/50"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0284C7)" }}
          >
            {!isPending && <ArrowRight className="w-4 h-4 ml-1 order-last" />}
            Create account
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[12px] text-slate-400">Already have an account?</span>
        </div>
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 w-full h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[13.5px] font-semibold text-slate-700 transition-colors"
      >
        Sign in instead
      </Link>
    </div>
  );
}
