"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { submitKycAction, type FormState } from "@/server/actions/kyc.actions";
import { Button, Input, Label, Select } from "@/components/ui";

export function KycForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<FormState, FormData>(
    async (prev, fd) => {
      const res = await submitKycAction(prev, fd);
      if (res?.ok) router.refresh();
      return res;
    },
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full legal name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" required />
        </div>
        <div>
          <Label htmlFor="docType">Document type</Label>
          <Select id="docType" name="docType" defaultValue="passport">
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="drivers_license">Driver&apos;s license</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="docNumber">Document number</Label>
        <Input id="docNumber" name="docNumber" required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && (
        <p className="text-sm text-green-600">Submitted — pending review.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit for verification"}
      </Button>
    </form>
  );
}
