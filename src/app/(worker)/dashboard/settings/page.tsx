"use client";

import { useState, useEffect } from "react";
import { PageHeader, Card, CardContent, Button, Input, FormField, Alert, Badge } from "@/components/ui";

interface MfaSetup {
  secret: string;
  qrDataUrl: string;
}

export default function SettingsPage() {
  const [nameSuccess, setNameSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaSetup, setMfaSetup] = useState<MfaSetup | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    fetch("/api/mfa/setup")
      .then((r) => {
        if (r.status === 400) {
          setMfaEnabled(true);
        } else if (r.ok) {
          setMfaEnabled(false);
        }
      })
      .catch(() => {});
  }, []);

  async function startMfaSetup() {
    setMfaLoading(true);
    setMfaError(null);
    const res = await fetch("/api/mfa/setup");
    if (res.ok) {
      const data = await res.json();
      setMfaSetup(data);
      setMfaEnabled(false);
    } else {
      setMfaError("Failed to generate QR code");
    }
    setMfaLoading(false);
  }

  async function verifyAndEnable() {
    setMfaLoading(true);
    setMfaError(null);
    const res = await fetch("/api/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ code: mfaCode }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setMfaEnabled(true);
      setMfaSetup(null);
      setMfaSuccess(true);
    } else {
      const d = await res.json();
      setMfaError(d.error ?? "Invalid code");
    }
    setMfaLoading(false);
  }

  async function disableMfa() {
    setMfaLoading(true);
    const res = await fetch("/api/mfa/verify", { method: "DELETE" });
    if (res.ok) {
      setMfaEnabled(false);
      setMfaSuccess(false);
    }
    setMfaLoading(false);
  }

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: fd.get("name"), bio: fd.get("bio") }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) setNameSuccess(true);
    else setError("Failed to update profile");
  }

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" />

      {/* Profile */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <CardContent className="pt-5">
          {nameSuccess && <Alert variant="success" className="mb-4">Profile updated.</Alert>}
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          <form onSubmit={updateProfile} className="space-y-4">
            <FormField label="Display Name">
              <Input name="name" placeholder="Your name" />
            </FormField>
            <FormField label="Bio">
              <Input name="bio" placeholder="Short bio (optional)" />
            </FormField>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <CardContent className="pt-5">
          {pwSuccess && <Alert variant="success" className="mb-4">Password updated.</Alert>}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const res = await fetch("/api/profile/password", {
                method: "POST",
                body: JSON.stringify({
                  currentPassword: fd.get("currentPassword"),
                  newPassword: fd.get("newPassword"),
                }),
                headers: { "Content-Type": "application/json" },
              });
              if (res.ok) setPwSuccess(true);
              else setError("Failed to update password");
            }}
            className="space-y-4"
          >
            <FormField label="Current Password">
              <Input name="currentPassword" type="password" required />
            </FormField>
            <FormField label="New Password">
              <Input name="newPassword" type="password" required minLength={8} />
            </FormField>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* MFA */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Two-Factor Authentication</h2>
            {mfaEnabled === true && <Badge variant="success">Enabled</Badge>}
            {mfaEnabled === false && !mfaSetup && <Badge variant="warning">Disabled</Badge>}
          </div>
        </div>
        <CardContent className="pt-5">
          {mfaSuccess && (
            <Alert variant="success" className="mb-4">
              Two-factor authentication enabled successfully.
            </Alert>
          )}
          {mfaError && <Alert variant="danger" className="mb-4">{mfaError}</Alert>}

          {mfaEnabled === true && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your account is protected with an authenticator app. Codes change every 30 seconds.
              </p>
              <Button variant="danger" loading={mfaLoading} onClick={disableMfa}>
                Disable 2FA
              </Button>
            </div>
          )}

          {mfaEnabled === false && !mfaSetup && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Add an extra layer of security by requiring a code from your authenticator app
                on each login.
              </p>
              <Button loading={mfaLoading} onClick={startMfaSetup}>
                Set Up 2FA
              </Button>
            </div>
          )}

          {mfaSetup && (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 font-medium">
                1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mfaSetup.qrDataUrl}
                alt="MFA QR Code"
                className="w-48 h-48 border border-gray-200 rounded-lg"
              />
              <div>
                <p className="text-xs text-gray-500 mb-1">Or enter this key manually:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                  {mfaSetup.secret}
                </code>
              </div>
              <p className="text-sm text-gray-700 font-medium">
                2. Enter the 6-digit code from your app to confirm setup
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className="w-36 text-center text-lg tracking-widest font-mono"
                />
                <Button
                  loading={mfaLoading}
                  disabled={mfaCode.length !== 6}
                  onClick={verifyAndEnable}
                >
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>
        <CardContent className="pt-5">
          <p className="text-sm text-gray-500">
            Email notifications for task approvals, payouts, and important account updates are sent
            automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
