# Reference map

Source: `reference-design/faisalhanif-redesign.html` (841,751 bytes, 7,618 lines). Read only. All line numbers below are absolute lines in that file (`L1234`).

If this map, or any other file in `.claude/`, disagrees with the reference file, the reference file wins. Build what the reference has, then fix the doc.

## Status of this map
This version is the STRUCTURAL map: every line range, block, section, overlay, script, breakpoint, icon and asset, checked against the file, plus the checked facts in section 9 and the checked forms and payloads in section 10. The deep inventory (every token value, every timing and easing, all copy, all data as typed content, and every JS behaviour written up for React hooks) is NOT in this file yet. Before any build brief is written, the orchestrator must fill in sections 11 to 13 (one read per page, using the ranges below), or each lead must read its ranges directly. Never guess a value; open the line and copy it.

Rules for anyone extending this map:
- Plain English, no em dashes or en dashes.
- The reference copy contains 6 em dashes (L3449, L3609, L6865, L6868, L6871, L6874; L4561 is only a code comment). Write each one as `\u2014` inside quoted copy, so the copy stays exact and this file stays em dash free. In TypeScript string literals `\u2014` produces the real character.
- Lines L3112, L3833, L3843, L3853, L3862 each hold one base64 image (20 KB to 78 KB). Never print them raw. Use `sed -n 'Np' FILE | sed -E 's/base64,[A-Za-z0-9+\/=]+/base64,<...>/'`.

## 1. Top level layout

| Lines | What |
|---|---|
| L1-20 | `<head>`: meta, fonts, theme boot script (L12-20) |
| L21-2878 | One `<style>` block (all CSS) |
| L2879-4558 | `<body>` markup |
| L4559-4786 | Core script (`window.FH`) |
| L4787-5174 | `about.js` |
| L5175-6488 | `contact.js` (contact page, booking modal and chat widget) |
| L6489-6851 | `profile.js` |
| L6852-7616 | `works.js` (works and approvals) |

## 2. Head (L1-20)
- `<html lang="en" data-theme="light">`
- Title: `Faisal Hanif · Software Engineer`
- Meta description: `Faisal Hanif, software engineer in Lahore building AI-powered web and mobile products with React, Next.js, Node.js and LLMs.`
- `theme-color`: `#0e6655`. Viewport: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Fonts (L11, Google Fonts): Instrument Serif (ital 0 and 1), JetBrains Mono (400, 500), Plus Jakarta Sans (400, 500, 600, 700, 800), `display=swap`.
- Theme boot (L12-16): reads `localStorage['fh-theme']`; if empty, uses `prefers-color-scheme: dark`; sets `data-theme` on `<html>` before paint.
- `window.FH_BASE='https://faisalhanif.work/'` (L17). `FH.asset(path)` builds remote asset URLs from it.
- `window.FH_HOOKS={onContact:null,onBooking:null,chatEndpoint:null}` (L19). This is where the backend plugs in. Without it, forms fall back to mailto and chat uses a local responder. The comment on L18 mentions Stripe; payments are out of scope for v1.
- L2881: `document.documentElement.classList.add('js')`. Some CSS depends on the `.js` class.

## 3. CSS blocks (L21-2878)

Target files from TECH_STACK.md are shown in the last column.

| Lines | Block | Target file |
|---|---|---|
| L21-364 | Shell: tokens in `:root` and `[data-theme="dark"]`, base components, rail, top bar, dock, preloader, modal, toast, footer, page hero, curtain, reduced motion | `tokens.css`, `base.css`, `layout.css` |
| L365-811 | `/* ---- about.css ---- */` | `about.css` |
| L812-1564 | `/* ---- contact.css ---- */` (also holds booking and chat rules) | `contact.css`, `overlays.css` |
| L1565-2040 | `/* ---- profile.css ---- */` | `profile.css` |
| L2041-2877 | `/* ---- works.css ---- */` (works and approvals, plus the PureBody modal) | `works.css`, `approvals.css`, `overlays.css` |

### Shell landmarks (L21-364)
- L115 `.site` left padding for the rail (min-width 1024px)
- L218 `.rail` shows at 1024px and up
- L243 `.topbar` hides at 1024px and up
- L248-250 `.dock`: tight links under 360px, hidden at 1024px and up, `.site` bottom padding 84px under 1023px
- L255-262 `.preloader`
- L267-276 `.fh-modal` shell (bottom sheet under 640px)
- L282-284 `.toast`
- L287-290 `.footer`
- L301 `.page-hero` (min-height auto and padding-top 108px under 1023px)
- L311 onward `.curtain`
- L357 reduced motion block

### about.css (L365-811)
L375 hero, L418 orbital portrait, L521 marquee, L534 section heads, L539 Get to Know Me bento, L600 services, L646 testimonials, L680 pricing, L734 responsive, L805 reduced motion.

### contact.css (L812-1564)
L820 page frame, L881 the orb (24h dial and globe), L958 hero entrance choreography, L994 methods ledger, L1024 map and form grid, L1066 form, L1164 contact responsive. Booking rules (`.ct-bk`, `.ct-recap`) run from about L1227 to L1459. Chat rules (`.ct-chat`) start at L816 and run to about L1551. Responsive and reduced motion for these: L1435-1556.

### profile.css (L1565-2040)
L1591 copy column, L1614 the desk (scales as one object with container units), L1747 entrance (JS adds `.is-in`), L1774 ambient float (paused off screen), L1779 tablet (copy above, desk below), L1784 phone, L1807 block heads, L1821 badges, L1829 experience, L1897 education, L1942 technical expertise.

### works.css (L2041-2877)
L2075 toolbar and segmented filter, L2095 empty state, L2194 tablet, L2322-2383 PureBody modal (`.wk-pb`).
Approvals hero block: L2431 copy, L2471 the deck, L2565 entrance, L2577 scroll-linked exit (desktop), L2598 tablet and phone.
Works hero block: L2645 copy, L2687 the stage, L2789 entrance (JS adds `.is-on`), L2807 ambient float, L2815 scroll-linked exit (desktop), L2844 tablet and phone.

## 4. Body markup (L2879-4558)

| Lines | Element |
|---|---|
| L2883-2947 | Icon sprite (see section 7) |
| L2949 | `.preloader#preloader` (SVG ring and arc with "FH") |
| L2956 | `.curtain#curtain` (label with `#curtainNum`, for example "02 / 05") |
| L2973 | `aside.rail` (nav at L2975, first link at L2977) |
| L2988 | `header.topbar#topbar` |
| L2995 | `nav.dock` |
| L3003 | `main.site#site` opens |
| L3004-3436 | `section#about.ab` (side panel `aside.ab-side` "Talk first" at L3406) |
| L3437-3797 | `section#profile.section.pf` (hero `header.page-hero.pf-hero#pf-hero` at L3439) |
| L3798-3898 | `section#works.section.wk-sec` (hero `#wk-hero` at L3799) |
| L3899-3964 | `section#approvals.section.wk-sec.wk-ap` (hero `#wk-ap-hero` at L3900) |
| L3965-4227 | `section#contact.section.ct` (hero `#ct-hero` at L3972, `aside.ct-aside` at L4061) |
| L4228-4237 | `footer.footer`: big "Faisal Hanif", "© 2026 Faisal Hanif · Software Engineer · Lahore, Pakistan" (year in `#year`), "Back to top" link |
| L4240-4467 | Booking modal `div.fh-modal.ct-bk#booking`: screen `pick` L4248 (summary aside L4294), screen `steps` L4322 (recap aside L4442), screen `done` L4453 |
| L4468-4491 | Chat widget `div.ct-chat#ct-chat`: nudge "Ask me anything" L4469, FAB L4470, panel L4475 (title "Faisal's Assistant"), log L4484, form L4485, input L4487 |
| L4493-4556 | PureBody modal `div.fh-modal.wk-pb#purebody`: 3 phones with lazy videos |
| L4558 | `div.toast#toast` (`role="status"`, `aria-live="polite"`) |

Page class prefixes: `ab-` (about), `pf-` (profile), `wk-` (works and approvals), `ct-` (contact, booking, chat).

## 5. Scripts

### Core script L4559-4786 (`window.FH`)
L4572 split words for `[data-split]`, L4593 reveal observer, L4613 counters (`data-count`, `data-suffix`, `data-prefix`, `data-duration`), L4620 spotlight, L4626 magnetic (desktop only), L4632 tilt, L4638 theme toggle with circular reveal (`startViewTransition`), L4649 modals, L4662 toast, L4665 scroll progress, top bar and active nav, L4673 hash router with curtain transitions, L4732 auto-injected "Next page" links, L4738 smooth wheel scrolling (fine pointers only), L4760 parallax (`data-parallax`), L4772 cursor glow (lerped), L4777 boot.

### about.js L4787-5174
L4809 hero visibility (idles loops off screen), L4815 rotating role line, L4996 Lahore local time (PKT, UTC+5, no DST), L5012 copy email, L5025 marquee (drift that speeds up and changes direction with scroll velocity), L5061 services accordion (one open at a time), L5104 testimonials carousel, L5163 pricing border light sweep (only while on screen).

### contact.js L5175-6488
- Contact page: L5189 helpers; globe and dial: L5236 visitor location guess from time zone, L5261 sphere helpers, L5309 static SVG built once, L5372 per-frame render, L5470 composition (dial and clock card never overlap), L5522 clocks and working hours, L5564 entrance (every page show), L5583 scroll-linked exit, L5604 ambient sway (32s, only while visible), L5622 router hooks; L5631 copy email; the contact form handler follows (exact lines to be mapped).
- Booking: L5811 time zones, L5847 state, L5879 screen A, L5924 screen B steps, L6006 calendar, L6059 time slots (9AM to 6PM PKT, Mon to Fri), L6096 recap, L6111 complete, L6162 public API.
- Chat: L6185 knowledge (from the portfolio content, seeds the backend knowledge base), L6332 rendering, L6376 answer engine (local responder), L6426 actions, L6452 open and close, L6475 one-time nudge.

### profile.js L6489-6851
Uses `FH.asset('imgs/Faisal-CVS.pdf')` at L6623. Detailed map pending.

### works.js L6852-7616
L6859 data block: 14 projects (L6863-6902) and 7 certificates (L6914-6932), images resolved through `FH.asset(path)` (L6944). Further blocks start at L6938, L6948, L6984, L7025, L7117, L7264, L7326, L7411 and L7591 (PureBody videos: lazy `data-src`, start staggered by `300+i*120` ms, paused on `fh:close`).

## 6. Breakpoints (every `@media` in the file)
- Width, min: 640px (L1979, L1780, L2599, L2845), 760px (L1961), 860px (L1816, L1899), 960px (L1944), 1024px (L115, L218, L243, L249, L284, L1582, L1616, L1737, L1832, L2367, L2426, L2468, L2473, L2578, L2640, L2684, L2689, L2816), 1181px (L430), 1200px (L2474, L2690).
- Width, max: 360px (L248), 380px (L800), 420px (L1964), 440px (L1456), 600px (L1183, L1889, L1937), 639px (L1785, L2208, L2300, L2603, L2848), 640px (L276, L761, L1442, L1547), 700px (L2204), 760px (L2374), 860px (L1435), 900px (L754, L1178), 1023px (L250, L301, L745, L1171, L1540, L2195, L2313, L2469, L2685), 1100px (L1165).
- Ranges: 901px to 1180px (L735), 640px to 1023px (L1780, L2599, L2845), 1024px to 1180px (L2590, L2835).
- Height: `(min-width:1024px) and (max-height:800px)` (L740, L1745, L2583, L2821).
- Pointer: `(hover:hover)` (L677, L1004, L1994, L2025), `(hover:hover) and (pointer:fine)` (L1720).
- Reduced motion: L357, L806, L1553, L1556, L2030, L2382, L2408, L2622, L2872.
Main switches: rail and dock swap at 1024px. The About hero stacks at 900px (L754). The other heroes stack at 1023px.

## 7. Icon sprite (L2883-2947)
Lucide style, 24px, stroke icons, used as `<svg class="i"><use href="#id"/></svg>` (`.i--fill` for filled). Symbol ids:
`i-user`, `i-file`, `i-briefcase`, `i-trophy`, `i-chat`, `i-mail`, `i-phone`, `i-pin`, `i-clock`, `i-calendar`, `i-download`, `i-arrow-right`, `i-arrow-up-right`, `i-arrow-left`, `i-github`, `i-linkedin`, `i-x`, `i-xlogo`, `i-instagram`, `i-quora`, `i-code`, `i-phone-dev`, `i-sparkles`, `i-cloud`, `i-check`, `i-check-circle`, `i-star`, `i-quote`, `i-sun`, `i-moon`, `i-send`, `i-close`, `i-plus`, `i-minus`, `i-play`, `i-layers`, `i-grad`, `i-building`, `i-globe`, `i-shield`, `i-zap`, `i-grid`, `i-video`, `i-lock`, `i-cpu`, `i-database`, `i-server`, `i-rocket`, `i-award`, `i-book`, `i-eye`, `i-bolt-chat`, `i-settings`, `i-cart`, `i-wrench`, `i-dots`, `i-message`, `i-dollar`, `i-external`, `ab-ic-react`, `ab-ic-next`, `ab-ic-node`, `ab-ic-openai`, `ab-ic-claude`, `ab-ic-aws`, `ab-ic-mongo`, `ct-i-copy`, `ct-i-down`, `wk-guil`.

## 8. Assets

### Base64 images (extract to `frontend/public/images/`)
The file holds exactly 5 base64 WebP images. Every other image loads from `imgs/`.

| Line | File name | Alt text | Size |
|---|---|---|---|
| L3112 | `portrait-faisal.webp` | Portrait of Faisal Hanif | 498x696, `fetchpriority="high"` (About LCP) |
| L3833 | `works-hero-gitpulse.webp` | GitPulse admin dashboard with learner stats, an activity trend chart and a score distribution donut | 1400x797 |
| L3843 | `works-hero-uha.webp` | UHA International home page with a glass globe beside the headline | 1280x697 |
| L3853 | `works-hero-fitforliving.webp` | Fit For Living home page: Coaching that actually knows your name, with the weekly class timetable | 1280x697 |
| L3862 | `works-hero-purebody.webp` | PureBody app home screen with today's overview and an AI meal plan | 402x884 |

### Remote assets (`FH.asset()` or absolute URLs)
All paths below exist today in `frontend/imgs/` or `frontend/vedioes/`. In the rebuild they are served from `frontend/public/` as `/imgs/...` and `/vedioes/...`.
- CV: `imgs/Faisal-CVS.pdf` (absolute URL at L3040, L3451, L3913; `FH.asset` at L4807, L6182, L6623, L7573).
- Project images (works.js): `imgs/purebody.jpeg`, `imgs/UHA-Company website.png`, `imgs/FitForLiving.webp`, `imgs/GitPulse.webp`, `imgs/Dashboard.webp`, `imgs/Smart Gallery.webp`, `imgs/Echoai.webp`, `imgs/medicare.png`, `imgs/Shop.webp`, `imgs/Financial-fusion.webp`, `imgs/Home.webp`, `imgs/doctors.png`, `imgs/dsa.webp`, `imgs/Weather.webp` (L6863-6902). Two names contain spaces.
- Certificate images: `imgs/Claude-Code-in-Action.webp`, `imgs/Claude-101.webp`, `imgs/Frontend.webp`, `imgs/React.webp`, `imgs/Web.webp`, `imgs/Data.webp`, `imgs/ReactNative.png` (L6914-6932).
- PureBody videos: `vedioes/ScreenRecording1.mp4`, `ScreenRecording2.mp4`, `ScreenRecording3.mp4` (L4516, L4530, L4544). The local folder also has recordings 4 to 6 and a `posters/` folder that the reference does not use.
- PureBody "Open full page" link: `https://faisalhanif.work/sass-app.html` (L4503). This page belongs to the OLD site. Keep the link as it is; the old page and its files are carried into `frontend/public/` so the URL keeps working (PRD.md "Assets", GIT_WORKFLOW.md step 3).

## 9. Checked facts (the PRD summary had these wrong; the docs now follow the reference)
- Base64 images: exactly 5 (portrait, GitPulse, UHA, Fit For Living, PureBody). There are none for purebody2, Soledeck, Dosnexa, Yoom or EchoAI. EchoAI uses `imgs/Echoai.webp`.
- Works hero, "the studio wall" (HTML L3799-3898, CSS L2645-2877, JS L7326-7410): four featured projects as devices in soft 3D inside `#wk-sk-tilt` (`role="group"`, `aria-label="Four featured projects. Choose one to jump to its card."`):
  - `button.wk-dv.wk-dv--gp` GitPulse, browser window (URL bar "gitpulseee.netlify.app"), `aria-label="GitPulse, Next.js dashboard. Jump to this project."`
  - `button.wk-dv.wk-dv--uha` UHA International, browser window ("uha-international.com"), `aria-label="UHA International, React.js website. Jump to this project."`
  - `button.wk-dv.wk-dv--ffl` Fit For Living, browser window ("fitforliving.netlify.app"), `aria-label="Fit For Living, client website. Jump to this project."`
  - `button.wk-dv.wk-dv--pb` PureBody, phone, `aria-label="PureBody, SaaS app. Jump to this project."`
  - Clicking a device jumps to its project card: if a filter is active it switches to All and waits 650ms, scrolls to the card, then flashes it after 900ms (flash lasts 2600ms).
  - The same JS wires the "Built with" stack chips (`#wk-chips`, they set the grid filter), the entrance (`.is-on`), hover lift (mouse only, after `.is-settled`), tilt, the scroll-linked exit, and a seal injected at L7352 (the code comment calls it "14 projects"; ring text "WEB · MOBILE · AI · 2022 - 2026 ·").
  - Copy: eyebrow "Portfolio Showcase", title "Featured" / "Projects" with meta "2022 → 2026", buttons "Browse projects" (scrolls to `#wk-toolbar`) and "Book Meeting" (`data-book`), stats Projects 10+, Technologies 7+, Responsive 100% (`data-wk-to`, count up over 1500ms).
  - There is no orbit and no drag.
- Approvals hero (JS L7411-7590): seven real certificates fanned from one pivot below the deck (deal in, fan, hover lift, slow float), with a seal on the top card whose ring text is "VERIFIED CREDENTIALS · 2023 - 2026 ·" (L7429-7433).
- About hero (L3004-3111):
  - greeting "Hi there! I'm" (`p.ab-hello`, L3023). There is no "Available" pill in the About hero; the only "Available for Projects" pill is in the Contact hero (L3976).
  - the name `h1.ab-name[data-split]` has two rows, "Faisal" and "Hanif" (`.serif.grad-text`); row 2 has a line drawn in by `::before` (CSS L383-387).
  - 5 socials in `ul.ab-social` (L3048-3054): LinkedIn, X (Twitter), GitHub, Quora, Instagram.
  - 8 orbit badges `.ab-sat` with angles in `data-a`: React 0, Node.js 90, OpenAI 180, AWS 270 (L3087-3090) and Next.js 45, Claude 135, MongoDB 225, React Native 315 (L3095-3098).
- The 60 minute session is named "Technical Deep Dive" (L4273, L5800), not "Deep Dive".
- Book buttons: 8 elements carry `data-book`; one of them is `data-book="deep"` and preselects Technical Deep Dive. `FH.openBooking(type)` is defined at L6166.

## 10. Forms and payloads (checked against the reference)
These define API_CONTRACT.md.

### Contact form (`form#ct-form.card.ct-form`, L4123; handler L5658-5786)
| Field | Element | Rules in the reference |
|---|---|---|
| name | `#ct-name`, text, required, `maxlength="120"` | "Please add your name so I know who I am talking to." / under 2 chars: "That name looks a little short." |
| email | `#ct-email`, email, required, `maxlength="160"` | "I need an email address to reply to you." / bad format: "That email looks off. Try something like name@company.com." |
| phone | `#ct-phone`, tel, optional, `maxlength="40"` | if filled, must match `/^[+()\d\s.\-]{7,24}$/`: "Use digits, spaces and + only, for example +1 555 123 4567." |
| company | `#ct-company`, text, optional, `maxlength="120"` | none |
| type | radios `name="type"` in `#ct-type`, required | "App Development", "Web Application", "E-commerce", "Maintenance & Support", "Consultation", "Other". Error: "Pick the option that fits best." |
| budget | radios `name="budget"`, optional | "Under $1,000" (Small projects, basic websites), "$1,000 - $5,000" (Medium complexity projects), "$5,000 - $10,000" (Complex web applications), "$10,000+" (Enterprise solutions) |
| details | `#ct-details`, textarea, required, `maxlength="2000"` | "Tell me a little about your project." / under 20 chars: "A bit more detail helps. Aim for at least 20 characters." Counter `#ct-details-count` gets `is-near` above 1800. |

- On a failed submit: focus the first bad field and set the status line to "Some fields need a quick fix before sending."
- Payload passed to `FH_HOOKS.onContact` (L5754): `{ name, email, phone, company, projectType, budget, details }` (strings, trimmed; empty strings when not given).
- Without a hook: mailto with subject "New project enquiry: <projectType> from <name>" and the body from `summary()` (L5719-5725).
- Success: button shows "Sent", toast "Message sent. Talk soon!", then the done panel "Thanks, <first name>!" with "Your message is on its way. I will get back to you at <email> within 24 hours." Failure: toast "That did not go through. Please try again or email me directly." and status "Sending failed. Please try again."
- The reference has no honeypot and no timestamp. The rebuild adds both as invisible extras (API_CONTRACT.md).

### Booking modal (HTML L4240-4467; JS L5791-6173)
- Sessions (`TYPES`, L5798-5801): `quick` = "Quick Chat", "30 minutes", $15, icon `i-zap`; `deep` = "Technical Deep Dive", "60 minutes", $25, icon `i-layers`.
- Pick screen: session radios `name="ct-bk-type"`, a sessions stepper `[data-bk-step]` from 1 to 10 with a live total (650ms tween), summary aside, "continue" button `#ct-bk-go`.
- Step 1, details: email `#ct-bk-email` (placeholder "you@company.com") with `#ct-bk-verify` ("Verify", then "Verified"; a format check only), name `#ct-bk-name` ("Your name", at least 2 chars), phone `#ct-bk-phone` ("+1 555 000 0000", optional), company `#ct-bk-company` ("Company name", optional). Errors: "Please enter your email so I can send the meeting link.", "That email looks off. Try something like name@company.com.", "Please add your full name.", "That name looks a little short."
- Step 2, date and time: calendar `#ct-cal` (weeks start on Monday; a day is available if it is a weekday, after today and at most 60 days ahead; arrow keys, PageUp/PageDown, Home/End). Time zone `#ct-bk-tz`: 23 fixed zones, plus the visitor's own zone when it is not one of them, sorted by offset, labelled like "GMT+5 · Pakistan (PKT)", the visitor's zone marked " (your zone)". Slots `#ct-slots`: hourly starts 9:00 to 17:00 PKT (`slotsFor`, L6060), shown in the chosen zone with "next day" or "prev day" tags, 35ms stagger. Errors: "Pick a weekday for the meeting.", "Choose one of the time slots."
- Step 3, platform and notes: radios `name="ct-bk-plat"` with values "Google Meet" and "Zoom" (error "Choose Google Meet or Zoom."), notes `#ct-bk-notes` (`maxlength="800"`, placeholder "A line or two about your project").
- Payload passed to `FH_HOOKS.onBooking` (`bookingData()`, L6112-6117): `{ sessionType, sessionName, durationMinutes, pricePerSession, sessions, total, currency: 'USD', email, name, phone, company, date, timezone, startUtc, timeLocal, timeLahore, platform, notes }`.
- Without a hook: mailto with subject "Meeting request: <sessionName> on <date>" and the body from `mailBody()` (L6119-6129).
- Done screen: title "Booking sent!", message "Your booking went through. The confirmation and meeting link are on their way to <email>.", ticket (Session x count, When with local and Lahore times, Platform, Total), toast "Booking sent. Check your inbox soon." Failure: toast "Booking did not go through. Please try again."

### Chat (HTML L4468-4491; JS L6178-6488)
- Request to `FH_HOOKS.chatEndpoint` (L6392): `POST`, JSON `{ message, history: history.slice(-12) }`. `history` already holds the current user message and starts with the greeting.
- Response: JSON (reads `reply`, then `message`, `text`, `content`, `answer`, or an OpenAI style `choices[0].message.content`) or plain text. 12 second timeout. Any error falls back to `localReply()`. The local reply's action buttons are kept on API answers (L6398).
- Input `#ct-chat-input`: `maxlength="500"`, placeholder "Type your message...".
- Greeting: "Hi! I'm Faisal's assistant. How can I help you today?" with starter chips "Services", "Rates", "Projects", "Experience", "Book a call", "Contact". Typing dots appear after 220ms; the reply waits at least `min(1300, 650 + text.length * 8)` ms.
- Renderer (L6333-6341, L6377-6386): paragraphs split by blank lines, `-`, `*`, `•` or `1.` list lines, `**bold**`, `[label](url)` links for https, http, mailto, tel and `#`, and bare https URLs.

## 11. Page inventories (to be completed)
For each page: every section and sub component with classes, copy, data attributes, interactions, animations (timings, easing, delays copied exactly) and responsive changes. Use the ranges in sections 3 to 5.

## 12. JS behaviours for React (to be completed)
For each behaviour in section 5: what starts it, what it measures, what it writes, timings, when it pauses (tab hidden, off screen, reduced motion, touch), what to clean up, and the hook or component it becomes.

## 13. Content data (to be completed)
Typed data for `src/content/`: projects (with filter keys and links), certificates, experience, education, skills, services, testimonials (Sarah Johnson and Emily Rodriguez marked `needsConfirmation: true`), pricing, socials and contact details. The form fields and payloads are already in section 10.
