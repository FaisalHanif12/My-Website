# Tech stack

Check the latest stable versions with `npm view <pkg> version` before installing, and pin exact versions.

## Frontend (frontend/)
- Next.js (latest stable, App Router), React and TypeScript strict. Node 20 LTS or newer.
- Styling: port the reference CSS as it is, split to mirror its sections:
  - `src/styles/tokens.css` (the `:root` and dark tokens)
  - `base.css` (shared components)
  - `layout.css` (rail, top bar, dock, curtain, preloader)
  - one file per feature: `about.css`, `profile.css`, `works.css`, `approvals.css`, `contact.css`, `overlays.css`
  All are imported once in the root layout. Class names and prefixes (`ab-`, `pf-`, `wk-`, `ct-`) stay unchanged so the result stays pixel identical. No Tailwind and no renamed classes.
- Fonts: next/font with explicit weights: Plus Jakarta Sans 400, 500, 600, 700, 800; Instrument Serif italic 400 (the normal face is never shown, so it is not loaded); JetBrains Mono 400, 500. tokens.css builds the reference's `--font-sans`, `--font-serif` and `--font-mono` from the next/font variables (see .claude/plans/orchestrator-decisions.md).
- Images: next/image (AVIF/WebP) with explicit sizes. Priority only on each route's LCP image.
- Motion: port the reference's vanilla JS into small React hooks and components: useReveal, useMagnetic, useSpotlight, useTilt, useParallax, useSmoothScroll, usePageTransition, useCountUp. Use requestAnimationFrame, and animate only what the reference animates (transform, opacity, filter, clip-path, border-radius, background-size, the translate property and CSS variables). Clean up in effects. Add no animation library unless it is needed to match the reference. Magnetic and tilt may be ported as one document-level delegation module (like the reference's FH.bind) instead of per-element hooks, and components render the reference markup and classes directly instead of generic Button, Pill and Card wrappers (frontend plan, shared decisions).
- Theme: an inline script in the root layout sets `data-theme` before paint, plus a ThemeProvider.
- State: React state and context only.
- Content: typed data files in `src/content/` (site, profile, experience, education, skills, services, testimonials, pricing, projects, certificates, socials).
- API client: `src/lib/api.ts` with typed chat, contact and booking calls, whose bodies are exactly the reference `FH_HOOKS` payloads (API_CONTRACT.md). Chat uses the JSON reply with the reference's 12 second timeout and falls back to the local responder, as the reference does. It reads `NEXT_PUBLIC_API_URL`; when that is not set, the forms use the reference mailto flow. It uses timeouts and fails gracefully.
- Tooling: ESLint, Prettier, Vitest and Testing Library, Playwright with pixelmatch for visual diffs.
- Structure:
  - `src/app/` (layout, About page, profile/, works/, approvals/, contact/, sitemap, robots, opengraph-image)
  - `src/components/layout/` (Rail, TopBar, Dock, Curtain, Preloader, AmbientBackground, NextPageLink)
  - `src/components/ui/` (Button, Pill, Card, Modal, Toast, Icon, IconSprite)
  - `src/components/motion/`
  - `src/features/{about,profile,works,approvals,contact,booking,chat}/`
  - `src/content/`, `src/lib/`, `src/hooks/`, `src/styles/`, `public/`, `tests/`

## Backend (backend/)
- Node.js 20 LTS or newer, TypeScript strict, Express (latest stable). Built with tsc and run with tsx in dev.
- Packages: openai (official SDK, pointed at OpenRouter's base URL), nodemailer, googleapis (Calendar + Meet), zod, helmet, cors, express-rate-limit, pino + pino-http, dotenv, ics, date-fns + date-fns-tz. BACKEND_SPEC.md says how each is used.
- Tests: Vitest and Supertest, with OpenRouter, Google and the mail transport mocked.
- Structure:
  - `src/app.ts`, `src/server.ts`
  - `src/config/env.ts` (zod-validated env that fails fast)
  - `src/routes/`, `src/controllers/`
  - `src/services/` (chat (OpenRouter), mail, booking, meeting provider (Google Meet), calendar, knowledge)
  - `src/validators/`
  - `src/middleware/` (error handler, not found, rate limit, request id)
  - `src/templates/` (email HTML + text)
  - `src/knowledge/portfolio.json`
  - `tests/`
- Env (`.env.example`): the full list is in BACKEND_SPEC.md (OpenRouter, Gmail SMTP, Google Calendar, rate limits). Any SMTP provider must work by changing env only.

## Hosting (owner decision: the same VPS that serves faisalhanif.work today)
- The live site runs on an Ubuntu server with nginx. Both apps deploy there.
- Frontend: `next.config` uses `output: 'standalone'`. On the server: `npm ci && npm run build`, copy `public/` and `.next/static` next to the standalone server, run `node .next/standalone/server.js` on a local port (for example 3000) under PM2 or systemd, and let nginx proxy faisalhanif.work to it.
- Backend: `npm ci && npm run build`, run `node dist/server.js` on a local port (for example 8787) under PM2 or systemd, with `CORS_ORIGINS=https://faisalhanif.work`. nginx proxies `/api/` (same domain) or a subdomain such as `api.faisalhanif.work` to it; the frontend's `NEXT_PUBLIC_API_URL` points there. With `/api` on the same domain, disable nginx response buffering for the chat route.
- Both READMEs include ready-to-use PM2 (or systemd) and nginx examples. Agents never change the server; the owner applies the steps.
- Config comes from env only.
