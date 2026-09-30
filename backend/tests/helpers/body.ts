/**
 * The JSON bodies the API sends, typed for tests. supertest types `res.body` as `any`; this
 * gives the fields tests read a type. A field a response does not have is undefined at run time
 * (the assertion then fails), so the type lists every field as present.
 */
export interface ApiBody {
  ok: boolean;
  reply: string;
  bookingId: string;
  meetLink: string | null;
  start: string;
  end: string;
  timezone: string;
  slots: string[];
  platforms: { meet: boolean };
  sessions: Record<string, { name: string; minutes: number; price: number }>;
  hours: { timezone: string };
  error: { code: string; message: string; fields: Record<string, string> };
}

export function bodyOf(res: { body: unknown }): ApiBody {
  return res.body as ApiBody;
}
