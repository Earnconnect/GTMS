"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

export function ReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/register?ref=${code}`;

  async function copy() {
    const url =
      typeof window !== "undefined" ? window.location.origin + path : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input readOnly value={path} className="font-mono text-xs" />
      <Button variant="secondary" onClick={copy}>
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
