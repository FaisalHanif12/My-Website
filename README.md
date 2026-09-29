# Faisal Hanif portfolio

The production rebuild of [faisalhanif.work](https://faisalhanif.work): a Next.js app and a Node.js
API. The design lives in `reference-design/faisalhanif-redesign.html` and is replicated pixel for
pixel; when anything disagrees with that file, the file wins.

| Folder              | What                                                                                                                     | Docs                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `frontend/`         | Next.js 16 (App Router, TypeScript strict). Five routes, booking modal, chat widget, contact form.                       | [frontend/README.md](frontend/README.md)                   |
| `backend/`          | Express 5 API: AI chat (OpenRouter), contact email (Gmail SMTP), booking (Google Calendar + Meet, emails to both sides). | [backend/README.md](backend/README.md)                     |
| `reference-design/` | The design source of truth. Read only.                                                                                   |                                                            |
| `.claude/`          | Product, tech, API and QA docs (`prd/`), and the agent setup.                                                            | [.claude/prd/QA_CHECKLIST.md](.claude/prd/QA_CHECKLIST.md) |

## Run everything locally

```bash
# terminal 1: the API (fill backend/.env first, or use `npm run dev:fake` for local fakes)
cd backend && npm ci && npm run dev

# terminal 2: the site (frontend/.env.local holds NEXT_PUBLIC_API_URL=http://localhost:8787)
cd frontend && npm ci && npm run dev
```

Open <http://localhost:3000>. Without `NEXT_PUBLIC_API_URL` the site behaves like the reference
(forms open the mail app, the chat answers locally).

## Environment

Real values live in ignored files only (`backend/.env`, `frontend/.env.local`); the repo is public.
`backend/.env.example` and `frontend/.env.example` list every variable. Test each feature with your
own keys using `npm run check:env`, `check:chat`, `check:contact` and `check:booking` in `backend/`.

## Deploy

Ubuntu VPS with nginx: the Next.js standalone server on port 3000 and the API on 8787, both under
PM2. See the "Deploy" sections of the two READMEs, `backend/deploy/ecosystem.config.cjs` and
`backend/deploy/nginx.conf.example`.
