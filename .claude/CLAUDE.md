# Faisal Hanif Portfolio (Next.js + Node.js)

## What we are building
A production rebuild of the portfolio at faisalhanif.work. The design is final and lives in `reference-design/faisalhanif-redesign.html`. The job is to replicate it EXACTLY: same layout, spacing, type, colours, light and dark themes, motion, interactions and responsiveness at every width. The code must be clean, typed, modular, scalable and production grade. The reference is the single source of truth. When in doubt, open it and match it.

## The reference always wins
If anything in `.claude/` (PRD, tech stack, specs, contract, checklist, reference map), a lead's brief or a worker's idea conflicts with the reference design, the reference wins. Build it exactly as the reference has it: same markup, classes, copy, states, field names, timings and behaviour. Do not add new UI states, labels or notes that the reference does not have. Then fix the doc that was wrong and tell the orchestrator. Backend and API choices must fit what the reference UI already does, never the other way round.

## Folders
- reference-design/ (holds faisalhanif-redesign.html): read only. Never edit.
- frontend/: Next.js App Router app (TypeScript). Owner: frontend-lead. The old site assets `imgs/` and `vedioes/` sit here now and move into `frontend/public/` during scaffolding.
- backend/: Node.js + Express API (TypeScript). Owner: backend-lead.
- .claude/prd/: PRD, tech stack, git workflow, API contract, QA checklist, reference map.
- .claude/agents/: the two team leads.

The project root path has spaces in it (`My Projects /Faisal-Website`, with a space before the slash), so always quote paths in shell commands.

## Read order for every agent
1. This file 2. prd/PRD.md 3. prd/TECH_STACK.md 4. prd/BACKEND_SPEC.md 5. prd/REFERENCE_MAP.md 6. prd/API_CONTRACT.md 7. prd/GIT_WORKFLOW.md 8. prd/QA_CHECKLIST.md 9. plans/orchestrator-decisions.md (answers to the reference quirk questions; binding)
REFERENCE_MAP.md is large (about 9,600 lines). Use the index at the top of its section 11 and read only the parts you need, with offsets.

## How agents work here (important)
- Work in small steps and make a tool call at least every few minutes. An agent that goes about 10 minutes without progress is killed and restarted from its brief. Never compose one huge file or message in a single step; write files in pieces.
- Assume you may be a restart. First look at the files you own and continue from what is there. Never redo finished work.

## Team and orchestration
Claude Code subagents cannot start their own subagents. So the MAIN session is the orchestrator and runs this loop:
1. Plan: ask frontend-lead and backend-lead (in parallel) for a work breakdown. Each breakdown is a list of small, independent task briefs. Each brief names:
   - the files it owns
   - the reference sections to match
   - its dependencies
   - its acceptance checks
2. Build: for each brief whose dependencies are met, spawn a general-purpose worker agent in parallel. Paste the lead's brief in full. Workers read this file and the PRD first, and only touch the files their brief owns.
3. Review: send each worker's report back to its lead. The lead reviews the code and runs the checks. It returns PASS or a fix list, and each fix list becomes new briefs.
4. Repeat until each lead signs off its whole area against QA_CHECKLIST.md.
5. Integrate: both leads verify the API contract end to end together.
6. Final check: one fresh agent that has not seen the work runs the full QA_CHECKLIST.md.
Build shared foundations first: tokens, global CSS, layout shell, motion hooks, content data, API client and the backend skeleton. Then fan out pages and endpoints in parallel. Two workers never own the same file.

## Commands
- frontend: `cd frontend && npm run dev | build | start | lint | typecheck | test | test:visual`
- backend: `cd backend && npm run dev | build | start | lint | typecheck | test`

## Rules
- Match the reference pixel for pixel. Do not redesign, rename copy or change motion timings.
- All copy comes from the reference, word for word, with its punctuation. The reference has 6 em dashes in visible copy (L3449, L3609, and four project descriptions in the works.js data at L6865, L6868, L6871 and L6874); keep them exactly. The no em dash rule applies only to NEW text: docs, error messages and emails, which are plain English with no em dashes.
- When the reference and a doc disagree, the reference wins (see "The reference always wins").
- TypeScript strict. No `any` without a comment explaining why. ESLint and Prettier clean.
- Content lives in typed data files, never hard coded in components.
- Respect `prefers-reduced-motion` everywhere, exactly like the reference.
- The repo is PUBLIC. Never commit secrets, .env files or keys. Every env var goes in `.env.example`.
- Follow prd/GIT_WORKFLOW.md for every git action. Never push to main or merge without the owner's explicit "yes, merge".
- Before calling anything done: build, lint, typecheck, tests and the visual diff for that part all pass.
