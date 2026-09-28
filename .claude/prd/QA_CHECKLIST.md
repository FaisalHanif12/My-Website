# QA checklist (nothing ships until every box is checked)

Any place where the build differs from the reference is a bug, even if a doc said otherwise. The reference always wins.

## Visual parity with the reference
- [ ] Playwright compares every route with the reference (hash page to route) at 1440x900, 1280x720, 1024x768, 891x774, 768x1024, 390x844 and 360x780, in light and dark, with reduced motion on, the clock frozen and fonts loaded.
- [ ] Pixel diff is 0.5% or less per screenshot. Any area above that is inspected and fixed.
- [ ] Hover, focus and open states are checked by eye against the reference: buttons, cards, socials, stats glide mark, tabs, filters, modals, booking steps, chat.
- [ ] Motion matches the reference: entrance order and timing, rolling role, orbits, globe, curtain transition, theme toggle reveal, preloader. Reduced motion shows everything with no movement.

## Responsive
- [ ] No horizontal scroll at any width from 320 to 1920.
- [ ] Small-screen heroes show the visual first and centred content, as in the reference.
- [ ] Nothing hides under the top bar or dock. Touch targets are 44px or more.

## Function
- [ ] Every nav link, next page link, hash redirect, back and forward button, and deep link works.
- [ ] Download CV works. Every social and project link opens correctly, including the PureBody "Open full page" link (`/sass-app.html` loads on the new site with no missing files).
- [ ] Chat returns real answers from the API, shown exactly like the reference (typing dots, then the whole reply), stays on topic, and falls back to the local responder when the API is down, slower than 12 seconds, or rate limited.
- [ ] The contact form has exactly the reference fields (name, email, phone, company, project type, budget, project details), shows the reference validation messages, sends to the owner, sends the confirmation, and shows the reference success and error toasts. The hidden honeypot and the 3 second minimum work and change nothing visible.
- [ ] Chat answers correctly (with the model mocked, and once manually with a real key) about services, rates, every project, experience, education, skills, certificates, availability and technical questions. It refuses to invent facts and ignores prompt injection.
- [ ] Contact email arrives at the owner's inbox with Reply-To set to the visitor. The confirmation reaches the visitor. The templates look right in Gmail on desktop and phone.
- [ ] Booking works through the session pick (both sessions, 1 to 10 sessions, live total), all 3 steps and the done screen, which keeps the reference copy and ticket. One Google Calendar event is created with a Meet link. The visitor and the owner receive HTML emails with the SAME Meet link, day, time (both time zones), session, number of sessions, duration and total. The .ics opens in Google Calendar and Apple Calendar. Taken times are left out of the slot list; a 409 sends the visitor back to step 2 with the message in the existing slot error line. Picking Zoom without Zoom set up still books and says the Zoom link will follow. Double submits create one booking only.
- [ ] Rate limits return 429 with the error envelope.
- [ ] Zero console errors and warnings on every route.

## Quality
- [ ] build, lint, typecheck and test pass in both apps.
- [ ] Lighthouse mobile on every route: Performance 90 or more, Accessibility 95 or more, Best Practices 95 or more, SEO 100.
- [ ] Keyboard only: every action is reachable, focus is visible, and modals trap and restore focus.
- [ ] No secrets in the client bundle. `.env.example` is complete.
- [ ] Both READMEs explain setup, env, scripts and deployment.

## Git and release
- [ ] All work is on `feature/new-portfolio`, committed and pushed, with a clean working tree.
- [ ] The old site is safe on `backup/old-portfolio` and the tag `old-portfolio-final`.
- [ ] The branch holds no old site files, no secrets, no node_modules and no build output. The git history is scanned for keys too (the repo is public).
- [ ] A pull request into main is open with a clear summary, and the preview deploy (if any) was checked.
- [ ] The owner has the exact steps to switch the live site to the new app after the merge.
