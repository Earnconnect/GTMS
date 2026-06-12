"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/server/actions/auth.actions";
import { Button, Input, Alert, FormField } from "@/components/ui";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Welcome back</h1>
        <p className="text-[13.5px] text-slate-500 mt-1">Sign in to your GTMS account</p>
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

      {/* Form */}
      <form action={action} className="space-y-4">
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Submit */}
        <div className="pt-1">
          <Button
            type="submit"
            loading={isPending}
            className="w-full h-11 font-semibold text-[14px] rounded-xl shadow-md shadow-cyan-200/50"
            style={{ background: "linear-gradient(135deg, #06B6D4, #0284C7)" }}
          >
            {!isPending && <ArrowRight className="w-4 h-4 ml-1 order-last" />}
            Sign in
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[12px] text-slate-400">New to GTMS Network?</span>
        </div>
      </div>

      {/* Register link */}
      <Link
        href="/register"
        className="flex items-center justify-center gap-1.5 w-full h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[13.5px] font-semibold text-slate-700 transition-colors"
      >
        Create a free account
      </Link>
    </div>
  );
}
