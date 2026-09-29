# Faisal Hanif portfolio: frontend

The Next.js app behind [faisalhanif.work](https://faisalhanif.work). It rebuilds the single file
reference design (`../reference-design/faisalhanif-redesign.html`) as real routes with the same
layout, copy, themes, motion and behaviour, pixel for pixel. The reference is the source of truth:
when this app and the reference disagree, the reference wins.

Routes: `/` (About), `/profile`, `/works`, `/approvals` and `/contact`. The chat, contact form and
booking talk to the Node.js API in `../backend` when `NEXT_PUBLIC_API_URL` is set, and fall back to
the reference behaviour (mailto flow and the local chat responder) when it is not.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 6 in strict mode
- Plain global CSS ported from the reference (`src/styles`), no Tailwind, no animation library
- ESLint 9 (`eslint-config-next` core web vitals and TypeScript rules, then `eslint-config-prettier`)
  and Prettier 3
- Vitest 5 with jsdom and Testing Library for unit tests
- Playwright with pixelmatch for visual diffs against the reference, plus e2e and axe accessibility
  tests, and Lighthouse for performance budgets

Every version is pinned exactly in `package.json`. The package is an ES module (`"type": "module"`),
so scripts and configs use `import` and `import.meta.dirname` instead of `require` and `__dirname`.

## Requirements

- Node.js, with two different minimums:
  - Building and running the app (`next build`, `next start` and the standalone server) needs Node
    20.9 or newer, the Next.js 16 minimum. This is what `engines` in `package.json` describes.
  - The dev and test tooling (Vitest, jsdom, jest-dom and Lighthouse) needs Node 22.22.2 or newer
    on the 22 line, 24.15 or newer on the 24 line, or Node 26 or newer. On older Node, `npm ci`
    prints `EBADENGINE` warnings and the test tools are unsupported.
  - Use Node 24 LTS or Node 26 for development (this project is developed on Node 26).
- npm 10 or newer
- For the visual, e2e and accessibility tests: Playwright's Chromium (installed in the setup below)

## Setup

```bash
cd frontend
npm ci
npx playwright install chromium
cp .env.example .env.local   # then fill in the values you need
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                 | What it does                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`          | Starts the dev server on port 3000.                                          |
| `npm run build`        | Production build (`output: 'standalone'`).                                   |
| `npm run start`        | Serves the production build with `next start`.                               |
| `npm run lint`         | ESLint over the whole project.                                               |
| `npm run typecheck`    | Generates the Next route types (once `src/app` exists), then `tsc --noEmit`. |
| `npm run test`         | Runs every Vitest unit test once (`*.test.ts` and `*.test.tsx`).             |
| `npm run test:watch`   | Vitest in watch mode.                                                        |
| `npm run test:visual`  | Playwright visual suite: every route, width and theme against the reference. |
| `npm run test:e2e`     | Playwright end to end tests.                                                 |
| `npm run test:a11y`    | Playwright accessibility tests with axe.                                     |
| `npm run visual`       | One visual comparison with options (see "Visual diff harness" below).        |
| `npm run lighthouse`   | Lighthouse runs for the performance budgets (`scripts/lighthouse.mjs`).      |
| `npm run format`       | Formats the project with Prettier.                                           |
| `npm run format:check` | Checks formatting without writing.                                           |

Vitest picks up `src/**/*.test.{ts,tsx}` and `tests/**/*.test.{ts,tsx}`. Playwright picks up
`*.spec.ts` files under `tests/` (projects `visual`, `e2e` and `a11y`). `tests/unit/referenceText.ts`
gives content tests the reference text (HTML entities and JS string escapes decoded) and a
`collectStrings()` walker that lists every string in a content object with its path.

## Environment variables

Copy `.env.example` to `.env.local` for development. Never commit real env files (only
`.env.example` is tracked).

| Variable               | Example                    | Meaning                                                                                                                                                             |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | `https://faisalhanif.work` | Origin of the backend; the client calls `/api/chat`, `/api/contact` and `/api/booking/*` on it. Empty keeps the reference mailto flow and the local chat responder. |
| `NEXT_PUBLIC_SITE_URL` | `https://faisalhanif.work` | Public site origin for canonical URLs, Open Graph, the sitemap and robots.txt.                                                                                      |

Both are `NEXT_PUBLIC_` variables, so Next.js writes their values into the client bundle at build
time. Set them before `npm run build` and rebuild after changing them. For local work against the
backend, use `NEXT_PUBLIC_API_URL=http://localhost:8787`.

## Visual diff harness

The visual harness compares the app with the reference in Playwright Chromium and writes the
reference, app and diff screenshots to `tests/visual/out/`. It needs both servers running:

- the reference at `http://localhost:4400/faisalhanif-redesign.html` (serve `reference-design/`
  on port 4400 with any static server, for example
  `python3 -m http.server 4400 --directory reference-design` from the project root)
- the app at `http://localhost:3000` (`npm run dev`)

One comparison:

```bash
npm run visual -- --route /works --width 1440 --theme dark
```

Options:

- `--route` `/`, `/profile`, `/works`, `/approvals`, `/contact` or `all` (default `/`)
- `--width` `1440`, `1280`, `1024`, `891`, `768`, `390`, `360` or `all`
- `--theme` `light`, `dark` or `both` (default `light`)
- `--selector "<css>"` compares one element instead of the full page
- `--hover "<css>"` and `--click "<css>"` (repeatable) set up a state on both sides first
- `--wait <ms>` extra settle time (default 300), `--motion` turns reduced motion off
- `--tag <name>` adds a suffix to the output names
- `--max <percent>` fails when any diff is above it (default 0.5)
- `--ref-url` and `--app-url` override the servers (or set `REF_URL` and `APP_URL`)

Each capture prints `route width theme diffPercent`. The full suite is `npm run test:visual`.

## Deploy to the VPS

The site runs on the same Ubuntu server with nginx that serves faisalhanif.work today. The
frontend runs as a standalone Node server on port 3000 and the backend on port 8787; nginx sends
the site to the frontend and `/api/` to the backend. These are ready to use examples: the owner
applies them on the server. Paths below assume the repo is checked out at `/var/www/faisalhanif`;
change them to match the server. The server needs Node 20.9 or newer to build and run the app;
Node 24 LTS is recommended.

### 1. Build

```bash
cd /var/www/faisalhanif/frontend
# Production values, read at build time (never commit this file)
printf 'NEXT_PUBLIC_API_URL=https://faisalhanif.work\nNEXT_PUBLIC_SITE_URL=https://faisalhanif.work\n' > .env.production.local
npm ci
npm run build
# The standalone server does not copy these by itself
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

`.next/standalone/server.js` is now a self contained server. It reads `PORT` and `HOSTNAME` from
the environment. Run the build and copy steps again on every deploy, then restart the process.

### 2a. Run with PM2

```bash
cd /var/www/faisalhanif/frontend
NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1 \
  pm2 start .next/standalone/server.js --name faisalhanif-frontend
pm2 save
pm2 startup   # once, so PM2 starts again after a reboot
# After each new build:
pm2 restart faisalhanif-frontend
```

### 2b. Or run with systemd

`/etc/systemd/system/faisalhanif-frontend.service`:

```ini
[Unit]
Description=faisalhanif.work frontend (Next.js standalone)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/faisalhanif/frontend/.next/standalone
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now faisalhanif-frontend
# After each new build:
sudo systemctl restart faisalhanif-frontend
```

### 3. nginx

`/etc/nginx/sites-available/faisalhanif.work` (the TLS lines are the usual Certbot ones; keep the
ones the server already has):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name faisalhanif.work www.faisalhanif.work;
    return 301 https://faisalhanif.work$request_uri;
}

server {
    # Works on every nginx version (1.25.1 or newer only prints a deprecation notice). On
    # nginx 1.25.1 or newer it can also be written as "listen 443 ssl;" and
    # "listen [::]:443 ssl;" plus "http2 on;".
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name faisalhanif.work;

    ssl_certificate     /etc/letsencrypt/live/faisalhanif.work/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/faisalhanif.work/privkey.pem;

    client_max_body_size 1m;

    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Chat: no response buffering, so the optional event stream reaches the browser at once
    location = /api/chat {
        proxy_pass http://127.0.0.1:8787;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 60s;
    }

    # The rest of the API (health, contact, booking)
    location /api/ {
        proxy_pass http://127.0.0.1:8787;
    }

    # The site (Next.js standalone server)
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/faisalhanif.work /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

With the API on the same domain, set `NEXT_PUBLIC_API_URL=https://faisalhanif.work` here and
`CORS_ORIGINS=https://faisalhanif.work` in the backend env (see `../backend/README.md`).

### 4. Check

- `https://faisalhanif.work/` and the four other routes load, in both themes.
- `https://faisalhanif.work/imgs/Faisal-CVS.pdf` downloads the CV.
- `https://faisalhanif.work/sass-app.html` opens, and `/index.html` redirects to `/`.
- `https://faisalhanif.work/api/health` returns `{ "ok": true, "status": "up" }`.
