"use client";

import { useState } from "react";
import { resolveDisputeAction } from "@/server/actions/admin.actions";
import { Button, Textarea, FormField, Alert } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function ResolveDisputeForm({
  disputeId,
  adminId,
}: {
  disputeId: string;
  adminId: string;
}) {
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resolve = async () => {
    if (!resolution) return;
    setLoading(true);
    const result = await resolveDisputeAction(disputeId, resolution);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.refresh();
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-3">Resolve Dispute</h3>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <FormField label="Resolution">
        <Textarea
          rows={3}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Explain how this dispute is resolved..."
        />
      </FormField>
      <Button onClick={resolve} loading={loading} className="mt-3">
        Mark Resolved
      </Button>
    </div>
  );
}
