# PRD: Portfolio rebuild

## Goal
Rebuild the reference single-file portfolio as a fast, SEO-friendly Next.js site with a separate Node.js backend. It must look and behave exactly like the reference on every screen, in light and dark mode, with a real AI chat, contact form and booking.

## Users
Recruiters, founders and clients on laptops and phones. They should be able to:
- read about Faisal
- see his projects and certificates
- download the CV
- chat with the AI assistant
- send a message
- book a paid call

## Routes
The reference uses hash pages. The rebuild uses real routes, each with its own metadata:
- `/` About (reference `#about`)
- `/profile` (`#profile`)
- `/works` (`#works`)
- `/approvals` (`#approvals`)
- `/contact` (`#contact`)
Old hash links such as `/#works` redirect on the client to the matching route. In-page anchors still scroll to their element. Page changes keep the reference curtain transition: a light sheet with a curved edge and the page name in serif, with timings of 560ms cover, 140ms hold and 640ms reveal. Every page ends with the "Next page" link as in the reference.

## Global features (all must match the reference)
Everything in this file is a summary. If a summary here differs from the reference file, the reference wins and this file gets fixed (see CLAUDE.md, "The reference always wins").
- Preloader on first load only. Ambient background (dot grid and soft glows).
- Desktop left rail: logo, 5 links with icons, theme toggle. Mobile top bar (logo, name, theme toggle, Book button) and bottom dock (5 links). Same breakpoints as the reference.
- Light and dark themes with no flash on load (storage key `fh-theme`). Where the browser supports it, the toggle uses the circular View Transition reveal.
- Motion system:
  - scroll reveals: up, fade, scale, left, right, blur, mask, stagger, split text and count up
  - magnetic buttons, cursor spotlight cards, tilt and parallax
  - lerped smooth wheel scrolling on desktop; native scrolling on touch and in inner scroll areas
  - all of it honours reduced motion
- Toasts, modals, and the floating chat button with its "Ask me anything" nudge.
- Booking modal, exactly as in the reference:
  - First screen: pick the session, Quick Chat (30 min, $15) or Technical Deep Dive (60 min, $25), and the number of sessions (1 to 10). The total updates live. A summary sits beside it.
  - Then 3 steps: (1) your details: email with a Verify button (a format check on the page), name, optional phone and company; (2) date, time zone and time slot: weekdays only, from tomorrow up to 60 days ahead, hourly start times from 9:00 to 17:00 PKT shown in the visitor's time zone; (3) platform (Google Meet or Zoom) and optional notes (max 800 characters).
  - A done screen with a ticket (session, when, platform, total).
  - Every Book button (`data-book`) opens it. The one with `data-book="deep"` preselects Technical Deep Dive; the rest open on Quick Chat.

## Pages (the full inventory is in REFERENCE_MAP.md)
- About:
  - hero: the greeting "Hi there! I'm"; the name on two rows, "Faisal" then "Hanif" (serif, gradient, with a line that draws in before it), split into letters for the entrance; the role line with the rolling role; Download CV and Book Meeting; 5 socials (LinkedIn, X, GitHub, Quora, Instagram); stats with a gliding mark; orbital portrait with 8 tech badges (React, Node.js, OpenAI, AWS, Next.js, Claude, MongoDB, React Native)
  - below: marquee, Get to Know Me bento, services, testimonials carousel, pricing
- Profile: hero "résumé as an object": a desk with 3 sheets (experience, education, skills); experience timeline; education; skills tabs.
- Works:
  - hero, "the studio wall": four featured projects shown as devices in soft 3D (three browser windows for GitPulse, UHA International and Fit For Living, and one phone for PureBody), with a seal on the stage, "Built with" stack chips that filter the grid, stats (10+ projects, 7+ technologies, 100% responsive), entrance, hover lift, tilt, a slow float and a scroll-linked exit on desktop. Clicking a device jumps to its project card. There is no orbit and no drag.
  - filters, 14 project cards, and the PureBody modal with 3 videos
- Approvals: hero with seven real certificates fanned from one pivot and a "VERIFIED CREDENTIALS" seal; filters, grid and rail of 7 certificates.
- Contact: hero with the live globe, 24h dial and Lahore clock card; contact form; booking; chat.
- Small screens: every page hero shows the visual on top with centred content below. The switch happens at 900px for About and 1023px for the other pages, as in the reference.

## Backend features (full detail in BACKEND_SPEC.md, which is binding)
- AI chatbot:
  - runs on OpenRouter. The API can also stream, but the chat window shows each reply exactly like the reference (typing dots, then the whole answer), so the frontend uses the plain JSON reply
  - answers every kind of visitor question: services, rates, projects, experience, previous work, and technical questions
  - uses a knowledge base built from the site content
  - production grade: guardrails, tight rate limits, fallbacks, and the key kept on the server
  - if the API fails, is slow (12 seconds) or is rate limited, the chat falls back to the reference's local responder, as the reference does
- Contact form (fields exactly as in the reference: name, email, phone, company, project type, budget, project details):
  - sends the message to the owner's email through Gmail SMTP (Nodemailer) with a clean HTML template
  - sends a confirmation to the visitor
  - protected against spam with a hidden honeypot and a minimum fill time, neither of which changes the design
- Book a meeting:
  - creates one Google Calendar event with a real Google Meet link
  - sends branded HTML emails to BOTH the visitor and the owner, with the SAME Meet link, day, time (both time zones), session, number of sessions, duration and total, plus a calendar invite
  - the done screen keeps the reference design and copy ("The confirmation and meeting link are on their way to ...")

## Assets
- Extract every base64 image from the reference into `frontend/public/images/` as real files and serve them with next/image. There are exactly 5: the portrait (About) and the GitPulse, UHA, Fit For Living and PureBody screens in the Works hero. Every other image loads from `imgs/` (see REFERENCE_MAP.md section 8).
- The PureBody modal's "Open full page" link points to `https://faisalhanif.work/sass-app.html`, a page of the OLD site. Keep the link exactly as in the reference, and keep that URL working: while the old files are still on the work branch (GIT_WORKFLOW.md step 3), copy `sass-app.html` and every file it loads into `frontend/public/` at the same paths, then check that `/sass-app.html` opens with no missing files. If it cannot be carried over cleanly, stop and ask the owner.
- The old site assets sit in `frontend/imgs` and `frontend/vedioes`. During scaffolding, move them into `frontend/public/imgs` and `frontend/public/vedioes` with the same names, so `/imgs/Faisal-CVS.pdf` and the video paths keep working. Compare with the `imgs/` and `vedioes/` on the old repo's main branch and copy in anything missing. List anything still missing in `frontend/MISSING_ASSETS.md`.

## Content notes for the owner
- The testimonials from "Sarah Johnson, TechCorp" and "Emily Rodriguez, AppSolutions" may be template placeholders. Mark them `needsConfirmation: true` in the data file, and list them in the final report for the owner to confirm or remove.
- The Soledeck live link returns 404. Keep the data but flag it.

## Non-functional requirements
- Performance: Lighthouse mobile Performance 90 or more, Accessibility 95 or more, Best Practices 95 or more, SEO 100. LCP under 2.5s on mobile. CLS under 0.05. Heavy interactive parts (orbits, globe, chat, booking, PureBody modal) are code split without changing the first paint.
- SEO: per-route metadata, Open Graph and Twitter images, sitemap.xml, robots.txt, canonical URLs, Person JSON-LD.
- Accessibility: semantic HTML, full keyboard access, visible focus, aria on tabs, modals and toggles, AA contrast in both themes, 44px touch targets on mobile.
- Security: no secrets in the client, CORS allowlist, helmet, rate limits, validation on both sides, and user input escaped in emails.
- Code quality: scalable, maintainable, flexible, industry standard. TypeScript strict, ESLint, Prettier, unit tests for logic, API tests for every endpoint, Playwright visual regression against the reference.

## Out of scope for v1
Payments, a CMS, a database, a blog, analytics dashboards.

## Definition of done
Everything in QA_CHECKLIST.md passes, the fresh verification agent confirms it, and the owner approves the merge.
