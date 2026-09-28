# Git workflow: build on a new branch, then replace the old site

## Background
- The old portfolio is in the PUBLIC repo https://github.com/FaisalHanif12/My-Website. Its main branch (or master) deploys the live site faisalhanif.work.
- We do not start a new repo. We build the new project on a new branch of this repo. When it is finished and approved, we merge that branch into main. The new Next.js + Node.js code then fully replaces the old site.
- Because the repo is public, everything committed is visible to everyone. Never commit .env files, API keys, SMTP passwords or tokens.

## Step 1: connect the project folder to the repo (at the start of the build)
1. At the project root (the folder holding reference-design/, frontend/ and backend/), run `git init` if it is not a repo yet. Then `git remote add origin https://github.com/FaisalHanif12/My-Website.git` and `git fetch origin`. The repo is public, so fetching needs no login.
2. Find the default branch with `git remote show origin`. Call it MAIN below.
3. Look at the old site with `git ls-tree -r --name-only origin/MAIN`. Note how it deploys (vercel.json, netlify.toml, CNAME, .github/workflows, package.json) and where its assets are (imgs/, vedioes/).

## Step 2: keep the old site safe
- `git branch backup/old-portfolio origin/MAIN`
- `git tag old-portfolio-final origin/MAIN`
- Ask the owner before pushing them. Then run `git push origin backup/old-portfolio --tags`.
Now the old site can always come back.

## Step 3: create the work branch
- `git checkout -b feature/new-portfolio origin/MAIN`. The new project folders are untracked, so they stay. If any path clashes, stop and ask.
- Remove every old site file from this branch with `git rm` (tracked files only), so the branch holds only the new project. Before you remove any deploy config (CNAME, vercel.json, netlify.toml, workflows), list those files and ask the owner, because they may control the domain.
- BEFORE the `git rm`: copy the old `sass-app.html` and every file it loads (CSS, JS, images, videos) into `frontend/public/` at the same relative paths, so `https://faisalhanif.work/sass-app.html` keeps working after the merge (the reference's PureBody "Open full page" link points there). If it cannot be carried over cleanly, stop and ask the owner.
- Compare the old `imgs/` and `vedioes/` with `frontend/imgs` and `frontend/vedioes`, and copy in anything missing.
- Add a root `.gitignore`: node_modules, .next, dist, coverage, playwright-report, test-results, .env and .env.* (but keep .env.example), .DS_Store.
- First commit: `chore: start new portfolio (remove old site, add .claude setup and reference design)`.

## Step 4: while building
- Work only on `feature/new-portfolio`.
- The orchestrator commits after each lead review passes, with conventional commits such as `feat(about): hero` or `fix(api): rate limit`. Workers do not commit.
- Before every commit, run `git diff --cached` and check for secrets.
- Push `feature/new-portfolio` at the end of each phase. Before the first push, check `gh auth status`. If the owner is not logged in, ask them to run `gh auth login` themselves. Never ask for a password or token in the chat.

## Step 5: release
1. The branch is clean, fully pushed, and holds only the new project. QA_CHECKLIST.md passes.
2. Open a pull request from `feature/new-portfolio` into MAIN, with `gh pr create` or by giving the owner the compare link.
   - Title: "New portfolio: Next.js frontend + Node.js backend"
   - Body: QA results, Lighthouse scores, the env vars to set, and the deploy changes below
3. If the host builds a preview for the branch, check it against the reference.
4. STOP and ask the owner: "Ready to merge into main and replace the old site?"
5. Only after the owner replies "yes, merge": merge with a normal merge commit (no squash). Because the old files were removed on the branch, main becomes exactly the new project.

## Step 6: switch the live site to the new app
Write down the exact changes for the owner. The owner makes them; agents never change hosting or DNS. For example:
- If the old site is on Vercel: set Root Directory to `frontend`, Framework to Next.js, and add the env vars.
- Deploy the backend on a Node host with its env vars, and set `NEXT_PUBLIC_API_URL` on the frontend.
- Point faisalhanif.work at the frontend if it is not already.

## Rollback
If anything goes wrong after the merge, the old site is on `backup/old-portfolio` and the tag `old-portfolio-final`. Give the owner the exact revert steps (revert the merge commit on main, or redeploy the previous deployment on the host). Do not act on your own.

## Never
Push to main, force push, rewrite history, merge without "yes, merge", commit secrets, or change hosting and DNS settings.
