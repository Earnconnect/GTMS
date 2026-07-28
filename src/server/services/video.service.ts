import { db } from "@/server/db";

/**
 * Daily.co video integration for live interviews.
 *
 * Graceful fallback: if DAILY_API_KEY is not set, video is "disabled" and the
 * UI falls back to the simulated interview room. Set DAILY_API_KEY (from
 * dashboard.daily.co → Developers) to enable real video — no code changes.
 */
const DAILY_API = "https://api.daily.co/v1";

export function isVideoEnabled(): boolean {
  return Boolean(process.env.DAILY_API_KEY);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    "Content-Type": "application/json",
  };
}

/** Create the Daily room for an interview on first join; store it on the record. */
export async function ensureRoom(interviewId: string): Promise<{ roomUrl: string; roomName: string } | null> {
  if (!isVideoEnabled()) return null;

  const interview = await db.interview.findUnique({ where: { id: interviewId } });
  if (!interview) return null;
  if (interview.dailyRoomUrl && interview.dailyRoomName) {
    return { roomUrl: interview.dailyRoomUrl, roomName: interview.dailyRoomName };
  }

  // Room name must be URL-safe; derive from the interview id.
  const roomName = `gtms-iv-${interview.id.slice(0, 12).toLowerCase()}`;
  // Expire the room 6 hours out so stale rooms are auto-cleaned.
  const exp = Math.floor(new Date().getTime() / 1000) + 6 * 60 * 60;

  const res = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: { exp, eject_at_room_exp: true, enable_prejoin_ui: true, enable_screenshare: true },
    }),
  });

  if (!res.ok && res.status !== 409) {
    // 409 = room already exists (fine); anything else is a real failure.
    const detail = await res.text().catch(() => "");
    throw new Error(`Daily room creation failed (${res.status}): ${detail}`);
  }

  const roomUrl =
    process.env.DAILY_DOMAIN
      ? `https://${process.env.DAILY_DOMAIN}.daily.co/${roomName}`
      : (await res.json().catch(() => ({})))?.url ?? `https://gtms.daily.co/${roomName}`;

  await db.interview.update({
    where: { id: interview.id },
    data: { dailyRoomName: roomName, dailyRoomUrl: roomUrl },
  });
  return { roomUrl, roomName };
}

/** Mint a short-lived meeting token for a participant. */
export async function createMeetingToken(opts: {
  roomName: string;
  userName: string;
  isOwner: boolean;
}): Promise<string | null> {
  if (!isVideoEnabled()) return null;
  const exp = Math.floor(new Date().getTime() / 1000) + 2 * 60 * 60;
  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      properties: {
        room_name: opts.roomName,
        user_name: opts.userName,
        is_owner: opts.isOwner,
        exp,
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Daily token creation failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  return data.token as string;
}
