import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Env } from '../../config/env.js';

/** The join link opens this long before the session starts (a few minutes to get ready). */
export const JOIN_OPENS_BEFORE_MS = 10 * 60_000;
/** ...and stays open this long after the session was due to end (a session can run over). */
export const JOIN_CLOSES_AFTER_MS = 15 * 60_000;

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

/** What a join link carries. It is encrypted, so nobody can read the meeting address out of it. */
export interface JoinPayload {
  bookingId: string;
  /** The real meeting address (Google Meet). */
  url: string;
  /** ISO start and end of every booked session, in order. The link opens around each of them. */
  sessions: Array<{ start: string; end: string }>;
}

export type JoinState = 'early' | 'open' | 'ended';

export interface JoinWindow {
  opensAt: Date;
  closesAt: Date;
}

/** What the join page needs: the state now and, when it is not open, the next session. */
export interface JoinStatus {
  state: JoinState;
  /** The session that is open now, else the next one to come, else the last one. */
  session: { start: Date; end: Date };
}

export function joinWindow(start: Date, end: Date): JoinWindow {
  return {
    opensAt: new Date(start.getTime() - JOIN_OPENS_BEFORE_MS),
    closesAt: new Date(end.getTime() + JOIN_CLOSES_AFTER_MS),
  };
}

export function joinState(window: JoinWindow, now: Date): JoinState {
  if (now < window.opensAt) return 'early';
  if (now > window.closesAt) return 'ended';
  return 'open';
}

/**
 * The state of a link with one or more sessions: open when any session's window is open, early
 * when one still lies ahead (also between two sessions), ended when every window has passed.
 */
export function joinStatus(
  sessions: ReadonlyArray<{ start: Date; end: Date }>,
  now: Date,
): JoinStatus {
  const list = sessions.map((s) => ({ ...s, window: joinWindow(s.start, s.end) }));
  const open = list.find((s) => joinState(s.window, now) === 'open');
  if (open) return { state: 'open', session: open };
  const next = list.find((s) => joinState(s.window, now) === 'early');
  if (next) return { state: 'early', session: next };
  return { state: 'ended', session: list[list.length - 1] ?? { start: now, end: now } };
}

export interface JoinLinks {
  /** The address both emails carry: <SITE_URL>/api/join/<token>. */
  create(payload: JoinPayload): string;
  /** The payload of a token, or null when it was not made by this server or was changed. */
  read(token: string): JoinPayload | null;
}

/**
 * The key comes from JOIN_LINK_SECRET, else from a server secret that already exists (the Google
 * client secret or the SMTP password), so links keep working across restarts with no extra setup.
 * null when the server holds none of them: the raw meeting link is then used, and the README says so.
 */
export function joinSecret(
  env: Pick<Env, 'JOIN_LINK_SECRET' | 'GOOGLE_CLIENT_SECRET' | 'SMTP_PASS'>,
): string | null {
  return env.JOIN_LINK_SECRET ?? env.GOOGLE_CLIENT_SECRET ?? env.SMTP_PASS ?? null;
}

const MEET_PREFIX = 'https://meet.google.com/';

/**
 * A short form of the payload, so the link stays short: a list of [bookingId, address, then the
 * start and end of every session as base 36 minutes]. A Google Meet address keeps only its code.
 */
function pack(payload: JoinPayload): string {
  const url = payload.url.startsWith(MEET_PREFIX)
    ? `~${payload.url.slice(MEET_PREFIX.length)}`
    : payload.url;
  const minutes = payload.sessions.flatMap((s) =>
    [s.start, s.end].map((iso) => Math.round(Date.parse(iso) / 60_000).toString(36)),
  );
  return JSON.stringify([payload.bookingId, url, ...minutes]);
}

function unpack(text: string): JoinPayload | null {
  const value: unknown = JSON.parse(text);
  if (!Array.isArray(value) || value.length < 4 || value.length % 2 !== 0) return null;
  const [bookingId, packed, ...rest] = value as unknown[];
  if (typeof bookingId !== 'string' || typeof packed !== 'string') return null;
  const url = packed.startsWith('~') ? `${MEET_PREFIX}${packed.slice(1)}` : packed;
  if (!/^https:\/\//i.test(url)) return null;
  const sessions: JoinPayload['sessions'] = [];
  for (let i = 0; i < rest.length; i += 2) {
    const start = typeof rest[i] === 'string' ? parseInt(rest[i] as string, 36) : NaN;
    const end = typeof rest[i + 1] === 'string' ? parseInt(rest[i + 1] as string, 36) : NaN;
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    sessions.push({
      start: new Date(start * 60_000).toISOString(),
      end: new Date(end * 60_000).toISOString(),
    });
  }
  return { bookingId, url, sessions };
}

export function createJoinLinks(secret: string, siteUrl: string): JoinLinks {
  const key = createHash('sha256').update(`faisalhanif.work/join-link\n${secret}`).digest();
  const base = siteUrl.replace(/\/+$/, '');

  return {
    create(payload) {
      const iv = randomBytes(IV_BYTES);
      const cipher = createCipheriv(ALGORITHM, key, iv);
      const body = Buffer.concat([cipher.update(pack(payload), 'utf8'), cipher.final()]);
      const token = Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
      return `${base}/api/join/${token}`;
    },

    read(token) {
      try {
        const raw = Buffer.from(token, 'base64url');
        if (raw.length <= IV_BYTES + TAG_BYTES) return null;
        const decipher = createDecipheriv(ALGORITHM, key, raw.subarray(0, IV_BYTES));
        decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));
        const text = Buffer.concat([
          decipher.update(raw.subarray(IV_BYTES + TAG_BYTES)),
          decipher.final(),
        ]).toString('utf8');
        return unpack(text);
      } catch {
        return null;
      }
    },
  };
}
