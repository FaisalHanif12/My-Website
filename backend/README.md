# Faisal Hanif portfolio API

Node.js + Express + TypeScript API for [faisalhanif.work](https://faisalhanif.work). It has three
features and nothing else:

| Feature      | Endpoint                                                                 | What it does                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI chatbot   | `POST /api/chat`                                                         | Answers visitors as "Faisal's AI assistant" through OpenRouter, using the facts in `src/knowledge/portfolio.json`.                                   |
| Contact form | `POST /api/contact`                                                      | Emails the owner (Reply-To is the visitor) and sends the visitor a confirmation, through SMTP (Gmail by default).                                    |
| Booking      | `POST /api/booking`, `GET /api/booking/slots`, `GET /api/booking/config` | Checks the slot, creates one Google Calendar event with a Google Meet link and emails the owner and the visitor the same link with an `.ics` invite. |

Plus `GET /api/health`. Request and response shapes are in [`.claude/prd/API_CONTRACT.md`](../.claude/prd/API_CONTRACT.md).
Every error uses one envelope: `{ "ok": false, "error": { "code", "message", "fields"? } }`.

## Run it

```bash
cd backend
npm ci
cp .env.example .env     # then fill in what you need (below)
npm run dev              # http://127.0.0.1:8787, restarts on change
npm run dev:fake         # same, with local fakes for OpenRouter, SMTP and Google (no keys needed)
```

`dev:fake` answers chat from the built in knowledge base, writes every email to `backend/tmp/mail/`
(open the `.html` files) and keeps calendar events in memory. Use it to try the site end to end.

| Script                                                      | Purpose                                                                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run build` / `npm start`                               | Compile to `dist/` and run `node dist/server.js`.                                                        |
| `npm run typecheck`, `npm run lint`, `npm run format:check` | Static checks.                                                                                           |
| `npm test`, `npm run test:coverage`                         | Vitest and Supertest. Every external service is faked; no real call is ever made.                        |
| `npm run check:env`                                         | Shows what is configured and tests the SMTP login and the Google token.                                  |
| `npm run check:chat -- "your question"`                     | One real OpenRouter call.                                                                                |
| `npm run check:contact`                                     | Sends the two real contact emails.                                                                       |
| `npm run check:booking`                                     | Books the next free slot for real (Meet link, both emails). Add `-- --delete` to remove the event again. |
| `npm run google:auth`                                       | One time: prints the Google refresh token.                                                               |
| `npm run mail:preview`                                      | Writes every email template to `tmp/mail-preview/`.                                                      |

## Set up the three features

All keys go in `backend/.env`. The file is ignored by git: never commit it. Every key is optional; a
feature whose keys are missing answers `503` and the site falls back to its built in behaviour
(the mail app for the forms, the local answers for the chat).

### 1. Chat (OpenRouter)

1. Create a key at <https://openrouter.ai/keys> and set `OPENROUTER_API_KEY`.
2. Pick a model at <https://openrouter.ai/models> and set `OPENROUTER_MODEL` (for example `provider/model-name`).
   No model is hard coded. Optionally list backups in `OPENROUTER_FALLBACK_MODELS` (comma separated).
3. Test it: `npm run check:chat -- "What are your rates?"`.

Limits: 500 characters per message, the last 12 messages of history, 8 messages per minute and 60
per day per IP, and `CHAT_DAILY_GLOBAL_LIMIT` (default 1000) per day for everyone. At the global
limit the visitor gets a normal answer that points to the contact form. The whole request has an
11 second budget (the site gives up after 12): one retry, then the fallback models, then a 502 and
the site answers from its local responder.

### 2. Contact form (Gmail SMTP)

1. Turn on 2-Step Verification for the Gmail account, then create an App Password at
   <https://myaccount.google.com/apppasswords>.
2. Set `SMTP_USER` (the Gmail address), `SMTP_PASS` (the App Password, not the normal one) and
   `MAIL_TO_OWNER` (the inbox that gets the messages). `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`,
   `SMTP_SECURE=true` are the defaults; any SMTP host works by changing these.
3. Test it: `npm run check:env` (login) and `npm run check:contact` (sends both emails).

The form is protected by a hidden honeypot field, a 3 second minimum fill time and 5 messages per
hour per IP. All visitor text is escaped in the HTML emails.

### 3. Booking (Google Calendar + Google Meet)

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project and enable the
   **Google Calendar API**.
2. Configure the **OAuth consent screen** (External). Add your Google account as a test user, or
   **publish the app**: while an app is in "Testing" its refresh token expires after 7 days.
3. Create an **OAuth client ID** of type **Web application** and add
   `http://127.0.0.1:3456/oauth2callback` as an authorised redirect URI.
4. Put the client id and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then run
   `npm run google:auth`. Open the address it prints, approve, and paste the printed
   `GOOGLE_REFRESH_TOKEN=...` line into `.env`.
5. `GOOGLE_CALENDAR_ID=primary` is your main calendar. `BOOKING_TIMEZONE=Asia/Karachi` is the zone of
   the working hours.
6. Test it: `npm run check:env`, then `npm run check:booking`. Open the printed link and check both
   emails: they must show the same Meet link.

Rules (the same as the site's calendar): Monday to Friday, hourly starts 09:00 to 17:00 Pakistan
time, from tomorrow up to 60 days ahead, at least 2 hours of notice, and free on your calendar. A
taken slot answers `409 SLOT_TAKEN`. Names, prices and totals are recomputed on the server. The
`Idempotency-Key` header stops double submits. 3 bookings per hour per IP.

If Google fails, nothing is emailed and the visitor sees the normal "try again" message. If the
emails fail after the event exists, the booking still succeeds and the error is logged with the
booking id so you can send the emails yourself.

**Zoom is optional.** Without `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` (a
Server-to-Server OAuth app from <https://marketplace.zoom.us>), a visitor who picks Zoom still gets
a calendar event; the emails say you will send the Zoom link before the call and the owner email
flags it. `GET /api/booking/config` reports `zoom: false` in that case.

## Deploy on the Ubuntu VPS (nginx + PM2)

```bash
# once: Node 24 (see .nvmrc), nginx, certbot, pm2
sudo npm i -g pm2

cd /var/www/faisal-portfolio/backend
git pull && npm ci && npm run build
cp .env.example .env && nano .env         # NODE_ENV=production, CORS_ORIGINS=https://faisalhanif.work, keys
npm run check:env                          # optional: test SMTP and Google from the server
pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
```

- `NODE_ENV=production` requires `CORS_ORIGINS` and refuses `DEV_FAKE_EXTERNALS`.
- `TRUST_PROXY=1` (one nginx in front) lets the rate limits see the real visitor IP.
- Run **one** process. Rate limits, slot locks and idempotency records live in memory
  (`src/store`); to scale out, add a Redis implementation of the `Store` interface.
- nginx: [`deploy/nginx.conf.example`](deploy/nginx.conf.example) serves the site and proxies
  `/api/` to `127.0.0.1:8787` with response buffering off (needed only for `?stream=true`).
- Check it: `curl https://faisalhanif.work/api/health` should print `{"ok":true,"status":"up"}`.
- Logs are JSON (`pm2 logs faisal-portfolio-api`). Emails, names, phone numbers, notes, IP addresses
  and secrets are never logged. Failed booking emails log at error level with the booking id.

To use systemd instead of PM2, run `node dist/server.js` from a unit with `WorkingDirectory=` set
to `backend/`, `EnvironmentFile=` pointing at `.env` and `Restart=always`.

## Project layout

```
src/
  app.ts, server.ts        Express app, listen, graceful shutdown
  config/env.ts            zod validated environment
  routes/                  chat, contact, booking-info and booking routers (one module each)
  services/                chat (OpenRouter), contact, booking, calendar (Google), meeting (Meet, Zoom), mail (SMTP)
  knowledge/portfolio.json the facts the chat answers from (kept in sync with the site content)
  templates/               HTML and text emails
  validators/, middleware/, store/, lib/
scripts/                   check:* and google:auth
tests/                     Vitest and Supertest
deploy/                    PM2 file and nginx example
```

## Security notes

- The OpenRouter key, SMTP password and Google tokens stay on the server. Never put them in the frontend.
- CORS allows only `CORS_ORIGINS`. Helmet is on. JSON bodies are limited to 32 KB (64 KB for chat).
- User text can not change the chat rules: it is sent as user messages and the system prompt says so.
- If a key was ever pasted somewhere public, revoke it and create a new one.
