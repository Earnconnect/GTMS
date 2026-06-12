import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { db } from "@/server/db";

const ENC_KEY = Buffer.from(
  process.env.MFA_ENCRYPTION_KEY ?? "0".repeat(64),
  "hex"
);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", ENC_KEY, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

function decrypt(val: string): string {
  const [ivHex, enc] = val.split(":");
  const decipher = createDecipheriv("aes-256-cbc", ENC_KEY, Buffer.from(ivHex, "hex"));
  return decipher.update(enc, "hex", "utf8") + decipher.final("utf8");
}

export async function generateMfaSetup(userId: string, email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: "GTMS Network",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const secret = totp.secret.base32;
  const qrDataUrl = await QRCode.toDataURL(totp.toString());

  await db.user.update({
    where: { id: userId },
    data: { mfaSecret: encrypt(secret) },
  });

  return { secret, qrDataUrl };
}

export async function verifyMfaCode(userId: string, code: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true },
  });
  if (!user?.mfaSecret) return false;

  const totp = new OTPAuth.TOTP({
    issuer: "GTMS Network",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(decrypt(user.mfaSecret)),
  });

  return totp.validate({ token: code, window: 1 }) !== null;
}

export async function enableMfa(userId: string) {
  await db.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
}

export async function disableMfa(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { mfaEnabled: false, mfaSecret: null },
  });
}
