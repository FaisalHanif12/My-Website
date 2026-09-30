# API contract (frontend and backend both follow this)

The request bodies below are the exact objects the reference already builds for `window.FH_HOOKS` (checked against the reference file). The reference always wins: if the reference UI and this file ever disagree, fix this file first, then build. The frontend never changes the reference UI to suit the API.

Base URL: `NEXT_PUBLIC_API_URL`. JSON everywhere (plus an optional chat stream). All errors use one envelope:
`{ "ok": false, "error": { "code": "VALIDATION_ERROR" | "RATE_LIMITED" | "SLOT_TAKEN" | "UPSTREAM_ERROR" | "NOT_FOUND" | "INTERNAL", "message": string, "fields"?: Record<string,string> } }`

If `NEXT_PUBLIC_API_URL` is not set, the frontend behaves like the reference with no hooks: the contact form and booking open the visitor's mail app (mailto flow), and the chat uses the local responder.

## GET /api/health
200 `{ "ok": true, "status": "up" }`

## POST /api/chat
Body (what the reference sends to `FH_HOOKS.chatEndpoint`, L6392):
`{ "message": string, "history": [{ "role": "user" | "assistant", "content": string }] }`
- `message`: 1 to 500 characters (the reference chat input has `maxlength="500"`, L4487).
- `history`: at most 12 items (the reference sends `history.slice(-12)`). It already ends with the current user message, and it starts with the greeting, so the server must not add the current message a second time.
- User items: at most 500 characters. Assistant items: the server trims each one to 2000 characters instead of rejecting the request. Body limit for this route: 64 KB.

Response 200: `{ "ok": true, "reply": string }`. The reference reads `reply` (L6395) and renders it with its own small formatter (L6333-6341, L6377-6386), so replies must use only that format: paragraphs separated by a blank line, list lines starting with `-` or `1.`, `**bold**`, and `[label](url)` links whose URL starts with `https://`, `http://`, `mailto:`, `tel:` or `#`. No headings, tables or code blocks.

Optional stream: `?stream=true` returns `text/event-stream`, with events `data: {"delta":"..."}` and a final `data: [DONE]`. An error after streaming began is sent as `event: error` with data `{ "code", "message" }`, then the stream ends. The v1 frontend does not use it, because the reference shows typing dots and then the whole reply.

Client behaviour (from the reference): a 12 second timeout. On any error, timeout or 429, the frontend answers with the local responder. The local responder's action buttons are still attached to API replies (L6398).

Rate limits: 8 per minute and 60 per day per IP (429 with a `Retry-After` header), plus a global daily cap (BACKEND_SPEC.md). When the global cap is reached, return 200 with a friendly `reply` that points to the contact form.

## POST /api/contact
Body (the object the reference passes to `FH_HOOKS.onContact`, L5754, plus two anti-spam fields):
```
{
  "name": string,          // 2 to 120 characters
  "email": string,         // valid email, max 160
  "phone": string,         // "" or /^[+()\d\s.\-]{7,24}$/, max 40
  "company": string,       // "" or max 120
  "projectType": "App Development" | "Web Application" | "E-commerce" | "Maintenance & Support" | "Consultation" | "Other",
  "budget": "" | "Under $1,000" | "$1,000 - $5,000" | "$5,000 - $10,000" | "$10,000+",
  "details": string,       // 20 to 2000 characters
  "website"?: string,      // honeypot: if filled, return 200 and send nothing
  "startedAt": number      // ms when the form was first shown; reject submits under 3 seconds
}
```
- The honeypot is a visually hidden input (off screen, `aria-hidden`, `tabindex="-1"`, `autocomplete="off"`), so the form looks exactly like the reference.
- A submit that comes less than 3 seconds after `startedAt` returns 400 `VALIDATION_ERROR` with `fields.startedAt`; the frontend shows the reference error toast.
- `VALIDATION_ERROR` returns `fields` keyed by the names above. The frontend shows the reference's own messages (L5666-5682), not the server text.
- 200 `{ "ok": true }`. Sends the owner email (Reply-To = visitor) and the visitor confirmation. Rate limit: 5 per hour per IP.
- Any error: the frontend shows the reference error toast "That did not go through. Please try again or email me directly." (L5773).

## POST /api/booking
Header: `Idempotency-Key: <uuid>` (stops double submits).
Body (the object the reference passes to `FH_HOOKS.onBooking`, `bookingData()` at L6112-6117, plus the honeypot):
```
{
  "sessionType": "quick" | "deep",
  "sessionName": string,        // "Quick Chat" | "Technical Deep Dive"
  "durationMinutes": number,    // 30 | 60
  "pricePerSession": number,    // 15 | 25
  "sessions": number,           // integer, 1 to 10
  "total": number,              // pricePerSession x sessions
  "currency": "USD",
  "email": string,
  "name": string,               // at least 2 characters
  "phone": string,              // "" allowed
  "company": string,            // "" allowed
  "date": "YYYY-MM-DD",         // optional and ignored: every slot carries its own day (PKT)
  "timezone": string,           // IANA zone chosen in the modal
  "startUtc": string,           // optional and ignored when `slots` is sent
  "slots": string[],            // ISO start of every booked session, one per session (owner change, 2026-09-29)
  "timeLocal": string,          // for display only, for example "2:00 PM"
  "timeLahore": string,         // for display only
  "platform": "Google Meet",   // the only platform (Zoom removed 2026-10-01); defaults to it when left out
  "notes": string,              // max 800 characters, "" allowed
  "website"?: string            // honeypot
}
```
Server rules:
- A filled honeypot returns a normal-looking 200 and creates nothing.
- The date window (tomorrow up to 60 days) is checked in the payload `timezone`, matching the reference calendar, which uses the visitor's own clock. `GET /api/booking/slots` serves the widest range (today to 61 days ahead in PKT), returns `[]` for a date outside it and 400 for a weekend.
- The `Idempotency-Key` header matches `/^[A-Za-z0-9_-]{8,128}$/` (for example a uuid): one per submit attempt, reused when that attempt is retried.
- Trust only `sessionType`, `sessions`, `email`, `name`, `phone`, `company`, `date`, `timezone`, `startUtc`, `platform` and `notes`. Recompute the session name, duration, price, total and every formatted time on the server.
- `slots` has exactly `sessions` different entries (they may be on different days). Each must be a start time of its session type on a weekday (Mon to Fri in PKT): a Quick Chat (30 min) starts every 30 minutes from 09:00 to 17:30 PKT, a Technical Deep Dive (60 min) every 60 minutes from 09:00 to 17:00 PKT, so every session ends by 18:00. Each must be from tomorrow up to 60 days ahead (in the payload `timezone`) and at least 2 hours from now.
- One calendar event is made per slot. The first creates the Google Meet room, the others reuse its address, so all sessions share one meeting link. If any slot is taken (409) or any event fails (502), nothing is kept: the events already made are deleted and no email is sent.
- 200 `{ "ok": true, "bookingId": string, "meetLink": string | null, "start": ISO string, "end": ISO string }`. `meetLink` is the join link of the Google Meet room. The response also holds `sessions: [{ start, end }]`, one entry per booked session. The value is the site's join link (`<SITE_URL>/api/join/<token>`), which redirects to the real meeting only from 10 minutes before the session until 15 minutes after it should end (owner request, 2026-09-29). `GET /api/join/:token` answers 302 inside that window, 200 "not open yet" before it, 410 after it and 404 for a token that is not valid.
- The frontend then shows the reference done screen, with its copy and ticket unchanged. It does not add the link to the screen.
- 409 `SLOT_TAKEN`: the frontend goes back to step 2, reloads the slots, and shows "That time was just taken. Please pick another slot." in the reference's existing slot error element (`#ct-bk-slot-err`).
- Any other error: the reference toast "Booking did not go through. Please try again." (L6155).
- Rate limit: 3 per hour per IP.
Creates one Google Calendar event, then emails the visitor and the owner the SAME link with all the details and an .ics invite (BACKEND_SPEC.md section 3).

## GET /api/booking/slots?date=YYYY-MM-DD&session=quick|deep
200 `{ "ok": true, "timezone": "Asia/Karachi", "slots": ["09:00", "10:00", ..., "17:00"] }`: the free hourly start times in PKT for that day. Taken times are left out. A Quick Chat gets a start every 30 minutes (`"09:00", "09:30"` .. `"17:30"`), a Deep Dive every 60 (`"09:00"` .. `"17:00"`).
The frontend renders only the free times, using the reference slot buttons and no new styles. If a picked day has no free time, the frontend disables that day with the calendar's existing disabled style and shows "That day is fully booked. Please pick another weekday." in the existing date error element (`#ct-bk-date-err`).

## GET /api/booking/config
200:
```
{
  "ok": true,
  "platforms": { "meet": true },
  "sessions": {
    "quick": { "name": "Quick Chat", "minutes": 30, "price": 15 },
    "deep":  { "name": "Technical Deep Dive", "minutes": 60, "price": 25 }
  },
  "maxSessions": 10,
  "currency": "USD",
  "windowDays": 60,
  "hours": { "days": "Mon-Fri", "start": "09:00", "end": "18:00", "firstSlot": "09:00", "lastSlot": "17:00", "stepMinutes": 60, "timezone": "Asia/Karachi" }
}
```
The frontend does not change the UI based on this response.
