"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { registerAction } from "@/server/actions/register.action";
import { Button, Input, Label } from "@/components/ui";

export default function RegisterPage() {
  const [error, formAction, pending] = useActionState(registerAction, undefined);
  const [ref, setRef] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref");
    if (code) setRef(code);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Apply to join the team</h1>
      <p className="mt-1 text-sm text-slate-500">
        Create your account. Once an administrator onboards you, you&apos;ll start
        receiving your salary here.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="role" value="WORKER" />
        <input type="hidden" name="ref" value={ref} />
        {ref && (
          <p className="text-xs text-green-600">Referral code applied: {ref}</p>
        )}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
