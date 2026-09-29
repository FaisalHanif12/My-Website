# Reference map

Source: `reference-design/faisalhanif-redesign.html` (841,751 bytes, 7,618 lines). Read only. All line numbers below are absolute lines in that file (`L1234`).

If this map, or any other file in `.claude/`, disagrees with the reference file, the reference file wins. Build what the reference has, then fix the doc.

## Status of this map
Complete. Sections 1 to 10 give the structure, line ranges, breakpoint index, icon list, assets, checked facts, and the exact forms and payloads. Section 11 is the detailed inventory by area: every token, every timing and easing, all copy, all content as typed TypeScript, and every JS behaviour written up for React hooks. The errata list below corrects a few line numbers in sections 1 to 10; where they disagree, the errata and section 11 win. Never guess a value; open the line and copy it.

This file is large. Use the index at the top of section 11 (line numbers in this file) and read only the part you need, with offsets.
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

## Errata to sections 1 to 10 (found by the section 11 readers)
- Toast: `div.toast#toast` is L4557 (L4558 is blank).
- Footer: L4228-4236; L4237 is `</main>`, so the footer sits inside `main.site` and shows under every page.
- Icon sprite: L2883 is a comment, the `<svg>` is L2884-2947, the 59 shell symbols are L2887-2945, and `linearGradient#pl-g` (preloader) is L2886 inside it. `ab-ic-*` live in an About-only sprite (L3007-3017), `ct-i-copy` and `ct-i-down` in a Contact-only sprite (L3966-3969), and `wk-guil` is built by works.js (L7427-7428).
- Router: it writes history with `history.pushState` and handles Back and Forward through `popstate`; there is no `hashchange` listener. Curtain timings are confirmed: 560ms cover, 140ms hold, 640ms reveal (1340ms total; the CSS comment at L310 saying about 1.1s is wrong).
- Section ends: `#approvals` closes at L3963, `#contact` at L4225, `#booking` at L4465.
- contact.css: L816-818 hold only the shared `[hidden]` rule and the `--ct-err` tokens. Booking rules are L1224-1460 (L1110 and L1152-1162 are shared with the contact form). Chat rules are L1462-1552. The reduced motion blocks at L1553-1559 cover only the contact hero and map.
- works.css: the PureBody modal block is L2318-2384, plus float and reduced motion rules at L2403-2412. Two container queries are missing from section 6: `@container (max-width:420px)` at L2680 (Works stack chips) and `@container (max-width:520px)` at L2616 (deck card small print).
- works.js: the Approvals hero code ends at L7583; L7585-7589 is a shared re-measure step that runs on page show.
- contact.js: the map clock is L5645-5655 and the contact form handler is L5657-5786.
- Section 9: the name row 2 line is CSS L386-387 (L383 is the name size rule).
- Section 10, booking: `#ct-bk-go` is labelled "Book Session" ("Continue" is the step buttons `[data-bk-next]`). Without a hook the done title is "Request ready!" (also the HTML default) with its own message and the toast "Opening your email app with the booking details". A failed booking also announces "Booking failed. Please try again." in `#ct-bk-live`.
- Section 10, contact: the status texts "Sending your message." and "Message sent." and the whole mailto path (label "Ready", status "Your email app is opening with the message.", toast "Opening your email app with your message", the "Email directly" button) are detailed in 11.6.
- Section 10, chat: the renderer links bare `http://` and `https://` URLs; API answers get only the local reply's action buttons, never chips.

## 11. Detailed inventory by area

Index (line numbers in this file):
- 11.1 Design tokens, fonts, breakpoints and the global shell: line 239
- 11.2 Core script (window.FH) and the motion system: line 1190
- 11.3 About page (#about, route /): line 2255
- 11.4 Profile page (#profile, route /profile): line 3443
- 11.5 Works (#works, route /works), Approvals (#approvals, route /approvals) and the PureBody modal: line 4677
- 11.6 Contact page (#contact, route /contact): line 6500
- 11.7 Booking modal (#booking) and chat widget (#ct-chat): visuals, motion and the chat knowledge: line 7843

### 11.1 Design tokens, fonts, breakpoints and the global shell

Sources read line by line: head L1-20, shell CSS L21-364, shell markup L2879-3003, footer L4228-4237, toast L4557. The core script L4559-4786 was read in full because it drives every shell state (theme, preloader, curtain, nav, progress, modal, toast, cursor glow). Page CSS L365-2877 was searched for rules on shared selectors (list in 11.1.10). Sections 1 to 10 of REFERENCE_MAP.md are not repeated; they are cited by number.

Line corrections found while reading (the reference wins):
- The toast is at L4557, not L4558. L4558 is an empty line; the core script opens at L4559.
- The footer is L4228-4236. L4237 is `</main>`, which closes `main.site#site` (opened at L3003). So the footer sits INSIDE `main.site`, after the five page sections, and shows under every page.
- The icon sprite `<svg>` is L2884-2947 (L2883 is the comment). The 59 shell symbols are L2887-2945 inside `<defs>`, together with the preloader gradient `linearGradient#pl-g` (L2886).

#### 11.1.1 Design tokens

##### Global tokens (`:root` L25-67, `[data-theme="dark"]` L68-89)

The dark block redefines only colour, gradient, shadow, glass, blob and dot tokens. Fonts, type scale, radii, layout sizes, easings and durations exist only in `:root` and are the same in both themes. "Uses" counts `var(--x)` references in the whole CSS (shell L21-364 plus page CSS L365-2877); no token is read by JS, and no inline style in the markup uses a token.

| Token | Light (`:root`) | Dark (`[data-theme="dark"]`) | Uses |
|---|---|---|---|
| `--brand` | `#0e6655` (L26) | `#16876f` (L69) | 1 shell (L143 ghost button hover border), 39 page |
| `--brand-600` | `#0a5a4a` (L26) | `#0e6655` (L69) | never used |
| `--brand-700` | `#0f4c41` (L26) | `#8fe3c5` (L69) | 1 page (L1729) |
| `--brand-900` | `#08302a` (L26) | `#062019` (L69) | 4 page (L918, L2348, L2354, L2487) |
| `--accent` | `#10b981` (L27) | `#34d399` (L70) | 4 shell (L105 selection, L106 focus ring, L152 `.dot-live`, L314 curtain layer a), 76 page |
| `--mint` | `#5fcf9f` (L27) | `#6ee7b7` (L70) | 9 page |
| `--grad` | `linear-gradient(135deg,#0e6655 0%,#0a5a4a 100%)` (L28) | `linear-gradient(135deg,#0f7a64 0%,#0a5a4a 100%)` (L71) | 4 shell (L138 primary button, L161 icon tile, L219 rail logo, L345 next page arrow hover), 45 page |
| `--grad-glow` | `linear-gradient(100deg,#0e6655 0%,#1f9c7f 45%,#5fcf9f 100%)` (L29) | `linear-gradient(100deg,#34d399 0%,#5fcf9f 40%,#b6f0d9 100%)` (L72) | 4 shell (L119 `.grad-text`, L215 progress bar, L322 curtain bar, L340 next page word fill), 14 page |
| `--bg` | `#f2f6f4` (L31) | `#050f0c` (L74) | 4 shell (L96 body, L255 preloader, L273 modal panel, L282 toast text), 6 page |
| `--bg-2` | `#e8efec` (L31) | `#081612` (L74) | never used |
| `--surface` | `#ffffff` (L32) | `#0b1a16` (L75) | 6 shell (L142, L151, L158, L230, L277, L315), 72 page |
| `--surface-2` | `#f6faf8` (L32) | `#0f221d` (L75) | 1 shell (L143), 18 page |
| `--surface-3` | `#eef5f2` (L32) | `#132a24` (L75) | 11 page |
| `--line` | `rgba(15,76,65,.10)` (L33) | `rgba(160,230,205,.08)` (L76) | 12 shell, 81 page |
| `--line-strong` | `rgba(15,76,65,.20)` (L33) | `rgba(160,230,205,.16)` (L76) | 9 shell, 92 page |
| `--ink` | `#0f231e` (L34) | `#e9f4f0` (L77) | 11 shell (headings L103, toast background L282, ...), 79 page |
| `--ink-2` | `#34504a` (L34) | `#b4c9c2` (L77) | 3 shell (L96 body text, L122 `.lead`, L230 theme button), 44 page |
| `--muted` | `#6b7f79` (L34) | `#7d948d` (L77) | 5 shell, 98 page |
| `--brand-ink` | `#0f4c41` (L35, comment "brand-coloured text") | `#7fdcb9` (L78) | 13 shell, 116 page |
| `--err` | `#c2410c` (L36) | `#fb923c` (L79) | never used (contact uses its own `--ct-err`, see below) |
| `--accent-soft` | `rgba(16,185,129,.12)` (L37) | `rgba(52,211,153,.12)` (L80) | 2 shell (L168 spotlight, L209 cursor glow), 33 page |
| `--brand-soft` | `rgba(14,102,85,.08)` (L38) | `rgba(52,211,153,.07)` (L81) | 3 shell (L154 `.tag`, L163 soft icon tile, L221 rail indicator), 26 page |
| `--shadow-sm` | `0 1px 2px rgba(8,48,42,.06),0 2px 8px rgba(8,48,42,.05)` (L39) | `0 1px 2px rgba(0,0,0,.4)` (L82) | 3 shell, 12 page |
| `--shadow-md` | `0 2px 6px rgba(8,48,42,.05),0 12px 32px -8px rgba(8,48,42,.14)` (L40) | `0 2px 6px rgba(0,0,0,.3),0 16px 36px -10px rgba(0,0,0,.6)` (L83) | 2 shell (L160 card hover, L217 rail), 19 page |
| `--shadow-lg` | `0 4px 12px rgba(8,48,42,.06),0 30px 60px -20px rgba(8,48,42,.25)` (L41) | `0 4px 12px rgba(0,0,0,.35),0 34px 70px -24px rgba(0,0,0,.8)` (L84) | 3 shell (L245 dock, L273 modal panel, L282 toast), 9 page |
| `--glow` | `0 10px 30px -10px rgba(14,102,85,.55)` (L42) | `0 10px 34px -10px rgba(52,211,153,.45)` (L85) | 3 shell (L138, L161, L219), 21 page |
| `--glass` | `rgba(255,255,255,.72)` (L43) | `rgba(11,26,22,.72)` (L86) | 3 shell (L217 rail, L239 scrolled top bar, L245 dock), 5 page |
| `--blob-a` | `rgba(16,185,129,.22)` (L44) | `rgba(16,185,129,.16)` (L87) | 1 shell (L198) |
| `--blob-b` | `rgba(14,102,85,.20)` (L44) | `rgba(14,102,85,.26)` (L87) | 1 shell (L199) |
| `--blob-c` | `rgba(95,207,159,.20)` (L44) | `rgba(52,211,153,.10)` (L87) | 1 shell (L200) |
| `--dot` | `rgba(15,76,65,.10)` (L45) | `rgba(160,230,205,.07)` (L88) | 1 shell (L204 dot grid), 1 page (L2251) |
| `--font-sans` | `'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif` (L47) | same | 2 shell (L96 body, L261 preloader text), 3 page |
| `--font-serif` | `'Instrument Serif',ui-serif,Georgia,'Times New Roman',serif` (L48) | same | 2 shell (L118 `.serif`, L320 curtain title), 13 page |
| `--font-mono` | `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace` (L49) | same | 6 shell, 67 page |
| `--fs-display` | `clamp(3.1rem,7.6vw,7rem)` (L51) | same | never used |
| `--fs-h2` | `clamp(2.2rem,4.6vw,3.9rem)` (L52) | same | 1 shell (L130 `.sec-title`) |
| `--fs-h3` | `clamp(1.15rem,1.6vw,1.4rem)` (L53) | same | 2 page (L2158, L2283) |
| `--fs-lead` | `clamp(1.02rem,1.25vw,1.18rem)` (L54) | same | 1 shell (L122 `.lead`), 2 page (L1814, L2331) |
| `--fs-body` | `1rem` (L55) | same | 1 shell (L96 body), 1 page (L2190) |
| `--fs-sm` | `.9rem` (L55) | same | 2 page (L2159, L2285) |
| `--fs-xs` | `.78rem` (L55) | same | never used |
| `--fs-label` | `.72rem` (L55) | same | 3 shell (L121 `.label`, L127 `.eyebrow`, L302 `.crumbs`), 11 page |
| `--r-sm` | `10px` (L57) | same | never used |
| `--r-md` | `16px` (L57) | same | never used |
| `--r-lg` | `24px` (L57) | same | 1 shell (L158 `.card`), 6 page |
| `--r-xl` | `32px` (L57) | same | 1 shell (L273 modal panel), 14 page |
| `--r-pill` | `999px` (L57) | same | 2 shell (L134 `.btn`, L151 `.pill`), 24 page |
| `--gutter` | `clamp(16px,4vw,48px)` (L58) | same | 2 shell (L113 `.wrap`, L237 top bar), 3 page (L2231, L2233, L2304) |
| `--maxw` | `1240px` (L59) | same | 1 shell (L113), 1 page (L2231) |
| `--rail-w` | `104px` (L60) | same | 2 shell (L115 `.site` padding, L216 rail width) |
| `--section-y` | `clamp(88px,12vw,160px)` (L61) | same | 1 shell (L114 `.section`); every `.section` overrides it, see 11.1.10 |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` (L63) | same | 24 shell, 187 page |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` (L64) | same | 12 shell, 13 page. The theme reveal in JS repeats this curve as a literal (L4646) |
| `--ease-soft` | `cubic-bezier(.33,1,.68,1)` (L65) | same | never used |
| `--dur-1` | `.35s` (L66) | same | 5 shell, 39 page |
| `--dur-2` | `.6s` (L66) | same | 7 shell, 48 page |
| `--dur-3` | `.9s` (L66) | same | 1 shell (L178 reveal), 3 page |
| `--dur-4` | `1.2s` (L66) | same | 1 shell (L178 reveal clip-path) |

Unused tokens (`--brand-600`, `--bg-2`, `--err`, `--fs-display`, `--fs-xs`, `--r-sm`, `--r-md`, `--ease-soft`) must still be ported into `tokens.css` so the file matches the reference 1:1.

Colours that are NOT tokens but repeat in the shell (copy them as literals, do not invent tokens): `#fff` (L138, L161, L219, L345), `#04231b` (L105 selection text), `rgba(16,185,129,.5)` and `.55` / `0` (L152 to L153 ping), `rgba(14,102,85,.7)` (L141 primary hover shadow), `rgba(255,255,255,.28)` (L139 shine), `rgba(3,14,11,.5)` (L271 scrim), `rgba(8,48,42,.25)` (L315 curtain sheet shadow). JS writes `#050f0c` (dark) and `#0e6655` (light) into `meta[name=theme-color]` (L4640). The preloader gradient `#pl-g` uses `#0e6655` to `#5fcf9f` (L2886) in both themes.

##### Page scoped custom properties (defined in page CSS, listed so the token file does not miss them)

These belong in the page CSS files, not in `tokens.css`. Page parts of this map give their full meaning.

| Property | Where | Value | Notes |
|---|---|---|---|
| `--ct-err`, `--ct-err-soft` | L817 `#contact,#booking,.ct-chat` | `#b42a33`, `rgba(180,42,51,.10)` | dark (L818): `#ff9a9a`, `rgba(255,154,154,.10)`. This is the real error colour; the global `--err` is unused |
| `--ab-sw` | `@property` L424 (`syntax:'<angle>';inherits:false;initial-value:360deg`), set L494 | `0deg` on `.ab-orb.is-pre .ab-orb__svg` | registered property, animatable |
| `--ab-ang` | `@property` L685 (`syntax:'<angle>';inherits:false;initial-value:0deg`), keyframes `ab-sweep` L693 `to{--ab-ang:360deg}` | | pricing light sweep |
| `--fs` | L383, L758 (`#about .ab-name`) | `clamp(4.2rem,min(10.6vw,14.6vh),10rem)`; at max-width 900px `clamp(3.6rem,22.5vw,8rem)` | |
| `--ph --hl --rt --r1 --r2 --r3` | L426, L737, L772 (`#about .ab-orb`) | L426: `.44 .021 .283 .345 .415 .495` | about.js reads `--r1` to `--r3` (L4875) |
| `--pad --num --gap` | L610, L789 (`#about .ab-svc-list`) | | |
| `--p` | L611 (`#about .ab-svc`), L2051 (`.wk-hero`) | `0` | JS writes 0 to 1 |
| `--h` (button height) | L705 (56px), L844 (56px), L1064 (44px), L1139 (58px), L1192 (54px), L1344 (50px) | | overrides `.btn{--h:52px}` (L134) |
| `--sp` | L1580 `#profile .pf-hero`, L2420 `#approvals .wk-hero--ap`, L2634 `#works .wk-hero--works` | `0` (L2031 forces `0!important` under reduced motion) | scroll-linked exit, 0 to 1 |
| `--cx --cy` | L1111, L1131 (`.ct-opt__box`) | | |
| `--x --y --w --r --z --ez --fd --fdl --er --d` | L1625-1627, L1758, L1795-1797 (profile sheets); L2703-2706, L2861-2863 (works devices, also `--ex --ey --ar --cs`) | | positional data per element |
| `--fx --fy --fr --lz` | L1721-1723, L2771-2775 | | hover fan offsets |
| `--node --rail` | L1857, L1890 (`#profile .pf-tl`) | `40px 56px`; max-width 600px `32px 44px` | |
| `--k` | L1975 | 1, 2, 3 | |
| `--tx --ty --lift` | L2020, L2026 (`#profile .pf-chip`) | | |
| `--l1 --l2 --l3` | L2126, dark L2130 (`#works .wk-cover`) | `30% 15% 46%`; dark `21% 8% 33%` | |
| `--fl --fr` | L2077 (`.wk-filter`), L2233 | `0px` | |
| `--pad` | L2231 (`#approvals .wk-rail`) | `max(var(--gutter),calc((100% - var(--maxw)) / 2 + var(--gutter)))` | uses global `--gutter` and `--maxw` |
| `--cat` | L2479-2488 (`#approvals .wk-dk--*`) | `var(--brand)`, `var(--accent)`, `var(--mint)`, `color-mix(...)` | |
| `--wk-bleed` | L2474, L2690 (min-width 1200px) | `clamp(0px,calc((100vw - 1200px) * .25),64px)`, `clamp(0px,calc((100vw - 1200px) * .2),40px)` | |
| `--c-bg --c-line --c-dot --c-url --c-txt` | L2709, L2715 (`#works .wk-bw`, `.wk-bw--dark`) | | browser window chrome colours |
| `--sw --sh` | L2691, L2860 (`#works .wk-sk__stage`) | `66 54`; phone `44 48.8` | stage size in em |
| `--d` | set inline by JS (reveal stagger, split words) and in CSS L1758, L2703-2706 | | reveal delay, see 11.1.9 |
| `--mx --my` | L166 default `50%`, JS writes px | | spotlight, see 11.1.7 |

#### 11.1.2 Fonts and type scale

##### Loading (L9-11)
- `<link rel="preconnect" href="https://fonts.googleapis.com">` (L9) and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` (L10).
- Stylesheet (L11): `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap`.

| Family | Loaded | CSS variable (L47-49) | Role |
|---|---|---|---|
| Plus Jakarta Sans | 400, 500, 600, 700, 800 (normal only) | `--font-sans` = `'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif` | body, headings, buttons, preloader "FH" |
| Instrument Serif | 400, normal and italic | `--font-serif` = `'Instrument Serif',ui-serif,Georgia,'Times New Roman',serif` | accent words; every serif rule in the file is italic (L118, L320, L381, L1712, L1917, L2012, L2261, L2279, L2462, L2508, L2509, L2528, L2538, L2541, L2767), so the normal face is loaded but never shown |
| JetBrains Mono | 400, 500 | `--font-mono` = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace` | labels, eyebrows, tags, crumbs, curtain number |

- No `font-feature-settings`, `font-optical-sizing` or `text-rendering` anywhere in the file. The only font variant is `font-variant-numeric:tabular-nums`: shell L173 (`.stat-num`), and page L549, L561, L700, L949, L1057, L1101, L1130, L1274, L1284, L1364, L1377, L1609, L1696, L1838, L1987, L2452, L2666.
- Smoothing on `body` (L97): `-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale`. `html` has `-webkit-text-size-adjust:100%` (L95).
- Weights used across all CSS: 400 (25 rules), 500 (40), 600 (39), 650 (9: L460, L952, L1017, L1105, L1128, L1265, L1283, L1328, L1418), 700 (36), 750 (3: L1069, L1130, L1255), 800 (39). 650 and 750 are not loaded weights. Because the Google stylesheet declares one face per weight, the browser picks the 700 face for 650 and the 800 face for 750. See Notes and traps.
- No mono rule asks for a weight above 500, and every serif rule forces weight 400, so no faux bold is drawn.

##### Base text (L96-104)
- `body`: `font-family:var(--font-sans)`, `font-size:var(--fs-body)` (1rem, so 16px), `line-height:1.65`, `color:var(--ink-2)`, `background:var(--bg)`, `margin:0`, `overflow-x:hidden`, `transition:background-color var(--dur-2) var(--ease-out),color var(--dur-2) var(--ease-out)`.
- `h1,h2,h3,h4` (L103): `color:var(--ink);margin:0;font-weight:700;letter-spacing:-.02em;line-height:1.1`. The shell gives headings NO font size; every heading gets its size from a class (`.sec-title`, `.hero-title` or a page class).
- `p{margin:0}` (L104).
- `button,input,select,textarea{font:inherit;color:inherit}` (L101). `button{cursor:pointer;background:none;border:0;padding:0}` (L102). `a{color:inherit;text-decoration:none}` (L100).

##### Type scale (exact values)

| Style | Selector and line | Font | Size | Weight | Letter spacing | Line height | Colour | Other |
|---|---|---|---|---|---|---|---|---|
| Heading base | `h1,h2,h3,h4` L103 | sans | none set | 700 | `-.02em` | `1.1` | `--ink` | `margin:0` |
| Section title (h2 role) | `.sec-title` L130 | sans | `var(--fs-h2)` = `clamp(2.2rem,4.6vw,3.9rem)` | 700 | `-.035em` | `1.02` | inherits heading ink | |
| Serif inside section title | `.sec-title .serif` L131 | serif italic | inherits | 400 | `-.02em` | | | |
| Hero title (h1 role) | `.hero-title` L306 | sans | `clamp(3.4rem,10vw,9.5rem)` | 800 | `-.055em` | `.9` | `--ink` | used once: `h2.hero-title.ct-title` L3982 |
| Serif inside hero title | `.hero-title .serif` L307 | serif italic | inherits | 400 | `-.03em` | | | |
| h3 scale | token `--fs-h3` = `clamp(1.15rem,1.6vw,1.4rem)` | | | | | | | only page use L2158, L2283 |
| Display | token `--fs-display` = `clamp(3.1rem,7.6vw,7rem)` | | | | | | | never used |
| Lead | `.lead` L122 | sans | `var(--fs-lead)` = `clamp(1.02rem,1.25vw,1.18rem)` | inherits (400) | none | `1.7` | `--ink-2` | `max-width:62ch` |
| Eyebrow | `.eyebrow` L127 | mono | `var(--fs-label)` = `.72rem` | 500 | `.16em` | inherits | `--brand-ink` | `display:inline-flex;align-items:center;gap:12px;text-transform:uppercase` |
| Eyebrow rule | `.eyebrow::before` L128 | | | | | | `currentColor` | `content:"";width:28px;height:1px;opacity:.6` |
| Eyebrow bold part | `.eyebrow b` L129 | | | 500 | | | | `opacity:.55` |
| Label | `.label` L121 | mono | `.72rem` | 500 | `.14em` | inherits | `--muted` | uppercase |
| Serif accent | `.serif` L118 | serif | inherits | 400 | `-.01em` | | | `font-style:italic` |
| Mono | `.mono` L120 | mono | inherits | | | | | only sets the family |
| Gradient text | `.grad-text` L119 | | | | | | `transparent` | `background:var(--grad-glow);-webkit-background-clip:text;background-clip:text` |
| Stat number | `.stat-num` L173 | sans | `clamp(1.9rem,3vw,2.6rem)` | 800 | `-.04em` | `1` | `--ink` | `font-variant-numeric:tabular-nums` |
| Tag | `.tag` L154 | mono | `.68rem` | 500 | `.06em` | | `--brand-ink` | uppercase, see 11.1.7 |
| Button | `.btn` L134-135 | sans | `.95rem` (`.85rem` for `.btn--sm`) | 600 | `-.005em` | | | |
| Pill | `.pill` L151 | sans | `.82rem` | 600 | | | `--brand-ink` | |
| Link arrow | `.link-arrow` L146 | sans | `.9rem` | 600 | | | `--brand-ink` | |
| Crumbs | `.crumbs` L302 | mono | `.72rem` | inherits | `.14em` | | `--muted` | uppercase; never used in markup |
| Rail label | `.rail__link span` L224 | sans | `.56rem` (dock `.54rem`, 360px and down `.5rem`) | 700 | `.06em` (dock `.03em`, 360px and down `0`) | | | uppercase, nowrap |
| Footer big | `.footer__big` L289 | sans | `clamp(3rem,13vw,11rem)` | 800 | `-.06em` | `.9` | `transparent`, stroke `1px var(--line-strong)` | |
| Next page title | `.page-next__title` L339 | sans | `clamp(3rem,11vw,10rem)` | 800 | `-.055em` | `.95` | | |
| Outline number | `.outline-num` L308 | sans | none set | 800 | `-.06em` | `.8` | `transparent`, stroke `1px var(--line-strong)` | never used in markup |
| Curtain title | `.curtain__title` L320 | serif italic | `clamp(2.6rem,7vw,5.6rem)` | inherits 400 | `-.02em` | `1` | `--ink` | |
| Curtain number | `.curtain__num` L319 | mono | `.72rem` | inherits 400 | `.3em` | | `--brand-ink` | |
| Preloader mark | `.preloader .pl-txt` L261 | `font:800 26px var(--font-sans)` | 26px | 800 | `-1px` | | `fill:var(--ink)` | SVG text |
| Toast | `.toast` L282 | sans | `.9rem` | 600 | | | `--bg` on `--ink` | |
| Footer row | `.footer__row` L288 | sans | `.85rem` | | | | `--muted` | |
| Top bar brand | `.topbar__brand` L240 | sans | `.95rem` | 700 | | | `--ink` | |
| Rail logo | `.rail__logo` L219 | sans | `.95rem` (top bar `.82rem`) | 800 | `-.04em` | | `#fff` | |

#### 11.1.3 Shell breakpoints (detail for section 6)

Every `@media` in the shell CSS (L21-364), in file order:

| Line | Query | What changes |
|---|---|---|
| L115 | `(min-width:1024px)` | `.site{padding-left:var(--rail-w)}` (104px) so content clears the rail |
| L218 | `(min-width:1024px)` | `.rail{display:flex}` (it is `display:none` by default, L216) |
| L243 | `(min-width:1024px)` | `.topbar{display:none}` |
| L248 | `(max-width:360px)` | `.dock .rail__link{min-width:44px;padding:0 3px}` and `.dock .rail__link span{font-size:.5rem;letter-spacing:0}` |
| L249 | `(min-width:1024px)` | `.dock{display:none}` |
| L250 | `(max-width:1023px)` | `.site{padding-bottom:84px}` so the last content clears the dock |
| L276 | `(max-width:640px)` | modal becomes a bottom sheet: `.fh-modal{padding:0;align-items:end}` and `.fh-modal__panel{max-height:94vh;border-radius:24px 24px 0 0}` |
| L284 | `(min-width:1024px)` | `.toast{bottom:32px}` (default `bottom:110px` clears the dock) |
| L301 | `(max-width:1023px)` | `.page-hero{min-height:auto;padding-top:108px}` |
| L357 | `(prefers-reduced-motion:reduce)` | see 11.1.6 "Reduced motion" |

Shell visibility by width:

| Width | Rail | Top bar | Dock | `.site` padding | Toast bottom | Modal |
|---|---|---|---|---|---|---|
| 0 to 360px | hidden | shown | shown, tight links | bottom 84px | 110px | bottom sheet |
| 361 to 640px | hidden | shown | shown | bottom 84px | 110px | bottom sheet |
| 641 to 1023px | hidden | shown | shown | bottom 84px | 110px | centred |
| 1024px and up | shown | hidden | hidden | left 104px | 32px | centred |

- The rail and dock swap exactly at 1024px; there is no width where both or neither show.
- Note the off-by-one mix: the modal switches at `max-width:640px` (640 is a sheet), while many page queries use `max-width:639px` and `min-width:640px`. Copy each query as written.
- JS uses the same 1024 split in `FH.scrollToEl` (L4687): the scroll offset is `innerWidth<1024?84:32` px.
- No shell rule uses `hover`, `pointer` or height queries. Pointer checks are in JS only (`(pointer:fine)` at L4627, used by magnetic, tilt, smooth wheel and cursor glow).

#### 11.1.4 Head, theme boot, FH_BASE, FH_HOOKS and the `.js` class

##### Head markup (L1-20)
- L1 `<!doctype html>`. L2 `<html lang="en" data-theme="light">`. L4 `<meta charset="utf-8">`.
- L5 viewport: `width=device-width, initial-scale=1, viewport-fit=cover` (`viewport-fit=cover` is what makes the `env(safe-area-inset-*)` values in the top bar and dock work).
- L6 title `Faisal Hanif · Software Engineer`. L7 description (copy in section 2). L8 `<meta name="theme-color" content="#0e6655">`.
- There is no favicon, no Open Graph, no canonical and no manifest in the reference. PRD.md "SEO" adds these in the rebuild.
- Per page titles are set by the router `show()` (L4683): About keeps `Faisal Hanif · Software Engineer`; the others are `META[id].t+' · Faisal Hanif'`, so `Profile · Faisal Hanif`, `Works · Faisal Hanif`, `Approvals · Faisal Hanif`, `Contact · Faisal Hanif`. Use these as the Next.js `metadata.title` of each route.

##### Behaviour: theme boot (L12-16)
- Starts when: the inline script in `<head>` runs, before first paint.
- Reads: `localStorage.getItem('fh-theme')` inside `try/catch`; if empty, `matchMedia('(prefers-color-scheme: dark)').matches` gives `'dark'`, else `'light'`.
- Writes: `document.documentElement.setAttribute('data-theme',t)`. It does NOT update `meta[name=theme-color]`; only `FH.setTheme` does (L4640).
- Timings: none. Pauses or skips: never. It does not listen for later OS theme changes.
- Cleanup in React: none (plain inline script).
- Port as: an inline `<script>` in `app/layout.tsx` `<head>` (for example via `dangerouslySetInnerHTML`), same logic and same key `fh-theme`. Put `suppressHydrationWarning` on `<html>` because the attribute differs from the server HTML. The server renders `data-theme="light"` like L2.

##### `window.FH_BASE` (L17)
- `'https://faisalhanif.work/'`. Used only by `FH.asset(p)` (L4569): returns `p` unchanged when it matches `/^https?:/`, else `(window.FH_BASE||'')+p.replace(/^\//,'')`.
- Port as: `asset(path)` in `src/lib/asset.ts` that returns `'/' + path.replace(/^\//,'')` so files load from `frontend/public/` (section 8). Keep absolute URLs untouched.

##### `window.FH_HOOKS` (L18-19)
- `window.FH_HOOKS=window.FH_HOOKS||{onContact:null,onBooking:null,chatEndpoint:null};` with the comment `/* Integration hooks. Wire these to the real backend (Stripe, Nodemailer, OpenRouter) when deploying. */`.
- Payloads and fallbacks: section 10 of this map and API_CONTRACT.md. In the rebuild these become `src/lib/api.ts` calls; with no `NEXT_PUBLIC_API_URL` the UI keeps the no hook behaviour (mailto and local chat).

##### Behaviour: the `.js` class (L2881)
- Starts when: `<script>document.documentElement.classList.add('js')</script>`, the first child of `<body>`, before any page markup.
- Writes: class `js` on `<html>`.
- Why it matters: every "hidden until revealed" rule is scoped to `.js`, so without JS the page shows fully. Shell rules that depend on it: L178-187 (reveal system) and L359 (reduced motion override). Page rules that depend on it: L585-591 (about bento), L959-988 (contact hero choreography), L1748-1757 (profile hero entrance), L2054-2056 (`.wk-hero .wk-a`), L2390-2393 and L2409-2410 (works cell screens), L2424, L2481, L2566-2570, L2623 (approvals hero), L2638, L2790-2796, L2873 (works hero).
- Port as: add `js` in the same head script as the theme boot (it must be on `<html>` before first paint so revealed content does not flash). Keep `className` on `<html>` static in React (only the next/font variable classes) and never re-render it from state, or React will wipe `js`, `is-loaded`, `has-pointer` and `smooth-on`.

##### Other classes JS puts on `<html>` or `<body>` (the CSS contract)

| Class | Set by | When | CSS that reads it |
|---|---|---|---|
| `html.js` | L2881 | before paint | L178-187, L359, page rules above |
| `html.is-loaded` | boot `done()` L4782 | 1250ms after DOM ready (0ms with reduced motion) | page L513 `.is-loaded #about .ab-scroll{opacity:1}`. JS waits on it: about.js L4943-4949 (MutationObserver), contact.js L5628, profile.js L6503-6505 (polls every 120ms), works.js L7276-7279 (polls every 50ms, gives up after 80 tries) |
| `html.has-pointer` | cursor glow L4774 | first `pointermove` on a fine pointer | L210 `.has-pointer .cursor-glow{opacity:1}` |
| `html.smooth-on` | smooth wheel L4741 | at script run, fine pointer and no reduced motion | L298 `html.smooth-on{scroll-behavior:auto}` |
| `body.modal-open` | `FH.openModal` L4651 | while any `.fh-modal` is open | L279 `body.modal-open{overflow:hidden}`; smooth wheel ignores wheel events while set (L4749) |

#### 11.1.5 Icon sprite conventions

##### Sprite markup (L2883-2947)
- L2883 comment `<!-- ICON SPRITE (Lucide-style, 24px, stroke) -->`.
- L2884 `<svg width="0" height="0" style="position:absolute" aria-hidden="true">` (no `focusable` attribute here; the page sprites at L3007 and L3966 add `focusable="false"`).
- L2885 `<defs>`, L2886 `<linearGradient id="pl-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e6655"/><stop offset="1" stop-color="#5fcf9f"/></linearGradient>` (used by the preloader arc `stroke:url(#pl-g)`, L260).
- L2887-2945: 59 `<symbol id="i-..." viewBox="0 0 24 24">` elements. Children are plain `path`, `circle`, `rect` and `ellipse` with no stroke or fill attributes, except `i-instagram` (L2905) whose small dot is `<circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>`.
- Other sprites, owned by their pages: `ab-ic-*` 7 symbols (L3007-3017, About), `ct-i-copy` and `ct-i-down` (L3966-3969, Contact), `wk-guil` built by works.js (L7427-7428). These use their own ids and must not be merged into the `i-` namespace.

##### Symbol ids in the shell sprite (L2887-2945, in order)
`i-user`, `i-file`, `i-briefcase`, `i-trophy`, `i-chat`, `i-mail`, `i-phone`, `i-pin`, `i-clock`, `i-calendar`, `i-download`, `i-arrow-right`, `i-arrow-up-right`, `i-arrow-left`, `i-github`, `i-linkedin`, `i-x`, `i-xlogo`, `i-instagram`, `i-quora`, `i-code`, `i-phone-dev`, `i-sparkles`, `i-cloud`, `i-check`, `i-check-circle`, `i-star`, `i-quote`, `i-sun`, `i-moon`, `i-send`, `i-close`, `i-plus`, `i-minus`, `i-play`, `i-layers`, `i-grad`, `i-building`, `i-globe`, `i-shield`, `i-zap`, `i-grid`, `i-video`, `i-lock`, `i-cpu`, `i-database`, `i-server`, `i-rocket`, `i-award`, `i-book`, `i-eye`, `i-bolt-chat`, `i-settings`, `i-cart`, `i-wrench`, `i-dots`, `i-message`, `i-dollar`, `i-external`.

##### Usage conventions
- Markup form: `<svg class="i"><use href="#i-user"/></svg>`. Many uses add `aria-hidden="true"`; the rail, dock and top bar icons (L2977-3000) do not, because each sits next to a visible text label.
- JS form (works.js L6943): `function icon(id,cls){ return '<svg class="i'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#i-'+id+'"/></svg>' }`.
- `.i` (L108): `width:1.15em;height:1.15em;flex:none;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round`. The icon takes the text colour and scales with the font size.
- `.i--fill` (L109): `fill:currentColor;stroke:none`. Used on `i-play` in the PureBody modal (L4513, L4527, L4541) and on `i-star` in the works "Featured" badge (L7033).
- `img,video,svg{display:block;max-width:100%}` (L99) makes every icon a block box; they sit in flex rows.
- Shell size overrides: `.btn .i` 18px (L137), `.link-arrow .i` default 1.15em with hover move (L147-148), `.icon-tile .i` 22px (L162), `.rail__link .i` 19px (L223), `.theme-btn .i` 19px (L232), `.page-next__arrow .i` 40% (L344).
- The theme toggle uses the extra classes `i-moon` and `i-sun` on the `<svg>` itself (same text as the symbol ids) to swap icons with CSS (L233-235).

##### Recommendation: `IconSprite` and `Icon` (`src/components/ui/`)
- `IconSprite.tsx`: renders the L2884 wrapper once, at the top of `<body>` in `app/layout.tsx`, before any `<use>`. Keep the inner markup (L2886-2945) as one verbatim string constant and inject it with `dangerouslySetInnerHTML` so no SVG attribute has to be renamed for JSX and the paths stay byte for byte.
- `Icon.tsx`: `type IconName = 'user' | 'file' | ... | 'external'` (the 59 ids without `i-`). Props `{ name: IconName; fill?: boolean; className?: string; label?: string }`. Output `<svg className={['i', fill && 'i--fill', className]...} aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}><use href={`#i-${name}`} /></svg>`. For the rail, dock and top bar icons, render without `aria-hidden` to match the reference, or with it (no visual change); screen reader names come from the text labels either way.
- Page sprites (`ab-ic-*`, `ct-i-*`, `wk-guil`) stay in their page components.

#### 11.1.6 Global shell pieces

##### Body order and stacking (L2880-4558)
Body children in order: `.js` script (L2881), icon sprite (L2884), `.preloader#preloader` (L2949), `.curtain#curtain` (L2956), `.progress#progress` (L2961), `.ambient` (L2963), `.cursor-glow#cursorGlow` (L2970), `aside.rail` (L2973), `header.topbar#topbar` (L2988), `nav.dock` (L2995), `main.site#site` (L3003-4237, five page sections then the footer), `#booking` modal (L4240), `.ct-chat#ct-chat` (L4468), `#purebody` modal (L4494), `.toast#toast` (L4557), then the scripts.

| z-index | Element | Line |
|---|---|---|
| 0 | `.ambient` (fixed, full screen) | L196 |
| 0 | `.cursor-glow` (fixed) | L208 |
| 1 | `.site` (relative) and `.footer` (relative) | L112, L287 |
| 50 | `.rail`, `.topbar`, `.dock` (fixed) | L216, L237, L244 |
| 60 | `.progress` (fixed, above the top bar) | L215 |
| 70 | `.ct-chat` (fixed, page CSS) | L1465 |
| 80 | `.fh-modal` (fixed) | L269 |
| 90 | `.toast` (fixed) | L282 |
| 95 | `.curtain` (fixed) | L311 |
| 100 | `.preloader` (fixed) | L255 |

##### Preloader (HTML L2949-2954, CSS L252-264, JS L4777-4784)
- Root: `div.preloader#preloader[aria-hidden="true"]`.
- Structure: `div.preloader__mark` > `svg[viewBox="0 0 90 90"]` holding `circle.pl-ring` (`cx="45" cy="45" r="40"`), `circle.pl-arc` (same circle, `transform="rotate(-90 45 45)"` so the arc starts at 12 o'clock) and `text.pl-txt` (`x="45" y="54" text-anchor="middle"`, text `FH`); then `span.label` with text `Faisal Hanif · Portfolio`.
- CSS:
  - `.preloader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--bg);transition:clip-path 1s var(--ease-io),visibility 0s 1s;clip-path:inset(0 0 0 0)}` (L255)
  - `.preloader.is-done{clip-path:inset(0 0 100% 0);visibility:hidden}` (L256): the sheet wipes upward (its bottom edge rises), then turns hidden after 1s.
  - `.preloader__mark{display:grid;justify-items:center;gap:18px}` (L257); `.preloader svg{width:84px;height:84px}` (L258)
  - `.preloader .pl-ring{stroke:var(--line-strong);stroke-width:2;fill:none}` (L259)
  - `.preloader .pl-arc{stroke:url(#pl-g);stroke-width:2.5;fill:none;stroke-linecap:round;stroke-dasharray:252;stroke-dashoffset:252;animation:fh-draw 1.1s var(--ease-io) forwards}` (L260)
  - `.preloader .pl-txt{font:800 26px var(--font-sans);fill:var(--ink);letter-spacing:-1px;opacity:0;animation:fh-fade .6s .35s var(--ease-out) forwards}` (L261)
  - `.preloader .label{opacity:0;animation:fh-fade .6s .5s var(--ease-out) forwards}` (L262); `.label` base styles L121.
  - `@keyframes fh-draw{to{stroke-dashoffset:0}}` (L263); `@keyframes fh-fade{to{opacity:1}}` (L264).
- Animations start as soon as the CSS applies (page load), not from JS.

Behaviour: boot and preloader lift (L4778-4784)
- Starts when: `FH.ready` (runs now if `document.readyState!=='loading'`, else on `DOMContentLoaded`).
- Writes, in order: `#year` text to `new Date().getFullYear()`; `onScroll()` (progress and top bar); `cursor()` (starts the glow loop); `FH._parallax()`. Then `done()`: adds `is-done` to `#preloader` and `is-loaded` to `<html>`, then after 250ms (0ms with reduced motion) calls `FH.observe(document)` (reveals, split words, counters) and `FH.bind(document)` (magnetic, tilt).
- Timings: `done` runs `setTimeout(done, 1250)` after ready (at once with reduced motion). The lift takes 1s (`clip-path 1s var(--ease-io)`), so the preloader is fully gone about 2250ms after ready. Reveals start at 1500ms, while the sheet is still lifting.
- Pauses or skips when: reduced motion (instant). The preloader stays in the DOM, hidden, after it lifts.
- Cleanup in React: clear both timeouts on unmount.
- Port as: `<Preloader />` in `src/components/layout/`, rendered once by the root layout so it only runs on the first full load, never on client route changes. A `LoadStateProvider` (or `useBoot`) adds `is-loaded` to `<html>` at 1250ms and exposes `useIsLoaded()`; page hooks use it instead of the reference's MutationObserver and polling. Start the reveal observer 250ms after that.

##### Curtain page transition (HTML L2956-2960, CSS L310-333, JS L4673-4730)
- Root: `div.curtain#curtain[aria-hidden="true"]`.
- Structure:
  - `div.curtain__layer.curtain__layer--a` (tint sheet)
  - `div.curtain__layer.curtain__layer--b` (surface sheet)
  - `div.curtain__label` > `div.curtain__inner` > `span.curtain__num#curtainNum` (static text `02 / 05`), then a wrapper `span` with inline `style="overflow:hidden;display:block;padding:0 .1em .08em"` holding `span.curtain__title#curtainTitle` (static text `Profile`), then `span.curtain__bar`.
- Base CSS:
  - `.curtain{position:fixed;inset:0;z-index:95;pointer-events:none;visibility:hidden}` (L311); `.curtain.is-on{visibility:visible;pointer-events:auto}` (L312, blocks clicks while it runs).
  - `.curtain__layer{position:absolute;left:-5vw;right:-5vw;top:0;bottom:0;transform:translate3d(0,108%,0);border-radius:50% 50% 0 0/14vh 14vh 0 0;will-change:transform,border-radius}` (L313): each sheet waits below the screen with a curved top edge.
  - `.curtain__layer--a{background:var(--accent);opacity:.18}` (L314); dark `[data-theme="dark"] .curtain__layer--a{opacity:.22}` (L316).
  - `.curtain__layer--b{background:var(--surface);box-shadow:0 -30px 80px -30px rgba(8,48,42,.25)}` (L315).
  - `.curtain__label{position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:var(--ink)}` (L317); `.curtain__inner{display:grid;justify-items:center;gap:12px;padding:0 16px}` (L318).
  - `.curtain__num{font-family:var(--font-mono);font-size:.72rem;letter-spacing:.3em;color:var(--brand-ink);opacity:0;transform:translateY(8px)}` (L319).
  - `.curtain__title{display:block;font-family:var(--font-serif);font-style:italic;font-size:clamp(2.6rem,7vw,5.6rem);line-height:1;letter-spacing:-.02em;color:var(--ink);transform:translateY(105%)}` (L320).
  - `.curtain__bar{width:88px;height:2px;border-radius:2px;background:var(--line);overflow:hidden}` (L321); `.curtain__bar::after{content:"";display:block;height:100%;width:100%;background:var(--grad-glow);transform:scaleX(0);transform-origin:0 50%}` (L322).
  - State CSS (`.is-in`, `.is-out`, `.page.is-leaving`): 11.1.9.
- Page labels come from `META` (L4675): `about` `01` `About`, `profile` `02` `Profile`, `works` `03` `Works`, `approvals` `04` `Approvals`, `contact` `05` `Contact`. The number text is `META[page].n+' / 05'` (for example `03 / 05`).

Behaviour: router transition `FH.go(target, opts)` (L4689-4711)
- Starts when: a left click without modifier keys on any `a[href^="#"]` (window capture listener L4713-4723; the default is always prevented; a part's own handler can claim the click by calling `preventDefault` again); `popstate` (L4724, falls back to `about`); `Element.prototype.scrollIntoView` on an element in another page (L4726-4727); direct `FH.go` calls from parts.
- Reads: target element, its page (`closest('.page')`), `FH.current`, `busy`.
- Writes, in order: `history.pushState(null,'',hash)` unless `opts.noHistory` or inside an iframe; closes any open modal; if the target page is the current page, it only scrolls (to the anchor, or smooth to 0) and stops. Otherwise: `#curtainNum` and `#curtainTitle` text; curtain `remove('is-out')`, `add('is-on')`, forced reflow (`void c.offsetWidth`), `add('is-in')`; current page gets `is-leaving`.
- Timings: at 560ms `show(page)` and `jumpTop()` (instant scroll to 0 under the full cover); 140ms later (700ms) `add('is-out')` and `remove('is-in')`; 640ms later (1340ms) `remove('is-on','is-out')`, `busy=false`, then scroll to the anchor if there is one. Total 1340ms.
- `show(id)` (L4681-4686): toggles `is-current` on the five pages and removes `is-leaving`; sets `FH.current`; `FH.setActive(id)`; sets `document.title`; dispatches `fh:page` (detail = page id) on `document`; next frame dispatches a window `resize` event and runs `FH._parallax()`.
- `jumpTop()` (L4680): sets `html.style.scrollBehavior='auto'`, `scrollTo(0,0)`, restores it, then resets the smooth wheel state.
- Pauses or skips when: `busy` (clicks during a transition are ignored); reduced motion, the very first show, or `opts.instant` (then `show` + `jumpTop` at once and the anchor scroll after 60ms). On first load with a hash that points inside a page, it shows that page and scrolls to the element after 1600ms (L4729-4730).
- Rail and logo links are blurred after a mouse click (`a.matches('.rail__link,.rail__logo')&&e.detail`, L4719) so no focus ring stays.
- Page scripts watch the curtain: "covering" means `is-on` and not `is-out` (profile.js L6552-6559, works.js L7313-7320, MutationObserver on `#curtain` class; fallbacks 1600ms and 1800ms).
- Cleanup in React: clear the three timeouts; never leave `busy` stuck on unmount.
- Port as: `usePageTransition` plus `<Curtain />` (`src/components/layout/`). Intercept internal links, cover (560ms), call `router.push` under the cover, reveal (`is-out` at +140ms), clear at +640ms. Keep the element id `curtain` and the class names on the DOM, and expose the phase through context (`useCurtainPhase()`), so page heroes can start "after the curtain begins to lift". Map old hashes (`/#works`) to routes as PRD.md says.

##### Next page link (CSS L335-347, JS L4732-4736)
- Injected by JS at the end of every page section: `div.wrap` > `nav.page-next[aria-label="Next page"][data-reveal]` > `a[href="#<next>"]` holding:
  - `div.page-next__top` > `span.label` (`Next page · 02`, or `Back to the start · 01` on the last page) and `span.label` (`<index> / 5`, for example `1 / 5`)
  - `div.page-next__title` > `span.page-next__word` (all but the last 2 letters of the title, then `<span class="serif">` with the last 2) and `span.page-next__arrow` > `svg.i` using `#i-arrow-right`
  - `div.page-next__line`
- Word splits: `Abo` + `ut`, `Profi` + `le`, `Wor` + `ks`, `Approva` + `ls`, `Conta` + `ct`. Data in 11.1.11 (`site.ts`).
- CSS:
  - `.page-next{display:block;position:relative;padding:clamp(56px,9vw,120px) 0 clamp(40px,6vw,72px);border-top:1px solid var(--line);margin-top:clamp(40px,6vw,80px)}` (L336)
  - `.page-next a{display:grid;gap:14px;color:var(--ink)}` (L337); `.page-next__top{display:flex;justify-content:space-between;align-items:center;gap:12px}` (L338)
  - `.page-next__title{position:relative;display:flex;align-items:center;gap:clamp(12px,2vw,28px);font-size:clamp(3rem,11vw,10rem);font-weight:800;letter-spacing:-.055em;line-height:.95}` (L339)
  - `.page-next__word{position:relative;color:transparent;-webkit-text-stroke:1.2px var(--line-strong);background:var(--grad-glow);-webkit-background-clip:text;background-clip:text;background-size:0% 100%;background-repeat:no-repeat;transition:background-size 1s var(--ease-out),-webkit-text-stroke-color .6s}` (L340); `.page-next__word .serif{font-weight:400}` (L341)
  - Hover and focus: `.page-next a:hover .page-next__word,.page-next a:focus-visible .page-next__word{background-size:100% 100%;-webkit-text-stroke-color:transparent}` (L342): the gradient fills the outlined word from left to right in 1s.
  - `.page-next__arrow{width:clamp(56px,8vw,120px);height:clamp(56px,8vw,120px);flex:none;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);transition:transform .8s var(--ease-out),background-color .5s,color .5s,border-color .5s}` (L343); `.page-next__arrow .i{width:40%;height:40%}` (L344)
  - `.page-next a:hover .page-next__arrow{transform:rotate(-45deg);background:var(--grad);color:#fff;border-color:transparent}` (L345)
  - `.page-next__line{height:1px;background:var(--line-strong);transform-origin:0 50%;transform:scaleX(.08);transition:transform 1.1s var(--ease-out)}` (L346); `.page-next a:hover .page-next__line{transform:scaleX(1)}` (L347)
- Reveal: `data-reveal` with no value, so the `up` variant (11.1.9).
- Port as: `<NextPageLink current="about" />` in `src/components/layout/`, rendered at the end of each page inside `.wrap`, linking to the next route.

##### Scroll progress (HTML L2961, CSS L215, JS L4665-4668)
- Root: `div.progress#progress` (no ARIA; decorative).
- CSS: `.progress{position:fixed;left:0;top:0;height:2px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--grad-glow);z-index:60}`. No transition: it follows scroll frame by frame.

Behaviour: progress and top bar state (L4666-4668)
- Starts when: window `scroll` (passive), throttled to one `requestAnimationFrame`; also once at boot (L4781).
- Reads: `document.documentElement.scrollHeight-innerHeight`, `scrollY`.
- Writes: `#progress` inline `transform:'scaleX('+(h>0?scrollY/h:0)+')'`; `#topbar` class `is-scrolled` when `scrollY>12`.
- Pauses or skips: never (runs on every page and width).
- Cleanup in React: remove the scroll listener and cancel the pending frame.
- Port as: `useScrollProgress()` used by `<ScrollProgress />` and `<TopBar />` (write the transform to a ref, not React state, to avoid re-renders).

##### Ambient background: dot grid and soft glows (HTML L2963-2969, CSS L193-207)
- Root: `div.ambient[aria-hidden="true"]` with children `div.ambient__blob.ambient__blob--a`, `--b`, `--c`, `div.ambient__grid`, `div.ambient__grain`. Static; no JS.
- `.ambient{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}` (L196).
- Soft glows: `.ambient__blob{position:absolute;border-radius:50%;filter:blur(80px);will-change:transform}` (L197)
  - `--a`: `width:52vmax;height:52vmax;left:-14vmax;top:-18vmax;background:radial-gradient(circle,var(--blob-a),transparent 65%);animation:fh-drift-a 38s var(--ease-io) infinite alternate` (L198)
  - `--b`: `width:46vmax;height:46vmax;right:-16vmax;top:18vh;background:radial-gradient(circle,var(--blob-b),transparent 65%);animation:fh-drift-b 44s var(--ease-io) infinite alternate` (L199)
  - `--c`: `width:40vmax;height:40vmax;left:28vw;bottom:-22vmax;background:radial-gradient(circle,var(--blob-c),transparent 65%);animation:fh-drift-c 50s var(--ease-io) infinite alternate` (L200)
  - Keyframes: `fh-drift-a{to{transform:translate3d(10vw,8vh,0) scale(1.08)}}` (L201), `fh-drift-b{to{transform:translate3d(-8vw,-6vh,0) scale(.92)}}` (L202), `fh-drift-c{to{transform:translate3d(-6vw,-10vh,0) scale(1.1)}}` (L203).
- Dot grid: `.ambient__grid{position:absolute;inset:0;background-image:radial-gradient(var(--dot) 1px,transparent 1.2px);background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 80%);mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 80%)}` (L204-205). The dots fade out towards the edges and the bottom.
- Grain: `.ambient__grain{position:absolute;inset:-50%;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}` (L206); dark `opacity:.07` (L207). Copy the data URI exactly.
- Reduced motion: the global rule (L358) makes each drift run once in .001ms; with no fill mode the blobs rest at their start positions.
- Port as: `<AmbientBackground />` (static markup, pure CSS).

##### Cursor glow (HTML L2970, CSS L208-210 and L361, JS L4772-4775)
- Root: `div.cursor-glow#cursorGlow[aria-hidden="true"]`.
- CSS: `.cursor-glow{position:fixed;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,var(--accent-soft),transparent 60%);opacity:0;transition:opacity .8s var(--ease-out);will-change:transform}` (L208-209); `.has-pointer .cursor-glow{opacity:1}` (L210); reduced motion `display:none` (L361).

Behaviour: cursor glow (L4773-4775)
- Starts when: boot calls `cursor()` (L4781). Returns at once unless `(pointer:fine)` matches and reduced motion is off.
- Reads: `pointermove` (passive) `clientX`, `clientY`. Start point is the screen centre (`innerWidth/2`, `innerHeight/2`).
- Writes: `html.has-pointer` on the first move; each frame `x=FH.lerp(x,tx,.08)`, `y=FH.lerp(y,ty,.08)` and inline `transform:'translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)'`.
- Timings: lerp factor `.08` per frame; fade in `.8s`.
- Pauses or skips when: coarse pointer or reduced motion (never starts). Once started, the frame loop never stops (not even on a hidden tab, where the browser throttles it).
- Cleanup in React: cancel the frame and remove the listener.
- Port as: `<CursorGlow />` with a `useCursorGlow` hook (write to a ref; stopping the loop while the glow is at rest is fine, it does not change what is seen).

##### `main.site`, pages and page hero (HTML L3003 and L4237, CSS L111-115, L250, L293-308)
- Root: `main.site#site` (L3003 to L4237). Children: `section#about.ab`, `section#profile.section.pf`, `section#works.section.wk-sec`, `section#approvals.section.wk-sec.wk-ap`, `section.section.ct#contact`, then `footer.footer`.
- `.site{position:relative;z-index:1}` (L112); at min-width 1024px `padding-left:var(--rail-w)` (L115); at max-width 1023px `padding-bottom:84px` (L250).
- The core script adds class `page` and `data-page="<id>"` to each of the five sections (L4677). `.page:not(.is-current){display:none}` (L299): only one page is in the layout at a time. In the rebuild each page is its own route, so this rule is only needed if pages are kept in the DOM.
- `.section{position:relative;padding-block:var(--section-y)}` (L114). About is not a `.section`. All four `.section` elements override the padding in page CSS (11.1.10), so `--section-y` never reaches the screen.
- `.page-hero` (L300): `position:relative;min-height:min(100svh,1000px);display:flex;flex-direction:column;justify-content:center;padding-top:clamp(110px,14vh,170px);padding-bottom:clamp(56px,9vh,110px)`. At max-width 1023px (L301): `min-height:auto;padding-top:108px`. Used by `header.page-hero.pf-hero#pf-hero` (L3439), `header.page-hero.wk-hero.wk-hero--works#wk-hero` (L3799), `header.page-hero.wk-hero.wk-hero--ap#wk-ap-hero` (L3900), `header.page-hero.ct-hero#ct-hero` (L3972). The About hero is `div.ab-hero` and does not use `.page-hero`. Page overrides of its padding are listed in 11.1.10.

##### Footer (HTML L4228-4236, CSS L286-290, JS L4780)
- Root: `footer.footer` (inside `main.site`, after the pages, so it shows under every page).
- Structure: `div.wrap` > `div.footer__big[aria-hidden="true"]` (text `Faisal ` + `<span class="serif">Hanif</span>`), then `div.footer__row` > `span` (text `© <span id="year">2026</span> Faisal Hanif · Software Engineer · Lahore, Pakistan`) and `a.link-arrow[href="#about"]` (text `Back to top ` + `svg.i` using `#i-arrow-up-right`).
- CSS:
  - `.footer{position:relative;z-index:1;padding:48px 0 40px;border-top:1px solid var(--line)}` (L287)
  - `.footer__row{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center;font-size:.85rem;color:var(--muted)}` (L288)
  - `.footer__big{font-size:clamp(3rem,13vw,11rem);line-height:.9;letter-spacing:-.06em;font-weight:800;color:transparent;-webkit-text-stroke:1px var(--line-strong);margin-bottom:28px;user-select:none;white-space:nowrap}` (L289): outlined letters only.
  - `.footer__big .serif{-webkit-text-stroke:0;color:var(--brand-ink);opacity:.9}` (L290): "Hanif" is solid brand ink, serif italic.
- Interactions: the "Back to top" link uses `.link-arrow` hover (icon moves `translate(3px,-3px)`). Its `href="#about"` goes through the router: on About it smooth scrolls to the top; on any other page it runs the full curtain transition to About.
- JS: boot writes `#year` text to `new Date().getFullYear()` (L4780).
- Responsive: none of its own. At 1023px and below the dock covers the bottom 84px, which `.site` padding clears.
- Port as: `<Footer />` in `src/components/layout/`. Render the year on the client (or at build time) so the static `2026` matches the reference today.

##### Toast (HTML L4557, CSS L281-284, JS L4662-4663)
- Root: `div.toast#toast[role="status"][aria-live="polite"]`, empty.
- CSS: `.toast{position:fixed;left:50%;bottom:110px;transform:translate(-50%,20px);z-index:90;padding:12px 18px;border-radius:14px;background:var(--ink);color:var(--bg);font-weight:600;font-size:.9rem;opacity:0;pointer-events:none;transition:opacity .4s var(--ease-out),transform .5s var(--ease-out);box-shadow:var(--shadow-lg)}` (L282); `.toast.is-on{opacity:1;transform:translate(-50%,0)}` (L283); min-width 1024px `bottom:32px` (L284). Colours invert per theme (dark text on light in dark mode).

Behaviour: `FH.toast(msg)` (L4663)
- Starts when: a part calls `FH.toast(msg)` (messages in section 10, plus copy email toasts in the page parts).
- Writes: `textContent=msg`, adds `is-on`, clears the previous timer, removes `is-on` after 3200ms. A new toast restarts the 3200ms.
- Pauses or skips: never.
- Cleanup in React: clear the timer.
- Port as: `<Toast />` plus a `ToastProvider` with `useToast()` returning `toast(msg)`.

##### Modal shell `.fh-modal` (CSS L266-279, JS L4649-4660)
- L267 documents the shape: `<div class="fh-modal" id="x" aria-hidden="true"><div class="fh-modal__scrim" data-close></div><div class="fh-modal__panel" role="dialog" aria-modal="true">…</div></div>`.
- Users: `#booking.fh-modal.ct-bk` (L4240, close label `Close booking`, panel `.ct-bk__panel` with `aria-labelledby="ct-bk-t1"`) and `#purebody.fh-modal.wk-pb` (L4494, close label `Close PureBody showcase`, `aria-labelledby="wk-pb-title"`). The close button is `button.fh-modal__close[type="button"][data-close]` with `svg.i` using `#i-close`, first child of the panel.
- CSS:
  - `.fh-modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:clamp(0px,3vw,32px);visibility:hidden;pointer-events:none}` (L269); `.fh-modal.is-open{visibility:visible;pointer-events:auto}` (L270)
  - `.fh-modal__scrim{position:absolute;inset:0;background:rgba(3,14,11,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s var(--ease-out)}` (L271); `.fh-modal.is-open .fh-modal__scrim{opacity:1}` (L272)
  - `.fh-modal__panel{position:relative;width:min(1080px,100%);max-height:min(92vh,100%);overflow:auto;overscroll-behavior:contain;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);opacity:0;transform:translateY(28px) scale(.98);transition:opacity .5s var(--ease-out),transform .7s var(--ease-out)}` (L273-274); `.fh-modal.is-open .fh-modal__panel{opacity:1;transform:none}` (L275)
  - max-width 640px (L276): `.fh-modal{padding:0;align-items:end}`, `.fh-modal__panel{max-height:94vh;border-radius:24px 24px 0 0}` (bottom sheet)
  - `.fh-modal__close{position:sticky;top:14px;margin-left:auto;margin-right:14px;margin-top:14px;z-index:5;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);color:var(--ink);float:right;transition:transform var(--dur-2) var(--ease-out)}` (L277); `.fh-modal__close:hover{transform:rotate(90deg)}` (L278)
  - `body.modal-open{overflow:hidden}` (L279)
  - Page overrides: `#booking .ct-bk__panel{width:min(1000px,100%)}` (L1227), `#purebody .fh-modal__panel{width:min(1120px,100%)}` (L2321).
- Open animates (scrim .5s, panel opacity .5s and transform .7s). Close is instant: `visibility:hidden` has no transition, so the panel disappears at once when `is-open` is removed.

Behaviour: modals (L4650-4660)
- Starts when: delegated document `click`: `[data-close]` closes its own `.fh-modal`; `[data-open]` opens the modal whose id is the attribute value (used by the works "Live Preview" button, works.js L7036); `[data-book]` calls `FH.openBooking(b.dataset.book||'')` or falls back to `FH.openModal('booking')`. `keydown` `Escape` closes all open modals. Router `FH.go` also closes them.
- `FH.openModal(id)`: stores `document.activeElement`, adds `is-open`, sets `aria-hidden="false"`, adds `body.modal-open`, after 60ms focuses the first `[autofocus],button,input,select,textarea,a[href]` inside with `{preventScroll:true}`, dispatches `fh:open` on the modal.
- `FH.closeModal(id?)`: closes that modal or every `.fh-modal.is-open`; sets `aria-hidden="true"`; dispatches `fh:close` on each; removes `body.modal-open` when none is open; returns focus to the stored element with `{preventScroll:true}`.
- Pauses or skips: there is no focus trap (Tab can leave the dialog) and no scroll lock beyond `overflow:hidden`.
- Cleanup in React: remove the `keydown` listener; clear the 60ms focus timer.
- Port as: `<Modal id open onClose labelledBy closeLabel>` in `src/components/ui/`, plus a `ModalProvider` that keeps `body.modal-open`, `aria-hidden`, focus return and the `fh:open` and `fh:close` hooks (the PureBody videos pause on close).

##### Focus, selection and scrollbars
- `:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}` (L106). It also sets `border-radius:6px` on the focused element. Rules later in the file with the same or higher specificity keep their own radius (for example `.btn` at L134 keeps `var(--r-pill)`), so keep this rule BEFORE the component rules.
- `.rail__link:focus-visible{outline-offset:-2px;border-radius:14px}` (L225); `.rail__link:focus:not(:focus-visible){outline:none}` (L226).
- Page focus rules (for the page parts): L864, L1120, L1246, L1405, L1498, L1624, L1732-1733, L1957, L1977, L2088, L2236, L2483, L2494, L2496-2497, L2679, L2698, L2782.
- `::selection{background:var(--accent);color:#04231b}` (L105).
- Scrollbars: the shell styles none (native page scrollbar). Page CSS hides scrollbars on three scrollers: `.wk-sec .wk-filter` (L2078 `scrollbar-width:none`, L2081 `::-webkit-scrollbar{display:none}`), `#approvals .wk-rail` (L2232, L2235) and `#purebody .wk-pb__phones` at max-width 760px (L2375, L2377).
- `html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:24px}` (L95); `html.smooth-on{scroll-behavior:auto}` (L298). `body{overflow-x:hidden}` (L97).
- No `color-scheme` on `:root` (only form inputs in dark mode, L1336), so native scrollbars and form controls stay light in dark mode.

##### Reduced motion (L356-362)
```css
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
  .js [data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}
  .w>span{transform:none!important}
  .cursor-glow{display:none}
}
```
- Transition DELAYS are not reset, so delayed transitions still wait before they jump (for example the curtain `.2s` title delay). The contact part resets its own delays (L1557).
- JS reads the same query once at load (`FH.reduce`, L4565) and then skips: split word animation, reveal observer (everything gets `is-in` at once), counters (final value), magnetic, tilt, theme circle reveal, curtain (instant page swap), preloader wait (instant), smooth wheel, parallax and cursor glow. It does not listen for changes.
- Page reduced motion blocks: L806, L1553, L1556, L2030, L2382, L2408, L2622, L2872.

#### 11.1.7 Shared components in the shell CSS

All values copied from the lines given. "Used" counts class uses in the body markup (L2879-4558); JS built markup is named where it matters.

##### Layout helpers
- `.wrap` (L113): `width:100%;max-width:var(--maxw);margin-inline:auto;padding-inline:var(--gutter)`. Used 18 times in markup, plus the injected next page wrapper. No page rule overrides it.
- `.section` (L114): `position:relative;padding-block:var(--section-y)`. See 11.1.6 and 11.1.10 (every use overrides the padding).
- `.page-hero` (L300-301): see 11.1.6.
- Grids: not in reference. The shell defines no grid utility classes; every grid is page CSS.

##### Typography helpers
`.serif` L118, `.grad-text` L119, `.mono` L120, `.label` L121, `.lead` L122, `.eyebrow` L127-129, `.sec-title` L130-131, `.hero-title` L306-307, `.stat-num` L173: exact values in the 11.1.2 type scale table.
- `.sec-head` (L125): `display:grid;gap:18px;margin-bottom:clamp(40px,6vw,72px);max-width:880px`. Children in the markup: `span.eyebrow`, `h2.sec-title` and often `p.lead`.
- `.sec-head--center` (L126): `margin-inline:auto;text-align:center;justify-items:center` (used once, pricing L3375).
- `.crumbs` (L302-305): `display:inline-flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)`; `.crumbs a{color:var(--muted);transition:color var(--dur-1)}`, `.crumbs a:hover{color:var(--brand-ink)}`; `.crumbs i{font-style:normal;opacity:.5}`; `.crumbs b{font-weight:500;color:var(--brand-ink)}`. Not used anywhere in markup or JS. Port it anyway (it is part of the shell CSS).
- `.outline-num` (L308): `font-weight:800;letter-spacing:-.06em;line-height:.8;color:transparent;-webkit-text-stroke:1px var(--line-strong);user-select:none;pointer-events:none`. Not used anywhere. Port it anyway.
- `.sr-only` (L107): `position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0`. Used 25 times in markup.

##### Buttons (L133-145)
- `.btn` (L134-136): `--h:52px;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;height:var(--h);padding:0 24px;border-radius:var(--r-pill);font-weight:600;font-size:.95rem;letter-spacing:-.005em;white-space:nowrap;isolation:isolate;overflow:hidden;transition:transform var(--dur-1) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),background-color var(--dur-1),color var(--dur-1),border-color var(--dur-1)`.
- `.btn .i` (L137): `width:18px;height:18px`.
- `.btn--primary` (L138): `background:var(--grad);color:#fff;box-shadow:var(--glow)`.
  - Shine: `.btn--primary::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);transform:translateX(-120%);transition:transform .9s var(--ease-out)}` (L139); `.btn--primary:hover::after{transform:translateX(120%)}` (L140). The light band sweeps left to right on hover in .9s and sweeps back on leave.
  - `.btn--primary:hover{box-shadow:0 16px 40px -12px rgba(14,102,85,.7)}` (L141).
- `.btn--ghost` (L142): `background:var(--surface);color:var(--brand-ink);border:1px solid var(--line-strong);box-shadow:var(--shadow-sm)`; hover (L143): `border-color:var(--brand);background:var(--surface-2)`.
- `.btn--sm` (L144): `--h:40px;padding:0 16px;font-size:.85rem`. Used twice (top bar Book L2992, contact map L4117).
- `.btn:active` (L145): `transform:scale(.97)`.
- Focus: the global `:focus-visible` ring (L106); the pill radius stays because `.btn` comes later.
- Magnetic buttons (`data-magnetic`, core JS L4626-4631, fine pointer and no reduced motion only): L3040, L3401 (`0.15`), L3451, L3811, L3912, L3985 (`0.18`); default strength `0.25`. On `pointermove` JS writes inline `transform:translate(x px,y px)` with `x=(clientX-left-width/2)*s`, `y=(clientY-top-height/2)*s` (1 decimal); on `pointerleave` it clears it. The `.btn` transform transition (.35s) smooths the move. Port as `useMagnetic(ref, strength)`.
- Button page overrides of `--h`: see 11.1.1 page scoped table. Other `.btn` rules in page CSS: L768, L802, L845, L849-850, L1191, L1193, L1453, L1454, L1788, L2593, L2608, L2838, L2853.

##### Link arrow (L146-148)
- `.link-arrow{display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--brand-ink);font-size:.9rem}`; `.link-arrow .i{transition:transform var(--dur-1) var(--ease-out)}`; `.link-arrow:hover .i{transform:translate(3px,-3px)}`. Used 6 times (footer "Back to top" is one).

##### Pill and live dot (L150-153)
- `.pill` (L151): `display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--line);color:var(--brand-ink);font-size:.82rem;font-weight:600;box-shadow:var(--shadow-sm)`. Used once: `span.pill.ct-hero__pill` "Available for Projects" (L3976).
- `.dot-live` (L152): `width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 0 rgba(16,185,129,.5);animation:fh-ping 2.4s var(--ease-out) infinite`.
- `@keyframes fh-ping` (L153): `0%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}70%{box-shadow:0 0 0 9px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`. Also reused by page CSS L945 and L1490. Page overrides of `.dot-live`: L1661, L1776 and L2813 (paused while the hero is idle), L2145, L2751.

##### Tags (L154-155)
- `.tag{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:8px;background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;font-weight:500;white-space:nowrap}`; `.tags{display:flex;flex-wrap:wrap;gap:6px}`. Page overrides: L1928, L2161, L2287.
- Chips: not in the shell. Every chip (`.pf-chip`, `.ct-map__chip`, works stack chips) is page CSS.

##### Cards and icon tiles (L157-163)
- `.card` (L158-159): `position:relative;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);transition:transform var(--dur-2) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),border-color var(--dur-2),background-color var(--dur-2)`.
- `.card--hover:hover` (L160): `transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--line-strong)`. Used 4 times (L3411, L3416, L3682, L3693).
- `.icon-tile` (L161): `width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:var(--glow);flex:none`; `.icon-tile .i{width:22px;height:22px}` (L162).
- `.icon-tile--soft` (L163): `background:var(--brand-soft);color:var(--brand-ink);box-shadow:none`.
- Page overrides: `.card` L594-595; `.icon-tile` L593, L595, L1212, L1293-1294, L2005-2006.

##### Spotlight (L165-170, JS L4620-4624)
- `[data-spotlight]{--mx:50%;--my:50%}`; `[data-spotlight]::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;z-index:0;background:radial-gradient(420px circle at var(--mx) var(--my),var(--accent-soft),transparent 45%);transition:opacity var(--dur-2) var(--ease-out)}`; `[data-spotlight]:hover::before{opacity:1}`; `[data-spotlight]>*{position:relative;z-index:1}`.
- JS: one passive document `pointermove` listener; for the closest `[data-spotlight]` ancestor of the target it writes `--mx` and `--my` in px relative to the element's box. Runs on every pointer type and even with reduced motion (the glow only shows on `:hover`). 18 elements use it; page override L1916.
- Port as: `useSpotlight(ref)` or one global listener in the shell (same as the reference).

##### Tilt (JS L4632-4635)
- `[data-tilt]` (4 uses, about bento, value `2.5`; default `5`), fine pointer and no reduced motion only: `pointermove` writes inline `transform:'perspective(900px) rotateX('+(-py*m)+'deg) rotateY('+(px*m)+'deg) translateY(-4px)'` (2 decimals, `px` and `py` from -0.5 to 0.5); `pointerleave` clears it. No shell CSS. Port as `useTilt(ref, max)`.

##### Split words (L188-191, JS L4572-4591)
- `.w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}` (L189)
- `.w>span{display:inline-block;transform:translate3d(0,105%,0);transition:transform 1s var(--ease-out);transition-delay:var(--d,0ms)}` (L190)
- `.is-in .w>span,.w.is-in>span{transform:none}` (L191): ANY ancestor with `is-in` releases the words.
- JS: for `[data-split]` headings, each word becomes `span.w > span` with `--d` = `index*55` ms; elements matching `.serif,.grad-text,em,strong,b` are wrapped whole (one `.w`) so gradients survive. Split runs inside `FH.observe`, 250ms after the preloader starts to lift.

##### Parallax helper (L349-350, JS L4760-4770)
- `[data-parallax]{will-change:transform}`. JS writes the `translate` property (not `transform`): `el.style.translate='0 '+off.toFixed(1)+'px'` with `off=(r.top+r.height/2-vh/2)*-sp` (`sp` from the attribute, default `.1`), only for elements in `.page.is-current` or direct children of `.site`, and skips elements more than 200px outside the viewport. Runs on scroll and resize (one frame each), off with reduced motion. 2 uses: L3207 (`-0.08`) and L3337 (`0.07`). Port as `useParallax(ref, speed)`.

#### 11.1.8 Navigation: rail, theme toggle, top bar and dock

##### Nav items (same five in the rail and the dock)

| Order | `href` | `data-nav` | Icon | Label | Rebuild route |
|---|---|---|---|---|---|
| 1 | `#about` | `about` | `i-user` | `About` | `/` |
| 2 | `#profile` | `profile` | `i-file` | `Profile` | `/profile` |
| 3 | `#works` | `works` | `i-briefcase` | `Works` | `/works` |
| 4 | `#approvals` | `approvals` | `i-trophy` | `Approvals` | `/approvals` |
| 5 | `#contact` | `contact` | `i-chat` | `Contact` | `/contact` |

Each link is `<a class="rail__link" href="#about" data-nav="about"><svg class="i"><use href="#i-user"/></svg><span>About</span></a>`. `data-navgroup` (on `nav.rail__nav` and `nav.dock`) is not read by any JS or CSS.

##### Rail, desktop (HTML L2972-2985, CSS L212-235)
- Root: `aside.rail[aria-label="Section navigation"]`. Shown at min-width 1024px only.
- Structure, top to bottom:
  1. `a.rail__logo[href="#about"][aria-label="Faisal Hanif, back to top"]`, text `FH`.
  2. `nav.rail__nav[data-navgroup]` > `div.rail__ind[aria-hidden="true"]` (sliding highlight), then the five `a.rail__link`.
  3. `div.rail__sep`.
  4. `button.theme-btn[data-theme-toggle][aria-label="Switch light or dark theme"]` (no `type` attribute) > `svg.i.i-moon` (`#i-moon`) and `svg.i.i-sun` (`#i-sun`).
- CSS:
  - `.rail{position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:50;width:calc(var(--rail-w) - 26px);display:none;flex-direction:column;align-items:center;gap:6px;padding:12px 5px;background:var(--glass);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow-md)}` (L216-217). Width is 78px.
  - `@media (min-width:1024px){.rail{display:flex}}` (L218).
  - `.rail__logo{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--grad);color:#fff;font-weight:800;font-size:.95rem;letter-spacing:-.04em;margin-bottom:8px;box-shadow:var(--glow)}` (L219).
  - `.rail__nav{position:relative;display:flex;flex-direction:column;gap:2px}` (L220).
  - `.rail__ind{position:absolute;left:0;right:0;top:0;height:58px;border-radius:14px;background:var(--brand-soft);border:1px solid var(--line);transition:transform .6s var(--ease-out),opacity .3s;opacity:0}` (L221).
  - `.rail__link{position:relative;z-index:1;width:68px;height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:14px;color:var(--muted);transition:color var(--dur-1)}` (L222).
  - `.rail__link .i{width:19px;height:19px;transition:transform var(--dur-2) var(--ease-out)}` (L223).
  - `.rail__link span{font-size:.56rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}` (L224).
  - Focus: `.rail__link:focus-visible{outline-offset:-2px;border-radius:14px}` (L225); `.rail__link:focus:not(:focus-visible){outline:none}` (L226).
  - Hover: `.rail__link:hover{color:var(--ink)}` and `.rail__link:hover .i{transform:translateY(-2px)}` (L227).
  - Active: `.rail__link.is-active{color:var(--brand-ink)}` (L228).
  - `.rail__sep{width:28px;height:1px;background:var(--line-strong);margin:8px 0}` (L229).
- Interactions: hover lifts the icon 2px and darkens the link; the active link turns brand ink and the indicator slides behind it; mouse clicks blur the link (L4719); the logo goes to About.

Behaviour: active nav and rail indicator `FH.setActive(id)` (L4669-4672)
- Starts when: `show(id)` on first load and on every page change.
- Writes: toggles `is-active` on every `[data-nav]` (rail and dock) where `dataset.nav===id`; for each `.rail__nav`, sets the `.rail__ind` inline `opacity:1` and `transform:'translateY('+a.offsetTop+'px)'` where `a` is the matching link.
- Timings: indicator `transform .6s var(--ease-out)`, `opacity .3s`. Link offsets are 0, 60, 120, 180 and 240px (58px link plus 2px gap).
- Pauses or skips: the dock has no indicator. When the rail is hidden (below 1024px) `offsetTop` reads 0, so the indicator is placed on "About" until the next page change (see Notes and traps).
- Cleanup in React: none.
- Port as: `<Rail />` and `<Dock />` read the active route from `usePathname()`. Compute the indicator offset as `index * 60` px (or measure in a layout effect that also runs on resize).

##### Theme toggle (HTML L2984 and L2991, CSS L230-235 and L352-354, JS L4638-4647)
- Two buttons use it: one in the rail, one in the top bar. Same markup and label in both.
- CSS:
  - `.theme-btn{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;color:var(--ink-2);border:1px solid var(--line);background:var(--surface);transition:transform var(--dur-2) var(--ease-out),color var(--dur-1)}` (L230)
  - `.theme-btn:hover{color:var(--brand-ink);transform:rotate(-12deg)}` (L231); `.theme-btn .i{width:19px;height:19px}` (L232)
  - Icon swap: `.theme-btn .i-sun{display:none}` (L233); `[data-theme="dark"] .theme-btn .i-sun{display:block}` (L234); `[data-theme="dark"] .theme-btn .i-moon{display:none}` (L235). Light shows the moon, dark shows the sun.
  - View transition: 11.1.9.

Behaviour: theme toggle with circular reveal (L4639-4647)
- Starts when: `click` on any `[data-theme-toggle]`.
- Reads: current `data-theme` on `<html>`; the button's `getBoundingClientRect()` centre `x`, `y`; `R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))`.
- Writes (`FH.setTheme(t)`): `data-theme` on `<html>`; `localStorage.setItem('fh-theme',t)` in `try/catch`; `meta[name=theme-color]` content `#050f0c` (dark) or `#0e6655` (light); dispatches `fh:theme` (detail = theme) on `document` (no listener in the reference).
- Animation: `document.startViewTransition(()=>FH.setTheme(next))`, then on `vt.ready`: `document.documentElement.animate({clipPath:['circle(0px at Xpx Ypx)','circle(Rpx at Xpx Ypx)']},{duration:750,easing:'cubic-bezier(.65,0,.35,1)',pseudoElement:'::view-transition-new(root)'})`. The new theme grows as a circle from the button.
- Pauses or skips when: no `document.startViewTransition` or reduced motion: the theme switches at once.
- Cleanup in React: none.
- Port as: `ThemeProvider` (`useTheme()` with `toggle(fromEl)`) plus `<ThemeToggle />`. Keep `data-theme` on `<html>` as the single source of truth so the CSS keeps working.

##### Top bar, phone and tablet (HTML L2987-2994, CSS L237-243)
- Root: `header.topbar#topbar`. Hidden at min-width 1024px.
- Structure: `a.topbar__brand[href="#about"]` > `span.rail__logo` (text `FH`) + text `Faisal Hanif`; `div.topbar__actions` > `button.theme-btn[data-theme-toggle]` (as above) + `button.btn.btn--primary.btn--sm[data-book]` > `svg.i` (`#i-calendar`) + text `Book`.
- The brand link has no `aria-label`; its name is "FH Faisal Hanif". The Book button has no `type` attribute and an empty `data-book`, so it opens the booking modal with no preselected session.
- CSS:
  - `.topbar{position:fixed;left:0;right:0;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px var(--gutter);padding-top:max(12px,env(safe-area-inset-top));transition:background-color .4s,box-shadow .4s,backdrop-filter .4s}` (L237-238). Transparent at the top of the page.
  - `.topbar.is-scrolled{background:var(--glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--line)}` (L239). JS adds it when `scrollY>12` (11.1.6 "Scroll progress").
  - `.topbar__brand{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--ink);font-size:.95rem}` (L240).
  - `.topbar__brand .rail__logo{margin:0;width:36px;height:36px;border-radius:11px;font-size:.82rem}` (L241).
  - `.topbar__actions{display:flex;gap:8px;align-items:center}` (L242).
  - `@media (min-width:1024px){.topbar{display:none}}` (L243).
- Port as: `<TopBar />`.

##### Dock, phone and tablet (HTML L2995-3001, CSS L244-250)
- Root: `nav.dock[aria-label="Section navigation"][data-navgroup]` > the five `a.rail__link` (no indicator, no logo, no theme button). Hidden at min-width 1024px.
- CSS:
  - `.dock{position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:50;display:flex;gap:2px;padding:6px;background:var(--glass);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow-lg)}` (L244-245)
  - `.dock .rail__link{width:auto;min-width:50px;height:52px;padding:0 5px}` (L246); `.dock .rail__link span{font-size:.54rem;letter-spacing:.03em}` (L247)
  - `@media (max-width:360px){.dock .rail__link{min-width:44px;padding:0 3px}.dock .rail__link span{font-size:.5rem;letter-spacing:0}}` (L248)
  - `@media (min-width:1024px){.dock{display:none}}` (L249); `@media (max-width:1023px){ .site{padding-bottom:84px} }` (L250)
- All other link styles (icon size, colours, hover, `is-active`) come from the `.rail__link` rules. The active dock link is shown by colour only.
- Two landmarks share the label "Section navigation" (the rail `aside` and the dock `nav`); only one is visible at a time.
- Port as: `<Dock />` sharing a `NavLink` component with `<Rail />`.

#### 11.1.9 CSS for the states JS drives

##### Curtain states (L323-333)
Class sequence set by `FH.go` (11.1.6): `is-on` + `is-in` at 0ms, `is-out` (and `is-in` removed) at 700ms, both removed at 1340ms.

| State | Selector | Declarations |
|---|---|---|
| cover, tint sheet | `.curtain.is-in .curtain__layer--a` (L323) | `transform:none;border-radius:0;transition:transform .5s var(--ease-io),border-radius .5s var(--ease-io)` |
| cover, surface sheet | `.curtain.is-in .curtain__layer--b` (L324) | `transform:none;border-radius:0;transition:transform .52s .04s var(--ease-io),border-radius .52s .04s var(--ease-io)` |
| cover, title | `.curtain.is-in .curtain__title` (L325) | `transform:none;transition:transform .55s .2s var(--ease-out)` |
| cover, number | `.curtain.is-in .curtain__num` (L326) | `opacity:1;transform:none;transition:opacity .4s .24s var(--ease-out),transform .4s .24s var(--ease-out)` |
| cover, bar | `.curtain.is-in .curtain__bar::after` (L327) | `transform:scaleX(1);transition:transform .5s .18s var(--ease-io)` |
| lift, tint sheet | `.curtain.is-out .curtain__layer--a` (L328) | `transform:translate3d(0,-108%,0);border-radius:0 0 50% 50%/0 0 14vh 14vh;transition:transform .55s .05s var(--ease-io),border-radius .55s .05s var(--ease-io)` |
| lift, surface sheet | `.curtain.is-out .curtain__layer--b` (L329) | `transform:translate3d(0,-108%,0);border-radius:0 0 50% 50%/0 0 14vh 14vh;transition:transform .55s var(--ease-io),border-radius .55s var(--ease-io)` |
| lift, title and number | `.curtain.is-out .curtain__title,.curtain.is-out .curtain__num` (L330) | `transform:translateY(-40%);opacity:0;transition:transform .35s var(--ease-io),opacity .3s` |
| lift, bar | `.curtain.is-out .curtain__bar` (L331) | `opacity:0;transition:opacity .2s` |
| lift, bar fill | `.curtain.is-out .curtain__bar::after` (L332) | `transform:scaleX(1)` (stays full) |
| leaving page | `.page.is-leaving` (L333) | `opacity:.55;transform:translateY(-18px) scale(.99);filter:blur(3px);transition:all .5s var(--ease-io);transform-origin:50% 0` |

- On cover, the tint sheet leads and the surface sheet follows 40ms later; both flatten their curved top edge as they rise. On lift, the surface sheet leaves first and the tint trails by 50ms; both curve their bottom edge.
- When `is-on` and `is-out` are removed together, the base rules have no transition, so the sheets snap back below the screen while the curtain is already `visibility:hidden`.
- The base state (sheets at `translate3d(0,108%,0)`, title at `translateY(105%)`, number at `opacity:0;transform:translateY(8px)`, bar fill at `scaleX(0)`) is in 11.1.6.

##### Reveal system (L175-187, JS L4593-4611)
`data-reveal` values: `up` (also an empty value), `fade`, `scale`, `left`, `right`, `blur`, `mask` (comment L176). All rules are scoped to `.js`.

| Selector | Hidden state |
|---|---|
| `.js [data-reveal]` (L178) | `opacity:0;transition:opacity var(--dur-3) var(--ease-out),transform var(--dur-3) var(--ease-out),filter var(--dur-3) var(--ease-out),clip-path var(--dur-4) var(--ease-out);transition-delay:var(--d,0ms);will-change:opacity,transform` |
| `.js [data-reveal="up"],.js [data-reveal=""]` (L179) | `transform:translate3d(0,26px,0);filter:blur(6px)` |
| `.js [data-reveal="fade"]` (L180) | `filter:blur(4px)` |
| `.js [data-reveal="scale"]` (L181) | `transform:scale(.94);filter:blur(6px)` |
| `.js [data-reveal="left"]` (L182) | `transform:translate3d(-32px,0,0);filter:blur(6px)` |
| `.js [data-reveal="right"]` (L183) | `transform:translate3d(32px,0,0);filter:blur(6px)` |
| `.js [data-reveal="blur"]` (L184) | `filter:blur(14px);transform:scale(1.02)` |
| `.js [data-reveal="mask"]` (L185) | `opacity:1;clip-path:inset(0 0 100% 0)` |
| `.js [data-reveal].is-in` (L186) | `opacity:1;transform:none;filter:none` |
| `.js [data-reveal="mask"].is-in` (L187) | `clip-path:inset(0 0 0 0)` |

- Page rules on revealed elements: `#about [data-reveal].is-in{clip-path:none}` (L371), `#profile [data-reveal]:not([data-reveal="mask"]).is-in{clip-path:none}` (L2039), about bento L585-586.
- Reduced motion: L359 forces the revealed state with `!important`.

Behaviour: reveal observer `FH.observe(root)` (L4593-4611)
- Starts when: boot, 250ms after the preloader starts to lift (L4782); parts also call it on content they build.
- Order inside: split every `[data-split]` (11.1.7); for each `[data-stagger]` parent, set `--d` on its direct `[data-reveal]` children to `base+k*step` ms (`step` = `data-stagger` or 70, `base` = `data-delay` or 0) unless a child already has `--d`; then for each `[data-reveal],[data-split],[data-count],[data-onview]`: `data-delay` (when the element has no `data-stagger`) becomes `--d` in ms; `data-count` elements get a counter callback; then observe.
- Observer: `IntersectionObserver` with `rootMargin:'0px 0px -8% 0px'`, `threshold:.12`. On the first intersection it adds `is-in`, unobserves, and runs the element's callback (counter). One shot: elements never hide again.
- Pauses or skips when: no `IntersectionObserver` or reduced motion: everything gets `is-in` at once and counters show the final value. Elements on hidden pages (`display:none`) do not intersect until their page shows.
- `FH.onView(el,fn)` (L4611): run `fn` once when `el` first enters view, with the same observer.
- Counters `FH.count(el)` (L4614-4618): `data-count`, `data-prefix`, `data-suffix`, `data-duration` (default 1600ms), decimals from the `data-count` text; ease `1-Math.pow(1-p,4)`; reduced motion writes the final text.
- Cleanup in React: disconnect the observer.
- Port as: `useReveal(ref, { variant, delay })` (or one shared observer in a `RevealProvider`), `useSplitWords`, `useCountUp`. Render `data-reveal=""` for the default variant (see Notes and traps).

##### Theme reveal (L352-354)
- `::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}` (L353)
- `::view-transition-new(root){z-index:2} ::view-transition-old(root){z-index:1}` (L354)
- The default cross fade is turned off; the only motion is the JS clip-path circle on `::view-transition-new(root)` (750ms, `cubic-bezier(.65,0,.35,1)`), see 11.1.8.
- `body` also has `transition:background-color var(--dur-2) var(--ease-out),color var(--dur-2) var(--ease-out)` (L98). In a browser without view transitions, the body colours (and any other transitioned colours) ease over .6s. With reduced motion every transition is cut to .001ms, so the theme switches at once.

##### Preloader states (L255-262)
- Base: `clip-path:inset(0 0 0 0)`, visible, with `transition:clip-path 1s var(--ease-io),visibility 0s 1s`.
- `.preloader.is-done` (L256): `clip-path:inset(0 0 100% 0);visibility:hidden` (visibility flips after the 1s delay).
- Inner animations run once from page load: arc `fh-draw 1.1s var(--ease-io) forwards`; "FH" `fh-fade .6s .35s var(--ease-out) forwards`; label `fh-fade .6s .5s var(--ease-out) forwards`.

##### Other JS driven classes

| Class | Element | CSS (line) | Set by |
|---|---|---|---|
| `is-scrolled` | `#topbar` | glass background, blur 16px, `box-shadow:0 1px 0 var(--line)` (L239) | scroll, `scrollY>12` (L4667) |
| `is-active` | `[data-nav]` links | `color:var(--brand-ink)` (L228) | `FH.setActive` (L4670) |
| inline `opacity`, `transform` | `.rail__ind` | transition L221 | `FH.setActive` (L4671) |
| inline `transform:scaleX()` | `#progress` | none | scroll (L4667) |
| `is-open` | `.fh-modal` | L270, L272, L275 | `FH.openModal` (L4651) |
| `is-on` | `#toast` | L283 | `FH.toast` (L4663) |
| `is-current` | pages | L299 | `show` (L4682) |
| `is-leaving` | current page | L333 | `FH.go` (L4703) |
| `has-pointer` | `<html>` | L210 | cursor glow (L4774) |
| `smooth-on` | `<html>` | L298 | smooth wheel (L4741) |
| `modal-open` | `<body>` | L279 | modals (L4651, L4654) |
| `is-in` | `[data-reveal]`, `[data-split]`, `.w` ancestors | L186-187, L191 | reveal observer (L4595) |

Behaviour: smooth wheel scrolling (L4738-4758), because `html.smooth-on` lives in the shell CSS
- Starts when: script run, only with a fine pointer and no reduced motion; adds `html.smooth-on`.
- Reads: `wheel` events (non passive), `deltaY` and `deltaMode` (line = 32px, page = `innerHeight`).
- Writes: `window.scrollTo(0,cur)` each frame with `cur+=(tgt-cur)*.11`, stopping when `Math.abs(tgt-cur)<.4`; `tgt` is clamped to 0 and `scrollHeight-innerHeight`.
- Skips when: `ctrlKey` (zoom), `body.modal-open`, mostly horizontal wheel, or the target (or an ancestor) can scroll in that direction or has `data-native-scroll`. A native scroll while idle resyncs `cur` and `tgt`.
- Exposes `FH._smoothTo(y)` (used by `scrollToEl` and same page links) and `FH._smoothReset()` (used by `jumpTop`).
- Cleanup in React: remove the `wheel` and `scroll` listeners, cancel the frame, remove `smooth-on`.
- Port as: `useSmoothScroll()` mounted once in the shell.

#### 11.1.10 Rules on shared selectors inside the page CSS (L365-2877)

Found by searching the four page blocks. Porters of the shell must not move these; they stay in the page files, but the shell classes must keep the same names so they still match.

| Shared selector | Page rules (lines) |
|---|---|
| `html`, `body`, `:root`, `::selection` | none |
| `html.is-loaded` | L513 (`.is-loaded #about .ab-scroll{opacity:1}`) |
| `html.js` | L585-591, L959-988, L1748-1757, L2054-2056, L2390-2393, L2409-2410, L2424, L2481, L2566-2570, L2623, L2638, L2790-2796, L2873 |
| `[data-theme="dark"]` | 41 lines: about 7 (L440, L449, L450, L468, L469, L479, L620), contact 16 (L818, L891, L916, L919, L921, L931, L1002, L1077, L1118, L1119, L1245, L1319, L1335, L1336, L1401, L1534), profile 4 (L1633, L1664, L1707, L1727), works 14 (L2130, L2493, L2496, L2519, L2552, L2557, L2714, L2717, L2738, L2747, L2760, L2766, L2777, L2779) |
| `.section` padding | L821 `#contact.section{padding-top:0;padding-bottom:clamp(8px,2vw,24px)}`; L1579 `#profile.pf{padding-top:0;padding-bottom:clamp(8px,2vw,24px)}`; L2049 `#works.wk-sec,#approvals.wk-sec{padding-block:0 clamp(8px,2vw,24px)}` |
| `.page-hero` (through each hero's own class) | contact: L826 `#contact .ct-hero{padding-top:clamp(64px,10vh,140px);padding-bottom:clamp(64px,9vh,110px);overflow:hidden;overflow:clip}`, L1172 (max-width 1023px) `padding-top:104px;padding-bottom:40px`. profile: L1580 `{--sp:0;overflow:clip;isolation:isolate}`, L1583 (min-width 1024px) `padding-top:clamp(84px,12vh,150px);padding-bottom:clamp(84px,11vh,120px)`. works and approvals: L2051 `.wk-hero{--p:0;overflow:clip;isolation:isolate;padding-bottom:clamp(40px,7vh,84px)}`, L2420 `#approvals .wk-hero--ap{--sp:0;padding-bottom:clamp(56px,9vh,110px)}`, L2427 (min-width 1024px) `padding-top:clamp(84px,12vh,150px);padding-bottom:clamp(84px,11vh,120px)`, L2634 `#works .wk-hero--works{--sp:0;padding-bottom:clamp(56px,9vh,110px)}`, L2641 (min-width 1024px) same as L2427, L2822 (min-width 1024px and max-height 800px) `padding-top:clamp(64px,10vh,96px);padding-bottom:clamp(40px,7vh,64px)`. No page overrides `min-height` |
| `.wrap` | none |
| `.fh-modal` | L1227 `#booking .ct-bk__panel{width:min(1000px,100%)}`, L2321 `#purebody .fh-modal__panel{width:min(1120px,100%)}`, L816 `#booking [hidden]{display:none!important}` (shared with `#contact` and `.ct-chat`), L817-818 `--ct-err` on `#booking` |
| `.curtain`, `.preloader`, `.rail`, `.topbar`, `.dock`, `.toast`, `.footer`, `.progress`, `.ambient`, `.cursor-glow`, `.theme-btn`, `.page-next`, `.crumbs`, `.hero-title`, `.outline-num`, `.pill`, `.link-arrow`, `.grad-text` | none |
| `.btn` | L768, L802, L845, L849-850, L1191, L1193, L1453, L1454, L1788, L2593, L2608, L2838, L2853 |
| `--h` on buttons | L705, L844, L1064, L1139, L1192, L1344 |
| `.card` | L594-595 (`#about .ab-kc.card:hover` and its icon tile) |
| `.icon-tile` | L593, L595, L1212, L1293-1294, L2005-2006 |
| `[data-reveal]` | L371, L585-586, L2039 |
| `.w` (split words) | L390, L840-841, L965, L967, L1185, L1557 |
| `.serif` | L388, L486, L530, L576, L839, L966, L968, L1232, L1598, L1647, L1813, L1907, L1923, L2189, L2330, L2442, L2656 |
| `.eyebrow` | L536, L2433, L2647 |
| `.sec-head` | L603 |
| `.lead` | L537, L783 |
| `.label` | L515, L572, L628, L878, L879, L1056, L1744 |
| `.tag` | L1928, L2161, L2287 |
| `.stat-num` | L743, L872, L1197, L1199 |
| `.dot-live` | L1661, L1776, L2145, L2751, L2813 |
| `.mono` | L1057, L1413 |
| `[data-spotlight]` | L1916 |
| `.i` (icon size or colour) | about 16 lines, contact 32, profile 16, works 25 |
| `:focus-visible` | L864, L1120, L1246, L1405, L1498, L1624, L1732-1733, L1957, L1977, L2088, L2236, L2483, L2494, L2496-2497, L2679, L2698, L2782 |
| scrollbars | L2078, L2081, L2232, L2235, L2375, L2377 |
| shell keyframes reused | `fh-ping` at L945 and L1490 |
| `.is-current` (NOT the router class) | L1318, L1319, L1323: booking step states, same class name, unrelated to pages |

#### 11.1.11 Content data

##### `frontend/src/content/site.ts`
All shell copy, nav data and page labels. Every string is copied from the lines cited in the comments.

```ts
export type PageId = 'about' | 'profile' | 'works' | 'approvals' | 'contact';

export type ShellIconName = 'user' | 'file' | 'briefcase' | 'trophy' | 'chat';

export interface SiteMeta {
  lang: string;
  /** L6, also the About route title (L4683) */
  defaultTitle: string;
  /** L7 */
  description: string;
  /** L8 and L4640 */
  themeColor: { light: string; dark: string };
  /** L17 */
  legacyBase: string;
  /** L13 and L4639 */
  themeStorageKey: string;
}

export const siteMeta: SiteMeta = {
  lang: 'en',
  defaultTitle: 'Faisal Hanif · Software Engineer',
  description:
    'Faisal Hanif, software engineer in Lahore building AI-powered web and mobile products with React, Next.js, Node.js and LLMs.',
  themeColor: { light: '#0e6655', dark: '#050f0c' },
  legacyBase: 'https://faisalhanif.work/',
  themeStorageKey: 'fh-theme',
};

export interface NavItem {
  id: PageId;
  /** rebuild route (PRD.md "Routes") */
  href: string;
  /** reference hash (L2977-2981) */
  hash: string;
  /** rail and dock label (L2977-2981) */
  label: string;
  icon: ShellIconName;
  /** curtain and next page number (META, L4675) */
  num: string;
  /** curtain title and next page word (META, L4675) */
  title: string;
  /** document title (L4683) */
  documentTitle: string;
}

export const navItems: NavItem[] = [
  { id: 'about', href: '/', hash: '#about', label: 'About', icon: 'user', num: '01', title: 'About', documentTitle: 'Faisal Hanif · Software Engineer' },
  { id: 'profile', href: '/profile', hash: '#profile', label: 'Profile', icon: 'file', num: '02', title: 'Profile', documentTitle: 'Profile · Faisal Hanif' },
  { id: 'works', href: '/works', hash: '#works', label: 'Works', icon: 'briefcase', num: '03', title: 'Works', documentTitle: 'Works · Faisal Hanif' },
  { id: 'approvals', href: '/approvals', hash: '#approvals', label: 'Approvals', icon: 'trophy', num: '04', title: 'Approvals', documentTitle: 'Approvals · Faisal Hanif' },
  { id: 'contact', href: '/contact', hash: '#contact', label: 'Contact', icon: 'chat', num: '05', title: 'Contact', documentTitle: 'Contact · Faisal Hanif' },
];

/** curtain number text is `${num} / 05` (L4701) */
export const curtainTotal = '05';

export interface ShellCopy {
  navLabel: string; // L2973, L2995 aria-label
  logoText: string; // L2974, L2989
  logoAriaLabel: string; // L2974
  brandName: string; // L2989
  themeToggleAriaLabel: string; // L2984, L2991
  bookButton: string; // L2992
  preloaderMark: string; // L2951
  preloaderLabel: string; // L2952
  nextPageAriaLabel: string; // L4735
  nextPageLabel: string; // L4735
  backToStartLabel: string; // L4735
  pageCountTotal: string; // L4735, rendered as `${index} / 5`
  footerBigFirst: string; // L4230
  footerBigSerif: string; // L4230
  footerLineAfterYear: string; // L4232, rendered as `© ${year} ...`
  footerBackToTop: string; // L4233
  closeBooking: string; // L4243
  closePureBody: string; // L4497
}

export const shellCopy: ShellCopy = {
  navLabel: 'Section navigation',
  logoText: 'FH',
  logoAriaLabel: 'Faisal Hanif, back to top',
  brandName: 'Faisal Hanif',
  themeToggleAriaLabel: 'Switch light or dark theme',
  bookButton: 'Book',
  preloaderMark: 'FH',
  preloaderLabel: 'Faisal Hanif · Portfolio',
  nextPageAriaLabel: 'Next page',
  nextPageLabel: 'Next page',
  backToStartLabel: 'Back to the start',
  pageCountTotal: '5',
  footerBigFirst: 'Faisal',
  footerBigSerif: 'Hanif',
  footerLineAfterYear: 'Faisal Hanif · Software Engineer · Lahore, Pakistan',
  footerBackToTop: 'Back to top',
  closeBooking: 'Close booking',
  closePureBody: 'Close PureBody showcase',
};

/**
 * Next page link text (L4733-4735): label is `${nextPageLabel} · ${next.num}`
 * (or `${backToStartLabel} · 01` on the last page), counter is `${index + 1} / 5`,
 * the word is next.title.slice(0, -2) plus a serif span with next.title.slice(-2).
 */
export function nextPageOf(id: PageId): { next: NavItem; isLast: boolean; index: number } {
  const index = navItems.findIndex((n) => n.id === id);
  const isLast = index === navItems.length - 1;
  return { next: navItems[(index + 1) % navItems.length], isLast, index };
}
```

#### 11.1.12 Shell CSS to files (`frontend/src/styles/`)

Copy each range verbatim, in the same order inside each file. No element in the markup mixes a layout class (`.site`, `.wrap`, `.section`, `.page-hero`) with a shared component class, so splitting base and layout rules into two files does not change the cascade as long as the import order below is kept.

| Lines | Content | File |
|---|---|---|
| L22-24 | "DESIGN TOKENS" comment | `tokens.css` |
| L25-67 | `:root` tokens | `tokens.css` (change only the three font family names, see below) |
| L68-89 | `[data-theme="dark"]` tokens | `tokens.css` |
| L91-104 | box sizing, `html`, `body`, media, links, form fonts, buttons reset, headings, `p` | `base.css` |
| L105 | `::selection` | `base.css` |
| L106 | `:focus-visible` (must stay before every component rule) | `base.css` |
| L107-109 | `.sr-only`, `.i`, `.i--fill` | `base.css` |
| L111-115 | `.site`, `.wrap`, `.section`, rail padding query | `layout.css` |
| L117-122 | `.serif`, `.grad-text`, `.mono`, `.label`, `.lead` | `base.css` |
| L124-131 | `.sec-head`, `.sec-head--center`, `.eyebrow`, `.sec-title` | `base.css` |
| L133-148 | buttons, `.link-arrow` | `base.css` |
| L150-155 | `.pill`, `.dot-live`, `@keyframes fh-ping`, `.tag`, `.tags` | `base.css` |
| L157-163 | `.card`, `.card--hover`, `.icon-tile`, `.icon-tile--soft` | `base.css` |
| L165-170 | `[data-spotlight]` | `base.css` |
| L172-173 | `.stat-num` | `base.css` |
| L175-191 | reveal system, split words | `base.css` |
| L302-308 | `.crumbs`, `.hero-title`, `.outline-num` | `base.css` (typography helpers; append after L191) |
| L349-350 | `[data-parallax]` | `base.css` |
| L352-354 | view transition rules | `base.css` |
| L193-210 | ambient background, cursor glow | `layout.css` |
| L212-250 | progress, rail, theme button, top bar, dock | `layout.css` |
| L252-264 | preloader, `fh-draw`, `fh-fade` | `layout.css` |
| L266-279 | `.fh-modal` shell, `body.modal-open` | `layout.css` (booking and PureBody panel rules go to `overlays.css`) |
| L281-284 | toast | `layout.css` |
| L286-290 | footer | `layout.css` |
| L293-301 | router: `html.smooth-on`, `.page`, `.page-hero` | `layout.css` |
| L310-333 | curtain, `.page.is-leaving` | `layout.css` |
| L335-347 | next page link | `layout.css` |
| L356-362 | reduced motion | end of `layout.css` (last shell rule, as in the reference) |
| L364 | `/* ===== PART CSS ===== */` | page files start here |

Import order (all global, once, in `app/layout.tsx`): `tokens.css`, `base.css`, `layout.css`, then the page files in reference order: `about.css` (L365-811), `contact.css` (L812-1564, minus booking and chat), `overlays.css`, `profile.css` (L1565-2040), `works.css` and `approvals.css` (L2041-2877). Page rules with the same specificity as shell rules (for example `.wk-hero` L2051 against `.page-hero` L300) only win because they come later, so page CSS must never load before the shell files.

Fonts with next/font (TECH_STACK.md): load Plus Jakarta Sans (`weight: ['400','500','600','700','800']`), Instrument Serif (`weight: '400'`, `style: ['normal','italic']`) and JetBrains Mono (`weight: ['400','500']`), all with `display: 'swap'` and `subsets: ['latin']`. Give each a `variable` with a NEW name (for example `--ff-jakarta`, `--ff-instrument`, `--ff-jetbrains`), put the three variable classes on `<html>`, and in `tokens.css` write `--font-sans:var(--ff-jakarta),ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif` and the same pattern for `--font-serif` and `--font-mono`, keeping the reference fallback stacks.

Route roots: give each route's root element the reference classes (`ab`, `section pf`, `section wk-sec`, `section wk-sec wk-ap`, `section ct`) plus `page is-current` and `data-page="<id>"`, so `.page.is-current [data-parallax]`, `.page.is-leaving` and page CSS keep matching. `.page:not(.is-current){display:none}` (L299) is harmless when only one route renders.

#### Notes and traps

Line and map corrections
- The toast is L4557 (the map says L4558). The footer is L4228-4236 and `</main>` is L4237; the footer is inside `main.site`.
- The shell sprite is L2884-2947 with the `pl-g` gradient inside it; the preloader arc depends on that gradient id, so `IconSprite` must render before or with the preloader.

Fonts
- Weights 650 (9 rules) and 750 (3 rules) are not loaded. In the reference they render with the 700 and 800 faces. If next/font loads Plus Jakarta Sans as a full variable range (no `weight` list), the browser draws true 650 and 750, which looks lighter than the reference. Always pass the explicit list `['400','500','600','700','800']` and check those 12 rules in the visual diff.
- next/font renames families (for example `__Plus_Jakarta_Sans_xxxx`). Two consequences: (1) name the next/font variables differently from `--font-sans`, `--font-serif` and `--font-mono` and reference them from `tokens.css`, or the two definitions fight on `:root` by source order; (2) put the next/font variable classes on `<html>`, not `<body>`, because `--font-sans` is computed on `:root` and would become invalid if `--ff-jakarta` only exists on `<body>`.
- The About sprite symbol `ab-ic-aws` (L3014) draws SVG text with the literal attribute `font-family="Plus Jakarta Sans,system-ui,sans-serif"`. After next/font renames the family, that text falls back to `system-ui`. Give it `style="font-family:var(--font-sans)"` (a presentation attribute cannot use `var()`) so it keeps the brand font.
- The Instrument Serif normal face is loaded but never shown (every serif rule is italic). Loading it is harmless; dropping it is a free saving if the owner agrees.

React and hydration
- React renders a bare boolean attribute as `"true"`. `<div data-reveal>` becomes `data-reveal="true"`, which matches no variant rule, so the element would only fade (no rise, no blur). Always write `data-reveal=""` for the default. The same goes for `data-book`: `data-book` alone becomes `"true"` and would call `openBooking("true")`; write `data-book=""` or pass the session id.
- `data-theme` and the `js` class are set on `<html>` before hydration. Add `suppressHydrationWarning` to `<html>` and never drive `<html className>` from React state, or React will remove `js`, `is-loaded`, `has-pointer` and `smooth-on`.
- `.w>span` words are released by ANY ancestor with `is-in` (L191). Put `is-in` on the real DOM element that the reference uses; do not replace it with a React state class on a different wrapper.
- `html{scroll-behavior:smooth}` (L95): Next.js 16 no longer switches it off during route changes, so every route change would scroll smoothly to the top. The reference jumps instantly (`jumpTop`, L4680) under the curtain. Add `data-scroll-behavior="smooth"` to `<html>` (checked in the Next.js 16 upgrade guide via Context7) or do the instant jump yourself in `usePageTransition`.

Behaviour quirks to keep (they are what the reference does)
- Modal close is instant: `.fh-modal` has no transition on `visibility`, so removing `is-open` hides the scrim and panel at once. Only opening animates.
- The footer "Back to top" link and the rail logo both point to `#about`: on About they smooth scroll to the top, on any other page they run the full curtain transition to About.
- Clicks are swallowed while a transition is running (`busy`, L4697), and the curtain blocks pointer events for 1340ms.
- `:focus-visible` (L106) also sets `border-radius:6px`. Elements that do not set their own radius later in the cascade get rounded corners when focused by keyboard. Keep the rule early in `base.css`.
- The reduced motion block cuts durations but not delays, and JS reads the setting once at load (no change listener).
- The cursor glow frame loop runs forever once started, and the progress and top bar logic run on every page; neither has a pause.
- On a magnetic button the inline `transform` from `useMagnetic` replaces `.btn:active{transform:scale(.97)}` while the pointer is over it, so the press scale does not show there. Keep that.
- `.theme-btn` and the top bar Book button have no `type` attribute. They are not inside a form, so `type="button"` in React changes nothing visible.
- The rail content box is 66px wide (78px minus 5px padding and 1px border on each side) but links are 68px, so they overflow by 1px each side, centred. Copy the numbers as they are.
- `--section-y` is defined and used by `.section`, but all four `.section` roots override their padding, so it never shows. Port it anyway.
- Unused in markup and JS but part of the shell CSS: `.crumbs`, `.outline-num`, `--brand-600`, `--bg-2`, `--err`, `--fs-display`, `--fs-xs`, `--r-sm`, `--r-md`, `--ease-soft`. Port them all.
- `--err` is NOT the error colour used on screen; contact, booking and chat use `--ct-err` (`#b42a33` light, `#ff9a9a` dark, L817-818). Do not swap one for the other.
- `.is-current` also appears on booking steps (L1318-1323). It is a different component; do not let a router helper toggle it.
- The progress bar (z 60) sits above the top bar (z 50); the chat widget (z 70) sits above the nav and below modals (z 80), toast (z 90), curtain (z 95) and preloader (z 100).
- The main sprite `<svg>` has no `focusable="false"` while the page sprites do. Adding it changes nothing visible.
- The grain background is a data URI with `%25` and `%23` escapes (L206). Copy it byte for byte.

Bugs or gaps in the reference (listed, not fixed, until the owner decides)
- Rail indicator: `FH.setActive` measures `a.offsetTop`, which is 0 while the rail is `display:none` (below 1024px). Load on a phone width, widen past 1024px, and the indicator sits on "About" whatever the page, until the next page change. Computing `index * 60` px (or measuring again on resize) fixes it with no other visible change.
- The theme boot script does not update `meta[name=theme-color]`, so a first visit in dark mode keeps the light brand colour `#0e6655` in the mobile browser bar until the visitor toggles.
- Modals have no focus trap: Tab can move focus behind the open dialog.
- `fh:theme` is dispatched but nothing listens.
- Two landmarks share the name "Section navigation" (the rail `aside` and the dock `nav`), but only one is visible at a time.
- The theme toggle has no `aria-pressed` or state text; its label is the same in both themes.

### 11.2 Core script (window.FH) and the motion system

Sources read line by line: head L1-20, L2879-2881, shell markup L2946-3003, footer L4228-4237, modal shells L4240-4244 and L4493-4498, toast L4558, the whole core script L4559-4786, and the shell CSS L21-364 that the core drives. Page CSS (L365-2877) and page scripts (L4787-7616) were grepped for every selector, class, attribute, `FH.` call and `fh:` event that touches the core; each hit is cited below. Sections 1 to 10 of REFERENCE_MAP.md are not repeated; they are referred to by number.

Non ASCII in these ranges: `·` (U+00B7) in copy (titles, preloader label, next page label); one em dash only in the code comment at L4561 (`FH CORE \u2014 shared helpers used by every part`), never in visible copy.

#### 11.2.0 Source index

| Lines | What | Target in the rebuild |
|---|---|---|
| L12-16 | Theme boot script (before paint) | inline `<script>` in `src/app/layout.tsx` head |
| L17 | `window.FH_BASE='https://faisalhanif.work/'` | `src/lib/asset.ts` (base becomes `/`) |
| L18-19 | `window.FH_HOOKS` | `src/lib/api.ts` (section 10) |
| L2881 | `document.documentElement.classList.add('js')` | inline script in layout, see 11.2.1 |
| L4563-4570 | `FH`, `FH.reduce`, `FH.$`, `FH.$$`, `FH.asset`, `FH.lerp` | `src/lib/dom.ts`, `src/hooks/useReducedMotion.ts` |
| L4572-4591 | `FH.split` (split words) | `src/components/motion/SplitWords.tsx` |
| L4593-4611 | reveal observer, `FH.observe`, `FH.onView` | `src/hooks/useReveal.ts`, `src/components/motion/Reveal.tsx` |
| L4613-4618 | `FH.count` | `src/hooks/useCountUp.ts` |
| L4620-4624 | spotlight | `src/hooks/useSpotlight.ts` (one document listener) |
| L4626-4631 | magnetic, `FH.fine` | `src/hooks/useMagnetic.ts` |
| L4632-4636 | tilt, `FH.bind` | `src/hooks/useTilt.ts` |
| L4638-4647 | `FH.setTheme`, theme toggle with circular reveal | `src/components/providers/ThemeProvider.tsx`, `ThemeToggle.tsx` |
| L4649-4660 | `FH.openModal`, `FH.closeModal`, click delegation, Esc | `src/components/providers/ModalProvider.tsx`, `src/components/ui/Modal.tsx` |
| L4662-4663 | `FH.toast` | `src/components/providers/ToastProvider.tsx`, `src/components/ui/Toast.tsx` |
| L4665-4672 | scroll progress, top bar state, `FH.setActive` | `src/components/layout/ScrollProgress.tsx`, `TopBar.tsx`, `Rail.tsx`, `Dock.tsx` |
| L4673-4730 | router: `PAGES`, `META`, `show`, `jumpTop`, `FH.scrollToEl`, `FH.go`, click interception, `popstate`, `scrollIntoView` patch, initial page | `src/components/providers/TransitionProvider.tsx` + `src/hooks/usePageTransition.ts` + `src/components/layout/Curtain.tsx` |
| L4732-4736 | auto injected Next page links | `src/components/layout/NextPageLink.tsx` |
| L4738-4758 | smooth wheel scrolling | `src/hooks/useSmoothScroll.ts` |
| L4760-4770 | parallax | `src/hooks/useParallax.ts` |
| L4772-4775 | cursor glow | `src/components/layout/CursorGlow.tsx` |
| L4777-4784 | `FH.ready`, boot (year, preloader, first observe and bind) | `src/components/layout/Preloader.tsx`, `src/components/providers/AppShell.tsx` |
| CSS L166-170 | spotlight | `base.css` |
| CSS L175-191 | reveal system and split words | `base.css` |
| CSS L193-210 | ambient background and cursor glow | `layout.css` |
| CSS L212-250 | progress, rail, theme button, top bar, dock | `layout.css` |
| CSS L252-264 | preloader | `layout.css` |
| CSS L266-279 | modal shell | `layout.css` (per 11.1.12) |
| CSS L281-284 | toast | `layout.css` (per 11.1.12) |
| CSS L293-308 | pages and router (`.smooth-on`, `.page`, `.page-hero`) | `layout.css` |
| CSS L310-333 | curtain and `.page.is-leaving` | `layout.css` |
| CSS L335-347 | next page link | `layout.css` |
| CSS L349-354 | parallax helper, view transition rules | `base.css` |
| CSS L356-362 | reduced motion (global) | `layout.css` (per 11.1.12) |

#### 11.2.1 Boot order (exact sequence in the reference)

1. L2 `<html lang="en" data-theme="light">` is the static default.
2. L12-16 theme boot (inline, in `<head>`, runs before paint):
   - `try{ t = localStorage.getItem('fh-theme') }catch(e){}`
   - if no stored value: `t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'`
   - `document.documentElement.setAttribute('data-theme', t)`
   - It does NOT touch `<meta name="theme-color">` (stays `#0e6655` until the first toggle, see Notes and traps).
3. L17 `window.FH_BASE`, L19 `window.FH_HOOKS=window.FH_HOOKS||{onContact:null,onBooking:null,chatEndpoint:null}`.
4. L2881, first thing in `<body>`: `document.documentElement.classList.add('js')`. Every hidden start state (`.js [data-reveal]`, `.js .ct-hero ...`, `.js #profile ...`, `.js #works ...`, `.js #approvals ...`) depends on this class. Without JS nothing is hidden.
5. Body markup parses: sprite, preloader (visible, covering everything, z-index 100), curtain, progress, ambient, cursor glow, rail, top bar, dock, `main.site` with the five page sections (all visible until step 6), footer, booking modal, chat, PureBody modal, toast.
6. L4559-4786 core runs synchronously, in this order:
   1. helpers (L4564-4570), `FH.split` (L4573), reveal `IntersectionObserver` created (L4594), `FH.observe`, `FH.onView`, `FH.count`
   2. spotlight `pointermove` listener on `document` (L4621)
   3. `FH.fine` computed (L4627), binders defined (nothing bound yet)
   4. theme toggle listeners bound to every `[data-theme-toggle]` (L4641)
   5. modal click delegation and Esc listener on `document` (L4655, L4660)
   6. `FH.toast` (L4663), scroll listener for progress and top bar (L4668)
   7. router: every page element gets `.page` and `data-page` (L4677); click interception on `window` in capture phase (L4713); `popstate` (L4724); `Element.prototype.scrollIntoView` patched (L4726-4727); initial page shown with `show(page||'about')` (L4729-4730). This fires the first `fh:page` event BEFORE any page script has subscribed.
   8. Next page links appended to every page (L4733-4736)
   9. smooth wheel scrolling set up (L4739-4758), adds `html.smooth-on`
   10. parallax set up (L4761-4770), `FH._parallax` defined
   11. `FH.ready(...)` registered (L4778-4784). `document.readyState` is `'loading'` here (inline script in body), so the callback waits for `DOMContentLoaded`.
7. Page scripts run in file order: about.js (L4787), contact.js (L5175, defines `FH.openBooking`, `FH.openChat`, `FH.closeChat`), profile.js (L6489), works.js (L6852, calls `FH.observe(grid)`/`FH.bind(grid)` and `FH.observe(track)`/`FH.bind(track)` right away). Each checks `FH.current` itself for the first page because it missed the first `fh:page`.
8. `DOMContentLoaded` → boot callback (L4779-4784):
   - `#year` text set to `new Date().getFullYear()` (L4780)
   - `onScroll()` (progress and top bar first paint), `cursor()` (glow loop starts), `FH._parallax()` (L4781)
   - preloader timer: `setTimeout(done, 1250)`, or `done()` at once when reduced motion (L4783)
9. `done()` (L4782): `#preloader.is-done`, `html.is-loaded`, then `setTimeout(function(){ FH.observe(document); FH.bind(document) }, reduce ? 0 : 250)`.

So on a normal first load the preloader starts to lift 1250ms after `DOMContentLoaded`, `html.is-loaded` is set at the same moment, and scroll reveals, split words, counters, magnetic and tilt switch on 250ms later (1500ms after `DOMContentLoaded`). Page heroes wait for `is-loaded` on their own (11.2.22).

#### 11.2.2 Shell markup the core reads or writes

Only what the core touches is listed here; positions are in section 4.

##### Preloader (L2949-2954)
```html
<div class="preloader" id="preloader" aria-hidden="true">
  <div class="preloader__mark">
    <svg viewBox="0 0 90 90"><circle class="pl-ring" cx="45" cy="45" r="40"/><circle class="pl-arc" cx="45" cy="45" r="40" transform="rotate(-90 45 45)"/><text class="pl-txt" x="45" y="54" text-anchor="middle">FH</text></svg>
    <span class="label">Faisal Hanif · Portfolio</span>
  </div>
</div>
```
- The arc stroke is `url(#pl-g)`, a gradient in the sprite `<defs>` (L2886): `<linearGradient id="pl-g" x1="0" y1="0" x2="1" y2="1">` with stops `#0e6655` (offset 0) and `#5fcf9f` (offset 1). The rebuild's IconSprite must keep this gradient or the arc is invisible.
- Copy: `FH` (SVG text), `Faisal Hanif · Portfolio`.

##### Curtain (L2956-2960)
```html
<div class="curtain" id="curtain" aria-hidden="true">
  <div class="curtain__layer curtain__layer--a"></div>
  <div class="curtain__layer curtain__layer--b"></div>
  <div class="curtain__label"><div class="curtain__inner"><span class="curtain__num" id="curtainNum">02 / 05</span><span style="overflow:hidden;display:block;padding:0 .1em .08em"><span class="curtain__title" id="curtainTitle">Profile</span></span><span class="curtain__bar"></span></div></div>
</div>
```
- The title sits in an unnamed mask span with inline style `overflow:hidden;display:block;padding:0 .1em .08em`. Keep that exact inline style (or a class with the same three declarations).
- `#curtainNum` and `#curtainTitle` are rewritten on every transition (L4701). The static "02 / 05" and "Profile" are placeholders only; the curtain is hidden until a transition runs.

##### Progress bar (L2961)
`<div class="progress" id="progress"></div>`, no aria. JS writes `style.transform` (11.2.13).

##### Ambient background (L2963-2969) and cursor glow (L2970)
```html
<div class="ambient" aria-hidden="true">
  <div class="ambient__blob ambient__blob--a"></div>
  <div class="ambient__blob ambient__blob--b"></div>
  <div class="ambient__blob ambient__blob--c"></div>
  <div class="ambient__grid"></div>
  <div class="ambient__grain"></div>
</div>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
```
The ambient layer is CSS only (11.2.20). The glow is driven by JS (11.2.18).

##### Rail (L2973-2985)
- `aside.rail[aria-label="Section navigation"]`
  - `a.rail__logo[href="#about"][aria-label="Faisal Hanif, back to top"]` text `FH`
  - `nav.rail__nav[data-navgroup]` (the `data-navgroup` attribute is never read by any script)
    - `div.rail__ind[aria-hidden="true"]` (the sliding active pill)
    - five `a.rail__link[href="#<id>"][data-nav="<id>"]`, each `<svg class="i"><use href="#<icon>"/></svg><span><Label></span>`: `about` `i-user` "About", `profile` `i-file` "Profile", `works` `i-briefcase` "Works", `approvals` `i-trophy` "Approvals", `contact` `i-chat` "Contact"
  - `div.rail__sep`
  - `button.theme-btn[data-theme-toggle][aria-label="Switch light or dark theme"]` with `<svg class="i i-moon"><use href="#i-moon"/></svg><svg class="i i-sun"><use href="#i-sun"/></svg>`

##### Top bar (L2988-2994)
- `header.topbar#topbar`
  - `a.topbar__brand[href="#about"]` = `<span class="rail__logo">FH</span>Faisal Hanif`
  - `div.topbar__actions`: the same theme button as the rail (same aria label), then `button.btn.btn--primary.btn--sm[data-book]` = `<svg class="i"><use href="#i-calendar"/></svg>Book`

##### Dock (L2995-3001)
`nav.dock[aria-label="Section navigation"][data-navgroup]` with the same five `a.rail__link[data-nav]` links as the rail (same icons and labels, no indicator element).

##### Footer (L4228-4237)
- `footer.footer > div.wrap`
  - `div.footer__big[aria-hidden="true"]` = `Faisal <span class="serif">Hanif</span>`
  - `div.footer__row`: `<span>© <span id="year">2026</span> Faisal Hanif · Software Engineer · Lahore, Pakistan</span>` and `a.link-arrow[href="#about"]` = `Back to top <svg class="i"><use href="#i-arrow-up-right"/></svg>`
- The footer is inside `main.site` but outside every `.page`, so it shows under every page. `#year` is rewritten at boot (L4780).

##### Modal shell contract (CSS comment L267, markup L4240-4244 and L4493-4498)
```html
<div class="fh-modal" id="x" aria-hidden="true">
  <div class="fh-modal__scrim" data-close></div>
  <div class="fh-modal__panel" role="dialog" aria-modal="true" aria-labelledby="...">
    <button type="button" class="fh-modal__close" data-close aria-label="Close ...">...</button>
    ...
  </div>
</div>
```
Two modals use it: `#booking` (`fh-modal ct-bk`, close label "Close booking", panel also `.ct-bk__panel`, labelled by `ct-bk-t1`) and `#purebody` (`fh-modal wk-pb`, close label "Close PureBody showcase", labelled by `wk-pb-title`). Close icon `i-close`.

##### Toast (L4558)
`<div class="toast" id="toast" role="status" aria-live="polite"></div>` (empty until `FH.toast`).

#### 11.2.3 Every FH member (signature and behaviour)

| Member | Lines | Signature | Behaviour |
|---|---|---|---|
| `FH` | L4564 | object | `var FH = window.FH = window.FH || {}` |
| `FH.reduce` | L4565-4566 | `boolean` | `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, read ONCE at load. Never updated if the OS setting changes. |
| `FH.$` | L4567 | `(s, r?) => Element \| null` | `(r||document).querySelector(s)` |
| `FH.$$` | L4568 | `(s, r?) => Element[]` | `Array.prototype.slice.call((r||document).querySelectorAll(s))` (a real array) |
| `FH.asset` | L4569 | `(p: string) => string` | `/^https?:/.test(p) ? p : (window.FH_BASE||'') + p.replace(/^\//,'')`. With `FH_BASE='https://faisalhanif.work/'`, `FH.asset('imgs/Faisal-CVS.pdf')` gives `https://faisalhanif.work/imgs/Faisal-CVS.pdf`. |
| `FH.lerp` | L4570 | `(a, b, t) => number` | `a+(b-a)*t` (used by the cursor glow) |
| `FH.split` | L4573-4591 | `(el) => void` | wraps words in `span.w > span` with `--d` (11.2.4). Idempotent through `data-split-done`. |
| `FH.observe` | L4597-4609 | `(root) => void` | splits `[data-split]`, applies `data-stagger`, sets `--d` from `data-delay`, then observes `[data-reveal],[data-split],[data-count],[data-onview]` inside `root` (11.2.5) |
| `FH.onView` | L4611 | `(el, fn) => void` | runs `fn` once when `el` first enters view (same observer). Reduced motion or no IO: runs `fn` at once. Not used by any page script. |
| `FH.count` | L4614-4618 | `(el) => void` | count up from the `data-count` attributes (11.2.6) |
| `FH.fine` | L4627-4628 | `boolean` | `window.matchMedia('(pointer:fine)').matches`, read ONCE at load |
| `FH.bind` | L4636 | `(root) => void` | binds magnetic (11.2.8) and tilt (11.2.9) inside `root`. Does nothing when `!fine || reduce`. Idempotent per element (`el.__mag`, `el.__tilt`). |
| `FH.setTheme` | L4639-4640 | `(t: 'light' \| 'dark') => void` | sets `data-theme`, stores `fh-theme`, updates `meta[name=theme-color]`, fires `fh:theme` (11.2.10) |
| `FH.openModal` | L4651-4652 | `(id: string) => void` | opens `#id` (11.2.11) |
| `FH.closeModal` | L4653-4654 | `(id?: string) => void` | closes `#id`, or every `.fh-modal.is-open` when no id (11.2.11) |
| `FH.toast` | L4663 | `(msg: string) => void` | shows `#toast` for 3200ms (11.2.12) |
| `FH.setActive` | L4669-4672 | `(id: string) => void` | toggles `.is-active` on `[data-nav]` links and moves `.rail__ind` (11.2.13) |
| `FH.pages` | L4676 | `string[]` | `['about','profile','works','approvals','contact']` |
| `FH.current` | L4676, L4683 | `string \| null` | id of the shown page. `null` until the initial `show()` at L4730 (which runs inside the core, so page scripts always see a value). |
| `FH.pageOf` | L4678-4679 | `(el) => string \| null` | id of the closest `.page` ancestor (or itself), else `null` |
| `FH.scrollToEl` | L4687 | `(el) => void` | scrolls so `el` sits 84px (under 1024px) or 32px (1024px and up) below the top (11.2.14) |
| `FH.go` | L4689-4711 | `(target: string \| Element, opts?: { noHistory?: boolean; instant?: boolean }) => void` | route to a page or to an element inside a page, with the curtain (11.2.14). `instant` is never passed by any caller. |
| `FH._smoothTo` | L4756 | `(y: number) => void` | exists only when smooth wheel scrolling is on; eases to `y` (11.2.16) |
| `FH._smoothReset` | L4757 | `() => void` | exists only when smooth wheel scrolling is on; stops the loop and syncs to `scrollY` |
| `FH._parallax` | L4767 | `() => void` | exists only when not reduced motion; one parallax pass (11.2.17) |
| `FH.ready` | L4778 | `(fn) => void` | `document.readyState!=='loading' ? fn() : document.addEventListener('DOMContentLoaded', fn)` |
| `FH.openBooking` | contact.js L6166-6172 | `(type: string) => void` | defined by the booking module, not the core (see below) |
| `FH.openChat`, `FH.closeChat` | contact.js L6473 | `() => void`, `(focusFab?: boolean) => void` | chat panel open and close, defined by the chat module |

##### FH.openBooking hook up (core L4658, contact.js L6166-6172)
- The core never defines it. The core's click delegation calls `FH.openBooking(b.dataset.book||'')` when it exists, else `FH.openModal('booking')`.
- contact.js L6166-6172:
  - `reset(type === 'deep' ? 'deep' : 'quick', false)`: any value other than `"deep"` (including `""`) opens on Quick Chat.
  - `cur = 'pick'; showScreen('pick', false)`
  - `panel.scrollTop = 0`
  - `FH.openModal('booking')`
  - then `setTimeout(..., reduce ? 70 : 90)` focuses `input[name="ct-bk-type"]:checked` with `{preventScroll:true}`. This runs after the core's own 60ms focus (11.2.11), so the checked session radio ends up focused, not the close button.
- Callers: 8 `[data-book]` elements (L2992, L3043, L3203, L3411, L3416 with `data-book="deep"`, L3812, L3986, L4046) and the chat action `book` (L6435, `FH.openBooking(a.type || '')`).

##### TypeScript shape of the reference API (for reading the page scripts, not to port as a global)
```ts
interface FHCore {
  reduce: boolean;
  fine: boolean;
  $: (s: string, r?: ParentNode) => Element | null;
  $$: (s: string, r?: ParentNode) => Element[];
  asset: (p: string) => string;
  lerp: (a: number, b: number, t: number) => number;
  split: (el: HTMLElement) => void;
  observe: (root: ParentNode) => void;
  onView: (el: HTMLElement | null, fn: () => void) => void;
  count: (el: HTMLElement) => void;
  bind: (root: ParentNode) => void;
  setTheme: (t: 'light' | 'dark') => void;
  openModal: (id: string) => void;
  closeModal: (id?: string) => void;
  toast: (msg: string) => void;
  setActive: (id: PageId) => void;
  pages: PageId[];
  current: PageId | null;
  pageOf: (el: Element | null) => PageId | null;
  scrollToEl: (el: Element | null) => void;
  go: (target: string | Element, opts?: { noHistory?: boolean; instant?: boolean }) => void;
  ready: (fn: () => void) => void;
  _smoothTo?: (y: number) => void;
  _smoothReset?: () => void;
  _parallax?: () => void;
  openBooking?: (type: string) => void; // contact.js
  openChat?: () => void;                // contact.js
  closeChat?: (focusFab?: boolean) => void; // contact.js
}
type PageId = 'about' | 'profile' | 'works' | 'approvals' | 'contact';
```

#### 11.2.4 Split words for [data-split] (JS L4572-4591, CSS L188-191)

- **Name and lines:** `FH.split(el)`, L4573-4591.
- **Starts when:** `FH.observe(root)` calls it for every `[data-split]` in `root` (L4598), which first happens 250ms after the preloader lifts (11.2.1). Also called directly by contact.js L5565 on the contact hero title, and by works.js L7282 on `.wk-ht` (no `.wk-ht` element exists, so that call never runs).
- **Reads:** the element's child nodes, recursively.
- **Writes:**
  - `el.dataset.splitDone = '1'` (attribute `data-split-done="1"`); a second call returns at once.
  - One counter `i = 0` per heading.
  - Text node: `n.textContent.split(/(\s+)/)`. Empty parts are dropped; whitespace parts stay as plain text nodes; every word becomes `<span class="w"><span style="--d:{i*55}ms">word</span></span>` and `i` goes up by 1.
  - Element child without class `w`: if it matches `.serif,.grad-text,em,strong,b` the WHOLE element is wrapped once: `span.w` is inserted before it, then `span[style="--d:{i*55}ms"]`, then the element is moved inside (comment: "wrap element whole so gradients survive"). Any other element is walked into.
- **Example** (L3147): `Get to <span class="serif grad-text">Know Me</span>` becomes
  ```html
  <span class="w"><span style="--d: 0ms;">Get</span></span> <span class="w"><span style="--d: 55ms;">to</span></span> <span class="w"><span style="--d: 110ms;"><span class="serif grad-text">Know Me</span></span></span>
  ```
  The About name (L3025-3028) becomes "Faisal" at 0ms and the whole `span.serif.grad-text` "Hanif" at 55ms; the row spans `span.ab-name__row` are walked into, not wrapped.
- **CSS:**
  - `.w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}` (L189)
  - `.w>span{display:inline-block;transform:translate3d(0,105%,0);transition:transform 1s var(--ease-out);transition-delay:var(--d,0ms)}` (L190)
  - `.is-in .w>span,.w.is-in>span{transform:none}` (L191). The heading gets `.is-in` from the reveal observer (it is in the observed selector list), so every word rises from below its mask. Any ancestor with `.is-in` also releases the words.
  - Reduced motion: `.w>span{transform:none!important}` (L360).
  - Page overrides: `#about .ab-name .w{padding:0 .06em .14em 0;margin:0 -.06em -.14em 0}` (L390); contact L840-841, L965, L967, L1185, L1557 and its own `--d` of `170 + i * 130` ms (L5566).
- **Timings:** word delay `i*55` ms, duration 1s, easing `--ease-out` = `cubic-bezier(.22,1,.36,1)`.
- **Headings using it (8):** L3025 `h1.ab-name`, L3147, L3218, L3327, L3377 (`h2.sec-title`), L3581, L3662, L3711 (`h3.pf-bhead__title`). All but the About name have the shape `Word(s) <span class="serif grad-text">Word(s)</span>`.
- **Pauses or skips when:** reduced motion (words shown at once). Split runs even on reduced motion.
- **Cleanup in React:** none needed if the split is rendered, not done by DOM surgery.
- **Port as:** `src/components/motion/SplitWords.tsx`. Render the same DOM at build time from a typed prop (`parts: Array<string | { text: string; className: 'serif grad-text' }>`), assign `--d` in render with the same running counter and 55ms step, and keep `data-split` on the heading so the reveal hook marks it `.is-in`. Do not split on the client with DOM mutation (hydration mismatch).

#### 11.2.5 Reveal observer and every variant (JS L4593-4611, CSS L175-187, L359)

- **Name and lines:** reveal observer L4594-4596, `FH.observe` L4597-4609, `FH.onView` L4611.
- **Starts when:** `FH.observe(document)` 250ms after the preloader lifts (L4782; 0ms with reduced motion). works.js also calls `FH.observe(grid)` (L7108) and `FH.observe(track)` (L7153) for the cards it builds, straight away at script run.
- **Observer options (L4596):** `{rootMargin:'0px 0px -8% 0px', threshold:.12}`. One shared observer for everything.
- **On intersect (L4595):** `e.target.classList.add('is-in')`, `io.unobserve(e.target)`, then `e.target.__onIn()` if set. One shot: reveals NEVER replay, not on scroll back and not when the page is left and shown again (the DOM persists, `.is-in` stays).
- **Hidden pages:** elements inside a `display:none` page do not intersect, so they wait until their page is shown, then reveal as they scroll in.
- **Order inside `FH.observe(root)`:**
  1. `FH.split` on every `[data-split]` (11.2.4).
  2. Every `[data-stagger]` parent: `step = parseInt(p.dataset.stagger,10) || 70`, `base = parseInt(p.dataset.delay,10) || 0`; each DIRECT child matching `:scope > [data-reveal]` gets `--d = (base + k*step) + 'ms'` (k = index among those children only), unless the child already has an inline `--d`.
  3. Every `[data-reveal],[data-split],[data-count],[data-onview]`:
     - if it has `data-delay` and is NOT itself a `data-stagger` parent: `--d = data-delay + 'ms'` (overrides a stagger value).
     - if it has `data-count`: `el.__onIn = () => FH.count(el)`.
     - if there is no `IntersectionObserver` or reduced motion: add `.is-in` now, run `__onIn`, done.
     - else `io.observe(el)`.
- **data-delay unit:** milliseconds, a bare integer string (for example `data-delay="150"` gives `--d:150ms`). On a stagger parent it is the stagger base, not a delay of the parent.
- **data-stagger semantics:** value is the step in ms between direct `[data-reveal]` children (default 70). Nested grandchildren are not counted.
- **`data-onview`:** in the selector, but no element in the file uses it. `FH.onView` is also unused by page scripts.

##### Variants (CSS L178-187; all selectors are prefixed `.js`)
Base for every `[data-reveal]` (L178): `opacity:0; transition:opacity var(--dur-3) var(--ease-out),transform var(--dur-3) var(--ease-out),filter var(--dur-3) var(--ease-out),clip-path var(--dur-4) var(--ease-out); transition-delay:var(--d,0ms); will-change:opacity,transform`. `--dur-3` = `.9s`, `--dur-4` = `1.2s`, `--ease-out` = `cubic-bezier(.22,1,.36,1)`.

| Attribute | Start state | Used in markup |
|---|---|---|
| `data-reveal` (empty) or `data-reveal="up"` | `transform:translate3d(0,26px,0); filter:blur(6px)` | 47 static elements, plus every injected `nav.page-next`, works `.wk-cell` (L7043) and `.wk-cc` (L7125). `"up"` itself is never written. |
| `data-reveal="fade"` | `filter:blur(4px)` | 11: L3580, L3584, L3661, L3668, L3710, L3952, L4019, L4024, L4032, L4040, L4048 |
| `data-reveal="scale"` | `transform:scale(.94); filter:blur(6px)` | 3: L3336, L3382, L4062 |
| `data-reveal="left"` | `transform:translate3d(-32px,0,0); filter:blur(6px)` | 4: L3602, L3616, L3630, L3643 |
| `data-reveal="right"` | `transform:translate3d(32px,0,0); filter:blur(6px)` | none (CSS only) |
| `data-reveal="blur"` | `filter:blur(14px); transform:scale(1.02)` | none (CSS only) |
| `data-reveal="mask"` | `opacity:1; clip-path:inset(0 0 100% 0)` | none (CSS only) |

End state: `.js [data-reveal].is-in{opacity:1;transform:none;filter:none}` (L186) and `.js [data-reveal="mask"].is-in{clip-path:inset(0 0 0 0)}` (L187).
Reduced motion (L359): `.js [data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}`.
Page CSS that changes reveals: L371 (`#about [data-reveal].is-in{clip-path:none}`), L585-591 (About bento uses its own `ab-clip` animation with `var(--d,0ms)`), L2039 (profile), L2390-2393 and L2409-2410 (works cells: the screen unmasks when `.wk-cell.is-in`).

##### Stagger parents (all 6) and the delays they produce
| Parent | Lines | step, base | Children and `--d` |
|---|---|---|---|
| `dl.ab-stats` | L3056 | 90, 600 | 3 `.ab-stat`: 600, 690, 780ms |
| `div.ab-bento` | L3151 | 90, 0 | 4 `article.ab-kc`: 0, 90, 180, 270ms |
| `div.ab-svc-list` | L3226 | 90, 0 | 4 `article.ab-svc`: 0, 90, 180, 270ms |
| `aside.ab-side` | L3406 | 90, 0 | `.ab-side__head`, 2 `button.ab-sess`, `.ab-side__card`: 0, 90, 180, 270ms |
| `ul.pf-chips` | L3778 | 45, 0 | 10 `li.pf-chipw`: 0 to 405ms in steps of 45 |
| `div.ct-ledger__row` | L4023 | 80, 80 | 4 `article.ct-method`: 80, 160, 240, 320ms |

##### Elements with their own data-delay (13)
L3023 (80), L3030 (360), L3039 (460), L3048 (540), L3582 (150), L3584 (250), L3664 (150), L3682 (120), L3693 (220), L3713 (150), L3762 (120), L3773 (80), L3952 (160). (L3056 and L4023 are stagger bases.)
works.js writes `--d` itself before calling `FH.observe`: grid cells `Math.round(rowX/12*3)*90+'ms'` (L7107) and certificate cards `Math.min(i,3)*90+'ms'` (L7152).

- **Pauses or skips when:** reduced motion or no `IntersectionObserver` (everything `.is-in` at once). Not affected by pointer type or tab visibility.
- **Cleanup in React:** unobserve on unmount; one shared observer for the app.
- **Port as:** `src/hooks/useReveal.ts` plus `src/components/motion/Reveal.tsx` (`<Reveal as variant delay>` renders `data-reveal={variant ?? ''}` and `style={{'--d': ms}}`). Keep the `data-reveal` attribute and `.is-in` class so the CSS ports unchanged. A `staggerDelay(base, step, k)` helper computes child delays at render. Gate the first observation on "preloader done + 250ms" (see Porting plan). To keep "no replay" across route changes, remember revealed keys per route (see Porting plan).

#### 11.2.6 Counters (JS L4613-4618)

- **Name and lines:** `FH.count(el)`, L4614-4618. Doc comment L4613: `<span data-count="10" data-suffix="+" data-prefix="$" data-duration="1600">`.
- **Starts when:** the `[data-count]` element itself first intersects (it is observed by the reveal observer and gets `el.__onIn`). It does NOT wait for `--d` or for its parent's reveal delay.
- **Reads:** `to = parseFloat(el.dataset.count)`, `pre = el.dataset.prefix || ''`, `suf = el.dataset.suffix || ''`, `dur = parseInt(el.dataset.duration,10) || 1600`, `dec = (String(el.dataset.count).split('.')[1] || '').length` (decimal places copied from the attribute text).
- **Writes:** `el.textContent` every frame: `pre + (to*e).toFixed(dec) + suf`.
- **Timings:** `t0` = timestamp of the first `requestAnimationFrame`; `p = Math.min(1,(t-t0)/dur)`; easing `e = 1 - Math.pow(1-p, 4)` (ease out quart); stops when `p` reaches 1. Default duration 1600ms.
- **Pauses or skips when:** reduced motion or `isNaN(to)`: `el.textContent = pre + el.dataset.count + suf` at once (the raw attribute text). No off screen or tab checks (rAF simply stops in a hidden tab).
- **Uses (4):**

| Line | Markup | Result |
|---|---|---|
| L3059 | `<span data-count="3" data-suffix="+">0</span>` (About stat "Years Coding") | 0+ to 3+ over 1600ms |
| L3063 | `<span data-count="10" data-suffix="+">0</span>` ("Projects") | 0+ to 10+ over 1600ms |
| L3067 | `<span data-count="3" data-suffix="+">0</span>` ("Companies") | 0+ to 3+ over 1600ms |
| L3391 | `<span class="ab-plan__amt" data-count="25" data-duration="1400">0</span>` (pricing) | 0 to 25 over 1400ms |

  `data-prefix` is used only in the comment. The About stats count while their `.ab-stat` parents are still fading in (parent delays 600 to 780ms).
- **Not core:** works (`data-wk-to`, 1500ms, `Math.round`, L7269-7274), contact (`data-ct-count`, L5568-5579) and profile (`countTo`, L6506) have their own counters with the same quart easing; they are mapped in their page parts.
- **Cleanup in React:** cancel the rAF on unmount.
- **Port as:** `src/hooks/useCountUp.ts` (`useCountUp(ref, { to, prefix, suffix, duration = 1600 })`) plus `<CountUp>` that renders the initial `0` text, keeps `data-count` on the span so the reveal hook triggers it, and formats with `toFixed(decimals)`.

#### 11.2.7 Spotlight (JS L4620-4624, CSS L165-170)

- **Name and lines:** spotlight cards, L4621-4624.
- **Starts when:** one `pointermove` listener on `document`, `{passive:true}`, bound at script run (before the preloader lifts).
- **Reads:** `e.target.closest('[data-spotlight]')`; that card's `getBoundingClientRect()`.
- **Writes:** `--mx = (e.clientX - r.left) + 'px'` and `--my = (e.clientY - r.top) + 'px'` on the card (no rounding).
- **CSS:**
  - `[data-spotlight]{--mx:50%;--my:50%}`
  - `[data-spotlight]::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;z-index:0;background:radial-gradient(420px circle at var(--mx) var(--my),var(--accent-soft),transparent 45%);transition:opacity var(--dur-2) var(--ease-out)}` (`--dur-2` = `.6s`)
  - `[data-spotlight]:hover::before{opacity:1}`
  - `[data-spotlight]>*{position:relative;z-index:1}`
  - Override: `#profile .pf-edu--feat[data-spotlight]::before` uses `rgba(255,255,255,.10)` (L1916).
- **Timings:** none in JS; fade .6s in CSS.
- **Pauses or skips when:** never. Runs for mouse, pen and touch, and with reduced motion (only the hover fade is affected by the global reduced motion CSS).
- **Elements (static):** L3152, L3166, L3177, L3227, L3250, L3273, L3296, L3383 (`div.ab-plan__in`, not a `.card`), L3411, L3416, L3602, L3616, L3630, L3643, L3668, L3682, L3693, L4022. Built by works.js: `article.wk-card` (L7044) and `article.wk-cert` (L7126).
- **Cleanup in React:** remove the document listener when the provider unmounts.
- **Port as:** `src/hooks/useSpotlight.ts` mounted ONCE in the app shell (delegated document listener, same as the reference). Components only add `data-spotlight`. A per card hook would also work but must write the same two variables.

#### 11.2.8 Magnetic (JS L4626-4631)

- **Name and lines:** `bindMagnetic(root)`, L4629-4631, called by `FH.bind`.
- **Starts when:** `FH.bind(document)` 250ms after the preloader lifts; `FH.bind(grid)` and `FH.bind(track)` in works.js (no magnetic elements there).
- **Reads:** strength `s = parseFloat(el.dataset.magnetic) || 0.25`; on each `pointermove` over the element, its `getBoundingClientRect()`.
- **Writes:** `el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'` with `x = (e.clientX - r.left - r.width/2) * s`, `y = (e.clientY - r.top - r.height/2) * s`. On `pointerleave`: `el.style.transform = ''`. Marks `el.__mag = 1` so it binds once.
- **Timings:** no JS timing; the ease comes from `.btn`'s CSS `transition: transform var(--dur-1) var(--ease-out)` (`.35s`, L136).
- **Pauses or skips when:** `!FH.fine || FH.reduce` at load (nothing bound at all).
- **Elements (6):** L3040 (About "Download CV", default .25), L3401 (About pricing "GET STARTED", `data-magnetic="0.15"`), L3451 (Profile "Download CV", .25), L3811 (Works "Browse projects", .25), L3912 (Approvals "Browse certificates", .25), L3985 (Contact "Send a message", `data-magnetic="0.18"`).
- **Cleanup in React:** remove both listeners, clear the inline transform.
- **Port as:** `src/hooks/useMagnetic.ts` (`useMagnetic(ref, strength = 0.25)`), inactive unless `(pointer:fine)` and not reduced motion. Keep `data-magnetic` in the DOM for parity (not required by CSS).

#### 11.2.9 Tilt (JS L4632-4636)

- **Name and lines:** `bindTilt(root)`, L4633-4635, called by `FH.bind`.
- **Starts when:** same as magnetic (11.2.8). The works grid cards are bound by works.js `FH.bind(grid)` at L7108.
- **Reads:** max angle `m = parseFloat(el.dataset.tilt) || 5`; rect on each `pointermove`.
- **Writes:** `el.style.transform = 'perspective(900px) rotateX(' + (-py*m).toFixed(2) + 'deg) rotateY(' + (px*m).toFixed(2) + 'deg) translateY(-4px)'` with `px = (e.clientX - r.left)/r.width - .5`, `py = (e.clientY - r.top)/r.height - .5`. On `pointerleave`: `''`. Marks `el.__tilt = 1`.
- **Timings:** none in JS; the card transition (`.card` `transform var(--dur-2) var(--ease-out)`, L159) or the page CSS smooths it (About bento: `transform .6s var(--ease-out)` at L585).
- **Pauses or skips when:** `!FH.fine || FH.reduce` at load.
- **Elements:** About bento L3152, L3166, L3177, L3196 (`data-tilt="2.5"`); works `article.wk-card` (L7044, `data-tilt="3"`).
- **Cleanup in React:** remove listeners, clear the inline transform.
- **Port as:** `src/hooks/useTilt.ts` (`useTilt(ref, max = 5)`).

#### 11.2.10 Theme toggle with circular reveal (JS L4638-4647, CSS L230-235, L352-354)

- **Name and lines:** `FH.setTheme` L4639-4640; toggle binding L4641-4647.
- **Starts when:** `click` on either `button.theme-btn[data-theme-toggle]` (rail L2984, top bar L2991). Bound directly (not delegated) at script run.
- **Reads:** `document.documentElement.getAttribute('data-theme')`; the clicked button's `getBoundingClientRect()`; `innerWidth`, `innerHeight`.
- **Logic:**
  1. `next = current === 'dark' ? 'light' : 'dark'`.
  2. If `!document.startViewTransition || reduce`: `FH.setTheme(next)` and stop (fallback: instant swap; the `body` colour transition `background-color var(--dur-2) var(--ease-out),color var(--dur-2) var(--ease-out)` at L98 still eases the page colours over .6s).
  3. Else: `x = r.left + r.width/2`, `y = r.top + r.height/2`, `R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))` (distance from the button centre to the farthest viewport corner).
  4. `vt = document.startViewTransition(function(){ FH.setTheme(next) })`.
  5. `vt.ready.then(...)`: `document.documentElement.animate({ clipPath: ['circle(0px at '+x+'px '+y+'px)', 'circle('+R+'px at '+x+'px '+y+'px)'] }, { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' })`. The new theme always grows out of the button, in both directions (light to dark and dark to light).
- **FH.setTheme(t) writes:** `data-theme` on `<html>`; `localStorage.setItem('fh-theme', t)` inside try/catch; `meta[name=theme-color]` content `'#050f0c'` for dark, `'#0e6655'` for light; then `document.dispatchEvent(new CustomEvent('fh:theme', {detail: t}))`. No page script listens to `fh:theme`.
- **CSS:**
  - `::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}` and `::view-transition-new(root){z-index:2} ::view-transition-old(root){z-index:1}` (L353-354).
  - Button: `.theme-btn{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;color:var(--ink-2);border:1px solid var(--line);background:var(--surface);transition:transform var(--dur-2) var(--ease-out),color var(--dur-1)}`, hover `color:var(--brand-ink);transform:rotate(-12deg)`, icon 19px. Moon shows in light, sun shows in dark (`.theme-btn .i-sun{display:none}`, `[data-theme="dark"] .theme-btn .i-sun{display:block}`, `[data-theme="dark"] .theme-btn .i-moon{display:none}`).
- **Storage key:** `fh-theme`, values `'light'` or `'dark'`. The boot script (L12-16) reads it; if missing it follows `prefers-color-scheme` once (no live listener for OS changes).
- **Timings:** 750ms, `cubic-bezier(.65,0,.35,1)` (same curve as `--ease-io`).
- **Pauses or skips when:** reduced motion or no View Transitions API (instant swap).
- **Accessibility:** fixed `aria-label="Switch light or dark theme"`, no `aria-pressed`.
- **Cleanup in React:** none (click handler on the component).
- **Port as:** inline head script in `src/app/layout.tsx` copied from L12-16 (keep `suppressHydrationWarning` on `<html>`), `src/components/providers/ThemeProvider.tsx` exposing `setTheme` (same four writes), `src/components/ui/ThemeToggle.tsx` doing steps 1 to 5. Keep ONE `<meta name="theme-color" content="#0e6655">` so the provider can update it (do not use a media based pair).

#### 11.2.11 Modals (JS L4649-4660, CSS L266-279)

- **Name and lines:** `FH.openModal` L4651-4652, `FH.closeModal` L4653-4654, click delegation L4655-4659, Esc L4660.
- **Starts when:** click delegation on `document` (bubble phase) and `keydown` on `document`, bound at script run.
- **Opening, `FH.openModal(id)`:**
  1. `m = document.getElementById(id)`; stop if missing.
  2. `lastFocus = document.activeElement`.
  3. `m.classList.add('is-open')`, `m.setAttribute('aria-hidden','false')`, `document.body.classList.add('modal-open')`.
  4. After 60ms: focus the first element in document order matching `[autofocus],button,input,select,textarea,a[href]` inside `m`, with `{preventScroll:true}`. For both modals this is the `.fh-modal__close` button (the first button in the panel). The booking module then moves focus to the checked session radio at 90ms (70ms with reduced motion).
  5. `m.dispatchEvent(new CustomEvent('fh:open'))` (synchronous, right after step 3, before the 60ms focus; does not bubble).
- **Closing, `FH.closeModal(id?)`:**
  1. `ms = id ? [document.getElementById(id)] : FH.$$('.fh-modal.is-open')`.
  2. For each: remove `is-open`, `aria-hidden="true"`, dispatch `fh:close` on it (fired even if it was not open when an id is given).
  3. If no `.fh-modal.is-open` is left: remove `body.modal-open`.
  4. If `lastFocus` has `focus`: `lastFocus.focus({preventScroll:true})`. This runs on EVERY call, even when nothing was open (see Notes and traps).
- **Click delegation (first match wins):**
  1. `e.target.closest('[data-close]')`: close the modal that contains it (`FH.closeModal(m && m.id)`). Elements: scrims L4241, L4495 and close buttons L4243, L4497.
  2. `e.target.closest('[data-open]')`: `e.preventDefault()`, `FH.openModal(o.dataset.open)`. Only element: the works grid "Live Preview" button for PureBody, `button.wk-live[data-open="purebody"][aria-haspopup="dialog"]` (L7036, from `modal:'purebody'` at L6863).
  3. `e.target.closest('[data-book]')`: `e.preventDefault()`, then `FH.openBooking(b.dataset.book||'')` if defined, else `FH.openModal('booking')`.
- **Esc:** `if(e.key==='Escape') FH.closeModal()` closes every open modal.
- **Router:** `FH.go` closes any open modal before routing (L4695).
- **Scroll lock:** `body.modal-open{overflow:hidden}` (L279), and the smooth wheel handler ignores wheel events while `body.modal-open` (L4749), so the panel scrolls natively (`overscroll-behavior:contain`). The booking panel also carries `data-native-scroll` (L5794).
- **Focus:** no focus trap, the page behind is not inert; `aria-modal="true"` on the panel is the only signal.
- **CSS (exact):**
  - `.fh-modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:clamp(0px,3vw,32px);visibility:hidden;pointer-events:none}`
  - `.fh-modal.is-open{visibility:visible;pointer-events:auto}`
  - `.fh-modal__scrim{position:absolute;inset:0;background:rgba(3,14,11,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s var(--ease-out)}`, open: `opacity:1`
  - `.fh-modal__panel{position:relative;width:min(1080px,100%);max-height:min(92vh,100%);overflow:auto;overscroll-behavior:contain;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);opacity:0;transform:translateY(28px) scale(.98);transition:opacity .5s var(--ease-out),transform .7s var(--ease-out)}`, open: `opacity:1;transform:none`
  - `@media (max-width:640px){.fh-modal{padding:0;align-items:end}.fh-modal__panel{max-height:94vh;border-radius:24px 24px 0 0}}` (bottom sheet)
  - `.fh-modal__close{position:sticky;top:14px;margin-left:auto;margin-right:14px;margin-top:14px;z-index:5;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);color:var(--ink);float:right;transition:transform var(--dur-2) var(--ease-out)}`, hover `transform:rotate(90deg)`
  - `#purebody .fh-modal__panel{width:min(1120px,100%)}` (L2321)
  - Close is instant: `visibility` has no transition, so the fade out never shows. Opening animates (scrim .5s, panel .5s opacity and .7s transform).
- **Events fired:** `fh:open`, `fh:close` on the modal element. Listeners: works.js on `#purebody` (L7608: scroll `#wk-pb-phones` to `scrollLeft=0`, start each video after `300+i*120` ms, 0 with reduced motion, only if still open; L7612: pause every video).
- **Pauses or skips when:** nothing motion specific; the CSS transitions shrink to .001ms under reduced motion.
- **Cleanup in React:** remove document listeners; restore focus on close.
- **Port as:** `src/components/providers/ModalProvider.tsx` (context `openModal(id)`, `closeModal(id?)`, `openBooking(type)`, plus a document click delegate for `[data-close]`, `[data-open]`, `[data-book]` so markup authored with those attributes keeps working) and `src/components/ui/Modal.tsx` (renders the shell above with `is-open`, `aria-hidden`, fires `onOpen`/`onClose` callbacks in place of `fh:open`/`fh:close`). Keep the 60ms first focus.

#### 11.2.12 Toast (JS L4662-4663, CSS L281-284)

- **Name and lines:** `FH.toast(msg)`, L4663.
- **Starts when:** called by page scripts.
- **Writes:** `#toast.textContent = msg`, adds `.is-on`, `clearTimeout(tt)`, `tt = setTimeout(remove .is-on, 3200)`. A new toast replaces the text at once and restarts the 3200ms timer. The text is not cleared on hide.
- **CSS:** `.toast{position:fixed;left:50%;bottom:110px;transform:translate(-50%,20px);z-index:90;padding:12px 18px;border-radius:14px;background:var(--ink);color:var(--bg);font-weight:600;font-size:.9rem;opacity:0;pointer-events:none;transition:opacity .4s var(--ease-out),transform .5s var(--ease-out);box-shadow:var(--shadow-lg)}`, `.toast.is-on{opacity:1;transform:translate(-50%,0)}`, `@media (min-width:1024px){.toast{bottom:32px}}`.
- **Messages sent by page scripts (exact):**
  - about.js: `Email copied to clipboard` (L5016); if copying fails, the email address itself (L5018-5019).
  - contact.js (through `toast()` at L5187): `'Email copied: ' + v` (L5634), `Opening your email app with your message` or `Message sent. Talk soon!` (L5769), `That did not go through. Please try again or email me directly.` (L5773), `Opening your email app with the booking details` or `Booking sent. Check your inbox soon.` (L6143), `Booking did not go through. Please try again.` (L6155).
- **Pauses or skips when:** never.
- **Cleanup in React:** clear the timer on unmount.
- **Port as:** `src/components/providers/ToastProvider.tsx` (`useToast()` returns `toast(msg)`) and `src/components/ui/Toast.tsx`, always mounted with `id="toast" role="status" aria-live="polite"` so the live region exists before the first message.

#### 11.2.13 Scroll progress, top bar state and active nav (JS L4665-4672, CSS L215-250)

##### Scroll progress and top bar
- **Name and lines:** `onScroll()` L4667, listener L4668.
- **Starts when:** `window` `scroll` (passive), throttled to one `requestAnimationFrame` by a `ticking` flag; also once at boot (L4781).
- **Reads:** `document.documentElement.scrollHeight - innerHeight`, `scrollY`.
- **Writes:** `#progress.style.transform = 'scaleX(' + (h > 0 ? scrollY/h : 0) + ')'` (unrounded); `#topbar.classList.toggle('is-scrolled', scrollY > 12)`.
- **CSS:** `.progress{position:fixed;left:0;top:0;height:2px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--grad-glow);z-index:60}` (no transition). `.topbar{... transition:background-color .4s,box-shadow .4s,backdrop-filter .4s}`, `.topbar.is-scrolled{background:var(--glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--line)}`, top bar hidden at `min-width:1024px`.
- **Pauses or skips when:** never (not reduced motion aware; it is not motion). Not updated on `resize`.
- **Cleanup in React:** remove the listener, cancel the rAF.
- **Port as:** `src/components/layout/ScrollProgress.tsx` and `TopBar.tsx`, writing through refs (no React state per frame), sharing one rAF throttled scroll subscription.

##### Active nav, `FH.setActive(id)` (L4669-4672)
- **Starts when:** every `show(id)` (initial page and each route change).
- **Writes:** `.is-active` on every `[data-nav]` whose value equals `id` (rail and dock); for each `.rail__nav`: `.rail__ind` gets `style.opacity = 1` and `style.transform = 'translateY(' + a.offsetTop + 'px)'` where `a` is the matching link.
- **CSS:** `.rail__ind{position:absolute;left:0;right:0;top:0;height:58px;border-radius:14px;background:var(--brand-soft);border:1px solid var(--line);transition:transform .6s var(--ease-out),opacity .3s;opacity:0}`; links are 58px tall with `gap:2px`, so offsets are 0, 60, 120, 180, 240px; `.rail__link.is-active{color:var(--brand-ink)}`; hover `color:var(--ink)` and icon `translateY(-2px)`.
- **Measures:** `offsetTop` of the link. It is 0 for every link while the rail is `display:none` (under 1024px).
- **Also:** the router's click interceptor blurs `.rail__link` and `.rail__logo` after a mouse click (`e.detail` non zero) so the focus ring does not stick (L4719). Keyboard activation keeps focus.
- **Port as:** `Rail.tsx` and `Dock.tsx` derive the active id from `usePathname()`; `Rail.tsx` measures `offsetTop` in `useLayoutEffect` on route change and writes the indicator style.

#### 11.2.14 Hash router and curtain transitions (JS L4673-4730, CSS L293-333)

- **Name and lines:** router, L4673-4730 (`show`, `jumpTop`, `FH.scrollToEl`, `FH.go`, click interception, `popstate`, `scrollIntoView` patch, initial page).
- **Starts when:** core script run (page classes, listeners, initial `show()`); then on clicks on `a[href^="#"]` (window, capture), `popstate`, and direct `FH.go` calls from page scripts.
- **Reads or measures:** `location.hash`; `document.getElementById`; `closest('.page')`; `getBoundingClientRect().top`, `scrollY`, `innerWidth` (anchor offset); `window.top === window.self`; `.fh-modal.is-open`.
- **Writes:** `.page`, `data-page`, `.is-current`, `.is-leaving` on the page sections; `.is-on`, `.is-in`, `.is-out` on `#curtain`; text of `#curtainNum` and `#curtainTitle`; `document.title`; `FH.current`; history entries (`pushState`); scroll position; events `fh:page` and synthetic `resize`.
- **Timings:** cover 560ms, hold 140ms, reveal 640ms; instant path anchor delay 60ms; initial deep link anchor delay 1600ms (details below).

##### Pages, names and numbers (L4674-4677)
- `PAGES = ['about','profile','works','approvals','contact']` (order is used for numbering, Next page links and the curtain label).
- `META = {about:{n:'01',t:'About'}, profile:{n:'02',t:'Profile'}, works:{n:'03',t:'Works'}, approvals:{n:'04',t:'Approvals'}, contact:{n:'05',t:'Contact'}}`.
- At script run every page element gets class `page` and `data-page="<id>"` (L4677). The markup itself does not carry them: `section#about.ab` (L3004), `section#profile.section.pf` (L3437), `section#works.section.wk-sec` (L3798), `section#approvals.section.wk-sec.wk-ap` (L3899), `section#contact.section.ct` (L3965).
- CSS (L298-299): `html.smooth-on{scroll-behavior:auto}`, `.page:not(.is-current){display:none}`. Hidden pages are fully `display:none`, so nothing inside them can be measured (offsets and rects are 0) until they are shown.
- Default page: `about` (empty hash, unknown id, or an id that is not inside a page).

| Page | Curtain label (`#curtainNum` / `#curtainTitle`) | `document.title` (L4683) |
|---|---|---|
| about | `01 / 05` / `About` | `Faisal Hanif · Software Engineer` |
| profile | `02 / 05` / `Profile` | `Profile · Faisal Hanif` |
| works | `03 / 05` / `Works` | `Works · Faisal Hanif` |
| approvals | `04 / 05` / `Approvals` | `Approvals · Faisal Hanif` |
| contact | `05 / 05` / `Contact` | `Contact · Faisal Hanif` |

The curtain number is always `META[page].n + ' / 05'` (two digits on both sides).

##### `pageOf(el)` and `FH.pageOf` (L4678-4679)
`el && el.closest && el.closest('.page')`, returns that element's `id` or `null`. For a page element it returns its own id (closest includes itself).

##### `show(id)` (L4681-4686), runs on every page change and once at boot
1. For each page: `classList.toggle('is-current', p === id)` and `classList.remove('is-leaving')`.
2. `FH.current = id`; `FH.setActive(id)` (11.2.13); `document.title` from the table above.
3. `document.dispatchEvent(new CustomEvent('fh:page', {detail: id}))`, synchronous, on `document`, not cancelable.
4. Next frame: `window.dispatchEvent(new Event('resize'))` (a synthetic resize so every page part re-measures now that the page is visible) and `FH._parallax()` if it exists.

##### `jumpTop()` (L4680), the scroll reset
Saves `document.documentElement.style.scrollBehavior`, sets it to `'auto'`, `window.scrollTo(0,0)`, restores the saved inline value, then `FH._smoothReset()` if smooth scrolling is on. Needed because `html{scroll-behavior:smooth}` (L95) is still active on touch devices (only `.smooth-on` turns it off). Every page change resets scroll to the top, including Back and Forward (no scroll restoration).

##### `FH.scrollToEl(el)` (L4687)
- `y = el.getBoundingClientRect().top + scrollY - (innerWidth < 1024 ? 84 : 32)` (84px clears the mobile top bar, 32px on desktop).
- If smooth wheel scrolling is on: `FH._smoothTo(y)` (lerp, 11.2.16). Else `window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'})`.
- Does nothing for `null`. It does not change the page; the element must be in the current page (or outside every page).

##### `FH.go(target, opts)` (L4689-4711)
1. `el` = `document.getElementById(target)` for a string, else `target`. Stop if missing.
2. `page` = `el.id` if `el` has class `page`, else `pageOf(el)`. Stop if `null` (elements outside pages, such as the modals, chat and footer, cannot be routed to).
3. `anchor` = `null` for a page, else `el`. `hash = '#' + (anchor && anchor.id ? anchor.id : page)`.
4. History: unless `opts.noHistory`, and only if `location.hash !== hash` and `window.top === window.self` (not inside an iframe): `try{ history.pushState(null, '', hash) }catch(e){}`. This happens BEFORE the busy check.
5. If a `.fh-modal.is-open` exists: `FH.closeModal()` (closes all, restores focus).
6. Same page (`page === FH.current`): anchor: `FH.scrollToEl(anchor)`; no anchor: `FH._smoothTo(0)` or `window.scrollTo({top:0, behavior:'smooth'})` (this fallback is smooth even with reduced motion: an explicit `behavior:'smooth'` in JS is not overridden by the reduced motion CSS `scroll-behavior:auto!important`). Return. Same page moves are never blocked by `busy`.
7. `if(busy) return` (a different page requested during a running transition is dropped; see Notes and traps).
8. Instant path, when `reduce || !FH.current || opts.instant`: `show(page)`, `jumpTop()`, and if there is an anchor `setTimeout(() => FH.scrollToEl(anchor), 60)`. No curtain.
9. Curtain path (step table below).

##### Curtain phases (exact, L4699-4710 with CSS L311-333)
Times are from the moment `FH.go` runs (T = 0).

| T (ms) | JS (exact) | What moves (CSS, exact) |
|---|---|---|
| 0 | `busy = true`; `#curtainNum.textContent = META[page].n + ' / 05'`; `#curtainTitle.textContent = META[page].t`; `c.classList.remove('is-out'); c.classList.add('is-on'); void c.offsetWidth; c.classList.add('is-in')`; current page gets `.is-leaving` | `.curtain.is-on{visibility:visible;pointer-events:auto}` (the curtain now blocks clicks). Layer A: `transform:none;border-radius:0;transition:transform .5s var(--ease-io),border-radius .5s var(--ease-io)` (0 to 500). Layer B: `transform .52s .04s var(--ease-io),border-radius .52s .04s var(--ease-io)` (40 to 560). Bar fill: `transform:scaleX(1);transition:transform .5s .18s var(--ease-io)` (180 to 680). Title: `transform:none;transition:transform .55s .2s var(--ease-out)` (200 to 750). Number: `opacity:1;transform:none;transition:opacity .4s .24s var(--ease-out),transform .4s .24s var(--ease-out)` (240 to 640). Old page: `.page.is-leaving{opacity:.55;transform:translateY(-18px) scale(.99);filter:blur(3px);transition:all .5s var(--ease-io);transform-origin:50% 0}` (0 to 500). |
| 560 | `show(page); jumpTop()` | Cover is complete (layer B lands at exactly 560). Old page becomes `display:none` (its `.is-leaving` is removed), new page shows at scroll 0, `fh:page` fires, next frame synthetic `resize` and parallax pass. |
| 700 (560 + 140) | `c.classList.add('is-out'); c.classList.remove('is-in')` | Layer B: `transform:translate3d(0,-108%,0);border-radius:0 0 50% 50%/0 0 14vh 14vh;transition:transform .55s var(--ease-io),border-radius .55s var(--ease-io)` (700 to 1250). Layer A: same end state with `.55s .05s` (750 to 1300). Title and number: `transform:translateY(-40%);opacity:0;transition:transform .35s var(--ease-io),opacity .3s` (700 to 1050). Bar: `opacity:0;transition:opacity .2s` (700 to 900); its fill stays `scaleX(1)`. The title is still rising at 700 (its rise ends at 750) and turns straight into the exit. |
| 1340 (700 + 640) | `c.classList.remove('is-on','is-out'); busy = false; if(anchor) FH.scrollToEl(anchor)` | Curtain hidden again. With no state class the layers have no transition, so they snap back to the start (`translate3d(0,108%,0)`, `border-radius:50% 50% 0 0/14vh 14vh 0 0`) while invisible. |

Result: 560ms cover, 140ms hold, 640ms reveal, 1340ms in total (the owner's figures are correct). The CSS comment at L310 says "quick, ~1.1s total"; the real total is 1340ms. Page parts detect the lift by watching the curtain class: "covering" = `is-on` and not `is-out`, so for them the lift starts at 700ms.

Curtain static CSS (L311-322, exact):
- `.curtain{position:fixed;inset:0;z-index:95;pointer-events:none;visibility:hidden}`
- `.curtain__layer{position:absolute;left:-5vw;right:-5vw;top:0;bottom:0;transform:translate3d(0,108%,0);border-radius:50% 50% 0 0/14vh 14vh 0 0;will-change:transform,border-radius}`
- `.curtain__layer--a{background:var(--accent);opacity:.18}`; dark: `[data-theme="dark"] .curtain__layer--a{opacity:.22}`
- `.curtain__layer--b{background:var(--surface);box-shadow:0 -30px 80px -30px rgba(8,48,42,.25)}`
- `.curtain__label{position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:var(--ink)}`
- `.curtain__inner{display:grid;justify-items:center;gap:12px;padding:0 16px}`
- `.curtain__num{font-family:var(--font-mono);font-size:.72rem;letter-spacing:.3em;color:var(--brand-ink);opacity:0;transform:translateY(8px)}`
- `.curtain__title{display:block;font-family:var(--font-serif);font-style:italic;font-size:clamp(2.6rem,7vw,5.6rem);line-height:1;letter-spacing:-.02em;color:var(--ink);transform:translateY(105%)}` (inside the inline mask span `overflow:hidden;display:block;padding:0 .1em .08em`)
- `.curtain__bar{width:88px;height:2px;border-radius:2px;background:var(--line);overflow:hidden}`, `.curtain__bar::after{content:"";display:block;height:100%;width:100%;background:var(--grad-glow);transform:scaleX(0);transform-origin:0 50%}`
- Token values: `--ease-io:cubic-bezier(.65,0,.35,1)`, `--ease-out:cubic-bezier(.22,1,.36,1)`, `--accent:#10b981` (dark `#34d399`), `--surface:#ffffff` (dark `#0b1a16`), `--line:rgba(15,76,65,.10)` (dark `rgba(160,230,205,.08)`), `--grad-glow` light `linear-gradient(100deg,#0e6655 0%,#1f9c7f 45%,#5fcf9f 100%)`, dark `linear-gradient(100deg,#34d399 0%,#5fcf9f 40%,#b6f0d9 100%)`.
- Look: two sheets rise from below with a curved (elliptical) top edge that flattens as they cover (layer A is a faint accent tint, layer B is the surface sheet with an upward shadow), then leave through the top with the curve now on their bottom edge. No responsive rules; only `clamp()` on the title.
- Reduced motion: the curtain never runs (instant path).

##### Link interception (L4712-4723), `window` click listener in CAPTURE phase
1. Ignore unless `e.button === 0` and no `metaKey`, `ctrlKey`, `shiftKey` (Alt is not checked). Ignored clicks keep the browser default.
2. `a = e.target.closest('a[href^="#"]')`; ignore if none (external links, `mailto:`, `tel:` and file links are never touched).
3. Always `preventDefault()` natively, so the browser never performs a hash jump.
4. Replace `e.preventDefault` on this event object with a wrapper that sets `handled = true`. Any later handler (target or bubble phase, for example profile.js `.pf-sheet` clicks at L6625-6628) that calls `e.preventDefault()` "claims" the click and the router stays out.
5. `.rail__link` and `.rail__logo`: `a.blur()` when `e.detail` is non zero (mouse click, not keyboard).
6. `id = decodeURIComponent(href.slice(1))`; stop if empty (`href="#"` does nothing at all).
7. `el = document.getElementById(id)`; stop if missing, or if the link has `data-no-route` (no element in the file has it).
8. `setTimeout(0)`: if `handled`, stop; if `el` is not in a page and is not a page, `FH.scrollToEl(el)`; else `FH.go(el)`.

Every `a[href^="#"]` in the file and what the router does with it:

| Line | Link | Target | Result |
|---|---|---|---|
| L2974 | `a.rail__logo` "FH" (`aria-label="Faisal Hanif, back to top"`) | `#about` | About page (curtain from another page, smooth to top on About) |
| L2977-2981, L2996-3000 | rail and dock `a.rail__link[data-nav]` | `#about` `#profile` `#works` `#approvals` `#contact` | page change |
| L2989 | `a.topbar__brand` | `#about` | as the logo |
| L3121 | `a.ab-scroll` "Scroll to explore" | `#ab-know` (L3144, About) | same page scroll, hash `#ab-know` pushed |
| L3401 | `a.btn.btn--primary.ab-plan__cta` "GET STARTED" | `#contact` | page change to Contact |
| L3402 | `a` "Let's discuss your project" | `#contact` | page change to Contact |
| L3452 | `a.btn.btn--ghost.pf-goexp` "View experience" | `#pf-exp` (L3576) | same page scroll |
| L3475, L3493, L3528 | `a.pf-sheet` (three hero sheets) | `#pf-edu-bs`, `#pf-role-techxelo`, `#pf-skills` | claimed by profile.js (`e.preventDefault()`, then its own `jumpTo` with `FH.scrollToEl` and a flash); no hash is pushed |
| L3561 | `a.pf-cue.pf-hi` "Scroll to explore" | `#pf-exp` | same page scroll |
| L3985 | `a.btn.btn--primary.ct-hact.ct-in` "Send a message" | `#ct-form` (L4123) | same page scroll |
| L4014 | `a.ct-cue.ct-in` "Scroll to reach me" | `#ct-ways` (L4019) | same page scroll |
| L4233 | footer `a.link-arrow` "Back to top" | `#about` | on About: smooth scroll to top; on any other page: goes to the About page with the curtain |
| L4735 | injected Next page links | next page id | page change (11.2.15) |

##### History (L4724)
`popstate` on `window`: `id = location.hash.slice(1) || 'about'`; `el = getElementById(id)`; `FH.go(el && (el is a page || pageOf(el)) ? el : 'about', {noHistory: true})`. Back and Forward therefore play the full curtain (or the instant path with reduced motion), reset scroll to the top, and scroll to an anchor if the entry was one. There is no `hashchange` listener and no `replaceState`.

##### `scrollIntoView` patch (L4725-4727)
`Element.prototype.scrollIntoView` is replaced: if the element is inside a page that is not `FH.current`, call `FH.go(this)` (options ignored); else call the native method. Current callers: contact.js L5749 (form field, always the current page) and the fallbacks at L6431 and L6611 (never used because `FH.go` and `FH.scrollToEl` exist). It is a safety net only.

##### Initial page (L4728-4730)
`id = location.hash.slice(1)`; `el = id && getElementById(id)`; `page` = the page of `el` (or `null`). `show(page || 'about')`. If `el` is an element inside a page (not the page itself): `setTimeout(() => FH.scrollToEl(el), 1600)` (a fixed delay, not tied to the preloader). No history entry is written. This first `show()` runs inside the core, before any page script has added its `fh:page` listener, so page scripts read `FH.current` themselves (11.2.23).

##### Events fired to page scripts
| Event | Target | Detail | When |
|---|---|---|---|
| `fh:page` | `document` | page id | every `show()`: once at boot (no listeners yet), then at T = 560ms of each curtain, or at once on the instant path |
| `resize` (synthetic `Event`) | `window` | none | one frame after every `show()` |
| `fh:theme` | `document` | `'light'` or `'dark'` | every `FH.setTheme` (no listeners) |
| `fh:open`, `fh:close` | the modal element | none | `FH.openModal`, `FH.closeModal` (11.2.11) |

- **Pauses or skips when:** reduced motion (no curtain, instant show and jump); `busy` (other page requests dropped); inside an iframe (no `pushState`).
- **Cleanup in React:** remove the capture click listener and `popstate` listener; clear all three timers on unmount.
- **Port as:** `src/components/providers/TransitionProvider.tsx` (state machine and API), `src/hooks/usePageTransition.ts` (page subscriptions), `src/components/layout/Curtain.tsx` (markup and class switching). See "Porting plan for Next.js".

#### 11.2.15 Next page links (JS L4732-4736, CSS L335-347)

- **Name and lines:** auto injected Next page links, L4733-4736.
- **Starts when:** core script run (before `DOMContentLoaded`), once. Each page element gets ONE `div.wrap` appended as its LAST child (after all page content, inside the section; the footer is outside the pages).
- **Markup (exact string, L4735), shown for the About page:**
  ```html
  <div class="wrap"><nav class="page-next" aria-label="Next page" data-reveal><a href="#profile"><div class="page-next__top"><span class="label">Next page · 02</span><span class="label">1 / 5</span></div><div class="page-next__title"><span class="page-next__word">Profi<span class="serif">le</span></span><span class="page-next__arrow"><svg class="i"><use href="#i-arrow-right"/></svg></span></div><div class="page-next__line"></div></a></nav></div>
  ```
  - `nx = PAGES[(i + 1) % 5]`, `last = i === 4`.
  - Left label: `(last ? 'Back to the start' : 'Next page') + ' · ' + META[nx].n` (the TARGET page number).
  - Right label: `(i + 1) + ' / 5'` (the CURRENT page position, one digit each side).
  - Title: `META[nx].t.slice(0, -2)` then `<span class="serif">` + the last two letters.
  - The arrow SVG has no `aria-hidden`. The `nav` has `aria-label="Next page"` on every page, including the last one.

| Page | `href` | Left label | Right label | Word (plain + serif) |
|---|---|---|---|---|
| about | `#profile` | `Next page · 02` | `1 / 5` | `Profi` + `le` |
| profile | `#works` | `Next page · 03` | `2 / 5` | `Wor` + `ks` |
| works | `#approvals` | `Next page · 04` | `3 / 5` | `Approva` + `ls` |
| approvals | `#contact` | `Next page · 05` | `4 / 5` | `Conta` + `ct` |
| contact | `#about` | `Back to the start · 01` | `5 / 5` | `Abo` + `ut` |

- **Placement:** each page root ends with bottom padding `clamp(8px,2vw,24px)` (`#contact.section` L821, `#profile.pf` L1579, `#works.wk-sec,#approvals.wk-sec` L2049); About has none (`#about{position:relative}` L369). The link sits right above the footer.
- **CSS (exact):**
  - `.page-next{display:block;position:relative;padding:clamp(56px,9vw,120px) 0 clamp(40px,6vw,72px);border-top:1px solid var(--line);margin-top:clamp(40px,6vw,80px)}`
  - `.page-next a{display:grid;gap:14px;color:var(--ink)}`
  - `.page-next__top{display:flex;justify-content:space-between;align-items:center;gap:12px}`; the labels use `.label` (L121): `font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500` (`--fs-label:.72rem`), so they render upper case ("NEXT PAGE · 02").
  - `.page-next__title{position:relative;display:flex;align-items:center;gap:clamp(12px,2vw,28px);font-size:clamp(3rem,11vw,10rem);font-weight:800;letter-spacing:-.055em;line-height:.95}`
  - `.page-next__word{position:relative;color:transparent;-webkit-text-stroke:1.2px var(--line-strong);background:var(--grad-glow);-webkit-background-clip:text;background-clip:text;background-size:0% 100%;background-repeat:no-repeat;transition:background-size 1s var(--ease-out),-webkit-text-stroke-color .6s}` (outlined text)
  - `.page-next__word .serif{font-weight:400}` (the `.serif` helper L118 adds `font-family:var(--font-serif);font-style:italic;letter-spacing:-.01em`)
  - `.page-next a:hover .page-next__word,.page-next a:focus-visible .page-next__word{background-size:100% 100%;-webkit-text-stroke-color:transparent}` (gradient fills the word left to right)
  - `.page-next__arrow{width:clamp(56px,8vw,120px);height:clamp(56px,8vw,120px);flex:none;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);transition:transform .8s var(--ease-out),background-color .5s,color .5s,border-color .5s}`, `.page-next__arrow .i{width:40%;height:40%}`
  - `.page-next a:hover .page-next__arrow{transform:rotate(-45deg);background:var(--grad);color:#fff;border-color:transparent}`
  - `.page-next__line{height:1px;background:var(--line-strong);transform-origin:0 50%;transform:scaleX(.08);transition:transform 1.1s var(--ease-out)}`, `.page-next a:hover .page-next__line{transform:scaleX(1)}`
- **Interactions:** hover fills the word, turns the arrow -45deg into a filled gradient disc and draws the line full width. Keyboard focus (`:focus-visible`) fills the word only (arrow and line do not react) plus the global focus ring (`outline:2px solid var(--accent);outline-offset:3px;border-radius:6px`, L106). Click is routed by the router (page change with the curtain).
- **Animation:** reveal `data-reveal` (empty, so the "up" variant: 26px rise, blur 6px, .9s). Observed by `FH.observe(document)` like every other reveal, so it reveals once.
- **Responsive:** no media queries; only the `clamp()` values scale.
- **Pauses or skips when:** never (static markup; its reveal follows 11.2.5, so with reduced motion it is shown at once).
- **Cleanup in React:** none.
- **Port as:** `src/components/layout/NextPageLink.tsx` taking the current page id, rendered as the last child of every page root, with `next/link` to the next route; data from `pages` in `src/content/site.ts` (11.2.24). Keep `aria-label="Next page"`, the `·` characters and the exact label strings.

#### 11.2.16 Smooth wheel scrolling (JS L4738-4758, CSS L95, L298)

- **Name and lines:** smooth wheel IIFE L4739-4758.
- **Starts when:** core script run, only if `!reduce && fine` (`(prefers-reduced-motion: reduce)` false and `(pointer:fine)` true, both read once). Width does not matter: a fine pointer at any width gets it. Adds `html.smooth-on` (CSS L298 `html.smooth-on{scroll-behavior:auto}` cancels `html{scroll-behavior:smooth}` from L95).
- **State:** `cur = scrollY`, `tgt = scrollY`, `run = false`.
- **`max()`:** `document.documentElement.scrollHeight - innerHeight` (read on every wheel, so page height changes are picked up).
- **Wheel listener** (`window`, `{passive:false}`, L4748-4754):
  1. Return (native scroll) if `e.ctrlKey` (pinch zoom), if `body.modal-open` (modals scroll natively), or if `Math.abs(e.deltaX) > Math.abs(e.deltaY)` (horizontal gesture).
  2. Return (native) if `canScroll(e.target, e.deltaY)`.
  3. `e.preventDefault()`; if not running, `cur = scrollY`.
  4. `d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1)` (lines are 32px, pages are one viewport).
  5. `tgt = Math.max(0, Math.min(max(), tgt + d))`; start the loop.
- **`canScroll(el, dy)`** (L4744-4745): walk from the wheel target up to (not including) `body` or `html`:
  - an element with `data-native-scroll` returns `true` at once (native scroll even when that element is already at its end; any chaining to the page is then native, not lerped);
  - an element whose computed `overflowY` matches `/(auto|scroll)/` and that has `scrollHeight > clientHeight + 1` returns `true` if it can still move in the wheel direction (`dy < 0 && scrollTop > 0`, or `dy > 0 && scrollTop + clientHeight < scrollHeight - 1`); at its end the walk continues upward, so the page takes over.
  - `data-native-scroll` is set by contact.js on the booking panel `.ct-bk__panel` (L5794) and the chat panel `#ct-chat-panel` (L6470). The chat log `.ct-chat__log` (`overflow-y:auto`, L1496) is also caught by the overflow test.
  - The works certificate rail handles Shift + wheel itself and calls `e.stopPropagation()` (L7232-7235), so the window listener never sees those events.
- **Loop** (L4746): `cur += (tgt - cur) * .11`; if `Math.abs(tgt - cur) < .4` then `cur = tgt` and stop; `window.scrollTo(0, cur)`; next frame while running. Lerp factor `.11` per frame (frame rate dependent, not time based).
- **Native scroll sync** (L4755): `scroll` listener (passive): when not running, `cur = tgt = scrollY` (keyboard, scrollbar drag, find in page, programmatic jumps).
- **`FH._smoothTo(y)`** (L4756): `cur = scrollY; tgt = clamp(y, 0, max()); kick()`. Used by `FH.scrollToEl` and same page `FH.go` to top.
- **`FH._smoothReset()`** (L4757): `run = false; cur = tgt = scrollY` (called by `jumpTop` on page change).
- **Keyboard:** not intercepted. Arrow keys, Space, Page Up/Down, Home and End scroll natively; with `.smooth-on` the CSS `scroll-behavior` is `auto`.
- **Anchors:** every `a[href^="#"]` is routed through `FH.go` or `FH.scrollToEl`, which use `_smoothTo`, so anchor scrolls get the same lerp.
- **Touch and coarse pointers:** nothing is set up; the page scrolls natively and `html{scroll-behavior:smooth}` stays on (so `FH.scrollToEl` uses `window.scrollTo({behavior:'smooth'})`).
- **Pauses or skips when:** reduced motion, not a fine pointer (never set up); modal open, ctrl or horizontal wheel, inner scrollable area (per event).
- **Cleanup in React:** remove the wheel and scroll listeners, cancel the rAF, remove `html.smooth-on`.
- **Port as:** `src/hooks/useSmoothScroll.ts`, mounted ONCE in the app shell, exposing `smoothTo(y)` and `smoothReset()` through a small context (or module singleton) for `scrollToEl` and the transition provider. Keep `data-native-scroll` as the opt out attribute. Do not use a smooth scroll library (it would change the feel).

#### 11.2.17 Parallax (JS L4760-4770, CSS L349-350)

- **Name and lines:** parallax IIFE L4761-4770, `FH._parallax = upd`.
- **Starts when:** core script run, unless `reduce`. Runs on `scroll` (passive) and `resize`, each throttled to one rAF; once at boot (L4781, `DOMContentLoaded`); and one frame after every `show()` (L4685).
- **Reads:** elements matching `.page.is-current [data-parallax], .site > [data-parallax]` (only the current page; the second selector matches nothing in the file); `innerHeight`; each element's `getBoundingClientRect()`.
- **Logic per element:** skip if `r.bottom < -200 || r.top > vh + 200`; `sp = parseFloat(el.dataset.parallax) || .1`; `off = (r.top + r.height / 2 - vh / 2) * -sp`.
- **Writes:** `el.style.translate = '0 ' + off.toFixed(1) + 'px'`. It uses the individual `translate` property, NOT `transform`, so it adds to the element's own `transform`, `scale` and Web Animations.
- **CSS:** `[data-parallax]{will-change:transform}` (L350).
- **Elements (2):**

| Line | Element | Value | Stacks with |
|---|---|---|---|
| L3207 | `svg.ab-kc__orbit` in the About bento "Open to Work" card | `-0.08` | `scale` on card hover (`transition:scale 1.2s var(--ease-out)`, hover `scale:1.06`, L597-598) |
| L3337 | `span.ab-carousel__mark.serif` (the big quote mark in the testimonials carousel) | `0.07` | about.js Web Animation with `composite:'add'` on each slide change (L5125-5126) |

- **Measure trap:** the rect already includes the previous `translate`, so each pass measures the shifted position (a small feedback). Port it the same way (measure with `getBoundingClientRect()` while the translate is applied) to get the same numbers.
- **Pauses or skips when:** reduced motion (never set up; `FH._parallax` is undefined). Elements outside the 200px margin keep their last value. Not pointer or tab aware.
- **Cleanup in React:** remove listeners, cancel the rAF.
- **Port as:** `src/hooks/useParallax.ts` (`useParallax(ref, speed)`) sharing ONE rAF throttled scroll and resize subscription in the app shell, plus a `refresh()` the transition provider calls one frame after a page shows. Write `style.translate`, never `style.transform`.

#### 11.2.18 Cursor glow (JS L4772-4775, CSS L208-210, L361)

- **Name and lines:** `cursor()`, L4773-4775.
- **Starts when:** called once from the boot callback (`DOMContentLoaded`, L4781). Returns at once if `!fine || reduce`.
- **Reads:** `#cursorGlow`; start `x = tx = innerWidth / 2`, `y = ty = innerHeight / 2`; `pointermove` on `window` (passive): `tx = e.clientX`, `ty = e.clientY`, and `document.documentElement.classList.add('has-pointer')`.
- **Writes:** every frame, forever: `x = FH.lerp(x, tx, .08)`, `y = FH.lerp(y, ty, .08)`, `g.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'`. On the first move the glow fades in (0 to 1 over .8s) while it glides from the viewport centre to the pointer.
- **CSS (exact):** `.cursor-glow{position:fixed;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,var(--accent-soft),transparent 60%);opacity:0;transition:opacity .8s var(--ease-out);will-change:transform}`, `.has-pointer .cursor-glow{opacity:1}`; reduced motion: `.cursor-glow{display:none}` (L361). `--accent-soft` is `rgba(16,185,129,.12)` light, `rgba(52,211,153,.12)` dark. Stacking: `.ambient` and the glow are `z-index:0`, `.site` is `position:relative;z-index:1`, so the glow sits behind the content.
- **Timings:** lerp `.08` per frame; opacity .8s `--ease-out`.
- **Pauses or skips when:** not a fine pointer or reduced motion (never starts). The loop never stops by itself (the browser pauses rAF in a hidden tab). `has-pointer` is never removed.
- **Cleanup in React:** cancel the rAF and remove the listener on unmount.
- **Port as:** `src/components/layout/CursorGlow.tsx` (renders `<div class="cursor-glow" id="cursorGlow" aria-hidden="true">`, runs the loop in `useEffect`). Stopping the loop once `|tx - x|` and `|ty - y|` are both under .05 and restarting it on the next `pointermove` gives the same pixels and saves battery.

#### 11.2.19 Preloader and `html.is-loaded` (JS L4777-4784, CSS L252-264, markup L2949-2954)

- **Name and lines:** boot callback L4779-4784, `done()` L4782.
- **First load only:** the preloader is in the static markup, visible from the first paint (z-index 100, above everything). It runs once per full page load; later page changes use the curtain. `done()` is never undone.
- **CSS animations while it shows (start at first paint, not JS driven):**
  - Ring: `.preloader .pl-ring{stroke:var(--line-strong);stroke-width:2;fill:none}`.
  - Arc: `.preloader .pl-arc{stroke:url(#pl-g);stroke-width:2.5;fill:none;stroke-linecap:round;stroke-dasharray:252;stroke-dashoffset:252;animation:fh-draw 1.1s var(--ease-io) forwards}` with `@keyframes fh-draw{to{stroke-dashoffset:0}}` (the circle is drawn from 12 o'clock, `transform="rotate(-90 45 45)"`, 0 to 1100ms).
  - "FH": `.preloader .pl-txt{font:800 26px var(--font-sans);fill:var(--ink);letter-spacing:-1px;opacity:0;animation:fh-fade .6s .35s var(--ease-out) forwards}` (350 to 950ms).
  - Label "Faisal Hanif · Portfolio": `.preloader .label{opacity:0;animation:fh-fade .6s .5s var(--ease-out) forwards}` (500 to 1100ms), `@keyframes fh-fade{to{opacity:1}}`.
  - Layout: `.preloader{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:var(--bg);transition:clip-path 1s var(--ease-io),visibility 0s 1s;clip-path:inset(0 0 0 0)}`, `.preloader__mark{display:grid;justify-items:center;gap:18px}`, `.preloader svg{width:84px;height:84px}`. The label also has `.label` styles (mono, .72rem, upper case, muted).
- **JS timing:** at `DOMContentLoaded`: `onScroll()`, `cursor()`, `FH._parallax()`, then `setTimeout(done, 1250)` (or `done()` at once with reduced motion). The 1250ms counts from `DOMContentLoaded`, not from the first paint; it does not wait for images or fonts (`load` is never used).
- **`done()` writes:** `#preloader.classList.add('is-done')`; `document.documentElement.classList.add('is-loaded')`; then `setTimeout(() => { FH.observe(document); FH.bind(document) }, reduce ? 0 : 250)`.
- **Exit:** `.preloader.is-done{clip-path:inset(0 0 100% 0);visibility:hidden}`: the bottom inset grows to 100% over 1s `--ease-io`, so the sheet is wiped upward (its bottom edge rises to the top); `visibility` flips to hidden after 1s (`visibility 0s 1s`). The element stays in the DOM.
- **Who waits for `is-loaded`:** CSS `.is-loaded #about .ab-scroll{opacity:1}` (L513); about.js L4942-4950 (MutationObserver on `<html>` class); contact.js L5628 (reads it once); profile.js L6503-6505 (polls every 120ms); works.js L7276-7279 (polls every 50ms and runs anyway on the 81st tick, about 4050ms). See 11.2.22.
- **Reduced motion:** `done()` runs at `DOMContentLoaded`; the global rule shrinks all transitions and animations to .001ms, so the preloader disappears at once.
- **Pauses or skips when:** never skipped (also shows on reduced motion, for an instant).
- **Cleanup in React:** clear the 1250ms and 250ms timers.
- **Port as:** `src/components/layout/Preloader.tsx`, server rendered in the root layout so it covers the first paint (with the `.js` class set by the inline head script, see Porting plan), plus a `useBoot()` in `AppShell.tsx` that runs the 1250ms timer after hydration (the closest match to `DOMContentLoaded`), sets `is-done` and `html.is-loaded`, and flips a `motionReady` flag 250ms later for the reveal and bind hooks. Never render it again on client navigation.

#### 11.2.20 Ambient background (CSS L193-207, markup L2963-2969)

- CSS only; no JS reads or writes it.
- `.ambient{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}`
- `.ambient__blob{position:absolute;border-radius:50%;filter:blur(80px);will-change:transform}`
- `.ambient__blob--a{width:52vmax;height:52vmax;left:-14vmax;top:-18vmax;background:radial-gradient(circle,var(--blob-a),transparent 65%);animation:fh-drift-a 38s var(--ease-io) infinite alternate}`
- `.ambient__blob--b{width:46vmax;height:46vmax;right:-16vmax;top:18vh;background:radial-gradient(circle,var(--blob-b),transparent 65%);animation:fh-drift-b 44s var(--ease-io) infinite alternate}`
- `.ambient__blob--c{width:40vmax;height:40vmax;left:28vw;bottom:-22vmax;background:radial-gradient(circle,var(--blob-c),transparent 65%);animation:fh-drift-c 50s var(--ease-io) infinite alternate}`
- `@keyframes fh-drift-a{to{transform:translate3d(10vw,8vh,0) scale(1.08)}}`, `@keyframes fh-drift-b{to{transform:translate3d(-8vw,-6vh,0) scale(.92)}}`, `@keyframes fh-drift-c{to{transform:translate3d(-6vw,-10vh,0) scale(1.1)}}`
- `.ambient__grid{position:absolute;inset:0;background-image:radial-gradient(var(--dot) 1px,transparent 1.2px);background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 80%);mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 80%)}`
- `.ambient__grain{position:absolute;inset:-50%;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`, dark `[data-theme="dark"] .ambient__grain{opacity:.07}`
- Tokens: light `--blob-a:rgba(16,185,129,.22)`, `--blob-b:rgba(14,102,85,.20)`, `--blob-c:rgba(95,207,159,.20)`, `--dot:rgba(15,76,65,.10)`; dark `--blob-a:rgba(16,185,129,.16)`, `--blob-b:rgba(14,102,85,.26)`, `--blob-c:rgba(52,211,153,.10)`, `--dot:rgba(160,230,205,.07)`.
- Reduced motion: animations become `.001ms` with one iteration and no fill mode, so the blobs rest at their start position.
- **Port as:** `src/components/layout/AmbientBackground.tsx` (static markup, server component) with the CSS copied into `layout.css`.

#### 11.2.21 Global reduced motion and motion tokens (CSS L63-66, L356-362)

- Tokens: `--ease-out:cubic-bezier(.22,1,.36,1)`, `--ease-io:cubic-bezier(.65,0,.35,1)`, `--ease-soft:cubic-bezier(.33,1,.68,1)`, `--dur-1:.35s`, `--dur-2:.6s`, `--dur-3:.9s`, `--dur-4:1.2s`.
- Reduced motion block (exact):
  ```css
  @media (prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
    .js [data-reveal]{opacity:1!important;transform:none!important;filter:none!important;clip-path:none!important}
    .w>span{transform:none!important}
    .cursor-glow{display:none}
  }
  ```
- JS side, `FH.reduce` (read once) switches off: the curtain (instant page swap), smooth wheel scrolling, parallax, cursor glow, magnetic, tilt, the theme circular reveal, counters (final value at once), reveal observation (all `.is-in` at once), and it makes `FH.scrollToEl` jump (`behavior:'auto'`) instead of glide. The preloader still runs `done()`, at once.
- Not switched off: spotlight tracking, scroll progress, top bar state, toast, modals (their CSS transitions are shortened by the rule above).
- **Port as:** `src/hooks/useReducedMotion.ts`. To match the reference exactly, read the media query ONCE at start (the reference never listens for changes). Listening for changes is an improvement the owner may approve (see questions).

#### 11.2.22 How pages time their hero entrances against the preloader and the curtain

The core gives pages three signals: `FH.current` (at script run), `html.is-loaded` (first load) and `fh:page` plus the curtain classes (every later show). Each page part is mapped in its own section; this table only shows the timing contract the transition provider must reproduce.

| Page script | First load (the page is `FH.current` when the script runs) | Every later show (`fh:page` with its id) | When another page shows |
|---|---|---|---|
| about.js | orb intro: `intro(0)` if `is-loaded` is already set, else `intro(null)` (holds `.is-pre`) and a MutationObserver on `<html>` class calls `intro(120)` once `is-loaded` appears (L4941-4951) | `pageFns` run with `on = true`: `measure(); markHidden(); intro(FH.reduce ? 0 : 480)` (L4953), plus re-measure hooks (L4992, L5058, L5100, L5160, L5170) | `pageFns` with `on = false`: orb back to `.is-pre`, loops paused |
| contact.js | `play(is-loaded ? 120 : 1320)` (L5628; 1320 is a fixed guess, not a wait) | `lastP = -1; fit(); exit(); play(600)` then `sync()` (L5623-5626) | `reset()` and `sync()` (stops the globe loop) |
| profile.js | `resetHero()`, then `whenLoaded` (polls `is-loaded` every 120ms) and `setTimeout(playHero, reduce ? 0 : 120)` (L6845-6848) | `resetHero()`, re-layout next frame, then `reduce ? playHero() : afterCurtain(playHero)` (L6834-6844). `afterCurtain` = 150ms after the curtain stops covering (`is-out` added, T = 700), fallback 1600ms (L6552-6560) | `clearPlay()` |
| works.js (works and approvals heroes, `sync:true`) | `whenLoaded` (polls every 50ms, runs anyway after about 4050ms) then `enter(90)` (L7310) | with `sync` and no reduced motion: reset now, then `afterCurtain(() => enter(0))` = 120ms after the lift, fallback 1800ms (L7305, L7313-7321); else `enter(curtain is-on ? 340 : 60)` | hero `is-on` removed, loops idle (L7307) |
| works.js (filters) | not applicable | works: `setTimeout(pFilter.sync, 30)`; approvals: `setTimeout(() => { cFilter.sync(); rail.dispatchEvent(new Event('scroll')) }, 30)` (L7586-7589) | nothing |

So, measured from the click: About's orb intro starts at 560 + 480 = 1040ms (only if the orb is in view, else when it scrolls in), Contact's at 560 + 600 = 1160ms, Profile's at 700 + 150 = 850ms, Works' and Approvals' at 700 + 120 = 820ms. Hero entrances REPLAY on every show; scroll reveals do not (11.2.5).

#### 11.2.23 Public API that page scripts rely on (grep of L4787-7616)

How each script gets the core: about.js `var FH = window.FH || {}` (L4792); contact.js `var FH = window.FH = window.FH || {}` (L5179, creates it if missing); profile.js `var FH = window.FH || {}` (L6493); works.js `var FH = window.FH; if(!FH) return;` (L6856). Every script also defines its own `$`/`$$` helpers; only works.js uses `FH.$$`.

##### about.js (L4787-5174)
| Uses | Lines |
|---|---|
| `FH.reduce` | L4797, L4953 |
| `FH.fine` | L4798 |
| `FH.current` (`isCur()` = `!FH.current \|\| FH.current==='about'`) | L4800 |
| `fh:page` listener (drives `pageFns`) | L4803 |
| `FH.asset('imgs/Faisal-CVS.pdf')` for `[data-cv]` | L4807 |
| `FH.toast` | L5016, L5018, L5019 |
| `html.is-loaded` (read and MutationObserver) | L4943, L4947 |
| synthetic `resize` after a show (listeners) | L4958, L4991, L5055, L5099 |

##### contact.js (L5175-6488)
| Uses | Lines |
|---|---|
| `FH.reduce` | L5182 |
| `window.FH_HOOKS` | L5186 |
| `FH.toast` (wrapped in `toast()`) | L5187 |
| `FH.split` on `#ct-title` | L5565 |
| `FH.current` | L5586, L5615, L5628, L6430 |
| `fh:page` listener | L5623 |
| `html.is-loaded` (read once) | L5628 |
| patched `scrollIntoView` (form errors) | L5749 |
| `data-native-scroll` on the booking panel and the chat panel (for smooth scrolling) | L5794, L6470 |
| DEFINES `FH.openBooking(type)` | L6166-6172 |
| `FH.openModal('booking')` | L6170 |
| `FH.asset('imgs/Faisal-CVS.pdf')` | L6182 |
| `FH.pageOf`, `FH.go` (chat actions; waits `reduce ? 60 : (cross page ? 2700 : 900)` ms before its follow up, L6432) | L6430, L6431 |
| `FH.openBooking` (chat "book" action) | L6435 |
| `FH.fine` (chat focus target) | L6460 |
| reads `.fh-modal.is-open` (chat Esc and nudge yield to modals) | L6472, L6480 |
| DEFINES `FH.openChat`, `FH.closeChat` | L6473 |
| synthetic `resize` listener | L5602 |

##### profile.js (L6489-6851)
| Uses | Lines |
|---|---|
| `FH.reduce` | L6496 |
| `FH.current` (`onPage()`) | L6501, L6845 |
| `html.is-loaded` (poll every 120ms) | L6504 |
| `#curtain` classes `is-on` / `is-out` (MutationObserver, "afterCurtain") | L6553-6559 |
| `FH.fine` | L6580, L6807 |
| `FH.scrollToEl` | L6611 |
| `FH.asset('imgs/Faisal-CVS.pdf')` for `.pf-cv` | L6623 |
| claims hash link clicks with `e.preventDefault()` (router `handled` contract) | L6626 |
| `fh:page` listener | L6834 |
| synthetic `resize` listeners | L6631, L6713, L6779 |

##### works.js (L6852-7616)
| Uses | Lines |
|---|---|
| `FH.asset` (images, CV, videos) | L6944, L7573, L7605 |
| `FH.$$` | L6956, L7290, L7323, L7333, L7359, L7458, L7596 |
| `FH.reduce` | L6971, L6996, L7178, L7195, L7220, L7245, L7267, L7271, L7293, L7296, L7305, L7372, L7390, L7404, L7490, L7496, L7497, L7519, L7520, L7523, L7537, L7544, L7562, L7579, L7582, L7610 |
| `FH.observe(grid)`, `FH.bind(grid)`, `FH.observe(track)`, `FH.bind(track)` (cards built in JS, at script run) | L7108, L7153 |
| `FH.split` on `.wk-ht` (no such element) | L7282 |
| `FH.current` | L7284, L7296, L7310, L7390, L7562, L7571 |
| `fh:page` listeners | L7303, L7586 |
| `#curtain` classes (`afterCurtain`, and `is-on` to pick 340 or 60ms) | L7304, L7314-7319 |
| `html.is-loaded` (poll every 50ms) | L7277-7278 |
| `FH.scrollToEl` | L7323, L7337, L7347, L7535 |
| `FH.fine` | L7372, L7544 |
| `data-open="purebody"` handled by core click delegation | L7036 |
| `fh:open`, `fh:close` on `#purebody` | L7608, L7612 |
| synthetic `resize` listeners | L6977, L7174, L7571 |

##### Not used by any page script
`FH.onView`, `FH.count` (only via `data-count`), `FH.lerp`, `FH.setTheme`, `FH.setActive`, `FH.closeModal`, `FH.pages`, `FH.ready`, `FH._smoothTo`, `FH._smoothReset`, `FH._parallax`, `fh:theme`, `data-onview`, `data-no-route`.

##### What the React port must offer instead (one place each)
| Reference | React replacement |
|---|---|
| `FH.reduce`, `FH.fine` | `useReducedMotion()`, `useFinePointer()` (`src/hooks/`) |
| `FH.asset(p)` | `asset(p)` in `src/lib/asset.ts` (base `/`, so `asset('imgs/Faisal-CVS.pdf')` gives `/imgs/Faisal-CVS.pdf`) |
| `FH.toast` | `useToast()` |
| `FH.openModal`, `FH.closeModal`, `FH.openBooking`, `FH.openChat`, `FH.closeChat` | `useModal()` / `useBooking()` / `useChat()` from their providers |
| `FH.current`, `FH.pageOf` | `usePageId()` from the route (and the static id to route map) |
| `FH.go`, `FH.scrollToEl` | `useNavigate()` returning `go(target)` and `scrollToEl(el)` from the TransitionProvider |
| `fh:page` | `usePageShow(cb)` (fires when this route's page is shown: first load after `is-loaded`, later at T = 560ms) |
| `#curtain` class watching | `useCurtainLift(cb)` (fires at T = 700ms, or at once when there is no curtain) |
| `html.is-loaded` | `useBootState()` returning `{ loaded, motionReady }` (the class is still set on `<html>` for CSS) |
| synthetic `resize` | keep it: the provider dispatches `window.dispatchEvent(new Event('resize'))` one frame after each show |
| `FH.observe`, `FH.bind` on JS built content | not needed: cards are rendered by React with `<Reveal>` and the hooks |
| `fh:open`, `fh:close` | `onOpen`, `onClose` props of `<Modal>` |

#### 11.2.24 Content data and constants

##### `frontend/src/content/site.ts`
```ts
export type PageId = 'about' | 'profile' | 'works' | 'approvals' | 'contact';

export interface SitePage {
  id: PageId;
  path: '/' | '/profile' | '/works' | '/approvals' | '/contact';
  /** META[id].n (L4675) */
  n: string;
  /** META[id].t (L4675), also the curtain title and the nav label */
  title: string;
  /** document.title (L4683) */
  docTitle: string;
  /** rail and dock icon (L2977-2981, L2996-3000) */
  navIcon: 'i-user' | 'i-file' | 'i-briefcase' | 'i-trophy' | 'i-chat';
}

export const pages: SitePage[] = [
  { id: 'about', path: '/', n: '01', title: 'About', docTitle: 'Faisal Hanif · Software Engineer', navIcon: 'i-user' },
  { id: 'profile', path: '/profile', n: '02', title: 'Profile', docTitle: 'Profile · Faisal Hanif', navIcon: 'i-file' },
  { id: 'works', path: '/works', n: '03', title: 'Works', docTitle: 'Works · Faisal Hanif', navIcon: 'i-briefcase' },
  { id: 'approvals', path: '/approvals', n: '04', title: 'Approvals', docTitle: 'Approvals · Faisal Hanif', navIcon: 'i-trophy' },
  { id: 'contact', path: '/contact', n: '05', title: 'Contact', docTitle: 'Contact · Faisal Hanif', navIcon: 'i-chat' },
];

/** Curtain label (L4701): `${n} / 05` */
export const curtainNum = (p: SitePage): string => `${p.n} / 05`;

export interface NextPageLinkData {
  from: PageId;
  to: PageId;
  /** left label, L4735 */
  label: string;
  /** right label, L4735: position of the CURRENT page */
  position: string;
  /** META[to].t.slice(0, -2) */
  wordHead: string;
  /** META[to].t.slice(-2), wrapped in span.serif */
  wordTail: string;
}

export const nextPageLinks: NextPageLinkData[] = [
  { from: 'about', to: 'profile', label: 'Next page · 02', position: '1 / 5', wordHead: 'Profi', wordTail: 'le' },
  { from: 'profile', to: 'works', label: 'Next page · 03', position: '2 / 5', wordHead: 'Wor', wordTail: 'ks' },
  { from: 'works', to: 'approvals', label: 'Next page · 04', position: '3 / 5', wordHead: 'Approva', wordTail: 'ls' },
  { from: 'approvals', to: 'contact', label: 'Next page · 05', position: '4 / 5', wordHead: 'Conta', wordTail: 'ct' },
  { from: 'contact', to: 'about', label: 'Back to the start · 01', position: '5 / 5', wordHead: 'Abo', wordTail: 'ut' },
];

/**
 * Old hash links (/#id) and in-page anchors: which route owns each id that the
 * reference links to (L2974-L4233, L6207-6208). Page ids map to themselves.
 * The reference routes ANY id to its page; see Notes and traps.
 */
export const anchorPage: Record<string, PageId> = {
  about: 'about',
  profile: 'profile',
  works: 'works',
  approvals: 'approvals',
  contact: 'contact',
  'ab-know': 'about',
  'pf-exp': 'profile',
  'pf-edu-bs': 'profile',
  'pf-role-techxelo': 'profile',
  'pf-skills': 'profile',
  'wk-toolbar': 'works',
  'wk-ap-toolbar': 'approvals',
  'ct-form': 'contact',
  'ct-ways': 'contact',
};

/** Preloader copy (L2951-2952) */
export const preloader = { mark: 'FH', label: 'Faisal Hanif · Portfolio' } as const;
```

##### `frontend/src/lib/motion.ts` (constants copied from the core, never round them)
```ts
export const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
export const EASE_IO = 'cubic-bezier(.65,0,.35,1)';

export const PRELOADER_HOLD_MS = 1250;        // L4783
export const OBSERVE_AFTER_LOAD_MS = 250;     // L4782 (0 with reduced motion)
export const REVEAL_IO: IntersectionObserverInit = { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }; // L4596
export const STAGGER_DEFAULT_MS = 70;         // L4600
export const SPLIT_STEP_MS = 55;              // L4581, L4585
export const COUNT_DEFAULT_MS = 1600;         // L4615
export const MAGNETIC_DEFAULT = 0.25;         // L4629
export const TILT_DEFAULT_DEG = 5;            // L4633
export const TILT_PERSPECTIVE_PX = 900;       // L4634
export const THEME_KEY = 'fh-theme';          // L14, L4639
export const THEME_COLOR = { light: '#0e6655', dark: '#050f0c' } as const; // L4640
export const THEME_REVEAL = { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)' } as const; // L4646
export const MODAL_FOCUS_MS = 60;             // L4652
export const TOAST_MS = 3200;                 // L4663
export const TOPBAR_SCROLLED_PX = 12;         // L4667
export const SCROLL_OFFSET = { mobile: 84, desktop: 32, breakpoint: 1024 } as const; // L4687
export const CURTAIN = { cover: 560, hold: 140, reveal: 640 } as const; // L4704-4710
export const INSTANT_ANCHOR_MS = 60;          // L4698
export const INITIAL_ANCHOR_MS = 1600;        // L4730
export const SMOOTH_LERP = 0.11;              // L4746
export const SMOOTH_STOP_PX = 0.4;            // L4746
export const WHEEL_LINE_PX = 32;              // L4752
export const PARALLAX_DEFAULT = 0.1;          // L4765
export const PARALLAX_MARGIN_PX = 200;        // L4765
export const CURSOR_LERP = 0.08;              // L4775
```

#### Porting plan for Next.js

##### Routes and files
| Route | File | Page root rendered by the page (last child is `<NextPageLink from=...>`) |
|---|---|---|
| `/` (About) | `src/app/page.tsx` | `<section id="about" class="ab page is-current" data-page="about" aria-labelledby="ab-name">` |
| `/profile` | `src/app/profile/page.tsx` | `<section id="profile" class="section pf page is-current" data-page="profile" aria-labelledby="pf-title">` |
| `/works` | `src/app/works/page.tsx` | `<section id="works" class="section wk-sec page is-current" data-page="works" aria-labelledby="wk-title">` |
| `/approvals` | `src/app/approvals/page.tsx` | `<section id="approvals" class="section wk-sec wk-ap page is-current" data-page="approvals" aria-labelledby="wk-ap-title">` |
| `/contact` | `src/app/contact/page.tsx` | `<section class="section ct page is-current" id="contact" data-page="contact" aria-labelledby="ct-title">` |

Keep the ids, `page`, `is-current` and `data-page` so the page CSS (`#about ...`, `.page.is-current [data-parallax]`) ports unchanged. Each route sets `metadata.title` to its `docTitle` (11.2.24).

`src/app/layout.tsx` (server component) renders, in this order, the same shell as the reference: IconSprite, `<Preloader>`, `<Curtain>`, progress bar, `<AmbientBackground>`, `<CursorGlow>`, Rail, TopBar, Dock, `<main class="site" id="site">{children}<Footer/></main>`, booking modal, chat, PureBody modal, `<Toast>`, all wrapped in the client providers (`ThemeProvider`, `ToastProvider`, `ModalProvider`, `TransitionProvider`, `AppShell`). Everything outside `{children}` persists across routes, as the reference shell does.

Head inline script (before paint, one `<script>` in `<head>`): the theme boot from L12-16 exactly, plus `document.documentElement.classList.add('js')` (L2881). `<html lang="en" data-theme="light" suppressHydrationWarning>`. Add `js`, `is-loaded`, `smooth-on` and `has-pointer` with `document.documentElement.classList` only, never through a React `className` prop on `<html>`, so React never wipes them.

##### TransitionProvider (`src/components/providers/TransitionProvider.tsx`), the old router
State machine: `idle -> covering (0 to 560) -> swapping (router.push, wait for commit) -> holding (140) -> revealing (640) -> idle`. A `busy` ref blocks new page changes while not idle (same page scrolls are still allowed, as in the reference).

1. **Intercept link clicks.**
   - Authored links use `src/components/ui/TransitionLink.tsx`: `next/link` with `onNavigate={(e) => { e.preventDefault(); go(href) }}` (keeps prefetching; `onNavigate` is not called for Cmd, Ctrl or Shift clicks or `download` links, so those keep browser behaviour like the reference).
   - A `window` click listener in CAPTURE phase copies L4713-4723 for raw `a[href^="#"]` (chat answers render `#` links, and any authored hash link): same button and modifier test, always `preventDefault()`, the `e.preventDefault` "claim" wrapper, blur rail links after a mouse click, honour `data-no-route`, then after `setTimeout(0)` call `go()`. A hash naming a page or an id in `anchorPage` for another route becomes a route change; an id on the current route becomes `scrollToEl`.
2. **`go(target)`** (port of `FH.go`): resolve to `{ path, anchorId }`.
   - Close open modals (`closeModal()` when one is open).
   - Same route: `scrollToEl(anchor)` or smooth to 0, and `history.pushState(null, '', path + '#' + anchorId)` when there is an anchor (the reference pushes `#ab-know` and so on; profile sheet clicks push nothing because they claim the click).
   - Reduced motion: `router.push(path, { scroll: false })`, jump to top on commit, anchor after 60ms. No curtain.
   - Else the curtain sequence below.
3. **Curtain sequence** (exact reference timings, driving `Curtain.tsx` classes):
   - T = 0: set label (`curtainNum(page)`, `title`); classes `is-on`, force reflow, then `is-in`; set `leaving` so the current page root gets `.is-leaving`.
   - T = 560: `router.push(path, { scroll: false })` (all five routes are prefetched at boot with `router.prefetch`, so the commit is near instant). When `usePathname()` reports the new path (commit): `jumpTop()` (inline `scroll-behavior:auto`, `scrollTo(0,0)`, restore, `smoothReset()`), mark the page shown, and one frame later `window.dispatchEvent(new Event('resize'))` and `parallax.refresh()`.
   - Commit + 140ms: add `is-out`, remove `is-in`; fire the "curtain lift" signal.
   - + 640ms: remove `is-on` and `is-out`, clear `busy`, then `scrollToEl(anchor)` if there is one.
   - If the commit is slow, the curtain simply stays covered until it lands; the 140 and 640 are counted from the commit.
4. **Back and Forward.** The reference plays the full curtain on `popstate` (L4724) and jumps to the top. Recommended: a `popstate` listener on `window` with `{ capture: true }` (runs before the App Router's own listener) that stops the event (`stopImmediatePropagation()`), plays the cover (560ms), then re-dispatches `new PopStateEvent('popstate', { state: savedState })` with a pass flag so Next restores the route; on commit run `jumpTop()` (overriding Next's scroll restoration), hold 140, reveal 640, then scroll to the anchor if the URL has one. This relies on how the App Router reads `event.state`, so it needs the Playwright back and forward test in QA_CHECKLIST.md. Fallback if it proves fragile: let Next commit, show the curtain already covering (no cover sweep), `jumpTop()`, then hold 140 and reveal 640 (owner question).
5. **Old hash links.** On first client mount (under the preloader, before it lifts), read `location.hash`:
   - a page id (`#profile`, `#works`, `#approvals`, `#contact`) on `/`: `router.replace('/works', { scroll: false })` (no curtain, like the reference's initial `show()`);
   - `#about` on `/`: `history.replaceState(null, '', '/')`;
   - an id in `anchorPage` that belongs to another route: `router.replace('/profile#pf-exp', { scroll: false })`;
   - an id on the current route: stay;
   - then, as in L4730, `scrollToEl(el)` 1600ms after boot starts when the hash names an element inside the page (not the page itself). Unknown ids: stay on the current route with no scroll (in the reference an unknown id shows About, the default page).
6. **API through context:** `go(target)`, `scrollToEl(el)`, `usePageShow(cb)`, `useCurtainLift(cb)`, `useIsLeaving()`, `useBootState()`.
7. **No global `scrollIntoView` patch.** Page code calls `scrollToEl` or `go` instead (the only cross page caller in the reference is the chat, which already uses `FH.go`).

`src/hooks/usePageTransition.ts` holds the page facing hooks; `src/components/layout/Curtain.tsx` renders the curtain markup from 11.2.2 and receives its classes from the provider state.

##### What each page subscribes to (port of 11.2.22)
| Page | First load (after `useBootState().loaded`) | Later shows (page mounted by a transition) | Leaving |
|---|---|---|---|
| About | orb `intro(120)` when `is-loaded` arrives after mount, `intro(0)` if it was already set | `usePageShow`: measure, `markHidden`, `intro(480)`; re-measure marquee, services progress, carousel and pricing state | unmount cleanup (stop loops, timers) |
| Profile | `resetHero()`, then `playHero` 120ms after `loaded` | `usePageShow`: `resetHero()`, re-layout next frame; `useCurtainLift`: `playHero` after 150ms | unmount (`clearPlay`) |
| Works, Approvals | `enter(90)` after `loaded` | `usePageShow`: reset hero, `--p: 0`; `useCurtainLift`: `enter(0)` after 120ms; filters `sync` 30ms after show (Approvals also re-fires the rail scroll handler) | unmount |
| Contact | `play()` 1320ms after the boot timer starts (about 70ms after `is-loaded`; the reference counts 1320ms from script run, just before `DOMContentLoaded`), `play(120)` if already loaded | `usePageShow`: `fit()`, `exit()`, `play(600)`, `sync()` | unmount (`reset`, stop globe) |

With reduced motion every page plays its end state at once (as each script does with `FH.reduce`).

##### Runs once versus on every page show
| Once per app load (layout level, survives route changes) | On every page show | Once per element per session |
|---|---|---|
| theme boot script and ThemeProvider; `.js` class; preloader and boot timers (`is-loaded` at 1250ms, `motionReady` 250ms later); spotlight document listener; modal click delegation and Esc; toast; scroll progress and top bar listener; smooth wheel scrolling; parallax scroll and resize subscription; cursor glow loop; link interception and `popstate`; chat widget, booking modal, PureBody modal; ambient background | curtain (except first load); scroll to top; closing open modals; active nav and rail indicator (`offsetTop` measured in `useLayoutEffect`); `document.title` (route metadata); synthetic `resize` and parallax refresh one frame after the show; the page's hero entrance (replays every time); page re-measures | scroll reveals, split word rise, `data-count` counters: once revealed they stay revealed. React remounts the page on every visit, so `useReveal` keeps a module level `Set` of revealed keys (`pathname + useId()`, stable across remounts); an element whose key is in the set renders with `is-in` from the first paint (no transition), and a counter renders its final text. Magnetic and tilt bind on mount and unbind on unmount (same result as the reference's one time bind). |

##### Reveal gating
The reveal and bind hooks start observing only when `motionReady` is true (first load: 1250ms + 250ms after boot, 0ms with reduced motion); later pages are observed as soon as they mount, which happens under the curtain at T = 560, so on screen items begin their reveal behind the curtain exactly as in the reference.

#### Notes and traps

1. **Curtain timings are exact:** `setTimeout` 560 (cover), 140 (hold), 640 (reveal), 1340ms in total. The CSS comment at L310 ("~1.1s total") is wrong; the layer transitions end at 560 (cover) and 1300 (reveal), the cleanup is at 1340.
2. **Two numbering formats:** the curtain shows `02 / 05` (two digits, target page), the Next page link shows `Next page · 02` (target) and `1 / 5` (CURRENT page, one digit). Copy both exactly; do not "fix" them to match.
3. **Next page words are split by string slicing:** the last two letters are serif (`Profi`+`le`, `Wor`+`ks`, `Approva`+`ls`, `Conta`+`ct`, `Abo`+`ut`). Keep the data table; do not compute a different split.
4. **Dropped navigation still changes the URL:** `FH.go` pushes the hash BEFORE its `busy` check (L4694 vs L4697), so a second page click during a transition changes the address bar but not the page. In the port the URL changes at T = 560 on `router.push`, so this bug disappears; a dropped click changes nothing.
5. **Same page clicks bypass `busy`:** a same page anchor during a transition scrolls the old page that is about to hide.
6. **"Back to top" is not always back to top:** the footer link (L4233), the rail logo (L2974, `aria-label="Faisal Hanif, back to top"`) and the top bar brand (L2989) all point at `#about`. On About they glide to the top; on any other page they route to About with the curtain. Keep that.
7. **`href="#"` does nothing** (default prevented, empty id). Modified clicks (Cmd, Ctrl, Shift, non primary button) get the browser default; Alt clicks are still routed.
8. **Theme colour meta at boot:** the head script sets `data-theme` but not `<meta name="theme-color">`, so a dark theme visitor keeps `#0e6655` until the first toggle (`#050f0c`). Matching the reference means leaving it; setting it in the boot script is a harmless improvement (owner question).
9. **`FH.closeModal()` restores focus on every call:** Esc with no modal open still calls `lastFocus.focus({preventScroll:true})` (the element focused before the LAST modal opened), and `FH.go` only closes when a modal is open. The port should restore focus only when something actually closed (owner question if strict parity is wanted). No focus trap exists (11.2.11).
10. **`FH.reduce` and `FH.fine` are read once.** Changing the OS setting or plugging in a mouse needs a reload. Smooth scrolling depends on `(pointer:fine)`, not on width: a touch laptop with a trackpad gets it, a desktop window at 390px wide also gets it.
11. **Scroll reset on every page change, including Back:** no scroll position is ever restored. With the App Router, pass `{ scroll: false }` and reset manually, otherwise Next scrolls first (and with `html{scroll-behavior:smooth}` on touch that scroll would be animated).
12. **`jumpTop()` must beat `html{scroll-behavior:smooth}`** on touch devices by setting `style.scrollBehavior = 'auto'` around `scrollTo(0,0)`. On fine pointers `.smooth-on` already sets `auto`.
13. **Scroll offset for anchors is 84px under 1024px and 32px from 1024px**, computed on each call from `innerWidth`. `scroll-padding-top:24px` (L95) never applies because native hash jumps are always prevented.
14. **Initial deep link scroll waits a fixed 1600ms** (L4730), not the preloader; no history entry is written for the first page.
15. **The first `fh:page` fires before any page script listens**, which is why every page script checks `FH.current` itself. In React this is handled by the mount effect of the page.
16. **Synthetic `resize` after every show** (L4685) is part of the contract: many page parts re-measure on `resize` only (listeners at L4958, L4991, L5055, L5099, L5602, L6631, L6713, L6779, L6977, L7174, L7571). Keep dispatching it one frame after the new route mounts.
17. **Hidden pages measure as zero.** In the reference all five pages live in the DOM and the hidden ones are `display:none`; page scripts guard with `FH.current` checks and re-measure on show. In the port only one page is mounted, so those guards become unnecessary, but code copied from the reference must not assume the other pages exist (for example the chat's cross page `goTo` or `FH.scrollToEl` on an element of another page: use `go()`).
18. **Reveals never replay** (one shot `IntersectionObserver`, `.is-in` stays because the DOM persists). React remounts pages, so the port needs the revealed key memory from the porting plan or every revisit would replay all reveals.
19. **Reveals start behind the curtain:** the new page is shown at 560ms while still covered, so items in view reveal during the hold and lift. Do not delay reveal observation to the end of the curtain.
20. **First load reveal gate:** `FH.observe(document)` and `FH.bind(document)` run 250ms after `is-loaded` (1500ms after `DOMContentLoaded`); works.js observes and binds its grid and certificate cards earlier, at script run, but they still reveal only once they intersect.
21. **Split words run on reduced motion too** (the spans exist, the CSS just removes the transform). Contact overrides the split delays (`170 + i * 130` ms, L5566) after calling `FH.split`.
22. **Parallax uses `style.translate`,** not `transform`, so it stacks with the orbit's hover `scale` and the quote mark's additive Web Animation. `data-parallax="0"` would become `.1` because of `|| .1`. The `.site > [data-parallax]` selector matches nothing. Values stay frozen on elements more than 200px outside the viewport.
23. **Cursor glow** starts at the viewport centre and glides to the first pointer position while fading in; its rAF loop never stops; `has-pointer` is never removed.
24. **Spotlight** tracks every pointer type (touch included) and ignores reduced motion; only its fade is shortened.
25. **Magnetic and tilt write inline `transform`** and rely on the element's own CSS transition for smoothness; the port must not add its own easing.
26. **Rail indicator position is measured only on `setActive`.** Under 1024px the rail is `display:none`, so `offsetTop` is 0 and the pill sits at "About"; widening the window past 1024px leaves it there until the next page change (reference bug; owner question whether to re-measure on resize).
27. **Progress bar and top bar update only on `scroll`** (plus boot), not on `resize` or page height changes. After a page change the `scrollTo(0,0)` usually fires a scroll event; if the page was already at 0 the bar keeps its last value (0).
28. **`.page.is-leaving` uses `transition:all .5s`**, so any other property that changes on the old page during the cover also animates.
29. **The curtain blocks clicks** while `is-on` (`pointer-events:auto`), from T = 0 to 1340ms.
30. **Unused hooks in the core:** `FH.onView`, `data-onview`, `data-reveal` values `right`, `blur` and `mask`, `data-prefix`, `data-no-route`, `opts.instant`, `data-navgroup`, `fh:theme`, and works.js `FH.split` on `.wk-ht` (no element). Port the reveal variants to CSS anyway (cheap, and they are part of the documented system); skip the rest unless a page needs them.
31. **Two different "busy until lifted" waits in page scripts:** profile waits 150ms after the lift (fallback 1600ms), works and approvals wait 120ms (fallback 1800ms). Keep both numbers per page.
32. **The chat's cross page actions wait 2700ms** after `FH.go` before their follow up (for example focusing `#ct-name`), 900ms on the same page, 60ms with reduced motion (L6432). These numbers cover the 1340ms curtain plus the smooth scroll that follows it; keep them.
33. **Modal close is instant** (visibility has no delay), opening animates (11.2.11). `FH.go` closes modals before routing; it does not close the chat.
34. **`window.FH_HOOKS` and `window.FH_BASE`** belong to the reference only. In the port `asset()` resolves to `/` (files move to `frontend/public/`), and the hooks become the API client (section 10).
35. **Reference comment with an em dash** at L4561 (`FH CORE \u2014 shared helpers used by every part`) is a code comment, not copy; nothing to port.

### 11.3 About page (#about, route /)

Sources read line by line: about.css L365-811, HTML L3004-3111 and L3113-3436 (L3112 only through the base64 substitution), about.js L4787-5174. Shared rules and helpers that this page depends on were checked at the lines cited (tokens L25-88, shared components L107-191, reduced motion L357-362, core script L4559-4786). Sections 1 to 10 of REFERENCE_MAP.md are not repeated here.

Reference copy in these ranges holds no em dashes and no curly quotes. The only non ASCII characters are the bullets `•` (U+2022) in the ring text (L3104), its closing `&#160;` (U+00A0), and the `&ldquo;` (U+201C) quote mark (L3337).

#### 11.3.0 Page frame

##### Root
- `section#about.ab` (L3004), `aria-labelledby="ab-name"`. The core script adds `.page`, `data-page="about"` and `.is-current` (L4677, L4682). The rebuild renders it at route `/`.
- CSS: `#about{position:relative}` (L369). `#about [data-reveal].is-in{clip-path:none}` (L371) so shadows and ornaments are not clipped after a reveal.
- Blocks in order:

| Lines | Block | Root |
|---|---|---|
| L3007-3017 | Hidden SVG with 7 brand symbols (`ab-ic-react`, `ab-ic-next`, `ab-ic-node`, `ab-ic-openai`, `ab-ic-claude`, `ab-ic-aws`, `ab-ic-mongo`) | `svg` width 0, height 0, `style="position:absolute"`, `aria-hidden="true"`, `focusable="false"` |
| L3019-3126 | Hero | `div.ab-hero#ab-hero` |
| L3128-3141 | Marquee | `div.ab-marquee` |
| L3143-3210 | Get to Know Me | `div.wrap.ab-block#ab-know` |
| L3212-3320 | Services ("What I Do Best") | `div.wrap.ab-block.ab-services` |
| L3322-3371 | Testimonials | `div.wrap.ab-block.ab-tst` |
| L3373-3434 | Pricing plus the "Talk first" aside | `div.wrap.ab-block.ab-price` |
| after L3434 | "Next page" link, injected by the core script (L4732-4736): label "Next page · 02", "1 / 5", title "Profi" + `<span class="serif">le</span>`, href `#profile` | `div.wrap > nav.page-next` |

- Block spacing: `#about .ab-block{padding-top:clamp(96px,11vw,150px)}` (L372). `#about .ab-price{padding-bottom:clamp(8px,2vw,24px)}` (L373).
- Tokens used by about.css (values at L25-88, both themes): `--grad`, `--grad-glow`, `--brand`, `--brand-ink`, `--brand-soft`, `--accent`, `--accent-soft`, `--mint`, `--glass`, `--line`, `--line-strong`, `--surface`, `--surface-2`, `--surface-3`, `--ink`, `--ink-2`, `--muted`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--glow`, `--r-pill`, `--r-lg`, `--r-xl`, `--font-serif`, `--font-mono`, `--ease-out` (`cubic-bezier(.22,1,.36,1)`), `--ease-io` (`cubic-bezier(.65,0,.35,1)`), `--dur-1` (.35s), `--dur-2` (.6s), `--dur-3` (.9s).
- Shared classes used here (defined in the shell CSS): `.wrap` L113, `.sr-only` L107, `.i` L108, `.serif` L118, `.grad-text` L119, `.label` L121, `.lead` L122, `.sec-head` L125, `.sec-head--center` L126, `.eyebrow` L127-129, `.sec-title` L130-131, `.btn` L134-145, `.tag`/`.tags` L154-155, `.card`/`.card--hover` L158-160, `.icon-tile` L161-163, `[data-spotlight]` L166-170, `.stat-num` L173, reveal system L178-187, split words L189-191.

##### Reveal, split and count timing for the whole page
The reveal observer (L4594-4596: `rootMargin:'0px 0px -8% 0px'`, `threshold:.12`, fires once) only starts when the preloader is done plus 250ms (L4782: `done` runs 1250ms after DOM ready, then `FH.observe` after 250ms; both 0 with reduced motion). So every `--d` below counts from that moment for the hero.
Plain `data-reveal` is the "up" variant: from `translate3d(0,26px,0)` and `blur(6px)`, opacity 0 (L179). `data-reveal="scale"` starts at `scale(.94)` and `blur(6px)` (L181). Transition: opacity, transform and filter `var(--dur-3) var(--ease-out)`, clip-path `var(--dur-4) var(--ease-out)`, `transition-delay:var(--d,0ms)` (L178).
Split headings: each word (or each whole `.serif`/`.grad-text` element) becomes `span.w > span` with `--d` = word index x 55ms (L4581, L4585). The inner span rises from `translate3d(0,105%,0)` to none over `1s var(--ease-out)` with delay `var(--d)` (L190-191).

| Element | Line | Kind | `--d` |
|---|---|---|---|
| `p.ab-hello` | L3023 | reveal up, `data-delay="80"` | 80ms |
| `h1.ab-name` | L3025 | split: "Faisal" 0ms, "Hanif" (whole `.serif.grad-text`) 55ms | none on the h1 |
| `div.ab-role` | L3030 | reveal up, `data-delay="360"` | 360ms |
| `div.ab-cta` | L3039 | reveal up, `data-delay="460"` | 460ms |
| `ul.ab-social` | L3048 | reveal up, `data-delay="540"` | 540ms |
| `div.ab-stat` x3 | L3057, L3061, L3065 | reveal up; parent `dl.ab-stats` has `data-stagger="90" data-delay="600"` | 600, 690, 780ms |
| `span[data-count]` x3 | L3059, L3063, L3067 | count up (own observer entry) | starts on its own intersect |
| `h2` Get to Know Me | L3147 | split: "Get" 0, "to" 55, "Know Me" 110ms | |
| `p.lead` | L3148 | reveal up | 0 |
| bento cards x4 | L3152, L3166, L3177, L3196 | custom clip animation (see 11.3.3); parent `data-stagger="90"` | 0, 90, 180, 270ms |
| `h2` What I Do Best | L3218 | split: "What" 0, "I" 55, "Do" 110, "Best" 165ms | |
| `p.lead` | L3219 | reveal up | 0 |
| `ol.ab-svc-index` | L3221 | reveal up | 0 |
| `article.ab-svc` x4 | L3227, L3250, L3273, L3296 | reveal up; parent `data-stagger="90"` writes 0, 90, 180, 270ms, but see Notes and traps: the delay is cancelled | effectively 0 |
| `h2` Client Success Stories | L3327 | split: "Client" 0, "Success Stories" 55ms | |
| `p.lead` | L3328 | reveal up | 0 |
| `div.ab-tst__ctrl` | L3329 | reveal up | 0 |
| `div.ab-carousel` | L3336 | reveal scale | 0 |
| `h2` Investment Plans | L3377 | split: "Investment" 0, "Plans" 55ms | |
| `p.lead` | L3378 | reveal up | 0 |
| `article.ab-plan` | L3382 | reveal scale | 0 |
| `span.ab-plan__amt` | L3391 | count up to 25 over 1400ms | on intersect |
| `aside.ab-side` children | L3407, L3411, L3416, L3421 | reveal up; `data-stagger="90"` | 0, 90, 180, 270ms |

Count up (L4614-4618): `to=parseFloat(data-count)`, prefix `data-prefix||''`, suffix `data-suffix||''`, duration `data-duration||1600`, decimals from the count string (0 here). Easing `1-Math.pow(1-p,4)` per rAF, text `pre+(to*e).toFixed(dec)+suf`. Reduced motion: final text at once. Initial markup text is `0` (no suffix until the first tick).

#### 11.3.1 Hero (L3019-3126, CSS L375-519 and L734-803, JS L4805-4994)

##### Layout
- `div.ab-hero#ab-hero` (L3019): `position:relative;min-height:100vh;min-height:100svh;display:flex;align-items:center;padding:clamp(88px,11vh,120px) 0 clamp(84px,11vh,112px);overflow-x:clip` (L376).
- `div.wrap.ab-hero__grid` (L3020): `grid-template-columns:minmax(0,1fr) minmax(0,1.04fr);grid-template-areas:"copy visual";column-gap:clamp(32px,5vw,88px);align-items:center;width:100%` (L377).
- `div.ab-hero__copy#ab-hero-copy` (L3022): `grid-area:copy;min-width:0;position:relative;z-index:2;will-change:translate` (L378).
- `div.ab-hero__visual` (L3074): `grid-area:visual;min-width:0;display:grid;place-items:center;position:relative;z-index:1` (L379).
- `a.ab-scroll` (L3121) is an absolute child of the grid, placed against `.ab-hero`.

##### Greeting
- `p.ab-hello` (L3023), `data-reveal data-delay="80"`, copy `Hi there! I'm`.
- CSS L381: `font-family:var(--font-serif);font-style:italic;font-size:clamp(1.45rem,2.2vw,2rem);line-height:1.1;color:var(--ink-2);margin-bottom:clamp(4px,1vh,10px)`.
- No "Available" pill (section 9 confirms).

##### Name (two rows, word split, row 2 line)
- `h1.ab-name#ab-name[data-split]` (L3025-3028):
  - `span.ab-name__row` "Faisal" (L3026)
  - `span.ab-name__row.ab-name__row--2 > span.serif.grad-text` "Hanif" (L3027)
- After split (L4573-4591) the DOM becomes: row 1 `span.w > span[style="--d:0ms"]` "Faisal"; row 2 `span.w > span[style="--d:55ms"] > span.serif.grad-text` "Hanif". The split is per WORD. There is no per letter split, no sheen and no other flourish on the name in the reference (see Notes and traps).
- CSS:
  - L383 `.ab-name{--fs:clamp(4.2rem,min(10.6vw,14.6vh),10rem);font-size:var(--fs);font-weight:800;letter-spacing:-.055em;line-height:.9;color:var(--ink);margin:0}`
  - L384 `.ab-name__row{display:block;white-space:nowrap}`
  - L385 `.ab-name__row--2{display:flex;align-items:center;gap:.16em;padding-left:.18em}`
  - L386 row 2 line (`::before`): `content:"";flex:none;width:clamp(28px,.9em,150px);height:2px;margin-top:.14em;border-radius:2px;background:var(--grad-glow);opacity:.8;transform-origin:0 50%;transform:scaleX(0);transition:transform 1.2s var(--ease-out) .55s`
  - L387 `.ab-name.is-in .ab-name__row--2::before{transform:none}` (the line draws in left to right when the h1 gets `.is-in`)
  - L388 `.ab-name .serif{font-size:1.12em;letter-spacing:-.025em;font-weight:400;line-height:.9;padding-right:.1em}`
  - L390 `.ab-name .w{padding:0 .06em .14em 0;margin:0 -.06em -.14em 0}` (room for the italic overhang and descenders inside the split mask; overrides `.w` at L189)
- Entrance sequence once the h1 intersects: "Faisal" rises 105% to 0 over 1s ease-out at 0ms; "Hanif" the same at 55ms; the line scales in over 1.2s ease-out at 550ms.
- Responsive: at max 900px `--fs:clamp(3.6rem,22.5vw,8rem)` (L758). At max 640px row 2 `padding-left:.08em` (L762) and the line `width:.55em` (L763). Reduced motion: line `transform:none` (L809), word spans `transform:none!important` (L360).

##### Role line (chip, connector, rolling role)
- `div.ab-role[data-reveal][data-delay="360"]` (L3030). CSS L392 `display:flex;align-items:center;flex-wrap:wrap;gap:12px 16px;margin-top:clamp(16px,2.8vh,28px)`.
- `span.ab-role__chip` (L3031): icon `#i-code` + `Software Engineer`. CSS L393 `display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px 0 12px;border-radius:var(--r-pill);background:var(--brand-soft);border:1px solid var(--line-strong);color:var(--brand-ink);font-weight:700;font-size:.9rem;letter-spacing:-.005em`; icon 17px (L394).
- `span.ab-role__line` (L3032): L395 `display:inline-flex;align-items:center;gap:12px;font-size:clamp(1.05rem,1.45vw,1.25rem);font-weight:600;color:var(--ink);white-space:nowrap;min-height:38px`.
  - `span.ab-role__slash[aria-hidden="true"]` `/` (L3033), `color:var(--muted);font-weight:400` (L396). This is the connector on wide screens.
  - `span.ab-typer[aria-hidden="true"]` (L3034) `display:inline-flex;align-items:center` (L397) holding `span.ab-typer__txt#ab-typer` (initial text `Frontend Development`, `white-space:pre` L398) and `span.ab-typer__caret`.
  - `span.sr-only` (L3035): `Frontend Development, Backend Development, Database Management, System Design, Cloud Orchestration`.
- Typed letters: `span.ab-ch` `display:inline-block;white-space:pre;animation:ab-ch .42s var(--ease-out) both` (L399); `@keyframes ab-ch{from{opacity:0;transform:translateY(.28em);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}` (L400).
- Caret: `display:inline-block;width:2px;height:1.15em;margin-left:3px;border-radius:2px;background:var(--accent);animation:ab-caret 1.1s var(--ease-io) infinite` (L401); `@keyframes ab-caret{0%,45%{opacity:1}55%,100%{opacity:.08}}` (L402).
- Roles and timings: see behaviour "Role typer" in 11.3.9.
- Responsive at max 640px (L764-767): `.ab-role{gap:10px}`; `.ab-role__line{font-size:1.06rem;flex-basis:100%}` (the line drops under the chip); `.ab-role__slash{display:none}`; the connector becomes `.ab-typer::before{content:"";width:18px;height:1px;margin-right:10px;background:var(--line-strong)}`.
- Reduced motion: caret animation none (L807).

##### Download CV and Book Meeting
- `div.ab-cta[data-reveal][data-delay="460"]` (L3039). CSS L404 `display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(22px,3.6vh,36px)`.
- `a.btn.btn--primary` (L3040): `href="https://faisalhanif.work/imgs/Faisal-CVS.pdf"`, boolean `download`, `data-cv`, `data-magnetic` (no value, so strength 0.25, L4629). Icon `#i-download`, copy `Download CV`. about.js rewrites the href to `FH.asset('imgs/Faisal-CVS.pdf')` (L4806-4807), which gives the same URL. Rebuild: `/imgs/Faisal-CVS.pdf`.
- `button.btn.btn--ghost[type="button"][data-book]` (L3043): icon `#i-calendar`, copy `Book Meeting`. `data-book` is empty, so `FH.openBooking('')` opens on Quick Chat (L4658, L6167).
- Button base: `.btn` height 52px (`--h`), pill, `font-weight:600;font-size:.95rem`, primary gradient with a light sweep `::after` that moves from `translateX(-120%)` to `translateX(120%)` over `.9s var(--ease-out)` on hover (L139-140), `:active` `scale(.97)` (L145).
- Magnetic (fine pointer, no reduced motion, L4629-4631): on pointermove `translate((x-center)*0.25px,(y-center)*0.25px)`, reset on pointerleave.
- Responsive: max 640px `.ab-cta .btn{flex:1 1 0;padding:0 16px;min-width:0}` (L768); max 380px `padding:0 12px;font-size:.9rem` (L802).

##### Socials
- `ul.ab-social[aria-label="Social profiles"][data-reveal][data-delay="540"]` (L3048-3054), 5 `li > a[target="_blank"][rel="noopener"][aria-label]` with one icon each (data in 11.3.10 socials.ts).
- CSS L405-409: list `margin:clamp(16px,2.6vh,24px) 0 0;display:flex;gap:6px`; link `42px` circle, `color:var(--ink-2);border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 60%,transparent)`, transitions `color var(--dur-1),border-color var(--dur-1),transform var(--dur-2) var(--ease-out),background-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out)`. Hover: `color:var(--brand-ink);border-color:var(--brand);transform:translateY(-3px);background:var(--surface);box-shadow:var(--shadow-md)`; icon 18px, hover `scale(1.08)`.
- Max 640px: `gap:4px`, links 44px (L769-770).

##### Stats
- `dl.ab-stats[data-stagger="90"][data-delay="600"]` (L3056-3069). Each `div.ab-stat[data-reveal]` holds `dt.label` then `dd.stat-num > span[data-count][data-suffix="+"]` with text `0`.
  - `Years Coding` 3, suffix `+`
  - `Projects` 10, suffix `+`
  - `Companies` 3, suffix `+`
  - No `data-prefix`, no `data-duration` (so 1600ms, easing `1-(1-p)^4`).
- CSS L412-416: `grid-template-columns:repeat(3,minmax(0,1fr));margin:clamp(26px,4.4vh,44px) 0 0;padding-top:clamp(18px,2.6vh,26px);border-top:1px solid var(--line-strong);max-width:540px`. `.ab-stat{display:flex;flex-direction:column-reverse;gap:8px;padding-right:16px}` (number shows above the label while the DOM keeps dt first). `.ab-stat + .ab-stat{padding-left:clamp(16px,2vw,28px);border-left:1px solid var(--line)}`. `dd{margin:0}`, `dt{font-size:.66rem}`. `.stat-num` (L173): `font-size:clamp(1.9rem,3vw,2.6rem);font-weight:800;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums`.
- There is no "gliding mark" in the stats (see Notes and traps). The only moving marks on this page are the orbit dots, the clock's `.ab-day__now` knob (11.3.3) and the testimonial quote mark (11.3.5).
- Responsive: `(min-width:1024px) and (max-height:800px)`: `margin-top:clamp(18px,3.4vh,30px)`, `.stat-num{font-size:clamp(1.7rem,2.6vw,2.2rem)}` (L742-743). Max 900px: `max-width:none` (L759). Max 640px: `dt{font-size:.6rem;letter-spacing:.1em}`, `+ .ab-stat{padding-left:14px}` (L779-780).

##### Orbital portrait
Structure (L3074-3118):
```
div.ab-hero__visual
  div.ab-orb-exit#ab-orb-exit            (scroll exit writes translate, scale, opacity here)
    div.ab-orb.is-pre#ab-orb             (square stage, size container; starts with .is-pre in the HTML)
      span.ab-orb__halo[aria-hidden]
      div.ab-orb__layer.ab-orb__ring.ab-orb__ring--1[data-ring="1"][aria-hidden]
        svg.ab-orb__svg[focusable=false] > circle.ab-orb__line cx=50% cy=50% r=34.5% pathLength=360
        span.ab-orb__dot[data-w="1.4"][data-a="-60"]
        span.ab-orb__dot.ab-orb__dot--sm[data-w="1.4"][data-a="120"]
      div.ab-orb__layer.ab-orb__ring.ab-orb__ring--2[data-ring="2"][data-drift="-2"][aria-hidden]
        svg.ab-orb__svg > circle.ab-orb__line r=41.5% pathLength=360
        span.ab-sat[data-a] x4 > span.ab-sat__pill > (span.ab-sat__ic > svg.i > use) + span.ab-sat__txt
      div.ab-orb__layer.ab-orb__ring.ab-orb__ring--3[data-ring="3"][aria-hidden]
        svg.ab-orb__svg > circle.ab-orb__line r=49.5% pathLength=360
        span.ab-sat[data-a] x4 (same inner structure)
      div.ab-orb__layer.ab-orb__core
        svg.ab-orb__text[viewBox="-1000 -1000 2000 2000"][aria-hidden][focusable=false]
          defs > path#ab-ring-path d="M-880,0A880,880 0 1,1 880,0A880,880 0 1,1 -880,0"
          text[dominant-baseline="central"] > textPath[href="#ab-ring-path"][textLength="5529.2"][lengthAdjust="spacing"]
        figure.ab-portrait#ab-portrait
          span.ab-portrait__ring[aria-hidden]
          span.ab-portrait__clip
            span.ab-portrait__fb[aria-hidden] > span.ab-portrait__fh "F" + span.serif "H"
            img (base64 at L3112; rebuild /images/portrait-faisal.webp)
```
- Ring text (L3104, 108 glyphs): `SOFTWARE ENGINEER • AI / LLM • WEB • MOBILE • CLOUD • SOFTWARE ENGINEER • AI / LLM • WEB • MOBILE • CLOUD •` followed by `&#160;` (U+00A0).
- Image (L3112-3113): `alt="Portrait of Faisal Hanif" width="498" height="696" decoding="async" fetchpriority="high"`, `onerror="this.closest('.ab-portrait').classList.add('is-fallback');this.remove()"`. No class on the img.
- Badges (angles in `data-a`, degrees, 0 = 3 o'clock, positive = clockwise on screen):

| Ring | Angle | Icon symbol | Text |
|---|---|---|---|
| 2 | 0 | `ab-ic-react` | React |
| 2 | 90 | `ab-ic-node` | Node.js |
| 2 | 180 | `ab-ic-openai` | OpenAI |
| 2 | 270 | `ab-ic-aws` | AWS |
| 3 | 45 | `ab-ic-next` | Next.js |
| 3 | 135 | `ab-ic-claude` | Claude |
| 3 | 225 | `ab-ic-mongo` | MongoDB |
| 3 | 315 | `i-phone-dev` | React Native |

CSS (L418-509):
- `@property --ab-sw{syntax:'<angle>';inherits:false;initial-value:360deg}` (L424). Must be registered globally.
- `.ab-orb-exit{position:relative;width:100%;will-change:transform,opacity}` (L425).
- `.ab-orb{--ph:.44;--hl:.021;--rt:.283;--r1:.345;--r2:.415;--r3:.495;position:relative;width:100%;aspect-ratio:1;container-type:inline-size;margin-inline:auto}` (L426-427). `--ph` photo diameter, `--hl` gap from photo to its hairline, `--rt` text band radius, `--r1..--r3` orbit radii, all as fractions of the stage width S.
- `.ab-hero__visual .ab-orb{width:min(566px,64vh,calc(100% + 24px))}` (L428); at min 1181px `left:-14px` (L430).
- Layers: `.ab-orb__layer{position:absolute;inset:0;pointer-events:none}`; z-index core 5, ring 1 8, ring 2 13, ring 3 20 (L431-435).
- Halo (L438-440): centred, `width:84%;aspect-ratio:1;translate:-50% -50%;border-radius:50%`, light `radial-gradient(closest-side,rgba(16,185,129,.17),rgba(16,185,129,.07) 52%,rgba(16,185,129,0) 100%)`, dark `radial-gradient(closest-side,rgba(52,211,153,.14),rgba(52,211,153,.05) 52%,rgba(52,211,153,0) 100%)`.
- Ring SVG (L443-450): `position:absolute;inset:0;width:100%;height:100%;overflow:visible;mask-image:conic-gradient(#000 var(--ab-sw),transparent 0)` (plus `-webkit-` copy). Line `fill:none;stroke-width:1`.
  - ring 1: `r:calc(var(--r1) * 100%);stroke:var(--accent);stroke-opacity:.42` (solid)
  - ring 2: `r:calc(var(--r2) * 100%);stroke:var(--brand);stroke-opacity:.34;stroke-dasharray:1.5 1.5` (dark: `stroke:var(--mint);stroke-opacity:.28`)
  - ring 3: `r:calc(var(--r3) * 100%);stroke:var(--brand);stroke-opacity:.45;stroke-width:2;stroke-linecap:round;stroke-dasharray:0 3` (a ring of dots; dark: `stroke:var(--mint);stroke-opacity:.34`)
  - `pathLength="360"`, so dash units are degrees and the pattern divides the circle evenly.
- Dots (L453-455): `left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft),0 0 14px 2px rgba(16,185,129,.5);will-change:transform`. `--sm`: 6px, `margin:-3px 0 0 -3px;background:var(--mint)`.
- Badge anchor `.ab-sat{position:absolute;left:50%;top:50%;width:0;height:0;will-change:transform,opacity}` (L458). The pill centres on the anchor (L459-463): `position:absolute;left:0;top:0;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:.5em;height:2.65em;padding:0 1em 0 .34em;border-radius:99px;white-space:nowrap;font-size:clamp(10.5px,2.08cqw,13px);font-weight:650;letter-spacing:-.01em;color:var(--ink);pointer-events:auto;cursor:default;background:var(--glass);backdrop-filter:blur(12px) saturate(1.5);border:1px solid var(--line-strong);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 1px 2px rgba(8,48,42,.06),0 10px 24px -14px rgba(8,48,42,.3);transition:border-color .4s var(--ease-out),box-shadow .5s var(--ease-out)`.
  - Icon disc (L464-465): `width:1.95em;height:1.95em;border-radius:50%;background:var(--brand-soft);border:1px solid var(--line);color:var(--brand-ink);transition:background-color .4s,color .4s,border-color .4s`; svg `1.2em`, `stroke-width:1.6`.
  - Hover (L466-467): `border-color:var(--brand);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 0 0 3px var(--accent-soft),0 12px 26px -12px rgba(14,102,85,.4)`; icon disc `background:var(--grad);color:#fff;border-color:transparent`. Hover also slows the orbit (JS).
  - Dark (L468-469): pill `box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 12px 28px -14px rgba(0,0,0,.8)`; hover `inset 0 1px 0 rgba(255,255,255,.08),0 0 0 3px rgba(52,211,153,.14),0 14px 30px -12px rgba(0,0,0,.8)`.
- Text band (L472-475): `left:50%;top:50%;width:calc(var(--rt) / .44 * 100%);aspect-ratio:1;margin:0;translate:-50% -50%;overflow:visible;will-change:transform`. Text: `font-family:var(--font-mono);font-size:61px;font-weight:500;letter-spacing:calc(51.196px - .6em);fill:var(--muted)`. Every glyph advance is 51.196 units, 108 x 51.196 = 5529.2 = the r=880 circumference, so there is no seam.
- Portrait (L477-486): `.ab-portrait{left:50%;top:50%;width:calc(var(--ph) * 100%);aspect-ratio:1;margin:0;translate:-50% -50%;border-radius:50%;pointer-events:auto;box-shadow:0 0 60px -6px rgba(16,185,129,.34)}` (dark `0 0 70px -8px rgba(52,211,153,.26)`). Hairline `.ab-portrait__ring{inset:calc(var(--hl) * -100cqw);border-radius:50%;border:1px solid var(--accent);opacity:.55}`. Clip `.ab-portrait__clip{inset:0;border-radius:50%;overflow:hidden;isolation:isolate;background:var(--grad);clip-path:circle(50% at 50% 50%)}`. Img `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 16%;z-index:1;transform-origin:50% 50%`. Fallback layer `.ab-portrait__fb` (always rendered under the img) `display:grid;place-items:center;color:#fff;background:radial-gradient(120% 70% at 30% 0%,rgba(255,255,255,.22),transparent 60%),radial-gradient(90% 60% at 100% 100%,rgba(95,207,159,.45),transparent 70%),var(--grad)`; monogram `.ab-portrait__fh{font-size:clamp(4rem,11cqw,7rem);font-weight:800;letter-spacing:-.07em;line-height:1;color:rgba(255,255,255,.95);text-shadow:0 20px 50px rgba(0,0,0,.18)}`, its `.serif` `font-weight:400;font-size:1.08em;letter-spacing:-.02em;color:rgba(255,255,255,.82)`.
- Photo hover: `.ab-portrait:hover .ab-portrait__clip img{transform:scale(1.04);transition-duration:1.1s}` (L500), and the orbit slows (JS).

Entrance (`.is-pre` then `.is-in`, L489-509). `.ab-orb.is-pre *{transition:none!important}` so the reset snaps. The `.is-in` class has no rules of its own; removing `.is-pre` plays these transitions:

| Part | From (`.is-pre`) | Transition to rest |
|---|---|---|
| `.ab-portrait__clip` | `clip-path:circle(0% at 50% 50%)` | `clip-path 1.15s var(--ease-out)` |
| clip `img` | `transform:scale(1.14)` | `transform 1.6s var(--ease-out)` |
| `.ab-portrait` | `box-shadow:none` | `box-shadow 1.2s var(--ease-out) .3s` |
| `.ab-portrait__ring` | `opacity:0;scale:.9` | `opacity .9s var(--ease-out) .25s, scale 1.2s var(--ease-out) .25s` |
| `.ab-orb__text` | `opacity:0;scale:.9` | `opacity 1s var(--ease-out) .45s, scale 1.3s var(--ease-out) .45s` |
| `.ab-orb__halo` | `opacity:0;scale:.7` | `opacity 1.4s var(--ease-out), scale 1.6s var(--ease-out)` |
| `.ab-orb__svg` | `--ab-sw:0deg` | `--ab-sw 1.4s var(--ease-io)`, delay ring 1 `.12s`, ring 2 `.26s`, ring 3 `.4s` (each ring draws clockwise from 12 o'clock through the conic mask) |
| `.ab-orb__dot` | `opacity:0` | `opacity .8s var(--ease-out) .7s` |
| `.ab-sat` | `opacity:0` | JS drives opacity and position (fly in, see 11.3.9) |

Responsive (orbit):
- 901px to 1180px (L735-739): grid `minmax(0,1fr) minmax(0,.94fr)`; stage `width:min(540px,64vh,calc(100% + 16px));--ph:.42;--rt:.272;--r1:.34;--r2:.43`; ring 3 badges `display:none`.
- Max 900px (L756-757): stage `width:min(480px,calc(100% - 20px))`.
- Max 640px (L772-778): stage `width:min(420px,100%);--ph:.46;--hl:.024;--rt:.303;--r1:.37;--r2:.44;--r3:.5`; ring 3 badges hidden; pills become icon only discs: `.ab-sat__pill{font-size:12px;width:2.9em;height:2.9em;padding:0;justify-content:center}`, `.ab-sat__ic{width:2.1em;height:2.1em}`, icon `1.25em`, `.ab-sat__txt` visually hidden (`position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap`); ring text `font-size:65px`.
- So ring 3 badges (Next.js, Claude, MongoDB, React Native) show only above 1180px and from 641px to 900px.

##### Scroll cue
- `a.ab-scroll[href="#ab-know"]` (L3121-3124): `span.label` `Scroll to explore` + `span.ab-scroll__btn[aria-hidden="true"]` with `#i-arrow-right` rotated to point down.
- CSS L512-519: `position:absolute;left:50%;bottom:clamp(18px,3.4vh,34px);translate:-50% 0;display:inline-flex;align-items:center;gap:14px;min-height:44px;color:var(--muted);opacity:0;transition:opacity 1s var(--ease-out) 1.8s,color var(--dur-1);z-index:3`. `.is-loaded #about .ab-scroll{opacity:1}` (fades in 1.8s after the preloader lifts). Hover: `color:var(--brand-ink)`, button `border-color:var(--brand);background:var(--surface)`. Button 44px circle, `border:1px solid var(--line-strong);color:var(--brand-ink);overflow:hidden`.
- Icon: 18px, `transform:rotate(90deg);animation:ab-cue 3.2s var(--ease-io) infinite`; `@keyframes ab-cue{0%,55%{transform:rotate(90deg) translateX(0);opacity:1}75%{transform:rotate(90deg) translateX(16px);opacity:0}76%{transform:rotate(90deg) translateX(-16px);opacity:0}100%{transform:rotate(90deg) translateX(0);opacity:1}}` (the arrow drops out of the bottom and re-enters from the top).
- Click: the core anchor handler (L4713-4723) calls `FH.go(#ab-know)`; same page, so `FH.scrollToEl`: target top minus 84px under 1024px wide, minus 32px otherwise, smooth (L4687).
- Hidden at max 1023px (L752). Reduced motion: icon animation none (L807).

##### Hero responsive summary
- Max 1180px and min 901px: see orbit list above (L735-739).
- `(min-width:1024px) and (max-height:800px)` (L740-744): hero `padding-top:clamp(64px,9vh,96px);padding-bottom:clamp(70px,10vh,96px)`, stats changes above.
- Max 1023px (L745-752): hero `padding-top:104px`; scroll cue hidden.
- Max 900px (L754-759): hero `min-height:0;padding-bottom:40px`; grid one column, `grid-template-areas:"copy" "visual"`, `row-gap:clamp(40px,8vw,64px)`. The copy is ON TOP and the orbit BELOW, text stays left aligned.
- Max 640px (L761-780) and max 380px (L800-803): listed per component above.

#### 11.3.2 Marquee (HTML L3128-3141, CSS L521-532, JS L5025-5059)
- `div.ab-marquee[aria-label="Tech stack"]` (L3129).
  - `ul.sr-only` (L3130-3132) with 17 `li` (same list as the visual items).
  - `div.ab-marquee__track[aria-hidden="true"]` (L3133) with two identical `div.ab-marquee__set` (L3134-3136, L3137-3139). Each set: 17 `span` items, each followed by an empty `i` (diamond separator). Items at even positions (0-based odd) carry `class="serif"`: Next.js, Node.js, MongoDB, React Native, OpenAI, LangChain, AWS, Vercel.
  - Items: React.js, Next.js, TypeScript, Node.js, Express.js, MongoDB, SQL, React Native, Expo, OpenAI, Claude, LangChain, LangGraph, AWS, Docker, Vercel, Tailwind CSS.
- CSS:
  - L522-523 `.ab-marquee{position:relative;overflow:hidden;padding:clamp(20px,2.6vw,30px) 0;border-block:1px solid var(--line);background:color-mix(in srgb,var(--surface) 45%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}` (plus `-webkit-`).
  - L524 track `display:flex;width:max-content;will-change:transform`.
  - L525-526 no JS fallback: `.ab-marquee:not(.is-js) .ab-marquee__track{animation:ab-marq 70s linear infinite}`, paused on hover. L532 `@keyframes ab-marq{to{transform:translate3d(-50%,0,0)}}`.
  - L528 set `display:flex;align-items:center;flex:none;gap:clamp(22px,3vw,44px);padding-right:clamp(22px,3vw,44px)`.
  - L529 item `font-size:clamp(1.35rem,2.5vw,2.15rem);font-weight:700;letter-spacing:-.035em;line-height:1.2;color:var(--ink);white-space:nowrap;transition:color var(--dur-1)`; hover `color:var(--brand-ink)` (L527).
  - L530 serif item `font-weight:400;letter-spacing:-.01em;font-size:clamp(1.55rem,2.85vw,2.45rem);color:var(--brand-ink)`.
  - L531 separator `i`: `flex:none;width:7px;height:7px;border-radius:2px;transform:rotate(45deg);background:var(--accent);opacity:.65`.
- Behaviour: see "Marquee" in 11.3.9 (base 38px/s, scroll velocity boost up to 6x, direction follows scroll, hover 0.25x).
- Reduced motion (L808): mask removed, `overflow-x:auto` (the strip becomes a native horizontal scroller); JS does not start (L5028).

#### 11.3.3 Get to Know Me bento (HTML L3143-3210, CSS L534-598 and L745-787, JS L4996-5023)

##### Section head
- `div.sec-head.ab-head-split` (L3145): `span.eyebrow` = `<b>01</b> About`; `h2.sec-title[data-split]` = `Get to ` + `span.serif.grad-text` `Know Me`; `p.lead[data-reveal]` = `The quickest ways to reach me, and where I am right now.`
- CSS L535-537: `.ab-head-split{max-width:none;grid-template-columns:minmax(0,1fr) auto;align-items:end;column-gap:48px}`, eyebrow `grid-column:1/-1`, lead `max-width:30ch;justify-self:end;text-align:right;text-wrap:balance;padding-bottom:6px`. Max 640px: one column, lead `justify-self:start;text-align:left;max-width:none` (L782-783).

##### Grid
- `div.ab-bento[data-stagger="90"]` (L3151): `display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(14px,1.6vw,20px)` (L540).
- Card base `.ab-kc` (L541): `display:flex;flex-direction:column;gap:clamp(14px,1.6vw,20px);padding:clamp(22px,2.4vw,32px);border-radius:var(--r-xl);min-height:clamp(210px,19vw,250px);overflow:hidden`.
- Spans (L542-545): email 7, phone 5, location 5, availability 7 (two rows: 7+5, 5+7). Max 1023px: every card `span 6` (L750). Max 640px: `grid-column:1/-1;min-height:0` (L784).
- Top row `.ab-kc__top{display:flex;align-items:center;justify-content:space-between;gap:12px}` (icon tile left, label right).
- Value `.ab-kc__value{font-size:clamp(1.3rem,2vw,1.75rem);font-weight:700;letter-spacing:-.03em;line-height:1.15;color:var(--ink);overflow-wrap:anywhere}` (L547).
- Actions `.ab-kc__actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px 18px}`; link `.ab-act{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-weight:700;font-size:.92rem;color:var(--brand-ink)}`, icon 17px, hover icon `translate(3px,-3px)` over `var(--dur-1) var(--ease-out)` (L550-553).

##### Card 1: Email (L3152-3164)
- `article.card.ab-kc.ab-kc--email[data-spotlight][data-reveal][data-tilt="2.5"]`.
- Top: `span.icon-tile.icon-tile--soft` (`#i-mail`) + `span.label` `Email`.
- Value: `p.ab-kc__value.ab-kc__value--email` = `mehrfaisal111<wbr>@gmail.com` (break opportunity before "@"). CSS L548 `font-size:clamp(1.3rem,2.55vw,2.3rem);letter-spacing:-.04em;margin-top:auto` (max 640px `margin-top:6px`, L785).
- Actions: `a.ab-act[href="mailto:mehrfaisal111@gmail.com"]` `Send Email ` + `#i-arrow-up-right`; `button.ab-copy[type="button"][data-copy="mehrfaisal111@gmail.com"][aria-label="Copy email address"]` with `#i-file` icon and `span` `Copy`.
- `.ab-copy` (L554-556): `display:inline-flex;align-items:center;gap:7px;height:40px;min-width:44px;padding:0 14px;border-radius:var(--r-pill);border:1px solid var(--line-strong);color:var(--ink-2);font-size:.8rem;font-weight:600`; hover `border-color:var(--brand);color:var(--brand-ink);background:var(--surface-2)`; icon 15px.
- Click: toast `Email copied to clipboard` (behaviour "Copy email" in 11.3.9). The button text never changes.

##### Card 2: Phone (L3166-3175)
- `article.card.ab-kc.ab-kc--phone[data-spotlight][data-reveal][data-tilt="2.5"]`.
- Top: `#i-phone` tile + label `Phone`. Value `p.ab-kc__value` `+92 314 8166354` (L549: `font-size:clamp(1.3rem,2.2vw,1.95rem);margin-top:auto;font-variant-numeric:tabular-nums`; max 640px `margin-top:6px`, L786).
- Action: `a.ab-act[href="tel:+923148166354"]` `Call Now ` + `#i-arrow-up-right`.

##### Card 3: Location with the Lahore clock (L3177-3194)
- `article.card.ab-kc.ab-kc--loc[data-spotlight][data-reveal][data-tilt="2.5"]`.
- Top: `#i-pin` tile + label `Location`. Value `Lahore, Pakistan`.
- `div.ab-clock` (L559 `margin-top:auto;display:grid;gap:12px`):
  - `div.ab-clock__row` (L560 `display:flex;align-items:flex-end;justify-content:space-between;gap:12px`):
    - `span.ab-clock__time#ab-time[aria-live="off"]` initial `--:--`. L561 `font-size:clamp(2.2rem,3.6vw,3rem);font-weight:800;letter-spacing:-.05em;line-height:.95;color:var(--ink);font-variant-numeric:tabular-nums`; the AM/PM `small` L562 `font-size:.36em;font-weight:700;letter-spacing:.02em;margin-left:6px;color:var(--muted)`.
    - `span.ab-clock__zone` (L563 `display:grid;justify-items:end;gap:2px;text-align:right`): `span.label` `GMT+5` + `span.ab-clock__state#ab-state` initial `Local time` (L564 `font-size:.8rem;font-weight:600;color:var(--brand-ink)`).
  - `div.ab-day[aria-hidden="true"]` (L565 `position:relative;height:6px;border-radius:6px;background:var(--surface-3);margin-top:6px`):
    - `span.ab-day__work` (L566 `left:37.5%;width:37.5%` = 09:00 to 18:00, `background:var(--grad-glow);opacity:.55`)
    - `span.ab-day__now#ab-daynow` (L567 knob: 14px circle, `margin:-7px 0 0 -7px;background:var(--surface);border:3px solid var(--accent);box-shadow:0 0 0 4px var(--accent-soft);left:50%` until JS runs; `transition:left 1s var(--ease-out)`, so it glides to each new minute).
  - `div.ab-day__ticks.label[aria-hidden="true"]` `00` `06` `12` `18` `24` (L568 `display:flex;justify-content:space-between;font-size:.6rem;letter-spacing:.08em`).
- JS writes time, state, aria-label and knob position every 15s (11.3.9 "Lahore clock").

##### Card 4: Availability (L3196-3208)
- `article.ab-kc.ab-kc--avail[data-reveal][data-tilt="2.5"]` (no `.card`, no spotlight).
- CSS L571-582: `position:relative;background:var(--grad);color:#fff;box-shadow:var(--glow),var(--shadow-md);border:1px solid rgba(255,255,255,.08)`; label `color:rgba(255,255,255,.78)`; every child except the orbit gets `position:relative;z-index:1`.
- Top: `span.ab-kc__tile` (48px, radius 14px, `background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);color:#fff`, icon 22px) with `#i-calendar` + label `Availability`.
- Value `p.ab-kc__value.ab-kc__value--xl` (L575 `display:flex;align-items:center;gap:.24em;margin-top:auto;color:#fff;font-size:clamp(2.1rem,4.2vw,3.6rem);letter-spacing:-.05em;line-height:1`): `span.ab-live[aria-hidden]` + `span` `Open to ` + `span.serif` `Work` (L576 `font-size:1.1em;color:#d8f6ea`).
- Live dot L577-578: 12px, `background:#6ee7b7;align-self:center;animation:ab-ping 2.4s var(--ease-out) infinite`; `@keyframes ab-ping{0%{box-shadow:0 0 0 0 rgba(110,231,183,.6)}70%{box-shadow:0 0 0 12px rgba(110,231,183,0)}100%{box-shadow:0 0 0 0 rgba(110,231,183,0)}}`. Reduced motion: none (L807).
- Action: `button.btn.ab-btn-light[type="button"][data-book]` `#i-calendar` + `Book Meeting` (opens Quick Chat). L579-580 `background:#fff;color:#08302a;box-shadow:0 10px 30px -12px rgba(0,0,0,.45)`; hover `background:#effbf6`.
- Decor `svg.ab-kc__orbit[data-parallax="-0.08"][viewBox="0 0 200 200"][aria-hidden]` with circles r 98, 70, 42 at (100,100). L581 `position:absolute;right:-70px;top:-70px;width:300px;height:300px;fill:none;stroke:rgba(255,255,255,.13);stroke-width:1;pointer-events:none`; hover on the card `scale:1.06` over `scale 1.2s var(--ease-out)` (L597-598). Max 640px `right:-110px;top:-110px` (L787). Parallax writes `translate: 0 <off>px` with `off=(rect.top+rect.height/2-vh/2)*0.08` (L4764-4766).

##### Bento motion and hover (L584-598)
- `.js #about .ab-bento>[data-reveal]{opacity:0;transform:none;filter:none;transition:box-shadow var(--dur-2) var(--ease-out),border-color var(--dur-2),transform .6s var(--ease-out)}` (the standard reveal is replaced).
- On `.is-in`: `opacity:1;animation:ab-clip 1.15s var(--ease-out) var(--d,0ms) backwards`; `@keyframes ab-clip{from{opacity:0;clip-path:inset(16% 10% 16% 10% round 44px);transform:translate3d(0,34px,0) scale(.965)}30%{opacity:1}to{opacity:1;clip-path:inset(0 0 0 0 round 32px);transform:none}}`. Card delays 0, 90, 180, 270ms.
- Inner rise: `.ab-kc__top`, `.ab-kc__value`, `.ab-kc__actions`, `.ab-clock` run `ab-rise .9s var(--ease-out) backwards`, delays `calc(var(--d,0ms) + 220ms)` (top), `+ 320ms` (value), `+ 420ms` (actions and clock). `@keyframes ab-rise{from{opacity:0;transform:translate3d(0,14px,0)}to{opacity:1;transform:none}}`.
- Hover (cards with `.card`): `box-shadow:var(--shadow-lg),0 30px 60px -34px rgba(16,185,129,.45);border-color:var(--line-strong)`; icon tile `transform:translate3d(0,-3px,0) rotate(-6deg);background:var(--grad);color:#fff;box-shadow:var(--glow)` with transitions `transform var(--dur-2) var(--ease-out),background-color var(--dur-2),color var(--dur-2),box-shadow var(--dur-2)`. Availability hover: `box-shadow:var(--glow),var(--shadow-lg)`.
- Tilt (fine pointer, no reduced motion, L4633-4635): inline `perspective(900px) rotateX(-py*2.5deg) rotateY(px*2.5deg) translateY(-4px)` with px, py in -0.5..0.5; cleared on pointerleave. It eases through the `transform .6s var(--ease-out)` transition above.
- Spotlight (L4621-4624, L166-170): on the three `.card` tiles, a 420px radial `var(--accent-soft)` glow follows the pointer (`--mx`, `--my`).

#### 11.3.4 Services (HTML L3212-3320, CSS L600-644, JS L5061-5102)

##### Layout
- `div.ab-services__grid` (L3214): `grid-template-columns:minmax(0,4.3fr) minmax(0,7.7fr);gap:clamp(32px,6vw,96px);align-items:start` (L601). Max 1023px: one column (L747).
- Aside `div.ab-services__aside` (L3215): `position:sticky;top:clamp(72px,12vh,120px)` (L602); static at max 1023px (L748). Its `.sec-head` has `margin-bottom:36px` (L603).
  - Head: eyebrow `Services`; `h2.sec-title[data-split]` `What I Do ` + `span.serif.grad-text` `Best`; lead `Four areas I work across, from the first screen to the cloud it runs on.`
  - `ol.ab-svc-index[aria-hidden="true"][data-reveal]` (L3221-3223): `li[data-i="0"]` `Web`, `li[data-i="1"]` `Mobile`, `li[data-i="2"]` `AI / LLM`, `li[data-i="3"]` `Cloud`. CSS L604-608, L625-626: list `display:grid;gap:2px;border-left:1px solid var(--line-strong);position:relative`; li `padding:8px 0 8px 18px;font-family:var(--font-mono);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)`; li `::before` 2px bar `background:var(--grad-glow);transform:scaleY(0)`, `li.is-on` bar `transform:none` and `color:var(--brand-ink)` (transitions `var(--dur-2) var(--ease-out)`). List `::after`: 1px full height line `background:var(--grad-glow);transform-origin:50% 0;transform:scaleY(var(--lp,0));opacity:.5` (overall scroll progress). Hidden at max 1023px (L749).

##### Rows
- `div.ab-svc-list[data-stagger="90"]` (L3226). CSS L610 `--pad:clamp(18px,2.4vw,32px);--num:clamp(56px,6.4vw,96px);--gap:clamp(14px,2vw,28px);display:grid;gap:10px`. Max 640px `--num:44px;--pad:18px;--gap:14px` (L789).
- Row structure (first row L3227-3248):
```
article.ab-svc[.is-open on row 1][.ab-svc--ai on row 3][data-spotlight][data-reveal]
  h3.ab-svc__h
    button.ab-svc__btn[type=button][aria-expanded][aria-controls="ab-svc-pN"][id="ab-svc-bN"]
      span.ab-svc__num[aria-hidden] "0N"
      span.ab-svc__titles > span.label (kicker) + span.ab-svc__title
      span.ab-svc__ico[aria-hidden] > svg.i > use #i-plus
  div.ab-svc__panel#ab-svc-pN[role="region"][aria-labelledby="ab-svc-bN"]
    div.ab-svc__inner > div.ab-svc__body
      p.ab-svc__desc
      ul.ab-feats > li (svg #i-check + text) x3
      div.tags > span.tag xN
```
- Row 1 starts open: `.is-open` and `aria-expanded="true"` in the HTML (L3227, L3229). Rows 2 to 4 `aria-expanded="false"`.
- All copy is in 11.3.10 services.ts.
- CSS:
  - L611 row: `--p:0;position:relative;border-radius:var(--r-lg);border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 55%,transparent);transition:background-color var(--dur-2) var(--ease-out),border-color var(--dur-2),box-shadow var(--dur-2) var(--ease-out),opacity var(--dur-3) var(--ease-out),transform var(--dur-3) var(--ease-out),filter var(--dur-3) var(--ease-out)`. Hover `border-color:var(--line-strong)`. Open `background:var(--surface);border-color:var(--line-strong);box-shadow:var(--shadow-md)`.
  - L614 `.ab-svc__h{margin:0;font:inherit}`. L615 button `width:100%;display:grid;grid-template-columns:var(--num) minmax(0,1fr) auto;align-items:center;gap:var(--gap);padding:var(--pad);text-align:left;border-radius:inherit`.
  - Number L617-620: `font-size:clamp(2.4rem,4.2vw,3.7rem);font-weight:800;letter-spacing:-.06em;line-height:.9;padding-bottom:.04em;color:transparent;-webkit-text-stroke:1px color-mix(in srgb,var(--brand-ink) 42%,transparent);background:linear-gradient(0deg,var(--accent) 0%,var(--brand) calc(var(--p)*100%),transparent calc(var(--p)*100% + .5%));background-size:100% 100%;background-repeat:no-repeat;background-clip:text;opacity:.9`. Dark swaps the stops: `linear-gradient(0deg,var(--brand) 0%,var(--accent) calc(var(--p)*100%),transparent calc(var(--p)*100% + .5%))`. The outlined number fills from the bottom as `--p` goes 0 to 1. Max 640px `font-size:2.1rem` (L790).
  - L621 open, hover or `.is-focus`: stroke `var(--brand)`, opacity 1. L622 `.is-focus:not(.is-open)`: `border-color:var(--line-strong);background:color-mix(in srgb,var(--surface) 80%,transparent)`.
  - Title L623-624, L629: `font-size:clamp(1.3rem,2.3vw,1.95rem);font-weight:700;letter-spacing:-.035em;line-height:1.1;color:var(--ink)`, `translate:4px 0` on `.is-focus` or button hover (transition `translate var(--dur-2) var(--ease-out)`). Titles wrapper `display:grid;gap:6px;min-width:0`, kicker label `color:var(--brand-ink)` (L627-628).
  - Icon L630-633: 44px circle, `border:1px solid var(--line-strong);color:var(--ink-2)`, icon 18px; button hover `border-color:var(--brand);color:var(--brand-ink)`; open `transform:rotate(135deg);background:var(--grad);border-color:transparent;color:#fff` (the plus turns into an x), transition `transform var(--dur-3) var(--ease-out)`.
  - Panel L634-639: `display:grid;grid-template-rows:0fr;transition:grid-template-rows .75s var(--ease-out)`, open `1fr`. Inner `min-height:0;overflow:hidden;position:relative`; closed inner `visibility:hidden;transition:visibility 0s .75s`. Body `display:grid;gap:20px;padding:0 var(--pad) var(--pad) calc(var(--pad) + var(--num) + var(--gap));opacity:0;transform:translateY(-6px);transition:opacity .45s var(--ease-out),transform .6s var(--ease-out)`; open body `opacity:1;transform:none;transition-delay:.12s`. Max 640px body `padding-left:var(--pad)` (L791).
  - Description L640 `color:var(--ink-2);max-width:56ch;font-size:1rem;line-height:1.7`. Features L641-643 `display:flex;flex-wrap:wrap;gap:8px 22px`, li `font-weight:600;font-size:.92rem;color:var(--ink)`, check icon `20px;padding:3px;border-radius:50%;background:var(--accent-soft);color:var(--brand-ink);stroke-width:2.4`.
  - AI row open (L644): `background:linear-gradient(var(--surface),var(--surface)) padding-box,linear-gradient(135deg,var(--accent),var(--line) 45%,var(--line) 70%,var(--brand)) border-box;border-color:transparent` (gradient border).
- Interactions: accordion (one open at a time, the open one can be closed so none are open), scroll progress (`--p`, `.is-focus`, `--lp`). See 11.3.9.

#### 11.3.5 Testimonials (HTML L3322-3371, CSS L646-678, JS L5104-5161)

##### Layout and head
- `div.ab-tst__grid` (L3324) `grid-template-columns:minmax(0,4.6fr) minmax(0,7.4fr);gap:clamp(32px,6vw,96px);align-items:center` (L647); one column at max 1023px (L747).
- `div.sec-head.ab-tst__head` (L3325, `margin-bottom:0` L648): eyebrow `Testimonials`; `h2.sec-title[data-split]` `Client ` + `span.serif.grad-text` `Success Stories`; lead `A few words from people I have built things with.`
- `div.ab-tst__ctrl[data-reveal]` (L3329, L649 `display:flex;align-items:center;gap:10px;margin-top:10px`):
  - `button.ab-nav[data-tst="prev"][aria-label="Previous testimonial"]` `#i-arrow-left`
  - `button.ab-nav[data-tst="next"][aria-label="Next testimonial"]` `#i-arrow-right`
  - `span.ab-tst__count.label[aria-hidden="true"]`: `b#ab-tst-cur` `01` + ` / 03` (L653-654 `margin-left:12px;font-size:.78rem`, `b{color:var(--ink);font-weight:500}`)
  - `.ab-nav` (L650-652): 52px circle, `border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);box-shadow:var(--shadow-sm)`, hover `border-color:var(--brand);color:var(--brand-ink);transform:translateY(-2px)`, icon 19px. JS adds `aria-controls="ab-slides"` (L5130).

##### Carousel
```
div.ab-carousel.card#ab-carousel[role=region][aria-roledescription=carousel][aria-label="Client success stories"][data-reveal=scale]
  span.ab-carousel__mark.serif[aria-hidden][data-parallax="0.07"]  (U+201C)
  div.ab-slides#ab-slides[aria-live="off"]
    figure.ab-slide[.is-active][role=group][aria-roledescription=slide][aria-label="1 of 3"]  (slides 2 and 3 carry aria-hidden="true")
      blockquote.ab-quote
      figcaption.ab-author > span.ab-avatar[aria-hidden] (initials) + span.ab-author__txt > strong (name) + span (role)
      div.tags > span.tag x3
  div.ab-dots[role=group][aria-label="Choose testimonial"]
    button.ab-dot[.is-active][aria-label="Testimonial N"][aria-current="true" on the active one] > span > i
```
- Copy for the 3 slides is in 11.3.10 testimonials.ts.
- CSS:
  - L656 carousel `padding:clamp(40px,5vw,64px) clamp(28px,4vw,56px) clamp(22px,3vw,36px);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--shadow-md);touch-action:pan-y`. Max 640px `padding:28px 22px 18px` (L793).
  - L657 mark `position:absolute;top:0;right:clamp(10px,2vw,28px);padding:0 .14em 0 .06em;font-size:clamp(9rem,15vw,13rem);line-height:1;pointer-events:none;user-select:none;background:var(--grad-glow);background-clip:text;color:transparent;opacity:.22`. Max 640px `font-size:8rem;right:14px` (L794).
  - L658 slides `display:grid;position:relative;z-index:1`. L660-661 slide `grid-area:1/1;margin:0;display:flex;flex-direction:column;opacity:0;visibility:hidden;transition:visibility 0s .6s`; active `opacity:1;visibility:visible;transition:none`. (All slides share one cell, so the height is the tallest slide.)
  - L662 quote `margin:0 0 clamp(24px,3vw,36px);font-size:clamp(1.18rem,1.85vw,1.6rem);line-height:1.5;font-weight:500;letter-spacing:-.018em;color:var(--ink);text-wrap:pretty`.
  - L663-667 author `display:flex;align-items:center;gap:14px;margin:auto 0 16px;padding-top:clamp(20px,2.4vw,28px);border-top:1px solid var(--line)`; avatar 52px circle `background:var(--grad);color:#fff;font-weight:700;font-size:.95rem;letter-spacing:.02em;box-shadow:var(--glow)`; name `strong` `color:var(--ink);font-weight:700;font-size:1.02rem`; role `span` `color:var(--muted);font-size:.88rem`.
  - L668-676 dots: row `position:relative;z-index:1;display:flex;gap:6px;margin-top:clamp(22px,3vw,34px)`; dot button `height:44px;width:30px;display:flex;align-items:center;transition:width var(--dur-2) var(--ease-out)`, active `width:64px`; track `span` `width:100%;height:4px;border-radius:4px;background:var(--line-strong);overflow:hidden`; fill `i` `position:absolute;inset:0;background:var(--grad-glow);transform-origin:0 50%;transform:scaleX(0)`, active `scaleX(1)`.
  - Autoplay timer (L675-678): `.ab-carousel.is-auto .ab-dot.is-active i{transform:scaleX(0);animation:ab-fill 7s linear forwards}`, `@keyframes ab-fill{to{transform:scaleX(1)}}`. Paused: `@media (hover:hover)` on carousel hover; on `:focus-within`; on `.is-off`.
- Behaviour (go, direction aware animations, dots, arrows, keyboard, swipe, autoplay): see 11.3.9.

#### 11.3.6 Pricing and the "Talk first" aside (HTML L3373-3434, CSS L680-732, JS L5163-5171)

##### Head
- `div.sec-head.sec-head--center` (L3375): eyebrow `Pricing`; `h2.sec-title[data-split]` `Investment ` + `span.serif.grad-text` `Plans`; lead `One clear hourly rate for full stack and AI work.`

##### Grid
- `div.ab-price__grid` (L3381) `grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(20px,3vw,40px);max-width:1080px;margin-inline:auto;align-items:stretch` (L681). Max 1023px `grid-template-columns:1fr;max-width:680px` (L751).

##### Plan card (L3382-3404)
```
article.ab-plan[data-reveal=scale]
  div.ab-plan__in[data-spotlight]
    div.ab-plan__top
      div > h3.ab-plan__name "Professional" + p.ab-plan__kicker.label "Full Stack + AI Power"
      span.icon-tile > #i-zap
    p.ab-plan__price > span.ab-plan__cur "$" + span.ab-plan__amt[data-count="25"][data-duration="1400"] "0" + span.ab-plan__per "/hour"
    ul.ab-plan__list > li (#i-check + text) x7
    a.btn.btn--primary.ab-plan__cta[href="#contact"][data-magnetic="0.15"] "GET STARTED " + #i-arrow-right
    p.ab-plan__foot "Need a custom solution? " + a[href="#contact"] "Let's discuss your project"
```
- Features: AI/LLM Integration, Frontend, Backend API, Database, Performance, Cloud, Maintenance.
- CSS:
  - L682 `.ab-plan{position:relative;padding:1.5px;border-radius:var(--r-xl);background:linear-gradient(145deg,var(--accent),var(--line-strong) 35%,var(--line) 60%,var(--brand));box-shadow:var(--shadow-lg)}` (the 1.5px padding shows the gradient as a border); L686 `isolation:isolate`.
  - L683 inner `position:relative;height:100%;display:flex;flex-direction:column;border-radius:calc(var(--r-xl) - 1.5px);background:var(--surface);padding:clamp(26px,3.4vw,48px);overflow:hidden`. L694 inner `::after` glow `right:-20%;top:-35%;width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,var(--accent-soft),transparent)`.
  - L695-697 top `display:flex;justify-content:space-between;align-items:flex-start;gap:16px`; name `font-size:clamp(1.5rem,2.2vw,1.9rem);letter-spacing:-.035em`; kicker `margin-top:8px;color:var(--brand-ink)`.
  - L698-701 price row `display:flex;align-items:baseline;gap:6px;margin:clamp(22px,3vw,34px) 0 clamp(20px,2.6vw,28px);padding-bottom:clamp(20px,2.6vw,28px);border-bottom:1px solid var(--line)`; currency `font-size:clamp(2rem,3.2vw,2.8rem);font-weight:700;color:var(--brand-ink);align-self:flex-start;margin-top:.5em;letter-spacing:-.03em`; amount `font-size:clamp(5rem,9vw,7.6rem);font-weight:800;letter-spacing:-.07em;line-height:.85;color:var(--ink);font-variant-numeric:tabular-nums`; per `font-size:1.05rem;font-weight:600;color:var(--muted);margin-left:4px`.
  - L702-704 list `margin:0 0 clamp(26px,3vw,36px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 20px`; li `display:flex;align-items:center;gap:10px;font-weight:600;color:var(--ink);font-size:.97rem`; icon `24px;padding:5px;border-radius:50%;background:var(--grad);color:#fff;stroke-width:2.6`. Max 640px `grid-template-columns:1fr 1fr;gap:12px 12px`, li `.9rem` (L795-796). Max 380px one column (L801).
  - L705 CTA `width:100%;margin-top:auto;letter-spacing:.08em;font-size:.88rem;--h:56px`. Magnetic strength 0.15.
  - L706-708 foot `margin-top:18px;text-align:center;font-size:.9rem;color:var(--muted)`; link `color:var(--brand-ink);font-weight:700;text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:4px;display:inline-block;padding-block:10px;margin-block:-10px`, hover `text-decoration-color:currentColor`.
- Border light sweep (L684-693):
  - `@property --ab-ang{syntax:'<angle>';inherits:false;initial-value:0deg}` (must be registered globally).
  - `::before` and `::after`: `inset:0;border-radius:inherit;pointer-events:none;background:conic-gradient(from var(--ab-ang),transparent 0 64%,rgba(95,207,159,.0) 66%,var(--mint) 78%,var(--accent) 82%,transparent 92%);animation:ab-sweep 14s linear infinite;animation-play-state:paused`.
  - `::before`: `padding:1.5px`, masked to the border ring (`mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)`; webkit `-webkit-mask-composite:xor`), `z-index:2`.
  - `::after`: `z-index:-1;filter:blur(18px);opacity:.35;inset:-2px` (soft outer glow that follows the light).
  - `.ab-plan.is-live` sets `animation-play-state:running` on both. `@keyframes ab-sweep{to{--ab-ang:360deg}}` (one lap per 14s, clockwise).
  - Reduced motion: `::before` animation none (L807); JS never adds `.is-live`.
- Links: both `#contact` links route to the Contact page (rebuild `/contact`).

##### Aside "Talk first" (L3406-3432)
```
aside.ab-side[aria-label="Talk first"][data-stagger="90"]
  div.ab-side__head[data-reveal] > span.label "Prefer to talk first?" + p.ab-side__title "Book a session and we can plan it together."
  button.card.card--hover.ab-sess[type=button][data-book][data-spotlight][data-reveal]
    span.ab-sess__time > b "30" + span "min"
    span.ab-sess__txt > strong "Quick Chat" + span "Perfect for initial discussions and project exploration"
    span.ab-sess__price "$15" + span "per session"
  button.card.card--hover.ab-sess[type=button][data-book="deep"][data-spotlight][data-reveal]
    span.ab-sess__time > b "60" + span "min"
    span.ab-sess__txt > strong "Technical Deep Dive" + span "Comprehensive discussion for complex projects"
    span.ab-sess__price "$25" + span "per session"
  div.card.ab-side__card[data-reveal]
    dl.ab-mini > div (dt.label + dd) x3: "Response Time" "24h"; "Projects Completed" "10+"; "Client Satisfaction" "100%"
    ul.ab-side__notes > li (#i-video) "Video Call or Phone"; li (#i-globe) "Based in Pakistan, serving clients worldwide"
```
- CSS L710-732: aside `display:flex;flex-direction:column;gap:14px`; head `padding:4px 4px 8px`; title `margin-top:10px;font-size:clamp(1.3rem,2vw,1.6rem);font-weight:700;letter-spacing:-.03em;line-height:1.2;color:var(--ink)`.
  - Session button `width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px;padding:22px 22px 22px 20px;text-align:left;border-radius:var(--r-lg)`. Time tile `60px` square, `border-radius:16px;display:grid;place-content:center;justify-items:center;background:var(--brand-soft);border:1px solid var(--line);color:var(--brand-ink);line-height:1;transition:background-color var(--dur-2),color var(--dur-2)`; `b` `font-size:1.35rem;font-weight:800;letter-spacing:-.04em`; `span` `font-family:var(--font-mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;margin-top:3px` (so "min" shows as MIN). Text `display:grid;gap:3px;min-width:0`, `strong` `color:var(--ink);font-weight:700;font-size:1rem;letter-spacing:-.01em`, `span` `font-size:.84rem;color:var(--muted);line-height:1.45`. Price `display:grid;justify-items:end;font-size:1.35rem;font-weight:800;letter-spacing:-.04em;color:var(--ink);line-height:1.1`, note `font-size:.66rem;font-weight:600;letter-spacing:.02em;color:var(--muted);white-space:nowrap`. Hover: time tile `background:var(--grad);color:#fff;border-color:transparent`, plus `.card--hover` shadow and border (see Notes and traps about the lift).
  - Max 640px (L797-798): session `grid-template-columns:auto minmax(0,1fr);row-gap:10px`; price `grid-column:2;justify-items:start;display:flex;align-items:baseline;gap:8px`.
  - Side card `margin-top:auto;padding:22px 22px 20px;border-radius:var(--r-lg)` (sits at the bottom of the aside). Mini stats `grid-template-columns:repeat(3,minmax(0,1fr));margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid var(--line)`; each `div` `display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:6px;min-width:0`, `div+div` `padding-left:14px;border-left:1px solid var(--line)`; `dd` `margin:0;font-size:1.6rem;font-weight:800;letter-spacing:-.045em;line-height:1;color:var(--ink)`; `dt` `font-size:.58rem;letter-spacing:.1em;line-height:1.4`. The mini stat values are static text (no count up). Notes `display:grid;gap:10px`, li `display:flex;align-items:center;gap:10px;font-size:.88rem;color:var(--ink-2)`, icon 17px `color:var(--brand-ink)`.
- Clicks: Quick Chat button `FH.openBooking('')` (Quick Chat preselected); Deep Dive button `FH.openBooking('deep')` (L4658, L6166-6172). The prices and durations match the booking `TYPES` (L5798-5801).

#### 11.3.7 Responsive index for about.css
| Query | Line | Changes |
|---|---|---|
| `(min-width:1181px)` | L430 | orbit stage `left:-14px` |
| `(max-width:1180px) and (min-width:901px)` | L735-739 | hero columns `1fr .94fr`; stage `min(540px,64vh,calc(100% + 16px))`, `--ph:.42;--rt:.272;--r1:.34;--r2:.43`; ring 3 badges hidden |
| `(min-width:1024px) and (max-height:800px)` | L740-744 | hero padding; stats margin; `.stat-num` `clamp(1.7rem,2.6vw,2.2rem)` |
| `(max-width:1023px)` | L745-753 | hero `padding-top:104px`; services and testimonials one column; services aside static; index hidden; bento cards span 6; pricing one column `max-width:680px`; scroll cue hidden |
| `(max-width:900px)` | L754-760 | hero stacks (copy then visual), `min-height:0;padding-bottom:40px`, `row-gap:clamp(40px,8vw,64px)`; stage `min(480px,calc(100% - 20px))`; name `--fs:clamp(3.6rem,22.5vw,8rem)`; stats `max-width:none` |
| `(max-width:640px)` | L761-799 | name row 2 and line; role line wraps, connector swap; CTA buttons share the row; socials 44px; orbit phone values and icon only badges; ring text 65px; stat labels; head split one column; bento full width; card values margin; avail orbit offset; services `--num:44px;--pad:18px;--gap:14px`, number 2.1rem, body padding; carousel padding and mark; plan list; session layout |
| `(max-width:380px)` | L800-803 | plan list one column; CTA buttons `padding:0 12px;font-size:.9rem` |
| `(hover:hover)` | L677 | carousel hover pauses the autoplay fill |
| `(prefers-reduced-motion:reduce)` | L806-810 | see 11.3.8 |

#### 11.3.8 Reduced motion
- about.css L806-810: animation none on the scroll cue arrow, typer caret, live dot and plan `::before`; marquee mask off and `overflow-x:auto`; row 2 line `transform:none`.
- Global L357-362: every animation and transition runs for .001ms once; reveals shown; split words shown.
- about.js with `FH.reduce` true: typer swaps plain text every 3400ms; orbit gets `.is-in` at once, badges placed statically at their `data-a` angles (t = 0), no loop, no parallax, no scroll exit; marquee script does not start; services `--p` is 1 on every row and no scroll tracking; carousel has no autoplay (`aria-live="polite"` at once) and no Web Animations (classes only); pricing sweep never runs. Count ups show the final value at once (L4616).

#### 11.3.9 JS behaviours for React

##### Page activity model (L4800-4803)
- Starts when: script load. `isCur()` is true when `FH.current` is empty or `'about'`. `pageFns` run on `fh:page` with `on = detail==='about'`.
- Writes: nothing itself.
- Port as: in the rebuild the About page is route `/`. Mount means "page on", unmount means "page off", and `isCur()` is always true while mounted. Every "page on" hook below runs on mount; every "page off" action becomes cleanup.

##### CV link (L4805-4807)
- Writes `href` of `[data-cv]` to `FH.asset('imgs/Faisal-CVS.pdf')`.
- Port as: render `href={site.cvPath}` (`/imgs/Faisal-CVS.pdf`) with `download`. No hook.

##### Hero visibility (L4809-4813)
- Starts when: IntersectionObserver on `#ab-hero`, `{threshold:0}`. `heroVisible` starts `true`.
- Writes: `heroVisible`, then calls every `heroFns` entry (the orbit `kick`).
- Pauses or skips: no IntersectionObserver means always visible.
- Cleanup in React: disconnect the observer.
- Port as: `useInView(heroRef, { threshold: 0 })` in `AboutHero`, value passed to `RoleTyper` and `OrbitalPortrait` (context or props).

##### Role typer (L4815-4842)
- Starts when: script load. Roles: `Frontend Development`, `Backend Development`, `Database Management`, `System Design`, `Cloud Orchestration`.
- Reads: `heroVisible`, `isCur()`, `document.hidden` through `idle()`.
- Writes: children of `#ab-typer`, one `span.ab-ch` per character.
- Timings (normal motion):
  1. `setWord(roles[0])`: builds spans with inline `animation:none` (the first word does not animate; the `.ab-role` reveal shows it).
  2. After 5200ms: `erase()`.
  3. `erase()`: if idle, retry after 700ms. Else remove the last char, next removal after 26ms. When empty: `idx=(idx+1)%5`, then `typeNext()` after 320ms.
  4. `typeNext()`: append one `span.ab-ch` (plays `ab-ch .42s`) immediately and every 58ms. When the word is complete, `erase()` after 2300ms.
- Reduced motion: `setInterval` 3400ms; if not idle, `idx=(idx+1)%5` and `el.textContent=roles[idx]` (plain text, no spans).
- Pauses or skips when: `erase` waits (700ms polling) while the hero is off screen, the page is not current or the tab is hidden. Typing that already started is not paused.
- Cleanup in React: clear every pending timeout and the interval; keep timer ids in a ref.
- Port as: `RoleTyper` component with `useRoleTyper(roles, { reduce, isIdle })`. Render characters as React state (array of chars) with `key` per index, first word with `style={{ animation: 'none' }}`.

##### Orbit loop (L4853-4918, L4956-4963)
- Constants: `SAT_W = TAU/120` (badges: one lap per 120s, 3 deg/s, clockwise, same for rings 2 and 3), `PAR = 7` (px of whole system parallax), dots `TAU/100 * data-w` rad/s (with `data-w="1.4"`: 1.4 laps per 100s, 5.04 deg/s, clockwise), dashed ring drift `t * data-drift` (ring 2 only, `-2`, units are degrees because of `pathLength=360`), text band `rotate(-t*4 deg)` (4 deg/s counter clockwise, one lap per 90s).
- Starts when: `kick()` from the entrance `play()`, from hero visibility changes, and from `visibilitychange`. `kick` starts rAF only if not running and `running()` is true.
- Reads or measures: `measure()`: `S = parseFloat(getComputedStyle(orb).width) || orb.clientWidth || S` (layout width, so the exit scale does not affect it); each ring's radius fraction from the CSS variable `--r1`, `--r2`, `--r3` on `.ab-orb` (fallback .4). `markHidden()`: a badge is hidden when `offsetParent === null` and computed `display` is `none` (ring 3 badges at 901px to 1180px and at max 640px). Both run at start, on page on and on `resize`.
- Frame: `dt = Math.min(.05,(now-last)/1000)`; `speed += (speedT-speed)*Math.min(1,dt*2.4)`; `t += dt*speed`; render.
- Render writes:
  - ring 2 line `style.strokeDashoffset = (t*drift).toFixed(3)`.
  - each visible badge `.ab-sat`: `transform = translate3d(cos(a)*rr px, sin(a)*rr px, 0)` (values `toFixed(2)`), `opacity = ep.toFixed(3)`, where `rp = frac*S`, `a = data-a (rad) + t*SAT_W - (1-ep)*.5`, `rr = rp*(1+(1-ep)*.1)`, `ep` from the fly in (below). Labels stay upright (only translate).
  - each dot: `transform = translate3d(cos(da)*rp px, sin(da)*rp px, 0)`, `da = data-a (rad) + t*TAU/100*data-w`.
  - `.ab-orb` `style.translate = (mx*7)px (my*7)px` when `|mx|+|my| > .001`, else `''`.
  - `.ab-orb__text` `style.transform = rotate(<-t*4>deg)` (`toFixed(3)`).
- Hover slow down: `pointerenter` on `#ab-portrait` or any `.ab-sat` sets `speedT=.12`; `pointerleave` sets `speedT=1`. Speed eases with the `dt*2.4` factor above.
- Pauses or skips when: `running()` is false: reduced motion, page not current, hero off screen (`heroVisible` false), or tab hidden. The loop simply stops requesting frames; `t` keeps its value, so it resumes where it stopped.
- Cleanup in React: cancel rAF; remove resize, visibilitychange and pointer listeners.
- Port as: `OrbitalPortrait` component with `useOrbit({ orbRef, heroRef, heroVisible, reduce, fine })`. Keep the radii in CSS and read them with `getComputedStyle` like the reference, so breakpoints stay in one place. Write styles directly to refs, never through React state per frame.

##### Orbit entrance (L4919-4955)
- `intro(delay)`: remove `.is-in`, add `.is-pre`. Reduced motion: swap to `.is-in` at once, render once, stop. Otherwise `introDone=false`, `introAt = now + 1e7` (keeps badges hidden), render once, `pending=false`; if `delay===null` stop here; else after `delay` ms: `play()` if the orb is in view, otherwise `pending=true`.
- `play()`: `pending=false`; force reflow (`void orb.offsetWidth`); swap `.is-pre` for `.is-in` (CSS transitions in 11.3.1 play); `introAt = now`; `kick()`; if not running, render once.
- Badge fly in (in render): `p = clamp((now - introAt - 300 - ord*45)/850, 0, 1)`, `ep = 1 - (1-p)^3`. `ord` is the badge's rank by angle over all 8 badges: React 0 (300ms), Next.js 1 (345ms), Node.js 2 (390ms), Claude 3 (435ms), OpenAI 4 (480ms), MongoDB 5 (525ms), AWS 6 (570ms), React Native 7 (615ms); each flies for 850ms, starting 0.5 rad (about 28.6 deg) behind its angle and 10% further out, fading in. `introDone` becomes true once `now - introAt > 2400`.
- Orb in view: IntersectionObserver on `#ab-orb`, `{threshold:.3}`; when it enters with `pending` and the page current, `play()`. (On narrow screens the orbit sits below the fold, so the entrance waits until it scrolls in.)
- First load: if `<html>` already has `.is-loaded`, `intro(0)`. Else `intro(null)` and a MutationObserver on `<html>` `class`; when `.is-loaded` appears, disconnect and `intro(120)`.
- Page on: `measure(); markHidden(); intro(FH.reduce ? 0 : 480)`. Page off: `.is-pre` again (no transition, hidden state).
- Cleanup in React: clear the delay timeout, disconnect both observers.
- Port as: part of `useOrbit`. On mount: if the preloader is still up, wait for it and use 120ms; if mounting after a route change, use 480ms; reduced motion 0. SSR must render `.ab-orb.is-pre`.

##### Orbit mouse parallax (L4965-4974)
- Starts when: `FH.fine` (`(pointer:fine)` at load) and not reduced motion. `pointermove` on `#ab-hero` (passive), ignored unless `pointerType` is empty or `'mouse'`.
- Reads: orb rect, pointer position. `tmx = clamp((clientX-(left+width/2))/(innerWidth/2), -1, 1)`, `tmy` the same with Y and `innerHeight/2`.
- Writes: targets only; each frame `mx += (tmx-mx)*.06`, `my += (tmy-my)*.06` (per frame, not per second), then `translate` as above (max 7px). `pointerleave` on the hero sets targets to 0.
- Pauses: follows the orbit loop (no frames, no motion).
- Port as: inside `useOrbit`.

##### Hero scroll exit (L4976-4993)
- Starts when: not reduced motion. `scroll` (passive) and `resize`, both rAF throttled; also on page on.
- Reads: `matchMedia('(min-width:901px)')`, `#ab-hero` `offsetHeight` (h) and `getBoundingClientRect().top`.
- Writes (two column layouts only): `p = clamp(-top/(h*.85), 0, 1)`, `e = p*p*(3-2*p)*.5 + p*.5`.
  - `#ab-orb-exit`: `translate = 0 (e*h*.2)px` (`toFixed(1)`), `scale = 1 - e*.14` (`toFixed(4)`), `opacity = 1 - e*.6` (`toFixed(3)`).
  - `#ab-hero-copy`: `translate = 0 (-e*h*.07)px`, `opacity = 1 - e*.5`.
  - At 900px and below: clears all five inline values.
- Pauses or skips when: page not current (returns early), reduced motion (never set up).
- Cleanup in React: remove listeners, cancel the pending rAF, clear inline styles.
- Port as: `useHeroScrollExit({ heroRef, exitRef, copyRef, reduce })`.

##### Lahore clock (L4996-5010)
- Starts when: script load; `tick()` at once, then `setInterval(tick, 15000)`.
- Reads: `new Date(Date.now() + 5*3600*1000)` with UTC getters (fixed UTC+5, no DST).
- Writes:
  - `#ab-time` `innerHTML = hm + '<small>' + ap + '</small>'` where `hm = (h%12 || 12) + ':' + two digit minutes` (hour is not zero padded) and `ap` is `AM` when `h<12`, else `PM`; `aria-label = 'Local time in Lahore ' + hm + ' ' + ap`.
  - `#ab-state` text `In working hours` when Monday to Friday (`wd>=1 && wd<=5`) and `h>=9 && h<18`, else `Outside working hours`.
  - `#ab-daynow` `style.left = ((h*60+m)/1440*100).toFixed(2) + '%'` (glides with the 1s transition).
- Pauses: never (runs on every page and with the tab hidden).
- Cleanup in React: clear the interval.
- Port as: `useLahoreClock()` returning `{ hm, ap, working, dayPercent }`; `LahoreClock` renders. Render the placeholders `--:--` and `Local time` on the server and fill on mount to avoid a hydration mismatch.

##### Copy email (L5012-5023)
- Starts when: click on `[data-copy]`.
- Writes: clipboard; toast `Email copied to clipboard` on success. If `navigator.clipboard` exists and `window.isSecureContext`, `writeText(v)`, else (or on rejection) the fallback: hidden fixed `textarea` (`readonly`, opacity 0), `select()`, `document.execCommand('copy')`; success shows the same toast, failure or exception shows the raw address `mehrfaisal111@gmail.com` as the toast text.
- Timings: toast lasts 3200ms (L4663).
- Port as: `useCopyToClipboard()` plus the shared `toast()`; `CopyButton` component.

##### Marquee (L5025-5059)
- Starts when: not reduced motion and all nodes exist. Adds `.is-js` to `.ab-marquee` (turns off the CSS fallback animation). IntersectionObserver (default threshold 0) sets `inView` and calls `kick`.
- Reads: `w = first .ab-marquee__set offsetWidth` (on start, resize, `document.fonts.ready`, page on); scroll position and time.
- State: `x=0, v=1, vt=1, base=38` (px per second), `vel=0, dir=1, hover=false`.
- Scroll listener (passive): `dy = scrollY - lastY`, `dtt = Math.max(16, now - lastT)`; if `|dy| > 0.5`: `vel = Math.max(vel*.6, |dy|/dtt*1000*.6)` and `dir = dy >= 0 ? 1 : -1`.
- Frame: `dt = Math.min(.05,(now-last)/1000)`; `vel *= Math.pow(.02, dt)` (the impulse keeps 2% per second); `vt = dir * (hover ? .25 : 1) * (1 + Math.min(vel/260, 5))` (up to 6x); `v += (vt - v)*Math.min(1, dt*4)`; `x -= base*v*dt`; wrap `if(x <= -w) x += w; else if(x > 0) x -= w`; write `track.style.transform = translate3d(x.toFixed(2)px,0,0)`.
- Result: slow leftward drift at 38px/s; scrolling down speeds it up leftward; scrolling up reverses it (moves right); hover slows to a quarter.
- Pauses or skips when: off screen, page not current, tab hidden (`run()` false, no more frames). `visibilitychange` and page on call `kick`.
- Cleanup in React: cancel rAF; remove scroll, resize, pointer and visibility listeners; disconnect the observer.
- Port as: `Marquee` component with `useVelocityMarquee({ rootRef, trackRef, setRef, reduce })`.

##### Services accordion (L5061-5076)
- Starts when: click on `.ab-svc__btn`.
- Writes: `open = !it.classList.contains('is-open')`; closes every other open row (removes `.is-open`, sets its button `aria-expanded="false"`); toggles `.is-open` on this row and sets `aria-expanded` to `String(open)`; `sync()` toggles `li.is-on` on the index item with the same position as each open row.
- Initial: row 1 open (from the HTML), `sync()` once.
- Port as: `ServicesAccordion` with `const [openIndex, setOpenIndex] = useState<number | null>(0)`; clicking the open row sets `null`.

##### Services scroll progress (L5078-5101)
- Starts when: not reduced motion. `scroll` (passive) and `resize`, rAF throttled; also page on and once at start.
- Reduced motion (or no list): `--p` set to `1` on every row, nothing else.
- Reads: `vh = innerHeight`, list rect, each row rect. Skips when `lr.bottom < -vh*.2 || lr.top > vh*1.2` or the page is not current.
- Writes:
  - each row `--p = clamp((vh*.86 - r.top)/(vh*.5), 0, 1)` (`toFixed(3)`): the number is empty while the row top is below 86% of the viewport and full when it reaches 36%.
  - `.is-focus` on the row whose `r.top + Math.min(r.height,140)/2` is closest to `vh*.45`, only if that distance is below `vh*.3`; removed from the others.
  - index `--lp = clamp((vh*.55 - lr.top)/Math.max(1, lr.height), 0, 1)` (`toFixed(3)`).
- Cleanup in React: remove listeners, cancel rAF.
- Port as: `useServicesScrollProgress({ listRef, itemRefs, indexRef, reduce })`.

##### Testimonials carousel (L5104-5161)
- State: `i = 0`, `n = 3`, `EASE = 'cubic-bezier(.22,1,.36,1)'`.
- `go(k, user, dir)`: `i = (k+n)%n`; return if unchanged. Default `dir = ((i-prev+n)%n) <= n/2 ? 1 : -1`. Writes: slide `.is-active` and `aria-hidden="true"` on the others; dot `.is-active` and `aria-current="true"` (removed on others); `#ab-tst-cur` text `(i<9?'0':'') + (i+1)`; if `user`, `#ab-slides` `aria-live="polite"`. Then, unless reduced motion or no `animate` support, Web Animations with `dx = 56*dir`:
  - outgoing slide: `{opacity:1,transform:'none',filter:'blur(0px)'}` to `{opacity:0,transform:'translate3d(-dx px,0,0) scale(.985)',filter:'blur(10px)'}`, 560ms, EASE.
  - incoming slide: `{opacity:0,transform:'translate3d(dx px,0,0) scale(.985)',filter:'blur(10px)'}` to `{opacity:1,transform:'none',filter:'blur(0px)'}`, 900ms, delay 140ms, EASE, `fill:'backwards'`.
  - incoming `.ab-author` then `.tags`: `{opacity:0,transform:'translate3d(0,12px,0)'}` to `{opacity:1,transform:'none'}`, 800ms, delays 360ms and 470ms (`360+m*110`), EASE, `fill:'backwards'`.
  - quote mark: `{transform:'translate3d(dx*.35 px,0,0)',opacity:.1}` to `{transform:'none'}`, 1100ms, EASE, `composite:'add'` (it adds to the parallax `translate`).
  - The old slide stays visible for the out animation because hidden slides keep `visibility` for 0.6s (L660).
- Dots: click `go(j, true)` (direction by shortest way round).
- Arrows: `[data-tst]` get `aria-controls="ab-slides"`; click `go(i±1, true, ±1)`.
- Keyboard: `keydown` on `#ab-carousel`: `ArrowRight` `go(i+1,true,1)`, `ArrowLeft` `go(i-1,true,-1)`, both `preventDefault()`.
- Focus: `focusin` sets `aria-live="polite"`; `focusout` to outside the carousel sets `aria-live` to `off` when `.is-auto`, else `polite`.
- Swipe on `#ab-slides`: `pointerdown` (passive) stores `clientX/Y`; `pointerup`: if `|dx| > 45` and `|dx| > |dy|*1.2`, `go(i + (dx<0?1:-1), true, dx<0?1:-1)`; `pointercancel` clears.
- Autoplay: not with reduced motion (then `aria-live="polite"` and stop). Adds `.is-auto`: the active dot's fill (`ab-fill 7s linear forwards`) is the timer; `animationend` with `animationName==='ab-fill'` on the carousel calls `go(i+1,false,1)`. A new active dot restarts the 7s fill.
- Pauses when: CSS pauses the fill on hover (hover capable devices), `:focus-within`, and `.is-off`. `.is-off` is set whenever the carousel is not (in view at `threshold:.35` and page current and tab visible); it is added at start when IntersectionObserver exists, so autoplay waits until the carousel is 35% visible. `visibilitychange` and page changes re-sync.
- Cleanup in React: remove listeners, disconnect the observer, cancel running animations if unmounting mid transition.
- Port as: `TestimonialsCarousel` with `useCarousel({ count: 3, reduce })` for the index and aria, a `useSlideAnimations` effect that runs the Web Animations on index change (keep `el.animate`, not CSS classes), `onAnimationEnd` on the root checking `animationName === 'ab-fill'` (keyframe names must stay global, not CSS module hashed).

##### Pricing border light sweep (L5163-5171)
- Starts when: not reduced motion and IntersectionObserver exists. Observer on `.ab-plan` (threshold 0).
- Writes: `.is-live` on `.ab-plan` when visible, page current and tab visible (CSS runs the 14s sweep only then).
- Cleanup in React: disconnect, remove the visibility listener.
- Port as: `useInViewClass(planRef, 'is-live', { pauseWhenHidden: true })` (shared hook).

##### Core behaviours used on this page (documented with the core script)
Split words L4572, reveal observer L4593, count up L4613, spotlight L4620 (`data-spotlight`), magnetic L4626 (Download CV 0.25, GET STARTED 0.15), tilt L4632 (four bento cards, 2.5), `data-book` click handler L4658, toast L4662, in page anchor routing L4713-4723 (`#ab-know`, `#contact`), next page link L4732, parallax L4760 (`.ab-kc__orbit` -0.08, `.ab-carousel__mark` 0.07).

#### 11.3.10 Content data

##### frontend/src/content/site.ts
```ts
export interface SiteInfo {
  name: string;
  role: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  location: string;
  timezoneLabel: string;
  /** Lahore offset used by the clock. Fixed UTC+5, no DST (L5001). */
  utcOffsetHours: number;
  /** Working hours used by the clock state and the day bar (L5005, L566). */
  workingHours: { days: number[]; startHour: number; endHour: number };
  /** Reference: https://faisalhanif.work/imgs/Faisal-CVS.pdf (L3040, L4807). */
  cvPath: string;
}

export const site: SiteInfo = {
  name: 'Faisal Hanif',
  role: 'Software Engineer',
  email: 'mehrfaisal111@gmail.com',
  phoneDisplay: '+92 314 8166354',
  phoneHref: 'tel:+923148166354',
  location: 'Lahore, Pakistan',
  timezoneLabel: 'GMT+5',
  utcOffsetHours: 5,
  workingHours: { days: [1, 2, 3, 4, 5], startHour: 9, endHour: 18 },
  cvPath: '/imgs/Faisal-CVS.pdf',
};
```

##### frontend/src/content/socials.ts
```ts
export type SocialIcon = 'i-linkedin' | 'i-xlogo' | 'i-github' | 'i-quora' | 'i-instagram';

export interface Social {
  id: 'linkedin' | 'x' | 'github' | 'quora' | 'instagram';
  /** Used as aria-label (the About hero shows icons only). */
  label: string;
  href: string;
  icon: SocialIcon;
}

/** About hero order, L3049-3053. Links open with target="_blank" rel="noopener". */
export const socials: Social[] = [
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/faisal-frontend-developer/', icon: 'i-linkedin' },
  { id: 'x', label: 'X (Twitter)', href: 'https://x.com/FaisalHanif333', icon: 'i-xlogo' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/FaisalHanif12', icon: 'i-github' },
  { id: 'quora', label: 'Quora', href: 'https://www.quora.com/profile/Faisal-Hanif-126', icon: 'i-quora' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/faisal_hanif_0/', icon: 'i-instagram' },
];

export const socialsAriaLabel = 'Social profiles';
```

##### frontend/src/content/services.ts
```ts
export interface SectionHead {
  eyebrow: string;
  /** Optional number shown in <b> before the eyebrow text. */
  eyebrowNum?: string;
  /** Plain words of the h2, before the accent. */
  titleText: string;
  /** Words wrapped in span.serif.grad-text. */
  titleAccent: string;
  lead: string;
}

export interface Service {
  id: string;
  /** Outlined number, e.g. "01". */
  num: string;
  /** span.label above the title. */
  kicker: string;
  /** Text in the side index (ol.ab-svc-index). */
  indexLabel: string;
  title: string;
  description: string;
  features: string[];
  tags: string[];
  /** Row 3 gets .ab-svc--ai (gradient border when open). */
  variant?: 'ai';
}

export const servicesHead: SectionHead = {
  eyebrow: 'Services',
  titleText: 'What I Do',
  titleAccent: 'Best',
  lead: 'Four areas I work across, from the first screen to the cloud it runs on.',
};

/** Index of the row open on first render (L3227). */
export const servicesDefaultOpen = 0;

export const services: Service[] = [
  {
    id: 'web',
    num: '01',
    kicker: 'Frontend',
    indexLabel: 'Web',
    title: 'Web Development',
    description: 'Crafting responsive, high-performance web applications using modern frameworks and cutting-edge technologies.',
    features: ['Responsive Design', 'Performance Optimization', 'Modern UI/UX'],
    tags: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'API Integration'],
  },
  {
    id: 'mobile',
    num: '02',
    kicker: 'Mobile',
    indexLabel: 'Mobile',
    title: 'Mobile Development',
    description: 'Creating cross-platform mobile applications with native performance and exceptional user experience.',
    features: ['Cross-Platform', 'Native Performance', 'App Store Ready'],
    tags: ['React Native', 'Expo', 'iOS', 'Android', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'API Integration'],
  },
  {
    id: 'ai',
    num: '03',
    kicker: 'AI / LLM',
    indexLabel: 'AI / LLM',
    title: 'AI/LLM Integration',
    description: 'Integrating large language models into real products: intelligent assistants, AI-powered features, and automated workflows that make applications smarter.',
    features: ['AI Chatbots & Assistants', 'Agentic Workflows', 'Personalized AI Features'],
    tags: ['OpenAI', 'Claude', 'LLM APIs', 'Prompt Engineering', 'RAG', 'MCP'],
    variant: 'ai',
  },
  {
    id: 'cloud',
    num: '04',
    kicker: 'Cloud',
    indexLabel: 'Cloud',
    title: 'Cloud Orchestration',
    description: 'Orchestrating, deploying, and scaling cloud infrastructure with containerization, CI/CD pipelines, and modern DevOps practices for reliable production systems.',
    features: ['Cloud Architecture', 'Automated Deployment', 'Scalable Infrastructure'],
    tags: ['AWS', 'Docker', 'CI/CD', 'Vercel', 'Netlify'],
  },
];
```
Note: `SectionHead` is shared by the four About section heads; move it to a shared types file if another part defines one.

##### frontend/src/content/testimonials.ts
```ts
import type { SectionHead } from './services';

export interface Testimonial {
  quote: string;
  name: string;
  /** Text under the name, exactly as shown. */
  role: string;
  /** Avatar initials (aria-hidden). */
  initials: string;
  tags: string[];
  /** true = looks like template text; the owner must confirm before launch. */
  needsConfirmation: boolean;
}

export const testimonialsHead: SectionHead = {
  eyebrow: 'Testimonials',
  titleText: 'Client',
  titleAccent: 'Success Stories',
  lead: 'A few words from people I have built things with.',
};

export interface TestimonialsUi {
  prevLabel: string;
  nextLabel: string;
  carouselLabel: string;
  dotsLabel: string;
  /** Dot aria-label is dotLabelPrefix + (index + 1), e.g. "Testimonial 1". */
  dotLabelPrefix: string;
  /** Slide aria-label is `${index + 1}${slideLabelJoin}${count}`, e.g. "1 of 3". */
  slideLabelJoin: string;
  /** Length of the ab-fill animation (L675). Informational: the CSS animation is the timer. */
  autoplayMs: number;
}

export const testimonialsUi: TestimonialsUi = {
  prevLabel: 'Previous testimonial',
  nextLabel: 'Next testimonial',
  carouselLabel: 'Client success stories',
  dotsLabel: 'Choose testimonial',
  dotLabelPrefix: 'Testimonial ',
  slideLabelJoin: ' of ',
  autoplayMs: 7000,
};

export const testimonials: Testimonial[] = [
  {
    quote: 'Faisal delivered exceptional work on our React project. His attention to detail and problem-solving skills are outstanding. The application performance improved significantly after his optimizations.',
    name: 'Sarah Johnson',
    role: 'Project Manager, TechCorp',
    initials: 'SJ',
    tags: ['React.js', 'Performance', 'Optimization'],
    needsConfirmation: true,
  },
  {
    quote: 'I had the pleasure of working with Faisal on a challenging project. His exceptional coding skills and problem-solving abilities consistently delivered high-quality work, demonstrating both technical expertise and strong teamwork.',
    name: 'Amnan Hussain',
    role: 'Infinity Edge Technology',
    initials: 'AH',
    tags: ['Team Work', 'Problem Solving', 'Quality Code'],
    needsConfirmation: false,
  },
  {
    quote: "Faisal's expertise in React Native helped us launch our mobile app successfully. His code quality and documentation are top-notch. Highly recommended for any frontend development work.",
    name: 'Emily Rodriguez',
    role: 'Lead Developer, AppSolutions',
    initials: 'ER',
    tags: ['React Native', 'Mobile App', 'Documentation'],
    needsConfirmation: true,
  },
];
```

##### frontend/src/content/pricing.ts
```ts
import type { SectionHead } from './services';

export interface PricingPlan {
  name: string;
  kicker: string;
  icon: 'i-zap';
  currency: string;
  amount: number;
  per: string;
  /** data-duration of the count up (L3391). */
  countDurationMs: number;
  features: string[];
  cta: { label: string; href: string; icon: 'i-arrow-right'; magnetic: number };
  foot: { text: string; linkLabel: string; href: string };
}

export interface TalkFirstSession {
  /** Value of data-book: '' opens Quick Chat, 'deep' opens Technical Deep Dive. */
  bookType: '' | 'deep';
  minutes: string;
  unit: string;
  name: string;
  description: string;
  price: string;
  priceNote: string;
}

export interface MiniStat {
  label: string;
  value: string;
}

export interface TalkFirstNote {
  icon: 'i-video' | 'i-globe';
  text: string;
}

export const pricingHead: SectionHead = {
  eyebrow: 'Pricing',
  titleText: 'Investment',
  titleAccent: 'Plans',
  lead: 'One clear hourly rate for full stack and AI work.',
};

export const pricingPlan: PricingPlan = {
  name: 'Professional',
  kicker: 'Full Stack + AI Power',
  icon: 'i-zap',
  currency: '$',
  amount: 25,
  per: '/hour',
  countDurationMs: 1400,
  features: ['AI/LLM Integration', 'Frontend', 'Backend API', 'Database', 'Performance', 'Cloud', 'Maintenance'],
  // reference href "#contact" (L3401); rebuild route
  cta: { label: 'GET STARTED', href: '/contact', icon: 'i-arrow-right', magnetic: 0.15 },
  // reference href "#contact" (L3402); text keeps its trailing space before the link
  foot: { text: 'Need a custom solution? ', linkLabel: "Let's discuss your project", href: '/contact' },
};

export interface TalkFirst {
  ariaLabel: string;
  label: string;
  title: string;
  sessions: TalkFirstSession[];
  mini: MiniStat[];
  notes: TalkFirstNote[];
}

export const talkFirst: TalkFirst = {
  ariaLabel: 'Talk first',
  label: 'Prefer to talk first?',
  title: 'Book a session and we can plan it together.',
  sessions: [
    {
      bookType: '',
      minutes: '30',
      unit: 'min',
      name: 'Quick Chat',
      description: 'Perfect for initial discussions and project exploration',
      price: '$15',
      priceNote: 'per session',
    },
    {
      bookType: 'deep',
      minutes: '60',
      unit: 'min',
      name: 'Technical Deep Dive',
      description: 'Comprehensive discussion for complex projects',
      price: '$25',
      priceNote: 'per session',
    },
  ],
  mini: [
    { label: 'Response Time', value: '24h' },
    { label: 'Projects Completed', value: '10+' },
    { label: 'Client Satisfaction', value: '100%' },
  ],
  notes: [
    { icon: 'i-video', text: 'Video Call or Phone' },
    { icon: 'i-globe', text: 'Based in Pakistan, serving clients worldwide' },
  ],
};
```

##### frontend/src/content/about.ts
```ts
import { site } from './site';
import type { SectionHead } from './services';

/* ---------- Hero ---------- */
export interface AboutHero {
  greeting: string;
  /** Row 1 plain, row 2 wrapped in span.serif.grad-text. */
  nameRows: [string, string];
  roleChip: { label: string; icon: 'i-code' };
  /** Connector shown before the rolling role above 640px. */
  roleSlash: string;
  cv: { label: string; icon: 'i-download'; href: string };
  book: { label: string; icon: 'i-calendar'; bookType: '' };
  scrollCue: { label: string; href: string };
}

export const aboutHero: AboutHero = {
  greeting: "Hi there! I'm",
  nameRows: ['Faisal', 'Hanif'],
  roleChip: { label: 'Software Engineer', icon: 'i-code' },
  roleSlash: '/',
  cv: { label: 'Download CV', icon: 'i-download', href: site.cvPath },
  book: { label: 'Book Meeting', icon: 'i-calendar', bookType: '' },
  scrollCue: { label: 'Scroll to explore', href: '#ab-know' },
};

/** Rolling role (L4818). The sr-only line is heroRoles.join(', ') (L3035). */
export const heroRoles: string[] = [
  'Frontend Development',
  'Backend Development',
  'Database Management',
  'System Design',
  'Cloud Orchestration',
];

/* ---------- Stats ---------- */
export interface HeroStat {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  /** Not set in the HTML, so FH.count uses its default 1600ms (L4615). */
  durationMs: number;
}

export const heroStats: HeroStat[] = [
  { label: 'Years Coding', value: 3, prefix: '', suffix: '+', durationMs: 1600 },
  { label: 'Projects', value: 10, prefix: '', suffix: '+', durationMs: 1600 },
  { label: 'Companies', value: 3, prefix: '', suffix: '+', durationMs: 1600 },
];

/* ---------- Orbit ---------- */
export type OrbitIcon =
  | 'ab-ic-react'
  | 'ab-ic-node'
  | 'ab-ic-openai'
  | 'ab-ic-aws'
  | 'ab-ic-next'
  | 'ab-ic-claude'
  | 'ab-ic-mongo'
  | 'i-phone-dev';

export interface OrbitRing {
  n: 1 | 2 | 3;
  /** r attribute of the SVG circle; CSS r:calc(var(--rN) * 100%) overrides it. */
  svgR: string;
  /** data-drift: dash offset per unit of t (degrees, pathLength 360). 0 = none. */
  drift: number;
}

export interface OrbitBadge {
  label: string;
  icon: OrbitIcon;
  ring: 2 | 3;
  /** data-a in degrees; 0 = 3 o'clock, positive = clockwise. */
  angleDeg: number;
}

export interface OrbitDot {
  ring: 1;
  angleDeg: number;
  /** data-w: laps per 100 s. */
  lapsPer100s: number;
  small: boolean;
}

export const orbitRings: OrbitRing[] = [
  { n: 1, svgR: '34.5%', drift: 0 },
  { n: 2, svgR: '41.5%', drift: -2 },
  { n: 3, svgR: '49.5%', drift: 0 },
];

export const orbitBadges: OrbitBadge[] = [
  { label: 'React', icon: 'ab-ic-react', ring: 2, angleDeg: 0 },
  { label: 'Node.js', icon: 'ab-ic-node', ring: 2, angleDeg: 90 },
  { label: 'OpenAI', icon: 'ab-ic-openai', ring: 2, angleDeg: 180 },
  { label: 'AWS', icon: 'ab-ic-aws', ring: 2, angleDeg: 270 },
  { label: 'Next.js', icon: 'ab-ic-next', ring: 3, angleDeg: 45 },
  { label: 'Claude', icon: 'ab-ic-claude', ring: 3, angleDeg: 135 },
  { label: 'MongoDB', icon: 'ab-ic-mongo', ring: 3, angleDeg: 225 },
  { label: 'React Native', icon: 'i-phone-dev', ring: 3, angleDeg: 315 },
];

export const orbitDots: OrbitDot[] = [
  { ring: 1, angleDeg: -60, lapsPer100s: 1.4, small: false },
  { ring: 1, angleDeg: 120, lapsPer100s: 1.4, small: true },
];

/** 108 glyphs; ends with U+00A0 (L3104). textLength 5529.2, lengthAdjust "spacing". */
export const orbitRingText =
  'SOFTWARE ENGINEER • AI / LLM • WEB • MOBILE • CLOUD • SOFTWARE ENGINEER • AI / LLM • WEB • MOBILE • CLOUD • ';

export const portrait = {
  /** Extracted from the base64 at L3112. */
  src: '/images/portrait-faisal.webp',
  alt: 'Portrait of Faisal Hanif',
  width: 498,
  height: 696,
  /** Fallback monogram shown when the image fails: "F" + serif "H". */
  monogram: { plain: 'F', serif: 'H' },
} as const;

/* ---------- Marquee ---------- */
export interface MarqueeItem {
  label: string;
  /** span.serif in the visual set. */
  serif: boolean;
}

export const marqueeAriaLabel = 'Tech stack';

/** One set; the track renders it twice (L3135 and L3138 are identical). */
export const marqueeItems: MarqueeItem[] = [
  { label: 'React.js', serif: false },
  { label: 'Next.js', serif: true },
  { label: 'TypeScript', serif: false },
  { label: 'Node.js', serif: true },
  { label: 'Express.js', serif: false },
  { label: 'MongoDB', serif: true },
  { label: 'SQL', serif: false },
  { label: 'React Native', serif: true },
  { label: 'Expo', serif: false },
  { label: 'OpenAI', serif: true },
  { label: 'Claude', serif: false },
  { label: 'LangChain', serif: true },
  { label: 'LangGraph', serif: false },
  { label: 'AWS', serif: true },
  { label: 'Docker', serif: false },
  { label: 'Vercel', serif: true },
  { label: 'Tailwind CSS', serif: false },
];

/* ---------- Get to Know Me (bento) ---------- */
export const knowMeHead: SectionHead = {
  eyebrowNum: '01',
  eyebrow: 'About',
  titleText: 'Get to',
  titleAccent: 'Know Me',
  lead: 'The quickest ways to reach me, and where I am right now.',
};

export interface KnowMeContent {
  email: {
    label: string;
    icon: 'i-mail';
    /** Rendered as local + <wbr> + domain. */
    valueLocal: string;
    valueDomain: string;
    action: { label: string; href: string; icon: 'i-arrow-up-right' };
    copy: { label: string; ariaLabel: string; value: string; icon: 'i-file'; toast: string };
  };
  phone: {
    label: string;
    icon: 'i-phone';
    value: string;
    action: { label: string; href: string; icon: 'i-arrow-up-right' };
  };
  location: {
    label: string;
    icon: 'i-pin';
    value: string;
    zoneLabel: string;
    initialTime: string;
    initialState: string;
    stateWorking: string;
    stateOff: string;
    timeAriaPrefix: string;
    ticks: string[];
  };
  availability: {
    label: string;
    icon: 'i-calendar';
    valueText: string;
    valueSerif: string;
    book: { label: string; icon: 'i-calendar'; bookType: '' };
  };
}

export const knowMe: KnowMeContent = {
  email: {
    label: 'Email',
    icon: 'i-mail',
    valueLocal: 'mehrfaisal111',
    valueDomain: '@gmail.com',
    action: { label: 'Send Email', href: `mailto:${site.email}`, icon: 'i-arrow-up-right' },
    copy: { label: 'Copy', ariaLabel: 'Copy email address', value: site.email, icon: 'i-file', toast: 'Email copied to clipboard' },
  },
  phone: {
    label: 'Phone',
    icon: 'i-phone',
    value: site.phoneDisplay,
    action: { label: 'Call Now', href: site.phoneHref, icon: 'i-arrow-up-right' },
  },
  location: {
    label: 'Location',
    icon: 'i-pin',
    value: site.location,
    zoneLabel: site.timezoneLabel,
    initialTime: '--:--',
    initialState: 'Local time',
    stateWorking: 'In working hours',
    stateOff: 'Outside working hours',
    timeAriaPrefix: 'Local time in Lahore ',
    ticks: ['00', '06', '12', '18', '24'],
  },
  availability: {
    label: 'Availability',
    icon: 'i-calendar',
    valueText: 'Open to',
    valueSerif: 'Work',
    book: { label: 'Book Meeting', icon: 'i-calendar', bookType: '' },
  },
};
```
Rendering notes for the data above: the h2 is `{titleText} <span class="serif grad-text">{titleAccent}</span>` (one space between). "Send Email" and "Call Now" are followed by a space and the icon in the HTML. Availability renders `<span>Open to <span class="serif">Work</span></span>`.

#### Notes and traps
- The PRD and the brief ask for a per letter split, a sheen and a flourish on the name, and a "gliding mark" in the stats. None of these exist in the reference. The name is split by WORD (FH.split, L4573-4591: "Faisal" at 0ms, "Hanif" at 55ms, each rising from 105% over 1s). The only name ornament is the row 2 `::before` line (L386-387). The stats only count up. Per letter animation exists only in the rolling role (`.ab-ch`). Build what the reference has.
- PRD.md says small screens show "the visual on top with centred content below". In the About hero at 900px and below the COPY is on top and the orbit below (`grid-template-areas:"copy" "visual"`, L756), and text stays left aligned. The JS comment at L4936 confirms the orbit starts below the fold.
- Map section 9 cites the row 2 line as "CSS L383-387"; the line rules are L386-387 (L383 is the name size rule).
- First load trap: the core script dispatches the first `fh:page` (L4730) before about.js adds its listener (L4803), so none of the "page on" functions run on first load. The orbit relies on the `.is-loaded` MutationObserver path (`intro(120)`), and the scroll exit and services progress get their first run from the `resize` event dispatched in `show()` (L4685). In React just run the mount logic.
- Services stagger is dead: `#about .ab-svc` (L611) sets a `transition` shorthand with a higher specificity than `.js [data-reveal]` (L178), which resets `transition-delay` to 0. The `data-stagger="90"` on `.ab-svc-list` writes `--d` but the four rows reveal together. Keep the reference CSS as is and it behaves the same; do not "fix" it.
- Session cards do not lift on hover: `.js [data-reveal].is-in{transform:none}` (L186, specificity 0,3,0) beats `.card--hover:hover{transform:translateY(-4px)}` (L160). Only the shadow, border, spotlight and the time tile change. Their reveal transition (with `--d` 90ms and 180ms) also delays those hover transitions. Porting the same CSS keeps this.
- Tilt vs reveal: the bento `ab-clip` animation animates `transform`, and a running CSS animation beats the inline tilt transform, so tilt shows only after the 1.15s reveal.
- Hidden ring 3 badges still take their `ord` slot, so the fly in delays keep gaps (for example Node.js starts at 390ms even when Next.js is hidden).
- The SVG `r` attributes (34.5%, 41.5%, 49.5%) are stale at 901px to 1180px and at 640px and below; the CSS `r` property is what sizes the rings. Browsers without CSS `r` support would show wrong radii. Also register `@property --ab-sw` and `--ab-ang` globally or the ring sweep and the border light do not animate.
- `.ab-orb` must be server rendered with `.is-pre` (L3076), or the portrait flashes before the entrance.
- The portrait fallback: `.is-fallback` (added by `onerror`, L3113) has no CSS. The "FH" monogram layer is always rendered under the image and simply shows once the img is removed. In React keep the fallback layer and drop the `<img>` on `onError`. With next/image use `fill` inside `.ab-portrait__clip`, `priority` (this is the About LCP), `style={{ objectFit:'cover', objectPosition:'50% 16%' }}`. Suggested `sizes` derived from the CSS (not in the reference): `(max-width:640px) 194px, (max-width:900px) 212px, (max-width:1180px) 227px, 250px`.
- The typer only checks idle before erasing; a word that has started typing finishes even off screen. Its timers are never cleared in the reference; in React clear them on unmount.
- The Lahore clock never pauses (15s interval forever). It shows the hour without a leading zero ("9:05" + "AM"). Server render the placeholders `--:--` and `Local time`.
- Marquee direction sticks: after an upward scroll `dir` stays -1, so the strip keeps drifting RIGHT at base speed until the next downward scroll. This is the reference behaviour.
- With reduced motion the marquee JS never runs, the CSS fallback animation is cut to .001ms by the global rule, and the strip becomes a native horizontal scroller without the edge mask (L808).
- Carousel keyboard: arrow keys are handled on `#ab-carousel`, but the prev and next buttons live outside it (in `.ab-tst__ctrl`) and the carousel has no `tabindex`, so arrows work only while a dot has focus.
- The testimonial counter text " / 03" is hard coded in the HTML (L3332); derive it from the data length but keep the two digit format.
- The autoplay timer is the CSS animation named `ab-fill`; the JS checks `e.animationName==='ab-fill'`. If CSS modules hash keyframe names, autoplay silently stops. Keep about.css global.
- The quote mark animation uses `composite:'add'` on `transform` while parallax writes `translate`; both must stay separate properties.
- Copy button fallback shows the raw email as the toast when copying fails; that is intended.
- Testimonials: Sarah Johnson (TechCorp) and Emily Rodriguez (AppSolutions) read like template text and are marked `needsConfirmation: true`. The chat knowledge repeats all three quotes (L6277-6279), so any change must be mirrored there.
- The "Talk first" sessions duplicate the booking `TYPES` (L5798-5801: Quick Chat 30 minutes $15, Technical Deep Dive 60 minutes $25). Keep one source of truth or add a test that they match. "Projects Completed 10+" repeats the hero "Projects 10+".
- Only the first section eyebrow has a number (`<b>01</b> About`); Services, Testimonials and Pricing have none. Do not add numbers.
- Label text is written in normal case in the HTML and uppercased by CSS (`.label`, `.tag`, `.eyebrow`, `.ab-sess__time span`, `.ab-svc-index li`). Keep the source case in data.
- "GET STARTED" is uppercase in the source itself (L3401), not by CSS.
- `div.ab-marquee` has `aria-label="Tech stack"` without a role; keep the markup as in the reference (the sr-only list carries the content).
- The CV link in the HTML is absolute (`https://faisalhanif.work/imgs/Faisal-CVS.pdf`); the rebuild serves `/imgs/Faisal-CVS.pdf` from `frontend/public/`.
- `#contact` links (GET STARTED, "Let's discuss your project") trigger the curtain page change in the reference; in the rebuild they are links to `/contact`, which must play the same curtain.
- The `data-i` attributes on the service index items are unused; the JS matches rows by position.
- Scroll exit and services progress set inline styles that must be cleared on unmount, or they leak if the component is reused.

### 11.4 Profile page (#profile, route /profile)

Sources read line by line: profile.css L1565-2040, HTML L3437-3797, profile.js L6489-6851. Shared rules this page depends on were checked at the lines cited (tokens L25-88, base L94-122, shared components L127-191, page hero L300-301, curtain L311-333, next-page link L336-347, reduced motion L357-362, core script L4559-4786). Sections 1 to 10 of REFERENCE_MAP.md are not repeated here.

Non ASCII characters in these ranges:
- Two em dashes in visible copy: the hero lead (L3449) and the TechXelo description (L3609). Written here as `\u2014`.
- `·` (U+00B7) nine times in the HTML range: L3497, L3548 (three), L3589, L3600, L3614, L3628, L3641.
- `é` (U+00E9) in "résumé" (HTML comments L3438, L3470, the desk `aria-label` L3471, CSS comment L1575-1577, JS comments L6490, L6519).
- `→` comes from the entity `&rarr;` (L3500). `&amp;` appears in L3484, L3677, L3721-3723, L3780.
- No curly quotes. "BACHELOR'S DEGREE" (L3673) uses a plain ASCII apostrophe.

#### 11.4.0 Page frame

##### Root
- `section#profile.section.pf` (L3437), `aria-labelledby="pf-title"`. The core script adds `.page`, `data-page="profile"` and `.is-current` (L4677, L4682). The rebuild renders it at route `/profile`.
- Document title when shown: `Profile · Faisal Hanif` (L4683: `META[id].t+' · Faisal Hanif'`). Curtain label `02 / 05`, title `Profile` (L4675, L4701). Rail and dock link: `a.rail__link[href="#profile"][data-nav="profile"]`, icon `i-file`, text `Profile` (L2978, L2997).
- Section padding: `#profile.pf{padding-top:0;padding-bottom:clamp(8px,2vw,24px)}` (L1579) replaces the `.section` `padding-block:var(--section-y)` (L114).
- Section wide resets: `#profile ul,#profile ol,#profile dl,#profile dd{margin:0;padding:0;list-style:none}` (L1572).
- Blocks in order:

| Lines | Block | Root |
|---|---|---|
| L3439-3564 | Hero ("the résumé as an object") | `header.page-hero.pf-hero#pf-hero` |
| L3566 | Body wrapper (closes L3794) | `div.wrap.pf-body` |
| L3567-3573 | Hidden SVG gradient `#pf-ring-g` used by every ring | `svg.pf-defs` width 0, height 0, `aria-hidden="true"`, `focusable="false"` |
| L3575-3655 | Experience (sticky year plus timeline) | `div.pf-block.pf-exp#pf-exp[role="region"][aria-labelledby="pf-exp-title"]` |
| L3657-3704 | Education | `div.pf-block.pf-edu-block[role="region"][aria-labelledby="pf-edu-title"]` (no id) |
| L3706-3792 | Technical expertise (skill tabs, languages, core chips) | `div.pf-block.pf-tech[role="region"][aria-labelledby="pf-tech-title"]` (no id) |
| after L3794 | "Next page" link injected by the core script (L4732-4736) | `div.wrap > nav.page-next[aria-label="Next page"][data-reveal]` |

- Next page link content for this page (L4733-4735 with `i=1`): label `Next page · 03`, counter `2 / 5`, title `Wor` + `<span class="serif">ks</span>`, arrow icon `i-arrow-right`, `href="#works"`.

##### SVG defs (L3567-3573, CSS L1569-1571)
- `#profile .pf-defs{position:absolute;width:0;height:0;overflow:hidden}` (L1569).
- `linearGradient#pf-ring-g` with `x1="0" y1="0" x2="1" y2="1"`; `stop.pf-stop-a` at offset 0 (`stop-color:var(--accent)`, L1570), `stop.pf-stop-b` at offset 1 (`stop-color:var(--brand)`, L1571). The stop colours come from CSS classes, so the gradient follows the theme. Used by `.pf-mr__bar` (L1695) and `.pf-ring__bar` (L1984) as `stroke:url(#pf-ring-g)`. The desk rings (inside the hero, before the defs in DOM order) reference it too; it must exist once on the page.

##### Tokens and shared classes used
- Tokens (values at L25-88, both themes): `--brand`, `--brand-700`, `--brand-ink`, `--brand-soft`, `--accent`, `--accent-soft`, `--grad`, `--grad-glow`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--line-strong`, `--ink`, `--ink-2`, `--muted`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--glow`, `--r-lg` (24px), `--r-xl` (32px), `--r-pill` (999px), `--fs-lead`, `--fs-label` (.72rem), `--font-serif`, `--font-mono`, `--ease-out` (`cubic-bezier(.22,1,.36,1)`), `--ease-io` (`cubic-bezier(.65,0,.35,1)`), `--dur-1` (.35s), `--dur-2` (.6s).
- Note `--brand-700` is `#0f4c41` in light but `#8fe3c5` in dark (L26, L69). It is used only for the Education sheet arrow on hover (L1729).
- Shared classes (shell CSS): `.wrap` L113, `.section` L114, `.sr-only` L107, `.i` L108, `.serif` L118, `.grad-text` L119, `.label` L121, `.lead` L122, `.eyebrow` L127-128, `.btn`, `.btn--primary`, `.btn--ghost` L134-145, `.dot-live` and `@keyframes fh-ping` L152-153, `.tag`/`.tags` L154-155, `.card`/`.card--hover` L158-160, `.icon-tile`/`.icon-tile--soft` L161-163, `[data-spotlight]` L166-170, reveal system L178-187, split words L189-191, `.page-hero` L300-301.

##### Reveal, split and stagger timing for the body
The reveal observer is `rootMargin:'0px 0px -8% 0px'`, `threshold:.12`, fires once (L4594-4596). It is armed once at boot (L4782, after the preloader) for the whole document, hidden pages included; hidden elements only intersect once their page is shown. Variants used here: plain `data-reveal` (empty value) = from `translate3d(0,26px,0)` + `blur(6px)` (L179); `fade` = `blur(4px)` only (L180); `left` = `translate3d(-32px,0,0)` + `blur(6px)` (L182). All start at opacity 0 and transition opacity, transform and filter over `var(--dur-3) var(--ease-out)` with `transition-delay:var(--d,0ms)` (L178). Split words: `span.w > span`, `--d` = word index x 55ms, rise from `translate3d(0,105%,0)` over `1s var(--ease-out)` (L189-191, L4581, L4585).

| Element | Line | Kind | `--d` |
|---|---|---|---|
| `span.label.pf-bhead__idx` "02.1" | L3580 | fade | 0 |
| `h3#pf-exp-title` | L3581 | split: "Professional" 0ms, "Experience" (whole `.serif.grad-text`) 55ms | |
| `p.pf-bhead__sub` | L3582 | up, `data-delay="150"` | 150ms |
| `div.pf-year` | L3584 | fade, `data-delay="250"` | 250ms |
| `article.pf-role__card` x4 | L3602, L3616, L3630, L3643 | left | 0 |
| `span.label.pf-bhead__idx` "02.2" | L3661 | fade | 0 |
| `h3#pf-edu-title` | L3662 | split: "Educational" 0ms, "Background" 55ms | |
| `p.pf-bhead__sub` | L3664 | up, `data-delay="150"` | 150ms |
| `article.pf-edu--feat` | L3668 | fade, plus the clip animation (11.4.7) | 0 |
| `article#pf-edu-inter` | L3682 | up, `data-delay="120"` | 120ms |
| `article#pf-edu-matric` | L3693 | up, `data-delay="220"` | 220ms |
| `span.label.pf-bhead__idx` "02.3" | L3710 | fade | 0 |
| `h3#pf-tech-title` | L3711 | split: "Technical" 0ms, "Expertise" 55ms | |
| `p.pf-bhead__sub` | L3713 | up, `data-delay="150"` | 150ms |
| `div.card.pf-skills` | L3717 | up | 0 |
| `article.pf-lang` | L3762 | up, `data-delay="120"` | 120ms |
| `article.pf-core` | L3773 | up, `data-delay="80"` | 80ms |
| `li.pf-chipw` x10 | L3779-3788 | up; parent `ul.pf-chips[data-stagger="45"]` (no `data-delay`, so base 0) | 0, 45, 90, 135, 180, 225, 270, 315, 360, 405ms |
| `nav.page-next` | injected | up | 0 |

- The hero does NOT use the reveal system. It has its own entrance driven by `.is-in` (11.4.3).
- `#profile [data-reveal]:not([data-reveal="mask"]).is-in{clip-path:none}` (L2039, comment L2038). It does not beat the featured education card's animation (see Notes and traps).

#### 11.4.1 Hero frame and copy column (HTML L3439-3468 and L3559-3563, CSS L1579-1612 and L1735-1745)

##### Hero root and grid
- `header.page-hero.pf-hero#pf-hero` (L3439). Children in order: `div.pf-hero__bg` (L3440), `div.wrap.pf-hero__wrap` (L3442), `div.pf-hero__foot` (L3559).
- Base `.page-hero` (L300): `position:relative;min-height:min(100svh,1000px);display:flex;flex-direction:column;justify-content:center;padding-top:clamp(110px,14vh,170px);padding-bottom:clamp(56px,9vh,110px)`. Under 1023px (L301): `min-height:auto;padding-top:108px` (padding-bottom stays `clamp(56px,9vh,110px)`).
- `#profile .pf-hero{--sp:0;overflow:clip;isolation:isolate}` (L1580). `--sp` is the scroll exit progress, written by JS (11.4.3).
- At min-width 1024px (L1582-1585): `#profile .pf-hero{padding-top:clamp(84px,12vh,150px);padding-bottom:clamp(84px,11vh,120px)}`.
- `div.wrap.pf-hero__wrap` (L1581): `position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(48px,8vw,72px);align-items:center`. At 1024px and up (L1584): `grid-template-columns:minmax(0,.93fr) minmax(0,1.07fr);column-gap:clamp(36px,4vw,72px)`. Children: `div.pf-hero__copy` (L3443) then `div.pf-desk` (L3471). Below 1024px the copy sits above the desk.

##### Background halo (L3440, CSS L1588-1589)
- `div.pf-hero__bg[aria-hidden="true"] > span.pf-hero__halo`.
- `.pf-hero__bg{position:absolute;inset:0;z-index:0;pointer-events:none}`.
- `.pf-hero__halo{position:absolute;right:-4%;top:12%;width:min(62vw,860px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--accent-soft),transparent 62%)}`.
- Entrance: hidden state `opacity:0;transform:scale(.85)` (L1757); with `.is-in`: `transition:opacity 1.8s var(--ease-out),transform 2.2s var(--ease-out)` (L1769), no delay.
- Phone (L1792): `right:-40%;top:auto;bottom:0;width:130vw`.

##### Copy column (L3443-3468, CSS L1592)
`div.pf-hero__copy`: `position:relative;container-type:inline-size;display:grid;justify-items:start;translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)`. It is a size container, so the title sizes below use `cqw` of this column.

Children in order:

1. Eyebrow (L3444): `span.eyebrow.pf-hi` with `style="--i:0"`, copy `Professional Journey`. `.eyebrow` (L127-128): mono, `var(--fs-label)`, `letter-spacing:.16em`, uppercase, `color:var(--brand-ink)`, weight 500, `gap:12px`, and a `::before` line `28px` by `1px`, `currentColor`, `opacity:.6`.
2. Title (L3445-3448): `h1.pf-hero__title#pf-title`
   - `span.pf-ln.pf-ln--a > span.pf-ln__in[style="--i:1"]` copy `My Professional`
   - `span.pf-ln.pf-ln--b > span.pf-ln__in[style="--i:2"] > span.serif.grad-text` copy `Profile`
   - CSS: `.pf-hero__title{margin-top:clamp(16px,2.6vh,26px);color:var(--ink);font-weight:800;letter-spacing:-.05em}` (L1593). `.pf-ln{display:block;overflow:hidden}` (L1594). `.pf-ln__in{display:inline-block;will-change:transform}` (L1595).
   - `.pf-ln--a{font-size:clamp(2.1rem,min(13.1cqw,8.2vh),4.7rem);line-height:1.02;padding:0 .06em .1em 0;margin-bottom:-.1em}` (L1596).
   - `.pf-ln--b{font-size:clamp(4.6rem,min(30cqw,19.5vh),11.2rem);line-height:.9;padding:0 .12em .14em 0;margin:-.02em 0 -.12em -.03em}` (L1597). `.pf-ln--b .serif{font-weight:400;letter-spacing:-.035em;padding-right:.04em}` (L1598).
3. Lead (L3449): `p.lead.pf-hero__lead.pf-hi[style="--i:4"]`, copy: `A comprehensive overview of my experience, education, and technical expertise in software engineering and AI/LLM integration \u2014 building intelligent, production-ready applications.` CSS: `.lead` (L122) plus `.pf-hero__lead{margin-top:clamp(18px,3vh,30px);max-width:34em;color:var(--ink-2)}` (L1599).
4. CTAs (L3450-3453): `div.pf-hero__ctas.pf-hi[style="--i:5"]`, CSS `display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(22px,3.6vh,36px)` (L1600).
   - `a.btn.btn--primary.pf-cv` with `href="https://faisalhanif.work/imgs/Faisal-CVS.pdf"`, `download`, `data-magnetic`; icon `i-download` (`aria-hidden="true"`), copy `Download CV`. JS rewrites the href to `FH.asset('imgs/Faisal-CVS.pdf')` (L6622-6623), which gives the same URL. Magnetic strength is the default `.25` (L4629); fine pointer and no reduced motion only.
   - `a.btn.btn--ghost.pf-goexp` with `href="#pf-exp"`; icon `i-briefcase`, copy `View experience`. Hover: `.pf-goexp .i{transition:transform var(--dur-2) var(--ease-out)}`, `.pf-goexp:hover .i{transform:translateY(-2px)}` (L1601-1602). The click goes through the core router (L4713-4722, L4689-4696): same page, so `FH.scrollToEl(#pf-exp)` and `history.pushState` to `#pf-exp`.
   - Phone (L1787-1788): `.pf-hero__ctas{width:100%}`, `.pf-hero__ctas .btn{flex:1 1 auto}`.
5. Stats (L3454-3467): `dl.pf-hstats` with three `div.pf-hstat.pf-hi` (`--i` 6, 7, 8), each `dt.pf-hstat__label` then `dd.pf-hstat__val`:

| `--i` | Label (`dt`) | Value (`dd`) markup |
|---|---|---|
| 6 | `Years Coding` | `<span class="pf-count" data-to="3">3</span><span class="pf-hstat__suf">+</span>` |
| 7 | `Degree` | `BS<span class="serif grad-text pf-hstat__se">-SE</span>` |
| 8 | `Companies` | `<span class="pf-count" data-to="3">3</span><span class="pf-hstat__suf">+</span>` |

   - `.pf-hstats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:min(100%,31rem);margin-top:clamp(26px,4.4vh,44px);border-top:1px solid var(--line-strong)}` (L1605).
   - `.pf-hstat{position:relative;display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:6px;padding:16px 14px 0}` (L1606): the value shows above the label although `dt` comes first in the DOM. `.pf-hstat:first-child{padding-left:0}` (L1607). Divider: `.pf-hstat+.pf-hstat::before{content:"";position:absolute;left:0;top:18px;bottom:2px;width:1px;background:var(--line)}` (L1608).
   - `.pf-hstat__val{font-size:clamp(1.7rem,2.5vw,2.3rem);font-weight:800;letter-spacing:-.045em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap}` (L1609). `.pf-hstat__suf{color:var(--brand-ink)}` (L1610). `.pf-hstat__se{font-weight:400;letter-spacing:-.02em;padding-right:.06em}` (L1611).
   - `.pf-hstat__label{font-family:var(--font-mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}` (L1612).
   - Count up: JS resets each `.pf-count` to `0` and counts to `data-to` over 1200ms, starting 520ms after `.is-in` (11.4.11). The markup text is `3` (the final value).
   - Phone (L1789-1791): `.pf-hstats{width:100%}`, `.pf-hstat{padding:14px 10px 0}`, `.pf-hstat__label{font-size:.6rem;letter-spacing:.1em}`.

##### Foot and scroll cue (L3559-3563, CSS L1736-1745)
- Markup: `div.pf-hero__foot > div.wrap > a.pf-cue.pf-hi[style="--i:9"][href="#pf-exp"]` containing `span.pf-cue__ring[aria-hidden="true"] > svg.i > use[href="#i-arrow-right"]` and `span.label` copy `Scroll to explore`.
- `.pf-hero__foot{position:relative;z-index:1;margin-top:clamp(36px,6vw,56px);opacity:calc(1 - var(--sp) * 3)}` (L1736). At 1024px and up (L1737): `position:absolute;left:0;right:0;bottom:clamp(16px,3vh,34px);margin:0`.
- `.pf-cue{display:inline-flex;align-items:center;gap:14px;color:var(--ink-2);min-height:44px}` (L1738).
- `.pf-cue__ring{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);transition:background-color .5s var(--ease-out),color .5s,border-color .5s}` (L1739-1740).
- `.pf-cue__ring .i{width:16px;height:16px;transform:rotate(90deg);transition:transform .6s var(--ease-out)}` (L1741): the right arrow is turned to point down.
- Hover (not gated by a media query): ring `background:var(--grad);color:#fff;border-color:transparent` (L1742); icon `transform:rotate(90deg) translateX(3px)` (L1743, so it nudges down); `.label{color:var(--ink)}` (L1744).
- `.label` (L121): mono, `var(--fs-label)`, `letter-spacing:.14em`, uppercase, muted, weight 500.
- Hidden at `(min-width:1024px) and (max-height:800px)`: `#profile .pf-hero__foot,#profile .pf-desk__hint{display:none}` (L1745).
- Click goes through the core router like "View experience" (scroll to `#pf-exp`, hash pushed).

#### 11.4.2 Hero desk: the three résumé sheets (HTML L3470-3556, CSS L1614-1733)

##### Desk root, stage and tilt layer
- Markup chain: `div.pf-desk[role="group"][aria-label="Résumé pages. Choose one to jump to that section."]` (L3471) > `div.pf-desk__stage` (L3472) > `div.pf-desk__tilt` (L3473) > children in DOM order: `a.pf-sheet--edu` (L3475), `a.pf-sheet--exp` (L3493), `a.pf-sheet--skl` (L3528), `span.pf-seal` (L3543). After the stage (still inside `.pf-desk`): `p.pf-desk__hint` (L3555).
- `.pf-desk` (L1615): `position:relative;width:100%;container-type:inline-size;justify-self:end`. At min-width 1024px (L1616): `width:min(100%,calc((100svh - 160px) / 1.2))`, so on desktop the desk (and so its height of 1.2 x width) never gets taller than the viewport minus 160px.
- How it scales as one object (L1617-1618): `.pf-desk__stage{position:relative;font-size:calc(100cqw / 60);width:60em;height:72em;perspective:1800px;perspective-origin:50% 40%;translate:0 calc(var(--sp) * -30px);opacity:calc(1.15 - var(--sp) * 1.2)}`. `100cqw` is the width of `.pf-desk`, so 1em = desk width / 60, the stage is exactly the desk width and 72/60 = 1.2 times as tall. Every size, offset, padding and font size inside the sheets is in `em`, so the whole desk scales together. The opacity starts at 1.15 (clamped to 1), so the stage only starts to fade once `--sp` passes .125.
- `.pf-desk__tilt` (L1619): `position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg))`. JS writes `--tx` and `--ty` (pointer tilt, 11.4.11). Because of `preserve-3d` plus the stage `perspective`, each sheet's `--z` gives real depth and parallax when the desk tilts.

##### One sheet (shared structure, L1621-1633)
Every sheet is an `a.pf-sheet.pf-sheet--{edu|exp|skl}` with four nested layers, each with its own job (comment L1621: "one sheet = position/rotation (a) > ambient float (float) > entrance (in) > surface (body)"):
`a.pf-sheet` > `span.pf-sheet__float` > `span.pf-sheet__in` > `span.pf-sheet__body` > content.

| Layer | Rule | Job |
|---|---|---|
| `a.pf-sheet` | L1622-1623: `position:absolute;display:block;left:var(--x);top:var(--y);width:var(--w);color:var(--ink-2);border-radius:1.9em;transform:translate3d(var(--fx,0em),var(--fy,0em),var(--z,0px)) rotate(calc(var(--r) + var(--fr,0deg)));transition:transform 1s var(--ease-out)` | Place, rotate and lift in depth. Hover and focus change `--fx`, `--fy`, `--fr`, `--z`, and the 1s transition animates them. |
| `span.pf-sheet__float` | L1628 `display:block;border-radius:inherit`; L1629 `translate:0 calc(var(--sp) * var(--ez,0) * 1px)` | Ambient float (`animation` on `transform`, 11.4.3) and the scroll exit (on the separate `translate` property). |
| `span.pf-sheet__in` | L1628 `display:block;border-radius:inherit` | Entrance only (11.4.3). |
| `span.pf-sheet__body` | L1630-1632: `position:relative;overflow:hidden;padding:2.3em;background:var(--surface);border:1px solid var(--line);box-shadow:0 .2em .6em rgba(8,48,42,.05),0 2.4em 5em -1.8em rgba(8,48,42,.28);transition:transform .7s var(--ease-out),box-shadow .7s var(--ease-out),border-color .5s` | The paper. Dark theme (L1633): `box-shadow:0 .2em .6em rgba(0,0,0,.35),0 2.6em 5.2em -1.6em rgba(0,0,0,.85);border-color:var(--line-strong)`. |

- `.pf-sheet:focus-visible{outline:none}` (L1624); the focus ring is drawn on the body instead (L1732-1733, see 11.4.3).

##### Per sheet values (desktop and tablet; phone overrides in 11.4.4)

| Sheet | `--x` | `--y` | `--w` | `--r` | `--z` | `--ez` (exit px per unit of `--sp`) | `--fd` (float duration) | `--fdl` (float delay) | `--er` (entrance start rotation) | `--d` (entrance delay) | Lines |
|---|---|---|---|---|---|---|---|---|---|---|---|
| edu (back, top right) | 36.5em | .5em | 23.5em | 5deg | -40px | -90 | 17s | -6s | 14deg | 120ms | L1625, L1758 |
| exp (middle, left, largest) | .5em | 7.5em | 36.5em | -4deg | 0px | -20 | 14s | -2s | -10deg | 240ms | L1626, L1758 |
| skl (front, bottom right) | 30.5em | 49.5em | 29em | 2.5deg | 40px | 70 | 19s | -11s | 12deg | 380ms | L1627, L1758 |
| seal (on top) | left 45.5em | top 37.5em | 11em (height 11em) | -14deg | 70px | none | none | none | entrance from -40deg | 820ms | L1705-1706, L1755, L1767 |

- Z order: there is no `z-index`. Depth comes from `translateZ` inside the `preserve-3d` tilt layer: edu (-40px) at the back, exp (0px) in the middle, skl (40px) in front, seal (70px) on top. DOM order is the same (edu, exp, skl, seal), so it also paints right in a flat fallback. A hovered or focused sheet goes to `--z:120px` and so comes in front of everything.
- Scroll exit direction: edu moves up 90px, exp up 20px, skl down 70px at `--sp` = 1, so the pages spread apart as the hero leaves.

##### Shared sheet parts (L1635-1641)
- `.pf-sh__top{display:flex;align-items:center;gap:1.2em}` (L1636).
- `.pf-sh__no` (L1637): `font-family:var(--font-mono);font-size:1.05em;letter-spacing:.16em;text-transform:uppercase;color:var(--brand-ink);font-weight:500;white-space:nowrap`. Its `i` (the slash): `font-style:normal;opacity:.45;margin:0 .15em` (L1638).
- `.pf-sh__go` (L1639-1640): `margin-left:auto;flex:none;width:3.3em;height:3.3em;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);transition:background-color .5s var(--ease-out),color .5s,border-color .5s,transform .6s var(--ease-out)`. Icon `.pf-sh__go .i{width:1.5em;height:1.5em}` (L1641). Icon is `i-arrow-up-right` in all three sheets.

##### Sheet 1: Education (back sheet, L3475-3491, CSS L1671-1687)
- Root: `a.pf-sheet.pf-sheet--edu` with `href="#pf-edu-bs"` and `aria-label="Education: Software Engineering (BS-SE), University of Management and Technology, Lahore, 2020 to 2024. Jump to education."`
- Surface (L1672): `.pf-sheet--edu .pf-sheet__body{background:var(--grad);border-color:transparent;color:rgba(255,255,255,.8);padding-bottom:1.6em}`.
- Decorations on the body:
  - `::after` (L1673): `content:"";position:absolute;right:-30%;top:-35%;width:80%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.16),transparent 62%);pointer-events:none`.
  - `::before` (L1674): `content:"";position:absolute;right:-18%;bottom:-40%;width:78%;aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.12);box-shadow:0 0 0 2.6em rgba(255,255,255,.035);pointer-events:none`.
- Content in order:
  1. `span.pf-sh__top` with:
     - `span.pf-sh__ic` holding icon `i-grad` (`aria-hidden="true"`). CSS L1675-1676: `flex:none;width:3.3em;height:3.3em;border-radius:1em;display:grid;place-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);color:#fff`; icon `width:1.7em;height:1.7em`.
     - `span.pf-sh__no` text `02 <i>/</i> Education`; on this sheet `color:rgba(255,255,255,.78)` (L1677).
     - `span.pf-sh__go` (arrow); on this sheet `border-color:rgba(255,255,255,.28);color:#fff` (L1678).
  2. `span.pf-ed__big.serif` text `BS-SE`. L1679: `display:block;margin-top:.3em;font-size:7.4em;line-height:.95;color:#fff;letter-spacing:-.03em` (plus `.serif`: Instrument Serif italic, weight 400).
  3. `span.pf-ed__t` text `Software Engineering`. L1680: `display:block;margin-top:.35em;font-size:1.6em;font-weight:700;letter-spacing:-.025em;color:#fff;line-height:1.2`.
  4. `span.pf-ed__u` text `University of Management & Technology, Lahore` (source `&amp;`). L1681: `display:block;margin-top:.45em;font-size:1.15em;line-height:1.45;color:rgba(255,255,255,.78);max-width:22em`.
  5. `span.pf-ed__y` text `2020 - 2024`. L1682: `display:inline-block;margin-top:1.1em;font-family:var(--font-mono);font-size:1em;letter-spacing:.14em;color:#fff;padding:.45em .8em;border-radius:.6em;background:rgba(255,255,255,.12)`.
  6. `span.pf-ed__list` (L1683: `display:block;margin-top:1.5em;border-top:1px solid rgba(255,255,255,.18)`) with two `span.pf-ed__row`:
     - `<span>Inter <em>Computer Science</em></span><span>2018 - 2020</span>`
     - `<span>Matric <em>Computer Science</em></span><span>2016 - 2018</span>`
     - Row CSS L1684-1687: `display:flex;justify-content:space-between;align-items:baseline;gap:1em;padding:.95em 0;font-size:1.12em;color:#fff;font-weight:600`; `.pf-ed__row+.pf-ed__row{border-top:1px solid rgba(255,255,255,.1)}`; `em{font-style:normal;font-weight:400;opacity:.62;margin-left:.3em}`; last span (the years) `font-family:var(--font-mono);font-size:.85em;font-weight:400;letter-spacing:.06em;opacity:.75;white-space:nowrap`.
     - Hidden on phones (L1803).

##### Sheet 2: Experience (middle sheet, the "CV", L3493-3526, CSS L1643-1669)
- Root: `a.pf-sheet.pf-sheet--exp` with `href="#pf-role-techxelo"` and `aria-label="Experience: four roles from 2022 to 2026, currently Software Engineer at TechXelo. Jump to experience."`
- Surface (L1644): `.pf-sheet--exp .pf-sheet__body{background:linear-gradient(180deg,var(--surface) 0%,var(--surface-2) 100%)}`.
- Content in order:
  1. `span.pf-sh__top` with:
     - `span.pf-sh__mono` text `FH`. L1645: `flex:none;width:2.9em;height:2.9em;border-radius:.8em;display:grid;place-items:center;background:var(--grad);color:#fff;font-weight:800;font-size:1.25em;letter-spacing:-.04em;box-shadow:var(--glow)`.
     - `span.pf-sh__cv` (L1646 `display:grid;gap:.35em;min-width:0`) with `span.serif` text `Curriculum Vitae` (L1647 `font-size:2.3em;line-height:.95;color:var(--ink)`) and `span.pf-sh__who` text `Faisal Hanif · Software Engineer` (L1648 `font-family:var(--font-mono);font-size:.92em;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap`).
     - `span.pf-sh__go` (arrow).
  2. `span.pf-sh__head` (L1649 `display:flex;justify-content:space-between;align-items:center;margin-top:2em;padding-top:1.5em;border-top:1px solid var(--line)`) with `span.pf-sh__no` text `01 <i>/</i> Experience` and `span.pf-sh__range` text `2022 <i>&rarr;</i> 2026` (renders `2022 → 2026`). Range CSS L1650-1651: `font-family:var(--font-mono);font-size:1em;letter-spacing:.1em;color:var(--muted)`; its `i`: `font-style:normal;color:var(--accent)`.
  3. `span.pf-xp` (L1652 `display:grid;margin-top:.5em`) with four `span.pf-xp__row`, each with inline `--a` (bar start), `--b` (bar end) and `--k` (stagger index):

| Row | Inline style | `.pf-xp__yr` | `b` (title) | `span` (company) | Extra |
|---|---|---|---|---|---|
| L3502 `.pf-xp__row.is-cur` | `--a:.5;--b:1;--k:0` | `2024` | `Software Engineer` | `TechXelo` | `span.pf-xp__now` = `span.dot-live` + text `Current` |
| L3508 | `--a:.25;--b:.5;--k:1` | `2023` | `Freelance Developer` | `Upwork Platform` | |
| L3513 | `--a:.25;--b:.5;--k:2` | `2023` | `Outsourcing Engineer` | `UHA International` | |
| L3518 | `--a:0;--b:.25;--k:3` | `2022` | `React Native Developer` | `Viral Square` | |

   Each row ends with `span.pf-xp__bar > i` (empty). Row CSS:
   - `.pf-xp__row` (L1653): `display:grid;grid-template-columns:4.2em minmax(0,1fr) auto;column-gap:1.2em;align-items:baseline;padding:1.1em 0 1em;border-bottom:1px solid var(--line)`.
   - `.pf-xp__yr` (L1654): `font-family:var(--font-mono);font-size:1.08em;letter-spacing:.04em;color:var(--muted)`.
   - `.pf-xp__t` (L1655): `display:grid;gap:.25em;min-width:0`. `b` (L1656): `font-size:1.55em;font-weight:700;letter-spacing:-.025em;color:var(--ink);line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`. `span` (L1657): `font-size:1.2em;color:var(--ink-2);line-height:1.3`. Current row company (L1658): `color:var(--brand-ink);font-weight:600`.
   - `.pf-xp__now` (L1659-1660): `display:inline-flex;align-items:center;gap:.55em;align-self:center;height:2.3em;padding:0 .95em;border-radius:99em;background:var(--accent-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.92em;letter-spacing:.12em;text-transform:uppercase;font-weight:500` (so "Current" shows as CURRENT). Its dot: `.pf-xp__now .dot-live{width:.62em;height:.62em}` (L1661); `.dot-live` pings with `fh-ping 2.4s var(--ease-out) infinite` (L152-153).
   - `.pf-xp__bar` (L1662): `grid-column:2 / -1;position:relative;display:block;height:.34em;margin-top:1em;border-radius:1em;background:var(--line)`. Fill `i` (L1663): `position:absolute;top:0;bottom:0;left:calc(var(--a) * 100%);width:calc((var(--b) - var(--a)) * 100%);border-radius:inherit;background:var(--brand);opacity:.55;transform-origin:0 50%`. Dark (L1664): `background:var(--brand-ink);opacity:.45`. Current row (L1665): `background:var(--grad-glow);opacity:1`.
  4. `span.pf-xp__axis` with five spans `2022`, `2023`, `2024`, `2025`, `2026` (L3524). CSS L1666-1669: axis `position:relative;display:block;height:2.2em;margin:.9em 0 0 5.4em` (5.4em = the 4.2em year column + 1.2em gap, so the axis lines up with the bars); each span `position:absolute;top:0;font-family:var(--font-mono);font-size:.9em;letter-spacing:.06em;color:var(--muted);transform:translateX(-50%)`, at `left` 0, 25%, 50%, 75%, 100%; the fifth (2026) is `color:var(--brand-ink)`.
- The bars are a mini Gantt chart on a 2022 to 2026 scale: .25 per year.

##### Sheet 3: Expertise (front sheet, L3528-3541, CSS L1689-1702)
- Root: `a.pf-sheet.pf-sheet--skl` with `href="#pf-skills"` and `aria-label="Expertise: React.js 95%, JavaScript 90%, OpenAI API 85%, and ten core areas. Jump to technical expertise."`
- Surface: the default body (`var(--surface)`).
- Content in order:
  1. `span.pf-sh__top` with `span.pf-sh__no` text `03 <i>/</i> Expertise` and `span.pf-sh__go` (no icon tile, no mono).
  2. `span.pf-mr` (L1690 `display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1em;margin-top:1.8em`) with three `span.pf-mr__i` (L1691 `display:grid;justify-items:center;gap:.9em`):

| Line | `data-v` | `--k` | Ring `--v` (on the bar circle) | `b.pf-mr__n` | `span.pf-mr__l` |
|---|---|---|---|---|---|
| L3535 | 95 | 0 | 95 | `95` | `React.js` |
| L3536 | 90 | 1 | 90 | `90` | `JavaScript` |
| L3537 | 85 | 2 | 85 | `85` | `OpenAI API` |

   - Ring markup: `span.pf-mr__ring > svg[viewBox="0 0 60 60"][aria-hidden="true"]` with `circle.pf-mr__trk` (`cx="30" cy="30" r="25" pathLength="100"`) and `circle.pf-mr__bar` (`cx="30" cy="30" r="25" pathLength="100" transform="rotate(-90 30 30)" style="--v:95"`), then `b.pf-mr__n` (the number) after the svg, inside the ring span.
   - CSS L1692-1698: ring `position:relative;display:grid;place-items:center;width:6.8em;height:6.8em`; svg `position:absolute;inset:0;width:100%;height:100%;overflow:visible`; track `fill:none;stroke:var(--line-strong);stroke-width:3`; bar `fill:none;stroke:url(#pf-ring-g);stroke-width:4.5;stroke-linecap:round;stroke-dasharray:100 100;stroke-dashoffset:calc(100 - var(--v))`; number `position:relative;font-size:1.65em;font-weight:800;letter-spacing:-.04em;color:var(--ink);font-variant-numeric:tabular-nums`, with `::after{content:"%";font-size:.55em;font-weight:700;color:var(--muted);margin-left:.05em;vertical-align:.45em}`; label `font-size:1.12em;font-weight:600;color:var(--ink-2);white-space:nowrap`.
   - The numbers are static text (no count up). Only the bar draws in (11.4.3).
  3. `span.pf-sk__foot` (L1699 `display:flex;align-items:center;justify-content:space-between;gap:1em;margin-top:1.7em;padding-top:1.3em;border-top:1px solid var(--line)`) with:
     - `span.pf-sk__chip`: icon `i-sparkles` + text `AI/LLM Integration`. L1700-1701: `display:inline-flex;align-items:center;gap:.55em;height:2.9em;padding:0 1.05em;border-radius:99em;background:var(--brand-soft);border:1px solid var(--line);color:var(--brand-ink);font-size:1.1em;font-weight:600;white-space:nowrap`; icon `width:1.25em;height:1.25em`.
     - `span.pf-sk__more` text `+9 more`. L1702: `font-family:var(--font-mono);font-size:.95em;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap`.

##### The seal (L3543-3551, CSS L1704-1712, L1731)
- `span.pf-seal[aria-hidden="true"] > svg[viewBox="0 0 120 120"]` containing:
  - `<defs><path id="pf-seal-p" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>` (a circle of radius 45 used as the text path).
  - `circle.pf-seal__o` `cx="60" cy="60" r="57"`: `fill:var(--surface);stroke:var(--line-strong);stroke-width:1` (L1709).
  - `circle.pf-seal__i` `cx="60" cy="60" r="34"`: `fill:none;stroke:var(--accent);stroke-width:1;opacity:.55;stroke-dasharray:2 3` (L1710).
  - `text.pf-seal__txt > textPath[href="#pf-seal-p"][textLength="280"]` text `SOFTWARE ENGINEER · LAHORE · 2026 ·`. CSS L1711: `font-family:var(--font-mono);font-size:8.6px;font-weight:500;letter-spacing:.9px;fill:var(--brand-ink)`.
  - `text.pf-seal__fh` `x="60" y="68" text-anchor="middle"` text `FH`. CSS L1712: `font-family:var(--font-serif);font-style:italic;font-size:30px;fill:var(--brand-ink)`.
- `.pf-seal` (L1705-1706): `position:absolute;left:45.5em;top:37.5em;width:11em;height:11em;border-radius:50%;pointer-events:none;transform:translate3d(0,0,70px) rotate(-14deg);filter:drop-shadow(0 .8em 1.4em rgba(8,48,42,.18))`. Dark (L1707): `filter:drop-shadow(0 .8em 1.6em rgba(0,0,0,.6))`. `svg{width:100%;height:100%;overflow:visible}` (L1708).
- `transition:opacity .5s var(--ease-out)` (L1731). It is not a link and takes no pointer events. It sits where the three pages meet ("pressed on where the pages meet", comment L1704). Hidden on phones (L1798).
- The text sizes are in SVG user units (px of the 120 viewBox), so the seal scales with its 11em box.

##### Hint under the desk (L3555, CSS L1714-1717)
- `p.pf-desk__hint` with `span.pf-desk__n` text `03`, then text `Three pages, one career. Pick one to jump to it.`
- `.pf-desk__hint` (L1715-1716): `position:absolute;left:1cqw;bottom:2cqw;display:flex;align-items:center;gap:12px;max-width:47cqw;font-size:.88rem;line-height:1.4;color:var(--muted);translate:0 calc(var(--sp) * -30px);opacity:calc(1 - var(--sp) * 1.6)`. `cqw` here is the width of `.pf-desk` (its container). On desktop and tablet it sits over the empty bottom left corner of the stage (the front sheet starts at 30.5em, about 51% across).
- `.pf-desk__n` (L1717): `display:inline-grid;place-items:center;height:28px;padding:0 10px;border-radius:99px;background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.72rem;letter-spacing:.1em`.
- Hidden at `(min-width:1024px) and (max-height:800px)` together with the foot (L1745). Phone layout in 11.4.4. Entrance and settle in 11.4.3.

#### 11.4.3 Hero motion: entrance, settle, ambient float, pointer and hover, scroll exit (CSS L1719-1777, JS L6518-6632)

The hero has three state classes on `header.pf-hero`, all written by profile.js (11.4.11):
- `.is-in`: entrance runs. Added by `playHero()` (L6538).
- `.is-settled` and `.is-live`: added together 1700ms after `.is-in` (L6549). `.is-settled` unlocks the hover fan, pointer tilt and instant hover transitions. `.is-live` starts the ambient float.
- `.is-idle`: the hero is fully out of the viewport (L6568). Pauses the float and the live dot.
All hidden entrance states are scoped to `.js #profile .pf-hero:not(.is-in)`, so without the `.js` class on `<html>` everything shows at rest.

##### Entrance (JS adds `.is-in`; CSS L1747-1769)
Hidden state (`.js #profile .pf-hero:not(.is-in) ...`) and shown state (`#profile .pf-hero.is-in ...`):

| Element | Hidden (before `.is-in`) | Transition once `.is-in` | Delay | Lines |
|---|---|---|---|---|
| `.pf-hi` (eyebrow, lead, CTA row, 3 stats, scroll cue) | `opacity:0;transform:translate3d(0,16px,0);filter:blur(6px)` | `opacity .9s var(--ease-out),transform 1s var(--ease-out),filter .9s var(--ease-out)` | `calc(var(--i,0) * 70ms)`: eyebrow `--i:0` 0ms, lead `--i:4` 280ms, CTAs `--i:5` 350ms, stats `--i:6,7,8` 420, 490, 560ms, cue `--i:9` 630ms | L1748, L1760 |
| `.pf-ln__in` (title lines) | `transform:translate3d(0,112%,0)` (masked by `.pf-ln{overflow:hidden}`) | `transform 1.1s var(--ease-out)` | `calc(var(--i,0) * 80ms)`: "My Professional" `--i:1` 80ms, "Profile" `--i:2` 160ms | L1749, L1761 |
| `.pf-sheet__in` (each sheet) | `opacity:0;transform:translate3d(0,6em,0) rotate(var(--er,6deg)) scale(.92);filter:blur(8px)` | `opacity .8s var(--ease-out) var(--d),transform 1.25s var(--ease-out) var(--d),filter .8s var(--ease-out) var(--d)` | `--d`: edu 120ms, exp 240ms, skl 380ms; `--er`: edu 14deg, exp -10deg, skl 12deg (L1758) | L1750, L1762 |
| `.pf-xp__row>*` (every cell of the 4 CV rows, bar included) | `opacity:0;transform:translate3d(0,.8em,0)` | `opacity .6s var(--ease-out),transform .8s var(--ease-out)` | `calc(560ms + var(--k) * 70ms)`: 560, 630, 700, 770ms | L1751, L1763 |
| `.pf-xp__bar i` (Gantt fills) | `transform:scaleX(0)` (origin left) | `transform 1s var(--ease-io)` | `calc(720ms + var(--k) * 90ms)`: 720, 810, 900, 990ms | L1752, L1764 |
| `.pf-xp__axis` | `opacity:0` | `opacity .8s var(--ease-out)` | 900ms | L1753, L1765 |
| `.pf-mr__bar` (3 mini rings) | `stroke-dashoffset:100` | `stroke-dashoffset 1.3s var(--ease-out)` | `calc(700ms + var(--k) * 110ms)`: 700, 810, 920ms | L1754, L1766 |
| `.pf-seal` | `opacity:0;transform:translate3d(0,0,70px) rotate(-40deg) scale(1.25)` | `opacity .7s var(--ease-out) 820ms,transform 1.1s var(--ease-out) 820ms` | 820ms (it spins from -40deg to -14deg and shrinks onto the pages) | L1755, L1767 |
| `.pf-desk__hint` | `opacity:0` | `opacity .8s var(--ease-out)` | 1000ms | L1756, L1768 |
| `.pf-hero__halo` | `opacity:0;transform:scale(.85)` | `opacity 1.8s var(--ease-out),transform 2.2s var(--ease-out)` | 0 | L1757, L1769 |

- Once `.is-settled` is on (L1770-1772): `.pf-seal{transition:opacity .5s var(--ease-out)}` and `.pf-desk__hint{transition:none}`, so hover and focus respond at once and the scroll exit (which writes opacity through `--sp`) is not delayed by the 1000ms entrance delay.
- The transitions only exist under `.is-in`. When JS removes `.is-in` (reset before a replay), every element snaps back to its hidden state with no animation. Replays then run from scratch.
- Count up of the two `.pf-count` stats starts 520ms after `.is-in`, lasts 1200ms (11.4.11).
- Order of the whole entrance: halo and eyebrow at 0, title lines 80 and 160ms, edu sheet 120ms, exp sheet 240ms, lead 280ms, CTAs 350ms, skl sheet 380ms, stats 420 to 560ms, CV rows 560 to 770ms, cue 630ms, mini rings 700 to 920ms, bars 720 to 990ms, seal 820ms, axis 900ms, hint 1000ms, settle and float at 1700ms.

##### Ambient float (CSS L1774-1777)
- `#profile .pf-hero.is-live .pf-sheet__float{animation:pf-float var(--fd,16s) ease-in-out var(--fdl,0s) infinite alternate}` (L1775).
- `@keyframes pf-float{from{transform:translate3d(0,-.45em,0) rotate(-.45deg)}to{transform:translate3d(0,.45em,0) rotate(.45deg)}}` (L1777).
- Durations and phase offsets (negative delays, so each sheet starts part way into its cycle and they never move in step): edu `17s` / `-6s`, exp `14s` / `-2s`, skl `19s` / `-11s`. The seal does not float.
- Paused off screen (L1776): `#profile .pf-hero.is-idle .pf-sheet__float,#profile .pf-hero.is-idle .dot-live{animation-play-state:paused}`. `.is-idle` is set by the scroll handler when `r.bottom < 0 || r.top > innerHeight` for the hero rect (L6568). It is only recomputed on scroll, resize and page show.
- The float animates `transform` while the scroll exit uses the separate `translate` property on the same element, so both apply together.
- Reduced motion: `animation:none!important` (L2032), and JS never adds `.is-live` under reduced motion.

##### Hover and pointer (fine pointer only, CSS L1719-1733)
All of this sits inside `@media (hover:hover) and (pointer:fine)` (L1720), except the focus rules and the seal transition.
- Fan out, only when `.is-settled` and the pointer is anywhere over `.pf-desk__tilt` (L1721-1723):
  - edu: `--fx:1.6em;--fy:-1.4em;--fr:2deg` (moves right and up, turns 2deg more).
  - exp: `--fx:-1.4em;--fy:.6em;--fr:-1.5deg`.
  - skl: `--fx:1.4em;--fy:2em;--fr:1.5deg`.
  - The seal fades: `.pf-seal{opacity:.0}` (L1724), over `.5s var(--ease-out)` (L1731, L1771).
  - The sheet under the cursor is picked up: `.pf-hero.is-settled .pf-sheet:hover{--z:120px}` (L1725).
  - All of this animates through the sheet's `transition:transform 1s var(--ease-out)` (L1623).
- Sheet surface on hover (NOT gated by `.is-settled`):
  - `.pf-sheet:hover .pf-sheet__body{border-color:var(--line-strong);box-shadow:0 .4em 1em rgba(8,48,42,.06),0 3.6em 7em -2em rgba(8,48,42,.36)}` (L1726). Dark (L1727): `box-shadow:0 .4em 1em rgba(0,0,0,.4),0 3.6em 7em -2em rgba(0,0,0,.9),0 0 0 1px var(--line-strong)`.
  - Arrow button: `.pf-sheet:hover .pf-sh__go{background:var(--grad);color:#fff;border-color:transparent;transform:rotate(45deg)}` (L1728). On the Education sheet: `background:#fff;color:var(--brand-700)` (L1729; border still turns transparent and it still rotates).
- Pointer tilt (JS L6579-6598, only when `FH.fine` is true (`(pointer:fine)`) and not reduced motion): the whole `.pf-desk__tilt` rotates up to 5deg around Y and 4deg around X toward the pointer, lerped at `.08` per frame, and only after `.is-settled`. Details in 11.4.11.
- Keyboard focus (not gated, L1732-1733): `.pf-sheet:focus-visible{--z:120px}` lifts the focused sheet to the front, and `.pf-sheet:focus-visible .pf-sheet__body{box-shadow:0 0 0 3px var(--accent),0 2.4em 5em -1.8em rgba(8,48,42,.28)}` draws a 3px accent ring (the default outline is removed at L1624).
- Click (JS L6624-6629): each sheet's click is taken over: `preventDefault()` then `jumpTo(id)` smooth scrolls to the target and flashes it (11.4.11). Targets: edu `#pf-edu-bs` (featured degree card), exp `#pf-role-techxelo` (first timeline role; the flash goes on its `.pf-role__card`), skl `#pf-skills` (skills card). The URL hash is not changed for these clicks.

##### Scroll-linked exit (`--sp`, JS L6562-6577)
One custom property `--sp` (0 to 1, eased with smoothstep) on `header.pf-hero` drives every layer. Initial value `--sp:0` (L1580). Progress only starts when the hero's bottom edge rises into the viewport, and reaches 1 after it has risen a further 80% of the viewport height.

| Element | Property driven by `--sp` | Lines |
|---|---|---|
| `.pf-hero__copy` | `translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)` | L1592 |
| `.pf-desk__stage` | `translate:0 calc(var(--sp) * -30px);opacity:calc(1.15 - var(--sp) * 1.2)` | L1617-1618 |
| `.pf-sheet__float` | `translate:0 calc(var(--sp) * var(--ez,0) * 1px)`: edu -90px, exp -20px, skl +70px at `--sp` 1 (phone: `* .4px`, so -36px, -8px, +28px) | L1629, L1794 |
| `.pf-desk__hint` | `translate:0 calc(var(--sp) * -30px);opacity:calc(1 - var(--sp) * 1.6)` | L1716 |
| `.pf-hero__foot` | `opacity:calc(1 - var(--sp) * 3)` | L1736 |

- Runs at every width (no breakpoint gate). Reduced motion: `#profile .pf-hero{--sp:0!important}` (L2031) and JS stops before writing `--sp`.
- The exit uses the `translate` property, not `transform`, so it adds to the entrance and float transforms. Keep it that way in the port.

#### 11.4.4 Hero responsive (CSS L300-301, L1582-1585, L1616, L1737, L1745, L1779-1805)

| Width | What changes |
|---|---|
| 1024px and up | Two columns `minmax(0,.93fr) minmax(0,1.07fr)`, `column-gap:clamp(36px,4vw,72px)` (L1584). Hero padding `clamp(84px,12vh,150px)` top, `clamp(84px,11vh,120px)` bottom (L1583). `.page-hero` `min-height:min(100svh,1000px)` (L300). Desk `width:min(100%,calc((100svh - 160px) / 1.2))`, `justify-self:end` (L1615-1616). Foot is absolute at the bottom: `left:0;right:0;bottom:clamp(16px,3vh,34px);margin:0` (L1737). Hint absolute in the desk. |
| 1024px and up, height 800px or less | `#profile .pf-hero__foot,#profile .pf-desk__hint{display:none}` (L1745). Everything else as desktop. |
| 640px to 1023px (tablet) | One column, copy above the desk (grid `minmax(0,1fr)`, `gap:clamp(48px,8vw,72px)`, L1581). `.page-hero` `min-height:auto;padding-top:108px` (L301), bottom padding stays `clamp(56px,9vh,110px)`. Desk `width:min(100%,600px);justify-self:center` (L1781). Stage keeps the desktop 60em by 72em layout and all desktop sheet positions. Hint stays absolute in the desk. Foot is in flow below the grid: `position:relative;margin-top:clamp(36px,6vw,56px)` (L1736). |
| under 640px (phone, L1785-1805) | See the list below. |

Phone (`max-width:639px`, "a tighter desk with bigger type", L1784):
- `.pf-hero__wrap{gap:44px}`; CTAs full width with `flex:1 1 auto` buttons; stats full width, `padding:14px 10px 0`, label `font-size:.6rem;letter-spacing:.1em`; halo `right:-40%;top:auto;bottom:0;width:130vw` (L1786-1792; details in 11.4.1).
- Stage (L1793): `font-size:calc(100cqw / 40);width:40em;height:79em`. The em is now desk width / 40 (bigger type) and the stage is 79/40 = 1.975 times as tall as it is wide. Desk width stays `100%` of the column.
- Exit depth halved: `.pf-sheet__float{translate:0 calc(var(--sp) * var(--ez,0) * .4px)}` (L1794).
- Sheet positions (L1795-1797); `--z`, `--ez`, `--fd`, `--fdl`, `--er`, `--d` keep the desktop values:

| Sheet | `--x` | `--y` | `--w` | `--r` |
|---|---|---|---|---|
| edu | 14em | 0em | 26em | 4deg |
| exp | 0em | 13em | 34.5em | -3deg |
| skl | 7em | 53em | 33em | 2deg |

- `.pf-seal{display:none}` (L1798).
- `.pf-sheet__body{padding:2em}` (L1799).
- `.pf-sh__who{font-size:.85em;letter-spacing:.08em}` (L1800).
- `.pf-ed__big{font-size:6.2em}` (L1801); `.pf-ed__u{font-size:1.1em}` (L1802); `.pf-ed__list{display:none}` (L1803), so the Inter and Matric rows are hidden on the back sheet.
- Hint (L1804): `position:static;max-width:none;margin-top:14px;font-size:.84rem`. It now sits below the stage, in flow.
- The hover fan and pointer tilt need a fine pointer, so on touch phones and tablets the desk only has the entrance, the float and the scroll exit. Tapping a sheet still jumps to its section.

#### 11.4.5 Body: block heads and badges (CSS L1807-1827)

##### Block spacing
- `.pf-block{margin-top:clamp(96px,12vw,168px)}` (L1808). The first block is closer: `.pf-body>.pf-exp{margin-top:clamp(40px,6vw,88px)}` (L1809).
- `div.wrap.pf-body` has no rules of its own (only `.wrap`).

##### Block head (`.pf-bhead`)
- `.pf-bhead{display:grid;gap:12px}` (L1810).
- `span.label.pf-bhead__idx`: `.label` plus `color:var(--brand-ink);display:block;margin-bottom:6px` (L1811).
- `h3.pf-bhead__title[data-split]`: `font-size:clamp(1.9rem,3.4vw,2.9rem);font-weight:700;letter-spacing:-.035em;line-height:1.04` (L1812); `.serif{font-weight:400}` (L1813). The second word is `span.serif.grad-text`.
- `p.pf-bhead__sub`: `color:var(--muted);font-size:var(--fs-lead);max-width:36ch` (L1814).
- Row variant `.pf-bhead--row` (Education and Technical expertise only): `margin-bottom:clamp(32px,4vw,52px)` (L1815). At min-width 860px (L1816-1819): `grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:40px;padding-bottom:28px;border-bottom:1px solid var(--line)` and the sub gets `text-align:right;padding-bottom:.3em`. The row head markup is `div.pf-bhead.pf-bhead--row > div (idx + h3) + p.pf-bhead__sub`.
- The Experience head is a plain `.pf-bhead` inside the sticky aside (no row variant, no border).

| Block | Index | Title (first word + `.serif.grad-text` word) | Sub | Lines |
|---|---|---|---|---|
| Experience | `02.1` | `Professional` + `Experience` | `My journey through the tech industry` | L3580-3582 |
| Education | `02.2` | `Educational` + `Background` | `My academic foundation and learning journey` | L3661-3664 |
| Technical expertise | `02.3` | `Technical` + `Expertise` | `My technical skills and proficiency levels` | L3710-3713 |

Title ids: `pf-exp-title`, `pf-edu-title`, `pf-tech-title` (each block `div` has `role="region"` and `aria-labelledby` pointing to its title).

##### Badges (`.pf-badge`, L1821-1827)
- Base (L1822-1823): `display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 12px;border-radius:var(--r-pill);font-family:var(--font-mono);font-size:.66rem;letter-spacing:.14em;font-weight:500;background:var(--surface-2);border:1px solid var(--line);color:var(--ink-2);white-space:nowrap`. No `text-transform`: the markup text is already upper case.
- `--live` (L1824): `background:var(--accent-soft);border-color:transparent;color:var(--brand-ink)`. Holds a `span.dot-live` (shared 8px pinging dot).
- `--closed` (L1825): `color:var(--muted)`. Holds `span.pf-badge__dot`: `width:7px;height:7px;border-radius:50%;background:var(--muted);opacity:.55` (L1826).
- `--onbrand` (L1827): `background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.18);color:#fff` (on the featured degree card).

#### 11.4.6 Experience: sticky year and timeline (HTML L3575-3655, CSS L1829-1895, JS L6634-6716)

##### Layout (L1830-1837)
- Root `div.pf-block.pf-exp#pf-exp[role="region"][aria-labelledby="pf-exp-title"]` with two children: `div.pf-exp__aside > div.pf-exp__sticky` (head + year box) and `div.pf-tl` (timeline).
- Base: `.pf-exp{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(36px,5vw,56px)}`; `.pf-year{display:none}`.
- At min-width 1024px: `.pf-exp{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(48px,6vw,96px);align-items:start}`; `.pf-exp__aside{align-self:stretch}` (so the sticky child has the full column height to travel in); `.pf-exp__sticky{position:sticky;top:clamp(72px,12vh,120px);display:grid;gap:clamp(36px,5vh,64px)}`; `.pf-year{display:block}`.
- Under 1024px the head sits above the timeline and the year box is hidden.

##### Sticky year box (`div.pf-year[aria-hidden="true"][data-reveal="fade"][data-delay="250"]`, L3584-3592, CSS L1838-1854)
Markup:
- `div.pf-year__line.pf-year__line--from > span.pf-year__txt.is-cur` text `2024`
- `div.pf-year__line.pf-year__line--to > span.pf-year__txt.is-cur` text `2026`
- `div.pf-year__meta` > `span.pf-year__count` = `<b class="pf-year__n">01</b> / 04`, then `span.pf-year__role` text `Software Engineer · TechXelo`
- `div.pf-year__ticks` > four `i`, the first with `.is-on`

CSS:
- `.pf-year__line` (L1838): `position:relative;overflow:hidden;height:.92em;line-height:.92;font-size:clamp(4.6rem,8.4vw,8.4rem);font-weight:800;letter-spacing:-.06em;font-variant-numeric:tabular-nums`.
- `.pf-year__txt` (L1839): `position:absolute;left:0;top:0;display:block;transition:transform .9s var(--ease-out),opacity .7s var(--ease-out),filter .7s var(--ease-out)`.
- From line text `color:var(--ink)` (L1840). To line text (L1841): `background:var(--grad-glow);-webkit-background-clip:text;background-clip:text;color:transparent;padding-right:.04em`. `.pf-year__line--to{margin-top:.04em}` (L1842).
- Swap states (L1843-1846), all with `opacity:0;filter:blur(10px)`: `.is-enter-down` `translate3d(0,38%,0)`, `.is-enter-up` `translate3d(0,-38%,0)`, `.is-leave-up` `translate3d(0,-38%,0)`, `.is-leave-down` `translate3d(0,38%,0)`.
- `.pf-year__meta` (L1847): `display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line)`.
- `.pf-year__count` (L1848): `font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;color:var(--muted)`; `.pf-year__n{font-weight:500;color:var(--brand-ink)}` (L1849).
- `.pf-year__role` (L1850): `font-size:.95rem;font-weight:600;color:var(--ink-2);transition:opacity .4s var(--ease-out)`; `.is-swap{opacity:0}` (L1851).
- `.pf-year__ticks` (L1852): `display:flex;gap:6px;margin-top:16px`; each `i` (L1853): `flex:1;height:3px;border-radius:3px;background:var(--line-strong);transition:background-color .6s var(--ease-out)`; `i.is-on{background:var(--accent)}` (L1854).
- Behaviour: when the active role changes, the two year lines swap with a vertical crossfade and blur (scrolling down: new year comes up from below, old leaves upward; scrolling up: the reverse), the counter shows `01` to `04`, ticks up to the active one light, and the role line fades out for 240ms, changes text and fades back in (11.4.11).

##### Timeline (`div.pf-tl`, L3596-3654, CSS L1856-1895)
Markup:
- `div.pf-tl__track[aria-hidden="true"] > span.pf-tl__fill`
- `ol.pf-tl__list[role="list"]` > four `li.pf-role` (each with `id`, `data-from`, `data-to`, `data-role`) containing `span.pf-link[aria-hidden="true"]`, `span.pf-node[aria-hidden="true"] > span` (the number), and `article.card.pf-role__card[data-spotlight][data-reveal="left"]`.
- Card content: `div.pf-role__top` (badge if any, then `span.pf-role__date` with icon `i-calendar` + dates), `h4.pf-role__title`, `p.pf-role__co` (`span.pf-co-ic[aria-hidden="true"]` with the company icon, then company name), `p.pf-role__desc`, `ul.tags.pf-tags[role="list"]` of `li.tag`.

| `li` id | `data-from` | `data-to` | `data-role` | Node | Badge | Date | Title | Company | Company icon | Lines |
|---|---|---|---|---|---|---|---|---|---|---|
| `pf-role-techxelo` | 2024 | 2026 | `Software Engineer · TechXelo` | `01` | `span.pf-badge.pf-badge--live` = `span.dot-live[aria-hidden]` + `CURRENT` | `2024 - 2026` | `Software Engineer` | `TechXelo` | `i-code` | L3600-3612 |
| `pf-role-upwork` | 2023 | 2024 | `Freelance Developer · Upwork Platform` | `02` | `span.pf-badge.pf-badge--closed` = `span.pf-badge__dot[aria-hidden]` + `CLOSED` | `2023 - 2024` | `Freelance Developer` | `Upwork Platform` | `i-globe` | L3614-3626 |
| `pf-role-uha` | 2023 | 2024 | `Outsourcing Engineer · UHA International` | `03` | none | `2023 - 2024` | `Outsourcing Engineer` | `UHA International` | `i-building` | L3628-3639 |
| `pf-role-viral` | 2022 | 2023 | `React Native Developer · Viral Square` | `04` | none | `2022 - 2023` | `React Native Developer` | `Viral Square` | `i-phone-dev` | L3641-3652 |

Descriptions and tags are in the content data (11.4.12, experience.ts).

CSS:
- `.pf-tl` (L1857): `position:relative;--node:40px;--rail:56px;padding-left:var(--rail)`.
- `.pf-tl__track` (L1858): `position:absolute;left:calc(var(--node)/2 - 1px);top:0;height:0;width:2px;border-radius:2px;background:var(--line-strong);overflow:hidden`. JS sets `top` and `height` so the track runs from the first node centre to the last node centre.
- `.pf-tl__fill` (L1859): `position:absolute;inset:0;background:linear-gradient(180deg,var(--accent),var(--brand));transform-origin:50% 0;transform:scaleY(0);will-change:transform`. JS writes `transform:scaleY(n)`.
- `.pf-tl__list` (L1860): `display:grid;gap:clamp(20px,2.4vw,28px)`. `.pf-role{position:relative}` (L1861).
- `.pf-node` (L1862-1864): `position:absolute;left:calc(-1 * var(--rail));top:26px;width:var(--node);height:var(--node);border-radius:50%;display:grid;place-items:center;z-index:2;background:var(--surface);border:1px solid var(--line-strong);color:var(--muted);font-family:var(--font-mono);font-size:.7rem;font-weight:500;letter-spacing:.02em;transition:background-color .6s var(--ease-out),border-color .6s var(--ease-out),color .6s var(--ease-out),box-shadow .8s var(--ease-out),transform .6s var(--ease-out)`.
- `.pf-node::after` (L1865): `content:"";position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--accent);opacity:0;transform:scale(.8);transition:opacity .8s var(--ease-out),transform .8s var(--ease-out)`.
- Lit (`.pf-role.is-on`, L1866): node `background:var(--grad);border-color:transparent;color:#fff;box-shadow:var(--glow)`.
- Active (`.pf-role.is-active`, L1867-1868): halo ring `opacity:.35;transform:none`; node `transform:scale(1.08)`.
- `.pf-link` connector (L1870-1872): `position:absolute;left:calc(-1 * var(--rail) + var(--node) + 4px);top:calc(26px + var(--node) / 2);width:calc(var(--rail) - var(--node) - 4px);height:1px;background:linear-gradient(90deg,var(--accent),var(--line-strong));transform-origin:0 50%;transform:scaleX(0);transition:transform .7s var(--ease-out) .15s;z-index:1`; `.pf-role.is-on .pf-link{transform:scaleX(1)}` (draws from node to card 150ms after the node lights).
- `.pf-role__card` (L1874): `padding:clamp(22px,2.6vw,32px);border-radius:var(--r-lg)` (plus `.card`). Hover (L1875): `border-color:var(--line-strong);box-shadow:var(--shadow-md)`. Active (L1876): `border-color:var(--line-strong)`. It has the shared spotlight (`[data-spotlight]`, L166-170).
- Flash (L1877-1878): `.pf-flash{animation:pf-flash 1.8s var(--ease-out) .5s}`; `@keyframes pf-flash{0%{box-shadow:0 0 0 0 var(--accent-soft),var(--shadow-md)}35%{box-shadow:0 0 0 8px var(--accent-soft),var(--shadow-md)}100%{box-shadow:0 0 0 0 transparent,var(--shadow-md)}}`. JS adds the class and removes it after 2600ms.
- `.pf-role__top` (L1879): `display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px`.
- `.pf-role__date` (L1880-1881): `display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:.78rem;letter-spacing:.06em;color:var(--muted)`; icon `14px`. When the date is the only child (roles 3 and 4 have no badge) it is pushed right: `.pf-role__top>.pf-role__date:only-child{margin-left:auto}` (L1882).
- `.pf-role__title` (L1883): `font-size:clamp(1.3rem,2vw,1.65rem);font-weight:700;letter-spacing:-.03em`.
- `.pf-role__co` (L1884): `display:flex;align-items:center;gap:10px;margin-top:10px;font-weight:600;color:var(--brand-ink);font-size:.95rem`. `.pf-co-ic` (L1885-1886): `width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand-ink);flex:none`; icon `16px`.
- `.pf-role__desc` (L1887): `margin-top:16px;color:var(--ink-2);font-size:.97rem;line-height:1.7;max-width:62ch`.
- `.pf-tags{margin-top:20px}` (L1888); tags use the shared `.tag` (L154-155).
- 600px and under (L1889-1895): `.pf-tl{--node:32px;--rail:44px}`; `.pf-node{top:24px;font-size:.62rem}`; `.pf-link{top:calc(24px + var(--node) / 2)}`; `.pf-role__card{padding:20px}`; `.pf-role__top{margin-bottom:14px}`.

##### How the timeline behaves (JS details in 11.4.11)
- An anchor line sits at 58% of the viewport height. The fill grows (eased) to where the anchor is between the first and last node centres.
- A role is lit (`.is-on`: filled node, drawn connector) when both the fill end and the anchor have passed its node centre.
- The active role (`.is-active`: bigger node with halo ring, stronger card border, and the one shown in the year box) is the last role whose node centre is above the anchor. It is never less than the first role.

#### 11.4.7 Education (HTML L3657-3704, CSS L1897-1940, JS L6793-6801)

##### Layout
- Root `div.pf-block.pf-edu-block[role="region"][aria-labelledby="pf-edu-title"]` (no id), then the row head (11.4.5), then `div.pf-edu-grid` with three `article`s.
- `.pf-edu-grid` (L1898): `display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(16px,2vw,24px)`. At min-width 860px (L1899-1902): `grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);grid-template-rows:auto auto` and `.pf-edu--feat{grid-row:1 / span 2}`: the degree card fills the left column, the two small cards stack on the right.
- Shared card (L1903-1911): `.pf-edu{padding:clamp(22px,2.6vw,32px);display:flex;flex-direction:column;overflow:hidden}`; `.pf-edu__top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}`; `.pf-edu__yrs{font-family:var(--font-mono);font-size:.78rem;letter-spacing:.06em;color:var(--muted)}`; `.pf-edu__title{margin-top:18px;font-size:clamp(1.2rem,1.7vw,1.4rem);font-weight:700;letter-spacing:-.025em}` with `.serif{font-weight:400;color:var(--brand-ink)}`; `.pf-edu__inst{display:flex;align-items:flex-start;gap:8px;margin-top:10px;font-size:.92rem;font-weight:600;color:var(--ink-2)}` with icon `width:16px;height:16px;margin-top:.22em;color:var(--brand-ink)`; `.pf-edu__desc{margin-top:14px;font-size:.94rem;color:var(--ink-2);line-height:1.7}`; `.pf-edu--sm .pf-tags{margin-top:auto;padding-top:20px}` (tags pinned to the bottom).

##### Featured degree card (`article.card.pf-edu.pf-edu--feat#pf-edu-bs[data-spotlight][data-reveal="fade"]`, L3668-3680)
Children in order:
1. `span.pf-edu__sheen[aria-hidden="true"]` (light sweep layer).
2. `span.pf-edu__mark[aria-hidden="true"]` text `BS-SE` (big outlined watermark).
3. `div.pf-edu__top`: `span.pf-edu__ic[aria-hidden="true"]` with icon `i-grad`, then `span.pf-badge.pf-badge--onbrand` text `BACHELOR'S DEGREE`.
4. `p.pf-edu__yrs.pf-edu__yrs--big` text `2020 - 2024`.
5. `h4.pf-edu__title` text `Software Engineering ` + `span.serif` `(BS-SE)`.
6. `p.pf-edu__inst`: icon `i-building` (`aria-hidden`) + `span` `University of Management & Technology, Lahore`.
7. `p.pf-edu__desc` (text in education.ts).
8. `ul.tags.pf-tags[role="list"]` with 4 tags.

CSS:
- Surface (L1914): `background:var(--grad);border-color:transparent;box-shadow:var(--shadow-lg);border-radius:var(--r-xl);padding:clamp(26px,3.4vw,44px);color:rgba(255,255,255,.82);min-height:100%`.
- Glow blob `::after` (L1915): `content:"";position:absolute;right:-20%;top:-30%;width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.16),transparent 62%);pointer-events:none;z-index:0`.
- Spotlight colour on brand (L1916): `.pf-edu--feat[data-spotlight]::before{background:radial-gradient(420px circle at var(--mx) var(--my),rgba(255,255,255,.10),transparent 45%)}` (the shared spotlight shows it on hover, L166-170).
- Watermark `.pf-edu__mark` (L1917): `position:absolute;right:.2em;top:-.16em;z-index:0;font-family:var(--font-serif);font-style:italic;font-size:clamp(6rem,13vw,11.5rem);line-height:1;letter-spacing:-.03em;color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.22);pointer-events:none;user-select:none;white-space:nowrap`.
- Icon tile `.pf-edu__ic` (L1918-1919): `width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);color:#fff`; icon `24px`.
- `.pf-edu--feat .pf-edu__top{justify-content:flex-start;gap:14px}` (L1920).
- Years (L1921): `.pf-edu__yrs--big{margin-top:clamp(28px,4vw,56px);font-size:.82rem;letter-spacing:.18em;color:rgba(255,255,255,.72)}`.
- Title (L1922-1923): `margin-top:10px;font-size:clamp(1.8rem,3.2vw,2.75rem);letter-spacing:-.04em;line-height:1.05;color:#fff;max-width:14ch`; `.serif{color:#fff;opacity:.85}`.
- Institution (L1924-1925): `color:#fff;margin-top:16px;font-size:.98rem`; icon `color:#fff;opacity:.8`.
- Description (L1926): `color:rgba(255,255,255,.82);max-width:46ch;font-size:1rem`.
- Tags (L1927-1928): `margin-top:auto;padding-top:28px;max-width:78%`; each `.tag{background:rgba(255,255,255,.12);color:#fff}`.
- Entrance (when the reveal observer adds `.is-in`):
  - Card (L1929-1930): `animation:pf-clip 1.3s var(--ease-out) both`; `@keyframes pf-clip{from{clip-path:inset(12% 14% 12% 14% round 48px)}to{clip-path:inset(0 0 0 0 round var(--r-xl))}}`. It opens from a smaller rounded window to the full card, while the `fade` reveal fades it in (opacity over `var(--dur-3)` = .9s, blur 4px to 0).
  - Watermark (L1931-1932): `animation:pf-mark 1.6s var(--ease-out) .25s both`; `@keyframes pf-mark{from{opacity:0;transform:translate3d(40px,0,0)}to{opacity:1;transform:none}}`.
- Light sweep (L1933-1936): `.pf-edu__sheen{position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;overflow:hidden}`; `::before{content:"";position:absolute;top:-20%;bottom:-20%;left:0;width:38%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.14) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.14) 55%,transparent);transform:translate3d(-120%,0,0) skewX(-12deg)}`. It runs only with `.is-in.pf-play`: `animation:pf-sheen 13s cubic-bezier(.45,0,.25,1) 1.2s infinite`; `@keyframes pf-sheen{0%{transform:translate3d(-120%,0,0) skewX(-12deg)}22%,100%{transform:translate3d(330%,0,0) skewX(-12deg)}}` (one pass in the first 22% of 13s, about 2.86s, then a pause until the next loop).
- `.pf-play` is toggled by an IntersectionObserver (threshold `.15`) while the card is on screen (JS L6796-6801, 11.4.11). Each time it comes back into view the sweep restarts with its 1.2s delay. Not created under reduced motion, so the sweep never runs there.
- 600px and under (L1937-1940): `.pf-edu--feat .pf-tags{max-width:none}`; `.pf-edu__mark{display:none}`.

##### Small cards (`article.card.card--hover.pf-edu.pf-edu--sm[data-spotlight][data-reveal]`)
| id | `data-delay` | Badge (`span.pf-badge`) | Years | Title | Institution icon | Institution | Lines |
|---|---|---|---|---|---|---|---|
| `pf-edu-inter` | 120 | `INTERMEDIATE` | `2018 - 2020` | `Computer Science ` + `span.serif` `(Inter)` | `i-pin` | `Unique College, Lahore` | L3682-3691 |
| `pf-edu-matric` | 220 | `MATRICULATION` | `2016 - 2018` | `Computer Science ` + `span.serif` `(Matric)` | `i-pin` | `Unique College, Lahore` | L3693-3702 |

- Order inside: `div.pf-edu__top` (badge, then `span.pf-edu__yrs`), `h4.pf-edu__title`, `p.pf-edu__inst` (icon + `span`), `p.pf-edu__desc`, `ul.tags.pf-tags`.
- Hover: `.card--hover:hover` asks for `translateY(-4px)`, `var(--shadow-md)` and `var(--line-strong)` border, but see Notes and traps (the reveal rule cancels the lift).

#### 11.4.8 Technical expertise: skill tabs and rings (HTML L3706-3760, CSS L1942-2001, JS L6718-6791)

##### Layout
- Root `div.pf-block.pf-tech[role="region"][aria-labelledby="pf-tech-title"]`, row head (11.4.5), then `div.pf-tech-grid` with `div.card.pf-skills#pf-skills[data-reveal]`, `article.card.pf-lang`, `article.card.pf-core`.
- `.pf-tech-grid` (L1943): `display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(16px,2vw,24px)`. At min-width 960px (L1944-1947): `grid-template-columns:minmax(0,1fr) minmax(0,2fr)` and `.pf-skills{grid-column:1 / -1}`: skills card full width on row 1, Languages (1fr) and Core Expertise (2fr) side by side on row 2. Under 960px all three stack.
- `.pf-skills{padding:10px;border-radius:var(--r-xl)}` (L1948).

##### Tabs (segmented control, L3718-3724, CSS L1950-1967)
- `div.pf-tabs[role="tablist"][aria-label="Skill groups"]` containing `span.pf-tabs__ind[aria-hidden="true"]` (the moving pill) and four `button.pf-tab[role="tab"]`, each `svg.i[aria-hidden="true"]` + `span` label:

| Button id | `aria-controls` | Initial `aria-selected` / `tabindex` | Icon | Label |
|---|---|---|---|---|
| `pf-tab-0` | `pf-panel-0` | `true` / `0` | `i-code` | `Programming Languages` |
| `pf-tab-1` | `pf-panel-1` | `false` / `-1` | `i-layers` | `Frameworks & Libraries` |
| `pf-tab-2` | `pf-panel-2` | `false` / `-1` | `i-sparkles` | `AI & LLM Frameworks` |
| `pf-tab-3` | `pf-panel-3` | `false` / `-1` | `i-eye` | `CSS & Styling` |

- `.pf-tabs` (L1951): `position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:5px;border-radius:calc(var(--r-xl) - 8px);background:var(--surface-3);border:1px solid var(--line)`. At min-width 760px (L1961-1963): `grid-template-columns:repeat(4,minmax(0,1fr))`. So under 760px the tabs are a 2 by 2 grid.
- `.pf-tab` (L1952-1953): `position:relative;z-index:1;min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:18px;font-size:.84rem;font-weight:600;line-height:1.2;color:var(--muted);text-align:center;transition:color var(--dur-1) var(--ease-out),background-color var(--dur-1)`. Icon (L1954): `width:16px;height:16px;flex:none;opacity:.8`. Hover (L1955): `color:var(--ink)`. Selected (L1956): `[aria-selected="true"]{color:var(--brand-ink)}`. Focus (L1957): `outline-offset:-2px` (the global `:focus-visible` outline, L106).
- 420px and under (L1964-1967): `.pf-tab{font-size:.78rem;padding:8px 8px;gap:6px}` and `.pf-tab .i{display:none}`.
- Indicator (L1958-1960): `position:absolute;z-index:0;left:0;top:0;width:0;height:0;border-radius:18px;background:var(--surface);box-shadow:var(--shadow-sm);border:1px solid var(--line);opacity:0;transition:transform .6s var(--ease-out),width .6s var(--ease-out),height .6s var(--ease-out),opacity .3s`. `.pf-tabs.is-ready .pf-tabs__ind{opacity:1}`.
- How the indicator moves: JS sets its inline `width` and `height` to the selected tab's `offsetWidth`/`offsetHeight` and `transform:translate(<offsetLeft>px,<offsetTop>px)`. With the CSS transition it glides and resizes to the new tab over .6s. In the 2 by 2 layout it moves on both axes. On first placement, on resize, after fonts load and on page show it is placed with the transition turned off for that one write (no glide), then `.is-ready` fades it in over .3s.
- Keyboard (on the tablist, L6768-6777): ArrowRight or ArrowDown = next tab (wraps), ArrowLeft or ArrowUp = previous (wraps), Home = first, End = last. The key's default is prevented, the new tab is selected and focused at once (automatic activation). Other keys are ignored. Roving tabindex: only the selected tab has `tabindex="0"`. Enter and Space work through the native button click.
- Click: selects that tab (no focus call).

##### Panels (L3726-3759, CSS L1969-1977)
- `div.pf-panels` holds four `div.pf-panel[role="tabpanel"][tabindex="0"]` with ids `pf-panel-0` to `pf-panel-3` and `aria-labelledby` `pf-tab-0` to `pf-tab-3`. `pf-panel-0` has `.is-active` in the markup.
- `.pf-panels` (L1970): `display:grid;padding:clamp(28px,4vw,48px) clamp(12px,3vw,36px) clamp(22px,3vw,36px)`.
- `.pf-panel` (L1971-1972): all panels share one grid cell: `grid-area:1 / 1;opacity:0;visibility:hidden;transform:translate3d(0,-8px,0);filter:blur(6px);transition:opacity .4s var(--ease-out),transform .5s var(--ease-out),filter .4s var(--ease-out),visibility 0s linear .45s` (the old panel fades up and out, and becomes `visibility:hidden` after .45s).
- `.pf-panel.is-active` (L1973): `opacity:1;visibility:visible;transform:none;filter:none;transition:opacity .6s var(--ease-out) .14s,transform .8s var(--ease-out) .14s,filter .6s var(--ease-out) .14s,visibility 0s` (the new one comes in 140ms later: a crossfade).
- Skills rise in the active panel (L1974-1976): `.pf-panel.is-active .pf-skill{animation:pf-rise .8s var(--ease-out) both;animation-delay:calc(var(--k,0) * 70ms + 160ms)}`; `--k` from `:nth-child(2)` 1, `(3)` 2, `(4)` 3, so delays 160, 230, 300, 370ms; `@keyframes pf-rise{from{opacity:0;transform:translate3d(0,14px,0) scale(.96)}to{opacity:1;transform:none}}`.
- `.pf-panel:focus-visible{outline-offset:6px;border-radius:14px}` (L1977).
- Each panel holds `ul.pf-rings[role="list"]` with four `li.pf-skill[data-v]`. `.pf-rings` (L1978-1979): `display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 12px`; at min-width 640px `repeat(4,minmax(0,1fr))`.

##### Rings (L3729-3756, CSS L1980-2001)
- Markup per skill: `li.pf-skill[data-v="90"]` > `span.pf-ring` > `svg[viewBox="0 0 120 120"][aria-hidden="true"]` with `circle.pf-ring__track` (`cx="60" cy="60" r="52" pathLength="100"`) and `circle.pf-ring__bar` (same plus `transform="rotate(-90 60 60)"`, so it starts at 12 o'clock), then `span.pf-ring__num[aria-hidden="true"]` text `0%`; after the ring `span.pf-skill__name` = name + `span.sr-only` text `: 90%` (screen readers read "JavaScript: 90%").
- `.pf-skill` (L1980): `display:grid;justify-items:center;gap:14px;text-align:center`.
- `.pf-ring` (L1981, L1990): `position:relative;width:clamp(108px,12vw,156px);aspect-ratio:1;display:grid;place-items:center;transition:transform .6s var(--ease-out)`. `svg` (L1982): `position:absolute;inset:0;width:100%;height:100%;overflow:visible`.
- Track (L1983): `fill:none;stroke:var(--line-strong);stroke-width:3`.
- Bar (L1984-1985): `fill:none;stroke:url(#pf-ring-g);stroke-width:5;stroke-linecap:round;stroke-dasharray:100 100;stroke-dashoffset:100;transition:stroke-dashoffset 1.4s var(--ease-out),stroke-width .5s var(--ease-out)`. Lit (L1986): `.pf-skill.is-lit .pf-ring__bar{stroke-dashoffset:calc(100 - var(--v,0))}`. `pathLength="100"` makes the dash units percentages.
- Number (L1987, L1993): `position:relative;font-size:clamp(1.35rem,2vw,1.7rem);font-weight:800;letter-spacing:-.04em;color:var(--ink);font-variant-numeric:tabular-nums`. JS counts it from `0%` to the value over 1400ms.
- Name (L1988): `font-size:.9rem;font-weight:600;color:var(--ink-2);line-height:1.3;transition:color .4s`.
- Bloom (L1991): `.pf-ring::before{content:"";position:absolute;inset:10%;border-radius:50%;background:radial-gradient(circle,var(--accent-soft),transparent 70%);opacity:0;transform:scale(.8);transition:opacity .6s var(--ease-out),transform .8s var(--ease-out)}`.
- `.pf-ring__track,.pf-ring__num{transition:stroke .4s,color .4s,transform .6s var(--ease-out)}` (L1992).
- Hover, only in `@media (hover:hover)` (L1994-2001), on `.pf-skill:hover`: ring `transform:translate3d(0,-4px,0)`; bloom `opacity:1;transform:scale(1.15)`; bar `stroke-width:7`; track `stroke:var(--accent-soft)`; number `color:var(--brand-ink);transform:scale(1.06)`; name `color:var(--ink)`.
- Lighting sequence (JS `light()`): every skill in the panel is reset (bar transition off, `.is-lit` removed, number `0%`, `--v` set from `data-v` as an inline style on the `li`), then skill k gets `.is-lit` and its count starts after `delay + k * 90` ms. First lighting: `delay` 250ms, when the skills card is 35% visible and the preloader is done. Each tab change after that: `delay` 220ms. So the bars draw over 1.4s at 250, 340, 430, 520ms (first) or 220, 310, 400, 490ms (tab change).

Values per tab are in skills.ts (11.4.12).

#### 11.4.9 Languages and Core expertise cards (HTML L3762-3790, CSS L2003-2027, JS L6803-6829)

##### Shared card head (L2004-2007)
- `div.pf-card-head{display:flex;align-items:center;gap:14px}` with `span.icon-tile.icon-tile--soft[aria-hidden="true"]` (icon inside) and `h4.pf-card-head__title`.
- `.pf-card-head .icon-tile{width:44px;height:44px;border-radius:13px}`; its icon `width:20px;height:20px`. `.icon-tile--soft` (L163): `background:var(--brand-soft);color:var(--brand-ink);box-shadow:none`.
- `.pf-card-head__title{font-size:1.15rem;font-weight:700;letter-spacing:-.02em}`.

##### Languages (`article.card.pf-lang[data-reveal][data-delay="120"]`, L3762-3771)
- Head: icon `i-globe`, title `Languages`.
- `.pf-lang` (L2008): `padding:clamp(22px,2.6vw,30px);display:flex;flex-direction:column;border-radius:var(--r-xl)`.
- `ul.pf-lang__list[role="list"]` (L2009 `margin-top:26px;display:grid`) with two `li.pf-lang__row`: `span.pf-lang__mono[aria-hidden="true"]`, `span.pf-lang__name`, `span.pf-lang__lvl`.

| Mono | Name | Level | Level class |
|---|---|---|---|
| `En` | `English` | `Professional` | `pf-lang__lvl` |
| `Ur` | `Urdu` | `Native` | `pf-lang__lvl pf-lang__lvl--native` |

- Row (L2010-2011): `display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px;padding:18px 0;border-top:1px solid var(--line)`; `:last-child{padding-bottom:4px}`.
- Mono (L2012): `width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-family:var(--font-serif);font-style:italic;font-size:1.6rem;line-height:1;color:var(--brand-ink);background:var(--brand-soft);border:1px solid var(--line)`.
- Name (L2013): `font-size:1.1rem;font-weight:700;color:var(--ink);letter-spacing:-.02em`.
- Level (L2014-2015): `font-family:var(--font-mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brand-ink);padding:6px 10px;border-radius:8px;background:var(--brand-soft)`; `--native{background:var(--accent-soft)}`.

##### Core expertise (`article.card.pf-core[data-reveal][data-delay="80"]`, L3773-3790)
- Head: icon `i-zap`, title `Core Expertise`. `.pf-core{padding:clamp(22px,2.6vw,30px);border-radius:var(--r-xl)}` (L2018).
- `ul.pf-chips[role="list"][data-stagger="45"]` (L2019 `display:flex;flex-wrap:wrap;gap:10px;margin-top:26px`) with ten `li.pf-chipw[data-reveal]` (L2023 `display:inline-flex`), each wrapping `span.pf-chip` = `svg.i[aria-hidden="true"]` + label. The `li` does the reveal (stagger 45ms, 11.4.0) and the inner `span` does the hover and magnet motion, so the two transforms never fight.

| # | Icon | Label |
|---|---|---|
| 1 | `i-sparkles` | `AI/LLM Integration` |
| 2 | `i-cpu` | `AI Agents & Workflows` |
| 3 | `i-code` | `Frontend Development` |
| 4 | `i-server` | `Backend Development` |
| 5 | `i-phone-dev` | `Mobile Development` |
| 6 | `i-layers` | `Progressive Web Apps` |
| 7 | `i-check-circle` | `Website Testing` |
| 8 | `i-cloud` | `Cloud Deployment` |
| 9 | `i-rocket` | `Performance Optimization` |
| 10 | `i-grid` | `UI/UX Design` |

- `.pf-chip` (L2020-2022): `--tx:0px;--ty:0px;--lift:0px;transform:translate3d(var(--tx),calc(var(--ty) + var(--lift)),0);display:inline-flex;align-items:center;gap:9px;min-height:44px;padding:0 16px 0 14px;border-radius:var(--r-pill);background:var(--surface-2);border:1px solid var(--line);font-size:.88rem;font-weight:600;color:var(--ink-2);transition:transform .5s var(--ease-out),border-color .4s,background-color .4s,color .4s,box-shadow .5s var(--ease-out)`. Icon (L2024): `width:16px;height:16px;color:var(--brand-ink)`.
- Hover, only in `@media (hover:hover)` (L2025-2027): `--lift:-3px;border-color:var(--line-strong);background:var(--surface);color:var(--ink);box-shadow:var(--shadow-sm)`.
- Field magnetism (fine pointer, no reduced motion; JS L6806-6829): chips within 150px of the pointer lean toward it, at most 7px sideways and 5px up or down, by writing `--tx` and `--ty`; all reset to `0px` when the pointer leaves the chip list. The .5s transform transition smooths it (11.4.11).

#### 11.4.10 Reduced motion (CSS L2029-2036, shell L357-362, JS `FH.reduce`)
- Page CSS (L2030-2036):
  - `#profile .pf-hero{--sp:0!important}` (no scroll exit).
  - `#profile .pf-sheet,#profile .pf-sheet__float{transition:none;animation:none!important}` (no fan transition, no float).
  - `#profile .pf-edu--feat.is-in,#profile .pf-panel.is-active .pf-skill{animation:none}` (no clip open, no ring rise).
  - `#profile .pf-tl__fill{will-change:auto}`.
  - `#profile .pf-panel{transform:none}`.
- Shell (L357-362): every animation and transition gets `.001ms` with 1 iteration; `.js [data-reveal]` is forced visible with `clip-path:none!important`; split words show at once. So the entrance transitions of the hero finish at once when `.is-in` is added.
- JS (`FH.reduce`, read once at load from `(prefers-reduced-motion: reduce)`, L4565):
  - `playHero()` adds `.is-in` and `.is-settled` together, never `.is-live`; counters show `3` at once (L6540-6544).
  - On page show it calls `playHero()` straight away instead of waiting for the curtain (L6843); on first load the delay is 0 (L6847).
  - Pointer tilt and chip magnetism are not bound (L6580, L6807).
  - `heroScroll()` still toggles `.is-idle` but never writes `--sp` (L6568-6569).
  - Timeline: `cur = target` with no easing (L6663); year lines and role text change without the crossfade (L6682, L6705).
  - Rings: lit and counted at once, no delays (L6748, `countTo` sets the final text at L6508); the skills card starts at once with no observer (L6784).
  - The education sheen observer is never created (L6797), so the sweep never plays.
  - `jumpTo` uses `FH.scrollToEl`, which scrolls with `behavior:'auto'` under reduced motion (L4687).

#### 11.4.11 JS behaviours (profile.js L6489-6851)

The script is one IIFE scoped to `section#profile` (`sec`, L6494; returns if missing). `reduce = !!FH.reduce` (L6496). Helpers `$`/`$$` query inside `sec` (L6497-6498). `raf` = `requestAnimationFrame` (fallback `setTimeout(f,16)`, L6499).

##### Helpers (L6500-6516)
- `pad(n)`: two digit string (`'0'+n` under 10).
- `onPage()`: `!FH.current || FH.current === 'profile'`. In the rebuild: the Profile route is mounted.
- `visible(el)`: `!!(el && el.offsetParent)` (false while the page is `display:none`).
- `whenLoaded(fn)`: polls every 120ms until `<html>` has `.is-loaded` (set when the preloader finishes, L4782: 1250ms after DOM ready, or at once under reduced motion), then runs `fn`. In React: a shared "preloader done" state or promise from the shell.
- `countTo(el, to, dur, suffix)`: under reduced motion sets `to + suffix` at once. Otherwise a rAF loop from `performance.now()`: `p = min(1,(t - t0)/dur)`, ease `e = 1 - Math.pow(1 - p, 4)` (ease out quart), text `Math.round(to * e) + suffix`. No cancel handle. Port as `useCountUp` or a `countTo()` util that returns a cancel function.

##### A. Hero entrance and replay (L6522-6560)
- Name and lines: `resetHero` L6528-6533, `playHero` L6534-6550, `afterCurtain` L6552-6560, `clearPlay` L6527.
- Starts when: (1) first load with Profile as the current page (L6845-6848): `resetHero()`, then `whenLoaded(() => setTimeout(playHero, reduce ? 0 : 120))`; (2) every `fh:page` event with `detail === 'profile'` (L6834-6844): `resetHero()`, then `reduce ? playHero() : afterCurtain(playHero)`.
- `afterCurtain(fn)`: the curtain "covers" while `#curtain` has `.is-on` and not `.is-out`. If it is not covering: run `fn` after 150ms. If it is: a `MutationObserver` on the curtain's `class` attribute calls `go` as soon as it stops covering (the router adds `.is-out` 140ms after the page swap, L4707); `go` disconnects the observer and runs `fn` after 150ms. Fallback: `go` after 1600ms. `go` runs once.
- Reads or measures: `c.dataset.to` of each `.pf-count`; forces a reflow with `void hero.offsetWidth` before adding `.is-in` so the transitions replay.
- Writes: `resetHero` clears timers, removes `.is-in`, `.is-settled`, `.is-live` from the hero and sets each `.pf-count` text to `'0'` (or to `data-to` under reduced motion). `playHero` resets, adds `.is-in`, calls `heroScroll()` once, then:
  - reduced motion: adds `.is-settled` and sets counters to `data-to` right away, stops.
  - otherwise: at +520ms `countTo(c, parseInt(c.dataset.to,10), 1200)` for both counters (text `0` to `3`; the `+` is a separate span); at +1700ms adds `.is-settled` and `.is-live`.
- Timings: 150ms after the curtain starts to lift (or 120ms after the preloader on first load); count 520ms + 1200ms; settle and float at 1700ms. All CSS timings in 11.4.3.
- Pauses or skips when: `fh:page` for any other page calls `clearPlay()` only (pending timers dropped; classes stay, the page is hidden anyway).
- Cleanup in React: clear all timeouts, disconnect the MutationObserver, cancel the count rAF on unmount or route change.
- Port as: `useProfileHeroEntrance(heroRef)` returning the state classes (`is-in`, `is-settled`, `is-live`), plus a curtain signal from the shell (for example `usePageTransition().onCurtainLift`). Render counters with the final value on the server, reset to `0` on the client just before the entrance (see Notes).

##### B. Hero scroll exit and idle flag (L6562-6577, L6630-6631)
- Name and lines: `heroScroll` L6564-6576, `kickScroll` L6577.
- Starts when: window `scroll` (passive) and `resize` (passive, also sets `lastSp = -1` to force a write); also called from `playHero` and from the `fh:page` rAF (with `lastSp = -1`).
- Reads or measures: `hero.getBoundingClientRect()`, `innerHeight`.
- Writes:
  - Toggles `.is-idle` on the hero when `r.bottom < 0 || r.top > innerHeight` (before the reduced motion check).
  - Then, if not reduced motion: `p = Math.min(1, Math.max(0, (innerHeight - r.bottom) / Math.max(1, innerHeight * .8)))`, then smoothstep `p = p * p * (3 - 2 * p)`; skip if `Math.abs(p - lastSp) < .001`; else `hero.style.setProperty('--sp', p.toFixed(4))`.
- Timings: one rAF per scroll burst (`sRaf` guard).
- Pauses or skips when: not on the Profile page, or the hero is not rendered (`offsetParent` null). Reduced motion: no `--sp`.
- Cleanup in React: remove the scroll and resize listeners, cancel the pending rAF.
- Port as: `useHeroScrollProgress(heroRef, { distance: .8 })` that writes `--sp` and returns or sets the idle flag. The Works and Approvals heroes have similar exits (section 3), so one shared hook with options is a good fit, but keep this page's exact formula.

##### C. Desk pointer tilt (L6579-6598)
- Name and lines: `loop` L6582-6587, listeners L6588-6597.
- Starts when: bound once if `tilt && FH.fine && !reduce` (`FH.fine` = `matchMedia('(pointer:fine)').matches`, read once at load, L4627). `pointermove` (passive) and `pointerleave` on `header.pf-hero` (the whole hero, not only the desk).
- Reads or measures: on each move, `desk.getBoundingClientRect()`; `px = (e.clientX - (r.left + r.width / 2)) / Math.max(1, innerWidth / 2)`, `py = (e.clientY - (r.top + r.height / 2)) / Math.max(1, innerHeight / 2)`.
- Writes: goals `gy = clamp(px, -1, 1) * 5` (rotateY degrees) and `gx = clamp(py, -1, 1) * -4` (rotateX degrees). The loop lerps `tx += (gx - tx) * .08; ty += (gy - ty) * .08` and writes `--tx` = `tx.toFixed(3) + 'deg'` and `--ty` = `ty.toFixed(3) + 'deg'` on `.pf-desk__tilt`. Note the names: `--tx` is the X axis rotation (from pointer Y) and `--ty` the Y axis rotation (from pointer X).
- Timings: lerp factor `.08` per frame; the loop stops when both `Math.abs(goal - current) <= .01`.
- Pauses or skips when: `pointermove` is ignored until the hero has `.is-settled`. `pointerleave` sets both goals to 0 and runs the loop back to flat. Touch and coarse pointers: never bound.
- Cleanup in React: remove both listeners, cancel the rAF.
- Port as: `useDeskTilt(heroRef, deskRef, tiltRef, settled)`.

##### D. Sheet jump and flash (L6600-6629)
- Name and lines: `flash` L6600-6606, `jumpTo` L6607-6619, click binding L6624-6629.
- Starts when: `click` on any `a.pf-sheet`.
- Reads or measures: the href id (`#pf-edu-bs`, `#pf-role-techxelo`, `#pf-skills`); the target's `getBoundingClientRect().top` every 120ms.
- Writes: `e.preventDefault()` (this also tells the core router not to handle the link, so no `pushState` and no hash change); scrolls with `FH.scrollToEl(target)` (offset `innerWidth < 1024 ? 84 : 32` px above the element, using the smooth wheel scroller when present, L4687), fallback `scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})`. The flash target is the role's `.pf-role__card` when the target is a `.pf-role`, else the target itself. When the target top is in `(-20, innerHeight * .35)`, or after 3200ms, `flash(card)`: remove `.pf-flash`, force reflow, add `.pf-flash`, remove it after 2600ms.
- Timings: poll every 120ms, give up waiting at 3200ms; flash animation `pf-flash 1.8s var(--ease-out) .5s` (L1877).
- Pauses or skips when: missing target returns early.
- Cleanup in React: clear the poll and flash timeouts on unmount.
- Port as: `useJumpToSection()` returning `jumpTo(id)`; sheets render as `<a href="#pf-...">` with an `onClick` that calls `preventDefault()` then `jumpTo`.

##### E. CV link (L6622-6623)
- Rewrites `a.pf-cv` href to `FH.asset('imgs/Faisal-CVS.pdf')`, which equals the markup URL `https://faisalhanif.work/imgs/Faisal-CVS.pdf`. In the rebuild use the same shared CV path as the rest of the site (section 8: `/imgs/Faisal-CVS.pdf` from `frontend/public/`), with the `download` attribute.

##### F. Timeline fill, lit roles and active role (L6634-6675, L6710-6716)
- Name and lines: `layout` L6642-6649, `measure` L6651-6657, `frame` L6659-6674, `kick` L6675, bindings L6710-6716.
- Starts when: at init `layout(); kick()`; window `scroll` (passive) calls `kick`; window `resize` (passive) and a `ResizeObserver` on `.pf-tl` call `layout()` then `kick()` when layout succeeded; `document.fonts.ready` does the same; on `fh:page` for Profile, inside a rAF: `if(layout()){ activeIdx = -1; kick(); }`.
- Reads or measures:
  - `layout()`: for each role, `centers[i] = role.offsetTop + node.offsetTop + node.offsetHeight / 2` (relative to `.pf-tl`); `y0 = centers[0]`, `y1 = centers[last]`. Returns false if the timeline is not rendered.
  - `measure()`: `anchorRel = innerHeight * 0.58 - tl.getBoundingClientRect().top`; `target = clamp((anchorRel - y0) / max(1, y1 - y0), 0, 1)`.
- Writes:
  - `layout()`: `track.style.top = y0 + 'px'`, `track.style.height = Math.max(1, y1 - y0) + 'px'`.
  - `frame(t)`: `dt = lastT ? Math.min(100, t - lastT) : 16.7`; reduced motion `cur = target`; else `cur += (target - cur) * (1 - Math.pow(0.86, dt / 16.7))` and snap when `Math.abs(target - cur) < 0.0008`. `fill.style.transform = 'scaleY(' + cur.toFixed(4) + ')'`. `fillEnd = y0 + cur * len`. For each role: `.is-on` when `fillEnd >= centers[i] - 0.5 && anchorRel >= centers[i]`; `act` = last `i` with `anchorRel >= centers[i]` (starts at 0). If `act !== activeIdx` call `setActive(act)` (G).
- Timings: frame rate independent easing, factor `0.86` per 16.7ms; loop runs until `cur === target`.
- Pauses or skips when: `!onPage() || !visible(tl)` stops the loop (`running = false`, `lastT = 0`). `kick` does nothing off page.
- Cleanup in React: remove scroll and resize listeners, disconnect the ResizeObserver, cancel the rAF, ignore the fonts promise after unmount.
- Port as: `useTimelineProgress(tlRef, roleRefs)` returning `{ litSet, activeIndex }` or writing classes directly; keep the fill `scaleY` write outside React state (a ref) because it changes every frame.

##### G. Sticky year swap (L6677-6708)
- Name and lines: `swapLine` L6678-6691, `setActive` L6693-6708.
- Starts when: `frame` finds a new active index.
- Reads or measures: role `data-from`, `data-to`, `data-role`; current `.is-cur` span text.
- Writes:
  - `setActive(i)`: `dir = i > activeIdx ? 1 : -1`; `first = activeIdx < 0`; toggles `.is-active` on roles; `swapLine(from line, data-from, dir)` and `swapLine(to line, data-to, dir)`; `.pf-year__n` text `pad(i + 1)`; ticks `.is-on` for `k <= i`; role line: on first run or reduced motion set text at once; else add `.is-swap`, and after 240ms set the text and remove `.is-swap` (a pending swap is cleared first).
  - `swapLine(line, text, dir)`: returns if the text is unchanged. Reduced motion or no current span: set text. Else create `span.pf-year__txt` with `.is-enter-down` (dir 1) or `.is-enter-up` (dir -1), append, force reflow, set it to `pf-year__txt is-cur`; the old span becomes `.is-leave-up` (dir 1) or `.is-leave-down` (dir -1) and is removed after 950ms.
- Timings: CSS .9s transform, .7s opacity and blur (L1839); role text 240ms fade (L1850); removal 950ms.
- Pauses or skips when: no year box (it always exists; it is only `display:none` under 1024px, and still updates).
- Cleanup in React: clear the 240ms and 950ms timeouts.
- Port as: `StickyYear` component that keeps a small list of year spans with enter and leave states (for example keyed spans with a phase), driven by `activeIndex` and direction from F.

##### H. Skill tabs (L6718-6781)
- Name and lines: `placeInd` L6724-6733, `select` L6752-6764, bindings L6766-6781.
- Starts when: tab `click` (`select(k, false)`); `keydown` on the tablist (11.4.8); init `placeInd(true)`; window `resize` (passive) `placeInd(true)`; `document.fonts.ready` `placeInd(true)`; `fh:page` rAF `placeInd(true)`.
- Reads or measures: selected tab `offsetWidth`, `offsetHeight`, `offsetLeft`, `offsetTop`.
- Writes: `aria-selected` and `tabIndex` on every tab; `.is-active` on the matching panel; focus on the new tab when from the keyboard; indicator `width`, `height`, `transform:translate(Xpx,Ypx)` (with `transition:none` for that write when `instant`); `.is-ready` on `.pf-tabs`; if rings have started, `light(panels[i], 220)`.
- Timings: indicator .6s (L1959); panel crossfade (L1972-1973).
- Pauses or skips when: `placeInd` returns early if the tablist is not rendered. `select` of the already selected tab after start only refocuses.
- Cleanup in React: remove the resize listener.
- Port as: `SkillTabs` component with `useRovingTabs` (state = selected index) and `useIndicator(tabRefs, selected)`.

##### I. Ring lighting and first start (L6735-6750, L6782-6790)
- Name and lines: `light` L6735-6750, `start` L6783, observer L6784-6790.
- Starts when: first time `.pf-skills` is at least 35% visible (`IntersectionObserver`, `threshold:.35`, disconnects on first hit) and the preloader is done (`whenLoaded`); then `light(panels[current], 250)`. Under reduced motion or without IntersectionObserver it starts at once. After that, every tab change lights the new panel with delay 220.
- Reads or measures: each skill `data-v`.
- Writes: per skill: bar inline `transition:none`, remove `.is-lit`, number `0%`, `--v` inline on the `li` from `data-v`, force reflow with `bar.getBoundingClientRect()`, restore bar transition; then at `delay + k * 90` ms add `.is-lit` and `countTo(num, v, 1400, '%')`.
- Timings: bar 1.4s `var(--ease-out)`; number 1400ms ease out quart; stagger 90ms.
- Pauses or skips when: nothing lights before the card is seen. Not replayed when coming back to the page.
- Cleanup in React: clear the per ring timeouts and count rAFs when the tab changes again or on unmount (the reference does not, see Notes).
- Port as: `useSkillRings(panelRef, active, started)` plus `useInViewOnce(ref, { threshold: .35 })`.

##### J. Education sheen switch (L6793-6801)
- Starts when: an `IntersectionObserver` (`threshold:.15`) on `.pf-edu--feat`, created only if not reduced motion.
- Writes: toggles `.pf-play` with `isIntersecting` (the sweep only runs while the card is on screen, and only after `.is-in`).
- Cleanup in React: disconnect the observer.
- Port as: `useInViewClass(ref, 'pf-play', { threshold: .15 })`.

##### K. Core chip magnetism (L6803-6829)
- Starts when: bound if the chip list exists, `FH.fine` and not reduced motion. `pointermove` (passive) on `ul.pf-chips` stores the pointer and schedules one rAF; `pointerleave` on the list resets.
- Reads or measures: each chip's `getBoundingClientRect()`; its rest centre is the rect centre minus its current offset `st[i]`.
- Writes: for each chip, `d` = distance from the pointer to the rest centre, `R = 150`; if `d < R`: `f = Math.pow(1 - d / R, 2) * .2`, `tx = clamp(dx * f, -7, 7)`, `ty = clamp(dy * f, -5, 5)`, else 0. Writes `--tx` and `--ty` (`toFixed(1) + 'px'`) only when either changed by more than `.2`. On leave: all chips `--tx:0px;--ty:0px`.
- Timings: one rAF per pointer burst; motion smoothed by the chip's `transform .5s var(--ease-out)` transition.
- Pauses or skips when: touch or coarse pointer, reduced motion.
- Cleanup in React: remove both listeners, cancel the rAF.
- Port as: `useChipMagnet(listRef, chipRefs, { radius: 150, strength: .2, maxX: 7, maxY: 5 })`.

##### L. Page lifecycle (L6831-6848)
- `fh:page` with another page: `clearPlay()` only.
- `fh:page` with `'profile'`: `resetHero()`, `lastSp = -1`, one rAF that re-runs `layout()` (and sets `activeIdx = -1` then `kick()`), `placeInd(true)` and `kickScroll()`; then the entrance (A). The core router also fires a window `resize` in a rAF after every page show (L4685), which re-runs the resize handlers above.
- In Next.js the route mount replaces `fh:page`. Everything measured (timeline, indicator, scroll progress) must run after the page is visible and after fonts load.

#### 11.4.12 Content data

All strings below are copied from the reference. `\u2014` inside a TypeScript string produces the real em dash that the reference shows. `&amp;` in the HTML is a plain `&` here. Icon ids are sprite ids from section 7 (type them with the shared icon id union when it exists).

What the reference does NOT have for experience (so do not invent it): no location per role, no employment type (full time, contract and so on), no bullet lists. Each role has one description paragraph and a tag list. The only status shown is the badge: `CURRENT` (TechXelo), `CLOSED` (Upwork), none (UHA, Viral Square).

##### frontend/src/content/profile.ts
```ts
export type IconId = string; // replace with the shared sprite id union

export interface HeroCountStat {
  kind: 'count';
  label: string;
  to: number;      // data-to; rendered text before and after the count is this number
  suffix: string;  // rendered in span.pf-hstat__suf
}
export interface HeroDegreeStat {
  kind: 'degree';
  label: string;
  text: string;       // plain part
  serifText: string;  // span.serif.grad-text.pf-hstat__se
}
export type HeroStat = HeroCountStat | HeroDegreeStat;

export interface ProfileHero {
  documentTitle: string;
  eyebrow: string;
  titleLineA: string;
  titleLineB: string; // rendered in span.serif.grad-text
  lead: string;
  cvCta: { label: string; href: string; icon: IconId; download: true };
  experienceCta: { label: string; href: string; icon: IconId };
  stats: HeroStat[];
  cue: { label: string; href: string };
}

export interface DeskXpRow {
  year: string;
  title: string;
  company: string;
  barStart: number; // --a
  barEnd: number;   // --b
  current: boolean; // .is-cur, shows the "Current" pill
}

export interface ProfileDesk {
  ariaLabel: string;
  hint: { count: string; text: string };
  education: {
    href: string;
    ariaLabel: string;
    number: string;
    label: string;
    icon: IconId;
    big: string;
    title: string;
    university: string;
    years: string;
    rows: { level: string; subject: string; years: string }[];
  };
  experience: {
    href: string;
    ariaLabel: string;
    mono: string;
    cvTitle: string;
    who: string;
    number: string;
    label: string;
    rangeFrom: string;
    rangeTo: string;
    currentLabel: string;
    rows: DeskXpRow[];
    axis: string[];
  };
  expertise: {
    href: string;
    ariaLabel: string;
    number: string;
    label: string;
    rings: { value: number; label: string }[]; // --v and data-v; number shown as text, "%" added by CSS
    chip: { icon: IconId; label: string };
    more: string;
  };
  seal: { ringText: string; mark: string };
}

export interface BlockHead {
  index: string;
  titleId: string;
  title: string;       // first word
  titleAccent: string; // span.serif.grad-text
  sub: string;
}

export const profileHero: ProfileHero = {
  documentTitle: 'Profile · Faisal Hanif',
  eyebrow: 'Professional Journey',
  titleLineA: 'My Professional',
  titleLineB: 'Profile',
  lead: 'A comprehensive overview of my experience, education, and technical expertise in software engineering and AI/LLM integration \u2014 building intelligent, production-ready applications.',
  cvCta: { label: 'Download CV', href: '/imgs/Faisal-CVS.pdf', icon: 'i-download', download: true }, // reference: https://faisalhanif.work/imgs/Faisal-CVS.pdf
  experienceCta: { label: 'View experience', href: '#pf-exp', icon: 'i-briefcase' },
  stats: [
    { kind: 'count', label: 'Years Coding', to: 3, suffix: '+' },
    { kind: 'degree', label: 'Degree', text: 'BS', serifText: '-SE' },
    { kind: 'count', label: 'Companies', to: 3, suffix: '+' },
  ],
  cue: { label: 'Scroll to explore', href: '#pf-exp' },
};

export const profileDesk: ProfileDesk = {
  ariaLabel: 'Résumé pages. Choose one to jump to that section.',
  hint: { count: '03', text: 'Three pages, one career. Pick one to jump to it.' },
  education: {
    href: '#pf-edu-bs',
    ariaLabel: 'Education: Software Engineering (BS-SE), University of Management and Technology, Lahore, 2020 to 2024. Jump to education.',
    number: '02',
    label: 'Education',
    icon: 'i-grad',
    big: 'BS-SE',
    title: 'Software Engineering',
    university: 'University of Management & Technology, Lahore',
    years: '2020 - 2024',
    rows: [
      { level: 'Inter', subject: 'Computer Science', years: '2018 - 2020' },
      { level: 'Matric', subject: 'Computer Science', years: '2016 - 2018' },
    ],
  },
  experience: {
    href: '#pf-role-techxelo',
    ariaLabel: 'Experience: four roles from 2022 to 2026, currently Software Engineer at TechXelo. Jump to experience.',
    mono: 'FH',
    cvTitle: 'Curriculum Vitae',
    who: 'Faisal Hanif · Software Engineer',
    number: '01',
    label: 'Experience',
    rangeFrom: '2022',
    rangeTo: '2026', // rendered as `2022 <i>→</i> 2026`
    currentLabel: 'Current',
    rows: [
      { year: '2024', title: 'Software Engineer', company: 'TechXelo', barStart: 0.5, barEnd: 1, current: true },
      { year: '2023', title: 'Freelance Developer', company: 'Upwork Platform', barStart: 0.25, barEnd: 0.5, current: false },
      { year: '2023', title: 'Outsourcing Engineer', company: 'UHA International', barStart: 0.25, barEnd: 0.5, current: false },
      { year: '2022', title: 'React Native Developer', company: 'Viral Square', barStart: 0, barEnd: 0.25, current: false },
    ],
    axis: ['2022', '2023', '2024', '2025', '2026'],
  },
  expertise: {
    href: '#pf-skills',
    ariaLabel: 'Expertise: React.js 95%, JavaScript 90%, OpenAI API 85%, and ten core areas. Jump to technical expertise.',
    number: '03',
    label: 'Expertise',
    rings: [
      { value: 95, label: 'React.js' },
      { value: 90, label: 'JavaScript' },
      { value: 85, label: 'OpenAI API' },
    ],
    chip: { icon: 'i-sparkles', label: 'AI/LLM Integration' },
    more: '+9 more',
  },
  seal: { ringText: 'SOFTWARE ENGINEER · LAHORE · 2026 ·', mark: 'FH' },
};

export const profileBlockHeads: Record<'experience' | 'education' | 'tech', BlockHead> = {
  experience: { index: '02.1', titleId: 'pf-exp-title', title: 'Professional', titleAccent: 'Experience', sub: 'My journey through the tech industry' },
  education: { index: '02.2', titleId: 'pf-edu-title', title: 'Educational', titleAccent: 'Background', sub: 'My academic foundation and learning journey' },
  tech: { index: '02.3', titleId: 'pf-tech-title', title: 'Technical', titleAccent: 'Expertise', sub: 'My technical skills and proficiency levels' },
};
```

##### frontend/src/content/experience.ts
```ts
export type IconId = string; // replace with the shared sprite id union

export interface ExperienceRole {
  id: string;            // li id, also the jump target
  number: string;        // node label
  from: string;          // data-from (sticky year, top line)
  to: string;            // data-to (sticky year, bottom line)
  dateLabel: string;     // span.pf-role__date text
  title: string;
  company: string;
  companyIcon: IconId;
  status: 'current' | 'closed' | null;
  statusLabel: string | null; // badge text, already upper case in the reference
  yearBoxRole: string;   // data-role (sticky year meta line)
  description: string;
  tags: string[];
}

export const experienceYearBox = {
  total: '04', // `<b class="pf-year__n">01</b> / 04`
};

export const experience: ExperienceRole[] = [
  {
    id: 'pf-role-techxelo',
    number: '01',
    from: '2024',
    to: '2026',
    dateLabel: '2024 - 2026',
    title: 'Software Engineer',
    company: 'TechXelo',
    companyIcon: 'i-code',
    status: 'current',
    statusLabel: 'CURRENT',
    yearBoxRole: 'Software Engineer · TechXelo',
    description: 'Integrating AI and LLMs into software engineering \u2014 building intelligent full-stack web and mobile applications with React.js, Next.js, Node.js, and MongoDB, powered by AI-driven features, smart automation, and scalable REST APIs across production systems.',
    tags: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB'],
  },
  {
    id: 'pf-role-upwork',
    number: '02',
    from: '2023',
    to: '2024',
    dateLabel: '2023 - 2024',
    title: 'Freelance Developer',
    company: 'Upwork Platform',
    companyIcon: 'i-globe',
    status: 'closed',
    statusLabel: 'CLOSED',
    yearBoxRole: 'Freelance Developer · Upwork Platform',
    description: 'Collaborating with diverse international clients, delivering custom web solutions and building strong client relationships across various industries.',
    tags: ['Client Relations', 'Custom Solutions', 'Global Projects'],
  },
  {
    id: 'pf-role-uha',
    number: '03',
    from: '2023',
    to: '2024',
    dateLabel: '2023 - 2024',
    title: 'Outsourcing Engineer',
    company: 'UHA International',
    companyIcon: 'i-building',
    status: null,
    statusLabel: null,
    yearBoxRole: 'Outsourcing Engineer · UHA International',
    description: 'Orchestrated project acquisition and client engagement strategies, expertly identifying opportunities and aligning them with company capabilities.',
    tags: ['Project Management', 'Client Acquisition', 'Strategy'],
  },
  {
    id: 'pf-role-viral',
    number: '04',
    from: '2022',
    to: '2023',
    dateLabel: '2022 - 2023',
    title: 'React Native Developer',
    company: 'Viral Square',
    companyIcon: 'i-phone-dev',
    status: null,
    statusLabel: null,
    yearBoxRole: 'React Native Developer · Viral Square',
    description: 'Specialized in cross-platform mobile development, creating seamless user experiences for iOS and Android applications.',
    tags: ['React Native', 'Mobile Apps', 'Cross-Platform'],
  },
];
```

##### frontend/src/content/education.ts
```ts
export type IconId = string; // replace with the shared sprite id union

export interface EducationEntry {
  id: string;                  // article id
  variant: 'featured' | 'small';
  badge: string;               // already upper case in the reference
  years: string;
  title: string;               // plain part of h4
  titleSerif: string;          // span.serif part of h4
  institution: string;
  institutionIcon: IconId;
  description: string;
  tags: string[];
  watermark?: string;          // featured only: span.pf-edu__mark
  icon?: IconId;               // featured only: span.pf-edu__ic
  revealDelay?: number;        // data-delay in ms (small cards)
}

export const education: EducationEntry[] = [
  {
    id: 'pf-edu-bs',
    variant: 'featured',
    badge: "BACHELOR'S DEGREE",
    years: '2020 - 2024',
    title: 'Software Engineering',
    titleSerif: '(BS-SE)',
    institution: 'University of Management & Technology, Lahore',
    institutionIcon: 'i-building',
    description: 'Comprehensive software engineering program covering modern development practices, algorithms, and industry-standard methodologies.',
    tags: ['Software Engineering', 'Data Structures', 'Web Development', 'Database Systems'],
    watermark: 'BS-SE',
    icon: 'i-grad',
  },
  {
    id: 'pf-edu-inter',
    variant: 'small',
    badge: 'INTERMEDIATE',
    years: '2018 - 2020',
    title: 'Computer Science',
    titleSerif: '(Inter)',
    institution: 'Unique College, Lahore',
    institutionIcon: 'i-pin',
    description: 'Foundation in computing principles, programming fundamentals, and essential computer technology skills.',
    tags: ['Programming Basics', 'Computer Science', 'Mathematics'],
    revealDelay: 120,
  },
  {
    id: 'pf-edu-matric',
    variant: 'small',
    badge: 'MATRICULATION',
    years: '2016 - 2018',
    title: 'Computer Science',
    titleSerif: '(Matric)',
    institution: 'Unique College, Lahore',
    institutionIcon: 'i-pin',
    description: 'Early foundation in computing with hands-on activities and basic programming concepts introduction.',
    tags: ['Computer Basics', 'Mathematics', 'Science'],
    revealDelay: 220,
  },
];
```

##### frontend/src/content/skills.ts
```ts
export type IconId = string; // replace with the shared sprite id union

export interface Skill {
  name: string;
  value: number; // data-v, ring --v and the counted number; sr-only text is `: ${value}%`
}

export interface SkillTab {
  tabId: string;   // button id
  panelId: string; // tabpanel id
  label: string;
  icon: IconId;
  skills: Skill[];
}

export interface LanguageEntry {
  mono: string;
  name: string;
  level: string;
  native: boolean; // adds pf-lang__lvl--native
}

export interface CoreExpertiseChip {
  icon: IconId;
  label: string;
}

export const skillTabsLabel = 'Skill groups'; // tablist aria-label

export const skillTabs: SkillTab[] = [
  {
    tabId: 'pf-tab-0',
    panelId: 'pf-panel-0',
    label: 'Programming Languages',
    icon: 'i-code',
    skills: [
      { name: 'JavaScript', value: 90 },
      { name: 'TypeScript', value: 85 },
      { name: 'Node.js', value: 85 },
      { name: 'C++', value: 60 },
    ],
  },
  {
    tabId: 'pf-tab-1',
    panelId: 'pf-panel-1',
    label: 'Frameworks & Libraries',
    icon: 'i-layers',
    skills: [
      { name: 'React.js', value: 95 },
      { name: 'Next.js', value: 80 },
      { name: 'React Native', value: 80 },
      { name: 'Express.js', value: 70 },
    ],
  },
  {
    tabId: 'pf-tab-2',
    panelId: 'pf-panel-2',
    label: 'AI & LLM Frameworks',
    icon: 'i-sparkles',
    skills: [
      { name: 'LangChain', value: 80 },
      { name: 'LangGraph', value: 75 },
      { name: 'OpenAI API', value: 85 },
      { name: 'Claude API', value: 80 },
    ],
  },
  {
    tabId: 'pf-tab-3',
    panelId: 'pf-panel-3',
    label: 'CSS & Styling',
    icon: 'i-eye',
    skills: [
      { name: 'Tailwind CSS', value: 90 },
      { name: 'Bootstrap', value: 90 },
      { name: 'CSS3', value: 92 },
      { name: 'Responsive Design', value: 95 },
    ],
  },
];

export const languagesCard = {
  title: 'Languages',
  icon: 'i-globe' as IconId,
  items: [
    { mono: 'En', name: 'English', level: 'Professional', native: false },
    { mono: 'Ur', name: 'Urdu', level: 'Native', native: true },
  ] satisfies LanguageEntry[],
};

export const coreExpertiseCard = {
  title: 'Core Expertise',
  icon: 'i-zap' as IconId,
  chips: [
    { icon: 'i-sparkles', label: 'AI/LLM Integration' },
    { icon: 'i-cpu', label: 'AI Agents & Workflows' },
    { icon: 'i-code', label: 'Frontend Development' },
    { icon: 'i-server', label: 'Backend Development' },
    { icon: 'i-phone-dev', label: 'Mobile Development' },
    { icon: 'i-layers', label: 'Progressive Web Apps' },
    { icon: 'i-check-circle', label: 'Website Testing' },
    { icon: 'i-cloud', label: 'Cloud Deployment' },
    { icon: 'i-rocket', label: 'Performance Optimization' },
    { icon: 'i-grid', label: 'UI/UX Design' },
  ] satisfies CoreExpertiseChip[],
};
```

- Consistency checks inside the reference: the desk rings (React.js 95, JavaScript 90, OpenAI API 85) match the tab values; "+9 more" plus the one chip shown equals the 10 core chips ("ten core areas" in the sheet `aria-label`); the desk CV rows match the four roles, with bar start and end = `(year - 2022) / 4`.
- The same experience and education facts are repeated in the chat knowledge in contact.js (L6250-6257, outside this part). Keep one source of truth when porting the chat.

#### Notes and traps

##### Cascade traps (copy the CSS as written and these come out right)
- Featured degree card shadow is hidden when motion is on. `#profile .pf-edu--feat.is-in{animation:pf-clip 1.3s var(--ease-out) both}` (L1929) keeps the last keyframe `clip-path:inset(0 0 0 0 round var(--r-xl))` for good because of the `both` fill. Animation values beat normal rules, so L2039 `clip-path:none` cannot release it, and the card's `box-shadow:var(--shadow-lg)` (L1914) is cut off at the card edge. Under reduced motion L2033 sets `animation:none`, so there the shadow IS visible. Keep both behaviours.
- The Education sheet jump never flashes. `#profile .pf-flash` (L1877, 1 id + 1 class) loses the `animation` property to `#profile .pf-edu--feat.is-in` (L1929, 1 id + 2 classes), so adding `.pf-flash` to `#pf-edu-bs` does nothing. Even if it ran, the clip-path above would hide the 8px ring. Only the Experience jump (role card) and the Expertise jump (`#pf-skills`) show the flash. See owner questions.
- L2039 `#profile [data-reveal]:not([data-reveal="mask"]).is-in{clip-path:none}` has no effect on this page: nothing here uses `data-reveal="mask"`, and the shell only sets `clip-path` for `mask` (L185, L187). Porting it is harmless.
- Small education cards do not lift on hover. `.js [data-reveal].is-in{transform:none}` (L186, specificity 0,3,0) beats `.card--hover:hover{transform:translateY(-4px)}` (L160, 0,2,0). Only the shadow and border change.
- Hover changes on revealed cards snap with no transition. `.js [data-reveal]` (L178, 0,2,0) replaces the `.card` transition list (L158-159, 0,1,0) with `opacity`, `transform`, `filter` and `clip-path` only (plus `transition-delay:var(--d)`). So `border-color` and `box-shadow` on `.pf-role__card:hover` (L1875), the small education cards, `.pf-skills`, `.pf-lang` and `.pf-core` change at once. If the port does its reveal another way (a wrapper, a motion library), it must not add a smooth shadow or border transition to these cards.
- The spotlight layer (`[data-spotlight]::before`, L166-170) still fades over `var(--dur-2)`; that is a separate pseudo element and is not affected by the point above.
- `[data-spotlight]>*{position:relative;z-index:1}` (L170) would pull the sheen and the watermark into flow, but `#profile .pf-edu__sheen` and `#profile .pf-edu__mark` (L1917, L1933, 1 id + 1 class) win and keep them `position:absolute;z-index:0`. Keep the `#profile` prefix (or equal specificity) in the port.
- `#profile .pf-tab[aria-selected="true"]` (L1956) comes after `#profile .pf-tab:hover` (L1955) with the same specificity, so the selected tab stays `var(--brand-ink)` on hover.
- `.pf-sheet__body` lists `transform .7s` in its transition (L1632) but nothing ever transforms the body. Dead value, keep it.
- `opacity:.0` at L1724 is just 0.

##### Hero traps
- Everything hidden before the entrance is scoped to `html.js` (L1748-1757). The reference adds `js` with an inline script at L2881, before the page paints. In Next.js add the class the same way (inline script in the root layout head). If it is added later (in an effect), the server HTML shows the hero at rest, then it snaps to hidden, then animates.
- Counters: the markup text is `3` (L3457, L3465). JS resets to `0` and counts up only when the entrance plays. Render `3` on the server (right for no JS and for reduced motion) and reset to `0` on the client while the stats are still hidden (before `.is-in`), so the reset is never seen.
- Keep the scroll exit on the individual `translate` property (L1592, L1618, L1629, L1716, L1794). The entrance and float use `transform` on other layers or the same layer (`.pf-sheet__float` has both the float `transform` animation and the exit `translate`). Merging them into one `transform` breaks the stacking. Write these rules as plain CSS, not as utility classes that may compile to `transform`.
- Keep `overflow:clip` on the hero (L1580), not `overflow:hidden`: `clip` does not create a scroll container.
- Two different containers: the title sizes (`cqw` at L1596-1597) measure `.pf-hero__copy`; the stage font size (L1617, L1793) and the hint (L1715) measure `.pf-desk`. Both must keep `container-type:inline-size`.
- The stage `opacity:calc(1.15 - var(--sp) * 1.2)` starts above 1 on purpose (clamped), so the desk only starts fading after `--sp` passes .125. The copy fades faster (`* 1.25`), the hint faster still (`* 1.6`) and the foot fastest (`* 3`).
- On desktop the desk width follows `100svh` (L1616), so on short windows the whole desk shrinks. At 800px tall or less (and 1024px wide or more) the hint and the scroll cue are removed (L1745).
- The fan (L1721-1724) triggers when the pointer is anywhere over `.pf-desk__tilt`, which covers the whole stage (`inset:0`), empty corners included. The hint is outside the tilt layer, so pointing at the hint closes the fan.
- The fan and `--z:120px` on hover need `.is-settled` (L1721-1725), but the keyboard lift `.pf-sheet:focus-visible{--z:120px}` (L1733) does not, so a focused sheet lifts even during the entrance.
- JS names are swapped on purpose: `--tx` is the rotation around X (from the pointer's vertical offset, goal `* -4`) and `--ty` the rotation around Y (from the horizontal offset, goal `* 5`). The pointer offset is measured from the desk centre but divided by half the viewport size (L6591-6592).
- The tilt is bound only when `FH.fine` is true at load (L6580, `FH.fine` read once at L4627). The hover fan uses `(hover:hover) and (pointer:fine)` (L1720), while ring and chip hovers use only `(hover:hover)` (L1994, L2025). Keep each gate as written.
- `.is-idle` (L6568) is only updated on scroll, resize and page show. It pauses the float and the `.dot-live` inside the hero only (the CV pill dot). The `CURRENT` badge dot in the timeline keeps pinging.
- `data-v` on the three `.pf-mr__i` (L3535-3537) is never read. The desk rings get `--v` inline on the bar circle, their numbers are static text, and the `%` comes from `.pf-mr__n::after` (L1697). Do not reuse the tab ring component for them.
- `.is-settled` turns off the hint transition (L1772). Without that, the scroll exit opacity would lag by the 1000ms entrance delay.
- The CV button: `data-magnetic` has no value, so strength is `.25` (L4629). It writes an inline `transform` on the button (fine pointer, no reduced motion, bound after the preloader). `download` on the absolute URL `https://faisalhanif.work/imgs/Faisal-CVS.pdf` is ignored by browsers when the page is on another origin (the reference file opened locally just opens the PDF). On the live site, and in the rebuild with `/imgs/Faisal-CVS.pdf`, it downloads.

##### Links, routing and page lifecycle
- The core router listens for clicks in the capture phase (L4713-4723). It always stops the browser's hash jump, then waits one tick. A part's own handler that calls `preventDefault()` "claims" the click (L4718). The sheets do this (L6626), so a sheet click never pushes a hash; "View experience" and the scroll cue are not claimed, so they push `#pf-exp` and scroll with `FH.scrollToEl` (offset `innerWidth < 1024 ? 84 : 32`, L4687). In Next.js do not rely on the default hash scroll of `<Link>`; call the shared scroll helper and push the hash only for those two links.
- The sheet click handler does not check modifier keys. The router returns early on Cmd, Ctrl or Shift clicks (L4714), but the sheet handler still calls `preventDefault()` and jumps, so Cmd or Ctrl click on a sheet jumps in place instead of opening a new tab. A middle click fires `auxclick`, not `click`, so it still opens the hash URL in a new tab. Keep the real `href` values.
- A deep link such as `/profile#pf-exp` is handled by the core: it scrolls to the element 1600ms after start (L4730), with no flash.
- First load on Profile: the entrance starts 120ms after `html.is-loaded` (L6847), and `is-loaded` is set 1250ms after DOM ready (L4782), so about 1370ms after DOM ready. That `setTimeout` is not tracked by `clearPlay()`.
- `afterCurtain` watches the curtain's `class` with a MutationObserver (L6552-6560), with a 1600ms fallback. With the router timings (curtain `is-out` 140ms after the swap, L4707) the entrance starts about 290ms after the page swap. In React, use a "curtain lifted" signal from the shell instead of watching classes, and disconnect everything on unmount.
- In the reference, hidden pages use `display:none` (L299) and revealed elements keep `.is-in`. CSS animations restart when an element is shown again, so every return to Profile replays `pf-clip`, `pf-mark`, the sheen and the active panel's `pf-rise`, while the reveal transitions do not replay. In Next.js a route change remounts the page. Match this in the shared reveal logic (section 11.2), not per component.
- `FH.reduce` (L4565) and `FH.fine` (L4627) are read once. Changing the OS motion setting or plugging in a mouse later does not rebind anything until reload.

##### Timeline and sticky year
- The track `top` and `height` are 0 in the markup (L1858) and come from JS (L6646-6647). Measure in a layout effect so there is no frame without the track. The fill `scaleY` changes every frame: write it through a ref, not React state.
- `layout()` depends on `offsetTop` chains: `li.pf-role` is `position:relative` and `.pf-tl` is the offset parent (`position:relative`, no top padding). If the port adds a positioned wrapper or top padding, the centres move.
- The active role is never below index 0 (`act` starts at 0, L6666). Before the anchor reaches the first node, role 01 is already `.is-active` (bigger node, halo ring, stronger border) although it is not lit. The markup has no `.is-active`; JS sets it on the first frame. Start the React state at index 0.
- Lighting is not symmetric: going down, a node lights only when the eased fill reaches it; going up, it goes dark at once when the anchor passes above it (L6668), while the fill shrinks slowly.
- The anchor line is at 58% of the viewport (L6653); the jump flash waits until the target top is within 35% (L6616). Two different numbers, keep both.
- On every page show `activeIdx` is reset to -1 (L6839), so the role text is set at once, but the year lines still animate if their text changes.
- Quick active changes can leave several leaving year spans in one line for up to 950ms (L6690). Harmless, but a keyed list in React must allow more than two spans.
- `.pf-year__txt.is-cur` has no CSS rule; `is-cur` is only a JS marker (L6680, L6688).
- `.pf-year` is `display:none` under 1024px but JS still updates it. Its `fade` reveal (250ms) can only fire once it is displayed, so on a phone that is later widened it reveals then.
- The timeline switches at 600px (L1889) and the education watermark hides at 600px (L1937), while the hero phone layout starts at 639px (L1785). Tabs go 2 by 2 under 760px (L1961), rings go to 2 columns under 640px (L1979), tab icons hide at 420px (L1964).

##### Skill tabs and rings
- `--v` is not in the markup for the tab rings. `light()` copies `data-v` into an inline `--v` on the `li` (L6742). In React set `style={{ '--v': value }}` on the `li` and add `.is-lit` only when lit.
- Ring numbers are `0%` in the markup (L3729-3756). Without JS they stay `0%` with empty bars. Under reduced motion `start()` runs at init (L6784) and all four light at once.
- `countTo` (L6506-6516) and the `light()` timeouts (L6748) have no cancel. Fast tab switching leaves old timers that light and count the hidden panel, and switching back within about half a second can start two counts on the same number. The port should cancel pending timers and count loops when the tab changes or the page unmounts. The end state is the same as the reference.
- Panel 0 is `.is-active` in the markup, so its `pf-rise` (L1974) runs as soon as the page is displayed, usually while the skills card is still below the fold and hidden by its reveal. The rise is normally only seen on later tab changes. Do not tie it to the card's reveal.
- Rings light only after the skills card is 35% visible AND the preloader is done (L6786-6787). Tab changes before that only switch panels (numbers stay `0%`). Coming back to the page does not replay the rings.
- The indicator is measured with `offsetLeft`, `offsetTop`, `offsetWidth` and `offsetHeight` (L6728-6730) against `.pf-tabs` (`position:relative`, 1px border). It stays at width 0 and opacity 0 (no `.is-ready`) until the tablist is visible. In React measure in a layout effect after mount, on resize and after `document.fonts.ready`, each time with `transition:none` for that one write.
- Tabs have no `type` attribute and the tablist has no `aria-orientation`; ArrowUp and ArrowDown switch tabs as well as ArrowLeft and ArrowRight. Keep this. The key handler moves from `current`, not from the focused tab (same result, because of the roving tabindex).
- All four panels have `tabindex="0"`; hidden ones are skipped because of `visibility:hidden`, but the old panel stays focusable for .45s during the crossfade (L1972).

##### Chips
- `pointerleave` resets the chips (L6826-6828) but does not cancel a queued rAF. A `pull()` that runs just after the reset uses the last pointer position and can leave nearby chips a few pixels off until the pointer comes back. Cancel the rAF on leave in the port.
- Keep the two elements per chip: the reveal lives on `li.pf-chipw` and the magnet and hover lift live on `span.pf-chip`. Putting both on one element makes `.js [data-reveal].is-in{transform:none}` wipe the magnet transform.

##### SVG and markup details for JSX
- `#pf-ring-g` (L3569) and `#pf-seal-p` (L3545) are document ids used by literal `url(#pf-ring-g)` and `href="#pf-seal-p"`. Render the defs svg once and always (the desk rings in the hero need it, although it sits in the body), never with `display:none` (gradients inside a `display:none` svg do not paint in some browsers), and do not replace the ids with `useId`.
- JSX names: `pathLength={100}`, `textLength={280}`, `textAnchor="middle"`, `href` (not `xlink:href`), `focusable="false"`, `viewBox`. Keep `transform="rotate(-90 30 30)"` and `transform="rotate(-90 60 60)"` as SVG attributes, not CSS, so the rotation origin stays the circle centre.
- Heading order is `h1` (hero) then `h3` (block titles) then `h4` (cards), with no `h2`. Keep it as in the reference.
- Lists that lose their bullets carry `role="list"` (timeline `ol`, tags, rings, languages, chips). Keep it.
- The desk sheets are links that hold only spans; their `aria-label` replaces the inner text for screen readers. The desk group label contains `é` ("Résumé"); keep the accent.

##### Content oddities (keep as they are; listed for the owner)
- The TechXelo role shows `2024 - 2026` and `CURRENT` together; the CV axis ends at `2026` in the brand colour and the seal reads `SOFTWARE ENGINEER · LAHORE · 2026 ·`. These years are fixed text and will not move with the calendar.
- Hero stats say `3+` years and `3+` companies while the timeline has four roles from 2022 (one is the Upwork platform).
- The Languages card reveals after 120ms and the Core Expertise card after 80ms, so the right card appears before the left one at 960px and up.
- The desk's third sheet is labelled `03 / Expertise`, not "Skills"; the desk order is Experience `01`, Education `02`, Expertise `03`, while the DOM and depth order is Education, Experience, Expertise.

### 11.5 Works (#works, route /works), Approvals (#approvals, route /approvals) and the PureBody modal

Sources read line by line: works.css L2041-2877, Works HTML L3798-3896, Approvals HTML L3899-3963, PureBody modal HTML L4493-4554, works.js L6852-7616. Shared rules these parts depend on were checked at the lines cited (tokens L25-89, base L94-122, buttons L134-148, `.dot-live` L152-153, `.tag` L154-155, `.card` L158-160, spotlight L165-170, reveal L178-191, modal shell L266-279, page hero L299-301, curtain L311-333, next page link L335-347, reduced motion L357-362, core script L4559-4786). Sections 1 to 10 of REFERENCE_MAP.md are not repeated here; this part extends section 9 (Works hero and Approvals hero facts).

Non ASCII characters in these ranges (the base64 lines L3833, L3843, L3853, L3862 were masked and not checked inside the data):
- Four em dashes, all in project descriptions: L6865 (PureBody), L6868 (UHA International), L6871 (Fit For Living), L6874 (GitPulse). Written here as `\u2014`.
- `·` (U+00B7, middle dot): L7049 (cover label), L7140 (issuer line), L7354 (Works seal ring, four times), L7431 (Approvals seal ring, twice).
- `↗` (U+2197): L4503, the PureBody "Open full page ↗" link. It is a text character, not an icon.
- `→` comes from the entity `&rarr;` at L3806 and L3907 (title meta "2022 → 2026" and "2023 → 2026").
- No en dashes, no curly quotes. "2022 - 2026" and "2023 - 2026" in the seal rings use a plain ASCII hyphen with spaces.

#### 11.5.0 Page frames

##### Roots
- Works: `section#works.section.wk-sec` (L3798), `aria-labelledby="wk-title"`. Approvals: `section#approvals.section.wk-sec.wk-ap` (L3899), `aria-labelledby="wk-ap-title"`. The core router adds `.page`, `data-page="works"` / `"approvals"` and `.is-current` (L4677, L4682). Only `.is-current` is shown (`.page:not(.is-current){display:none}`, L299).
- Document titles (L4683): `Works · Faisal Hanif` and `Approvals · Faisal Hanif`. Curtain labels (L4675, L4701): `03 / 05` "Works" and `04 / 05` "Approvals".
- Rail and dock links (L2979-2980, L2998-2999): `a.rail__link[href="#works"][data-nav="works"]` icon `i-briefcase` text `Works`; `a.rail__link[href="#approvals"][data-nav="approvals"]` icon `i-trophy` text `Approvals`.
- Section padding: `#works.wk-sec,#approvals.wk-sec{padding-block:0 clamp(8px,2vw,24px)}` (L2049) replaces `.section{padding-block:var(--section-y)}` (L114). `.wk-sec .wk-main{margin-top:clamp(8px,2vw,24px)}` (L2050).
- Both heroes: `.wk-hero{--p:0;overflow:clip;isolation:isolate;padding-bottom:clamp(40px,7vh,84px)}` (L2051), then each hero overrides `padding-bottom:clamp(56px,9vh,110px)` (L2420, L2634). They also carry `.page-hero` (L300: `position:relative;min-height:min(100svh,1000px);display:flex;flex-direction:column;justify-content:center;padding-top:clamp(110px,14vh,170px);padding-bottom:clamp(56px,9vh,110px)`; L301 under 1023px: `min-height:auto;padding-top:108px`).

##### Blocks in order
| Lines | Block | Root |
|---|---|---|
| L3799-3879 | Works hero ("the studio wall") | `header.page-hero.wk-hero.wk-hero--works#wk-hero` |
| L3881-3895 | Works body: toolbar, grid, empty state | `div.wrap.wk-main` |
| after L3895 | "Next page" link injected by the core script (L4732-4736) | `div.wrap > nav.page-next[aria-label="Next page"][data-reveal]` |
| L3900-3939 | Approvals hero ("the certificate fan") | `header.page-hero.wk-hero.wk-hero--ap#wk-ap-hero` |
| L3941-3950 | Approvals toolbar (filter and rail controls) | `div.wrap.wk-main` |
| L3952-3954 | Certificate rail (full bleed, outside `.wrap`) | `div.wk-rail#wk-rail` |
| L3955-3962 | Empty state and progress bar | `div.wrap` |
| after L3962 | "Next page" link | `div.wrap > nav.page-next` |
| L4494-4554 | PureBody modal (body level, outside `main`) | `div.fh-modal.wk-pb#purebody` |

- Next page link for Works (L4733-4735 with `i=2`): label `Next page · 04`, counter `3 / 5`, title `Approva` + `<span class="serif">ls</span>`, arrow `i-arrow-right`, `href="#approvals"`.
- Next page link for Approvals (`i=3`): label `Next page · 05`, counter `4 / 5`, title `Conta` + `<span class="serif">ct</span>`, `href="#contact"`.

##### Tokens and shared classes used
- Tokens (values at L25-89, both themes): `--brand`, `--brand-900` (`#08302a` light, `#062019` dark), `--accent`, `--mint`, `--grad`, `--grad-glow`, `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--line-strong`, `--ink`, `--ink-2`, `--muted`, `--brand-ink`, `--accent-soft`, `--brand-soft`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--glow`, `--dot`, `--font-serif`, `--font-mono`, `--fs-h3`, `--fs-lead`, `--fs-body`, `--fs-sm`, `--fs-label`, `--r-lg` (24px), `--r-pill` (999px), `--gutter` (`clamp(16px,4vw,48px)`), `--maxw` (1240px), `--ease-out` (`cubic-bezier(.22,1,.36,1)`), `--ease-io` (`cubic-bezier(.65,0,.35,1)`), `--dur-2` (.6s), `--dur-3` (.9s).
- Shared classes: `.wrap` L113, `.sr-only` L107, `.i` / `.i--fill` L108-109, `.serif` L118, `.grad-text` L119, `.lead` L122, `.eyebrow` L127-128, `.btn`, `.btn--primary`, `.btn--ghost` L134-145, `.link-arrow` L146-148, `.dot-live` + `@keyframes fh-ping` L152-153, `.tag` / `.tags` L154-155, `.card` L158-159, `[data-spotlight]` L165-170, reveal L178-191, `.fh-modal*` L269-279.
- The JS constant `EASE = 'cubic-bezier(.22,1,.36,1)'` (L6857) equals `--ease-out`. It is used for every Web Animations call in works.js.

##### Reveal timing (core observer, L4594-4607)
The reveal observer is `rootMargin:'0px 0px -8% 0px'`, `threshold:.12`, fires once. `data-reveal` with an empty value = from `translate3d(0,26px,0)` + `blur(6px)` (L179); `fade` = `blur(4px)` only (L180). Both start at opacity 0 and transition over `var(--dur-3) var(--ease-out)` with `transition-delay:var(--d,0ms)` (L178). The heroes do NOT use `data-reveal`; they use `.wk-a` (11.5.1).

| Element | Line | Kind | `--d` |
|---|---|---|---|
| `div.wk-toolbar#wk-toolbar` | L3882 | up | 0 |
| `div.wk-cell` x14 (built by JS) | L7043 | up | per card, table in 11.5.5 |
| `div.wk-toolbar#wk-ap-toolbar` | L3942 | up | 0 |
| `div.wk-rail#wk-rail` | L3952 | fade, `data-delay="160"` | 160ms |
| `div.wk-cc` x7 (built by JS) | L7125 | up | `Math.min(i,3)*90` ms: 0, 90, 180, 270, 270, 270, 270 (L7151) |
| `nav.page-next` | L4735 | up | 0 |

#### 11.5.1 Works hero: copy column (HTML L3799-3823 and L3874-3878; CSS L2051-2065, L2634-2686, L2789-2799, L2815-2859, L2872-2876)

##### Layout
- `header#wk-hero` children: `div.wk-wh__bg[aria-hidden="true"] > span.wk-wh__halo` (L3800), `div.wrap.wk-wh__wrap` (L3802) holding `div.wk-wh__copy` (L3803) and `div.wk-sk#wk-sk` (the stage, 11.5.2), then `div.wk-wh__foot > div.wrap > button.wk-cue` (L3874-3878).
- `#works .wk-hero--works{--sp:0;padding-bottom:clamp(56px,9vh,110px)}` (L2634). At 1024px and up: `padding-top:clamp(84px,12vh,150px);padding-bottom:clamp(84px,11vh,120px)` (L2641). At 1024px and up with height 800px or less: `padding-top:clamp(64px,10vh,96px);padding-bottom:clamp(40px,7vh,64px)` (L2822).
- `.wk-wh__bg{position:absolute;inset:0;z-index:0;pointer-events:none}` (L2635).
- `.wk-wh__halo{position:absolute;right:-4%;top:6%;width:min(62vw,880px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--accent-soft),transparent 62%);transition:opacity 1.8s var(--ease-out),transform 2.2s var(--ease-out)}` (L2636-2637). Before `.is-on` (with `.js`): `opacity:0;transform:scale(.85)` (L2638). Under 639px: `right:-40%;top:auto;bottom:0;width:130vw` (L2859).
- `.wk-wh__wrap{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(44px,8vw,72px);align-items:center}` (L2639). At 1024px and up: `grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr);column-gap:clamp(40px,5vw,80px)` (L2642). At 1024px to 1180px: `grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)` (L2836). Under 639px: `gap:36px` (L2849). Under 1024px the copy sits above the stage (single column).
- `.wk-wh__copy{position:relative;container-type:inline-size;display:grid;justify-items:start}` (L2646). It is a size container: the title uses `cqw` and the chips use `@container (max-width:420px)`.

##### Entrance helper `.wk-a` (L2053-2056)
- `.js .wk-hero .wk-a{opacity:0;transform:translate3d(0,22px,0);filter:blur(6px);transition:opacity .9s var(--ease-out),transform 1.05s var(--ease-out),filter .9s var(--ease-out);transition-delay:var(--d,0ms)}`
- `.js .wk-hero.is-on .wk-a{opacity:1;transform:none;filter:none}`
- JS adds `.is-on` to the hero (11.5.10 page hero controller). Each `.wk-a` has an inline `--d`.

| Element | Line | `--d` |
|---|---|---|
| `span.eyebrow.wk-a` "Portfolio Showcase" | L3804 | 0ms |
| `span.wk-wl__in` "Featured" (not `.wk-a`, own transition) | L3806 | 90ms |
| `span.wk-wl__in` "Projects" (not `.wk-a`) | L3807 | 180ms |
| `p.lead.wk-wh__lead.wk-a` | L3809 | 320ms |
| `div.wk-wh__ctas.wk-a` | L3810 | 400ms |
| `div.wk-wh__stat.wk-a` Projects / Technologies / Responsive | L3815-3817 | 480ms / 540ms / 600ms |
| `div.wk-wh__stk.wk-a` | L3819 | 680ms |
| `button.wk-cue.wk-a` | L3876 | 760ms |

##### Eyebrow
- `<span class="eyebrow wk-a" style="--d:0ms">Portfolio Showcase</span>` (L3804). `.eyebrow` L127-128 (mono, `--fs-label`, `.16em`, uppercase, `--brand-ink`, 28px leading rule via `::before`). `#works .wk-hero--works .eyebrow{margin:0}` (L2647).

##### Title (L3805-3808)
- `h1.wk-wh__title#wk-title` with two rows:
  - Row A: `span.wk-wl.wk-wl--a` > `span.wk-wl__in[style="--d:90ms"]` "Featured" + `span.wk-wl__rule[aria-hidden="true"]` + `span.wk-wl__meta[aria-hidden="true"]` "2022 `<i>&rarr;</i>` 2026".
  - Row B: `span.wk-wl.wk-wl--b` > `span.wk-wl__in[style="--d:180ms"]` > `span.serif.grad-text` "Projects".
- CSS: `.wk-wh__title{width:100%;margin-top:clamp(16px,2.6vh,26px);color:var(--ink);font-weight:800;letter-spacing:-.05em}` (L2648); `.wk-wl{display:block;overflow:hidden}` (L2649); `.wk-wl__in{display:inline-block;will-change:transform}` (L2650).
- `.wk-wl--a{display:flex;align-items:center;gap:.28em;font-size:clamp(2.1rem,min(13.1cqw,8.2vh),4.7rem);line-height:1.02;padding:0 0 .1em;margin-bottom:-.1em}` (L2651).
- `.wk-wl__rule{flex:1;height:1px;margin-top:.1em;background:linear-gradient(90deg,var(--line-strong),var(--line));transform-origin:0 50%}` (L2652).
- `.wk-wl__meta{flex:none;margin-top:.1em;font-family:var(--font-mono);font-size:var(--fs-label);font-weight:500;letter-spacing:.16em;color:var(--muted);white-space:nowrap}`; `.wk-wl__meta i{font-style:normal;color:var(--accent);margin:0 .2em}` (L2653-2654).
- `.wk-wl--b{font-size:clamp(3.6rem,min(25cqw,17.5vh),9.6rem);line-height:.92;padding:0 .12em .16em 0;margin:-.02em 0 -.14em -.04em;white-space:nowrap}`; `.wk-wl--b .serif{font-weight:400;letter-spacing:-.03em;padding-right:.06em}` (L2655-2656).
- Entrance (L2790-2799): before `.is-on`: `.wk-wl__in{transform:translate3d(0,112%,0)}`, `.wk-wl__rule{transform:scaleX(0)}`, `.wk-wl__meta{opacity:0;transform:translate3d(-8px,0,0)}`. With `.is-on`: `.wk-wl__in` `transition:transform 1.1s var(--ease-out) var(--d,0ms)`; `.wk-wl__rule` `transition:transform 1.2s var(--ease-out) .42s`; `.wk-wl__meta` `transition:opacity .8s var(--ease-out) .7s,transform .9s var(--ease-out) .7s`.
- Height 800px or less on desktop: `.wk-wh__title{margin-top:14px}`, `.wk-wl--a{font-size:clamp(2.1rem,min(12cqw,7.4vh),4.2rem)}`, `.wk-wl--b{font-size:clamp(3.4rem,min(22cqw,14vh),8rem)}` (L2825-2827).
- Under 639px: `.wk-wl--a{font-size:clamp(2rem,11vw,2.9rem)}`, `.wk-wl--b{font-size:clamp(3.2rem,26cqw,6rem)}` (L2850-2851).
- The page hero controller looks for `.wk-ht` to word split (L7282). No element has `.wk-ht`, so nothing is split. Do not add a split.

##### Lead (L3809)
- Copy: "Explore my collection of AI-powered web applications, mobile solutions, and full-stack projects that blend LLM intelligence with cutting-edge technology and innovative design."
- `p.lead.wk-wh__lead.wk-a[style="--d:320ms"]`. `.wk-wh__lead{margin-top:clamp(18px,3vh,30px);max-width:36em;color:var(--ink-2);text-wrap:pretty}` (L2657). Desktop low height: `margin-top:14px` (L2828).

##### CTAs (L3810-3813)
- `div.wk-wh__ctas.wk-a[style="--d:400ms"]`: `display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(22px,3.6vh,36px)` (L2658). Low height: `margin-top:18px` (L2829). 1024px to 1180px: `gap:10px`, `.btn{padding:0 20px}` (L2837-2838). Under 639px: `width:100%`, `.btn{flex:1 1 auto}` (L2852-2853).
- Button 1: `<button type="button" class="btn btn--primary" data-wk-cue="wk-toolbar" data-magnetic>` icon `i-grid` (`aria-hidden="true"`), text "Browse projects". Click scrolls to `#wk-toolbar` (cue binding, 11.5.10). `data-magnetic` has no value, so strength 0.25 (L4629), fine pointer and no reduced motion only.
- Button 2: `<button type="button" class="btn btn--ghost wk-wh__book" data-book>` icon `i-calendar`, text "Book Meeting". Opens booking with no preset (`FH.openBooking('')`, L4658). Hover: `.wk-wh__book .i{transition:transform var(--dur-2) var(--ease-out)}`, `.wk-wh__book:hover .i{transform:translateY(-2px)}` (L2659-2660).

##### Stats (L3814-3818)
- `dl.wk-wh__stats` > three `div.wk-wh__stat.wk-a` each `dt` + `dd > span[data-wk-to] + i`:
  - `--d:480ms`: dt "Projects", dd `<span data-wk-to="10">10</span><i>+</i>`
  - `--d:540ms`: dt "Technologies", dd `<span data-wk-to="7">7</span><i>+</i>`
  - `--d:600ms`: dt "Responsive", dd `<span data-wk-to="100">100</span><i>%</i>`
- CSS (L2662-2668): `.wk-wh__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:min(100%,31rem);margin:clamp(26px,4.4vh,44px) 0 0;border-top:1px solid var(--line-strong)}`; `.wk-wh__stat{position:relative;display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:6px;padding:16px 14px 0}` (so the number shows above the label); `:first-child{padding-left:0}`; `.wk-wh__stat+.wk-wh__stat::before{content:"";position:absolute;left:0;top:18px;bottom:2px;width:1px;background:var(--line)}`; `dd{margin:0;font-size:clamp(1.7rem,2.5vw,2.3rem);font-weight:800;letter-spacing:-.045em;line-height:1;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap}`; `dd i{font-style:normal;color:var(--brand-ink)}`; `dt{font-family:var(--font-mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}`.
- Low height desktop: `.wk-wh__stats{margin-top:20px}`, `.wk-wh__stat{padding-top:12px}`, `dd{font-size:1.9rem}` (L2830-2832). 1024px to 1180px: `.wk-wh__stat{padding-inline:12px}`, first child `padding-left:0`, `dt{font-size:.6rem;letter-spacing:.1em}` (L2839-2841). Under 639px: `.wk-wh__stats{width:100%}`, `.wk-wh__stat{padding:14px 10px 0}`, `dt{font-size:.58rem;letter-spacing:.1em}` (L2854-2856).
- Count up: on entrance each number counts from 0 over 1500ms, starting at its `.wk-a` delay + 200ms (680ms, 740ms, 800ms). Details in 11.5.10.

##### "Built with" stack chips (HTML L3819-3822; CSS L2670-2680; JS L7333, L7340-7349)
- `div.wk-wh__stk.wk-a[style="--d:680ms"]` > `p.wk-wh__stkl#wk-stk-lbl` "Built with" + `div.wk-stk#wk-chips[role="group"][aria-labelledby="wk-stk-lbl"]` (empty in HTML, filled by JS).
- JS fills it with one button per project filter except `all` (L7341-7342), in this order: `<button type="button" class="wk-stk__b" data-k="reactjs" aria-pressed="false">React.js</button>`, then `nextjs` "Next.js", `fullstack` "MERN Stack", `reactnative` "React Native", `sassapp` "Sass App".
- CSS: `.wk-wh__stk{display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;width:min(100%,34rem);margin-top:clamp(20px,3.4vh,32px)}` (L2671; low height `margin-top:16px` L2833); `.wk-wh__stkl{flex:none;font-family:var(--font-mono);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}` (L2672; under 639px `width:100%`, L2857); `.wk-stk{display:flex;flex-wrap:wrap;gap:5px}` (L2673); `.wk-stk__b{display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:var(--r-pill);border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 70%,transparent);font-size:.76rem;font-weight:600;letter-spacing:-.005em;color:var(--ink-2);white-space:nowrap;transition:color .35s,border-color .35s,background-color .35s,transform .45s var(--ease-out)}` (L2674-2676).
- States: hover `color:var(--brand-ink);border-color:color-mix(in srgb,var(--accent) 55%,transparent);transform:translateY(-1px)` (L2677); `[aria-pressed="true"]` `color:var(--brand-ink);background:var(--brand-soft);border-color:transparent` (L2678); `:focus-visible{outline-offset:2px}` (L2679).
- `@container (max-width:420px){ #works .wk-stk{gap:4px} #works .wk-stk__b{padding:0 7px;font-size:.7rem} }` (L2680). The container is `.wk-wh__copy`. Under 639px (media): `.wk-stk__b{height:36px;padding:0 14px;font-size:.8rem}` (L2858). The media rule comes later in the file but the container rule has the same specificity; both can match on a phone. Order in the file decides: L2858 wins over L2680 when both apply.
- Click (delegated on `#wk-chips`, L7343-7348): find `.wk-stk__b`; new key = `'all'` if that chip is already pressed, else its `data-k`; call `pFilter.set(k)` then `syncChips(k)`; if `k!=='all'` scroll to `#wk-toolbar` with `FH.scrollToEl`. So a chip toggles: second click clears back to All and does not scroll.
- `syncChips(k)` (L7333) sets `aria-pressed="true"` only on the chip whose `data-k===k` (none for `all`). The toolbar filter also calls `syncChips(k)` on every change (L7113), so chips and toolbar stay in sync.
- There is no chip for Fit For Living's key `website`.

##### Foot scroll cue (HTML L3874-3878; CSS L2058-2065, L2682-2685)
- `div.wk-wh__foot > div.wrap > <button type="button" class="wk-cue wk-a" style="--d:760ms" data-wk-cue="wk-toolbar">` > `span.wk-cue__c` > icon `i-arrow-right` (`aria-hidden="true"`), then text "Scroll to explore".
- `.wk-cue{display:inline-flex;align-items:center;gap:14px;min-height:44px;font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.16em;text-transform:uppercase;color:var(--muted);transition:color .4s}`; `.wk-cue__c{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);background:var(--surface);box-shadow:var(--shadow-sm);transition:background-color .45s var(--ease-out),color .45s,border-color .45s}`; `.wk-cue__c .i{width:16px;height:16px;transform:rotate(90deg);transition:transform .5s var(--ease-out)}` (the right arrow is turned to point down).
- Hover: `.wk-cue:hover{color:var(--ink)}`; `.wk-cue:hover .wk-cue__c{background:var(--grad);color:#fff;border-color:transparent}`; `.wk-cue:hover .wk-cue__c .i{transform:rotate(90deg) translateX(3px)}` (moves 3px down on screen).
- `.wk-wh__foot{position:relative;z-index:1;margin-top:clamp(28px,6vw,48px)}` (L2683). At 1024px and up: `position:absolute;left:0;right:0;bottom:clamp(16px,3vh,34px);margin:0;opacity:calc(1 - var(--sp) * 3)` (L2684). Under 1023px: `display:none` (L2685). Desktop low height: hidden (L2823).
- Click scrolls to `#wk-toolbar` (11.5.10 cue binding).

##### Scroll-linked exit of the copy (desktop, L2816-2819)
- At 1024px and up: `.wk-wh__copy{translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)}`. `--sp` is written by JS (11.5.2 scroll exit).

#### 11.5.2 Works hero: the stage, "the studio wall" (HTML L3825-3871; CSS L2687-2788, L2793-2813, L2818-2819, L2824, L2846, L2860-2870, L2873-2875; JS L7326-7409)

##### Stage box and the bleed maths (L2688-2692)
- `div.wk-sk#wk-sk` (L3825): `position:relative;width:100%;min-width:0;container-type:inline-size;justify-self:end` (L2688).
- At 1024px and up: `width:min(100% + var(--wk-bleed,0px),calc((100svh - 250px) * 1.22));margin-right:calc(-1 * var(--wk-bleed,0px))` (L2689).
- At 1200px and up: `--wk-bleed:clamp(0px,calc((100vw - 1200px) * .2),40px)` (L2690). So the bleed is 0 at 1200px, grows 0.2px per viewport px, and caps at 40px from 1400px. Examples: 1280px gives 16px, 1300px gives 20px, 1400px and wider give 40px. Below 1200px the bleed is 0. Because the column is `justify-self:end`, the negative right margin pushes the stage into the wrap's right padding (`--gutter` is 48px at these widths, so the stage never reaches the viewport edge).
- Desktop with height 800px or less: `width:min(100% + var(--wk-bleed,0px),calc((100svh - 150px) * 1.2))` (L2824).
- 640px to 1023px: `width:min(100%,640px);justify-self:center` (L2846). Under 640px: full column width.
- `div.wk-sk__stage` (L3826): `--sw:66;--sh:54;position:relative;font-size:calc(100cqw / var(--sw));width:calc(var(--sw) * 1em);height:calc(var(--sh) * 1em);perspective:2400px;perspective-origin:50% 40%` (L2691). One em = stage width / 66, so everything inside (all in em) scales as one object. Stage height = 54/66 of its width. Under 639px: `--sw:44;--sh:48.8` (L2860).
- `div.wk-sk__tilt#wk-sk-tilt[role="group"][aria-label="Four featured projects. Choose one to jump to its card."]` (L3827): `position:absolute;inset:0;pointer-events:none;transform-style:preserve-3d;transform:rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg))` (L2692). JS writes `--tx` and `--ty` (tilt, below).

##### Device nesting (comment L2694: "one device = placement + hover offset (dv) > ambient float > entrance (in) > surface")
```
button.wk-dv.wk-dv--{gp|uha|ffl|pb}[type=button][data-p][aria-label]   placement, 3D depth, hover offset (--fx/--fy/--fr/--lz)
  span.wk-dv__float                                                    ambient float animation (transform) + scroll exit (translate)
    span.wk-dv__in                                                     entrance (opacity, transform, filter)
      span.wk-bw (browser)  or  span.wk-ph (phone)                     the surface
    span.wk-dv__tag[aria-hidden="true"]                                label pill (inside float, outside in)
```
- `.wk-dv{position:absolute;left:calc(var(--x) * 1em);top:calc(var(--y) * 1em);width:calc(var(--w) * 1em);padding:0;text-align:left;pointer-events:auto;cursor:pointer;border-radius:1em;color:var(--ink-2);transform-style:preserve-3d;transform:translate3d(var(--fx,0em),var(--fy,0em),calc(var(--z,0) * 1px + var(--lz,0px))) rotate(calc(var(--r) + var(--fr,0deg)));transition:transform 1s var(--ease-out)}` (L2695-2697).
- `.wk-dv:focus-visible{outline:none}` (L2698); the focus ring is drawn on the surface instead (L2782).
- `.wk-dv__float,.wk-dv__in{display:block;position:relative;border-radius:inherit}` (L2699).
- `.wk-dv__float{translate:calc(var(--sp) * var(--ex,0) * 1em) calc(var(--sp) * var(--ey,0) * 1em)}` (L2700). This rule has NO media query, so the scroll exit parts the devices at every width (the copy and stage fade only at 1024px and up).

##### Device placement variables (L2703-2706; phone overrides L2861-2864)
Composition back to front: GitPulse, UHA, Fit For Living, PureBody (comment L2702).

| Device | `--x` | `--y` | `--w` | `--r` | `--z` | `--er` | `--d` | `--fd` | `--ex` | `--ey` | `--ar` | `--cs` |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `.wk-dv--gp` GitPulse | 24.4 | 26.4 | 41.6 | 1.3deg | -110 | 5deg | 60ms | 18s | 2.5 | 2 | 16/9 | (1) |
| `.wk-dv--uha` UHA | 47.4 | 4.5 | 18.6 | 2.2deg | -60 | 7deg | 200ms | 20s | 3 | -2.5 | 1280/697 | .8 |
| `.wk-dv--ffl` Fit For Living | 3.6 | 4.4 | 44.4 | -1.5deg | 0 | -4deg | 340ms | 15s | -2 | -1.5 | 1280/697 | 1.04 |
| `.wk-dv--pb` PureBody | 0 | 24.2 | 11 | -3.6deg | 110 | -8deg | 480ms | 16s | -2.5 | 2.5 | (none, phone) | (none) |

Under 639px (L2861-2864), only these change: `.wk-dv--ffl{--x:1;--y:5;--w:35;--r:-1.5deg;--cs:1.1}`, `.wk-dv--gp{--x:12.4;--y:23.2;--w:31.6;--r:1.3deg;--cs:1.05}`, `.wk-dv--pb{--x:0;--y:22.2;--w:10;--r:-3.6deg}`, and `.wk-dv--uha,.wk-sk__seal{display:none}`. The stage becomes 44em by 48.8em.
- Meaning: `--x/--y/--w` placement in em; `--r` base rotation; `--z` depth in px (`translateZ`); `--er` extra rotation during the entrance; `--d` entrance delay; `--fd` float period; `--ex/--ey` scroll exit offset in em at `--sp:1`; `--ar` screen aspect ratio; `--cs` chrome scale (browser corner radius and chrome bar size).
- Layering: the tilt layer has `transform-style:preserve-3d` and every `.wk-dv` has its own `translateZ`, so paint order comes from depth: GitPulse (-110px) at the back, UHA (-60px), Fit For Living (0), the seal (40px, below), PureBody (110px) in front. DOM order is gp, uha, ffl, pb, seal. A hot device adds `--lz:120px` (L2775), so a hovered GitPulse (10px) comes in front of Fit For Living. Keep real 3D (preserve-3d plus translateZ); do not replace it with `z-index`, or the hover pop and the tilt depth are lost.

##### Browser window surface `.wk-bw` (GitPulse, UHA, Fit For Living; HTML L3831-3834, L3841-3844, L3851-3854; CSS L2708-2732)
- Markup: `span.wk-bw` (GitPulse adds `.wk-bw--dark`) > `span.wk-bw__chrome[aria-hidden="true"]` (`span.wk-bw__dots` with three `<i>`, `span.wk-bw__url` with `<svg class="i"><use href="#i-lock"/></svg>` + URL text, `span.wk-bw__go` with `<svg class="i"><use href="#i-arrow-up-right"/></svg>`) + `span.wk-bw__screen > img`.
- URL texts: GitPulse "gitpulseee.netlify.app", UHA "uha-international.com", Fit For Living "fitforliving.netlify.app".
- Images are the base64 WebPs of section 8 (`works-hero-gitpulse.webp` 1400x797, `works-hero-uha.webp` 1280x697, `works-hero-fitforliving.webp` 1280x697), each with `decoding="async" draggable="false"` and no `loading` attribute. Alt texts are in section 8, copy them exactly.
- `.wk-bw{--c-bg:var(--surface);--c-line:var(--line);--c-dot:var(--line-strong);--c-url:var(--surface-3);--c-txt:var(--muted);position:relative;display:block;overflow:hidden;border-radius:calc(.95em * var(--cs,1));background:var(--c-bg);box-shadow:0 0 0 1px var(--line-strong),inset 0 1px 0 rgba(255,255,255,.7),0 .1em .25em rgba(8,48,42,.05),0 .8em 1.6em -.6em rgba(8,48,42,.12),0 2.6em 5em -2em rgba(8,48,42,.26);transition:box-shadow .7s var(--ease-out)}` (L2709-2713).
- Dark theme: `box-shadow:0 0 0 1px var(--line-strong),inset 0 1px 0 rgba(255,255,255,.06),0 .2em .5em rgba(0,0,0,.3),0 1em 2em -.8em rgba(0,0,0,.5),0 2.8em 5.4em -1.8em rgba(0,0,0,.8)` (L2714).
- `.wk-bw--dark{--c-bg:#16191e;--c-line:rgba(255,255,255,.07);--c-dot:rgba(255,255,255,.2);--c-url:rgba(255,255,255,.07);--c-txt:rgba(236,244,241,.58);box-shadow:0 0 0 1px rgba(8,30,26,.5),inset 0 1px 0 rgba(255,255,255,.08),0 .1em .25em rgba(8,48,42,.06),0 .8em 1.6em -.6em rgba(8,48,42,.16),0 2.6em 5em -2em rgba(8,48,42,.32)}` (L2715-2716); dark theme: `box-shadow:0 0 0 1px rgba(255,255,255,.1),inset 0 1px 0 rgba(255,255,255,.07),0 .2em .5em rgba(0,0,0,.3),0 1em 2em -.8em rgba(0,0,0,.5),0 2.8em 5.4em -1.8em rgba(0,0,0,.85)` (L2717). GitPulse is dark in both themes.
- `.wk-bw__chrome{display:flex;align-items:center;gap:1em;height:2.35em;padding:0 .7em 0 .95em;font-size:calc(1em * var(--cs,1));background:var(--c-bg);border-bottom:1px solid var(--c-line)}` (L2718).
- `.wk-bw__dots{display:flex;gap:.4em;flex:none}`; `.wk-bw__dots i{width:.6em;height:.6em;border-radius:50%;background:var(--c-dot)}` (L2719-2720).
- `.wk-bw__url{flex:0 1 auto;min-width:0;margin:0 auto;display:flex;align-items:center;gap:.5em;height:1.6em;padding:0 1em;border-radius:.55em;background:var(--c-url);font-family:var(--font-mono);font-size:.74em;letter-spacing:.02em;color:var(--c-txt);white-space:nowrap;overflow:hidden}` (L2721-2722); `.wk-bw__url .i{width:1.05em;height:1.05em;flex:none;opacity:.8}` (L2723). GitPulse only: `.wk-dv--gp .wk-bw__url{margin:0 0 0 auto}` (URL pushed right, L2729).
- `.wk-bw__go{flex:none;width:1.55em;height:1.55em;border-radius:50%;display:grid;place-items:center;color:var(--c-txt);border:1px solid var(--c-line);transition:background-color .5s var(--ease-out),color .5s,border-color .5s,transform .6s var(--ease-out)}`; `.wk-bw__go .i{width:.85em;height:.85em}` (L2724-2726).
- `.wk-bw__screen{position:relative;display:block;aspect-ratio:var(--ar,16/9);overflow:hidden;background:var(--surface-2)}`; `.wk-bw--dark .wk-bw__screen{background:#111317}` (L2727-2728).
- `.wk-bw__screen img,.wk-ph__screen img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;user-select:none;-webkit-user-drag:none}` (L2730).
- Glass sheen: `.wk-bw__screen::after,.wk-ph__screen::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.03) 28%,transparent 44%)}` (L2732).

##### Phone surface `.wk-ph` (PureBody; HTML L3861-3863; CSS L2734-2741)
- Markup: `span.wk-ph > span.wk-ph__screen > img` (base64 `works-hero-purebody.webp`, 402x884, alt "PureBody app home screen with today's overview and an AI meal plan") + `span.wk-ph__island[aria-hidden="true"]`.
- `.wk-ph{position:relative;display:block;padding:.36em;border-radius:1.95em;background:#0c0f0e;box-shadow:0 0 0 1px rgba(8,30,26,.55),inset 0 0 0 1px rgba(255,255,255,.14),inset 0 .08em .1em rgba(255,255,255,.18),0 .15em .3em rgba(8,48,42,.1),0 1em 2em -.8em rgba(8,48,42,.28),0 3em 5em -2em rgba(8,48,42,.42);transition:box-shadow .7s var(--ease-out)}` (L2735-2737); dark: `box-shadow:0 0 0 1px rgba(255,255,255,.14),inset 0 0 0 1px rgba(255,255,255,.1),0 1em 2em -.8em rgba(0,0,0,.6),0 3em 5.4em -2em rgba(0,0,0,.9)` (L2738).
- Side button: `.wk-ph::before{content:"";position:absolute;right:-.12em;top:6.2em;width:.14em;height:2.6em;border-radius:0 .1em .1em 0;background:#1d2322}` (L2739).
- `.wk-ph__screen{position:relative;display:block;aspect-ratio:402/884;border-radius:1.6em;overflow:hidden;background:#0b0d0d}` (L2740).
- `.wk-ph__island{position:absolute;left:50%;top:.34em;z-index:3;width:3.3em;height:.98em;border-radius:1em;transform:translateX(-50%);background:#000;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}` (L2741).

##### Label pills `.wk-dv__tag` (HTML L3836, L3846, L3856, L3865; CSS L2743-2755)
- Markup: `span.wk-dv__tag[aria-hidden="true"]` > dot + `<b>` name + `<span>` type:
  - GitPulse: `span.wk-dv__dot`, `<b>GitPulse</b>`, `<span>Next.js</span>`
  - UHA: `span.wk-dv__dot`, `<b>UHA International</b>`, `<span>React.js</span>`
  - Fit For Living: `span.wk-dv__dot`, `<b>Fit For Living</b>`, `<span>Client Website</span>`
  - PureBody: `span.dot-live` (animated ping), `<b>PureBody</b>`, `<span>SaaS App</span>`
- `.wk-dv__tag{position:absolute;z-index:4;display:inline-flex;align-items:center;gap:.6em;height:2.5em;padding:0 1em 0 .85em;border-radius:99em;white-space:nowrap;pointer-events:none;background:var(--surface);border:1px solid var(--line-strong);box-shadow:0 .15em .4em rgba(8,48,42,.05),0 .8em 1.8em -.9em rgba(8,48,42,.3);transition:border-color .5s,box-shadow .6s var(--ease-out)}` (L2744-2746); dark: `background:var(--surface-2);box-shadow:0 .9em 2em -.8em rgba(0,0,0,.8)` (L2747).
- `.wk-dv__tag b{font-size:1.14em;font-weight:700;letter-spacing:-.02em;color:var(--ink)}` (L2748); `.wk-dv__tag>span:last-child{padding-left:.7em;border-left:1px solid var(--line-strong);font-family:var(--font-mono);font-size:.8em;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);line-height:1.5}` (L2749).
- `.wk-dv__dot{flex:none;width:.56em;height:.56em;border-radius:50%;background:var(--accent);box-shadow:0 0 0 .22em var(--accent-soft)}`; `.wk-dv__tag .dot-live{flex:none;width:.56em;height:.56em}` (L2750-2751).
- Positions (L2752-2755): gp `right:.4em;bottom:calc(100% + .95em)`; ffl `left:.2em;bottom:calc(100% + .95em)`; uha `right:.4em;bottom:calc(100% + .95em)`; pb `left:.2em;top:calc(100% + 1.05em)` (below the phone). All sit outside the device.
- Under 639px: `.wk-dv__tag{font-size:1.36em}`; gp `bottom:auto;top:calc(100% + .9em);right:.3em` (moves below); pb `top:calc(100% + .9em)` (L2865-2867).

##### The seal (markup injected by JS at L7352-7356; CSS L2757-2768)
JS appends this at the end of `#wk-sk-tilt` (after the four devices), once, at script start:
```html
<span class="wk-sk__seal" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="wk-sk-p" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs><circle class="wk-sks__o" cx="60" cy="60" r="57"/><circle class="wk-sks__r" cx="60" cy="60" r="36"/><text class="wk-sks__txt"><textPath href="#wk-sk-p" textLength="280">WEB · MOBILE · AI · 2022 - 2026 ·</textPath></text><circle class="wk-sks__in" cx="60" cy="60" r="31"/><text class="wk-sks__n" x="60" y="66" text-anchor="middle">14</text><text class="wk-sks__l" x="60" y="80" text-anchor="middle">PROJECTS</text></svg></span>
```
- The number is `PROJECTS.length` (14), not the "10+" stat. In React render `{projects.length}`.
- `.wk-sk__seal{position:absolute;left:13.4em;top:35.4em;width:8em;height:8em;border-radius:50%;pointer-events:none;transform:translate3d(0,0,40px) rotate(-12deg);filter:drop-shadow(0 .7em 1.2em rgba(8,48,42,.18));transition:opacity .5s var(--ease-out)}` (L2758-2759); dark: `filter:drop-shadow(0 .8em 1.4em rgba(0,0,0,.6))` (L2760). The CSS comment says "top-left corner" but the values place it in the lower left area, between the phone and GitPulse. Copy the values.
- `.wk-sk__seal>svg{display:block;width:100%;height:100%;overflow:visible}` (L2761); `.wk-sks__o{fill:var(--surface);stroke:var(--line-strong);stroke-width:1}`; `.wk-sks__r{fill:none;stroke:var(--line);stroke-width:1}`; `.wk-sks__txt{font-family:var(--font-mono);font-size:8.4px;font-weight:500;letter-spacing:1px;fill:var(--brand-ink)}`; `.wk-sks__in{fill:var(--brand)}` (dark `fill:#0f7a64`); `.wk-sks__n{font-family:var(--font-serif);font-style:italic;font-size:30px;fill:#fff}`; `.wk-sks__l{font-family:var(--font-mono);font-size:5.4px;letter-spacing:1.2px;fill:rgba(255,255,255,.8)}` (L2762-2768).
- Hidden under 639px (L2864). Fades out whenever a device is hot after settle: `.is-settled .wk-sk__tilt.is-fan .wk-sk__seal{opacity:.0}` (L2805) with `transition:opacity .5s var(--ease-out)` (L2804).
- The `<path id="wk-sk-p">` id must be unique in the document. In React use a stable id (for example `useId`) and point `textPath href` at it.

##### Entrance (JS adds `.is-on` as the curtain lifts; CSS L2789-2805)
Before `.is-on` (all under `.js #works .wk-hero--works:not(.is-on)`):
- `.wk-dv__in{opacity:0;transform:translate3d(0,3.6em,0) rotate(var(--er,4deg)) scale(.95);filter:blur(10px)}` (L2793)
- `.wk-dv__tag{opacity:0;translate:0 .6em}` (L2794)
- `.wk-sk__seal{opacity:0;transform:translate3d(0,0,40px) rotate(-50deg) scale(1.25)}` (L2795)
- `.wk-sk__cap{opacity:0;transform:translate3d(0,8px,0)}` (L2796)

With `.is-on`:
| Target | Transition | Resulting delays |
|---|---|---|
| `.wk-dv__in` (L2800) | `opacity .8s var(--ease-out) var(--d),transform 1.3s var(--ease-out) var(--d),filter .9s var(--ease-out) var(--d)` | gp 60ms, uha 200ms, ffl 340ms, pb 480ms |
| `.wk-dv__tag` (L2801) | `opacity .7s var(--ease-out) calc(var(--d) + 640ms),translate .9s var(--ease-out) calc(var(--d) + 640ms),border-color .5s,box-shadow .6s var(--ease-out)` | gp 700ms, uha 840ms, ffl 980ms, pb 1120ms |
| `.wk-sk__seal` (L2802) | `opacity .6s var(--ease-out) .95s,transform 1.1s var(--ease-out) .95s` | 950ms |
| `.wk-sk__cap` (L2803) | `opacity .8s var(--ease-out) 1.15s,transform .9s var(--ease-out) 1.15s` | 1150ms |
| `.wk-wh__halo` (L2637-2638) | `opacity 1.8s var(--ease-out),transform 2.2s var(--ease-out)` | 0 |
- After `.is-settled` (1400ms after `.is-on`): seal transition becomes `opacity .5s var(--ease-out)` (L2804) so the hover fade is quick.
- Order of the classes on the hero: `.is-on` at enter, `.is-settled` at +1400ms, `.is-live` at +2200ms (JS L7405-7406). With reduced motion `.is-settled` is added at once and `.is-live` never.

##### Ambient float (CSS L2807-2813)
- `@keyframes wk-sk-float{0%,100%{transform:none}25%{transform:translate3d(0,-.4em,0) rotate(-.25deg)}75%{transform:translate3d(0,.4em,0) rotate(.25deg)}}`
- `.wk-hero--works.is-live .wk-dv__float{animation:wk-sk-float var(--fd,16s) var(--ease-io) infinite}`: periods gp 18s, uha 20s, ffl 15s, pb 16s.
- `.is-live .wk-dv--ffl .wk-dv__float,.is-live .wk-dv--uha .wk-dv__float{animation-direction:reverse}`; `.is-live .wk-dv--gp .wk-dv__float{animation-delay:-6s}`; `.is-live .wk-dv--pb .wk-dv__float{animation-delay:-3s}`.
- `.wk-hero--works.is-idle .wk-dv__float,.wk-hero--works.is-idle .dot-live{animation-play-state:paused}` (L2813). JS sets `.is-idle` when the page is not active (off screen, other page, tab hidden, or before entrance). This also pauses the PureBody tag's `.dot-live` ping.
- The float animates `transform` while the scroll exit uses the separate `translate` property on the same element, so both combine. Keep them as two properties in the port.
- Reduced motion: `.wk-dv__float{animation:none}` (L2875).

##### Hover, focus and the fan (CSS L2770-2782; JS L7358-7369)
- JS `setHot(b)` toggles `.is-hot` on the one device `b` (removes it from the others) and toggles `.is-fan` on `#wk-sk-tilt` when any device is hot (L7369).
- Triggers: `pointerenter` on a device with `pointerType==='mouse'` AND the hero has `.is-settled` sets it hot (L7364). `focus` on a device sets it hot (no settle check, L7365). `blur` clears (L7366). `pointerleave` on `#wk-sk` (the whole stage) with a mouse clears (L7368). Leaving a device into empty stage space does NOT clear: the device stays picked up until the pointer enters another device or leaves the stage (comment L7363, no flicker at edges). Touch never sets hot.
- When `.is-settled` and the tilt has `.is-fan`, every device parts by its own offset, the hot one included (L2771-2774): gp `--fx:1.2em;--fy:1.1em;--fr:.6deg`; uha `--fx:1.2em;--fy:-1em;--fr:.8deg`; ffl `--fx:-.5em;--fy:-.4em;--fr:-.4deg`; pb `--fx:-1.1em;--fy:.3em;--fr:-1deg`. The move runs on `.wk-dv{transition:transform 1s var(--ease-out)}`.
- Hot device (L2775-2781): `--lz:120px` (lifts toward the viewer); `.is-hot .wk-bw{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 60%,transparent),inset 0 1px 0 rgba(255,255,255,.7),0 .4em 1em rgba(8,48,42,.06),0 1.4em 2.6em -1em rgba(8,48,42,.18),0 3.6em 6.4em -2.2em rgba(8,48,42,.38)}` (dark: `0 0 0 1px color-mix(in srgb,var(--accent) 50%,transparent),0 1.4em 2.6em -1em rgba(0,0,0,.6),0 3.8em 6.8em -2em rgba(0,0,0,.95)`); `.is-hot .wk-ph{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 70%,transparent),inset 0 0 0 1px rgba(255,255,255,.14),0 1.4em 2.6em -1em rgba(8,48,42,.3),0 3.8em 6.4em -2em rgba(8,48,42,.5)}` (dark: `0 0 0 1px color-mix(in srgb,var(--accent) 60%,transparent),0 3.8em 6.8em -2em rgba(0,0,0,.95)`); `.is-hot .wk-bw__go{background:var(--grad);color:#fff;border-color:transparent;transform:rotate(45deg)}`; `.is-hot .wk-dv__tag{border-color:color-mix(in srgb,var(--accent) 60%,transparent)}`.
- Keyboard focus ring: `.wk-dv:focus-visible .wk-bw,.wk-dv:focus-visible .wk-ph{outline:.2em solid var(--accent);outline-offset:.25em}` (L2782).
- Note the hot lift (`--lz`) applies without `.is-settled` (focus before settle), but the parting offsets need `.is-settled`.

##### Stage tilt toward the cursor (JS L7371-7385)
- Only when `FH.fine` (pointer fine) and not reduced motion. `pointermove` on `#wk-hero` (passive); ignored unless the hero has `.is-settled` and `innerWidth>=1024`.
- `r = #wk-sk rect`; `px=(clientX-(r.left+r.width/2))/Math.max(1,innerWidth/2)`; `py=(clientY-(r.top+r.height/2))/Math.max(1,innerHeight/2)`; targets `wgy=clamp(px,-1,1)*5`, `wgx=clamp(py,-1,1)*-3.5`.
- rAF loop: `wtx+=(wgx-wtx)*.07; wty+=(wgy-wty)*.07`; writes `--tx` = `wtx.toFixed(3)+'deg'` and `--ty` = `wty.toFixed(3)+'deg'` on `#wk-sk-tilt`; continues while either gap is above .01.
- `pointerleave` on the hero sets both targets to 0 and runs the loop back to rest.
- Result: `rotateX(--tx)` up to 3.5deg (sign opposite to vertical offset), `rotateY(--ty)` up to 5deg.

##### Jump to a project (JS L7334-7338, L7358-7362)
- Each device's `data-p` ("GitPulse", "UHA International", "Fit For Living", "PureBody") is matched against `PROJECTS[i].t` to get the data index `i`. Click calls `jumpToCell(i)`.
- `jumpToCell(i)`: `cell = cells[i]` (cells are kept in data order, not grid order). If the project filter is not `all`, call `pFilter.set('all')` and wait 650ms. Then `FH.scrollToEl(cell)` (target top minus 84px under 1024px wide, minus 32px otherwise, L4687), and 900ms later `flash(cell.firstChild)` (the `article.wk-card`). Flash details in 11.5.10.

##### Scroll-linked exit (JS L7387-7396; CSS L2700, L2684, L2815-2820)
- Window `scroll` (passive) schedules one rAF. `wkScroll()` returns early unless `FH.current==='works'` and not reduced motion.
- `r = #wk-hero rect`; `p = Math.min(1,Math.max(0,(innerHeight-r.bottom)/Math.max(1,innerHeight*.8)))`; then smoothstep `p=p*p*(3-2*p)`; skip when the change is under .001; write `--sp` = `p.toFixed(4)` on `#wk-hero`. So `--sp` starts rising only once the hero's bottom edge is above the viewport bottom, and reaches 1 after a further 80% of the viewport height.
- CSS using `--sp`: at 1024px and up, `.wk-wh__copy{translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)}`, `.wk-sk__stage{translate:0 calc(var(--sp) * -30px);opacity:calc(1.15 - var(--sp) * 1.2)}`, `.wk-sk__cap{opacity:calc(1 - var(--sp) * 1.8)}`, `.wk-wh__foot{opacity:calc(1 - var(--sp) * 3)}`. At every width: `.wk-dv__float{translate:calc(var(--sp) * var(--ex,0) * 1em) calc(var(--sp) * var(--ey,0) * 1em)}`.
- Reset to `--sp:0` on every page show (hero reset, 11.5.10).

##### Caption (HTML L3870; CSS L2784-2787, L2868-2870)
- `p.wk-sk__cap` > `span.wk-sk__n` (`span.wk-sk__d` "04" + `span.wk-sk__m` "03") + `span` (`span.wk-sk__d` "Four of fourteen. Pick one to jump to it." + `span.wk-sk__m` "Three of fourteen. Tap one to jump to it.").
- `.wk-sk__m{display:none}` (L2785). Under 639px: `.wk-sk__m{display:inline}`, `.wk-sk__d{display:none}`, `.wk-sk__cap{margin-left:0;font-size:.84rem}` (L2868-2870). The phone text says three because UHA is hidden there.
- `.wk-sk__cap{display:flex;align-items:center;gap:12px;margin:clamp(14px,2.4vh,26px) 0 0 2cqw;font-size:.88rem;line-height:1.4;color:var(--muted)}`; `.wk-sk__n{flex:none;display:inline-grid;place-items:center;height:28px;padding:0 10px;border-radius:99px;background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.72rem;letter-spacing:.1em}` (L2786-2787).
- Hidden on desktop with height 800px or less (L2823).

##### Reduced motion (L2872-2876, plus global L357-362)
- `.js #works .wk-hero--works .wk-dv__in{opacity:1;transform:none;filter:none}`; `#works .wk-hero--works *{transition-delay:0s!important}`; `.wk-dv__float{animation:none}`. JS: no tilt, no scroll exit, `.is-settled` at once, no `.is-live`. Hover still sets `.is-hot` (the offsets apply with near zero transition).

##### Works hero responsive summary
| Width | Change |
|---|---|
| 1024px and up | two columns `.84fr / 1.16fr`; stage width capped by height and bleed; foot cue pinned to the bottom; scroll exit fades copy and stage |
| 1024px and up, height 800px or less | tighter paddings and margins, smaller title, foot cue and caption hidden, stage cap `(100svh - 150px) * 1.2` |
| 1024px to 1180px | columns `1fr / 1.1fr`, smaller CTA padding and stat labels |
| 1200px and up | `--wk-bleed` up to 40px |
| 640px to 1023px | one column, stage `min(100%,640px)` centered, no foot cue |
| 639px and down | stage 44 x 48.8 em, three devices (no UHA, no seal), bigger tags, phone caption text |

#### 11.5.3 Toolbar and segmented filter, shared by Works and Approvals (HTML L3882-3885, L3942-3949; CSS L2075-2093, L2300-2316; JS L6948-6982, L7585-7589)

##### Markup
- Works (L3882-3885): `div.wk-toolbar#wk-toolbar[data-reveal]` > `div.wk-filter#wk-filter[role="group"][aria-label="Filter projects by technology"]` (empty, filled by JS) + `p.wk-count#wk-count[aria-live="polite"]` (empty, filled by JS).
- Approvals (L3942-3949): `div.wk-toolbar#wk-ap-toolbar[data-reveal]` > `div.wk-filter#wk-ap-filter[role="group"][aria-label="Filter certifications by area"]` + `div.wk-railctl[aria-label="Certificate carousel controls"][role="group"]` (rail controls, 11.5.8). No count line on Approvals.
- JS output inside each filter (L6953-6955), first the indicator, then one button per definition:
```html
<span class="wk-filter__ind" aria-hidden="true"></span>
<button type="button" class="wk-fbtn" data-k="all" aria-pressed="true">All Projects<span class="wk-fbtn__n" aria-label="14 items">14</span></button>
<button type="button" class="wk-fbtn" data-k="reactjs" aria-pressed="false">React.js<span class="wk-fbtn__n" aria-label="3 items">3</span></button>
...
```
- Only the first button starts pressed (`aria-pressed="'+(i===0)+'"`). The label is escaped text, the count is `counts[key]||0`.

##### Labels, keys and counts
| Filter | Key | Label | Count |
|---|---|---|---|
| Works | `all` | All Projects | 14 |
| Works | `reactjs` | React.js | 3 (UHA International, Echo AI, DSA Tracker) |
| Works | `nextjs` | Next.js | 3 (GitPulse, YOOM, Live Search Weather) |
| Works | `fullstack` | MERN Stack | 3 (Smart Health Care, Soledeck, Dosnexa) |
| Works | `reactnative` | React Native | 3 (Smart Gallery App, Medicine Store App, Financial Fusion) |
| Works | `sassapp` | Sass App | 1 (PureBody) |
| Approvals | `all` | All Certifications | 7 |
| Approvals | `ai` | AI | 2 |
| Approvals | `frontend` | Frontend | 2 |
| Approvals | `web` | Backend | 1 |
| Approvals | `cloud` | Cloud | 1 |
| Approvals | `mobile` | Mobile | 1 |
- Fit For Living has key `website`, which has no button. It appears only under All Projects. Keep that.
- Counts are computed from the data (`counts={all:items.length}` plus one per `k`, L6952). Compute them in the port, do not hard code.

##### CSS
- `.wk-sec .wk-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px 24px;margin-bottom:clamp(24px,3vw,36px)}` (L2076).
- `.wk-sec .wk-filter{--fl:0px;--fr:0px;position:relative;display:flex;gap:2px;padding:5px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-sm);width:max-content;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl),#000 calc(100% - var(--fr)),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl),#000 calc(100% - var(--fr)),transparent 100%)}` (L2077-2080); `::-webkit-scrollbar{display:none}` (L2081).
- Indicator: `.wk-sec .wk-filter__ind{position:absolute;left:0;top:5px;bottom:5px;width:0;border-radius:var(--r-pill);background:var(--grad);box-shadow:var(--glow);z-index:0;transition:transform .6s var(--ease-out),width .6s var(--ease-out)}` (L2082-2083).
- Button: `.wk-sec .wk-fbtn{position:relative;z-index:1;flex:none;display:inline-flex;align-items:center;gap:9px;height:42px;padding:0 8px 0 18px;border-radius:var(--r-pill);font-weight:600;font-size:.88rem;letter-spacing:-.005em;color:var(--ink-2);white-space:nowrap;transition:color .4s var(--ease-out)}` (L2084-2085); hover `color:var(--ink)`; `[aria-pressed="true"]{color:#fff}`; `:focus-visible{outline-offset:-2px;border-radius:var(--r-pill)}` (L2086-2088).
- Count chip: `.wk-sec .wk-fbtn__n{display:grid;place-items:center;min-width:26px;height:22px;padding:0 7px;border-radius:var(--r-pill);background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.66rem;font-weight:500;transition:background-color .4s,color .4s}`; pressed: `background:rgba(255,255,255,.2);color:#fff` (L2089-2091).
- Count line: `.wk-sec .wk-count{font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap}`; `.wk-count b{color:var(--ink);font-weight:500}` (L2092-2093). Content set by JS: `Showing <b>{visible}</b> of 14` (L7102), for example "Showing 14 of 14" (shown uppercase by CSS).
- Under 1023px (L2313-2316): `.wk-count` is visually hidden (`position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap`) but still announced; `.wk-filter{min-width:0}`.
- Under 639px (L2303-2307): `.wk-toolbar{flex-direction:column;align-items:stretch}`; `.wk-filter{width:auto;margin-inline:calc(var(--gutter) * -1);border-radius:0;border-inline:0;padding-inline:var(--gutter);background:transparent;box-shadow:none;border-color:transparent;padding-block:4px}` (full bleed scroller); `.wk-filter__ind{top:4px;bottom:4px}`; `.wk-fbtn{height:44px;background:var(--surface);border:1px solid var(--line);margin-right:4px}`; `.wk-fbtn[aria-pressed="true"]{background:transparent;border-color:transparent}` (the gradient indicator shows through).

##### Behaviour (makeFilter, L6951-6982)
- Name and lines: `makeFilter(root, defs, items, onChange)`, L6951-6982.
- Starts when: script start (L7111 for Works, L7257 for Approvals). Listeners: `click` on each button; `scroll` on the filter (passive); window `resize`; `document.fonts.ready`; plus `sync()` at once and again after 400ms. Also re-synced 30ms after the page is shown (`fh:page`, L7586-7588).
- Reads or measures: the pressed button's `offsetWidth` and `offsetLeft`; the filter's `scrollWidth`, `clientWidth`, `scrollLeft`.
- Writes: `aria-pressed` on every button; indicator inline `width` (px) and `transform:translateX({offsetLeft}px)`; filter CSS variables `--fl` (`28px` when `scrollLeft>2`, else `0px`) and `--fr` (`28px` when `scrollLeft<max-2`, else `0px`) that drive the edge fade mask.
- `place(instant)`: when instant, set the indicator `transition:none`, write size and position, force a reflow (`getBoundingClientRect()`), then clear the inline transition. Used by `sync()` so resize and first paint do not animate. A click calls `place(false)` so the indicator slides (.6s `--ease-out`).
- `select(b)`: ignore when the key is already current; set `aria-pressed` on all buttons; slide the indicator; when the filter overflows, `root.scrollTo({left:b.offsetLeft-(root.clientWidth-b.offsetWidth)/2,behavior:FH.reduce?'auto':'smooth'})` to center the chosen button; then `onChange(k)`.
- Returns `{counts, sync, get(), set(k)}`. `set(k)` finds the button with that key and runs `select`, so programmatic changes (chips, device jumps, deck jumps) look exactly like a click.
- Timings: indicator slide .6s `--ease-out`; second sync at 400ms; page show re-sync at 30ms.
- Pauses or skips when: nothing runs while idle. Measuring while the page is hidden (display none) gives zeros; that is why the page show re-sync exists.
- Cleanup in React: remove the resize listener and the scroll listener; cancel the 400ms and 30ms timers.
- Port as: `<SegmentedFilter defs items value onChange />` with a `useIndicator` layout effect (ResizeObserver on the filter is fine in addition to window resize, but keep the instant first placement and the smooth click slide). Keep `role="group"`, `aria-pressed`, and the `aria-label="{n} items"` on the count chip.
- Onchange for Works (L7111-7114): run the FLIP filter with `k==='all' || project.k===k`, then `syncChips(k)`. For Approvals (L7257-7259): run the FLIP filter on the certificate cells.

#### 11.5.4 FLIP filtering (JS L6984-7023)

- Name and lines: `makeFlip(container, cells, layout, afterFn)`, L6987-7023. Returns `flip(test)`. Works uses it with the grid and its `layout`/`after` (L7110); Approvals with the rail track, a no-op layout and `afterC` (L7256).
- Starts when: a filter change (`onChange`).
- Sequence of one `flip(test)` call:
  1. `run=++token` (a newer call cancels an older pending one at step 4).
  2. For every cell: cancel any running animations stored in `c.__wkA`, clear the list, add `.is-in` (forces the reveal and the screen wipe to their end state), set `--d` to `0ms` (L6991).
  3. `prev` = cells not hidden; `next` = cells passing `test` (data order). `leaving` = in prev not in next; `entering` = in next not in prev; `staying` = in both.
  4. Reduced motion: set `hidden` on every cell not in next, call `layout(next)` and `afterFn(next)`, stop. No animation.
  5. Leaving cells: `animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.95)'}],{duration:260,easing:EASE,fill:'forwards'})`.
  6. After `leaving.length?250:0` ms (note 250ms, a little shorter than the 260ms fade): stop if `run!==token`. Measure `first` = bounding rects of staying cells and `h0` = container `offsetHeight`. Set `hidden=true` on leaving cells and cancel their animations; set `hidden=false` on entering cells; `layout(next)`; `afterFn(next)`; `h1` = container `offsetHeight`.
  7. Staying cells (invert and play): `dx=a.left-b.left`, `dy=a.top-b.top`, `s=Math.max(.85,Math.min(1.15,Math.min(a.width/b.width,a.height/b.height)))`, `resized=Math.abs(a.width-b.width)>2`. Skip when `|dx|<1 && |dy|<1 && !resized`. Otherwise `animate([{transformOrigin:'0 0',transform:'translate('+dx+'px,'+dy+'px) scale('+(resized?s:1)+')',opacity:resized?.55:1},{transformOrigin:'0 0',transform:'none',opacity:1}],{duration:620,easing:EASE})`.
  8. Entering cells: `animate([{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'none'}],{duration:560,delay:60+i*55,easing:EASE,fill:'backwards'})` (i = index among entering cells: 60ms, 115ms, 170ms ...).
  9. If the container got shorter (`h1<h0-2`): `container.animate([{height:h0+'px'},{height:h1+'px'}],{duration:620,easing:EASE})`. No animation when it grows.
- Writes: `hidden` attribute on cells, `.is-in` class, `--d` inline variable, Web Animations on cells and container, DOM order (via Works `layout`).
- Timings: leave 260ms; swap at 250ms; move 620ms; enter 560ms with 60ms + 55ms stagger; height 620ms; easing `cubic-bezier(.22,1,.36,1)` for all.
- Pauses or skips when: reduced motion (instant swap). A new filter during the 250ms wait cancels the old swap.
- `.wk-cell[hidden]{display:none}` (L2107) and `.wk-cc[hidden]{display:none}` (L2243) make hidden cells leave the layout.
- `#works .wk-gridwrap,#approvals .wk-rail,.wk-sec .wk-empty{overflow-anchor:none}` (L2104) stops scroll anchoring from jumping during the swap. Keep it.
- Cleanup in React: cancel all stored animations and the pending timeout on unmount.
- Port as: `useFlip(containerRef)` that snapshots rects before the state change and plays after commit (`useLayoutEffect`). Keep the cells mounted and toggle `hidden` (do not unmount them), because the reference animates the same nodes and keeps their `.is-in` state. The Web Animations API calls can be copied as is.

#### 11.5.5 Works grid and project cards (HTML L3887-3894; CSS L2101-2216, L2386-2398, L2408-2411; JS L7025-7115)

##### Container
- `div.wk-gridwrap` (L3887) > `div.wk-grid#wk-grid` (empty, JS fills it) + `div.wk-empty#wk-empty[hidden]` (empty state, below).
- `#works .wk-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(16px,1.8vw,24px)}` (L2105).
- `#works .wk-cell{grid-column:span var(--span,4);min-width:0;display:flex}`; `#works .wk-cell[hidden]{display:none}` (L2106-2107).

##### Card template (JS L7030-7066), exact output for project index `i` (0 based), `n = pad(i+1)`
```html
<div class="wk-cell" data-reveal data-k="{k}" [data-feat if b==='featured'] [data-hero if b==='latest']>
  <article class="wk-card card[ wk-card--feat if featured]" data-tilt="3" data-spotlight aria-labelledby="wk-p{n}">
    <div class="wk-media">
      <div class="wk-chrome" aria-hidden="true"><span class="wk-dots"><i></i><i></i><i></i></span><span class="wk-url">{icon lock}{dom}</span></div>
      <div class="wk-screen">
        <div class="wk-cover" style="--h:{HUES[i]};--a:{118+(i*23)%70}deg;--rx:{RINGS[i][0]}%;--ry:{RINGS[i][1]}%;--rw:{RINGS[i][2]}%" aria-hidden="true">
          <span class="wk-cover__cat">{n} · {cat}</span>
          <span class="wk-cover__ico">{icon CAT_ICON[cat] or 'code'}</span>
          <span class="wk-cover__ini">{ini}</span>
        </div>
        <img src="{encodeURI(FH.asset(img))}" alt="Screenshot of {t}" loading="lazy" decoding="async" onload="this.classList.add('is-ok')" onerror="this.remove()">
      </div>
      {badge}
    </div>
    <div class="wk-body">
      <p class="wk-meta"><span class="wk-idx">{n}</span><span class="wk-cat">{cat}</span></p>
      <h3 class="wk-title" id="wk-p{n}">{title}</h3>
      <p class="wk-desc">{d}</p>
      <ul class="tags wk-tags" aria-label="Technologies"><li class="tag">{tag}</li>...</ul>
      <div class="wk-actions">{live}{src}</div>
    </div>
  </article>
</div>
```
- `icon(id,cls)` (L6943) always renders `<svg class="i[ cls]" aria-hidden="true"><use href="#i-{id}"/></svg>`.
- `dom` = `live` with `^https?://`, a trailing `/` and a trailing `.html` removed (L7031). PureBody shows `faisalhanif.work/sass-app`.
- `{badge}` (L7032-7034):
  - `latest`: `<span class="wk-badge wk-badge--latest"><span class="dot-live" aria-hidden="true"></span>Latest</span>`
  - `featured`: `<span class="wk-badge wk-badge--feat"><svg class="i i--fill" aria-hidden="true"><use href="#i-star"/></svg>Featured</span>`
  - otherwise: `<span class="wk-badge"><span class="wk-dot" aria-hidden="true"></span>Live</span>`
- `{live}` (L7035-7037):
  - project with `modal` (PureBody only): `<button type="button" class="wk-live" data-open="purebody" aria-haspopup="dialog">Live Preview{icon arrow-up-right}<span class="sr-only"> of PureBody</span></button>`. The core click handler opens `#purebody` (`[data-open]`, L4657).
  - others: `<a class="wk-live" href="{live}" target="_blank" rel="noopener">Live Preview{icon arrow-up-right}<span class="sr-only"> of {t}, opens in a new tab</span></a>`
- `{src}` (L7038-7040):
  - with `src`: `<a class="wk-src" href="{src}" target="_blank" rel="noopener">{icon github}Source<span class="sr-only"> code of {t} on GitHub</span></a>`
  - `src:null` (PureBody, UHA International, Fit For Living): `<span class="wk-closed">{icon lock}Closed Source</span>`
- `{title}`: `latest` renders `Pure<span class="serif">Body</span>`; all others the escaped `t` (L7041).
- The card number `n` comes from the data index and never changes with layout: PureBody 01, UHA International 02, Fit For Living 03, GitPulse 04, Smart Health Care 05, Smart Gallery App 06, Echo AI 07, Medicine Store App 08, Soledeck 09, Financial Fusion 10, YOOM 11, Dosnexa 12, DSA Tracker 13, Live Search Weather 14. Because Echo AI is moved (below), the grid shows 04, 07, 05, 06.

##### Data fields mapped to the card
| Field | Used for |
|---|---|
| `t` title | `h3.wk-title` text (except PureBody's split title), image alt "Screenshot of {t}", sr-only link text, hero device lookup (`data-p`) |
| `ini` initials | `.wk-cover__ini` |
| `cat` category | `.wk-cover__cat` ("{n} · {cat}"), `.wk-cat` in the meta line, the cover icon via `CAT_ICON` |
| `k` filter key | `data-k` on the cell, filter counts and test |
| `b` badge | badge variant, `data-feat` / `data-hero`, `.wk-card--feat`, the split title |
| `img` | `<img src>` through `FH.asset` and `encodeURI` (two file names have spaces) |
| `live` | Live Preview link and the chrome URL text |
| `modal` | turns Live Preview into a modal button |
| `src` | Source link or Closed Source |
| `tags` | `ul.wk-tags` items |
| `d` description | `p.wk-desc` |
| index `i` | `n`, `HUES[i]`, cover angle, `RINGS[i]`, reveal delay order |

##### Editorial rhythm layout (JS L7069-7099)
- `plan(n)` builds rows of spans on 12 columns: loop with `rem=n`, `k=0`: `rem===1` gives `['w']` (one wide card); `rem===2` gives `k%4===3?[5,7]:[7,5]`; `rem===4` gives `[7,5],[5,7]`; else even `k` gives `[4,4,4]` (rem minus 3); else `k%4===1?[7,5]:[5,7]` (rem minus 2); `k++`.
- `layout(vis)`: hero cells (`data-hero`, PureBody) go first with `--span:12`, wide on, and `.is-odd`, `.is-big`, `.is-p5` removed. The rest get `plan(rest.length)`. If a featured cell (`data-feat`, Echo AI) is not already on a 7 span, it is moved to the index of the first 7 in the plan (L7086-7088). All cells are re-appended to the grid in the new order (DOM order changes). Each rest cell: `--span` = span (or 12 for `'w'`), `.is-wide` and `.wk-card--wide` on the article when `'w'`, `.is-big` when 7, `.is-p5` when 5, `.is-odd` when the rest count is odd and it is the last one.
- `setWide(c,on)` toggles `.is-wide` on the cell and `.wk-card--wide` on its first child (the article) (L7099).
- Computed layouts (checked by running the algorithm):

| Filter | Rows (desktop, 12 columns) | Flags |
|---|---|---|
| All (14) | PureBody 12 / UHA 4, Fit For Living 4, GitPulse 4 / Echo AI 7, Smart Health Care 5 / Smart Gallery App 4, Medicine Store App 4, Soledeck 4 / Financial Fusion 5, YOOM 7 / Dosnexa 4, DSA Tracker 4, Live Search Weather 4 | PureBody wide; Echo AI and YOOM `.is-big`; Smart Health Care and Financial Fusion `.is-p5`; Live Search Weather `.is-odd` |
| React.js (3) | UHA 4, Echo AI 4, DSA Tracker 4 | DSA Tracker `.is-odd`; Echo AI keeps `.wk-card--feat` but is not moved (no 7 in the plan) |
| Next.js (3) | GitPulse 4, YOOM 4, Live Search Weather 4 | Live Search Weather `.is-odd` |
| MERN Stack (3) | Smart Health Care 4, Soledeck 4, Dosnexa 4 | Dosnexa `.is-odd` |
| React Native (3) | Smart Gallery App 4, Medicine Store App 4, Financial Fusion 4 | Financial Fusion `.is-odd` |
| Sass App (1) | PureBody 12 | wide (hero) |
- `after(vis)` (L7101-7104): `#wk-count` innerHTML `Showing <b>{vis.length}</b> of {PROJECTS.length}`; `#wk-empty.hidden = vis.length>0`.

##### Reveal delay per card (JS L7106-7107)
- Computed once after the first layout, walking the cells in DATA order (not grid order): `rowX=0`; for each cell `s = --span` (or 4); `--d = Math.round(rowX/12*3)*90 + 'ms'`; `rowX=(rowX+s)%12`.
- Result: PureBody 0, UHA 0, Fit For Living 90, GitPulse 180, Smart Health Care 0, Smart Gallery App 90, Echo AI 180, Medicine Store App 90, Soledeck 180, Financial Fusion 0, YOOM 90, Dosnexa 0, DSA Tracker 90, Live Search Weather 180 (ms). Because the walk is in data order, in the Echo AI row the right card (Smart Health Care, 0ms) appears before the left card (Echo AI, 180ms). Copy these values as they are.
- Then `FH.observe(grid)` and `FH.bind(grid)` (L7108): reveal observer plus tilt on `[data-tilt]`.

##### Card CSS (L2109-2192)
- `#works .wk-card{display:flex;flex-direction:column;width:100%;padding:8px;border-radius:26px}` plus `.card` (L158-159: `position:relative;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);transition:transform var(--dur-2) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),border-color var(--dur-2),background-color var(--dur-2)`). Hover: `box-shadow:var(--shadow-md);border-color:var(--line-strong)` (L2110). There is no `.card--hover`, so no CSS lift; the lift comes from the tilt script (fine pointers only).
- Media: `.wk-media{position:relative;flex:none;display:flex;flex-direction:column;border-radius:19px;overflow:hidden;background:var(--surface-2);border:1px solid var(--line);isolation:isolate}` (L2113).
- Chrome: `.wk-chrome{display:flex;align-items:center;gap:12px;height:34px;padding:0 12px;border-bottom:1px solid var(--line);background:var(--surface);flex:none}`; `.wk-dots{display:flex;gap:5px}`; `.wk-dots i{width:8px;height:8px;border-radius:50%;background:var(--line-strong)}`; `.wk-url{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:calc(100% - 150px);height:22px;padding:0 10px;border-radius:7px;background:var(--surface-3);font-family:var(--font-mono);font-size:.64rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`; `.wk-url .i{width:10px;height:10px;opacity:.7}` (L2114-2119).
- Screen: `.wk-screen{position:relative;flex:1 0 auto;aspect-ratio:16/10;overflow:hidden;container-type:inline-size}`; `.wk-screen img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;opacity:0;transition:opacity .6s var(--ease-out),transform .9s var(--ease-out)}`; `.wk-screen img.is-ok{opacity:1}`; hover `.wk-card:hover .wk-screen img,.wk-card:hover .wk-cover{transform:scale(1.04)}` (L2120-2123).
- Fallback cover, always under the image (L2125-2140): `.wk-cover{--l1:30%;--l2:15%;--l3:46%;position:absolute;inset:0;overflow:hidden;color:#fff;transition:transform .9s var(--ease-out);background:radial-gradient(90% 85% at 88% 4%,hsl(var(--h) 72% var(--l3) / .85),transparent 62%),radial-gradient(60% 60% at 0% 100%,hsl(calc(var(--h) - 14) 70% 55% / .28),transparent 70%),linear-gradient(var(--a),hsl(var(--h) 62% var(--l1)),hsl(calc(var(--h) + 10) 72% var(--l2)))}`; dark theme `--l1:21%;--l2:8%;--l3:33%` (L2130); `::before` grid lines `background-image:linear-gradient(rgba(255,255,255,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.075) 1px,transparent 1px);background-size:28px 28px` masked by `radial-gradient(120% 90% at 70% 20%,#000 20%,transparent 75%)`; `::after` ring `position:absolute;right:var(--rx,-18%);bottom:var(--ry,-38%);width:var(--rw,70%);aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.14);box-shadow:0 0 0 28px rgba(255,255,255,.03),0 0 0 29px rgba(255,255,255,.08)`; `.wk-cover__cat{position:absolute;left:18px;top:16px;font-family:var(--font-mono);font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.72)}`; `.wk-cover__ico{position:absolute;right:14px;top:12px;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}` (icon 18px); `.wk-cover__ini{position:absolute;left:14px;bottom:-.16em;font-size:clamp(3.4rem,31cqw,11rem);font-weight:800;letter-spacing:-.075em;line-height:1;background:linear-gradient(180deg,rgba(255,255,255,.96) 10%,rgba(255,255,255,.28) 88%);-webkit-background-clip:text;background-clip:text;color:transparent}`.
- Image load: the image starts at opacity 0 and gets `.is-ok` on load (fade .6s). On error it removes itself, leaving the cover. In React use `onLoad` to add the class and `onError` to stop rendering the image.
- Badge (L2142-2149), placed on the chrome bar: `.wk-badge{position:absolute;right:10px;top:6px;z-index:2;display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 10px;border-radius:var(--r-pill);font-family:var(--font-mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;font-weight:500;background:var(--accent-soft);color:var(--brand-ink)}`; `.wk-badge .dot-live{width:6px;height:6px;background:#fff}`; `.wk-dot{width:6px;height:6px;border-radius:50%;background:var(--accent)}`; `.wk-badge--latest{background:var(--grad);color:#fff}`; `.wk-badge--feat{background:var(--ink);color:var(--bg)}`; `.wk-badge--feat .i{width:11px;height:11px;color:var(--mint)}`.
- Body (L2151-2178): `.wk-body{flex:1 1 auto;display:flex;flex-direction:column;gap:12px;padding:20px 14px 10px}`; `.wk-cell.is-p5 .wk-media{flex:1 0 auto}`; `.wk-cell.is-p5 .wk-body{flex:none}` (on desktop the 5 span card's image grows to match its 7 span neighbour); `.wk-meta{display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}`; `.wk-idx{color:var(--brand-ink)}`; `.wk-idx::after{content:"";display:inline-block;width:18px;height:1px;background:var(--line-strong);vertical-align:middle;margin-left:10px}`; `.wk-title{font-size:var(--fs-h3);font-weight:700;letter-spacing:-.025em}`; `.wk-desc{font-size:var(--fs-sm);line-height:1.65;color:var(--ink-2)}`; `.wk-tags{list-style:none;margin:2px 0 0;padding:0}`; `.wk-tags .tag{height:24px;font-size:.62rem}`; `.wk-actions{flex-wrap:wrap;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}`; `.wk-tags+.wk-actions{margin-top:auto}`; `.wk-body>.wk-tags{margin-bottom:6px}`.
- Live Preview: `.wk-live{white-space:nowrap;display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 18px;border-radius:var(--r-pill);background:var(--brand-soft);color:var(--brand-ink);border:1px solid var(--line);font-weight:600;font-size:.86rem;isolation:isolate;position:relative;overflow:hidden;transition:color .4s var(--ease-out),border-color .4s,box-shadow .5s var(--ease-out)}`; `::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--grad);opacity:0;transition:opacity .45s var(--ease-out)}`; `.i{width:15px;height:15px;transition:transform .45s var(--ease-out)}`; hover `color:#fff;border-color:transparent;box-shadow:var(--glow)`, `::before{opacity:1}`, `.i{transform:translate(2px,-2px)}`.
- Source and Closed: `.wk-src,.wk-closed{white-space:nowrap;display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 6px;font-size:.84rem;font-weight:600;border-radius:10px}`; `.wk-src{color:var(--ink-2);transition:color .3s}`; hover `color:var(--brand-ink)`; icons 16px; `.wk-closed{color:var(--muted);font-family:var(--font-mono);font-size:.66rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase}`; `.wk-closed .i{width:13px;height:13px}`.
- Featured (Echo AI): `.wk-card--feat{border-color:transparent;background:linear-gradient(var(--surface),var(--surface)) padding-box,var(--grad-glow) border-box;box-shadow:var(--shadow-md)}`; `.wk-card--feat .wk-title{font-size:clamp(1.4rem,2.1vw,1.85rem)}`; `.wk-cell.is-big .wk-title{font-size:clamp(1.3rem,1.9vw,1.7rem)}` (L2181-2183). In the All layout Echo AI is both, and the `.is-big` rule wins (more specific), so its title is `clamp(1.3rem,1.9vw,1.7rem)`. Under the React.js filter it is not big, so the feat size applies.
- Wide card (PureBody, or any lone result) (L2186-2192): `.wk-card--wide{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:8px;align-items:stretch}`; `.wk-card--wide .wk-body{justify-content:center;padding:clamp(20px,3vw,44px);gap:16px}`; `.wk-title{font-size:clamp(1.9rem,3.6vw,3.3rem);letter-spacing:-.045em;line-height:1}`; `.wk-title .serif{color:var(--brand-ink)}` ("Body" in italic serif, brand ink); `.wk-desc{font-size:var(--fs-body);max-width:46ch}`; `.wk-cover__ini{font-size:clamp(4rem,26cqw,13rem)}`; `[data-hero] .wk-card--wide{border-color:transparent;background:linear-gradient(var(--surface),var(--surface)) padding-box,linear-gradient(135deg,var(--line-strong),var(--line) 40%,var(--accent-soft)) border-box}`.

##### Card interactions
- Spotlight (core L4621-4624, CSS L165-170): pointermove anywhere writes `--mx`/`--my` (px, relative to the card) on the closest `[data-spotlight]`. `::before` shows `radial-gradient(420px circle at var(--mx) var(--my),var(--accent-soft),transparent 45%)` on hover. `[data-spotlight]>*{position:relative;z-index:1}`.
- Cursor light on the screen (L2394-2397): `#works .wk-screen::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .6s var(--ease-out);background:radial-gradient(340px circle at calc(var(--mx,50%) - 9px) calc(var(--my,50%) - 43px),rgba(255,255,255,.2),rgba(255,255,255,.05) 40%,transparent 65%)}`; `.wk-card:hover .wk-screen::after{opacity:1}`. The `- 9px` and `- 43px` convert card coordinates to screen coordinates (card padding and border, chrome height). Keep them.
- Tilt (core L4633-4635, `data-tilt="3"`): only fine pointer and no reduced motion. pointermove: `px=(clientX-r.left)/r.width-.5`, `py=(clientY-r.top)/r.height-.5`, inline `transform:perspective(900px) rotateX({-py*3}deg) rotateY({px*3}deg) translateY(-4px)` (2 decimals); pointerleave clears it. The `.card` transform transition (.6s `--ease-out`) smooths it.
- Hover also scales the image and cover to 1.04 (.9s).
- PureBody card: the Live Preview button opens the modal (11.5.9); every other Live Preview and Source link opens a new tab.

##### Screen wipe entrance (L2386-2393, reduced L2408-2410)
- `.js #works .wk-cell .wk-screen{clip-path:inset(0 0 100% 0);transition:clip-path 1.25s var(--ease-out);transition-delay:calc(var(--d,0ms) + 220ms)}`; `.js #works .wk-cell.is-in .wk-screen{clip-path:inset(0 0 0 0)}` (top down wipe after the cell reveals).
- `.js #works .wk-cell .wk-screen>.wk-cover,.js #works .wk-cell .wk-screen>img{scale:1.14;transition:opacity .6s var(--ease-out),transform .9s var(--ease-out),scale 1.7s var(--ease-out);transition-delay:0s,0s,calc(var(--d,0ms) + 220ms)}`; with `.is-in`: `scale:1`.
- Reduced motion: `clip-path:none` and `scale:1`.
- The cell itself reveals with `data-reveal` (up, blur) using the same `--d`.
- `#works .wk-card.wk-flash{animation:wk-flash 1.2s var(--ease-out) 2}` (L2398), see flash in 11.5.10.

##### Responsive (L2194-2216)
| Width | Change |
|---|---|
| 1023px and down | grid `repeat(2,minmax(0,1fr))`; cells `span 1`; `.is-wide` and `.is-odd` span 2; `.is-p5` media `flex:none`, body `flex:1 1 auto`; `.is-odd:not(.is-wide) .wk-card{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:8px}` with body `justify-content:center;padding:24px` |
| 700px and down | `.wk-card--wide` and the odd card go back to `display:flex;flex-direction:column`; wide body `padding:22px 14px 10px` |
| 639px and down | one column `minmax(0,1fr)`; all cells `grid-column:auto`; card radius 22px; media radius 16px; body (and wide body) `padding:18px 10px 6px`; `.wk-live,.wk-src,.wk-closed{height:44px}`; `.wk-url{max-width:calc(100% - 140px)}` |
- With All on a tablet: PureBody full row, then 12 cards two per row, then Live Search Weather full row as a side by side card (because it is `.is-odd`).

##### Empty state (HTML L3889-3893; CSS L2095-2099)
- `div.wk-empty#wk-empty[hidden]` > `<svg class="i" aria-hidden="true"><use href="#i-grid"/></svg>` + `p.wk-empty__t` "No projects found" + `p.wk-empty__d` "Try selecting a different category to see more projects."
- `.wk-sec .wk-empty{display:grid;justify-items:center;gap:6px;text-align:center;padding:64px 16px;border:1px dashed var(--line-strong);border-radius:var(--r-lg);color:var(--muted)}`; `[hidden]{display:none}`; `.i{width:28px;height:28px;color:var(--brand-ink);margin-bottom:8px}`; `.wk-empty__t{font-weight:700;color:var(--ink);font-size:1.05rem}`.
- Shown only when a filter has no match. With the current data every filter button has at least one project, so it never shows; keep it for data changes.

#### 11.5.6 Approvals hero: copy column (HTML L3900-3924 and L3934-3938; CSS L2414-2470, L2565-2615)

The structure mirrors the Works hero with `wk-aph__*` and `wk-ln*` class names. Only differences and values are listed; the `.wk-a` entrance helper and `.wk-cue` are the shared rules in 11.5.1.

##### Layout
- `header#wk-ap-hero` children: `div.wk-aph__bg[aria-hidden="true"] > span.wk-aph__halo` (L3901), `div.wrap.wk-aph__wrap` (L3903) with `div.wk-aph__copy` and `div.wk-deck#wk-deck`, then `div.wk-aph__foot > div.wrap > button.wk-cue` (L3934-3938).
- `#approvals .wk-hero--ap{--sp:0;padding-bottom:clamp(56px,9vh,110px)}` (L2420); at 1024px and up `padding-top:clamp(84px,12vh,150px);padding-bottom:clamp(84px,11vh,120px)` (L2427). No low height padding change (unlike Works).
- `.wk-aph__bg{position:absolute;inset:0;z-index:0;pointer-events:none}` (L2421).
- `.wk-aph__halo{position:absolute;right:-6%;top:10%;width:min(62vw,860px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--accent-soft),transparent 62%);transition:opacity 1.8s var(--ease-out),transform 2.2s var(--ease-out)}` (L2422-2423); before `.is-on`: `opacity:0;transform:scale(.85)` (L2424); under 639px `right:-40%;top:auto;bottom:0;width:130vw` (L2613).
- `.wk-aph__wrap{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(44px,8vw,72px);align-items:center}` (L2425); at 1024px and up `grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr);column-gap:clamp(28px,3.4vw,56px)` (L2428); 1024px to 1180px `minmax(0,1fr) minmax(0,1fr)` (L2591); under 639px `gap:36px` (L2604).
- `.wk-aph__copy{position:relative;container-type:inline-size;display:grid;justify-items:start}` (L2432).

##### Copy and entrance delays
| Element | Line | `--d` | Copy |
|---|---|---|---|
| `span.eyebrow.wk-a` | L3905 | 0ms | "Professional Certifications" |
| `span.wk-ln__in` row A | L3907 | 90ms | "My" + rule + meta "2023 `<i>&rarr;</i>` 2026" |
| `span.wk-ln__in` row B | L3908 | 180ms | `span.serif.grad-text` "Certifications" |
| `p.lead.wk-aph__lead.wk-a` | L3910 | 320ms | "Professional certifications and learning achievements in web development, cloud computing, and modern programming technologies that validate my expertise." |
| `div.wk-aph__ctas.wk-a` | L3911 | 400ms | two CTAs |
| `div.wk-aph__stat.wk-a` x3 | L3916-3918 | 480ms / 540ms / 600ms | "Certifications" 6+, "Learning Hours" 200+, "Video Tutorials" 15+ |
| `div.wk-aph__iss.wk-a` | L3920 | 680ms | issuers line |
| `button.wk-cue.wk-a` | L3936 | 760ms | "Scroll to explore" |

- Title `h1.wk-aph__title#wk-ap-title`: row A `span.wk-ln.wk-ln--a` > `span.wk-ln__in[style="--d:90ms"]` "My" + `span.wk-ln__rule[aria-hidden="true"]` + `span.wk-ln__meta[aria-hidden="true"]`; row B `span.wk-ln.wk-ln--b` > `span.wk-ln__in[style="--d:180ms"]` > `span.serif.grad-text` "Certifications".
- Title CSS (L2434-2442) equals the Works title with these values: `.wk-aph__title{width:100%;margin-top:clamp(16px,2.6vh,26px);color:var(--ink);font-weight:800;letter-spacing:-.05em}`; `.wk-ln{display:block;overflow:hidden}`; `.wk-ln__in{display:inline-block;will-change:transform}`; `.wk-ln--a{display:flex;align-items:center;gap:.28em;font-size:clamp(2.1rem,min(13.1cqw,8.2vh),4.7rem);line-height:1.02;padding:0 0 .1em;margin-bottom:-.1em}`; `.wk-ln__rule{flex:1;height:1px;margin-top:.1em;background:linear-gradient(90deg,var(--line-strong),var(--line));transform-origin:0 50%}`; `.wk-ln__meta{flex:none;margin-top:.1em;font-family:var(--font-mono);font-size:var(--fs-label);font-weight:500;letter-spacing:.16em;color:var(--muted);white-space:nowrap}`; `.wk-ln__meta i{font-style:normal;color:var(--accent);margin:0 .2em}`; `.wk-ln--b{font-size:clamp(3.4rem,min(22.6cqw,17.5vh),9.6rem);line-height:.92;padding:0 .12em .16em 0;margin:-.02em 0 -.14em -.04em;white-space:nowrap}` (note 3.4rem and 22.6cqw, not the Works 3.6rem and 25cqw); `.wk-ln--b .serif{font-weight:400;letter-spacing:-.03em;padding-right:.06em}`.
- Under 639px: `.wk-ln--a{font-size:clamp(2rem,11vw,2.9rem)}`, `.wk-ln--b{font-size:clamp(2.6rem,21.4cqw,5.6rem)}` (L2605-2606).
- Title entrance (L2566-2573): same as Works. Before `.is-on`: `.wk-ln__in{transform:translate3d(0,112%,0)}`, `.wk-ln__rule{transform:scaleX(0)}`, `.wk-ln__meta{opacity:0;transform:translate3d(-8px,0,0)}`. With `.is-on`: `.wk-ln__in` `transition:transform 1.1s var(--ease-out) var(--d,0ms)`; rule `transform 1.2s var(--ease-out) .42s`; meta `opacity .8s var(--ease-out) .7s,transform .9s var(--ease-out) .7s`.
- Lead: `.wk-aph__lead{margin-top:clamp(18px,3vh,30px);max-width:36em;color:var(--ink-2)}` (L2443; no `text-wrap` here).
- CTAs (L3911-3914): `.wk-aph__ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(22px,3.6vh,36px)}` (L2444).
  - `<button type="button" class="btn btn--primary" data-wk-cue="wk-ap-toolbar" data-magnetic>` icon `i-award`, text "Browse certificates". Scrolls to `#wk-ap-toolbar`.
  - `<a class="btn btn--ghost wk-aph__cv" href="https://faisalhanif.work/imgs/Faisal-CVS.pdf" download>` icon `i-download`, text "Download CV". JS rewrites `href` to `FH.asset('imgs/Faisal-CVS.pdf')` (L7573), the same URL today. In the rebuild point it at the local CV path used by the rest of the site. Hover: `.wk-aph__cv .i{transition:transform var(--dur-2) var(--ease-out)}`, `.wk-aph__cv:hover .i{transform:translateY(2px)}` (down, while the Works Book icon moves up) (L2445-2446).
  - 1024px to 1180px: `gap:10px`, `.btn{padding:0 20px}` (L2592-2593). Under 639px: `width:100%`, `.btn{flex:1 1 auto}` (L2607-2608).
- Stats (L3915-3919): `dl.wk-aph__stats` > `div.wk-aph__stat.wk-a` with `dt` "Certifications" / `dd` `<span data-wk-to="6">6</span><i>+</i>`; `dt` "Learning Hours" / `<span data-wk-to="200">200</span><i>+</i>`; `dt` "Video Tutorials" / `<span data-wk-to="15">15</span><i>+</i>`. CSS L2448-2454 is identical to the Works stats with `wk-aph__` names. Low height desktop: `.wk-aph__stats{margin-top:22px}`, `dd{font-size:2rem}` (L2585-2586). 1024px to 1180px: `padding-inline:12px`, first child `padding-left:0`, `dt{font-size:.6rem;letter-spacing:.1em}` (L2594-2596). Under 639px: `width:100%`, stat `padding:14px 10px 0`, `dt{font-size:.58rem;letter-spacing:.1em}` (L2609-2611). The stat says 6+ while the data has 7 certificates; copy the stat as is.
- Issuers (L3920-3923): `div.wk-aph__iss.wk-a` > `span.wk-aph__stack[aria-hidden="true"]` with `<i class="wk-im wk-im--a">A</i><i class="wk-im">G</i><i class="wk-im">M</i><i class="wk-im wk-im--sm">IBM</i><i class="wk-im wk-im--sm">aws</i>` + `p.wk-aph__isst` "Issued by `<b>Anthropic, Google, Meta, IBM</b>` and `<b>AWS</b>`".
  - CSS (L2457-2464): `.wk-aph__iss{display:flex;align-items:center;gap:14px;margin-top:clamp(20px,3.4vh,32px)}` (low height `margin-top:16px` L2587; under 639px `align-items:flex-start` L2612); `.wk-aph__stack{display:flex;flex:none;padding-left:6px}`; `.wk-im{display:grid;place-items:center;width:32px;height:32px;margin-left:-8px;border-radius:50%;background:var(--surface);color:var(--brand-ink);font-style:normal;font-weight:800;font-size:.8rem;letter-spacing:-.03em;box-shadow:0 0 0 2px var(--bg),inset 0 0 0 1px var(--line-strong)}`; `.wk-im--sm{font-size:.52rem;letter-spacing:.02em}`; `.wk-im--a{background:var(--grad);color:#fff;font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:1.1rem;box-shadow:0 0 0 2px var(--bg)}`; `.wk-aph__isst{font-size:.84rem;line-height:1.45;color:var(--muted)}`; `.wk-aph__isst b{font-weight:600;color:var(--ink-2)}`.
- Foot cue (L3934-3938): `button.wk-cue.wk-a[style="--d:760ms"][data-wk-cue="wk-ap-toolbar"]`, "Scroll to explore". `.wk-aph__foot` rules L2467-2469 equal the Works foot (absolute at the bottom at 1024px and up with `opacity:calc(1 - var(--sp) * 3)`, hidden under 1023px); hidden on desktop low height (L2584).
- Scroll exit of the copy at 1024px and up: `.wk-aph__copy{translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)}` (L2579).


#### 11.5.7 Approvals hero: the deck, "the certificate fan" (HTML L3926-3931; CSS L2471-2563, L2569-2570, L2574-2575, L2580-2584, L2599-2601, L2614-2624; JS L7411-7583)

##### Markup (L3926-3931)
- `div.wk-deck#wk-deck` > `div.wk-deck__stage` > `div.wk-deck__tilt#wk-deck-stage[role="group"][aria-label="Certificate deck. Choose one to jump to it."]` (empty in HTML, filled by JS) + `p.wk-deck__cap` > `span.wk-deck__n` "07" + `span` "Certificates, newest on top. Pick one to jump to it.".
- The "07" in the caption is hard coded text (the Works seal number is computed, this one is not).
- JS fills `#wk-deck-stage` once at script start (L7439): first a hidden SVG with the guilloche symbol, then 7 `button.wk-dk` cards.

##### Stage, sizing and the bleed maths (CSS L2472-2476; JS `setMode` L7472-7480)
- `.wk-deck{position:relative;width:100%;min-width:0;container-type:inline-size;justify-self:end}` (L2472). It is the size container for the stage (`cqw`) and for `@container (max-width:520px)` (L2616).
- At 1024px and up: `width:min(100% + var(--wk-bleed,0px),calc((100svh - 190px) * 1.45));margin-right:calc(-1 * var(--wk-bleed,0px))` (L2473).
- At 1200px and up: `--wk-bleed:clamp(0px,calc((100vw - 1200px) * .25),64px)` (L2474). So 0 at 1200px, 0.25px per viewport px, capped at 64px from 1456px. Examples: 1280px gives 20px, 1300px gives 25px, 1344px gives 36px, 1400px gives 50px, 1456px and wider give 64px. The Works stage uses a different curve (`* .2`, cap 40px, 11.5.2). Keep both.
- Where the bleed lands: with the 104px rail (`.site{padding-left:var(--rail-w)}` L115, `--rail-w:104px` L60) and `.wrap{max-width:1240px;padding-inline:var(--gutter)}` (L113; `--gutter` is 48px at these widths), the space right of the wrap content is 48px up to a 1344px viewport and grows after that (the wrap centres). The bleed is always smaller (36px at 1344px, 64px when the space is 104px at 1456px), so the deck pushes into the wrap padding but never reaches the viewport edge.
- 640px to 1023px: `width:min(100%,640px);justify-self:center` (L2600). Under 640px: full column width.
- `.wk-deck__stage{position:relative;font-size:calc(100cqw / var(--wk-sw,70));width:calc(var(--wk-sw,70) * 1em);height:var(--wk-sh,46em);perspective:2600px;perspective-origin:60% 40%}` (L2475). The CSS fallbacks (70, 46em) only apply before JS runs.
- `.wk-deck__tilt{position:absolute;inset:0;pointer-events:none;transform-style:preserve-3d;transform:rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg))}` (L2476).
- JS `setMode()` picks mode `m` when `innerWidth<640`, else `d`, and does nothing if the mode did not change. It computes the bounding box of the 7 resting cards (`fanBox`, L7466-7471: every corner of every card rotated about the pivot by `thf-(N-1-j)*A` degrees) and writes on `.wk-deck__stage` (inline): `--wk-sw` (unitless, 2 decimals), `--wk-sh` (em, 2 decimals), `--spw`, `--cw`, `--ch`; and on every card `style.transformOrigin = PX+'em '+(CH+D)+'em'` ("38em 72em" in both modes).
- Values the JS produces (checked by running the code):

| Mode | `--wk-sw` | `--wk-sh` | `G.x` (em) | `G.y` (em) | `--spw` | `--cw` | `--ch` |
|---|---|---|---|---|---|---|---|
| `d` (640px and up) | 67.02 | 50.85em | 23.114 | 6.380 | 4.4em | 40em | 27em |
| `m` (under 640px) | 59.51 | 42.88em | 16.051 | 4.852 | 3em | 40em | 27em |

- So 1em = deck width / 67.02 (desktop and tablet) or / 59.51 (phone), and the stage height is 50.85em or 42.88em. Everything inside is in em and scales as one object.
- `MODES` (L7461-7464), copy exactly:
  - `d:{CW:40,CH:27,PX:38,D:45,A:3.6,spw:4.4,thf:1.2,top:5.6,bot:1.4,right:2.4}`
  - `m:{CW:40,CH:27,PX:38,D:45,A:2.4,spw:3,thf:1,top:4.2,bot:1,right:2.2}`
  - CW, CH card size; PX pivot x inside the card; D pivot distance below the card's bottom edge (pivot y = CH + D = 72em); A degrees between cards; thf top card base angle; top, bot, right stage margins in em; `G.x = .4 - box.x0`, `G.y = top - box.y0`; `sw = (x1-x0) + .4 + right`, `sh = (y1-y0) + top + bot`.

##### Card order and depth (L7436-7458)
- `order` = certificate indexes reversed (6 to 0). Card `j` (0 = back, 6 = top) shows certificate `ci = 6 - j`. The top card (`j=6`) is certificate 01, "Claude Code in Action".
- The HTML string is built for j = 0..6 and then `.reverse()`d, so DOM and tab order is newest first: 01 Claude Code in Action, 02 Claude 101, 03 Frontend, 04 React, 05 Full Stack, 06 AWS, 07 React Native. The guilloche SVG comes before all the buttons.
- `dks` (the JS list) is sorted by `data-j` ascending (back to top).
- Paint order comes from depth, not DOM order: each card gets `translate3d(..,..,z px)` with `z = j*4` (0 to 24px), plus 3px for the hovered card, inside the `preserve-3d` tilt. Keep real 3D; do not swap to `z-index`.

| `j` | `data-ci` | Certificate | Classes | Spine category | Face "No." |
|---|---|---|---|---|---|
| 6 (top) | 0 | Claude Code in Action | `wk-dk wk-dk--ai wk-dk--top` | AI | No. 01 |
| 5 | 1 | Claude 101 | `wk-dk wk-dk--ai` | AI | No. 02 |
| 4 | 2 | Frontend Web Development Professional Certificate | `wk-dk wk-dk--frontend` | Frontend | No. 03 |
| 3 | 3 | React Front-End Developer Professional Certificate | `wk-dk wk-dk--frontend` | Frontend | No. 04 |
| 2 | 4 | Full Stack Web Development Professional Certificate | `wk-dk wk-dk--web` | Backend | No. 05 |
| 1 | 5 | AWS Cloud & Data Analytics Professional Certificate | `wk-dk wk-dk--cloud` | Cloud | No. 06 |
| 0 (back) | 6 | Meta React Native Mobile Development Certificate | `wk-dk wk-dk--mobile` | Mobile | No. 07 |

##### Card template (JS L7434, L7441-7456), exact output for card `j` showing certificate `c = CERTS[ci]`
```html
<button type="button" class="wk-dk wk-dk--{c.k}[ wk-dk--top]" data-ci="{ci}" data-j="{j}">
  <span class="wk-dk__paper" aria-hidden="true">
    <span class="wk-dk__spine">
      {mono}
      <span class="wk-dk__iss">{c.iss}</span>
      <span class="wk-dk__cat">{CAT_LBL[c.k]}</span>
      <span class="wk-dk__yr">{c.y}</span>
    </span>
    <span class="wk-dk__face">
      <span class="wk-dk__g"><svg viewBox="0 0 100 100"><use href="#wk-guil"/></svg></span>
      <span class="wk-dk__head">{mono}<span class="wk-dk__who">{c.iss}</span>[<span class="wk-dk__medal">{icon award}</span> only when NOT top]</span>
      <span class="wk-dk__kind">{c.type}<span>No. {pad(ci+1)}</span></span>
      <span class="wk-dk__t">{c.t}</span>
      <span class="wk-dk__to">Awarded to<b>Faisal Hanif</b></span>
      <span class="wk-dk__foot">
        <span class="wk-dk__line wk-dk__line--sig"><b>{c.iss}</b><span>Issued by</span></span>
        <span class="wk-dk__line wk-dk__line--yr"><b>{c.y}</b><span>Year</span></span>
        <span class="wk-dk__ok">{icon check-circle}Verified</span>
      </span>
    </span>
  </span>
  [top only: the seal, below]
  <span class="sr-only">{c.t}, {c.iss}, {c.y}. Jump to this certificate.</span>
</button>
```
- `{mono}` (L7434) = `<span class="wk-dk__mono[ wk-dk__mono--a if iss==='Anthropic'][ wk-dk__mono--sm if mono.length>1]"><b>{c.mono}</b></span>`. So Anthropic gets `--a` ("A" on the gradient), IBM and AWS get `--sm` ("IBM", "aws").
- `CAT_LBL` (L7420): `{ai:'AI',frontend:'Frontend',web:'Backend',cloud:'Cloud',mobile:'Mobile'}`.
- `icon(id)` renders `<svg class="i" aria-hidden="true"><use href="#i-{id}"/></svg>` (L6943).
- The whole paper is `aria-hidden`, so each button's accessible name is only the sr-only line, for example "Claude Code in Action, Anthropic, 2026. Jump to this certificate."
- "Awarded to" and "Faisal Hanif" have no space between them in the markup; the gap is `margin-left:.25em` on the `<b>` (L2538). Keep the markup and the margin.

##### Card CSS (L2479-2547)
- `.wk-dk{--cat:var(--brand);position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;width:var(--cw,34em);height:var(--ch,23em);padding:0;border-radius:1.1em;text-align:left;color:var(--ink-2);will-change:transform}` (L2479-2480). No CSS transition on the card: JS writes `transform` every frame.
- `.wk-dk:focus-visible{outline:none}` (L2483).
- Category colour `--cat` (L2484-2488): `--ai` `var(--accent)`; `--frontend` `var(--mint)`; `--web` `var(--brand)`; `--cloud` `color-mix(in srgb,var(--accent) 45%,var(--brand-900))`; `--mobile` `color-mix(in srgb,var(--mint) 55%,var(--brand))`.
- Paper (L2489-2492): `.wk-dk__paper{position:absolute;inset:0;display:flex;border-radius:inherit;overflow:hidden;background:linear-gradient(160deg,var(--surface) 0%,var(--surface-2) 100%);border:1px solid var(--line-strong);box-shadow:-.5em 0 1.4em -.9em rgba(8,48,42,.32),0 .2em .6em rgba(8,48,42,.05),0 2.2em 4.4em -2em rgba(8,48,42,.3);transition:box-shadow .6s var(--ease-out),border-color .5s}`; dark: `box-shadow:-.6em 0 1.6em -.8em rgba(0,0,0,.7),0 .2em .6em rgba(0,0,0,.35),0 2.4em 4.8em -1.8em rgba(0,0,0,.85)` (L2493).
- Hot or focused (L2494-2497): `border-color:color-mix(in srgb,var(--accent) 55%,transparent);box-shadow:-.5em 0 1.4em -.9em rgba(8,48,42,.32),0 .4em 1em rgba(8,48,42,.06),0 3.2em 6em -2.2em rgba(8,48,42,.42)`; dark: `box-shadow:-.6em 0 1.6em -.8em rgba(0,0,0,.7),0 3.4em 6.4em -2em rgba(0,0,0,.95),0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent)`; then `.wk-dk:focus-visible .wk-dk__paper{box-shadow:0 0 0 .25em var(--accent),0 2.2em 4.4em -2em rgba(8,48,42,.3)}` (L2497). In light theme L2497 wins for focus (same specificity, later). In dark theme L2496 has higher specificity (`[data-theme="dark"]`), so the dark focus ring is only the 1px accent line. Copy the selectors as they are.
- Spine (L2500-2511): `.wk-dk__spine{position:relative;flex:none;width:var(--spw,4.4em);display:flex;flex-direction:column;align-items:center;gap:1em;padding:1.4em 0 1.3em;background:linear-gradient(180deg,var(--surface-3),var(--surface-2));border-right:1px solid var(--line)}`; `::before{content:"";position:absolute;left:0;top:0;bottom:0;width:.3em;background:var(--cat);opacity:.9}` (AI cards: `background:var(--grad-glow)`, L2503); `.wk-dk__mono{flex:none;display:grid;place-items:center;width:2.7em;height:2.7em;border-radius:.8em;background:var(--surface);border:1px solid var(--line-strong);color:var(--brand-ink)}`; `.wk-dk__mono b{font-size:1.15em;font-weight:800;letter-spacing:-.04em;line-height:1}`; `.wk-dk__mono--sm b{font-size:.62em;letter-spacing:.02em}`; `.wk-dk__mono--a{background:var(--grad);border-color:transparent;color:#fff}`; `.wk-dk__mono--a b{font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:1.5em;letter-spacing:0}`; `.wk-dk__iss{flex:1;min-height:0;writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--font-serif);font-style:italic;font-size:2em;line-height:1;color:var(--ink);white-space:nowrap;overflow:hidden}` (reads bottom to top); `.wk-dk__cat{flex:none;writing-mode:vertical-rl;transform:rotate(180deg);font-family:var(--font-mono);font-size:.74em;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--brand-ink);white-space:nowrap}`; `.wk-dk__yr{flex:none;padding-top:.8em;border-top:1px solid var(--line-strong);font-family:var(--font-mono);font-size:.74em;letter-spacing:.04em;color:var(--muted)}`.
- Face (L2514-2547): `.wk-dk__face{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;padding:2.7em 3em 2.5em;overflow:hidden}`; double frame `::before{inset:1em;border:1px solid var(--line-strong)}`, `::after{inset:1.4em;border:1px solid var(--line)}` (both `content:"";position:absolute;pointer-events:none;border-radius:.45em`); guilloche corner `.wk-dk__g{position:absolute;right:-7em;bottom:-8.5em;width:25em;height:25em;color:var(--brand);opacity:.22;pointer-events:none}` (dark: `color:var(--accent);opacity:.16`, L2519); `.wk-dk__g>svg,.wk-dk__seal>svg{display:block;width:100%;height:100%;overflow:visible}`; `.wk-guil path{fill:none;stroke:currentColor;stroke-width:.6}`.
  - Head: `.wk-dk__head{position:relative;display:flex;align-items:center;gap:.9em}`; in the head the mono is bigger: `width:3.3em;height:3.3em;border-radius:.95em`, `b{font-size:1.3em}`, `--sm b{font-size:.78em}`, `--a b{font-size:1.75em}`, `--a{box-shadow:var(--glow)}` (L2523-2527); `.wk-dk__who{font-family:var(--font-serif);font-style:italic;font-size:2.5em;line-height:1;color:var(--ink);white-space:nowrap}`; `.wk-dk__medal{margin-left:auto;flex:none;display:grid;place-items:center;width:3em;height:3em;border-radius:50%;background:var(--grad);color:#fff;box-shadow:0 0 0 .2em var(--surface),0 0 0 .28em var(--line-strong)}`; `.wk-dk__medal .i{width:1.4em;height:1.4em}`.
  - Kind line: `.wk-dk__kind{position:relative;display:flex;align-items:center;gap:.9em;margin-top:2.3em;font-family:var(--font-mono);font-size:.84em;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--brand-ink);white-space:nowrap}`; `::before{content:"";width:2.4em;height:1px;background:currentColor;opacity:.5}`; `.wk-dk__kind span{margin-left:auto;color:var(--muted);letter-spacing:.14em}`.
  - Title: `.wk-dk__t{position:relative;margin-top:.4em;font-size:3.05em;font-weight:800;letter-spacing:-.04em;line-height:1.04;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-bottom:.04em}` (two lines max, long titles are clipped with an ellipsis).
  - `.wk-dk__to{position:relative;margin-top:1em;font-size:1.02em;color:var(--muted);white-space:nowrap}`; `.wk-dk__to b{font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:1.45em;color:var(--ink-2);margin-left:.25em}`.
  - Foot: `.wk-dk__foot{position:relative;display:flex;align-items:flex-end;gap:2.4em;margin-top:auto}`; `.wk-dk__line{display:grid;gap:.55em;min-width:0}`; `.wk-dk__line b{display:block;padding:0 .1em .25em;border-bottom:1px solid var(--line-strong);font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:1.75em;line-height:1;color:var(--ink);white-space:nowrap}`; `.wk-dk__line--sig b{min-width:6.6em}`; `.wk-dk__line--yr b{font-family:var(--font-mono);font-style:normal;font-size:1.1em;letter-spacing:.08em;padding-bottom:.5em;min-width:5em}`; `.wk-dk__line span{font-family:var(--font-mono);font-size:.7em;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}`; `.wk-dk__ok{margin-left:auto;flex:none;display:inline-flex;align-items:center;gap:.5em;height:2.3em;padding:0 1em 0 .65em;border-radius:99em;background:var(--accent-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.76em;font-weight:500;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}`; `.wk-dk__ok .i{width:1.5em;height:1.5em;color:var(--accent)}`.
- Narrow deck, `@container (max-width:520px)` on `.wk-deck` (L2616-2621): hide `.wk-dk__to`, `.wk-dk__line span`, `.wk-dk__kind span`, `.wk-dk__cat`, `.wk-dk__yr`; `.wk-dk__kind{font-size:1.05em;letter-spacing:.16em}`; `.wk-dk__ok{font-size:1em}`; `.wk-dk__t{font-size:3.4em}`. This applies to every deck 520px wide or less (all phones and narrow tablets), not only under 640px.
- `.is-dealt` (added by JS when a card reaches the fan) and `.wk-dk--top` have no CSS rules. They are state hooks only.

##### Guilloche symbol (JS L7423-7428; CSS L2518-2521)
- Built once: `gp(r0,amp,n,ph)` returns one closed path of 361 points (`i` 0 to 360, `t=i/360*2π`, `r=r0+amp*sin(n*t+ph)`, point `(r*cos t, r*sin t)` with `toFixed(2)`, first `M` then `L`, ending `Z`).
- Rings: 10 paths `gp(40,5.5,11,k*π/10)` for k 0 to 9; 8 paths `gp(25,3.6,15,k*π/8)` for k 0 to 7; 6 paths `gp(12,2,9,k*π/6)` for k 0 to 5. 24 paths in total, about 107 KB of path data.
- Wrapped as `<svg class="wk-guil-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;overflow:hidden"><defs><symbol id="wk-guil" class="wk-guil" viewBox="-50 -50 100 100">...paths with vector-effect="non-scaling-stroke"...</symbol></defs></svg>`.
- Used 8 times with `<use href="#wk-guil"/>`: once per card face (`.wk-dk__g`, `viewBox="0 0 100 100"`) and once inside the seal.
- Port: generate the path strings in the browser (a `useMemo` in the deck component or a module level constant built on first client render). Do not ship the 107 KB of numbers in the server HTML. The symbol id must stay unique.

##### The seal on the top card (JS L7429-7433; CSS L2549-2559)
Rendered only inside the top card, after the paper:
```html
<span class="wk-dk__seal" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="wk-seal-p" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs><circle class="wk-seal__o" cx="60" cy="60" r="57"/><circle class="wk-seal__r" cx="60" cy="60" r="37"/><text class="wk-seal__txt"><textPath href="#wk-seal-p" textLength="280">VERIFIED CREDENTIALS · 2023 - 2026 ·</textPath></text><circle class="wk-seal__in" cx="60" cy="60" r="31.5"/><svg class="wk-seal__g" x="29" y="29" width="62" height="62" viewBox="0 0 100 100"><use href="#wk-guil"/></svg><path class="wk-seal__ck" d="M47.5 61 l8.5 8.5 l17 -18.5"/></svg></span>
```
- Differences from the Works seal (11.5.2): inner ring `r="37"` (Works 36), centre disc `r="31.5"` (Works 31), a guilloche and a check mark instead of a number and label, classes `wk-seal__*` (Works `wk-sks__*`).
- `.wk-dk__seal{position:absolute;right:-2.7em;top:-3.6em;width:10.4em;height:10.4em;border-radius:50%;pointer-events:none;transform:rotate(-12deg);filter:drop-shadow(0 .7em 1.2em rgba(8,48,42,.2))}` (L2550-2551); dark `filter:drop-shadow(0 .8em 1.4em rgba(0,0,0,.6))` (L2552). It overhangs the card's top right corner.
- `.wk-seal__o{fill:var(--surface);stroke:var(--line-strong);stroke-width:1}`; `.wk-seal__r{fill:none;stroke:var(--line);stroke-width:1}`; `.wk-seal__txt{font-family:var(--font-mono);font-size:8.4px;font-weight:500;letter-spacing:1px;fill:var(--brand-ink)}`; `.wk-seal__in{fill:var(--brand)}` (dark `fill:#0f7a64`); `.wk-seal__g{color:#fff;opacity:.28}`; `.wk-seal__ck{fill:none;stroke:#fff;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}` (L2553-2559).
- Entrance: before `.is-on` `opacity:0;transform:rotate(-48deg) scale(1.3)` (L2569); with `.is-on` `transition:opacity .6s var(--ease-out) 1.05s,transform 1.1s var(--ease-out) 1.05s` (L2574). No hover fade (unlike the Works seal).
- `id="wk-seal-p"` must be unique in the document; use a stable React id.

##### Caption (HTML L3930; CSS L2562-2563)
- `.wk-deck__cap{display:flex;align-items:center;gap:12px;margin:clamp(4px,1vh,12px) 0 0 2cqw;font-size:.88rem;line-height:1.4;color:var(--muted)}`; `.wk-deck__n{flex:none;display:inline-grid;place-items:center;height:28px;padding:0 10px;border-radius:99px;background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-mono);font-size:.72rem;letter-spacing:.1em}`.
- Entrance: before `.is-on` `opacity:0;transform:translate3d(0,8px,0)` (L2570); with `.is-on` `transition:opacity .8s var(--ease-out) 1.15s,transform .9s var(--ease-out) 1.15s` (L2575).
- At 1024px and up: `opacity:calc(1 - var(--sp) * 1.8)` (L2581). Hidden on desktop with height 800px or less (L2584). Under 639px `font-size:.82rem` (L2614). One text only (no phone variant, unlike Works).

##### Fan geometry per frame (JS `targets` L7485-7502, `paint` L7503-7508)
- Each card has state `{r, l, z}` (angle deg, radial lift em, depth px) and targets `{tr, tl, tz}`. Start values `{r:0,l:-5,z:0}`, then snapped at init.
- `T = (N-1)*A` (21.6deg desktop, 14.4deg phone). `s = Math.max(spread, sp*.6)`. `Tt = T*(1 + .08*s + (a card other than the top one is hovered ? .1 : 0))`.
- Gaps: when `hov` is 0 to 5, `big = Math.min(Tt*.52, 13)`, `gaps[hov] = big`, every other gap `(Tt-big)/(N-2)`. Otherwise all gaps `Tt/(N-1)`. `gaps[j-1]` is the gap between card `j` and card `j-1`, so hovering card `h` opens the gap between it and the card in front of it (`h+1`): the hovered card and all cards behind it swing away and its face shows.
- `face = thf + (Tt-T)*.3 + amb*sin(t/19*2π)*.45` where `t` = seconds since script start and `amb` = 0 with reduced motion, else 1. Cards are placed from the top down: card 6 at `face`, each next one `gap` degrees lower.
- `tz = j*4 + (j===hov ? 3 : 0)`.
- After dealing: `tr = a + amb*sin(t/15*2π + j*.9)*.3`; `tl = amb*sin(t/12*2π + j*1.3)*.28 + (j===hov ? 1.7 : 0)`.
- `paint(k)`: `r += (tr-r)*k`, same for `l` and `z`; writes `transform = 'translate3d('+G.x.toFixed(3)+'em,'+G.y.toFixed(3)+'em,'+z.toFixed(1)+'px) rotate('+r.toFixed(3)+'deg) translate3d(0,'+(-l).toFixed(3)+'em,0)'` inline on each `.wk-dk`. The last translate runs along the rotated card, so the lift is radial (away from the pivot).
- Smoothing: `k = 1 - Math.pow(1 - rate, dt/16.67)` with `dt = Math.min(50, now - last)`; `rate` = .12 until `busyUntil` (deal plus 1300ms) and inside `nudge`, else .085. `snap()` = targets then `paint(1)`.
- Resting angles (no hover, no ambient), checked by running the code: desktop card 6 to 0 = 1.2, -2.4, -6.0, -9.6, -13.2, -16.8, -20.4 deg; phone = 1.0, -1.4, -3.8, -6.2, -8.6, -11.0, -13.4 deg.
- Example, desktop, mouse on card 3 (spread 1): 2.366, -0.131, -2.629, -15.629, -18.126, -20.624, -23.122 deg (13deg gap under card 4). Mouse on the top card (spread 1, `hov` 6, so no big gap; the top card still lifts 1.7em): 1.718, -2.170, -6.058, -9.946, -13.834, -17.722, -21.610 deg.

##### Deal in, the entrance (JS `enter` L7578-7579, `targets` L7496-7498; CSS L2481-2482, L2569-2570, L2574-2575)
- Before `.is-on` the whole tilt layer is hidden: `.js #approvals .wk-hero--ap:not(.is-on) .wk-deck__tilt{opacity:0}` (L2481). With `.is-on`: `transition:opacity .6s var(--ease-out) .08s` (L2482).
- `reset()` sets `dealAt = Infinity` and snaps, so every card waits at `tr = thf+5` (6.2deg desktop, 6deg phone) and `tl = -8` (8em lower than its place).
- `enter()`: `setMode()`, `dealAt = now + 60`, `busyUntil = dealAt + 1300`, `heroScroll()`, `nudge()`, and `settled` (plus the class `.is-settled` on the hero, which has no CSS) after 1300ms.
- Timeline after `.is-on` (ms): 60 the stack rises as one to `tr = thf`, `tl = 0` (the top card goes straight to its fan place); then card `j` (0 to 5) leaves the stack at `dealAt + 280 + j*65`: back card at 340, then 405, 470, 535, 600, 665. Each gets `.is-dealt` as it goes. The seal turns in at 1050, the caption at 1150, hover is allowed from 1300, fast smoothing ends at 1360.
- Class timing on the hero: `.is-on` at enter, `.is-settled` at +1300ms (Works uses 1400ms and also has `.is-live`; the deck has no `.is-live` or `.is-idle`, its motion is all JS).

##### Hover, focus and spread (JS L7523-7543)
- `setHot(j)`: `hov = j`; toggles `.is-hot` on card `j` only; `snap()` with reduced motion, else `nudge()`.
- Card `pointerenter` with `pointerType==='mouse'` and `settled` sets it hot. Card `pointerleave` (mouse) clears it if it is the hot one. `focus` sets hot (no settle check); `blur` clears if it is the hot one. Unlike the Works stage, leaving a card clears at once.
- `#wk-deck-stage` `pointerenter` (mouse and settled) sets `spread = 1`; `pointerleave` sets `spread = 0`; both call `nudge()`. The tilt layer itself has `pointer-events:none`, but boundary events still reach it when the pointer enters a card inside it, so the fan widens by 8% whenever the mouse is over any card.
- Touch never sets hot or spread. A tap goes straight to the click.

##### Ambient float (JS `targets`)
- Always on while the loop runs (`amb = 1`): the whole fan sways `±.45deg` over 19s; each card sways `±.3deg` over 15s (phase `j*.9`) and lifts `±.28em` over 12s (phase `j*1.3`). All sine waves, no CSS keyframes.
- The loop runs only while the hero is active (`run: setRun`, see the page hero controller in 11.5.10: entered, in view, current page, tab visible). Paused otherwise.

##### Deck tilt toward the cursor (JS L7544-7557)
- Only when `FH.fine` and not reduced motion. `pointermove` on `#wk-ap-hero` (passive), ignored unless `settled` and `innerWidth>=1024`.
- `r = #wk-deck rect`; `px=(clientX-(r.left+r.width/2))/Math.max(1,innerWidth/2)`; `py=(clientY-(r.top+r.height/2))/Math.max(1,innerHeight/2)`; `gy=clamp(px,-1,1)*6`; `gx=clamp(py,-1,1)*-4.5` (Works uses 5 and -3.5).
- rAF loop: `tx+=(gx-tx)*.07; ty+=(gy-ty)*.07`; writes `--tx`/`--ty` (`toFixed(3)+'deg'`) on `#wk-deck-stage`; stops when both gaps are .01 or less. `pointerleave` on the hero sends both targets to 0.

##### Jump to a certificate (JS L7531-7540)
- Click on card: `ci = +data-ci`, `cc = ccells[ci]` (the rail cell). If `cc.hidden` (filtered out): `cFilter.set('all')` and wait 650ms.
- Then at the same moment: `FH.scrollToEl(#wk-ap-toolbar)` (page scroll, offset 84px under 1024px, 32px otherwise) and `rail.scrollTo({left: rail.scrollLeft + cc.rect.left - rail.rect.left - scrollPaddingLeft, behavior: FH.reduce ? 'auto' : 'smooth'})` (puts the card at the rail's left snap line).
- 950ms later `flash(cc.firstChild)` (the `article.wk-cert`; Works waits 900ms). Flash in 11.5.10.

##### Scroll-linked exit (JS L7559-7568; CSS L2577-2582, L2468)
- Same formula as Works (11.5.2): window `scroll` (passive) schedules one rAF; returns unless `FH.current==='approvals'` and not reduced motion; `p = clamp((innerHeight - heroRect.bottom)/Math.max(1,innerHeight*.8), 0, 1)`, then `p = p*p*(3-2*p)`; skip changes under .001; writes `--sp` (`toFixed(4)`) on `#wk-ap-hero`.
- It also sets the JS `sp = innerWidth>=1024 ? p : 0` and calls `nudge()`, so on desktop the fan widens up to 4.8% (`.08 * .6`) as you scroll away.
- CSS at 1024px and up: `.wk-aph__copy{translate:0 calc(var(--sp) * -70px);opacity:calc(1 - var(--sp) * 1.25)}`, `.wk-deck__stage{translate:0 calc(var(--sp) * -36px);opacity:calc(1.15 - var(--sp) * 1.2)}` (Works stage: -30px), `.wk-deck__cap{opacity:calc(1 - var(--sp) * 1.8)}`, `.wk-aph__foot{opacity:calc(1 - var(--sp) * 3)}`. Nothing moves below 1024px (no per card exit like the Works devices).

##### Behaviour: the fan engine
- Name and lines: Approvals hero, L7417-7583 (`setMode`, `targets`, `paint`, `frame`, `snap`, `nudge`, `setRun`, `setHot`, tilt, `heroScroll`).
- Starts when: script start (builds the cards, `setMode()`, `snap()`); page hero controller `enter` (deal), `run` (loop on or off); card and stage pointer events; focus and blur; hero `pointermove`/`pointerleave`; window `scroll`; window `resize` (`setMode()` and, when the page is current and the loop is not running, `snap()`).
- Reads or measures: `innerWidth`, `innerHeight`, `#wk-deck` rect (tilt), hero rect (scroll), `performance.now()`.
- Writes: inline `transform` and `transform-origin` on each `.wk-dk`; `--wk-sw`, `--wk-sh`, `--spw`, `--cw`, `--ch` on `.wk-deck__stage`; `--tx`, `--ty` on `#wk-deck-stage`; `--sp` on `#wk-ap-hero`; classes `.is-hot`, `.is-dealt` on cards and `.is-settled` on the hero.
- Loops: `frame` runs continuously while `running` (active and not reduced). `nudge()` runs a temporary loop when not running (for hover, scroll and entrance changes); it stops when every card is within .01deg and .005em of its target and hands over to `frame` if the hero became active meanwhile. Because the ambient targets keep moving, a nudge loop can last a little while before it stops.
- Timings: deal at +60ms, stagger 280ms + 65ms per card, settle at 1300ms, smoothing .12 then .085 per 16.67ms frame, tilt lerp .07, sway periods 19s, 15s, 12s.
- Pauses or skips when: not active (off screen by IntersectionObserver, another page, tab hidden, before entrance): no `frame` loop. Reduced motion: no loop at all, `snap()` on every change, no ambient, no deal (cards start in the fan), no tilt, no scroll exit, `settled` at once. Hover, spread and tilt need a mouse (`pointerType==='mouse'`, `FH.fine`); tilt needs `innerWidth>=1024`.
- Cleanup in React: cancel `dRaf` and the tilt and scroll rAFs; clear `settleT`; remove the window `scroll` and `resize` listeners and the hero pointer listeners.
- Port as: `<CertificateDeck certificates onJump />` with a `useCertificateFan(stageRef, cardRefs, { active, reduced })` hook that keeps the per card state in refs and writes transforms directly (no React state per frame). Share the tilt with the Works stage as `useStageTilt(heroRef, measureRef, tiltRef, { maxX, maxY })` (Works 3.5/5, Approvals 4.5/6) and the scroll exit as `useHeroScrollExit(heroRef, pageId)`.

##### Reduced motion (L2622-2624, global L357-362)
- `.js #approvals .wk-hero--ap .wk-deck__tilt{opacity:1}`. JS: cards snap into the resting fan, no sway.
- There is NO `transition-delay:0s!important` rule for the Approvals hero (Works has one, L2873). The global rule makes durations .001ms but keeps delays, so with reduced motion the Approvals `.wk-a` items, title rows, seal and caption still appear in steps after their delays (0ms to 1150ms), without movement. Copy this difference.

##### Approvals hero responsive summary
| Width | Change |
|---|---|
| 1024px and up | two columns `.84fr / 1.16fr` with `column-gap:clamp(28px,3.4vw,56px)`; deck width capped by `(100svh - 190px) * 1.45`; foot cue pinned; scroll exit |
| 1024px and up, height 800px or less | foot cue and caption hidden; tighter stats and issuers |
| 1024px to 1180px | columns `1fr / 1fr` |
| 1200px and up | `--wk-bleed` up to 64px |
| 640px to 1023px | one column; deck `min(100%,640px)` centred; no foot cue; no scroll exit |
| 639px and down | JS mode `m` (A 2.4deg, spine 3em); caption `.82rem` |
| deck 520px wide or less | container query hides the small print on the cards and enlarges the title |

#### 11.5.8 Approvals body: rail controls, certificate rail, cards, empty state and progress bar (HTML L3941-3962; CSS L2217-2311, L2399-2401; JS L7117-7262, L7586-7589)

##### What the rail is
- A native horizontal scroll container (`overflow-x:auto`) with `scroll-snap-type:x mandatory`, one row of 7 certificate cards. It starts at the wrap's left content edge and bleeds to the right edge of the page column.
- Ways to move it: native touch or trackpad scrolling; the prev and next buttons; arrow keys when the rail itself has focus; mouse drag with inertia; Shift plus mouse wheel. A progress bar and a "01 / 07" counter follow the scroll.
- There is NO lightbox and no modal for certificates. The only link is "View Certificate", which opens the issuer's verify page in a new tab. There are no PDF links.

##### Markup
- Rail controls, inside the toolbar (L3944-3948): `div.wk-railctl[aria-label="Certificate carousel controls"][role="group"]` >
  - `p.wk-railctl__n[aria-live="polite"]` > `<b id="wk-ap-cur">01</b>` + " / " + `<span id="wk-ap-tot">07</span>` (text "01 / 07" before JS; spaces around the slash are in the markup).
  - `button.wk-railbtn#wk-ap-prev[type="button"][aria-label="Previous certificate"]` > `<svg class="i"><use href="#i-arrow-left"/></svg>`
  - `button.wk-railbtn#wk-ap-next[type="button"][aria-label="Next certificate"]` > `<svg class="i"><use href="#i-arrow-right"/></svg>`
  - These two svgs have no `aria-hidden` (the buttons are named by `aria-label`, so it is harmless). Adding `aria-hidden="true"` in React is fine and changes nothing visible.
- Rail (L3952-3954): `div.wk-rail#wk-rail[role="region"][aria-label="Certificates, scroll horizontally"][tabindex="0"][data-reveal="fade"][data-delay="160"]` > `div.wk-rail__track#wk-ap-track` (empty, JS fills it). It sits outside any `.wrap`.
- After the rail (L3955-3962): `div.wrap` > `div.wk-empty#wk-ap-empty[hidden]` (icon `i-award`, `p.wk-empty__t` "No certifications found", `p.wk-empty__d` "Try selecting a different category to see more certifications.") + `div.wk-progress[aria-hidden="true"] > span#wk-ap-bar`.

##### Rail and control CSS (L2221-2243, L2296-2298, L2400-2401)
- `#approvals .wk-railctl{display:flex;align-items:center;gap:8px}`; `.wk-railctl__n{font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;color:var(--muted);margin-right:10px;white-space:nowrap}`; `.wk-railctl__n b{color:var(--ink);font-weight:500}` (L2221-2223).
- `.wk-railbtn{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line-strong);color:var(--ink);box-shadow:var(--shadow-sm);transition:background-color .35s,color .35s,border-color .35s,opacity .35s,transform .35s var(--ease-out)}`; `.i{width:18px;height:18px}`; `:hover:not(:disabled){background:var(--grad);color:#fff;border-color:transparent}`; `:active:not(:disabled){transform:scale(.94)}`; `:disabled{opacity:.4;cursor:default;box-shadow:none}` (L2224-2229).
- `.wk-rail{--pad:max(var(--gutter),calc((100% - var(--maxw)) / 2 + var(--gutter)));overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-padding-inline:var(--pad);overscroll-behavior-x:contain;scrollbar-width:none;padding:6px var(--gutter) 30px var(--pad);cursor:grab;outline:none;--fl:0px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl));mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl))}` (L2231-2234). `--pad` equals the wrap's left content edge, so the first card lines up with the toolbar. The left edge fades out by `--fl` (JS) once scrolled; the right edge has no fade.
- `::-webkit-scrollbar{display:none}`; `:focus-visible{box-shadow:inset 0 0 0 2px var(--accent)}`; `.is-drag{scroll-snap-type:none;cursor:grabbing;user-select:none}`; `.is-drag *{pointer-events:none}`; `.is-static{cursor:default}` (L2235-2239); `.is-drag{scroll-behavior:auto}` (L2401).
- `.wk-rail__track{display:flex;gap:clamp(16px,1.8vw,24px);width:max-content;align-items:stretch}` (L2240); `transform-origin:50% 50%;will-change:transform` (L2400, for the skew).
- Cells: `.wk-cc{flex:0 0 clamp(290px,29vw,380px);scroll-snap-align:start;display:flex}`; `.wk-cc--feat{flex-basis:clamp(300px,40vw,520px)}` (the two AI certificates are wider); `.wk-cc[hidden]{display:none}` (L2241-2243).
- Progress: `.wk-progress{position:relative;height:2px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:4px}`; `.wk-progress span{position:absolute;inset:0;transform-origin:0 50%;transform:scaleX(.04);background:var(--grad-glow);transition:transform .25s linear}` (L2296-2297).
- `#approvals .wk-empty{margin-bottom:24px}` (L2298), plus the shared empty state rules (11.5.5, L2095-2099).

##### Certificate card template (JS L7122-7152), exact output for certificate index `i`, `n = pad(i+1)`
```html
<div class="wk-cc[ wk-cc--feat if k==='ai']" data-reveal data-k="{k}" style="--d:{Math.min(i,3)*90}ms">
  <article class="wk-cert card" data-spotlight aria-labelledby="wk-c{n}">
    <div class="wk-cert__media">
      <div class="wk-paper" aria-hidden="true">
        <span class="wk-paper__top"><span>Certificate</span><span>{y}</span></span>
        <span class="wk-paper__iss">{iss}</span>
        <span class="wk-paper__type">{type}</span>
        <span class="wk-paper__lines"><i></i><i></i><i></i></span>
        <span class="wk-seal">{icon award}</span>
      </div>
      <img src="{encodeURI(FH.asset(img))}" alt="{t} certificate from {iss}" loading="lazy" decoding="async" draggable="false" onload="this.classList.add('is-ok')" onerror="this.remove()">
      [k==='ai': <span class="wk-cert__flag">{icon sparkles}AI</span>]
    </div>
    <div class="wk-cert__body">
      <div class="wk-issuer"><span class="wk-mono wk-mono--{iss.toLowerCase()}" aria-hidden="true">{mono}</span><span class="wk-issuer__txt"><b>{iss}</b><span>{type} · {y}</span></span></div>
      <h3 class="wk-cert__title" id="wk-c{n}">{t}</h3>
      <p class="wk-cert__desc">{d}</p>
      <ul class="tags wk-tags" aria-label="Technologies"><li class="tag">{tag}</li>...</ul>
      <div class="wk-cert__foot">
        <span class="wk-verified">{icon check-circle}Verified Certificate</span>
        <a class="wk-view" href="{url}" target="_blank" rel="noopener">View Certificate{icon arrow-up-right}<span class="sr-only"> for {t}, opens in a new tab</span></a>
      </div>
    </div>
  </article>
</div>
```
- No `data-tilt` on certificate cards (Works cards have it). The lift is plain CSS hover.
- The paper is a designed fallback that always renders under the image; the image covers it once loaded (`.is-ok`) and removes itself on error.
- Per certificate values:

| n | Title | Cell | `--d` | Mono class | Flag |
|---|---|---|---|---|---|
| 01 | Claude Code in Action | `wk-cc wk-cc--feat` | 0ms | `wk-mono--anthropic` | AI |
| 02 | Claude 101 | `wk-cc wk-cc--feat` | 90ms | `wk-mono--anthropic` | AI |
| 03 | Frontend Web Development Professional Certificate | `wk-cc` | 180ms | `wk-mono--google` | none |
| 04 | React Front-End Developer Professional Certificate | `wk-cc` | 270ms | `wk-mono--meta` | none |
| 05 | Full Stack Web Development Professional Certificate | `wk-cc` | 270ms | `wk-mono--ibm` | none |
| 06 | AWS Cloud & Data Analytics Professional Certificate | `wk-cc` | 270ms | `wk-mono--aws` | none |
| 07 | Meta React Native Mobile Development Certificate | `wk-cc` | 270ms | `wk-mono--meta` | none |

- Data fields mapped to the card: `iss` (paper issuer, issuer name, mono class, alt text, deck spine and face), `mono` (issuer chip text), `type` (paper type line, issuer sub line, deck kind line), `y` (paper corner, issuer sub line, deck spine and year line), `k` (filter, `data-k`, feat cell, AI flag, deck colour and category), `img` (image), `url` (View Certificate link), `t` (title, alt, sr-only texts), `tags` (tag list), `d` (description), index (`n`, `--d`, deck "No.").
- After building: `FH.observe(track)` (reveal) and `FH.bind(track)` (no magnetic or tilt targets inside, so it does nothing).

##### Certificate card CSS (L2245-2294)
- `.wk-cert{display:flex;flex-direction:column;width:100%;padding:8px;border-radius:26px}` + `.card` (L158-159, transition .6s `--ease-out` on transform and shadow). Hover: `transform:translateY(-4px);box-shadow:var(--shadow-md);border-color:var(--line-strong)` (L2246).
- Featured (AI) card: `.wk-cc--feat .wk-cert{border-color:transparent;background:linear-gradient(var(--surface),var(--surface)) padding-box,var(--grad-glow) border-box}` (L2247); title `font-size:clamp(1.3rem,1.9vw,1.65rem)` (L2284).
- Media, "a sheet of paper resting on a soft desk": `.wk-cert__media{position:relative;flex:none;aspect-ratio:1.5/1;border-radius:19px;overflow:hidden;border:1px solid var(--line);isolation:isolate;background:radial-gradient(var(--dot) 1px,transparent 1.2px) 0 0/16px 16px,linear-gradient(160deg,var(--surface-3),var(--surface-2))}` (L2250-2251).
- `.wk-paper,.wk-cert__media img{position:absolute;inset:9% 8%;border-radius:4px;box-shadow:var(--shadow-md);transition:transform .9s var(--ease-out)}`; `img{width:84%;height:82%;object-fit:cover;opacity:0;transition:opacity .6s var(--ease-out),transform .9s var(--ease-out)}`; `img.is-ok{opacity:1}`; hover `.wk-cert:hover .wk-paper,.wk-cert:hover .wk-cert__media img{transform:translateY(-3px) rotate(-.6deg) scale(1.02)}` (L2252-2255).
- Paper: `.wk-paper{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8% 10%;background:var(--surface);text-align:center;container-type:inline-size}`; double frame `::before{inset:6px}` and `::after{inset:10px;border-color:var(--line)}` (both `content:"";position:absolute;border:1px solid var(--line-strong);border-radius:2px;pointer-events:none`); `.wk-paper__top{position:absolute;left:16px;right:16px;top:14px;display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:.56rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}`; `.wk-paper__iss{font-family:var(--font-serif);font-style:italic;font-size:clamp(1.3rem,12cqw,2.6rem);line-height:1;color:var(--brand-ink);letter-spacing:-.01em}`; `.wk-paper__type{font-family:var(--font-mono);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}`; `.wk-paper__lines{display:grid;justify-items:center;gap:5px;width:70%;margin-top:6px}`; `i{display:block;height:3px;border-radius:3px;background:var(--line-strong);width:100%}`; second `width:78%;background:var(--line)`; third `width:52%;background:var(--line)`; `.wk-seal{position:absolute;right:16px;bottom:14px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:0 0 0 3px var(--surface),0 0 0 4px var(--line-strong),var(--glow)}`; `.wk-seal .i{width:18px;height:18px}` (L2256-2269).
- Flag: `.wk-cert__flag{position:absolute;left:12px;bottom:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--r-pill);background:var(--grad);color:#fff;font-family:var(--font-mono);font-size:.62rem;letter-spacing:.14em;font-weight:500;box-shadow:var(--glow)}`; `.i{width:12px;height:12px}` (L2270-2272).
- Body: `.wk-cert__body{flex:1 1 auto;display:flex;flex-direction:column;gap:12px;padding:18px 14px 10px}`; `.wk-issuer{display:flex;align-items:center;gap:12px}`; `.wk-mono{width:40px;height:40px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--surface-3);border:1px solid var(--line);color:var(--brand-ink);font-weight:800;font-size:1.05rem;letter-spacing:-.04em}`; `.wk-mono--ibm,.wk-mono--aws{font-size:.72rem;letter-spacing:.02em}`; `.wk-mono--anthropic{font-family:var(--font-serif);font-style:italic;font-weight:400;font-size:1.5rem;background:var(--grad);color:#fff;border-color:transparent}` (no rules for `--google` or `--meta`); `.wk-issuer__txt{display:grid;line-height:1.3;min-width:0}`; `b{color:var(--ink);font-weight:700;font-size:.95rem}`; `span{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}` (L2274-2282).
- `.wk-cert__title{font-size:var(--fs-h3);font-weight:700;letter-spacing:-.025em;line-height:1.2}`; `.wk-cert__desc{font-size:var(--fs-sm);line-height:1.65}` (no colour, inherits `--ink-2` from body); `#approvals .wk-tags{list-style:none;margin:0;padding:0}` (Works uses `margin:2px 0 0`); `.wk-tags .tag{height:24px;font-size:.62rem}` (L2283-2287).
- Foot: `.wk-cert__foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}`; `.wk-verified{white-space:nowrap;display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:600;color:var(--brand-ink)}`; `.i{width:17px;height:17px;color:var(--accent)}`; `.wk-view{white-space:nowrap;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 4px;font-weight:600;font-size:.86rem;color:var(--ink);transition:color .3s}`; `.i{width:15px;height:15px;transition:transform .45s var(--ease-out)}`; hover `color:var(--brand-ink)` and icon `translate(2px,-2px)` (L2288-2294).
- Spotlight: `[data-spotlight]` (core L4621-4624, CSS L165-170), same as Works cards.
- Flash target: `#approvals .wk-cert.wk-flash{animation:wk-flash 1.2s var(--ease-out) 2}` (L2399).

##### Responsive (L2300-2311)
| Width | Change |
|---|---|
| 1023px and down | shared toolbar rules only (11.5.3) |
| 639px and down | `.wk-verified,.wk-view{font-size:.8rem}`; `.wk-cert__foot{gap:6px}`; toolbar stacks (11.5.3); `.wk-railctl{justify-content:space-between}`; `.wk-railctl__n{margin-right:auto}`; `.wk-rail{padding-bottom:24px}`; `.wk-cc,.wk-cc--feat{flex-basis:min(84vw,360px)}` (feat cards are no wider on phones) |

##### Behaviour: rail state (counter, progress, buttons, edge fade)
- Name and lines: `update()` and `queue()`, L7155-7174; first runs L7260-7261.
- Starts when: script start, again after 600ms, on `document.fonts.ready`; rail `scroll` (passive) and window `resize`, both through one queued rAF; after every filter swap (`afterC`); 30ms after the Approvals page is shown (`rail.dispatchEvent(new Event('scroll'))`, L7588).
- Reads or measures: `rail.scrollWidth`, `clientWidth`, `scrollLeft`; computed `scrollPaddingLeft`; rail rect left; each visible cell's rect left.
- Writes:
  - `#wk-ap-bar` `transform = 'scaleX('+Math.max(.04,p).toFixed(4)+')'` where `p = max>1 ? scrollLeft/max : 1` (a rail that does not scroll shows a full bar).
  - `#wk-ap-cur` = `pad(idx+1)` (or "00" when nothing is visible), where `idx` is the visible card whose left edge is nearest to the snap line (rail left plus scroll padding), forced to the last card when `scrollLeft >= max-2`. `#wk-ap-tot` = `pad(visible count)`.
  - `#wk-ap-prev.disabled = scrollLeft<=2`; `#wk-ap-next.disabled = max<=1 || scrollLeft>=max-2`.
  - `.is-static` on the rail when `max<=1`.
  - `--fl` on the rail = `Math.min(64,scrollLeft/2).toFixed(0)+'px'` when `scrollLeft>4`, else `0px`.
- Timings: once per animation frame at most; the bar eases with `transform .25s linear`.
- Pauses or skips when: nothing runs while idle.
- Cleanup in React: remove the scroll and resize listeners, cancel the rAF and the 600ms timer.
- Port as: `useRailState(railRef, cellRefs, visibleKeys)` returning `{ current, total, atStart, atEnd, progress, fade, isStatic }`. Write the bar transform and `--fl` through refs (they change every frame); keep the counter text in state only if it does not cause frame drops.

##### Behaviour: prev, next and arrow keys
- Name and lines: `step(dir)` and listeners, L7175-7185.
- `step(dir)`: `w` = width of the FIRST visible card plus the track `columnGap`; `rail.scrollBy({left: dir*w, behavior: FH.reduce ? 'auto' : 'smooth'})`. Mandatory snap then settles the rail on a card edge.
- Starts when: click on `#wk-ap-prev` (`step(-1)`) or `#wk-ap-next` (`step(1)`); `keydown` on the rail when `e.target === rail` (the rail itself is focused, not a link inside): ArrowRight `step(1)`, ArrowLeft `step(-1)`, both `preventDefault()`.
- Note: with All selected the first card is a wide AI card, so one step is a wide card's width even when the cards in view are narrow. Snap corrects the landing. Copy as is.
- Cleanup in React: nothing beyond the listeners.
- Port as: handlers inside `<CertificateRail>`.

##### Behaviour: mouse drag with inertia
- Name and lines: L7187-7229.
- Starts when: `pointerdown` on the rail with `pointerType==='mouse'`, `button===0`, and the target not inside `a` or `button`. Stops any running glide and stores `{x, l: scrollLeft, moved:false, v:0, t: now, px: x}`.
- Window `pointermove`: `dx = clientX - x`; after more than 5px it becomes a drag (`moved = true`, `.is-drag` on the rail: snap off, grabbing cursor, no text selection, children ignore pointer events). While dragging: `scrollLeft = l - dx`, `preventDefault()`, velocity `v = v*.6 + ((px - clientX)/dt)*.4` in px per ms with `dt = Math.max(1, now - t)`.
- Window `pointerup`: if it was a drag, block the click that follows (a capture `click` listener on the rail calls `preventDefault` and `stopPropagation` while `suppress` is true; `suppress` resets in `setTimeout(0)`). Release velocity is `0` if the last move was more than 90ms ago. If reduced motion or `|v| < .15`: `settle()`. Else the glide loop: `dt = Math.min(40, now - last)`; `scrollLeft += v*dt`; `v *= Math.pow(.94, dt/16.67)`; stops when `|v| < .08` or an edge is reached, then `settle()`.
- `settle()`: `rail.scrollTo({left: nearestLeft(), behavior: FH.reduce ? 'auto' : 'smooth'})` where `nearestLeft()` is the scroll position that puts the nearest visible card on the snap line (clamped to 0 and max); after 520ms remove `.is-drag` unless a new drag or glide started.
- `dragstart` on the rail is prevented (images also have `draggable="false"`).
- Touch and pen are never handled here; they scroll natively with snap.
- Cleanup in React: remove the window `pointermove` and `pointerup` listeners, cancel the glide rAF and the 520ms timer.
- Port as: `useDragScroll(railRef, { snapTo: nearestCardLeft })`.

##### Behaviour: Shift plus wheel
- Name and lines: L7231-7235. `wheel` on the rail, `{passive:false}`.
- If `shiftKey` is held and the vertical delta is larger than the horizontal one: `preventDefault()`, `stopPropagation()` (so the site smooth wheel scroller on window, L4738-4758, does not also scroll the page) and `scrollLeft += deltaY`. Plain horizontal trackpad swipes stay native. A plain vertical wheel over the rail scrolls the page as usual.
- Port as: part of `useDragScroll` or a small `useShiftWheel(railRef)`.

##### Behaviour: scroll velocity skew
- Name and lines: L7237-7250.
- Starts when: rail `scroll` (passive), only when not reduced motion.
- Reads: `scrollLeft`, time since the last event (`dt = Math.max(8, now - lastT)`).
- Writes: `v = (scrollLeft - lastX)/dt`; target `skewT = clamp(-v*1.6, -3, 3)` degrees; rAF loop `skewT *= .86; skew += (skewT - skew)*.18`; writes `#wk-ap-track` inline `transform = 'skewX('+skew.toFixed(3)+'deg)'`; when both values are under .02 it clears the inline transform and stops.
- Pauses or skips when: reduced motion (listener never added).
- Cleanup in React: remove the listener, cancel the rAF.
- Port as: `useScrollSkew(railRef, trackRef)`.

##### Behaviour: certificate filter
- Name and lines: L7252-7259. `makeFilter(#wk-ap-filter, C_FILTERS, CERTS, onChange)` and `makeFlip(track, ccells, noop layout, afterC)` (11.5.3 and 11.5.4).
- Test: `k === 'all' || cert.k === k`.
- `afterC(vis)`: `#wk-ap-empty.hidden = vis.length > 0`; `rail.scrollLeft = 0` (instant); `update()`. It runs inside the FLIP swap, 250ms after the click.
- Counts per button: All Certifications 7, AI 2, Frontend 2, Backend 1, Cloud 1, Mobile 1. The empty state never shows with the current data.

#### 11.5.9 PureBody showcase modal (HTML L4493-4554; CSS L269-279, L2318-2384, L2403-2412; JS L7591-7613; core modal L4649-4661)

##### How it opens and closes (core modal, L4649-4661)
- The only opener is the PureBody card's Live Preview button in the Works grid: `<button type="button" class="wk-live" data-open="purebody" aria-haspopup="dialog">` (11.5.5). The modal has no route or hash of its own.
- Open, `FH.openModal('purebody')` (L4651-4652, called by the delegated `[data-open]` click handler at L4657): remembers `document.activeElement`; adds `.is-open`; sets `aria-hidden="false"`; adds `body.modal-open` (`overflow:hidden`, L279; it also turns off the site smooth wheel scroller, L4749); after 60ms focuses the first `[autofocus],button,input,select,textarea,a[href]` inside with `preventScroll` (that is the close button); dispatches `fh:open` on `#purebody`.
- Close (`FH.closeModal`, L4653-4654): any click on `[data-close]` (the scrim and the close button, L4656); the Escape key anywhere (closes every open modal, L4660); `FH.go` page navigation (L4695). It removes `.is-open`, sets `aria-hidden="true"`, dispatches `fh:close`, removes `body.modal-open` when no modal is left open, and returns focus to the remembered element with `preventScroll`.
- There is no focus trap. Closing is instant: `.fh-modal{visibility:hidden}` has no transition, so the fade and slide play only when opening.
- The modal markup lives at body level (outside `main`, L4494). In Next.js render it through a portal to `document.body` from the Works page (it is only used there), or from the root layout with the other overlays.

##### Markup and copy (L4494-4554)
```html
<div class="fh-modal wk-pb" id="purebody" aria-hidden="true">
  <div class="fh-modal__scrim" data-close></div>
  <div class="fh-modal__panel" role="dialog" aria-modal="true" aria-labelledby="wk-pb-title">
    <button type="button" class="fh-modal__close" data-close aria-label="Close PureBody showcase"><svg class="i"><use href="#i-close"/></svg></button>
    <div class="wk-pb__inner">
      <header class="wk-pb__head">
        <span class="wk-pb__kicker"><span class="dot-live" aria-hidden="true"></span>SaaS App <i class="wk-sep" aria-hidden="true"></i> Latest</span>
        <h2 class="wk-pb__title" id="wk-pb-title">Pure<span class="serif grad-text">Body</span></h2>
        <p class="wk-pb__lead">Explore the functionality and features of our PureBody mobile application through interactive video demonstrations</p>
        <a class="link-arrow wk-pb__full" href="https://faisalhanif.work/sass-app.html" target="_blank" rel="noopener">Open full page ↗<span class="sr-only"> (opens in a new tab)</span></a>
      </header>
      <div class="wk-pb__stage">
        <div class="wk-pb__phones" id="wk-pb-phones">
          <figure class="wk-phone" style="--i:0">
            <div class="wk-phone__frame">
              <div class="wk-phone__screen">
                <button type="button" class="wk-phone__poster" aria-label="Play PureBody demo 1">
                  <span class="wk-phone__brand">PureBody</span>
                  <span class="wk-phone__play"><svg class="i i--fill"><use href="#i-play"/></svg></span>
                  <span class="wk-phone__cap">Demo 01</span>
                </button>
                <video muted loop playsinline preload="none" data-src="vedioes/ScreenRecording1.mp4" aria-label="PureBody screen recording 1"></video>
                <span class="wk-phone__island" aria-hidden="true"></span>
              </div>
            </div>
            <figcaption class="wk-phone__fig">01</figcaption>
          </figure>
          <!-- same for --i:1 ("Play PureBody demo 2", "Demo 02", ScreenRecording2.mp4, "PureBody screen recording 2", "02")
               and --i:2 ("Play PureBody demo 3", "Demo 03", ScreenRecording3.mp4, "PureBody screen recording 3", "03") -->
        </div>
      </div>
    </div>
  </div>
</div>
```
- The lead has NO final full stop. Copy it exactly.
- "↗" (U+2197) is a text character in the link, not an icon. The link keeps pointing at the old site page (section 8).
- In the kicker the text nodes are "SaaS App " and " Latest"; the visible spacing comes from the flex `gap:10px`.
- Videos have no `src`, no `poster`, no `controls` and `preload="none"`. Nothing downloads until a video is started.

##### Panel and head CSS (L269-279, L2321-2341)
- Shell: `.fh-modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:clamp(0px,3vw,32px);visibility:hidden;pointer-events:none}`; open `visibility:visible;pointer-events:auto`. Scrim `position:absolute;inset:0;background:rgba(3,14,11,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s var(--ease-out)`, open `opacity:1`. Panel `position:relative;width:min(1080px,100%);max-height:min(92vh,100%);overflow:auto;overscroll-behavior:contain;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);opacity:0;transform:translateY(28px) scale(.98);transition:opacity .5s var(--ease-out),transform .7s var(--ease-out)`, open `opacity:1;transform:none`. Under 640px: `.fh-modal{padding:0;align-items:end}`, panel `max-height:94vh;border-radius:24px 24px 0 0` (bottom sheet). Close button `position:sticky;top:14px;margin-left:auto;margin-right:14px;margin-top:14px;z-index:5;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);color:var(--ink);float:right;transition:transform var(--dur-2) var(--ease-out)`, hover `rotate(90deg)`. `--r-xl` is 32px (L57).
- `#purebody .fh-modal__panel{width:min(1120px,100%)}` (L2321, wider than the shell's 1080px).
- `.wk-pb__inner{position:relative;padding:clamp(28px,4vw,56px) clamp(20px,4vw,56px) clamp(28px,4vw,48px);overflow:hidden}`; glow `::before{content:"";position:absolute;left:50%;top:48%;width:min(900px,120%);aspect-ratio:1.6;transform:translate(-50%,-10%);border-radius:50%;background:radial-gradient(closest-side,var(--accent-soft),transparent);pointer-events:none;z-index:0}` (L2322-2324).
- `.wk-pb__head{position:relative;z-index:1;display:grid;justify-items:center;text-align:center;gap:14px;max-width:640px;margin:0 auto clamp(28px,4vw,48px)}` (L2325).
- `.wk-pb__kicker{display:inline-flex;align-items:center;gap:10px;height:32px;padding:0 14px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--line);font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--brand-ink)}`; `.wk-sep{display:inline-block;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.45}` (L2326-2328). The `.dot-live` pings (`fh-ping 2.4s`, L152-153).
- `.wk-pb__title{font-size:clamp(2.6rem,6vw,4.6rem);font-weight:800;letter-spacing:-.05em;line-height:1}`; `.serif{font-weight:400;letter-spacing:-.02em;padding-right:.06em}` (L2329-2330).
- `.wk-pb__lead{font-size:var(--fs-lead);line-height:1.65;color:var(--ink-2);max-width:34ch}`; `.wk-pb__full{min-height:40px}` (L2331-2332). `.link-arrow` (L146): `display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--brand-ink);font-size:.9rem`; it has no `.i` here, so no hover motion.
- Head entrance (L2335-2340): `.wk-pb__head>*{opacity:0;transform:translateY(14px);transition:opacity .7s var(--ease-out),transform .8s var(--ease-out)}`; open `opacity:1;transform:none` with `transition-delay` .12s (kicker), .18s (title), .24s (lead), .3s (link).

##### Phones CSS (L2342-2365, L2404-2406)
- `.wk-pb__stage{position:relative;z-index:1}`; `.wk-pb__phones{display:flex;justify-content:center;align-items:flex-start;gap:clamp(20px,3.4vw,48px)}`.
- `.wk-phone{margin:0;flex:0 0 clamp(190px,19vw,236px);display:grid;justify-items:center;gap:14px;opacity:0;transform:translateY(40px) scale(.97);transition:opacity .8s var(--ease-out),transform 1s var(--ease-out)}`; `.wk-phone:nth-child(2){margin-top:-18px}` (middle phone sits higher); open `opacity:1;transform:none;transition-delay:calc(.28s + var(--i) * .11s)` (.28s, .39s, .5s).
- `.wk-phone__frame{width:100%;aspect-ratio:9/19.3;padding:7px;border-radius:38px;background:var(--brand-900);box-shadow:0 0 0 1px var(--line-strong),inset 0 0 0 1px rgba(255,255,255,.08),var(--shadow-lg)}`.
- `.wk-phone__screen{position:relative;height:100%;border-radius:31px;overflow:hidden;background:radial-gradient(80% 50% at 50% 0%,color-mix(in srgb,var(--mint) 45%,transparent),transparent 70%),var(--grad)}`.
- `.wk-phone__screen video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s var(--ease-out)}`; `.wk-phone.is-playing video{opacity:1}`.
- `.wk-phone__island{position:absolute;left:50%;top:10px;width:34%;height:20px;border-radius:12px;transform:translateX(-50%);background:var(--brand-900);z-index:3}`.
- Poster: `.wk-phone__poster{position:absolute;inset:0;z-index:1;display:grid;place-items:center;align-content:center;gap:14px;color:#fff;width:100%;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:22px 22px;transition:opacity .5s var(--ease-out)}`; `.is-playing .wk-phone__poster{opacity:0;pointer-events:none}`; `.wk-phone__brand{position:absolute;left:0;right:0;top:44px;text-align:center;font-weight:800;letter-spacing:-.04em;font-size:1.05rem;opacity:.9}`; `.wk-phone__play{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:transform .5s var(--ease-out),background-color .4s}`; `.wk-phone__play .i{width:20px;height:20px;margin-left:3px}`; hover `.wk-phone__poster:hover .wk-phone__play{transform:scale(1.06);background:rgba(255,255,255,.22)}`; `.wk-phone__cap{font-family:var(--font-mono);font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;opacity:.75}`.
- `.wk-phone__fig{font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.2em;color:var(--muted)}`; also `transition:opacity .4s` (L2406) although nothing changes its opacity.
- Float once open (L2404-2405): `@keyframes wk-float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}`; `#purebody.is-open .wk-phone__frame{animation:wk-float 13s var(--ease-io) infinite;animation-delay:calc(var(--i,0) * -4.3s)}` (0s, -4.3s, -8.6s). The float is on the frame and the entrance on the figure, so they do not fight.

##### Responsive (L2367-2380, L276)
| Width | Change |
|---|---|
| 1024px and up | `.wk-pb__inner{display:grid;grid-template-columns:minmax(0,.78fr) minmax(0,1.5fr);align-items:center;gap:clamp(24px,3vw,48px)}`; glow `left:66%;top:50%;transform:translate(-50%,-50%)`; head `justify-items:start;text-align:left;margin:0`; phones `gap:clamp(16px,2vw,28px);padding-top:22px`; phone `flex-basis:clamp(150px,min(14.5vw,26vh),214px)` |
| 760px and down | phones become a snap scroller: `justify-content:flex-start;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;margin-inline:calc(clamp(20px,4vw,56px) * -1);padding:4px 18vw 12px;gap:18px` (scrollbar hidden); phone `flex-basis:min(62vw,250px);scroll-snap-align:center`; middle phone `margin-top:0` |
| 640px and down | the shell becomes a bottom sheet (`max-height:94vh`, top corners 24px) |

##### Reduced motion (L2382-2384, L2408-2412)
- `#purebody .wk-phone,#purebody .wk-pb__head>*{opacity:1;transform:none}`; `#purebody.is-open .wk-phone__frame{animation:none}`. The videos still start on open (with 0 delay, see below).

##### Behaviour: PureBody videos
- Name and lines: L7594-7613 (`start(v)` and the `fh:open` / `fh:close` listeners).
- Starts when: script start binds, per video, `playing`, `pause` and `error` (capture) listeners and a `click` on its `.wk-phone__poster`. `fh:open` on `#purebody` starts all three; a poster click starts one.
- `start(v)`: if the video has no `src` attribute yet, set `v.src = FH.asset(v.dataset.src)` (today `https://faisalhanif.work/vedioes/ScreenRecording1.mp4`; in the rebuild `/vedioes/ScreenRecording1.mp4`); then `v.play()` and swallow a rejected promise.
- On `fh:open`: reset `#wk-pb-phones.scrollLeft = 0` (the phone scroller under 760px); then for video `i` wait `FH.reduce ? 0 : 300 + i*120` ms (300, 420, 540) and call `start(v)` only if `#purebody` still has `.is-open`.
- Writes: `.is-playing` on the `figure.wk-phone` on `playing`, removed on `pause` (video fades in .6s, poster fades out .5s and stops taking clicks); `.is-failed` on the figure on `error` (no CSS uses it; the poster simply stays); the `src` attribute (set once, never removed).
- On `fh:close`: `pause()` every video (inside try/catch). Videos keep their `src` and position, so the next open resumes where they stopped. Nothing is unloaded.
- Timings: stagger 300ms + 120ms per phone; video fade .6s; poster fade .5s.
- Pauses or skips when: the modal closed before the timer fired (no start); reduced motion only removes the delay (videos still autoplay, muted and looping).
- Cleanup in React: clear the three timers when the modal closes or unmounts; pause the videos on close; remove the media listeners on unmount.
- Port as: `<PureBodyShowcase open onClose />` with `usePureBodyVideos(open, videoRefs)`; keep `data-src` style lazy loading by setting `src` only on first start (do not render `src` in the server HTML), and keep `muted`, `loop`, `playsInline`, `preload="none"`.

#### 11.5.10 Shared JS behaviours (works.js L7264-7324, L7332-7409 summary, L7586-7589)

##### Behaviour: page hero controller
- Name and lines: `pageHero(id, el, o)` L7280-7311, with `whenLoaded(fn)` L7276-7279 and `afterCurtain(fn)` L7313-7321. Used twice: `pageHero('works', #wk-hero, {...})` (L7400-7408) and `pageHero('approvals', #wk-ap-hero, {...})` (L7574-7581). Both pass `sync:true`.
- State: `t` (timer), `entered`, `inView` (starts true), `lastP`. `active()` = `entered && inView && FH.current===id && !document.hidden`. `run()` calls `o.run(active())`.
- `enter(delay)`: clear the timer; `entered=false`; remove `.is-on`; `o.reset()`; force a reflow (`void el.offsetWidth`); then `go()` at once when reduced motion, else after `delay` ms. `go()`: add `.is-on`; `entered=true`; start a count up for every `[data-wk-to]` inside the hero with delay = (the closest `.wk-a`'s inline `--d` parsed as an integer) + 200ms; `o.enter()`; `run()`; `scroll()`.
- `scroll()`: returns unless this page is current and not reduced motion; `p = clamp(scrollY/(el.offsetHeight*.85), 0, 1)`; skip changes under .001; writes `--p` (`toFixed(3)`) on the hero; calls `o.scroll(p)` if given (neither hero gives one). No CSS in works.css reads `--p` (only About uses a `--p`, on other elements), so this output has no visible effect.
- Starts when:
  - Script start: if `FH.current===id` (the page was opened directly by URL), `whenLoaded(() => enter(90))`. `whenLoaded` runs at once if `<html>` has `.is-loaded` (set when the preloader finishes, 1250ms after DOM ready, or at once with reduced motion, L4782-4783), else polls every 50ms and gives up waiting after 80 polls (4s).
  - `fh:page` (dispatched by the router's `show()`, L4684): for this page, reset `lastP=-1` and `--p:0`; with `sync` and no reduced motion: stop, `entered=false`, remove `.is-on`, `o.reset()`, then `afterCurtain(() => enter(0))`. With reduced motion: `enter(curtain has .is-on ? 340 : 60)` (and `enter` ignores the delay under reduced motion). For any other page: stop, `entered=false`, remove `.is-on`, `run()`.
  - `IntersectionObserver` on the hero (default options): `inView = isIntersecting`, `run()`.
  - `document` `visibilitychange`: `run()`.
  - window `scroll` (passive): `scroll()`.
- `afterCurtain(fn)`: the curtain "covers" while `#curtain` has `.is-on` and not `.is-out`. If it is not covering, `setTimeout(fn,120)`. Else a `MutationObserver` on its `class` waits until it stops covering, then `setTimeout(fn,120)`; a fallback fires after 1800ms.
- Resulting timeline for a route change (router `FH.go`, L4689-4711): click at 0; curtain in; at 560ms `show(page)` fires `fh:page` (hero reset, hidden); at 700ms the curtain gets `.is-out`; at 820ms `enter(0)` adds `.is-on`. Works then adds `.is-settled` at 2220ms and `.is-live` at 3020ms; Approvals deals from 880ms and settles at 2120ms. The curtain classes clear at 1340ms.
- Direct load of `/#works` or `/#approvals`: the router's first `show()` runs before works.js has its listeners, so only the script start path runs: `.is-on` about 90ms after `.is-loaded`.
- Writes: `.is-on` on the hero; `--p`; count up text; plus whatever `o.reset`, `o.enter` and `o.run` write (Works: `.is-settled`, `.is-live`, `.is-idle`, `--sp`, hot state; Approvals: the fan engine, `.is-settled`, `--sp`).
- Every page show replays the entrance and the count up from zero. Leaving the page removes `.is-on` at once (the page is `display:none` anyway).
- Pauses or skips when: `o.run(false)` when off screen, on another page, tab hidden or not yet entered (Works: `.is-idle` pauses the float and the ping; Approvals: stops the fan loop).
- Cleanup in React: clear the enter timer, the 50ms poll and the curtain MutationObserver and its 1800ms fallback; disconnect the IntersectionObserver; remove the `visibilitychange` and `scroll` listeners.
- Port as: `usePageHero(heroRef, pageId, { onReset, onEnter, onRun })` fed by the app's route transition state (a context that says when the curtain starts to lift and whether the preloader is done) instead of a MutationObserver and polling. Keep the 120ms wait after the curtain starts to lift, the 90ms delay after the preloader, and the replay on every page show.

##### Behaviour: count up
- Name and lines: `countUp(el, delay)` L7269-7275.
- Starts when: hero `go()` (every entrance).
- Reads: `data-wk-to` (target number) and `data-wk-suf` (suffix; no element sets it, so it is always empty; the visible "+" or "%" is the separate `<i>` after the span).
- Writes: the span's `textContent`. Reduced motion: the final number at once. Otherwise "0" at once, then after `delay` a rAF loop over 1500ms with `e = 1 - Math.pow(1 - p, 4)` (ease out quart), text `Math.round(to*e)`.
- Delays: Works 680ms (Projects 10), 740ms (Technologies 7), 800ms (Responsive 100); Approvals 680ms (Certifications 6), 740ms (Learning Hours 200), 800ms (Video Tutorials 15).
- The server HTML shows the final numbers (good for no JS and SEO). The number is reset to 0 while its `.wk-a` parent is still invisible, so there is no visible jump.
- Cleanup in React: clear the timer and cancel the rAF.
- Port as: `useCountUp(ref, { to, delay, run })` or a `<CountUp to delay play />` component.

##### Behaviour: scroll cue buttons
- Name and lines: `cueBind(root)` L7322-7324, called for each hero (L7399, L7572).
- Every `[data-wk-cue]` inside the hero scrolls to `document.getElementById(data-wk-cue)` with `FH.scrollToEl` on click: Works "Browse projects" and the foot "Scroll to explore" go to `#wk-toolbar`; Approvals "Browse certificates" and its foot cue go to `#wk-ap-toolbar`.
- `FH.scrollToEl(el)` (L4687): target `rect.top + scrollY - (innerWidth<1024 ? 84 : 32)`; uses the site smooth scroller when active (fine pointer, no reduced motion), else `window.scrollTo({top, behavior: reduce ? 'auto' : 'smooth'})`.
- Port as: `<ScrollCue targetId />` and a shared `scrollToElement(el)` helper from the shell.

##### Behaviour: flash a jump target
- Name and lines: `flash(el)` L7267-7268; CSS L2071-2072, L2398-2399.
- Skipped when `el` is missing or reduced motion. Else remove `.wk-flash`, force a reflow, add `.wk-flash`, remove it after 2600ms.
- `@keyframes wk-flash{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 55%,transparent),var(--shadow-md)}100%{box-shadow:0 0 0 18px transparent,var(--shadow-md)}}`, run as `wk-flash 1.2s var(--ease-out) 2` (two rings, 2.4s).
- Callers: Works device jump (900ms after the scroll starts, on `article.wk-card`); Approvals deck jump (950ms, on `article.wk-cert`).
- Cleanup in React: clear the 2600ms timer.
- Port as: `flashElement(el)` utility (restart the animation by toggling the class with a reflow between).

##### Behaviour: re-measure on page show
- Name and lines: L7586-7589. On `fh:page`: for `works`, `setTimeout(pFilter.sync, 30)`; for `approvals`, after 30ms `cFilter.sync()` and `rail.dispatchEvent(new Event('scroll'))` (which runs the rail `update()` and the skew handler).
- Why: filters and the rail measure `0` while their page is `display:none`.
- Port as: run the same syncs in a `useLayoutEffect` when the route becomes active (plus the 30ms timer, or a ResizeObserver).

##### Behaviour: Works hero controller (summary; details in 11.5.2)
- Name and lines: L7332-7409.
- Starts when: script start (chips, seal, device listeners), `pageHero` callbacks, device pointer, focus and click events, hero `pointermove`/`pointerleave`, window `scroll`.
- Reads or measures: `#wk-sk` rect (tilt), `#wk-hero` rect (scroll exit), `innerWidth`, `innerHeight`, `pFilter.get()`.
- Writes: chip buttons and `aria-pressed`; the seal markup; `.is-hot` on devices and `.is-fan` on `#wk-sk-tilt`; `--tx`, `--ty` on `#wk-sk-tilt`; `--sp` on `#wk-hero`; `.is-settled`, `.is-live`, `.is-idle` on `#wk-hero`.
- Timings: `.is-settled` 1400ms and `.is-live` 2200ms after `.is-on`; tilt lerp .07; jump waits 650ms when the filter must switch, flash 900ms after the scroll.
- Pauses or skips when: `.is-idle` when not active (float and ping paused); tilt needs `FH.fine`, no reduced motion, `.is-settled` and `innerWidth>=1024`; hover needs a mouse and `.is-settled` (focus does not); scroll exit needs the page current and no reduced motion.
- `reset` (L7402): clear both timers, remove `.is-settled` and `.is-live`, clear hot state, `wLastSp=-1`, `--sp:0`. `enter` (L7403-7406): `wkScroll()`, then `.is-settled` (at once when reduced) and `.is-live` timers. `run(on)` (L7407): toggle `.is-idle` to `!on`.
- Cleanup in React: clear the settle and live timers; cancel the tilt and scroll rAFs; remove the hero and window listeners.
- Port as: `<WorksHeroStage projects onJump />` using `usePageHero`, `useStageTilt`, `useHeroScrollExit`; hot state in React state is fine (it changes rarely), but `--tx`/`--ty`/`--sp` must be written through refs.

##### Behaviour: Works grid build and filter (summary; details in 11.5.3 to 11.5.5)
- Name and lines: L7025-7115.
- Starts when: script start (build 14 cells, `layout`, `after`, reveal delays, `FH.observe` and `FH.bind`); filter changes.
- Writes: the cells, `--span`, `.is-wide`, `.wk-card--wide`, `.is-big`, `.is-p5`, `.is-odd`, DOM order, `--d`, `#wk-count` HTML, `#wk-empty.hidden`, `hidden` on cells.
- Cleanup in React: FLIP animations and timers (11.5.4); card tilt listeners.
- Port as: `<ProjectGrid projects filter />` that computes the layout plan from the visible list in render (pure function `planRows(n)` and `layoutCells(visible)`), keeps all 14 cells mounted with `hidden`, and uses `useFlip`.

##### Behaviour index (where each one lives)
| Behaviour | Lines | Section | Port as |
|---|---|---|---|
| Segmented filter with sliding indicator | L6951-6982 | 11.5.3 | `<SegmentedFilter>` |
| FLIP filtering | L6987-7023 | 11.5.4 | `useFlip` |
| Works grid layout, cards, count | L7025-7115 | 11.5.5 | `<ProjectGrid>`, `<ProjectCard>` |
| Certificate cards and rail state | L7120-7174 | 11.5.8 | `<CertificateRail>`, `useRailState` |
| Rail buttons and arrow keys | L7175-7185 | 11.5.8 | inside `<CertificateRail>` |
| Rail mouse drag with inertia | L7187-7229 | 11.5.8 | `useDragScroll` |
| Rail Shift plus wheel | L7231-7235 | 11.5.8 | `useShiftWheel` |
| Rail velocity skew | L7237-7250 | 11.5.8 | `useScrollSkew` |
| Certificate filter | L7252-7261 | 11.5.8 | `<SegmentedFilter>` + `useFlip` |
| Flash | L7267-7268 | 11.5.10 | `flashElement` |
| Count up | L7269-7275 | 11.5.10 | `useCountUp` |
| Page hero controller | L7276-7321 | 11.5.10 | `usePageHero` |
| Scroll cues | L7322-7324 | 11.5.10 | `<ScrollCue>` |
| Works stage: chips, seal, hover, tilt, exit, jump | L7332-7409 | 11.5.1, 11.5.2 | `<WorksHeroStage>`, `useStageTilt`, `useHeroScrollExit` |
| Approvals deck: build, fan, deal, hover, tilt, exit, jump | L7417-7583 | 11.5.7 | `<CertificateDeck>`, `useCertificateFan` |
| Re-measure on page show | L7586-7589 | 11.5.10 | layout effect on route change |
| PureBody videos | L7594-7613 | 11.5.9 | `usePureBodyVideos` |
| Core: spotlight, tilt, magnetic, reveal, modal, scrollToEl | L4593-4661, L4687 | 11.5.5, 11.5.9 | shell hooks (part 11.2) |

#### 11.5.11 Content data

Rules for these files:
- Every string below is copied from the reference. `\u2014` inside a string literal is the em dash of the reference (TypeScript turns it into the real character). `·` is U+00B7 and `↗` is U+2197, both real characters in the reference.
- Array order is data order. It drives the card number `n` (01 to 14, 01 to 07), the reveal delays, the cover colours and the deck order. Do not sort.
- Image paths: the reference loads `FH.asset('imgs/...')` from `https://faisalhanif.work/`; the rebuild serves the same files from `frontend/public/imgs/` (section 8), so paths start with `/imgs/`. Two project file names contain spaces; render them with `encodeURI(path)` like the reference (`img()`, L6944).
- The hero device screenshots are the base64 images of section 8, extracted to `frontend/public/images/`.
- Fields the reference does not have are "not in reference": certificates have a year only (no month or day), a verify URL only (no PDF), and no credential id.

##### frontend/src/content/projects.ts
Source: works.js L6862-6911 (data), L7030-7066 (card template), L7335-7409 and HTML L3799-3878 (hero), L4494-4554 (PureBody modal).

```ts
/** Filter keys used by the segmented filter and the "Built with" chips (P_FILTERS, L6906). */
export type ProjectFilterKey = 'all' | 'reactjs' | 'nextjs' | 'fullstack' | 'reactnative' | 'sassapp';

/** A project's own key. 'website' (Fit For Living) has no filter button: it only shows under All Projects. */
export type ProjectKey = Exclude<ProjectFilterKey, 'all'> | 'website';

/** b in the reference: 'latest' = PureBody hero card, 'featured' = Echo AI, 'live' = every other card. */
export type ProjectBadge = 'latest' | 'featured' | 'live';

/** Icon ids from the sprite (section 7) used on the card covers. */
export type CoverIconId =
  | 'rocket' | 'code' | 'globe' | 'layers' | 'server' | 'phone-dev'
  | 'cart' | 'dollar' | 'video' | 'shield' | 'book' | 'cloud';

export interface Project {
  /** t: card title, image alt "Screenshot of {title}", hero device lookup (data-p). */
  title: string;
  /** ini: big letters on the fallback cover. */
  initials: string;
  /** cat: meta line, cover label "{n} · {category}", cover icon lookup. */
  category: string;
  /** k */
  filterKey: ProjectKey;
  /** b */
  badge: ProjectBadge;
  /** img: served from frontend/public, render with encodeURI(). */
  image: string;
  /** live: Live Preview link and the chrome URL text (protocol, trailing "/" and ".html" removed). */
  live: string;
  /** modal: when set, Live Preview is a button that opens this modal id instead of a link. */
  modal?: 'purebody';
  /** src: GitHub link, or null for "Closed Source". */
  source: string | null;
  /** tags: the tag list ("Technologies"). */
  tags: readonly string[];
  /** d: card description, word for word. */
  description: string;
  /**
   * Fallback cover values, from HUES[i], 118+(i*23)%70 and RINGS[i] (L6908-6909, L7048).
   * Written as --h, --a (deg), --rx/--ry/--rw (%) on .wk-cover.
   */
  cover: { hue: number; angle: number; ring: readonly [number, number, number] };
}

export interface FilterDef<K extends string> {
  key: K;
  label: string;
}

export const PROJECT_FILTERS: readonly FilterDef<ProjectFilterKey>[] = [
  { key: 'all', label: 'All Projects' },
  { key: 'reactjs', label: 'React.js' },
  { key: 'nextjs', label: 'Next.js' },
  { key: 'fullstack', label: 'MERN Stack' },
  { key: 'reactnative', label: 'React Native' },
  { key: 'sassapp', label: 'Sass App' },
];

/** CAT_ICON (L6910-6911). A category missing here falls back to 'code'. */
export const CATEGORY_ICON: Readonly<Record<string, CoverIconId>> = {
  'SaaS App': 'rocket',
  'React.js': 'code',
  'Client Website': 'globe',
  'Next.js': 'layers',
  'Full Stack': 'server',
  'React Native': 'phone-dev',
  'E-commerce': 'cart',
  'FinTech': 'dollar',
  'Communication': 'video',
  'Healthcare': 'shield',
  'Education': 'book',
  'Utility': 'cloud',
};

export const PROJECTS: readonly Project[] = [
  {
    // 01
    title: 'PureBody',
    initials: 'PB',
    category: 'SaaS App',
    filterKey: 'sassapp',
    badge: 'latest',
    image: '/imgs/purebody.jpeg',
    live: 'https://faisalhanif.work/sass-app.html',
    modal: 'purebody',
    source: null,
    tags: ['React Native', 'Node.js', 'MongoDB', 'Push Notifications', 'LLM API', 'Hostinger'],
    description:
      'Live SaaS app on Android & App Store \u2014 complete AI system powering personalized diet plans, smart workout tracking, and an AI coach that adapts to every user.',
    cover: { hue: 160, angle: 118, ring: [-18, -38, 70] },
  },
  {
    // 02
    title: 'UHA International',
    initials: 'UHA',
    category: 'React.js',
    filterKey: 'reactjs',
    badge: 'live',
    image: '/imgs/UHA-Company website.png',
    live: 'https://uha-international.com/',
    source: null,
    tags: ['React.js', 'Node.js', 'Nodemailer', 'API Integration'],
    description:
      'UHA corporate website covering tech, real estate & trading \u2014 with built-in AI chat support and Nodemailer turning visitor inquiries into real business.',
    cover: { hue: 146, angle: 141, ring: [-24, 30, 62] },
  },
  {
    // 03
    title: 'Fit For Living',
    initials: 'FL',
    category: 'Client Website',
    filterKey: 'website',
    badge: 'live',
    image: '/imgs/FitForLiving.webp',
    live: 'https://fitforliving.netlify.app/',
    source: null,
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Netlify'],
    description:
      'Business website for a Geelong gym & coaching studio \u2014 membership pricing, programs, and a live weekly class timetable that highlights the next session in local time.',
    cover: { hue: 176, angle: 164, ring: [40, -52, 80] },
  },
  {
    // 04
    title: 'GitPulse',
    initials: 'GP',
    category: 'Next.js',
    filterKey: 'nextjs',
    badge: 'live',
    image: '/imgs/GitPulse.webp',
    live: 'https://gitpulseee.netlify.app/',
    source: 'https://github.com/FaisalHanif12/GitPulse-',
    tags: ['Next.js', 'React', 'GitHub API', 'Role-Based Access'],
    description:
      'GitHub activity tracking platform for coding bootcamps \u2014 role-based dashboards for admins, coordinators, leadership, and learners with cohort management, scoring, and leaderboards.',
    cover: { hue: 154, angle: 187, ring: [-30, -20, 58] },
  },
  {
    // 05
    title: 'Smart Health Care',
    initials: 'SH',
    category: 'Full Stack',
    filterKey: 'fullstack',
    badge: 'live',
    image: '/imgs/Dashboard.webp',
    live: 'https://smart-health-care.vercel.app/',
    source: 'https://github.com/FaisalHanif12/Smart-health-Care',
    tags: ['React', 'Node.js', 'MongoDB', 'Express'],
    description:
      'A full-featured fitness tracker platform with user activity monitoring, workout scheduling, and progress analytics.',
    cover: { hue: 168, angle: 140, ring: [8, -60, 90] },
  },
  {
    // 06
    title: 'Smart Gallery App',
    initials: 'SG',
    category: 'React Native',
    filterKey: 'reactnative',
    badge: 'live',
    image: '/imgs/Smart Gallery.webp',
    live: 'https://smartgallery-display.netlify.app/',
    source: 'https://github.com/FaisalHanif12/SmartGallery',
    tags: ['React Native', 'Expo', 'Async Storage', 'OPEN AI'],
    description:
      'An intelligent photo gallery application with advanced sorting, filtering, and AI-powered image recognition features.',
    cover: { hue: 142, angle: 163, ring: [-20, 45, 54] },
  },
  {
    // 07
    title: 'Echo AI',
    initials: 'EA',
    category: 'React.js',
    filterKey: 'reactjs',
    badge: 'featured',
    image: '/imgs/Echoai.webp',
    live: 'https://echoaai.netlify.app/',
    source: 'https://github.com/FaisalHanif12/Echoai',
    tags: ['React', 'OpenAI', 'TypeScript', 'Tailwind'],
    description:
      'An advanced AI-powered conversational interface with natural language processing and intelligent response generation.',
    cover: { hue: 182, angle: 186, ring: [-16, -44, 74] },
  },
  {
    // 08
    title: 'Medicine Store App',
    initials: 'MS',
    category: 'React Native',
    filterKey: 'reactnative',
    badge: 'live',
    image: '/imgs/medicare.png',
    live: 'https://medicaredisplay.netlify.app/',
    source: 'https://github.com/FaisalHanif12/medicine-tracker-',
    tags: ['React Native', 'Expo', 'Async Storage'],
    description:
      'A comprehensive pet healthcare management system for tracking medications and medical records for animal.',
    cover: { hue: 150, angle: 139, ring: [55, -40, 70] },
  },
  {
    // 09  OWNER NOTE: the live link below returns 404. Kept exactly as in the reference; see Notes and traps.
    title: 'Soledeck',
    initials: 'SD',
    category: 'E-commerce',
    filterKey: 'fullstack',
    badge: 'live',
    image: '/imgs/Shop.webp',
    live: 'https://soledeckf.vercel.app/',
    source: 'https://github.com/FaisalHanif12/Soledeck',
    tags: ['Next.js', 'Stripe', 'MongoDB', 'Redux'],
    description:
      'A modern e-commerce platform for sneakers with advanced filtering, payment integration, and inventory management.',
    cover: { hue: 172, angle: 162, ring: [-26, -8, 60] },
  },
  {
    // 10
    title: 'Financial Fusion',
    initials: 'FF',
    category: 'FinTech',
    filterKey: 'reactnative',
    badge: 'live',
    image: '/imgs/Financial-fusion.webp',
    live: 'https://financial-fusion.netlify.app/',
    source: 'https://github.com/FaisalHanif12/FinancialFusion',
    tags: ['React Native', 'Charts.js', 'SQLite', 'Redux'],
    description:
      'A comprehensive financial management application with expense tracking, budget planning, and investment analytics.',
    cover: { hue: 158, angle: 185, ring: [-12, -50, 84] },
  },
  {
    // 11
    title: 'YOOM',
    initials: 'YM',
    category: 'Communication',
    filterKey: 'nextjs',
    badge: 'live',
    image: '/imgs/Home.webp',
    live: 'https://faisal-yoom.netlify.app/',
    source: 'https://github.com/FaisalHanif12/YOOM',
    tags: ['Next.js', 'WebRTC', 'Socket.io', 'Clerk Auth'],
    description:
      'A modern video conferencing platform with real-time collaboration, screen sharing, and meeting management features.',
    cover: { hue: 186, angle: 138, ring: [30, -58, 76] },
  },
  {
    // 12
    title: 'Dosnexa',
    initials: 'DX',
    category: 'Healthcare',
    filterKey: 'fullstack',
    badge: 'live',
    image: '/imgs/doctors.png',
    live: 'https://dosnexa.vercel.app/',
    source: 'https://github.com/FaisalHanif12/Dosnexa',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'Shadcn/ui'],
    description:
      'A comprehensive medical platform connecting patients with doctors, featuring appointment booking and telemedicine capabilities.',
    cover: { hue: 144, angle: 161, ring: [-28, 26, 56] },
  },
  {
    // 13
    title: 'DSA Tracker',
    initials: 'DSA',
    category: 'Education',
    filterKey: 'reactjs',
    badge: 'live',
    image: '/imgs/dsa.webp',
    live: 'https://faisal-dsa-tracker.netlify.app/',
    source: 'https://github.com/FaisalHanif12/DSA-Tracker-',
    tags: ['React', 'Material-UI', 'Local Storage', 'PWA'],
    description:
      'A comprehensive data structures and algorithms learning platform with progress tracking and coding challenges.',
    cover: { hue: 165, angle: 184, ring: [-6, -46, 66] },
  },
  {
    // 14
    title: 'Live Search Weather',
    initials: 'LW',
    category: 'Utility',
    filterKey: 'nextjs',
    badge: 'live',
    image: '/imgs/Weather.webp',
    live: 'https://weather-faisal.netlify.app/',
    source: 'https://github.com/FaisalHanif12/Live-search-weather',
    tags: ['Next.js', 'Weather API', 'Geolocation', 'CSS3'],
    description:
      'A real-time weather application with live search functionality, detailed forecasts, and location-based services.',
    cover: { hue: 152, angle: 137, ring: [46, -30, 64] },
  },
];

/**
 * PureBody (badge 'latest') renders its title as Pure<span class="serif">Body</span> (L7041).
 * The reference hard codes this split; keep it tied to the 'latest' badge.
 */
export const LATEST_TITLE_PARTS = ['Pure', 'Body'] as const;

export const PROJECT_GRID_COPY = {
  filterAriaLabel: 'Filter projects by technology',
  /** Count chip aria-label: "{n} items" (also "1 items", as in the reference). */
  countChipAriaLabel: (n: number) => `${n} items`,
  /** #wk-count innerHTML: Showing <b>{visible}</b> of {total} (shown uppercase by CSS). */
  countPrefix: 'Showing',
  countMiddle: 'of',
  empty: {
    title: 'No projects found',
    text: 'Try selecting a different category to see more projects.',
  },
  card: {
    imageAlt: (title: string) => `Screenshot of ${title}`,
    tagsAriaLabel: 'Technologies',
    badgeLatest: 'Latest',
    badgeFeatured: 'Featured',
    badgeLive: 'Live',
    livePreview: 'Live Preview',
    /** sr-only text after "Live Preview" on the modal button. */
    liveModalSr: (title: string) => ` of ${title}`,
    /** sr-only text after "Live Preview" on links. */
    liveLinkSr: (title: string) => ` of ${title}, opens in a new tab`,
    source: 'Source',
    sourceSr: (title: string) => ` code of ${title} on GitHub`,
    closedSource: 'Closed Source',
  },
} as const;

export interface WorksHeroStat {
  label: string;
  value: number;
  suffix: '+' | '%';
  /** --d of its .wk-a wrapper in ms; the count up starts at delay + 200. */
  delay: number;
}

export interface WorksHeroDevice {
  /** CSS modifier: .wk-dv--{key} */
  key: 'gp' | 'uha' | 'ffl' | 'pb';
  /** data-p, matched against Project.title for the jump. */
  projectTitle: string;
  kind: 'browser' | 'phone';
  /** .wk-bw--dark (GitPulse only). */
  dark?: boolean;
  /** Browser chrome URL text. */
  url?: string;
  image: { src: string; width: number; height: number; alt: string };
  /** Label pill: <b>{name}</b><span>{type}</span>; live = .dot-live instead of .wk-dv__dot. */
  tag: { name: string; type: string; live?: boolean };
  ariaLabel: string;
}

export const WORKS_HERO = {
  eyebrow: 'Portfolio Showcase',
  titleRowA: 'Featured',
  titleRowB: 'Projects',
  /** Rendered as: 2022 <i>&rarr;</i> 2026 */
  titleMeta: { from: '2022', to: '2026' },
  lead: 'Explore my collection of AI-powered web applications, mobile solutions, and full-stack projects that blend LLM intelligence with cutting-edge technology and innovative design.',
  browseLabel: 'Browse projects',
  bookLabel: 'Book Meeting',
  stats: [
    { label: 'Projects', value: 10, suffix: '+', delay: 480 },
    { label: 'Technologies', value: 7, suffix: '+', delay: 540 },
    { label: 'Responsive', value: 100, suffix: '%', delay: 600 },
  ] as readonly WorksHeroStat[],
  /** The chips are PROJECT_FILTERS without 'all', in that order. */
  stackLabel: 'Built with',
  stageAriaLabel: 'Four featured projects. Choose one to jump to its card.',
  caption: {
    countDesktop: '04',
    countPhone: '03',
    textDesktop: 'Four of fourteen. Pick one to jump to it.',
    textPhone: 'Three of fourteen. Tap one to jump to it.',
  },
  /** Seal: ring text, centre number = PROJECTS.length, label. */
  seal: { ring: 'WEB · MOBILE · AI · 2022 - 2026 ·', label: 'PROJECTS' },
  cue: 'Scroll to explore',
  /** DOM order = back to front paint order by depth (L2702). */
  devices: [
    {
      key: 'gp',
      projectTitle: 'GitPulse',
      kind: 'browser',
      dark: true,
      url: 'gitpulseee.netlify.app',
      image: {
        src: '/images/works-hero-gitpulse.webp',
        width: 1400,
        height: 797,
        alt: 'GitPulse admin dashboard with learner stats, an activity trend chart and a score distribution donut',
      },
      tag: { name: 'GitPulse', type: 'Next.js' },
      ariaLabel: 'GitPulse, Next.js dashboard. Jump to this project.',
    },
    {
      key: 'uha',
      projectTitle: 'UHA International',
      kind: 'browser',
      url: 'uha-international.com',
      image: {
        src: '/images/works-hero-uha.webp',
        width: 1280,
        height: 697,
        alt: 'UHA International home page with a glass globe beside the headline',
      },
      tag: { name: 'UHA International', type: 'React.js' },
      ariaLabel: 'UHA International, React.js website. Jump to this project.',
    },
    {
      key: 'ffl',
      projectTitle: 'Fit For Living',
      kind: 'browser',
      url: 'fitforliving.netlify.app',
      image: {
        src: '/images/works-hero-fitforliving.webp',
        width: 1280,
        height: 697,
        alt: 'Fit For Living home page: Coaching that actually knows your name, with the weekly class timetable',
      },
      tag: { name: 'Fit For Living', type: 'Client Website' },
      ariaLabel: 'Fit For Living, client website. Jump to this project.',
    },
    {
      key: 'pb',
      projectTitle: 'PureBody',
      kind: 'phone',
      image: {
        src: '/images/works-hero-purebody.webp',
        width: 402,
        height: 884,
        alt: "PureBody app home screen with today's overview and an AI meal plan",
      },
      tag: { name: 'PureBody', type: 'SaaS App', live: true },
      ariaLabel: 'PureBody, SaaS app. Jump to this project.',
    },
  ] as readonly WorksHeroDevice[],
} as const;

export interface PureBodyDemo {
  /** --i on the figure (entrance delay, float phase, autoplay order). */
  index: 0 | 1 | 2;
  /** Set as the video src on first start (lazy). Served from frontend/public/vedioes/. */
  video: string;
  posterAriaLabel: string;
  posterCaption: string;
  videoAriaLabel: string;
  figcaption: string;
}

export const PUREBODY_SHOWCASE = {
  closeAriaLabel: 'Close PureBody showcase',
  /** <dot-live/>SaaS App <i.wk-sep/> Latest */
  kickerParts: ['SaaS App', 'Latest'],
  titleParts: ['Pure', 'Body'],
  /** No final full stop in the reference. */
  lead: 'Explore the functionality and features of our PureBody mobile application through interactive video demonstrations',
  fullPage: {
    label: 'Open full page ↗',
    srSuffix: ' (opens in a new tab)',
    href: 'https://faisalhanif.work/sass-app.html',
  },
  posterBrand: 'PureBody',
  demos: [
    {
      index: 0,
      video: '/vedioes/ScreenRecording1.mp4',
      posterAriaLabel: 'Play PureBody demo 1',
      posterCaption: 'Demo 01',
      videoAriaLabel: 'PureBody screen recording 1',
      figcaption: '01',
    },
    {
      index: 1,
      video: '/vedioes/ScreenRecording2.mp4',
      posterAriaLabel: 'Play PureBody demo 2',
      posterCaption: 'Demo 02',
      videoAriaLabel: 'PureBody screen recording 2',
      figcaption: '02',
    },
    {
      index: 2,
      video: '/vedioes/ScreenRecording3.mp4',
      posterAriaLabel: 'Play PureBody demo 3',
      posterCaption: 'Demo 03',
      videoAriaLabel: 'PureBody screen recording 3',
      figcaption: '03',
    },
  ] as readonly PureBodyDemo[],
} as const;
```

##### frontend/src/content/certificates.ts
Source: works.js L6913-6936 (data), L7120-7152 (rail card template), L7420-7456 (deck), HTML L3900-3962 (hero, toolbar, rail, empty state).

```ts
export type CertificateFilterKey = 'all' | 'ai' | 'frontend' | 'web' | 'cloud' | 'mobile';
export type CertificateKey = Exclude<CertificateFilterKey, 'all'>;
export type CertificateIssuer = 'Anthropic' | 'Google' | 'Meta' | 'IBM' | 'AWS';

export interface Certificate {
  /** iss: issuer name; lower cased it gives the chip class .wk-mono--{issuer}. */
  issuer: CertificateIssuer;
  /** mono: chip text ("A", "G", "M", "IBM", "aws"). */
  mono: string;
  /** type */
  type: string;
  /** y: year only. Month and day: not in reference. */
  year: string;
  /** k */
  filterKey: CertificateKey;
  /** img: served from frontend/public. */
  image: string;
  /** url: issuer verify page, opened by "View Certificate". PDF link: not in reference. */
  verifyUrl: string;
  /** t */
  title: string;
  tags: readonly string[];
  /** d: word for word. */
  description: string;
}

export interface FilterDef<K extends string> {
  key: K;
  label: string;
}

export const CERTIFICATE_FILTERS: readonly FilterDef<CertificateFilterKey>[] = [
  { key: 'all', label: 'All Certifications' },
  { key: 'ai', label: 'AI' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'web', label: 'Backend' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'mobile', label: 'Mobile' },
];

/** CAT_LBL (L7420): the category word on the deck card spines. */
export const CERTIFICATE_CATEGORY_LABEL: Readonly<Record<CertificateKey, string>> = {
  ai: 'AI',
  frontend: 'Frontend',
  web: 'Backend',
  cloud: 'Cloud',
  mobile: 'Mobile',
};

/** Newest first. Index 0 is the top card of the deck and card "01" of the rail. */
export const CERTIFICATES: readonly Certificate[] = [
  {
    // 01
    issuer: 'Anthropic',
    mono: 'A',
    type: 'Certificate of Completion',
    year: '2026',
    filterKey: 'ai',
    image: '/imgs/Claude-Code-in-Action.webp',
    verifyUrl: 'https://verify.skilljar.com/c/ckyyu2785vdw',
    title: 'Claude Code in Action',
    tags: ['Claude Code', 'Agentic Coding', 'MCP', 'AI Workflows'],
    description:
      'Hands-on training in AI-assisted software development with Claude Code, covering agentic coding workflows, context management, custom commands, MCP servers, and hooks for automating real-world engineering tasks.',
  },
  {
    // 02
    issuer: 'Anthropic',
    mono: 'A',
    type: 'Certificate of Completion',
    year: '2026',
    filterKey: 'ai',
    image: '/imgs/Claude-101.webp',
    verifyUrl: 'https://verify.skilljar.com/c/drx9sbkavduo',
    title: 'Claude 101',
    tags: ['Claude AI', 'Prompt Engineering', 'Generative AI', 'Productivity'],
    description:
      'Foundations of working effectively with Claude, including prompting techniques, projects, artifacts, and applying AI assistance to everyday research, writing, and development workflows.',
  },
  {
    // 03
    issuer: 'Google',
    mono: 'G',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'frontend',
    image: '/imgs/Frontend.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/ZBMGZAEQPFMZ',
    title: 'Frontend Web Development Professional Certificate',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    description:
      'Comprehensive frontend development training covering HTML5, CSS3, JavaScript ES6+, responsive design, and modern frontend frameworks for building interactive web applications.',
  },
  {
    // 04
    issuer: 'Meta',
    mono: 'M',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'frontend',
    image: '/imgs/React.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/EE42JSYQPZ7D',
    title: 'React Front-End Developer Professional Certificate',
    tags: ['React', 'JSX', 'Hooks', 'Redux'],
    description:
      'Advanced React development skills including hooks, state management, component architecture, and modern React patterns for building scalable single-page applications.',
  },
  {
    // 05
    issuer: 'IBM',
    mono: 'IBM',
    type: 'Professional Certificate',
    year: '2023',
    filterKey: 'web',
    image: '/imgs/Web.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/RKY4CN2NHHR3',
    title: 'Full Stack Web Development Professional Certificate',
    tags: ['Node.js', 'Express', 'MongoDB', 'APIs'],
    description:
      'Complete web development training covering both frontend and backend technologies, including databases, APIs, deployment, and modern web development best practices.',
  },
  {
    // 06
    issuer: 'AWS',
    mono: 'aws',
    type: 'Cloud Certification',
    year: '2023',
    filterKey: 'cloud',
    image: '/imgs/Data.webp',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/verify/3YLMQJ6HTBRE',
    title: 'AWS Cloud & Data Analytics Professional Certificate',
    tags: ['AWS', 'Cloud Computing', 'Data Analytics', 'Security'],
    description:
      'Foundation-level understanding of AWS cloud services, data analytics, security best practices, and deployment strategies for scalable cloud-based data solutions.',
  },
  {
    // 07
    issuer: 'Meta',
    mono: 'M',
    type: 'Professional Certificate',
    year: '2024',
    filterKey: 'mobile',
    image: '/imgs/ReactNative.png',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/certificate/BEMCRMJ7N46L',
    title: 'Meta React Native Mobile Development Certificate',
    tags: ['React Native', 'Mobile Development', 'JavaScript', 'UI/UX'],
    description:
      'Comprehensive training in building cross-platform mobile applications using React Native, covering UI/UX, navigation, state management, and deployment to app stores.',
  },
];

export const CERTIFICATE_RAIL_COPY = {
  filterAriaLabel: 'Filter certifications by area',
  countChipAriaLabel: (n: number) => `${n} items`,
  controlsAriaLabel: 'Certificate carousel controls',
  prevAriaLabel: 'Previous certificate',
  nextAriaLabel: 'Next certificate',
  railAriaLabel: 'Certificates, scroll horizontally',
  empty: {
    title: 'No certifications found',
    text: 'Try selecting a different category to see more certifications.',
  },
  card: {
    paperTop: 'Certificate',
    imageAlt: (title: string, issuer: string) => `${title} certificate from ${issuer}`,
    aiFlag: 'AI',
    /** Issuer sub line: "{type} · {year}" */
    issuerLine: (type: string, year: string) => `${type} · ${year}`,
    tagsAriaLabel: 'Technologies',
    verified: 'Verified Certificate',
    view: 'View Certificate',
    viewSr: (title: string) => ` for ${title}, opens in a new tab`,
  },
} as const;

export interface ApprovalsHeroStat {
  label: string;
  value: number;
  suffix: '+';
  /** --d of its .wk-a wrapper in ms; the count up starts at delay + 200. */
  delay: number;
}

export const APPROVALS_HERO = {
  eyebrow: 'Professional Certifications',
  titleRowA: 'My',
  titleRowB: 'Certifications',
  /** Rendered as: 2023 <i>&rarr;</i> 2026 */
  titleMeta: { from: '2023', to: '2026' },
  lead: 'Professional certifications and learning achievements in web development, cloud computing, and modern programming technologies that validate my expertise.',
  browseLabel: 'Browse certificates',
  /** href: the site CV path (reference: https://faisalhanif.work/imgs/Faisal-CVS.pdf, rewritten to FH.asset('imgs/Faisal-CVS.pdf')). */
  cvLabel: 'Download CV',
  stats: [
    { label: 'Certifications', value: 6, suffix: '+', delay: 480 },
    { label: 'Learning Hours', value: 200, suffix: '+', delay: 540 },
    { label: 'Video Tutorials', value: 15, suffix: '+', delay: 600 },
  ] as readonly ApprovalsHeroStat[],
  /** Issuer chips: <i class="wk-im[ wk-im--a| wk-im--sm]">{text}</i> */
  issuerChips: [
    { text: 'A', variant: 'a' },
    { text: 'G' },
    { text: 'M' },
    { text: 'IBM', variant: 'sm' },
    { text: 'aws', variant: 'sm' },
  ] as readonly { text: string; variant?: 'a' | 'sm' }[],
  /** Rendered as: Issued by <b>Anthropic, Google, Meta, IBM</b> and <b>AWS</b> */
  issuedBy: { before: 'Issued by', boldA: 'Anthropic, Google, Meta, IBM', middle: 'and', boldB: 'AWS' },
  deckAriaLabel: 'Certificate deck. Choose one to jump to it.',
  /** Hard coded in the reference (not computed from the data). */
  caption: { count: '07', text: 'Certificates, newest on top. Pick one to jump to it.' },
  seal: { ring: 'VERIFIED CREDENTIALS · 2023 - 2026 ·' },
  deckCard: {
    numberPrefix: 'No. ',
    awardedTo: 'Awarded to',
    awardee: 'Faisal Hanif',
    issuedBy: 'Issued by',
    year: 'Year',
    verified: 'Verified',
    /** sr-only: "{title}, {issuer}, {year}. Jump to this certificate." */
    srLabel: (title: string, issuer: string, year: string) =>
      `${title}, ${issuer}, ${year}. Jump to this certificate.`,
  },
  cue: 'Scroll to explore',
} as const;
```

##### Notes on the data
- Project counts per filter (computed, never hard code): All 14, React.js 3, Next.js 3, MERN Stack 3, React Native 3, Sass App 1. Certificate counts: All 7, AI 2, Frontend 2, Backend 1, Cloud 1, Mobile 1.
- The hero stats are separate copy and do NOT match the data: "10+" projects (data has 14), "6+" certifications (data has 7). Copy them as they are.
- Cover angles are `118+(i*23)%70` for i = 0..13: 118, 141, 164, 187, 140, 163, 186, 139, 162, 185, 138, 161, 184, 137 (already folded into `cover.angle` above).
- Certificate tag lists and project tag lists are rendered upper case by `.tag` CSS (`text-transform:uppercase`); keep the data in its original case.

#### Notes and traps

##### Owner items
- Soledeck (project 09): the live link `https://soledeckf.vercel.app/` returns 404 (owner note). The reference still shows a "Live" badge and a "Live Preview" link for it. It is kept exactly as in the reference in `projects.ts`; changing the link or hiding the button needs the owner's decision.
- The PureBody "Open full page ↗" link is the absolute old site URL `https://faisalhanif.work/sass-app.html`. It only works while that page is served (section 8 says it is carried into `frontend/public/`).
- The hero stats do not match the data: Works "10+" projects (data has 14), Approvals "6+" certifications (data has 7). The Works caption "Four of fourteen" and the Approvals caption "07" are hard coded; only the Works seal number is computed (`PROJECTS.length`). Copy them as they are.

##### Copy that looks wrong but must be copied exactly
- "Sass App" (filter button and chip label) while the category and the modal say "SaaS App".
- Filter label "Backend" for key `web` (the IBM "Full Stack Web Development Professional Certificate").
- Count chip `aria-label` "1 items" for a count of 1.
- Smart Health Care is described as "A full-featured fitness tracker platform ..."; Medicine Store App ends with "... medical records for animal.".
- Echo AI live URL `https://echoaai.netlify.app/` (double a); GitHub URLs with a trailing hyphen: `GitPulse-`, `medicine-tracker-`, `DSA-Tracker-`.
- The PureBody modal lead has no full stop at the end.
- Four em dashes in project descriptions (01 to 04), written as `\u2014` in `projects.ts`.
- Seal ring texts use a plain hyphen with spaces ("2022 - 2026", "2023 - 2026") and middle dots (U+00B7).

##### Things a porter could get wrong
- Specificity: nearly every rule is scoped with `#works` or `#approvals` (for example `#approvals .wk-cert:hover` beats `.card` rules, `#works .wk-cell.is-big .wk-title` beats `#works .wk-card--feat .wk-title`). If the port drops the ids (CSS Modules, flat classes), keep the same winners by order or by an equal scope class on the page root.
- Dark theme focus ring on deck cards: `[data-theme="dark"] ... .wk-dk:focus-visible .wk-dk__paper` (L2496) outranks the `.25em` accent ring rule (L2497), so in dark mode the ring is only a 1px accent line. Copy the selectors, do not "fix" it silently.
- Reduced motion differs between heroes: Works zeroes all transition delays (L2873); Approvals does not, so its items still appear in steps after their delays. The PureBody videos still autoplay with reduced motion (0ms delay).
- Real 3D: Works devices and deck cards get their paint order from `translateZ` inside `transform-style:preserve-3d`. Do not replace it with `z-index`. The Works float uses `transform` and the scroll exit uses the separate `translate` property on the same element; keep both.
- The deck writes `transform` inline every frame. Do not add a CSS transition on `.wk-dk`, and do not keep per frame values in React state (use refs).
- Hover rules differ on purpose: a Works device stays hot until the pointer enters another device or leaves the whole stage; a deck card clears as soon as the pointer leaves it. Both need a mouse and the settled state; focus does not need settle.
- The Works scroll exit parts the devices at every width (`.wk-dv__float` has no media query) while the copy and stage fade only at 1024px and up. The deck only moves at 1024px and up (JS `sp` is 0 below, CSS rules are desktop only).
- Server render and layout shift: before JS, the deck stage uses its CSS fallbacks (`--wk-sw:70`, `--wk-sh:46em`, cards 34em x 23em); the JS values are 67.02 / 50.85em / 40em x 27em (desktop and tablet). Render the `d` mode values inline on the server and switch to `m` on the client under 640px, so the hero height does not jump. The tilt layer stays at opacity 0 until `.is-on`, as in the reference.
- `setMode()` only reruns when crossing 640px; everything else scales through `cqw`. Do not recompute geometry on every resize.
- Unique ids: `wk-guil` (symbol), `wk-seal-p` and `wk-sk-p` (text paths), `wk-p01` to `wk-p14`, `wk-c01` to `wk-c07`, plus all the element ids used by `aria-labelledby`. React props: `textLength`, `vectorEffect`, `href` on `<use>` and `<textPath>`.
- The guilloche is about 107 KB of path data; build it on the client, not in the server HTML.
- Keep all 14 project cells and all 7 certificate cells mounted and toggle `hidden`; FLIP animates the same nodes. Works also re-appends cells in layout order (Echo AI moves to the first 7 span slot), so render in layout order from the computed plan, but keep the card number from the data index.
- The jump from a Works device waits 650ms only when a filter must switch to All, then flashes after 900ms; the deck jump flashes after 950ms and scrolls the page and the rail at the same time.
- Rail step size is the width of the first visible card; with All that is a wide AI card. Snap fixes the landing. The counter `aria-live` region updates on every scroll change.
- Rail drag uses window `pointermove`/`pointerup` listeners and a capture `click` blocker reset by `setTimeout(0)`. Mouse only; touch scrolls natively. Shift plus wheel calls `stopPropagation` so the site smooth scroller does not also move the page; keep that when porting the smooth scroller.
- `afterC` resets `rail.scrollLeft = 0` during every filter swap.
- The PureBody modal has no focus trap, focuses its close button 60ms after opening, closes instantly (no fade out), and Escape closes every open modal. Videos keep their `src` after the first start and resume on reopen; `.is-failed` has no CSS (the poster just stays).
- Page hero entrance replays on every page show: 120ms after the curtain starts to lift on a route change, 90ms after `.is-loaded` on a direct load. The count ups restart from 0 each time.
- Dead or unused outputs in the reference (no visible effect): `--p` written by the page hero controller, `data-wk-suf`, the `.wk-ht` split lookup, `.is-dealt`, `.wk-dk--top`, `.is-failed`, the Approvals `.is-settled` class, the `.wk-phone__fig` opacity transition. They can be skipped without any visual change; do not add CSS for them.
- Missing from section 6 of the map: two container queries, `@container (max-width:420px)` on `.wk-wh__copy` (L2680, stack chips) and `@container (max-width:520px)` on `.wk-deck` (L2616, deck card small print).
- `encodeURI` the two project image paths with spaces (`/imgs/UHA-Company website.png`, `/imgs/Smart Gallery.webp`). The Works hero device images have no `loading="lazy"` in the reference (they are in the first view).

### 11.6 Contact page (#contact, route /contact)

Sources read line by line: contact.css L812-1226 and the later contact page rules L1336, L1553-1563; HTML L3965-4227; contact.js L5175-5787. Shared rules this page depends on were checked at the lines cited (tokens L25-88, base L94-122, buttons L134-148, pill and dot L151-153, card and icon tile L158-163, spotlight L165-170, stat L173, reveal and split L178-191, page hero L299-308, reduced motion L357-362, core script L4559-4786). Sections 1 to 10 of REFERENCE_MAP.md are not repeated here; the contact form rules, messages and payload stay in section 10.

Skipped on purpose (another reader covers them), listed so nothing is lost:
- Booking modal CSS: L1224-1460. `.ct-bk*` rules at L1227-1234, L1237-1239, L1263-1266, L1277-1287, L1289-1296, L1299-1304, L1421-1425, L1428, L1430-1433; `.ct-recap*` at L1409-1420; the booking only classes in the same block (`.ct-sess` L1240-1261, `.ct-stepper` L1267-1275, `.ct-steps` L1305-1323, `.ct-pane` and `.ct-bf` L1325-1351, `.ct-sched`, `.ct-cal`, `.ct-select`, `.ct-slots`, `.ct-slot` L1353-1387, `.ct-plats`, `.ct-plat` L1389-1406, `.ct-order` L1408, `.ct-check--lg` L1429); booking responsive L1435-1460.
- Chat widget CSS: L1462-1552 (responsive L1540-1552).
- Booking JS starts at L5788; chat JS later (section 5).

Exceptions inside those blocks that DO style the contact page:
- L1336 `[data-theme="dark"] .ct-bf__in,[data-theme="dark"] .ct-input{color-scheme:dark}` (the contact form inputs get a dark color scheme).
- L1110 `.ct-opt input,.ct-sess input,.ct-plat input{...}` (in my range, shared with booking).
- L1152-1162 `.ct-done`, `.ct-check` are shared with the booking done screen.

Non ASCII characters in these ranges:
- L3982 `Let&rsquo;s`: the title uses U+2019 (right single quote), written with the entity.
- L4115 `&deg;` twice (U+00B0) in the coordinates.
- L4169: `&amp;` twice, in the value attribute and the label of "Maintenance &amp; Support".
- L5339 (JS): the dial label `Mon\u2013Fri · 9AM\u20136PM PKT` holds two EN dashes (U+2013) and one middle dot (U+00B7). Written here as `\u2013`. In a TS string literal `\u2013` gives the real character.
- L5370 (JS): `'You · '` holds a middle dot (U+00B7).
- Everything else is ASCII. Note the ledger copy "Mon-Fri, 9AM-6PM (GMT+5)" (L4037) uses plain hyphens, unlike the dial label.

#### 11.6.0 Page frame

##### Root
- `section.section.ct#contact` (L3965), `aria-labelledby="ct-title"`. The core script adds `.page`, `data-page="contact"` and `.is-current` (L4677, L4682). The rebuild renders it at route `/contact`.
- Document title when shown: `Contact · Faisal Hanif` (L4683). Curtain label `05 / 05`, title `Contact` (L4675, L4701).
- Rail and dock link: `a.rail__link[href="#contact"][data-nav="contact"]`, icon `i-chat`, text `Contact` (L2981 rail, L3000 dock).
- Section padding: `#contact.section{padding-top:0;padding-bottom:clamp(8px,2vw,24px)}` (L821) replaces `.section` `padding-block:var(--section-y)` (L114).
- `#contact [hidden],#booking [hidden],.ct-chat [hidden]{display:none!important}` (L816). The done panel and the "Email directly" button rely on it.
- Error tokens, scoped to `#contact,#booking,.ct-chat` (L817-818):

| Token | Light | Dark |
|---|---|---|
| `--ct-err` | `#b42a33` | `#ff9a9a` |
| `--ct-err-soft` | `rgba(180,42,51,.10)` | `rgba(255,154,154,.10)` |

- Blocks in order:

| Lines | Block | Root |
|---|---|---|
| L3966-3969 | Page local icon sprite: `ct-i-copy`, `ct-i-down` | `svg[width="0"][height="0"][style="position:absolute"][aria-hidden="true"][focusable="false"]` |
| L3972-4016 | Hero ("Let's Connect", globe and 24h dial, clock card) | `header.page-hero.ct-hero#ct-hero` |
| L4018 | Body wrapper (closes L4224) | `div.wrap.ct-body` |
| L4019 | Kicker "05 Ways to reach me" | `div.ct-kicker#ct-ways[data-reveal="fade"]` |
| L4022-4057 | Methods ledger (4 methods) | `div.card.ct-ledger[data-reveal][data-spotlight]` |
| L4060-4223 | Map and form grid | `div.ct-grid` |
| L4061-4120 | Aside with the Lahore map | `aside.ct-aside > figure.card.ct-map` |
| L4122-4222 | Form column | `div.ct-formcol > form.card.ct-form#ct-form` |
| after L4224 | "Next page" link injected by the core script (L4732-4736) | `div.wrap > nav.page-next[aria-label="Next page"][data-reveal]` |

- Next page link content for this page (L4733-4735 with `i=4`, `last=true`): label `Back to the start · 01`, counter `5 / 5`, word `Abo` + `<span class="serif">ut</span>`, arrow `i-arrow-right`, `href="#about"`.
- `.ct-formcol` (L4122) and `.ct-body` (L4018) have no CSS rules; they are plain wrappers.

##### Page local sprite (L3966-3969)
Keep these two symbols in the shared sprite component (REFERENCE_MAP.md section 7 lists them, but they are defined here, not in L2883-2947):
- `symbol#ct-i-copy[viewBox="0 0 24 24"]`: `<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5V4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>`
- `symbol#ct-i-down[viewBox="0 0 24 24"]`: `<path d="M12 5v14M6 13l6 6 6-6"/>`

##### Tokens and shared classes used
- Tokens (values at L25-88, both themes): `--brand`, `--brand-900`, `--accent`, `--grad`, `--grad-glow`, `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--line-strong`, `--ink`, `--ink-2`, `--muted`, `--brand-ink`, `--accent-soft`, `--brand-soft`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--glow`, `--glass`, `--font-sans`, `--font-mono`, `--fs-label` (.72rem), `--r-lg` (24px), `--r-xl` (32px), `--r-pill` (999px), `--ease-out` (`cubic-bezier(.22,1,.36,1)`), `--ease-io` (`cubic-bezier(.65,0,.35,1)`), `--dur-1` (.35s), `--dur-2` (.6s), `--dur-3` (.9s).
- `--brand-900` is `#08302a` light and `#062019` dark; used only by the globe night side (L918).
- Shared classes: `.wrap` L113, `.section` L114, `.sr-only` L107, `.i` L108, `.serif` L118, `.grad-text` L119, `.mono` L120, `.label` L121, `.lead` L122, `.eyebrow` L127-129, `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--sm` L134-145, `.link-arrow` L146-148, `.pill` L151, `.dot-live` and `@keyframes fh-ping` L152-153, `.card` L158-159, `.icon-tile`, `.icon-tile--soft` L161-163, `[data-spotlight]` L166-170, `.stat-num` L173, reveal L178-187, split `.w` L189-191, `.page-hero` L300-301, `.hero-title` L306-307.

##### Reveal and stagger timing for the body
The reveal observer (`rootMargin:'0px 0px -8% 0px'`, `threshold:.12`, fires once, L4594-4596) is armed once after the preloader (L4782). Variants used here: `fade` = `blur(4px)` only (L180); `""` (up) = `translate3d(0,26px,0)` + `blur(6px)` (L179); `scale` = `scale(.94)` + `blur(6px)` (L181). All start at opacity 0 and transition over `var(--dur-3) var(--ease-out)` with `transition-delay:var(--d,0ms)` (L178).

| Element | Line | Kind | `--d` |
|---|---|---|---|
| `div.ct-kicker#ct-ways` | L4019 | fade | 0 |
| `div.card.ct-ledger` | L4022 | up | 0 |
| `article.ct-method` x4 | L4024, L4032, L4040, L4048 | fade | 80ms, 160ms, 240ms, 320ms (parent `div.ct-ledger__row[data-stagger="80"][data-delay="80"]`, L4023, rule at L4599-4601: `base + k*step`) |
| `figure.card.ct-map` | L4062 | scale | 0 |
| `form.card.ct-form` | L4123 | up | 0 |
| `nav.page-next` | injected | up | 0 |

The hero does NOT use the reveal system. It has its own entrance (11.6.1, "Hero entrance").

#### 11.6.1 Hero (HTML L3972-4016, CSS L826-879 and L958-988, JS L5230-5640)

##### Layout
- `header.page-hero.ct-hero#ct-hero` (L3972). From `.page-hero` (L300): `position:relative;min-height:min(100svh,1000px);display:flex;flex-direction:column;justify-content:center`. Own rule L826: `#contact .ct-hero{padding-top:clamp(64px,10vh,140px);padding-bottom:clamp(64px,9vh,110px);overflow:hidden;overflow:clip}` (overrides the page hero padding).
- `div.wrap.ct-hero__wrap` (L3973): `position:static` (L827), so the absolute scroll cue is placed against the header, not the wrap.
- `div.ct-hero__bar.ct-in[style="--i:0"]` (L3974), then `div.ct-hero__grid` (L3980) with two columns `div.ct-hero__l#ct-hero-l` (L3981) and `div.ct-hero__r#ct-hero-r` (L3999), then `a.ct-cue.ct-in` (L4014).
- Grid (L834): `display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);gap:clamp(24px,4vw,72px);align-items:center`.
- `.ct-hero__l{min-width:0;will-change:transform,opacity}` (L835). `.ct-hero__r{min-width:0;will-change:transform,opacity;transform-origin:60% 45%}` (L836). Both get inline transform and opacity from the scroll exit.
- JS state classes on `#ct-hero`: `is-play` (entrance), `is-live` (2400ms after `is-play`, starts the arc pulse), `is-hours` (Lahore is inside working hours).

##### Availability bar (L3974-3978, CSS L828-833, L837, L961-964, L1561-1563)
- Markup: `div.ct-hero__bar.ct-in[style="--i:0"] > div.ct-hero__meta > span.pill.ct-hero__pill > (span.dot-live[aria-hidden="true"] + text "Available for Projects")`.
- `.ct-hero__bar{position:relative;display:flex;justify-content:space-between;align-items:center;gap:12px 16px;padding-bottom:16px;margin-bottom:clamp(26px,6vh,64px)}` (L828), then the "Phase 3" override at L1562: `#contact .ct-hero__bar{justify-content:flex-start;padding-bottom:0}`.
- `.ct-hero__meta{display:flex;align-items:center;gap:22px}` (L829).
- Bottom rule `.ct-hero__bar::after` (L830: 1px `var(--line-strong)`, drawn with `scaleX(0)` to none over `1.4s var(--ease-io) .15s`, L962, L964) is switched off by L1563 `#contact .ct-hero__bar::after{display:none}`. Do not build it.
- `.ct-hero__count` rules (L831-833) have no element in the markup. Do not build them.
- Pill: `.pill` (L151: `height:34px;padding:0 14px;gap:8px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--line);color:var(--brand-ink);font-size:.82rem;font-weight:600;box-shadow:var(--shadow-sm)`) with `.ct-hero__pill{height:32px;font-size:.8rem}` (L837). Dot: `.dot-live` 8px accent with `fh-ping 2.4s var(--ease-out) infinite` (L152-153).
- Entrance: the bar is a `.ct-in` with `--i:0` but its start transform is `translate3d(0,-10px,0)` (L961), so it drops in from above (delay 40ms).

##### Title (L3982, CSS L838-841, L965-968, JS L5565-5566)
- Markup: `h2.hero-title.ct-title#ct-title` = `<span class="ct-title__a">Let’s</span><br><span class="serif grad-text">Connect</span>` (apostrophe is U+2019 from `&rsquo;`). No `data-split` attribute.
- `.hero-title` (L306): `font-weight:800;color:var(--ink)`. Own rules:
  - `#contact .ct-title{font-size:clamp(3.5rem,min(10.4vw,16vh),9.5rem);letter-spacing:-.058em;line-height:.9}` (L838)
  - `#contact .ct-title .serif{display:inline-block;font-size:1.08em;letter-spacing:-.035em;padding:0 .14em .06em 0;line-height:.95}` (L839). `.serif` is Instrument Serif italic 400 (L118), `.grad-text` is `var(--grad-glow)` clipped to text (L119).
  - `#contact .ct-title br + .w{margin-left:clamp(.3em,5vw,.95em)}` (L840): row 2 ("Connect") is indented.
  - `#contact .ct-title .w{padding-right:.04em}` (L841).
- Split: contact.js calls `FH.split(title)` itself (L5565). Result: `span.ct-title__a > span.w > span "Let’s"` and `span.w > span > span.serif.grad-text "Connect"` (the `.serif` element is wrapped whole, L4584-4586). Then it overwrites each `--d`: `170 + i * 130` ms, so "Let’s" = 170ms and "Connect" = 300ms (L5566).
- Motion: `.w>span` starts at `translate3d(0,105%,0)` with `transition:transform 1s var(--ease-out)` and `transition-delay:var(--d)` (L190); this page sets `transition-duration:1.15s` (L965) and releases on `.ct-hero.is-play .w>span{transform:none}` (L967). The `.serif` word also starts at `filter:blur(10px)` with `transition:filter 1.2s var(--ease-out) .35s` (L966) and clears on `is-play` (L968).
- Port: render the two words already split in JSX (`span.w > span` with `style={{'--d':'170ms'}}` and `'300ms'`), do not run a runtime splitter.

##### Lead (L3983, CSS L842)
- `p.lead.ct-hero__lead.ct-in[style="--i:5"]`: "Ready to bring your ideas to life with AI? Whether you need an intelligent web application, an AI-powered product with LLM integration, or expert consultation, I'm here to help turn your vision into reality."
- `.lead` (L122) plus `#contact .ct-hero__lead{max-width:50ch;margin-top:clamp(16px,2.8vh,30px);font-size:clamp(1rem,min(1.25vw,2.2vh),1.16rem)}`.

##### Actions (L3984-3991, CSS L843-864)
- `div.ct-hero__acts` (L843): `display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:clamp(20px,3.4vh,34px)`.
- Button 1: `a.btn.btn--primary.ct-hact.ct-in[style="--i:6"][href="#ct-form"][data-magnetic="0.18"]`, text "Send a message", then `span.ct-hact__ic[aria-hidden="true"] > svg.i > use #ct-i-down`.
  - `.ct-hact{--h:56px;padding:0 24px;font-size:.96rem}` (L844); `.btn--primary.ct-hact{padding-right:8px;gap:14px}` (L845).
  - Icon disc: `.ct-hact__ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.16);transition:transform .6s var(--ease-out),background-color .4s}` (L846); hover `.ct-hact:hover .ct-hact__ic{transform:translateY(3px);background:rgba(255,255,255,.26)}` (L847). `.ct-hact .i{width:18px;height:18px}` (L848).
  - Click: the core anchor handler (L4713-4723) keeps the route and calls `FH.scrollToEl(#ct-form)`: target top minus 84px under 1024px wide, minus 32px from 1024px (L4687), smooth.
  - Magnetic (L4626-4631, fine pointer and no reduced motion only): on `pointermove` inline `transform: translate(x,y)` with `x=(clientX-left-width/2)*0.18`, `y=(clientY-top-height/2)*0.18` (1 decimal); `pointerleave` clears it.
  - Shared `.btn--primary` sheen (L139-140) and hover shadow `0 16px 40px -12px rgba(14,102,85,.7)` (L141), `:active` `scale(.97)` (L145).
- Button 2: `button.btn.btn--ghost.ct-hact.ct-in[type="button"][style="--i:7"][data-book]` = `svg.i[aria-hidden="true"] > use #i-calendar` + "Book a meeting". `.ct-hact.btn--ghost .i{color:var(--brand-ink);transition:transform .5s var(--ease-out)}` (L849), hover `translateY(-2px)` (L850). Click opens the booking modal with no preset type (`FH.openBooking('')`, L4658).
- Email pill: `div.ct-mail.ct-in[style="--i:8"]` (L3987):
  - `a.ct-mail__a[href="mailto:mehrfaisal111@gmail.com"][title="mehrfaisal111@gmail.com"]` = `svg.i[aria-hidden] > use #i-mail` + `<span>Email</span>`.
  - `button.ct-mail__copy#ct-copy[type="button"][data-copy="mehrfaisal111@gmail.com"][aria-label="Copy email address mehrfaisal111@gmail.com"]` = `svg.i.ct-mail__ic1 > use #ct-i-copy`, `svg.i.ct-mail__ic2 > use #i-check`, `span.ct-mail__tip[aria-hidden="true"]` "Copy email".
  - CSS: `.ct-mail{position:relative;display:inline-flex;align-items:stretch;height:56px;border-radius:var(--r-pill);background:var(--surface);border:1px solid var(--line-strong);box-shadow:var(--shadow-sm);transition:border-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out)}` (L852); hover `border-color:var(--brand)` (L853).
  - `.ct-mail__a{display:inline-flex;align-items:center;gap:10px;padding:0 16px 0 22px;font-weight:600;font-size:.96rem;color:var(--brand-ink);border-radius:var(--r-pill) 0 0 var(--r-pill)}` (L854); icon 18px with `transition:transform .5s var(--ease-out)`, hover `translate(2px,-2px)` (L855-856).
  - `.ct-mail__copy{position:relative;width:52px;display:grid;place-items:center;color:var(--ink-2);border-left:1px solid var(--line);border-radius:0 var(--r-pill) var(--r-pill) 0;transition:background-color var(--dur-1),color var(--dur-1)}` (L857); hover `background:var(--brand-soft);color:var(--brand-ink)` (L858).
  - Both icons share one grid cell: `.ct-mail__copy .i{grid-area:1/1;width:18px;height:18px;transition:opacity .3s var(--ease-out),transform .5s var(--ease-out)}` (L859). Check icon starts hidden: `.ct-mail__ic2{opacity:0;transform:scale(.4);color:var(--accent);stroke-width:2.6}` (L860). With `.is-done`: copy icon `opacity:0;transform:scale(.4)`, check icon `opacity:1;transform:none` (L861-862).
  - Tooltip: `.ct-mail__tip{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translate(-50%,4px);white-space:nowrap;padding:6px 10px;border-radius:9px;background:var(--ink);color:var(--bg);font-size:.72rem;font-weight:600;opacity:0;pointer-events:none;transition:opacity .3s var(--ease-out),transform .4s var(--ease-out)}` (L863). Shown (`opacity:1;transform:translate(-50%,0)`) on `:hover`, `:focus-visible` or `.is-done` (L864).
  - Behaviour: 11.6.7 B10 "Copy email".

##### Stats (L3992-3996, CSS L865-872)
- `dl.ct-stats.ct-hero__stats` with three `div.ct-stat.ct-in` (`--i:9`, `--i:10`, `--i:11`), each `dt` + `dd.stat-num > span[data-ct-count][data-suffix]`:

| dt | span | Initial text |
|---|---|---|
| Response Time | `data-ct-count="24" data-suffix="h"` | 24h |
| Projects Completed | `data-ct-count="10" data-suffix="+"` | 10+ |
| Client Satisfaction | `data-ct-count="100" data-suffix="%"` | 100% |

- The attribute is `data-ct-count`, NOT `data-count`, so the core counter (L4613) ignores them; the hero count up runs on every page show (11.6.7 B6 "Entrance").
- `.ct-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;border-top:1px solid var(--line-strong)}` (L866); `.ct-hero__stats{margin-top:clamp(24px,4.4vh,44px);max-width:560px}` (L867).
- `.ct-stat{display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:8px;padding:18px 12px 0 0;min-width:0}` (L868): the number shows ABOVE the label although `dt` comes first in the DOM. `.ct-stat + .ct-stat{padding-left:clamp(14px,2vw,24px);border-left:1px solid var(--line)}` (L869).
- `dt{font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);line-height:1.4}` (L870); `dd{margin:0}` (L871).
- Number: `.stat-num` (L173: `font-weight:800;letter-spacing:-.04em;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums`) with `.ct-hero__stats .stat-num{font-size:clamp(1.7rem,min(2.6vw,4.4vh),2.4rem)}` (L872).

##### Scroll cue (L4014, CSS L873-879)
- `a.ct-cue.ct-in[style="--i:12"][href="#ct-ways"]` = `span.ct-cue__c[aria-hidden="true"] > svg.i > use #ct-i-down` + `span.label` "Scroll to reach me".
- `.ct-cue{position:absolute;left:0;right:0;margin:auto;width:max-content;bottom:clamp(14px,2.4vh,30px);display:inline-flex;align-items:center;gap:12px;color:var(--muted)}` (L874): centred at the bottom of the header.
- `.ct-cue__c{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-strong);color:var(--brand-ink);transition:transform .6s var(--ease-out),background-color .4s,color .4s,border-color .4s}` (L875); icon 15px (L876).
- Hover: circle `transform:translateY(3px);background:var(--grad);color:#fff;border-color:transparent` (L877); label `color:var(--brand-ink)` (L878) with `transition:color var(--dur-1)` (L879).
- Click scrolls to `#ct-ways` (same core handler as "Send a message").
- Hidden under 1024px (L1175). On desktop the scroll exit writes its inline opacity (11.6.7 B7 "Scroll linked exit").

##### Hero entrance (CSS L958-988)
Every element with `.ct-in` (bar, lead, 2 buttons, mail pill, 3 stats, clock card, cue) starts hidden and animates in when `#ct-hero` gets `.is-play`:
- Start (L959): `opacity:0;transform:translate3d(0,24px,0);filter:blur(6px)`.
- Transition (L960): `opacity .9s var(--ease-out),transform 1.05s var(--ease-out),filter .9s var(--ease-out)`, `transition-delay:calc(var(--i,0) * 75ms + 40ms)`.
- End (L963): `.js .ct-hero.is-play .ct-in{opacity:1;transform:none;filter:none}`.
- Exceptions: the bar starts at `translate3d(0,-10px,0)` (L961); the clock card starts at `translate3d(-14px,22px,0)` with `transition-delay:1.2s` (L969).

| Element | `--i` | Delay |
|---|---|---|
| `.ct-hero__bar` | 0 | 40ms |
| title words | n/a | transform 1.15s at 170ms ("Let’s") and 300ms ("Connect"); the serif word also unblurs over 1.2s after .35s |
| `.ct-hero__lead` | 5 | 415ms |
| "Send a message" | 6 | 490ms |
| "Book a meeting" | 7 | 565ms |
| `.ct-mail` | 8 | 640ms |
| stat 1, 2, 3 | 9, 10, 11 | 715ms, 790ms, 865ms |
| `.ct-clock` card | 9 | 1.2s (override) |
| `.ct-cue` | 12 | 940ms |

- The orb entrance (same trigger) is in 11.6.2 "Orb entrance".
- All `.js` prefixed: the rebuild must render the hidden start state only after hydration logic is ready, or set a `js` class on `<html>` like the reference (L2881).

##### Hero responsive
- max-width 1023px (L1171-1177): `#contact .ct-hero{padding-top:104px;padding-bottom:40px}`; grid `grid-template-columns:1fr;gap:clamp(36px,7vw,56px)` (text column first, orb below); title `font-size:clamp(3.5rem,13vw,7rem)`; `.ct-cue{display:none}`; `.ct-hero__stats{max-width:none}`. Also `.page-hero{min-height:auto;padding-top:108px}` (L301), overridden to 104px by the contact rule.
- max-width 600px (L1183-1199):
  - title `font-size:clamp(3.6rem,22vw,6rem)`; `br + .w{margin-left:.55em}`.
  - `.ct-hero__bar{margin-bottom:28px;flex-wrap:wrap}`; `.ct-hero__meta{display:contents}`; `.ct-hero__pill{order:3}`; `.ct-hero__count{order:2}` (no such element).
  - `.ct-hero__acts{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}`; the primary button spans both columns (`grid-column:1 / -1`); row 2 is "Book a meeting" (1fr) plus the mail pill (auto).
  - `.ct-hact{--h:54px;justify-content:space-between;width:100%;padding:0 20px}`; `.btn--primary.ct-hact{padding-left:24px}` (right padding stays 8px from L845, which is more specific).
  - `.ct-mail{height:54px}`; `.ct-mail__a{padding:0 14px 0 18px}`.
  - `.ct-orb{max-width:none;margin:0 -6px;width:calc(100% + 12px)}`.
  - `.ct-hero__stats .stat-num{font-size:1.8rem}`; `.ct-stat dt{font-size:.64rem;letter-spacing:.08em}`; `.ct-stat .stat-num{font-size:1.8rem}`.
- Reduced motion (L1556-1559): `.ct-hero *,.ct-hero *::after,.ct-hero .w>span{transition-delay:0s!important}` plus the global `transition-duration:.001ms!important` (L358), so the whole entrance lands at once.

#### 11.6.2 The orb: 24h dial and globe (HTML L3999-4011, CSS L881-938 and L970-988, JS L5230-5629)

It is ONE inline SVG (`svg.ct-orb__svg#ct-orb-svg`, `viewBox="0 0 500 500"`, `aria-hidden="true"`, `focusable="false"`, empty in the HTML, L4001), not a canvas. JS fills it once with static parts (L5309-5370) and then rewrites a few path `d` attributes and transforms on each render (L5372-5468). There is NO land data: no continents, no dots, no outlines. The globe shows only a graticule, the Lahore parallel, a day and night shade, the arc and the two markers. Do not add land.

##### Markup around the SVG (L3999-4011)
```
div.ct-hero__r#ct-hero-r
  figure.ct-orb#ct-orb
    svg.ct-orb__svg#ct-orb-svg[viewBox="0 0 500 500"][aria-hidden="true"][focusable="false"]
    figcaption.ct-clock.ct-in#ct-clock-card[style="--i:9"]   (the clock card, 11.6.3)
```
- `.ct-orb{position:relative;margin:0;width:100%}` (L882). `.ct-orb__svg{display:block;width:100%;height:auto;aspect-ratio:1;overflow:visible}` (L883).
- After the first `fit()` JS adds `.is-fit` and CSS variables on `#ct-orb` (see "Composition" below): `.ct-orb.is-fit{height:var(--ct-h)}` (L886); `.ct-orb.is-fit .ct-orb__svg{position:absolute;left:var(--ct-sx);top:var(--ct-sy);width:var(--ct-s);height:var(--ct-s)}` (L887); `.ct-orb.is-fit .ct-clock{position:absolute;left:var(--ct-kx);top:var(--ct-ky);right:auto;bottom:auto;width:var(--ct-kw);margin:0}` (L888). Before `.is-fit` the SVG is a plain square and the card sits under it (`margin:16px 0 0`, L941).

##### Constants (L5233-5234, L5476)
- `C = 250` (centre of the 500 box), `RG = 146` (globe radius), `RD = 194` (dial ring radius), `D2R = Math.PI / 180`.
- Lahore: `LHR = { lat:31.52, lon:74.36 }`. Lahore offset `PKT = 300` minutes (UTC+5, no DST).
- Composition: `KR = 203 / 500` (dial reach radius as a share of the SVG size: ring plus the "now" dot), `KV = 216 / 500` (reach below the centre), `PADE = .05` (the SVG is pushed out past the top right of the column by 5 percent of its size).
- `f1(n) = Math.round(n * 10) / 10` (L5307): every coordinate written to the DOM is rounded to 1 decimal. JS prints `444`, not `444.0`.
- Dial angle helper `pol(h, r)` (L5311): `a = (h - 12) * 15 * D2R`, point `[C + r * sin(a), C - r * cos(a)]`. Hour 12 (noon) is at the TOP, 00 at the bottom, 06 on the left, 18 on the right; hours run clockwise.

##### Static SVG, built once, in this exact order (L5312-5370)
1. `defs`:
   - `radialGradient#ct-orb-fill[cx="36%"][cy="30%"][r="80%"]`: `stop[offset="0"].ct-s-a`, `stop[offset="1"].ct-s-b`.
   - `linearGradient#ct-orb-wg[gradientUnits="userSpaceOnUse"]` from `p9 = pol(9, RD)` to `p18 = pol(18, RD)`, UNROUNDED: `x1="112.82128444980978" y1="112.82128444980978" x2="444" y2="250"`: `stop[offset="0"].ct-s-d`, `stop[offset="1"].ct-s-c`.
   - `linearGradient#ct-orb-ag[gradientUnits="userSpaceOnUse"][x1="0"][y1="0"][x2="500"][y2="0"]`: `stop[offset="0"].ct-s-d`, `stop[offset="1"].ct-s-c`.
   - `linearGradient#ct-orb-bg[x1="0"][y1="0"][x2="0"][y2="1"]`: `stop[offset="0"].ct-s-e`, `stop[offset="1"].ct-s-f`.
   - `radialGradient#ct-orb-shade[cx="40%"][cy="36%"][r="68%"]`: `stop[offset=".55"].ct-s-g`, `stop[offset="1"].ct-s-h`.
   - `clipPath#ct-orb-clip > circle[cx=250][cy=250][r=146]`.
   - `filter#ct-orb-soft[x="-20%"][y="-20%"][width="140%"][height="140%"] > feGaussianBlur[stdDeviation="5"]`.
2. `circle.ct-orb__glow[cx=250][cy=250][r=172]` (`RG + 26`).
3. `g.ct-orb__dial`:
   - `circle.ct-orb__ring[cx=250][cy=250][r=194][pathLength=1][transform="rotate(-90 250 250)"]` (the rotate makes the draw-in start at the top).
   - `circle.ct-orb__ring2[cx=250][cy=250][r=162]` (`RG + 16`).
   - `g.ct-orb__ticks`: 24 `line`s, hour `h` = 0 to 23, from `pol(h, 194)` to `pol(h, 194 - (q ? 11 : 6))` where `q = h % 6 === 0`; class `ct-orb__tick` plus `ct-orb__tick--q` when `q`. For the 4 quarter hours also `text.ct-orb__hl` at `pol(h, 170)` with text `pad(h)`: "00" at (250,420), "06" at (80,250), "12" at (250,80), "18" at (420,250). Computed tick ends (x1,y1 to x2,y2):

| h | line | h | line |
|---|---|---|---|
| 00 q | 250,444 to 250,433 | 12 q | 250,56 to 250,67 |
| 01 | 199.8,437.4 to 201.3,431.6 | 13 | 300.2,62.6 to 298.7,68.4 |
| 02 | 153,418 to 156,412.8 | 14 | 347,82 to 344,87.2 |
| 03 | 112.8,387.2 to 117.1,382.9 | 15 | 387.2,112.8 to 382.9,117.1 |
| 04 | 82,347 to 87.2,344 | 16 | 418,153 to 412.8,156 |
| 05 | 62.6,300.2 to 68.4,298.7 | 17 | 437.4,199.8 to 431.6,201.3 |
| 06 q | 56,250 to 67,250 | 18 q | 444,250 to 433,250 |
| 07 | 62.6,199.8 to 68.4,201.3 | 19 | 437.4,300.2 to 431.6,298.7 |
| 08 | 82,153 to 87.2,156 | 20 | 418,347 to 412.8,344 |
| 09 | 112.8,112.8 to 117.1,117.1 | 21 | 387.2,387.2 to 382.9,382.9 |
| 10 | 153,82 to 156,87.2 | 22 | 347,418 to 344,412.8 |
| 11 | 199.8,62.6 to 201.3,68.4 | 23 | 300.2,437.4 to 298.7,431.6 |

   - Working hours band, 09:00 to 18:00 PKT, clockwise over the top: `arcD = "M112.8,112.8A194,194 0 0 1 444,250"`. `path.ct-orb__work-halo[d=arcD]` then `path.ct-orb__work[d=arcD][pathLength=1]`.
   - Label path: `path#ct-orb-tp[d="M103.6,103.6A207,207 0 0 1 457,250"][fill="none"]` (radius `RD + 13`).
   - `text.ct-orb__wlabel > textPath[href="#ct-orb-tp"][startOffset="50%"][text-anchor="middle"]`, text `Mon\u2013Fri · 9AM\u20136PM PKT` (two en dashes, one middle dot; CSS uppercases it).
   - `g.ct-orb__now` (rotated every second, 11.6.3): `line.ct-orb__hand[x1=250][y1=98][x2=250][y2=62]` (`C - RG - 6` to `C - RD + 6`), `circle.ct-orb__nowping[cx=250][cy=56][r=6]`, `circle.ct-orb__nowdot[cx=250][cy=56][r=5.5]`. Drawn pointing at 12 (top); the rotation moves it.
4. `g.ct-orb__g` (the globe):
   - `circle.ct-orb__disc[cx=250][cy=250][r=146]`.
   - `path.ct-orb__back` (graticule behind), `path.ct-orb__night[clip-path="url(#ct-orb-clip)"][filter="url(#ct-orb-soft)"]`, `path.ct-orb__front` (graticule in front), `path.ct-orb__par` (Lahore parallel). All four `d` values are written per render.
   - `circle.ct-orb__shade[cx=250][cy=250][r=146]`.
   - `path.ct-orb__shine[d="M366.6,325.7A139,139 0 0 1 299.8,379.8"]` (from `pol(20.2, RG - 7)` to `pol(22.6, RG - 7)`: a short rim highlight on the lower right).
5. `g.ct-orb__lead` (leader line from the clock card to Lahore): `path.ct-orb__lead-l`, `circle.ct-orb__lead-d[r=3.2]`.
6. `g.ct-orb__link`:
   - `path.ct-orb__arc-bed`, `path.ct-orb__arc[pathLength=1]`, `path.ct-orb__pulse[pathLength=1]` (same `d`, written per render).
   - `g.ct-orb__you` (visitor marker, translated per render): `circle[r=6]`, `circle.ct-orb__ydot[r=2.2]`, `text.ct-orb__lbl[x=10][y=4]` "You". If the visitor counts as "same place" the whole group gets `style.display = 'none'`; otherwise its text becomes `"You · " + city` (L5370).
   - `g.ct-orb__pin` (Lahore marker, translated per render): `rect.ct-orb__beam[x=-1][y=-66][width=2][height=62]`, `rect.ct-orb__beamdot[x=-1.6][y=-18][width=3.2][height=14][rx=1.6]`, `circle.ct-orb__ping[r=9]`, `circle.ct-orb__ping.ct-orb__ping--b[r=9]`, `circle.ct-orb__halo[r=17]`, `circle.ct-orb__core[r=6]`, `text.ct-orb__lbl.ct-orb__lbl--l[x=12][y=-8]` "Lahore" (moved by the label placer after the first render).
- Paint order is exactly this list: glow, dial, globe, leader, link. The dial sits BEHIND the globe; the leader line and the arc sit in front.

##### Orb styles (L889-938, L1051)
| Class | Rule |
|---|---|
| `.ct-orb__lead-l` | `fill:none;stroke:var(--brand-ink);stroke-width:1.1;stroke-dasharray:1.5 4;stroke-linecap:round;opacity:.5` (dark `opacity:.6`, L891) |
| `.ct-orb__lead-d` | `fill:var(--surface);stroke:var(--brand-ink);stroke-width:1.4` |
| `.ct-orb__glow` | `fill:var(--accent-soft);filter:blur(28px)` |
| `.ct-orb__ring` | `fill:none;stroke:var(--line-strong);stroke-width:1` |
| `.ct-orb__ring2` | `fill:none;stroke:var(--line);stroke-width:1;stroke-dasharray:1 5` |
| `.ct-orb__tick` | `stroke:var(--ink-2);stroke-width:1;opacity:.28` |
| `.ct-orb__tick--q` | `opacity:.55;stroke-width:1.3` |
| `.ct-orb__hl` | `font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;fill:var(--muted);text-anchor:middle;dominant-baseline:central` |
| `.ct-orb__work` | `fill:none;stroke:url(#ct-orb-wg);stroke-width:3.2;stroke-linecap:round;opacity:.55;transition:opacity .8s var(--ease-out)`; `.ct-hero.is-hours` gives `opacity:1` (L899) |
| `.ct-orb__work-halo` | `fill:none;stroke:var(--accent);stroke-width:12;stroke-linecap:round;opacity:0;filter:blur(6px);transition:opacity .8s var(--ease-out)`; `.ct-hero.is-hours` gives `opacity:.22` (L901) |
| `.ct-orb__wlabel` | `font-family:var(--font-mono);font-size:9.5px;letter-spacing:.2em;fill:var(--brand-ink);text-transform:uppercase` |
| `.ct-orb__hand` | `stroke:var(--accent);stroke-width:1.2;stroke-dasharray:2 4;opacity:.7` |
| `.ct-orb__nowdot` | `fill:var(--accent);stroke:var(--bg);stroke-width:3`; outside hours `fill:var(--muted)` (L906) |
| `.ct-orb__nowping` | `fill:none;stroke:var(--accent);stroke-width:1.2;transform-box:fill-box;transform-origin:center;animation:ct-ping 3.2s var(--ease-out) infinite`; outside hours `stroke:var(--muted)` (L907) |
| `.ct-orb__disc` | `fill:url(#ct-orb-fill);stroke:var(--line-strong);stroke-width:1` |
| `.ct-orb__back` | `fill:none;stroke:var(--brand-ink);stroke-width:.7;opacity:.08` |
| `.ct-orb__front` | `fill:none;stroke:var(--brand-ink);stroke-width:.8;opacity:.26` |
| `.ct-orb__shade` | `fill:url(#ct-orb-shade);pointer-events:none` |
| `.ct-orb__par` | `fill:none;stroke:var(--accent);stroke-width:1;stroke-dasharray:3 4;opacity:.55` |
| `.ct-orb__night` | `fill:var(--brand-900);opacity:.11` (dark `fill:#000;opacity:.42`, L919) |
| `.ct-orb__shine` | `fill:none;stroke:var(--surface);stroke-width:2;opacity:.8;stroke-linecap:round` (dark `stroke:var(--brand-ink);opacity:.18`, L921) |
| `.ct-orb__arc-bed` | `fill:none;stroke:var(--accent-soft);stroke-width:7;stroke-linecap:round` |
| `.ct-orb__arc` | `fill:none;stroke:url(#ct-orb-ag);stroke-width:1.7;stroke-linecap:round` |
| `.ct-orb__pulse` | `fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-dasharray:.1 3;stroke-dashoffset:.1;opacity:0`; `.ct-hero.is-live` runs `ct-travel 6.4s var(--ease-io) infinite` (L938) |
| `.ct-orb__you circle` | `fill:var(--surface);stroke:var(--brand-ink);stroke-width:2` |
| `.ct-orb__you .ct-orb__ydot` | `fill:var(--brand-ink);stroke:none` |
| `.ct-orb__lbl` | `font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;fill:var(--ink-2);paint-order:stroke;stroke:var(--surface-2);stroke-width:4px;stroke-linejoin:round` |
| `.ct-orb__lbl--l` | `font-family:var(--font-sans);font-size:14px;font-weight:700;letter-spacing:-.01em;text-transform:none;fill:var(--ink)` |
| `.ct-orb__halo` | `fill:var(--accent-soft)` |
| `.ct-orb__core` | `fill:var(--brand);stroke:var(--surface);stroke-width:3` (dark `fill:var(--accent);stroke:var(--surface)`, L931) |
| `.ct-orb__ping` | `fill:none;stroke:var(--accent);stroke-width:1.3;transform-box:fill-box;transform-origin:center;animation:ct-ping 3.4s var(--ease-out) infinite`; `--b` adds `animation-delay:1.7s` |
| `.ct-orb__beam` | `fill:url(#ct-orb-bg)` |
| `.ct-orb__beamdot` | `fill:var(--accent);transform-box:fill-box;animation:ct-beam 3.4s var(--ease-io) infinite` |

Gradient stop classes (L909-911, L915-916): `.ct-s-a{stop-color:var(--surface)}`, `.ct-s-b{stop-color:var(--surface-3)}`, `.ct-s-c{stop-color:var(--accent)}`, `.ct-s-d{stop-color:var(--brand)}`, `.ct-s-e{stop-color:var(--accent);stop-opacity:0}`, `.ct-s-f{stop-color:var(--accent);stop-opacity:.9}`, `.ct-s-g{stop-color:var(--brand);stop-opacity:0}`, `.ct-s-h{stop-color:var(--brand);stop-opacity:.16}`, dark `.ct-s-h{stop-color:#000;stop-opacity:.45}`. Stop colours come from CSS, so every gradient follows the theme.

Keyframes:
- `@keyframes ct-ping{0%{transform:scale(1);opacity:.85}100%{transform:scale(4.4);opacity:0}}` (L1051, shared with the map).
- `@keyframes ct-beam{0%{transform:translateY(0);opacity:0}15%{opacity:1}70%{opacity:.9}100%{transform:translateY(-58px);opacity:0}}` (L936). The dot rises 58 SVG units up the beam.
- `@keyframes ct-travel{0%{stroke-dashoffset:.1;opacity:0}8%{opacity:1}46%{stroke-dashoffset:-1;opacity:1}50%,100%{stroke-dashoffset:-1;opacity:0}}` (L937). With `pathLength=1` and dash `.1 3`, a short bright dash runs along the arc from the visitor (path start) to Lahore (path end) in the first 46 percent of 6.4s, then rests hidden.

##### Orb entrance (CSS L970-988, trigger `.ct-hero.is-play`)
| Target | Start | Transition | End (`.is-play`) |
|---|---|---|---|
| `.ct-orb__g` (globe) | `opacity:0;transform:scale(.86) rotate(-6deg);transform-box:view-box;transform-origin:250px 250px` | `opacity 1.1s var(--ease-out) .15s, transform 1.5s var(--ease-out) .1s` | `opacity:1;transform:none` |
| `.ct-orb__ring` | `stroke-dasharray:1 1.02;stroke-dashoffset:1` | `stroke-dashoffset 1.6s var(--ease-io) .1s, opacity .8s var(--ease-out)` | `stroke-dashoffset:0` (draws clockwise from 12) |
| `.ct-orb__work` | same dash start | `stroke-dashoffset 1.1s var(--ease-io) .75s, opacity .8s var(--ease-out) 0s` (L973-974) | `stroke-dashoffset:0`; `opacity:.55`, or 1 with `.is-hours` (L987-988) |
| `.ct-orb__ticks`, `.ct-orb__ring2` | `opacity:0` | `opacity 1s var(--ease-out) .55s` | `opacity:1` |
| `.ct-orb__wlabel` | `opacity:0` | `opacity 1s var(--ease-out) 1.05s` | `opacity:1` |
| `.ct-orb__now` | `opacity:0` | `opacity 1s var(--ease-out) 1.2s` | `opacity:1` |
| `.ct-orb__you` | `opacity:0` | `opacity .7s var(--ease-out) .85s` | `opacity:1` |
| `.ct-orb__arc` | `stroke-dasharray:1 1.02;stroke-dashoffset:1` | `stroke-dashoffset 1.2s var(--ease-io) .9s` | `stroke-dashoffset:0` (draws from the visitor to Lahore) |
| `.ct-orb__arc-bed` | `opacity:0` | `opacity 1s var(--ease-out) 1.2s` | `opacity:1` |
| `.ct-orb__pin` | `opacity:0` | `opacity .7s var(--ease-out) 1.35s` | `opacity:1` |
| `.ct-orb__lead` | `opacity:0` | `opacity 1s var(--ease-out) 1.75s` | `opacity:1` |
| `.ct-clock` card | see 11.6.1 | delay 1.2s | |
| `.ct-orb__pulse` | hidden | starts with `.is-live` (2400ms after `.is-play`) | `ct-travel` loop |

Not animated in: `.ct-orb__glow`, `.ct-orb__work-halo` (only its `is-hours` fade), the `.ct-orb__pulse` (until `is-live`). Removing `.is-play` (page left) reverses all of these with the same timings, unseen because the page is hidden.

##### Visitor marker: guessed from the time zone (L5236-5259, L5266-5269)
Never exact, never asks for location.
1. `tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''` (in try/catch). `myOff = -new Date().getTimezoneOffset()` (minutes east of UTC, so Lahore is 300).
2. `same = myOff === PKT`.
3. `city`: `'UTC'` when `tz` is empty or matches `/^(Etc\/)?(UTC|GMT|UCT|Universal|Zulu)$/`; otherwise the last `/` segment of `tz` with `_` replaced by spaces (`America/New_York` gives `New York`).
4. `you`: `PLACES[tz]` (62 zones, table in 11.6.9 `visitorPlaces`) as `{lat, lon}`; else if `city === 'UTC'`: `{ lat:51.5, lon:-.1 }` (London); else latitude by the first `tz` segment `{ America:35, Europe:48, Africa:5, Australia:-30, Pacific:-15, Asia:28 }` (30 when not listed) and longitude `Math.max(-170, Math.min(170, myOff / 4))`.
5. `vY = vec(you)`, `vL = vec(LHR)`, `angDist = acos(clamp(dot(vY, vL), -1, 1))`. If `angDist < 4 * D2R` then `same = true` too.
6. `mid = same ? LHR : ll(slerp(vY, vL, .5))`.

Sphere helpers (L5262-5265):
- `vec(lat, lon) = [cos(lat)cos(lon), cos(lat)sin(lon), sin(lat)]` (degrees to radians with `D2R`).
- `ll(v)`: `n = hypot(v) || 1`, `lat = asin(v[2]/n)/D2R`, `lon = atan2(v[1], v[0])/D2R`.
- `dot(a, b)`; `slerp(a, b, t)`: `d = acos(clamp(dot))`; if `d < 1e-6` return a copy of `a`; else `a*sin((1-t)d)/sin(d) + b*sin(td)/sin(d)`.

##### Projection (L5275-5276, L5302-5306)
Orthographic, centred on the view point `(lat0, lon0)`:
```
p = lat*D2R, l = (lon - lon0)*D2R
x = cos(p) * sin(l)
y = cos(lat0) * sin(p) - sin(lat0) * cos(p) * cos(l)      (y points UP)
z = sin(lat0) * sin(p) + cos(lat0) * cos(p) * cos(l)      (z >= 0 is the visible face)
screen X(v, r) = 250 + v.x * 146 * (r || 1)
screen Y(v, r) = 250 - v.y * 146 * (r || 1)
```
- View state (L5302-5303): `lat0 = base.lat + sway.lat`, `lon0 = base.lon + sway.lon + scrollRot`; `setView()` caches `sin(lat0)` and `cos(lat0)`. `sway` comes from the ambient loop, `scrollRot` from the scroll exit.

##### Best starting view `base` (L5270-5299), computed once
Grid search, lowest score wins (strict `<`, so the first minimum in loop order is kept):
- `la` from -40 to 60 step 4 (outer loop); `dl` from -100 to 100 step 4 (inner loop); `lo = mid.lon + dl`. The `side` loop runs once (`side = 0`), `sx = -1` (the card side is lower left).
- `pl = prj(LHR)`; score starts at `|la - 22| * .012`. Skip if `pl.z < .25`.
- If `same`: add `(pl.x - .22)^2 + (pl.y - .12)^2` (Lahore a little right of and above the centre).
- Else: `py = prj(you)`, `pm = prj(mm)` with `mm = ll(slerp(vY, vL, .5))`. Skip if `py.z < .25`. For each of `py`, `pl`, `pm`: `+3` if `x * sx > .05 && y < .05` (lower left, where the card docks); `+2` if `y < -.55`; `+1` if `y > .8`. Then `n = cross(py, pl)`, add `(|n.z / |n|| - .45)^2 * 3` (a real curve, not a flat chord); add `.8` if `pm.y < (py.y + pl.y) / 2` (the arc must bow upward); add `(1 - py.z)*.5 + (1 - pl.z)*.5 + pm.x^2*.5 + (pm.y - .2)^2`.
- Fallback when nothing passes: `{ lat:20, lon:mid.lon, side:0 }`.
- Test values (computed with the reference code; use them in a unit test):

| tz | `myOff` | same | city | `you` | `base` |
|---|---|---|---|---|---|
| Asia/Karachi | 300 | true | Karachi | 24.9, 67 (hidden) | lat 24, lon 58.36 |
| America/New_York | -240 | false | New York | 40.7, -74 | lat 44, lon 7.8578 |
| Europe/London | 60 | false | London | 51.5, -0.1 | lat 24, lon 39.8858 |
| UTC | 0 | false | UTC | 51.5, -0.1 | lat 24, lon 39.8858 |
| Asia/Tokyo | 540 | false | Tokyo | 35.7, 139.7 | lat 20, lon 110.1389 |
| Australia/Sydney | 600 | false | Sydney | -33.9, 151.2 | lat -8, lon 92.1738 |
| America/Los_Angeles | -420 | false | Los Angeles | 34, -118.2 | lat 52, lon 146.8667 |
| Asia/Dubai | 240 | false | Dubai | 25.2, 55.3 | lat 16, lon 76.5433 |
| Africa/Accra (not in table) | 0 | false | Accra | 5, 0 | lat 0, lon 37.8049 |

##### Per-frame render `render()` = `setView(); graticule(); night(); linkRender();` (L5468)
Graticule (L5380-5397):
- Meridians: `lon` from -180 to 160 step 20 (18 lines), each sampled at `lat` -84 to 84 step 6.
- Parallels: `lat` -60 to 60 step 20 (7 lines), each sampled at `lon` -180 to 180 step 6.
- Each sampled point goes to the front string if `z >= 0`, else to the back string; a new run starts with `M` whenever the side changes, `L` otherwise. Coordinates `f1(X(v))`, `f1(Y(v))`. Writes `path.ct-orb__front` and `path.ct-orb__back`.
- Lahore parallel: `lat = 31.52`, `lon` -180 to 180 step 4, visible points only (`z >= 0`), runs broken where hidden. Writes `path.ct-orb__par`.

Sun position `sunVec()` (L5373-5379): `doy = (now - Date.UTC(year, 0, 0)) / 864e5` (day of year with fraction, UTC), `decl = -23.44 * cos(2π/365 * (doy + 10))`, `lon = -15 * (UTCHours + UTCMinutes/60 - 12)`, `sun = { lat:decl, lon:((lon + 540) % 360) - 180 }`. Updated at start and then only on a minute change where `minute % 5 === 0`.

Night side `night()` (L5398-5414), writes `path.ct-orb__night` (clipped to the globe, blurred 5):
1. `S = pv(sun.lat, sun.lon)`, `m = hypot(S.x, S.y)`.
2. If `m < 1e-3`: `d = ''` when `S.z > 0` (sun faces the viewer, no night visible), else a full disc `M104,250a146,146 0 1 0 292,0a146,146 0 1 0 -292,0`; return.
3. `u = [S.x/m, S.y/m]` (direction to the sun on screen), `v = [-u.y, u.x]`.
4. `W = cross(S, [v.x, v.y, 0])`, normalised; flip if `W.z < 0`.
5. Terminator (front half): for `i = 0..40`, `t = π*i/40`, point `cos(t)*v + sin(t)*W`; `M` then `L` to `(f1(250 + px*146), f1(250 - py*146))`.
6. Back along the limb through the side away from the sun: `a0 = atan2(-v.y, -v.x)`, `a1 = atan2(v.y, v.x)`, `am = atan2(-u.y, -u.x)`; `span = a1 - a0` wrapped into [0, 2π); `mid2 = am - a0` wrapped the same way; if `mid2 > span` then `span -= 2π`. For `i = 1..40`, `t = a0 + span*i/40`, `L (f1(250 + cos(t)*146*1.04), f1(250 - sin(t)*146*1.04))`. Close with `Z`.

Link and markers `linkRender()` (L5415-5432):
1. `L = pv(LHR)`. `g.ct-orb__pin` gets `transform="translate(f1(X(L)),f1(Y(L)))"` and `style.visibility = 'hidden'` when `L.z < -.05` (else `''`).
2. `leadRender(X(L), Y(L), L.z >= -.05)` (below).
3. If `same`: `placeL([X(L), Y(L)], null)`, remove `d` from arc, bed and pulse, and stop.
4. Else `Yv = pv(you)`; `g.ct-orb__you` gets `translate(f1(X(Yv)),f1(Y(Yv)))` (never hidden, even when it turns behind the globe).
5. Arc: `n = 56`, `lift = .08 + .2 * min(1, angDist / 1.6)`. For `i = 0..56`: `t = i/n`, `w = ll(slerp(vY, vL, t))`, `p = pv(w)`, `r = 1 + lift * sin(π t)`, point `[X(p, r), Y(p, r)]` (the great circle, pushed outward from the centre by up to `lift`). `d = M/L` of `f1` points. Same `d` on `.ct-orb__arc`, `.ct-orb__arc-bed`, `.ct-orb__pulse`. The path starts at the visitor and ends at Lahore.
6. `place(tYou, pts[0], pts[3])`, `arcPts = pts`, `placeL(pts[56], pts[53])`.

"You" label placer `place(txt, a, b, isL)` (L5434-5445; `isL` is never passed, so it is falsy):
- `dx, dy` = unit vector from `b` to `a` (pointing away from the arc).
- `away = dx > .35 ? 'start' : dx < -.35 ? 'end' : 'middle'`.
- `inward = a.x > 250 + 146*.45 ? 'end' : a.x < 250 - 146*.45 ? 'start' : null`.
- `anchor = inward ? ((away === inward || away === 'middle') ? inward : 'middle') : away`.
- `x = anchor === 'middle' ? 0 : (anchor === 'start' ? 11 : -11)`; `y = anchor === 'middle' ? (dy > 0 ? 21 : -13) : 4`.
- Only writes `text-anchor`, `x`, `y` (rounded) when the key `anchor + x + '|' + y` changed.

"Lahore" label placer `placeL(a, b)` (L5446-5467): picks right, left or below the pin, whichever box is clear of the arc and of the leader line and stays near the globe.
- `w = tL.getComputedTextLength()` (50 if it fails or is 0).
- Candidates `[anchor, x, y, boxX0, boxX1, boxY0, boxY1]` relative to the pin: `r = ['start', 18, -6, 18, 18 + w, -18, -1]`, `l = ['end', -18, -6, -18 - w, -18, -18, -1]`, `b = ['middle', 0, 32, -w/2, w/2, 20, 36]`.
- Score per candidate (box grown by 3 on every side): `+2` if any arc point is inside (only when `b` is given and `arcPts` exists); `+2` if the leader line (from the pin toward the card anchor, sampled from 13 to `min(length, 140)` step 3) enters the box; `+1` if the box leaves `x > 250 + 146*1.08`, `x < 250 - 146*1.08` or `y > 250 + 146*1.02`; `+.1` for any candidate other than `r`.
- Hysteresis: keep the current side if its score is within `.2` of the best. Only writes `text-anchor`, `x`, `y` on change.

Leader line `leadRender(px, py, vis)` (L5514-5520): hidden (`g.ct-orb__lead` `display:none`) when there is no card anchor (phones) or Lahore is behind. Else a straight path from the anchor to 13 SVG units short of the pin: `k = (m - 13)/m`, `d = "M ax,ay L ax + dx*k, ay + dy*k"`, and the small circle at the anchor.

##### Composition: dial and clock card never overlap `fit()` (L5470-5513)
Reads: `W = orb.clientWidth` (return if 0), `innerWidth`, `innerHeight`, `card.offsetHeight` (190 if 0), and on desktop `colL.offsetHeight`, the grid top and hero top from `getBoundingClientRect()`, and the hero `padding-bottom`.
- `two = innerWidth >= 1024`; `diag = W >= 440`.
- Card width `cw`: `diag ? round(min(two ? 252 : 262, W * .54)) : round(min(W - 12, two ? 300 : 460))`. Written as `--ct-kw` (px).
- `gap = diag ? 26 : 22`.
- `geo(S)` for SVG size `S`: `e = S*.05`; dial centre `cx = W + e - S/2`, `cy = S/2 - e`; reach `Rc = .406*S + gap`; `dx = cx - cw`; `bot = cy + .432*S`; `ky = dx >= Rc ? bot - ch : cy + sqrt(Rc^2 - dx^2)`; `ky = max(ky, cy + Rc*.66)` (keeps the card below the dial's equator so the leader climbs clear of the "06" label); `H = max(bot, ky + ch)`; `ky = max(ky, H - ch)`. Returns `{ S, sx: W + e - S, sy: -e, kx: 0, ky, H }`.
- Diagonal layout (`diag`): `Hmax = 1e9`; on desktop (`two`) `Hmax = max(440, lH + 8, min(lH + 48, room))` where `lH = colL.offsetHeight` and `room = innerHeight - (gridTop - heroTop) - heroPaddingBottom`. `hi = min(W / .9, two ? 600 : 540)`, `lo = 240`. If `geo(hi).H <= Hmax` use `geo(hi)`; else bisect 18 times (`m = (lo+hi)/2`, keep `lo = m` when it fits) and use `geo(lo)`. Card anchor for the leader: `ax = kx + cw - 34`, `anchor = [(ax - sx) * 500 / S, (ky - sy) * 500 / S]` (SVG units: top edge of the card, 34px in from its right edge).
- Stacked layout (phones, `W < 440`): `S = min(W, 480)`, `sx = (W - S)/2`, `sy = 0`, `kx = (W - cw)/2`, `ky = S/2 + .406*S + gap`, `H = ky + ch`, `anchor = null` (no leader line).
- Writes on `#ct-orb` (values rounded to 1 decimal plus `px`): `--ct-s`, `--ct-sx`, `--ct-sy`, `--ct-kx`, `--ct-ky`, `--ct-h`, then adds `.is-fit`, and renders once if the loop is not running.
- The card is always docked at `kx = 0` (bottom left). The comment at L5471-5473 talks about mirroring; the code never mirrors (comment L5273: on the right the card would sit under the chat button).
- Called: at start (L5559); `fitSoon()` (one `requestAnimationFrame`, previous one cancelled) from a `ResizeObserver` on `#ct-orb`, `#ct-hero-l` and `#ct-clock-card` (L5561), from `document.fonts.ready` (L5562) and from `resize` (L5602); directly on every `fh:page` for contact (L5624).

#### 11.6.3 Lahore clock card and the dial hand (HTML L4002-4009, CSS L940-956, JS L5522-5559)

##### Markup
```
figcaption.ct-clock.ct-in#ct-clock-card[style="--i:9"]
  span.sr-only#ct-orb-sr                                   (filled by JS once a minute)
  div.ct-clock__status[aria-hidden="true"]
    span.ct-clock__dot
    span#ct-h-status            "Checking hours"
  div.ct-clock__row.ct-clock__row--main[aria-hidden="true"]
    span.ct-clock__k            "Lahore " + em "PKT"
    span.ct-clock__v.mono#ct-h-lhr   "--:--:--"
  div.ct-clock__row[aria-hidden="true"]
    span.ct-clock__k            "You " + em#ct-h-city "Local"
    span.ct-clock__v.mono#ct-h-you   "--:--"
  p.ct-clock__diff[aria-hidden="true"]
    svg.i[aria-hidden="true"] > use #i-globe
    span#ct-h-diff              "Same time zone as Lahore"
  p.ct-clock__hrs[aria-hidden="true"]
    span                        "My hours, your time"
    b.mono#ct-h-hrs             "09:00 to 18:00"
```
The texts above are the HTML defaults; JS replaces them at once.

##### Styles
- `.ct-clock{position:relative;z-index:2;width:auto;margin:16px 0 0;padding:15px 17px 14px;border-radius:22px;background:var(--glass);border:1px solid var(--line);box-shadow:var(--shadow-lg);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4)}` (L941-942). With `.is-fit` it is absolute at `--ct-kx`, `--ct-ky`, width `--ct-kw` (L888).
- `.ct-clock__status{display:inline-flex;align-items:center;gap:8px;font-size:.74rem;font-weight:600;color:var(--brand-ink);margin-bottom:10px}` (L943).
- `.ct-clock__dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}` (L944); in hours `background:var(--accent);animation:fh-ping 2.4s var(--ease-out) infinite` (L945).
- `.ct-clock__row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:5px 0}` (L946); `.ct-clock__row + .ct-clock__row{border-top:1px dashed var(--line-strong)}` (L951).
- `.ct-clock__k{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}` (L947); `.ct-clock__k em{font-style:normal;color:var(--ink-2);margin-left:4px}` (L948).
- `.ct-clock__v{font-size:.95rem;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:.02em;white-space:nowrap}` (L949); main row `.ct-clock__row--main .ct-clock__v{font-family:var(--font-sans);font-size:1.7rem;font-weight:800;letter-spacing:-.04em;line-height:1}` (L950). Note the main value has class `mono` but the sans rule wins (more specific).
- `.ct-clock__diff{display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:10px;border-top:1px solid var(--line);font-size:.84rem;font-weight:650;color:var(--ink);letter-spacing:-.01em;line-height:1.35}` (L952); icon `width:15px;height:15px;color:var(--brand-ink);flex:none` (L953).
- `.ct-clock__hrs{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:6px;font-size:.72rem;color:var(--muted);line-height:1.4}` (L954); `span{white-space:nowrap}` (L955); `b{font-weight:500;color:var(--ink-2);white-space:nowrap;font-size:.7rem}` (L956).
- Entrance: start `translate3d(-14px,22px,0)`, delay 1.2s (L969).

##### Texts written once at start (L5524-5530)
- `#ct-h-city`: `same ? 'Lahore' : city`.
- `diff = PKT - myOff` (minutes), `a = |diff|`, `hh = floor(a/60)`, `mm = a % 60`, `txt = hh + 'h' + (mm ? ' ' + mm + 'm' : '')`.
- `#ct-h-diff`: `same` gives "Same time zone as Lahore"; `diff > 0` gives "You're " + txt + " behind Lahore"; else "You're " + txt + " ahead of Lahore" (straight apostrophe). Example New York in summer: "You're 9h behind Lahore"; Kolkata: "You're 0h 30m ahead of Lahore".
- `#ct-h-hrs`: Lahore 09:00 to 18:00 shown in the visitor's clock: `hm(540 - diff) + ' to ' + hm(1080 - diff)`, where `hm` wraps into 0 to 1439 and prints `HH:MM`. Example New York (EDT): "00:00 to 09:00".

##### Every second `tick()` (L5538-5558)
- Formatters (L5531-5535, try/catch): Lahore `new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Karachi', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' })`; visitor `new Intl.DateTimeFormat('en-GB', { hour:'2-digit', minute:'2-digit', hourCycle:'h23' })`. Fallbacks: manual `HH:MM:SS` from UTC plus 300 minutes, and local `HH:MM`.
- `pktParts(d)`: `u = new Date(d.getTime() + 300 * 6e4)`, read `getUTCHours/Minutes/Seconds/Day`.
- Writes `#ct-h-lhr` (`HH:MM:SS`), `#ct-h-you` (`HH:MM`).
- Dial hand: `ang = ((h + m/60 + s/3600) - 12) * 15`; `g.ct-orb__now` gets `transform="rotate(ang.toFixed(2) 250 250)"`. So at 12:00 PKT the dot is at the top, at 00:00 at the bottom, moving clockwise, 15 degrees per hour.
- Only when the minute changed (`lastMin`, starts at -1):
  - `open = weekday 1 to 5 && mins >= 540 && mins < 1080` (Mon to Fri, 09:00 to 17:59 PKT). `#ct-hero` toggles `.is-hours`.
  - Status text: open gives "In working hours now". Else: if a weekday before 09:00, back today; otherwise step to the next day, skipping Saturday and Sunday. `until = addDays*1440 + 540 - mins`. If `until < 1440`: "Offline, back in " + (`uh ? uh + 'h ' : ''`) + `um` + "m" (for example "Offline, back in 2h 5m", "Offline, back in 45m"); else "Offline, back " + day name + " 9AM" (day names "Sunday" to "Saturday", for example "Offline, back Monday 9AM").
  - `#ct-orb-sr`: "Live clock. Lahore time " + `HH:MM` + " PKT. " + status + ". " + diff text + "."
  - If `minute % 5 === 0`: `sunVec()` and render once when the loop is not running.
- `.is-hours` effects: work band opacity 1 and halo .22 (else .55 and 0), now dot and ping accent (else muted), card dot accent with `fh-ping` (else muted, still).
- The tick runs from `setInterval(tick, 1000)` started at L5559 and is never cleared or paused (it keeps running on other pages and in hidden tabs). Start order at L5559: `sunVec(); fit(); render(); tick(); setInterval(tick, 1000);`.

#### 11.6.4 Section kicker and methods ledger (HTML L4019-4057, CSS L990-1022, L1165-1168, L1200-1207)

##### Kicker (L4019, CSS L990-992)
- Markup: `div.ct-kicker#ct-ways[data-reveal="fade"]` > `span.eyebrow` = `<b>05</b> Ways to reach me` + `span.ct-kicker__line[aria-hidden="true"]` (empty).
- `.ct-kicker{display:flex;align-items:center;gap:18px;margin:clamp(8px,2vw,24px) 0 clamp(18px,2.4vw,26px)}` (L991); `.ct-kicker__line{flex:1;height:1px;background:var(--line)}` (L992): a hairline that fills the rest of the row.
- `.eyebrow` (L127-129): `display:inline-flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:var(--fs-label);letter-spacing:.16em;text-transform:uppercase;color:var(--brand-ink);font-weight:500`, a 28px by 1px `::before` rule in `currentColor` at `opacity:.6`, and `b{font-weight:500;opacity:.55}`. It reads as: short rule, dimmed "05", "WAYS TO REACH ME", then the hairline.
- `#ct-ways` is the target of the hero scroll cue (`FH.scrollToEl`, offset 32px at 1024px and up, 84px below).

##### Ledger card (L4022-4023, CSS L995-996)
- Markup: `div.card.ct-ledger[data-reveal][data-spotlight]` > `div.ct-ledger__row[data-stagger="80"][data-delay="80"]` > 4 x `article.ct-method[data-reveal="fade"]`.
- `#contact .ct-ledger{padding:0;overflow:hidden;border-radius:var(--r-xl);margin-bottom:clamp(18px,2.4vw,28px)}` (L995) on top of `.card` (L158-159: `position:relative;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);transition:transform var(--dur-2) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),border-color var(--dur-2),background-color var(--dur-2)`).
- `.ct-ledger__row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}` (L996).
- Spotlight (L166-170): `[data-spotlight]{--mx:50%;--my:50%}`; `::before` = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;z-index:0;background:radial-gradient(420px circle at var(--mx) var(--my),var(--accent-soft),transparent 45%);transition:opacity var(--dur-2) var(--ease-out)`, `opacity:1` on `:hover`; direct children get `position:relative;z-index:1`. The core script writes `--mx`/`--my` in px on every document `pointermove` inside the card (L4620-4623).

##### Method cell structure (L4024-4055)
```
article.ct-method[data-reveal="fade"]
  div.ct-method__top
    span.icon-tile.icon-tile--soft.ct-method__ic > svg.i > use #<icon>      (this svg has no aria-hidden)
    span.ct-method__no.mono[aria-hidden="true"]                              "01" to "04"
  h3.ct-method__t
  p.ct-method__d
  a.ct-method__v[href]   or   p.ct-method__v                                 (the value)
  p.ct-method__n > svg.i[aria-hidden="true"] > use #<note icon>, then text
  a.link-arrow.ct-method__cta   or   button.link-arrow.ct-method__cta[type="button"][data-book]
      text + " " + svg.i[aria-hidden="true"] > use #i-arrow-up-right
```

| No | Icon | Title | Description | Value (element, href) | Note icon and text | CTA |
|---|---|---|---|---|---|---|
| 01 | `i-mail` | Email Me | Best for detailed project discussions | `a` `mailto:mehrfaisal111@gmail.com`, "mehrfaisal111@gmail.com" | `i-clock` "Usually responds within 2-4 hours" | `a` "Send Email", `href="mailto:mehrfaisal111@gmail.com"` |
| 02 | `i-phone` | Call Me | For urgent matters and quick consultations | `a` `tel:+923148166354`, "+92 314 8166354" | `i-clock` "Available Mon-Fri, 9AM-6PM (GMT+5)" | `a` "Call Now", `href="tel:+923148166354"` |
| 03 | `i-calendar` | Schedule Meeting | Book a free consultation at your convenience | `p` "Video Call or Phone" | `i-video` "30 or 60 minute sessions available" | `button[type="button"][data-book]` "Book Meeting" (opens the booking modal with no preset, `FH.openBooking('')`, L4658) |
| 04 | `i-pin` | Location | Based in Pakistan, serving clients worldwide | `p` "Lahore, Pakistan" | `i-globe` "Timezone: GMT+5 (PKT)" | `a` "View Map", `href="https://maps.google.com/?q=Lahore,Pakistan" target="_blank" rel="noopener"` |

All hyphens in this copy are plain ASCII hyphens ("2-4", "Mon-Fri", "9AM-6PM").

##### Method cell styles (CSS L997-1022)
- `.ct-method{position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:flex-start;min-width:0;padding:clamp(22px,2.3vw,32px)}` (L997); `.ct-method + .ct-method{border-left:1px solid var(--line)}` (L998).
- Depth plate (L1000-1001): `.ct-method::after{content:"";position:absolute;inset:7px;z-index:-1;border-radius:calc(var(--r-xl) - 8px);background:var(--surface);border:1px solid var(--line-strong);box-shadow:0 2px 6px rgba(8,48,42,.05),0 22px 44px -18px rgba(8,48,42,.28);opacity:0;transform:translateY(6px) scale(.97);transition:opacity .5s var(--ease-out),transform .7s var(--ease-out)}`. Dark (L1002): `background:var(--surface-3);box-shadow:0 2px 6px rgba(0,0,0,.35),0 24px 48px -18px rgba(0,0,0,.8)`.
- `.ct-method > *{transition:transform .7s var(--ease-out)}` (L1003).
- Hover, only inside `@media (hover:hover)` (L1004-1008): plate `opacity:1;transform:translateY(-4px)`; every direct child `transform:translateY(-4px)`; `.ct-method__no{color:var(--brand-ink)}`.
- Icon hover, NOT inside the hover media query (L1012-1013): `.ct-method:hover .ct-method__ic{background:var(--grad);color:#fff;box-shadow:var(--glow)}`; `.ct-method:hover .ct-method__ic .i{transform:translate(2px,-2px) rotate(-8deg)}`.
- `.ct-method__top{display:flex;justify-content:space-between;align-items:flex-start;width:100%;margin-bottom:clamp(18px,2vw,26px)}` (L1009).
- `.ct-method__ic{overflow:hidden;transition:background var(--dur-2) var(--ease-out),color var(--dur-2),box-shadow var(--dur-2)}` (L1010); `.ct-method__ic .i{transition:transform .6s var(--ease-out)}` (L1011). Base tile (L161-163): `.icon-tile{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:var(--glow);flex:none}`, `.icon-tile .i{width:22px;height:22px}`, `.icon-tile--soft{background:var(--brand-soft);color:var(--brand-ink);box-shadow:none}`.
- `.ct-method__no{font-size:.7rem;letter-spacing:.14em;color:var(--muted);padding-top:4px;transition:color var(--dur-2)}` (L1014).
- `.ct-method__t{font-size:1.14rem;font-weight:700;letter-spacing:-.02em;margin-bottom:6px}` (L1015).
- `.ct-method__d{font-size:.88rem;color:var(--muted);line-height:1.5;min-height:3em;margin-bottom:16px}` (L1016).
- `.ct-method__v{display:block;font-weight:650;color:var(--ink);font-size:.98rem;letter-spacing:-.01em;overflow-wrap:anywhere;margin-bottom:8px;line-height:1.35}` (L1017).
- Link underline that grows (L1018-1019): `a.ct-method__v{background:linear-gradient(var(--accent),var(--accent)) 0 100%/0 1px no-repeat;transition:background-size var(--dur-2) var(--ease-out),color var(--dur-1)}`, hover `background-size:100% 1px;color:var(--brand-ink)`. Only methods 01 and 02 have a link value.
- `.ct-method__n{display:flex;gap:7px;align-items:flex-start;font-size:.8rem;color:var(--muted);line-height:1.45}` (L1020); `.ct-method__n .i{width:14px;height:14px;margin-top:2px;color:var(--brand-ink);opacity:.8}` (L1021).
- CTA: `.link-arrow` (L146-148: `display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--brand-ink);font-size:.9rem`, icon `transition:transform var(--dur-1) var(--ease-out)`, hover icon `translate(3px,-3px)`) plus `.ct-method__cta{margin-top:auto;padding-top:20px;min-height:44px;font-family:inherit}` (L1022): the CTA is pinned to the bottom of the cell, so the four CTAs line up.

##### Ledger motion
- Card: reveal up (`translate3d(0,26px,0)` + `blur(6px)`, .9s ease-out). Cells: reveal fade (`blur(4px)` to none) with `--d` 80ms, 160ms, 240ms, 320ms (11.6.0).
- Hover: spotlight glow follows the pointer across the whole card; the hovered cell lifts its plate and its children 4px over .7s; the icon tile turns into the solid gradient and the icon tilts.

##### Ledger responsive
- max-width 1100px (L1165-1168): `.ct-ledger__row{grid-template-columns:repeat(2,minmax(0,1fr))}`; `.ct-method:nth-child(3){border-left:0}`; `.ct-method:nth-child(n+3){border-top:1px solid var(--line)}`. Result: a 2 by 2 grid with a cross of hairlines.
- max-width 600px (L1200-1207): `.ct-ledger__row{grid-template-columns:1fr}`; `.ct-method{display:grid;grid-template-columns:48px minmax(0,1fr);column-gap:16px;padding:22px 20px}`; `.ct-method + .ct-method{border-left:0;border-top:1px solid var(--line)}`; `.ct-method:nth-child(3){border-left:0}`; `.ct-method__top{grid-row:1 / span 6;margin:0;width:auto}` (the icon tile sits alone in column 1, the text runs down column 2); `.ct-method__no{display:none}`; `.ct-method__d{min-height:0;margin-bottom:10px}`; `.ct-method__cta{padding-top:6px;margin-top:0}`.

#### 11.6.5 Map and form grid, and the aside with the Lahore map (HTML L4060-4120, CSS L1024-1064, L1178-1181, L1208-1210, L1553-1558; JS L5645-5655)

##### Grid (L4060, CSS L1025-1026, L1178-1180)
- `div.ct-grid` > `aside.ct-aside` (map) + `div.ct-formcol` (form).
- `.ct-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(18px,2.4vw,28px);align-items:start}` (L1025).
- `.ct-aside{position:sticky;top:28px}` (L1026): the map stays in view while the taller form scrolls past.
- max-width 900px (L1178-1181): `.ct-grid{grid-template-columns:1fr}` (map above the form), `.ct-aside{position:relative;top:auto}`, `#contact .ct-map{height:380px;min-height:0}`.

##### Map figure (L4062, CSS L1027-1029)
- `figure.card.ct-map[data-reveal="scale"][aria-labelledby="ct-map-title"]`. Children: `svg.ct-map__svg`, `div.ct-map__top`, `figcaption.ct-map__panel`.
- `#contact .ct-map{margin:0;height:min(700px,calc(100vh - 56px));min-height:480px;overflow:hidden;border-radius:var(--r-xl);background:radial-gradient(60% 50% at 50% 50%,var(--accent-soft),transparent 70%),var(--surface-2)}` (L1027-1028). With `top:28px` sticky, `100vh - 56px` leaves 28px above and below.
- `.ct-map__svg{position:absolute;inset:0;width:100%;height:100%}` (L1029); `.card` gives the figure `position:relative`.
- Reveal: `scale` (`scale(.94)` + `blur(6px)` to none, .9s ease-out).
- max-width 600px (L1208): `#contact .ct-map{height:390px}` (taller than the 380px of the 900px rule, see Notes).

##### Map SVG, static, copy verbatim (L4063-4107)
It is a stylised, hand drawn map of Lahore (not real geography, no tiles, no map library): a 26px grid faded out by a radial mask, 8 contour rings around the city, the Ravi river, 4 roads and a dashed ring road, 3 towns, a rising light beam and the pin. Nothing in it is changed by JS. Exact markup:
```html
<svg class="ct-map__svg" viewBox="0 0 660 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
  <pattern id="ct-map-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" class="ct-map__gl"/></pattern>
  <radialGradient id="ct-map-fade" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="ct-map-beam-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ct-stop-0"/><stop offset="1" class="ct-stop-1"/></linearGradient>
  <mask id="ct-map-mask"><rect width="660" height="520" fill="url(#ct-map-fade)"/></mask>
</defs>
<rect width="660" height="520" fill="url(#ct-map-grid)" mask="url(#ct-map-mask)"/>
<g class="ct-map__rings">
  <path class="ct-map__c ct-map__c--0" d="M372.7,260.0C373.3,264.8 373.8,270.7 371.4,275.1C368.9,279.6 363.5,284.2 358.1,286.8C352.7,289.3 345.3,290.0 339.1,290.4C333.0,290.8 326.9,290.4 321.2,289.2C315.6,288.1 310.3,286.0 305.3,283.5C300.3,281.0 294.9,278.1 291.3,274.2C287.7,270.2 284.1,264.8 283.9,260.0C283.7,255.2 287.0,249.7 290.3,245.5C293.5,241.3 298.5,237.6 303.6,234.8C308.6,232.1 314.7,229.7 320.7,228.9C326.6,228.1 333.2,228.8 339.1,229.9C344.9,231.0 351.0,232.8 355.7,235.5C360.5,238.2 364.8,242.1 367.6,246.2C370.5,250.3 372.1,255.2 372.7,260.0Z"/>
  <path class="ct-map__c ct-map__c--1" d="M415.1,260.0C415.5,268.9 410.2,279.5 404.0,287.1C397.9,294.7 387.8,301.6 378.1,305.8C368.4,310.0 356.4,311.3 345.7,312.4C335.1,313.5 325.1,313.3 314.2,312.5C303.4,311.6 290.1,311.4 280.5,307.2C270.8,302.9 261.5,294.8 256.4,287.0C251.2,279.1 249.4,268.9 249.7,260.0C249.9,251.1 252.5,241.2 257.9,233.6C263.3,226.0 273.1,219.5 282.3,214.6C291.5,209.6 302.5,205.8 313.2,204.2C323.9,202.5 336.2,202.7 346.6,204.8C356.9,207.0 366.0,212.1 375.1,217.0C384.2,221.8 394.5,226.8 401.2,233.9C407.8,241.1 414.6,251.1 415.1,260.0Z"/>
  <path class="ct-map__c ct-map__c--2" d="M454.4,260.0C453.9,273.4 447.6,288.8 438.2,299.6C428.8,310.4 412.4,319.1 398.0,324.8C383.7,330.6 367.8,331.4 352.3,334.3C336.8,337.2 321.7,342.5 305.3,342.2C288.9,342.0 268.2,339.5 253.9,332.5C239.6,325.5 227.2,312.4 219.8,300.3C212.3,288.3 207.7,273.0 209.1,260.0C210.4,247.0 219.0,233.5 227.8,222.6C236.5,211.7 248.5,202.3 261.4,194.6C274.3,187.0 289.5,179.0 304.9,176.5C320.4,174.0 338.3,176.8 354.1,179.6C370.0,182.4 385.3,186.8 399.8,193.5C414.3,200.1 431.9,208.3 441.0,219.4C450.1,230.5 454.9,246.6 454.4,260.0Z"/>
  <path class="ct-map__c ct-map__c--3" d="M480.8,260.0C475.8,276.8 463.2,290.8 453.0,305.0C442.7,319.2 434.0,333.4 419.3,345.1C404.5,356.8 385.8,368.0 364.5,375.0C343.3,381.9 315.3,389.2 291.9,386.8C268.5,384.5 240.5,373.7 224.2,360.8C207.8,348.0 200.8,326.7 193.7,309.9C186.7,293.1 181.4,276.5 181.7,260.0C182.1,243.5 186.4,225.5 195.9,210.9C205.3,196.4 221.7,183.6 238.4,172.7C255.0,161.7 274.4,150.3 295.6,145.3C316.7,140.3 342.4,139.7 365.3,142.5C388.2,145.3 413.2,151.7 432.8,162.0C452.5,172.2 475.0,187.7 483.0,204.0C491.0,220.3 485.8,243.2 480.8,260.0Z"/>
  <path class="ct-map__c ct-map__c--4" d="M533.0,260.0C531.3,283.0 526.4,307.2 513.4,327.1C500.5,347.0 479.0,367.8 455.3,379.4C431.6,391.1 398.8,394.2 371.1,396.8C343.4,399.5 315.6,399.7 289.3,395.4C263.1,391.0 237.4,382.3 213.6,370.9C189.8,359.5 164.9,345.6 146.5,327.2C128.0,308.7 104.1,282.8 102.9,260.0C101.7,237.2 120.5,208.4 139.2,190.2C157.9,171.9 189.9,160.8 215.1,150.5C240.3,140.2 264.5,132.3 290.4,128.2C316.3,124.0 342.8,123.5 370.4,125.4C398.0,127.4 430.7,129.1 456.2,139.7C481.7,150.3 510.6,169.2 523.4,189.2C536.2,209.3 534.6,237.0 533.0,260.0Z"/>
  <path class="ct-map__c ct-map__c--5" d="M597.4,260.0C589.2,288.0 556.3,312.8 535.0,335.0C513.7,357.2 495.4,377.2 469.8,393.2C444.2,409.2 413.6,423.6 381.4,431.1C349.2,438.6 311.8,441.2 276.5,438.2C241.1,435.2 198.6,428.8 169.4,413.1C140.1,397.3 117.3,369.3 101.0,343.8C84.6,318.3 72.5,288.3 71.4,260.0C70.3,231.7 75.2,196.5 94.6,173.9C114.0,151.2 156.4,136.4 187.7,124.3C219.0,112.3 250.2,107.6 282.5,101.8C314.7,95.9 346.9,88.2 381.2,89.4C415.5,90.7 454.5,96.2 488.3,109.1C522.1,122.1 565.8,141.9 584.0,167.0C602.2,192.2 605.6,232.0 597.4,260.0Z"/>
  <path class="ct-map__c ct-map__c--6" d="M584.0,260.0C580.0,290.5 577.9,316.1 568.1,347.1C558.2,378.1 552.9,421.1 525.1,445.9C497.2,470.8 445.1,488.6 401.0,496.3C356.8,504.1 304.4,501.0 260.2,492.5C215.9,484.1 167.5,468.2 135.4,445.4C103.4,422.7 83.0,386.9 67.8,356.0C52.6,325.1 41.7,291.1 44.0,260.0C46.4,228.9 62.3,195.8 82.1,169.3C101.9,142.8 133.4,124.5 163.1,100.9C192.7,77.3 219.6,43.3 260.2,27.5C300.7,11.7 361.2,-0.7 406.2,6.2C451.3,13.1 499.6,42.5 530.6,68.8C561.6,95.1 583.3,132.2 592.2,164.0C601.1,195.9 588.0,229.5 584.0,260.0Z"/>
  <path class="ct-map__c ct-map__c--7" d="M691.3,260.0C706.1,298.6 711.8,354.8 690.7,392.0C669.6,429.3 611.0,460.2 564.5,483.5C518.0,506.8 463.8,525.9 411.7,531.9C359.6,538.0 300.0,532.3 252.0,519.7C204.1,507.1 161.5,481.1 124.0,456.3C86.5,431.5 47.4,403.6 27.0,370.9C6.7,338.2 4.8,298.0 1.9,260.0C-1.1,222.0 -2.6,183.4 9.3,142.6C21.2,101.8 34.2,44.2 73.0,15.1C111.9,-14.0 186.6,-30.4 242.3,-32.2C297.9,-34.0 359.9,-13.8 406.8,4.2C453.7,22.1 491.1,49.4 523.6,75.5C556.1,101.5 573.9,129.7 601.9,160.5C629.8,191.2 676.5,221.4 691.3,260.0Z"/>
</g>
<path class="ct-map__river-bed" d="M720,104C620,136 500,166 430,196S338,232 300,248S214,312 156,338S34,404 -60,440"/>
<path class="ct-map__river" d="M720,104C620,136 500,166 430,196S338,232 300,248S214,312 156,338S34,404 -60,440"/>
<g class="ct-map__roads">
  <path class="ct-map__road ct-map__road--m" d="M330,260L260,218L150,150L40,70"/>
  <path class="ct-map__road" d="M330,260L298,119L286,-20"/>
  <path class="ct-map__road" d="M330,260L347,348L372,560"/>
  <path class="ct-map__road" d="M330,260L470,266L700,280"/>
  <ellipse class="ct-map__ring" cx="330" cy="260" rx="64" ry="46"/>
</g>
<g class="ct-map__towns">
  <circle cx="298" cy="119" r="3.5"/><text x="308" y="116">Gujranwala</text>
  <circle cx="260" cy="218" r="3.5"/><text x="250" y="206" text-anchor="end">Sheikhupura</text>
  <circle cx="347" cy="348" r="3.5"/><text x="357" y="352">Kasur</text>
  <text class="ct-map__rlabel" x="436" y="178" transform="rotate(-17 436 178)">RAVI</text>
</g>
<g class="ct-map__beam">
  <rect class="ct-map__beam-r" x="329" y="96" width="2" height="164" fill="url(#ct-map-beam-g)"/>
  <rect class="ct-map__beam-d" x="328.25" y="236" width="3.5" height="22" rx="1.75"/>
</g>
<g class="ct-map__pin">
  <circle class="ct-map__ping" cx="330" cy="260" r="12"/>
  <circle class="ct-map__ping ct-map__ping--b" cx="330" cy="260" r="12"/>
  <circle class="ct-map__halo" cx="330" cy="260" r="22"/>
  <circle class="ct-map__core" cx="330" cy="260" r="7"/>
  <text class="ct-map__plabel" x="346" y="249">Lahore</text>
</g>
</svg>
```
- The mask gradient uses literal `stop-color="#fff"` (a luminance mask, so it works in both themes). Ids `ct-map-grid`, `ct-map-fade`, `ct-map-beam-g`, `ct-map-mask` must stay unique in the document.
- `viewBox="0 0 660 520"` with `preserveAspectRatio="xMidYMid slice"`: the art covers the card and crops on the long side; the pin at (330,260) stays centred.

##### Map SVG styles (CSS L1030-1052)
| Class | Rule |
|---|---|
| `.ct-map__gl` | `fill:none;stroke:var(--line-strong);stroke-width:1` (grid pattern cell) |
| `.ct-map__c` | `fill:none;stroke:var(--brand-ink);stroke-width:1.1;opacity:.1` |
| `.ct-map__c--0` | `opacity:.34;fill:var(--accent-soft)` (the inner ring is filled) |
| `.ct-map__c--1` to `--7` | `opacity` `.28`, `.23`, `.19`, `.16`, `.13`, `.11`, `.09` |
| `.ct-map__river-bed` | `fill:none;stroke:var(--accent-soft);stroke-width:18;stroke-linecap:round` |
| `.ct-map__river` | `fill:none;stroke:var(--accent);stroke-width:2;opacity:.6;stroke-linecap:round` |
| `.ct-map__road` | `fill:none;stroke:var(--ink-2);stroke-width:1.2;opacity:.26;stroke-linecap:round;stroke-linejoin:round` |
| `.ct-map__road--m` | `stroke-dasharray:7 6;opacity:.42` (the motorway toward Sheikhupura) |
| `.ct-map__ring` | `fill:none;stroke:var(--ink-2);stroke-width:1.2;opacity:.3;stroke-dasharray:2 5` |
| `.ct-map__towns circle` | `fill:var(--surface);stroke:var(--ink-2);stroke-width:1.4;opacity:.85` |
| `.ct-map__towns text` | `font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;fill:var(--muted)` |
| `.ct-map__towns .ct-map__rlabel` | `fill:var(--brand-ink);opacity:.55;letter-spacing:.5em;font-size:9px` ("RAVI", rotated -17 degrees) |
| `.ct-map__halo` | `fill:var(--accent-soft)` |
| `.ct-map__core` | `fill:var(--brand);stroke:var(--surface);stroke-width:3.5` |
| `.ct-map__ping` | `fill:none;stroke:var(--accent);stroke-width:1.4;transform-box:fill-box;transform-origin:center;animation:ct-ping 3.4s var(--ease-out) infinite` |
| `.ct-map__ping--b` | `animation-delay:1.7s` |
| `.ct-stop-0` / `.ct-stop-1` | `stop-color:var(--accent);stop-opacity:0` / `stop-color:var(--accent);stop-opacity:.75` (beam fades in toward the pin) |
| `.ct-map__beam-r` | `opacity:.8` |
| `.ct-map__beam-d` | `fill:var(--accent);transform-box:fill-box;animation:ct-mbeam 4.2s var(--ease-io) infinite;opacity:0` |
| `.ct-map__pin` | `transition:transform .9s var(--ease-out)` (nothing ever transforms the pin: dead rule) |
| `.ct-map__plabel` | `font-family:var(--font-sans);font-weight:700;font-size:15px;letter-spacing:-.01em;fill:var(--ink);paint-order:stroke;stroke:var(--surface-2);stroke-width:4px;stroke-linejoin:round` |

Keyframes:
- `@keyframes ct-mbeam{0%{transform:translateY(0);opacity:0}12%{opacity:1}75%{opacity:.8}100%{transform:translateY(-150px);opacity:0}}` (L1049): the small bar starts just above the pin (y 236) and rises 150 units up the beam, looping every 4.2s.
- `@keyframes ct-ping{0%{transform:scale(1);opacity:.85}100%{transform:scale(4.4);opacity:0}}` (L1051, shared with the orb): two rings (offset 1.7s) grow from the pin forever.
- Reduced motion: `.ct-map__ping{display:none}` (L1553-1555) and `.ct-map__beam-d{display:none}` (L1558). Everything else is static.

##### Top chips (L4108-4111, CSS L1053-1058)
- `div.ct-map__top`: `position:absolute;left:16px;right:16px;top:16px;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:10px` (L1053).
- Left: `span.ct-map__chip.label` "My Location". `.label` (L121: mono, `var(--fs-label)`, `.14em`, uppercase, 500) with `.ct-map__chip.label{color:var(--brand-ink)}` (L1056).
- Right: `span.ct-map__chip.ct-map__time[aria-live="off"]` > `span.dot-live[aria-hidden="true"]` + `span.sr-only` "Local time in Lahore:" + `span.mono#ct-clock` "--:--" (JS writes `HH:MM:SS`) + `span.ct-map__tz` "PKT".
- `.ct-map__chip{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:var(--r-pill);background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);box-shadow:var(--shadow-sm)}` (L1054-1055).
- `.ct-map__time .mono{font-size:.8rem;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:.02em}` (L1057); `.ct-map__tz{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.12em;color:var(--muted)}` (L1058).
- The dot pulses with `fh-ping 2.4s var(--ease-out) infinite` (L152-153) all the time (not tied to working hours, unlike the hero card dot).
- max-width 600px (L1209): `.ct-map__top{left:12px;right:12px;top:12px}`.

##### Bottom panel (L4112-4118, CSS L1059-1064)
- `figcaption.ct-map__panel` > `div` (`span.ct-map__title#ct-map-title` "Lahore, Pakistan" + `span.ct-map__coords.mono` "31.5204&deg; N, 74.3587&deg; E", which renders as 31.5204 degrees N, 74.3587 degrees E with U+00B0) + `a.btn.btn--ghost.btn--sm.ct-map__cta[href="https://maps.google.com/?q=Lahore,Pakistan"][target="_blank"][rel="noopener"]` "View Map " + `svg.i[aria-hidden="true"] > use #i-arrow-up-right`.
- `.ct-map__panel{position:absolute;left:16px;right:16px;bottom:16px;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 16px 16px 20px;border-radius:20px;background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:var(--shadow-md)}` (L1059-1060); `.ct-map__panel > div{min-width:0}` (L1061).
- `.ct-map__title{display:block;font-weight:700;color:var(--ink);font-size:1.08rem;letter-spacing:-.015em}` (L1062); `.ct-map__coords{display:block;font-size:.74rem;color:var(--muted);margin-top:3px;letter-spacing:.02em}` (L1063).
- `.ct-map__cta{flex:none;--h:44px}` (L1064) on top of `.btn--sm` (`--h:40px;padding:0 16px;font-size:.85rem`, L144): the button is 44px tall. `.btn--ghost` (L142-143): `background:var(--surface);color:var(--brand-ink);border:1px solid var(--line-strong);box-shadow:var(--shadow-sm)`, hover `border-color:var(--brand);background:var(--surface-2)`.
- max-width 600px (L1210): `.ct-map__panel{left:12px;right:12px;bottom:12px;padding:14px 14px 14px 16px}`.

##### Map clock (JS L5645-5655)
- `fmt = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Karachi', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false})` (try/catch). Fallback: `u = new Date(d.getTime() + 5*3600e3)` and `pad(getUTCHours) + ':' + pad(getUTCMinutes) + ':' + pad(getUTCSeconds)`.
- `tick()` writes `#ct-clock` textContent; called once at script start, then `setInterval(tick, 1000)`, never paused or cleared. Behaviour template in 11.6.7 (B11).

#### 11.6.6 Contact form: visuals and motion (HTML L4122-4222, CSS L1066-1162, L1169, L1211-1221, L1336; JS L5202-5213, L5657-5786)

Section 10 of REFERENCE_MAP.md holds the field rules, error messages, payload and the hook success and failure texts. This part adds the markup, the visual states and the motion, plus the few texts section 10 does not list (marked "not in section 10").

##### Card and head (L4123-4131, CSS L1067-1070, L1211-1212)
- `div.ct-formcol` > `form.card.ct-form#ct-form[novalidate][data-reveal]` > `div.ct-form__inner#ct-form-inner` (everything below up to the status line) + `div.ct-done#ct-done[hidden]`.
- `#contact .ct-form{padding:clamp(22px,3.6vw,48px);border-radius:var(--r-xl);box-shadow:var(--shadow-md)}` (L1067). Reveal: up (`translate3d(0,26px,0)` + `blur(6px)`).
- Head: `div.ct-form__head` > `span.icon-tile > svg.i > use #i-send` (the solid gradient 48px tile, L161-162) + `div` > `h3.ct-form__title` "Send Me a Message" + `p.ct-form__sub` "Tell me about your project and let's discuss how I can help bring your vision to life." (straight apostrophe).
- `.ct-form__head{display:flex;gap:16px;align-items:flex-start;padding-bottom:clamp(20px,2.4vw,28px);margin-bottom:clamp(22px,2.6vw,30px);border-bottom:1px solid var(--line)}` (L1068); `.ct-form__title{font-size:clamp(1.45rem,2.3vw,1.9rem);font-weight:750;letter-spacing:-.035em}` (L1069); `.ct-form__sub{color:var(--muted);font-size:.95rem;margin-top:6px;max-width:50ch;line-height:1.6}` (L1070).
- max-width 600px: `#contact .ct-form{padding:22px 18px;border-radius:var(--r-lg)}` (L1211); `.ct-form__head .icon-tile{display:none}` (L1212).

##### Text fields markup (L4133-4160)
```
div.ct-fields
  div.ct-field
    input.ct-input#ct-name[name="name"][type="text"][placeholder=" "][autocomplete="name"][required][aria-required="true"][aria-describedby="ct-name-err"][maxlength="120"]
    label.ct-flabel[for="ct-name"]      "Full Name " + span.ct-req[aria-hidden="true"] "*"
    svg.i.ct-field__ic[aria-hidden="true"] > use #i-user
    span.ct-field__line[aria-hidden="true"]
    p.ct-err#ct-name-err                (empty)
```
The ORDER (input, label, icon, line, error) matters: the CSS uses `input + label` and `input ~ icon/line`.

| Input | Type and extra attributes | Label text | Icon | Error element |
|---|---|---|---|---|
| `#ct-name` | `text`, `autocomplete="name"`, required, `aria-required="true"`, `aria-describedby="ct-name-err"`, `maxlength="120"` | "Full Name *" | `i-user` | `p.ct-err#ct-name-err` |
| `#ct-email` | `email`, `autocomplete="email"`, `inputmode="email"`, required, `aria-required="true"`, `aria-describedby="ct-email-err"`, `maxlength="160"` | "Email Address *" | `i-mail` | `p.ct-err#ct-email-err` |
| `#ct-phone` | `tel`, `autocomplete="tel"`, `inputmode="tel"`, `aria-describedby="ct-phone-err"`, `maxlength="40"` | "Phone Number" | `i-phone` | `p.ct-err#ct-phone-err` |
| `#ct-company` | `text`, `autocomplete="organization"`, `maxlength="120"` (no `aria-describedby`) | "Company/Organization" | `i-building` | none |

Every input and the textarea has `placeholder=" "` (one space). It is what drives the floating label (`:placeholder-shown`). Do not remove it and do not put real text in it.

##### Text field styles (CSS L1071-1096, L1336)
- `.ct-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}` (L1071); max-width 600px `grid-template-columns:1fr` (L1213).
- `.ct-field{position:relative;min-width:0}` (L1072).
- Input (L1073-1074): `.ct-input{display:block;width:100%;height:62px;padding:25px 16px 7px 48px;border-radius:15px;border:1px solid var(--line-strong);background:var(--surface-2);color:var(--ink);font-size:1rem;outline:none;transition:border-color var(--dur-1),background-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out)}`.
- Hover (L1075): `background:var(--surface)`.
- Focus (L1076): `border-color:var(--brand);background:var(--surface);box-shadow:0 0 0 4px var(--accent-soft)`. Dark (L1077): `border-color:var(--accent)`. Dark also sets `color-scheme:dark` on `.ct-input` (L1336).
- Floating label (L1078-1080): `.ct-flabel{position:absolute;left:48px;top:20px;font-size:.95rem;color:var(--muted);pointer-events:none;transform-origin:0 0;white-space:nowrap;max-width:calc(100% - 64px);overflow:hidden;text-overflow:ellipsis;transition:transform var(--dur-2) var(--ease-out),color var(--dur-1)}`. Floated when `.ct-input:focus + .ct-flabel` or `.ct-input:not(:placeholder-shown) + .ct-flabel`: `transform:translateY(-11px) scale(.76);color:var(--brand-ink)`. So the label sits inside the field like a placeholder, then shrinks to 76 percent and moves 11px up over .6s when the field is focused or filled.
- `.ct-req{color:var(--brand-ink)}` (L1081).
- Leading icon (L1082-1083): `.ct-field__ic{position:absolute;left:17px;top:21px;width:18px;height:18px;color:var(--muted);pointer-events:none;transition:color var(--dur-1)}`; focus `.ct-input:focus ~ .ct-field__ic{color:var(--brand-ink)}`.
- Invalid (L1089-1092): `.ct-input[aria-invalid="true"]{border-color:var(--ct-err);background:var(--ct-err-soft)}`; `.ct-input[aria-invalid="true"]:focus{box-shadow:0 0 0 4px var(--ct-err-soft)}`; line `background:var(--ct-err);box-shadow:none`; icon and label `color:var(--ct-err)`. Keep the selectors and their order exactly: the invalid label rule (L1092) has the same specificity as the float rule (L1080) and wins by coming later, so a floated invalid label stays red.
- Error text (L1093-1096): `.ct-err{font-size:.8rem;color:var(--ct-err);line-height:1.4;margin-top:7px;padding-left:2px;font-weight:500}`; `.ct-err:empty{display:none}`; `.ct-err:not(:empty){animation:ct-err-in .45s var(--ease-out)}`; `@keyframes ct-err-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`. The slide in plays when the element goes from empty (display none) to filled; swapping one message for another does not replay it.

##### The focus line that draws from the pointer (CSS L1085-1088, JS L5697-5702)
- `span.ct-field__line`: `position:absolute;left:14px;right:14px;top:59px;height:2px;border-radius:2px;background:var(--grad-glow);pointer-events:none;transform:scaleX(0);transform-origin:var(--ox,50%) 50%;opacity:0;box-shadow:0 0 14px -1px var(--accent);transition:transform .8s var(--ease-out),opacity .35s var(--ease-out)` (L1085-1086). On the 62px input, `top:59px` lays the glowing line over the bottom edge, 14px in from each side.
- In the textarea box: `.ct-field__box .ct-field__line{top:auto;bottom:1px}` (L1087).
- Focus: `.ct-input:focus ~ .ct-field__line{transform:scaleX(1);opacity:1}` (L1088). Blur reverses it (.8s scale, .35s fade).
- JS: for each `.ct-input` in the form, `line = inp.parentNode.querySelector('.ct-field__line')`.
  - `pointerdown` on the input: `r = inp.getBoundingClientRect()`; `line.style.setProperty('--ox', Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)).toFixed(1) + '%')`. The line grows outward from the exact x where the user clicked.
  - `blur`: `setTimeout(() => line.style.removeProperty('--ox'), 400)`. After the fade the origin returns to the centre, so a keyboard (Tab) focus draws the line from the middle.
- Port: keep `--ox` as an inline CSS variable on the line element (a ref), not React state.

##### Details textarea and counter (L4186-4196, CSS L1097-1102)
```
div.ct-field.ct-field--area
  div.ct-field__box
    textarea.ct-input#ct-details[name="details"][rows="6"][placeholder=" "][maxlength="2000"][required][aria-required="true"][aria-describedby="ct-details-err ct-details-count"]
    label.ct-flabel[for="ct-details"]   "Project Details " + span.ct-req[aria-hidden="true"] "*"
    span.ct-field__line[aria-hidden="true"]
  div.ct-field__foot
    p.ct-err#ct-details-err
    span.ct-count.mono#ct-details-count[aria-live="off"] > span#ct-details-n "0" + " / 2000"
```
- `.ct-field--area{margin-top:clamp(24px,3vw,32px)}` (L1097); `.ct-field--area .ct-input{height:auto;min-height:170px;padding:30px 16px 14px;line-height:1.6;resize:vertical}` (L1098); `.ct-field--area .ct-flabel{left:16px;top:20px}` (L1099, no icon here).
- `.ct-field__box{position:relative}` (L1084); `.ct-field__foot{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}` (L1100).
- `.ct-count{margin-left:auto;margin-top:7px;font-size:.7rem;color:var(--muted);letter-spacing:.04em;font-variant-numeric:tabular-nums;white-space:nowrap}` (L1101); `.ct-count.is-near{color:var(--brand-ink)}` (L1102).
- Counter JS (L5691-5695): `n = details.value.length` (raw length, not trimmed), writes `#ct-details-n`, toggles `.is-near` when `n > 1800`. Runs on `input` and once at start.

##### Option groups markup (L4163-4184)
```
fieldset.ct-group#ct-type[aria-describedby="ct-type-err"]
  legend.ct-legend   "What type of project are you interested in? " + span.ct-req[aria-hidden="true"] "*"
  div.ct-opts.ct-opts--type
    label.ct-opt                                             (x6)
      input[type="radio"][name="type"][value="..."][aria-describedby="ct-type-err"]
      span.ct-opt__box
        span.ct-opt__ic > svg.i > use #<icon>
        span.ct-opt__t   (title)
        span.ct-opt__s   (subtitle)
        span.ct-opt__tick[aria-hidden="true"] > svg.i > use #i-check
  p.ct-err#ct-type-err

fieldset.ct-group#ct-budget                                  (no aria-describedby, no error element)
  legend.ct-legend   "Project Budget Range"                  (no star)
  div.ct-opts.ct-opts--budget
    label.ct-opt.ct-opt--b                                   (x4)
      input[type="radio"][name="budget"][value="..."]
      span.ct-opt__box
        span.ct-opt__amt (amount)
        span.ct-opt__s   (subtitle)
        span.ct-opt__tick[aria-hidden="true"] > svg.i > use #i-check
```
Option copy and icons: 11.6.9 (`projectTypes`, `budgets`). The radio `value` equals the visible title or amount (`Maintenance &amp; Support` is `Maintenance & Support`).

##### Option group styles (CSS L1104-1136)
- `.ct-group{border:0;margin:clamp(24px,3vw,32px) 0 0;padding:0;min-width:0}` (L1104); `.ct-legend{padding:0;margin-bottom:14px;font-weight:650;color:var(--ink);font-size:1rem;letter-spacing:-.01em}` (L1105).
- `.ct-opts{display:grid;gap:12px}` (L1106); `.ct-opts--type{grid-template-columns:repeat(3,minmax(0,1fr))}` (L1107); `.ct-opts--budget{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}` (L1108).
- `.ct-opt{position:relative;display:block;cursor:pointer;min-width:0}` (L1109). The radio is visually hidden: `.ct-opt input{position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none}` (L1110).
- Box (L1111-1112): `.ct-opt__box{--cx:36px;--cy:36px;position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;gap:4px;height:100%;padding:16px 16px 17px;border-radius:17px;border:1px solid var(--line-strong);background:var(--surface-2);transition:border-color var(--dur-1),background-color var(--dur-2),box-shadow var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out)}`. The default `--cx/--cy` (36px, 36px) is the centre of the 40px icon tile (16px padding + 20px).
- Hover (L1113): `border-color:var(--brand);background:var(--surface);transform:translateY(-2px);box-shadow:var(--shadow-sm)` (not inside a hover media query).
- Fill layer (L1114-1116): `.ct-opt__box::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(circle at var(--cx) var(--cy),var(--accent-soft),transparent 70%),var(--brand-soft);clip-path:circle(0px at var(--cx) var(--cy));transition:clip-path .9s var(--ease-out)}`; checked: `clip-path:circle(160% at var(--cx) var(--cy))`. The tint grows as a circle from `(--cx, --cy)` over .9s; unchecking shrinks it back to the same point.
- Checked box (L1117-1119): `border-color:var(--brand);background:var(--surface);box-shadow:inset 0 0 0 1px var(--brand),var(--shadow-sm)`. Dark: `background:var(--surface-2)`, then `border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)`.
- Keyboard focus (L1120): `.ct-opt input:focus-visible + .ct-opt__box{outline:2px solid var(--accent);outline-offset:3px}`.
- Icon tile (L1121-1127): `.ct-opt__ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;overflow:hidden;background:var(--surface);border:1px solid var(--line);color:var(--brand-ink);margin-bottom:10px;transition:background var(--dur-2),color var(--dur-2),border-color var(--dur-2),box-shadow var(--dur-2)}`; `.ct-opt__ic .i{width:19px;height:19px;transition:transform .5s var(--ease-out)}`; hover `.ct-opt:hover .ct-opt__ic .i{transform:translateY(-2px)}`; checked tile `background:var(--grad);color:#fff;border-color:transparent;box-shadow:var(--glow)`; checked icon `animation:ct-nudge .75s var(--ease-out)`.
- `@keyframes ct-nudge{0%{transform:none;opacity:1}40%{transform:translateY(-130%);opacity:0}41%{transform:translateY(120%);opacity:0}100%{transform:none;opacity:1}}` (L1126): on check the icon flies out of the top and comes back in from the bottom (the tile's `overflow:hidden` clips it). It plays once, each time the option becomes checked.
- Text (L1128-1130): `.ct-opt__t{font-weight:650;color:var(--ink);font-size:.93rem;line-height:1.3;letter-spacing:-.01em}`; `.ct-opt__s{font-size:.78rem;color:var(--muted);line-height:1.45}`; `.ct-opt__amt{font-weight:750;color:var(--ink);font-size:1rem;letter-spacing:-.02em;font-variant-numeric:tabular-nums;padding-right:24px}`.
- Budget box (L1131): `.ct-opt--b .ct-opt__box{--cx:calc(100% - 23px);--cy:23px;padding:15px 15px 16px}`: the default fill origin is the centre of the tick (12px inset + 11px).
- Tick (L1132-1135): `.ct-opt__tick{position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--grad);color:#fff;opacity:0;transform:scale(.4);transition:opacity var(--dur-1) var(--ease-out),transform var(--dur-2) var(--ease-out)}`; `.ct-opt__tick .i{width:13px;height:13px;stroke-width:2.8}`; checked `opacity:1;transform:none` (pops in from 40 percent).
- Invalid group (L1136): `.ct-group.is-invalid .ct-opt__box{border-color:var(--ct-err)}`.
- max-width 1100px (L1169): `.ct-opts--type{grid-template-columns:repeat(2,minmax(0,1fr))}`.
- max-width 600px (L1214-1219): `.ct-opts--type,.ct-opts--budget{grid-template-columns:1fr;gap:10px}`; budget box `flex-direction:row;align-items:baseline;flex-wrap:wrap;column-gap:10px;padding:14px 16px` (amount and subtitle on one line); type box `display:grid;grid-template-columns:40px minmax(0,1fr);column-gap:14px;row-gap:2px;align-items:center;padding:14px`; `.ct-opts--type .ct-opt__ic{grid-row:1 / span 2;margin:0}`; `.ct-opts--type .ct-opt__tick{top:50%;margin-top:-11px;right:14px}` (tick centred vertically); `.ct-opts--type .ct-opt__t,.ct-opts--type .ct-opt__s{padding-right:30px}`.

##### Option cards fill from the pointer (JS L5703-5708)
- `pointerdown` on each `label.ct-opt`: `r = box.getBoundingClientRect()`; `box.style.setProperty('--cx', (e.clientX - r.left).toFixed(0) + 'px')`; same for `--cy` with `clientY - r.top`. The checked tint then grows from the exact press point.
- `keydown` on the option's radio: remove the inline `--cx` and `--cy`, so a keyboard selection fills from the default point (the icon for types, the tick for budgets).
- Port: a ref per box, set the two CSS variables inline; no React state.

##### Submit row (L4198-4209, CSS L1138-1149)
```
div.ct-submit
  button.btn.btn--primary.ct-send#ct-send[type="submit"]
    span.ct-send__in.ct-send__idle                       span "Send Message" + svg.i[aria-hidden="true"] > use #i-send
    span.ct-send__in.ct-send__load[aria-hidden="true"]   span.ct-spin
    span.ct-send__in.ct-send__ok[aria-hidden="true"]     svg.i[aria-hidden="true"] > use #i-check + span "Done"   (JS sets "Sent" or "Ready" before showing)
  ul.ct-notes
    li  svg.i[aria-hidden="true"] > use #i-shield   "Your information is secure and will never be shared with third parties"
    li  svg.i[aria-hidden="true"] > use #i-clock    "I'll respond within 24 hours with next steps"
p.sr-only#ct-form-status[role="status"][aria-live="polite"]     (screen reader status line, empty)
```
- `.ct-submit{display:flex;align-items:center;flex-wrap:wrap;gap:20px 28px;margin-top:clamp(24px,3vw,32px);padding-top:clamp(22px,2.6vw,28px);border-top:1px solid var(--line)}` (L1138).
- `.ct-send{--h:58px;min-width:0;padding:0 30px;font-size:1rem;transition:width .6s var(--ease-out),padding .6s var(--ease-out),transform var(--dur-1) var(--ease-out),box-shadow var(--dur-2) var(--ease-out)}` (L1139). This transition list replaces the `.btn` one. The base `.btn` gives `position:relative;overflow:hidden;border-radius:var(--r-pill);height:var(--h)`, the gradient, the sheen on hover and `:active{transform:scale(.97)}` (L134-145).
- `.ct-send__in{display:inline-flex;align-items:center;gap:10px;transition:opacity .3s var(--ease-out),transform .5s var(--ease-out)}` (L1140).
- `.ct-send__load,.ct-send__ok{position:absolute;inset:0;justify-content:center;opacity:0;transform:translateY(10px)}` (L1141).
- `.ct-send[data-state="load"],.ct-send[data-state="ok"]{padding:0;pointer-events:none}` (L1142); in both states the idle layer goes `opacity:0;transform:translateY(-10px)` (L1143) and the matching layer goes `opacity:1;transform:none` (L1144). So labels slide up and out while the next one slides up and in.
- Spinner: `.ct-spin{width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:ct-spin .8s linear infinite}` with `@keyframes ct-spin{to{transform:rotate(360deg)}}` (L1145-1146).
- Notes: `.ct-notes{list-style:none;margin:0;padding:0;display:grid;gap:8px;flex:1 1 260px;font-size:.82rem;color:var(--muted);line-height:1.45}` (L1147); `.ct-notes li{display:flex;gap:9px;align-items:flex-start}` (L1148); `.ct-notes .i{width:16px;height:16px;margin-top:1px;color:var(--brand-ink)}` (L1149).
- max-width 600px: `.ct-send{width:100%}` (L1220); `.ct-notes{flex-basis:100%}` (L1221).

##### Send button states and width morph `setSend(state)` (JS L5710-5717)
- `idle`: remove `data-state`, `style.width = ''`, `disabled = false`, `w0 = 0`. The width snaps back (no transition to `auto`).
- `load` or `ok`: if `w0` is 0, read `w0 = send.offsetWidth`, write `style.width = w0 + 'px'` and force a reflow (`void send.offsetWidth`) so the width has a pixel start value. Then `data-state = state`, `disabled = (state === 'load')`, `style.width = state === 'load' ? '58px' : Math.max(w0, 150) + 'px'`.
- What the user sees: the pill shrinks over .6s from its width to a 58px circle (padding 30px to 0) with a spinning ring; on success it grows back over .6s to `max(w0, 150)` px showing the check and "Sent" (hook) or "Ready" (mailto). `ok` keeps `pointer-events:none` but is not disabled.
- Port: `useSendButton()` returning `state` and a ref; keep the imperative width writes (read `offsetWidth`, set px, force reflow, set target) because CSS cannot transition to or from `auto`.

##### Submit flow as the user sees it (JS L5740-5776)
1. `preventDefault`; ignore while `busy`.
2. Validate name, email, phone, details and the type group (rules and texts in section 10). On failure: errors slide in, focus goes to the first bad field in the order name, email, phone, then the first type radio, then details, and it scrolls with `target.scrollIntoView({block:'center', behavior: reduce ? 'auto' : 'smooth'})`. Status line text in section 10.
3. On success: `busy = true`, `form[aria-busy="true"]`, `setSend('load')`, status line "Sending your message." (not in section 10).
4. With `FH_HOOKS.onContact`: `Promise.all([hook(data), wait(500)])` so the spinner shows for at least 500ms. Without a hook: `openMail(subject, summary)` at once and `wait(850)`.
5. Then: `.ct-send__ok span` text "Sent" (hook) or "Ready" (mailto), `setSend('ok')`, status "Message sent." or "Your email app is opening with the message." (not in section 10), toast "Message sent. Talk soon!" or "Opening your email app with your message" (the mailto one is not in section 10); then `wait(900)` and `showDone(viaMail, data)`.
6. On a thrown or rejected hook: `setSend('idle')`, failure toast and status (section 10).
7. Finally `busy = false` and `aria-busy` removed.
- `wait(ms)` (L5200) resolves after `reduce ? 0 : ms`, so with reduced motion there are no minimum spinner or success pauses.
- Toasts stay 3200ms (core L4663).
- `openMail` (L5194-5199) builds `mailto:mehrfaisal111@gmail.com?subject=...&body=...` with `encodeURIComponent`, clicks a hidden `a[rel="noopener"]` and removes it on the next tick.

##### Live validation timing (JS L5685-5690, not in section 10)
- On `blur` of name, email, phone or details: validate only if the trimmed value is not empty OR the field was already touched; then mark it touched (`data-touched="1"`). So leaving an empty field the first time shows nothing; leaving it a second time shows the "required" error.
- On `input`: re-validate only while the field is currently invalid (`aria-invalid="true"`). Errors clear live as the user fixes them; new errors never appear while typing.
- Type radios, on `change`: re-check only while `#ct-type` has `.is-invalid`.
- `setErr` writes `aria-invalid="true"` or `"false"` and the error text; `checkType` toggles `.is-invalid` on the fieldset and `aria-invalid` on all six radios.

##### Done panel and its draw in (HTML L4212-4220, CSS L1152-1162)
```
div.ct-done#ct-done[hidden]
  svg.ct-check[viewBox="0 0 88 88"][aria-hidden="true"]
    circle.ct-check__ring[cx="44"][cy="44"][r="38"]
    circle.ct-check__c[cx="44"][cy="44"][r="38"]
    path.ct-check__p[d="M29 45.5l10 10 20-22"]
  h3.ct-done__t#ct-done-title[tabindex="-1"]      "Thanks!"   (JS: "Thanks, " + first name + "!")
  p.ct-done__p#ct-done-msg                         (empty, JS fills)
  div.ct-done__actions
    button.btn.btn--primary#ct-again[type="button"]       svg.i[aria-hidden="true"] > use #i-message + "Write another message"
    a.btn.btn--ghost#ct-mail-direct[href="mailto:mehrfaisal111@gmail.com"]   svg.i[aria-hidden="true"] > use #i-mail + "Email directly"
```
- `.ct-done{display:grid;justify-items:center;text-align:center;gap:14px;padding:clamp(40px,7vw,96px) clamp(4px,3vw,40px)}` (L1152); `.ct-done__t{font-size:clamp(1.8rem,3.2vw,2.5rem);font-weight:800;letter-spacing:-.04em;outline:none}` (L1153, no focus ring when JS focuses it); `.ct-done__p{max-width:44ch;color:var(--ink-2);line-height:1.65}` (L1154); `.ct-done__actions{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:10px}` (L1155).
- Check mark: `.ct-check{width:88px;height:88px;margin-bottom:6px}`; `.ct-check__ring{fill:var(--accent-soft)}`; `.ct-check__c{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-dasharray:239;stroke-dashoffset:239;transform:rotate(-90deg);transform-origin:44px 44px}`; `.ct-check__p{fill:none;stroke:var(--brand-ink);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48}` (L1156-1159).
- Draw in: `.is-drawn .ct-check__c{animation:ct-draw .9s var(--ease-out) .1s forwards}`; `.is-drawn .ct-check__p{animation:ct-draw .55s var(--ease-out) .6s forwards}`; `@keyframes ct-draw{to{stroke-dashoffset:0}}` (L1160-1162). The ring draws clockwise from 12 o'clock (239 is about 2 x pi x 38), then the tick draws itself.
- These `.ct-done` and `.ct-check` rules are shared with the booking done screen (which adds `.ct-check--lg`, L1429).
- `#contact [hidden]{display:none!important}` (L816) is what hides the panel and the "Email directly" button.

##### `showDone(viaMail, d)` (JS L5727-5738)
- Title: `'Thanks, ' + d.name.trim().split(/\s+/)[0] + '!'`.
- Message: hook text in section 10; mailto text (not in section 10): "Your email app should now be open with your message filled in. Press send there and I will get back to you within 24 hours."
- `#ct-mail-direct.hidden = !viaMail`: "Email directly" shows only on the mailto path.
- `r = form.getBoundingClientRect()` is read BEFORE the swap.
- `morphHeight(form, change, 700)` where `change` = `inner.hidden = true; done.hidden = false; done.classList.remove('is-drawn'); void done.offsetWidth; done.classList.add('is-drawn')` (restarts the check draw every time).
- If `r.top < 0` (the form top is above the viewport): `window.scrollBy({top: r.top - 24, behavior: reduce ? 'auto' : 'smooth'})`.
- After 400ms (0 with reduced motion): `#ct-done-title.focus({preventScroll:true})`.

##### "Write another message" (JS L5778-5785)
`form.reset()`; `updateCount()`; for name, email, phone, company and details: `setErr(field, '')` (writes `aria-invalid="false"`, clears the text) and delete `data-touched`; remove `.is-invalid` from `#ct-type` and clear `#ct-type-err`; remove `aria-invalid` from the type radios; `setSend('idle')`; `morphHeight(form, () => { done.hidden = true; inner.hidden = false; }, 700)` and then `#ct-name.focus({preventScroll:true})`.

##### `morphHeight(el, change, dur)` helper (JS L5202-5213)
- If reduced motion or no `el.animate`: run `change()` and resolve.
- `h0 = el.getBoundingClientRect().height`; run `change()`; `h1 = ...height`; if `Math.abs(h1 - h0) < 2` resolve.
- Save `el.style.overflow`, set `hidden`; `el.animate([{height: h0 + 'px'}, {height: h1 + 'px'}], {duration: dur || 560, easing: EASE})` with `EASE = 'cubic-bezier(.22,1,.36,1)'` (L5183, same curve as `--ease-out`); on finish (or cancel) restore `overflow`. No `fill`, so the element returns to its natural height at the end.
- The contact form uses `dur = 700` both ways. The new content is shown at once (no fade); only the card height glides.
- `swapViews(container, from, to, dir, axis)` (L5214-5225) is the booking modal's slide and fade helper (out 190ms `cubic-bezier(.4,0,1,1)`, in 560ms EASE, offset 22px on x or 14px on y); the contact page does not use it.
- Port: `useMorphHeight()` returning `morph(change, dur)` built on the Web Animations API; `change` must commit the DOM synchronously (use `flushSync` in React, or toggle `hidden` on refs).

#### 11.6.7 JS behaviours for React (contact.js L5175-5787)

All of these live in one IIFE per block: the hero (L5230-5640), the map clock (L5645-5655) and the form (L5657-5786). Module constants (L5179-5187): `reduce = !!FH.reduce` (read ONCE from `matchMedia('(prefers-reduced-motion: reduce)')` at load, L4565; later changes are ignored), `EASE = 'cubic-bezier(.22,1,.36,1)'`, `EMAIL = 'mehrfaisal111@gmail.com'`, `EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/`, `hooks()` reads `window.FH_HOOKS`, `toast(m)` calls `FH.toast`. Helpers L5190-5200: `esc`, `pad` (two digits), `ymd`, `parseYmd` (booking), `openMail`, `wait`.

Suggested files: `frontend/src/components/contact/` (`ContactHero.tsx`, `ContactOrb.tsx`, `ClockCard.tsx`, `MethodsLedger.tsx`, `LahoreMap.tsx`, `ContactForm.tsx`) and `frontend/src/lib/contact/` (`globe.ts` pure maths, `time.ts` Lahore time helpers). Everything that depends on the visitor's clock or time zone must run after mount (the server has neither), with the HTML defaults ("--:--:--", "--:--", "Checking hours", "Local", "Same time zone as Lahore", "09:00 to 18:00") rendered on the server.

##### B1. Visitor guess and best view (L5236-5299, L5266-5269)
- Starts when: once, at script start.
- Reads: `Intl.DateTimeFormat().resolvedOptions().timeZone`, `new Date().getTimezoneOffset()`, the `visitorPlaces` table.
- Writes: nothing directly. Produces `tz`, `myOff`, `same`, `city`, `you`, `vY`, `vL`, `angDist`, `mid`, `base` used by B2 to B5.
- Timings: none. Grid search is 26 x 51 = 1326 candidates, cheap.
- Pauses or skips when: never.
- Cleanup in React: none (pure).
- Port as: `guessVisitor(tz: string, offsetMinutes: number)` and `bestView(visitor)` in `lib/contact/globe.ts`, computed in a client effect (or `useSyncExternalStore` with a server snapshot) and memoised. Unit test with the table in 11.6.2.

##### B2. Static SVG, built once (L5309-5370)
- Starts when: once at script start, before any render.
- Reads: `same`, `city`.
- Writes: the full SVG tree (11.6.2 "Static SVG"). `g.ct-orb__you` gets `style.display = 'none'` when `same`; otherwise its label becomes `"You · " + city` (middle dot U+00B7).
- Pauses or skips when: never.
- Cleanup in React: none.
- Port as: static JSX inside `<ContactOrb>`; compute the 24 tick lines and 4 hour labels at module scope with `pol()` and `f1()`. The `ct-orb-wg` gradient keeps unrounded coordinates. Keep refs to the nodes that B3 rewrites.

##### B3. Per frame render `render()` (L5372-5468)
- Starts when: called by B4 `fit()` (when the loop is not running), by B5 every 5 minutes (when the loop is not running), by B7 when the scroll rotation changes by more than .05 degrees (when the loop is not running) and by B8 on every accepted frame.
- Reads: `base`, `sway`, `scrollRot`, `sun`, `anchor`, `same`, `you`, `angDist`, the Lahore label's `getComputedTextLength()`.
- Writes: `d` on `path.ct-orb__back`, `.ct-orb__front`, `.ct-orb__par`, `.ct-orb__night`, `.ct-orb__arc`, `.ct-orb__arc-bed`, `.ct-orb__pulse`, `.ct-orb__lead-l`; `transform` on `g.ct-orb__pin` and `g.ct-orb__you`; `style.visibility` on the pin; `style.display` on `g.ct-orb__lead`; `cx`, `cy` on `.ct-orb__lead-d`; `text-anchor`, `x`, `y` on both labels (only when changed).
- Timings: at most one call per accepted loop frame (45ms throttle).
- Pauses or skips when: nothing inside; the callers decide.
- Cleanup in React: none.
- Port as: an imperative `renderOrb(refs, state)` function called from the hooks below. Never put per frame values in React state.

##### B4. Composition `fit()` (L5470-5513, triggers L5559-5562, L5602, L5624)
- Starts when: at script start; `fitSoon()` (cancel the previous frame, then one `requestAnimationFrame(fit)`) from a `ResizeObserver` on `#ct-orb`, `#ct-hero-l` and `#ct-clock-card`, from `document.fonts.ready`, and from window `resize`; directly on `fh:page` with detail `contact`.
- Reads: `orb.clientWidth`, `innerWidth`, `innerHeight`, `card.offsetHeight`, `colL.offsetHeight`, the grid and hero `getBoundingClientRect().top`, the hero computed `padding-bottom`.
- Writes: inline `--ct-kw`, `--ct-s`, `--ct-sx`, `--ct-sy`, `--ct-kx`, `--ct-ky`, `--ct-h` on `#ct-orb`, class `.is-fit`, the module `anchor`; then `render()` if the loop is not running.
- Timings: one frame debounce.
- Pauses or skips when: `orb.clientWidth` is 0 (page hidden by `.page:not(.is-current){display:none}`, L299).
- Cleanup in React: disconnect the observer, cancel the pending frame, remove the resize listener.
- Port as: `useOrbFit({ orbRef, colLRef, cardRef, heroRef })` with `useLayoutEffect`, so the first paint is already composed. The observer on the card re-fires after `--ct-kw` changes the card height; it settles on the next pass.

##### B5. Lahore clock, dial hand and working hours `tick()` (L5522-5559)
- Starts when: script start; `tick()` then `setInterval(tick, 1000)`.
- Reads: `Date`, the two `Intl` formatters, `lastMin`.
- Writes: `#ct-h-lhr`, `#ct-h-you`, the `transform` of `g.ct-orb__now` every second; on a minute change `#ct-hero.is-hours`, `#ct-h-status`, `#ct-orb-sr`; every 5th minute `sunVec()` (+ `render()` when the loop is off). The once only texts `#ct-h-city`, `#ct-h-diff`, `#ct-h-hrs` are written at start (11.6.3).
- Timings: 1000ms interval, not aligned to the second boundary.
- Pauses or skips when: never (runs on every page and in hidden tabs).
- Cleanup in React: `clearInterval` on unmount.
- Port as: `useLahoreClock()` (shared with B11 and with About's Lahore time, L4996) returning the parts, plus an effect in `<ClockCard>` that writes the dial transform through a ref. Keep the minute gate so `.is-hours` and the status text only change on a minute change.

##### B6. Entrance `play(delay)`, `reset()` and the stat count up (L5564-5581, L5623-5628)
- Starts when: `fh:page` with detail `contact` calls `play(600)`; on first load, if the contact page is current, `play(is-loaded ? 120 : 1320)` (`html.is-loaded` is added when the preloader finishes, 1250ms after DOM ready, L4782). Leaving the page (`fh:page` with another detail) calls `reset()`.
- Reads: nothing.
- Writes: `play`: clear both timers, remove `is-play` and `is-live`, force a reflow (`void hero.offsetWidth`), then after `delay` add `is-play`, run `countUp()`, and after 2400ms add `is-live`. `reset`: clear timers, remove both classes. Title split (L5565-5566) runs once at start and sets `--d` 170ms and 300ms.
- `countUp()` (L5568-5575): for each `[data-ct-count]` (index `i`): `to = +dataset.ctCount`, `suf = dataset.suffix`; with reduced motion write `to + suf` and stop; else write `'0' + suf` at once, then after `700 + i * 110` ms run a rAF tween over 1500ms with `e = 1 - Math.pow(1 - k, 4)` and text `Math.round(to * e) + suf`. So "24h" starts at 700ms, "10+" at 810ms, "100%" at 920ms after `is-play`.
- Timings: all delays are 0 with reduced motion (`is-play` and `is-live` at once).
- Pauses or skips when: nothing; the count up timers and frames are NOT cancelled by `reset()`.
- Cleanup in React: clear the play and live timeouts AND the count up timeouts and frames.
- Port as: `useContactEntrance(heroRef, { delay })` that toggles `is-play` and `is-live` on mount (a route show is a mount in Next.js) and `useCountUp` for the three stats. Delay: 600ms after a client route change (it matches the curtain: the page swaps at 560ms and the curtain lifts from 700ms), 120ms on a direct load when the preloader has already finished, 1320ms on a direct load while the preloader is still up.

##### B7. Scroll linked exit `exit()` (L5583-5602)
- Starts when: window `scroll` (passive, one rAF per frame), window `resize` (sets `lastP = -1`, `fitSoon()`, `exit()`), `fh:page` contact, and once at script start.
- Reads: `FH.current`, `hero.offsetHeight` (1 if 0), `scrollY`, `innerWidth`.
- Writes:
  - `p = clamp(scrollY / (heroHeight * .85), 0, 1)`; `desk = innerWidth >= 1024`.
  - `rot = clamp(scrollY / (heroHeight * 1.2), 0, 1) * (desk ? 26 : 18)`; if `|rot - scrollRot| > .05` then `scrollRot = rot` and `render()` when the loop is off. The globe turns up to 26 degrees of longitude on desktop, 18 below 1024px.
  - If `p` equals the last `p`, stop. If `!desk || reduce`: clear inline `transform` and `opacity` on `#ct-hero-l`, `#ct-hero-r` and the cue, stop.
  - Else `e = p * p * (3 - 2 * p)` (smoothstep): `#ct-hero-l` `transform: translate3d(0,(-e*90).toFixed(1)px,0)`, `opacity: (1 - e*.9).toFixed(3)`; `#ct-hero-r` `transform: translate3d(0,(e*40).toFixed(1)px,0) scale((1 - e*.1).toFixed(4))`, `opacity: (1 - e*.75).toFixed(3)` (origin `60% 45%`, L836); `.ct-cue` `opacity: Math.max(0, 1 - p*3).toFixed(3)`.
- Timings: once per animation frame at most.
- Pauses or skips when: `FH.current !== 'contact'`. Reduced motion and widths under 1024px skip the column fade and lift but NOT the globe rotation.
- Cleanup in React: remove the scroll and resize listeners, cancel the pending frame.
- Port as: `useHeroScrollExit({ heroRef, colLRef, colRRef, cueRef, onRotate })`, writing styles through refs.

##### B8. Ambient sway loop (L5604-5620)
- Starts when: `sync()` is called from an `IntersectionObserver` on `#ct-orb` (default options: threshold 0, no root margin), from `visibilitychange`, from every `fh:page`, and once at start. `want = !reduce && FH.current === 'contact' && inView && !document.hidden`.
- Reads: `performance.now()` against `T0` (set once at script start, never reset).
- Writes: `sway.lon = 8 * Math.sin(s * 2 * Math.PI / 32)`, `sway.lat = 3 * Math.sin(s * 2 * Math.PI / 46)` with `s = (t - T0) / 1000`, then `render()`. The globe drifts 8 degrees east and west over 32s and 3 degrees north and south over 46s.
- Timings: `requestAnimationFrame` loop, a frame is skipped unless `t - lastR >= 45` ms (about 22 renders per second).
- Pauses or skips when: reduced motion (never runs, the globe stays still apart from B7), off screen, tab hidden, another page is shown.
- Cleanup in React: cancel the frame, disconnect the observer, remove the `visibilitychange` listener.
- Port as: `useOrbSway(orbRef, render)`; keep `T0` at mount time or module time (either is fine visually).

##### B9. Router hooks (L5622-5629)
- `fh:page` detail `contact`: `lastP = -1; fit(); exit(); play(600);` then `sync()`. Other pages: `reset()` then `sync()`. Initial: `play(...)` if on contact, `sync()`, `exit()`.
- The core router fires the first `fh:page` before contact.js runs, which is why L5628 checks `FH.current` directly. After every `fh:page` the core also dispatches a window `resize` on the next frame (L4685), which re-runs B4 and B7.
- Port as: the page component's mount and unmount; nothing listens to a global event.

##### B10. Copy email (L5631-5639)
- Starts when: `click` on `#ct-copy`.
- Reads: `data-copy` ("mehrfaisal111@gmail.com").
- Writes: `navigator.clipboard.writeText(v)`; on success, or on any failure through the legacy path (a hidden `textarea` with `readonly`, `style.cssText = 'position:fixed;opacity:0;left:-9999px'`, `select()`, `document.execCommand('copy')` in try/catch, removed, then success anyway): add `.is-done`, set `.ct-mail__tip` text to "Copied", toast "Email copied: " + v; after 2200ms remove `.is-done` and set the tip back to "Copy email".
- Timings: 2200ms reset, CSS swaps the icons (.3s opacity, .5s transform) and shows the tip.
- Pauses or skips when: never. Earlier timers are not cleared on a second click.
- Cleanup in React: clear the timer on unmount.
- Port as: `useCopyToClipboard()` + `<CopyEmailButton>` (share with the About copy button, L5012).

##### B11. Map clock (L5645-5655)
- Starts when: script start; `tick()` then `setInterval(tick, 1000)`.
- Writes: `#ct-clock` text `HH:MM:SS` (Lahore).
- Pauses or skips when: never.
- Cleanup in React: `clearInterval`.
- Port as: `useLahoreClock()` (B5) rendered in `<LahoreMap>`.

##### B12. Contact form (L5657-5786)
- Starts when: listeners at start: `blur` and `input` on name, email, phone, details; `change` on type radios; `input` on details (counter); `pointerdown` and `blur` on every `.ct-input` (focus line); `pointerdown` on each `.ct-opt` and `keydown` on its radio (fill origin); `submit` on the form; `click` on `#ct-again`.
- Reads: field values, radio state, `FH_HOOKS.onContact`, `send.offsetWidth`, `form.getBoundingClientRect()`.
- Writes: `aria-invalid`, error texts, `.is-invalid`, `data-touched`, counter text and `.is-near`, `--ox`, `--cx`, `--cy`, the send button `data-state`, `disabled` and inline `width`, `aria-busy`, the status line, the ok label, the done title and message, `hidden` on inner, done and `#ct-mail-direct`, `.is-drawn`, focus, scroll.
- Timings: focus line origin reset 400ms after blur; spinner minimum 500ms (hook) or 850ms (mailto); success pause 900ms; morph 700ms; title focus 400ms; the send width .6s; the check draw .9s at .1s and .55s at .6s.
- Pauses or skips when: `busy` blocks double submits; reduced motion makes `wait()` 0, morphs instant and scrolls `auto`.
- Cleanup in React: clear the 400ms blur timers and the pending waits on unmount.
- Port as: `<ContactForm>` with a small state machine (`idle`, `load`, `ok`, `done`) in `useContactForm()`, `useSendButton()`, `useMorphHeight()`, and field components `<FloatingField>` and `<OptionCard>`. The API call replaces the hook (API_CONTRACT.md); keep the mailto fallback only if the lead wants it.

##### B13. Shared core behaviours used on this page (see 11.2)
- Reveal observer and stagger (kicker, ledger, 4 methods, map, form, next page link), spotlight on the ledger (`--mx`, `--my`), magnetic on "Send a message" (`data-magnetic="0.18"`, fine pointer and no reduced motion), anchor clicks for "Send a message" (`#ct-form`) and the cue (`#ct-ways`) through `FH.scrollToEl`, `data-book` buttons, toasts.

#### 11.6.8 Responsive summary for the whole page

| Condition | Source | What changes |
|---|---|---|
| width >= 1024px | L115, L218, L243; JS `innerWidth >= 1024` (L5479, L5588) | Rail shown, dock hidden. `fit()` uses the two column sizes (`two`: card 252px max, `Hmax` from the text column). Scroll exit fades and lifts the columns; globe spins up to 26 degrees. Anchor scroll offset 32px. |
| width <= 1100px | L1165-1170 | Ledger 2 x 2; type options 2 columns. |
| width <= 1023px | L1171-1177, L301 | Hero single column (text, then orb), hero padding 104px top, 40px bottom, title `clamp(3.5rem,13vw,7rem)`, cue hidden, stats full width. Scroll exit: globe spins up to 18 degrees only, no column fade. Anchor scroll offset 84px. |
| width <= 900px | L1178-1182 | Map above the form, map not sticky, map height 380px. |
| width <= 600px | L1183-1221 | Title `clamp(3.6rem,22vw,6rem)`; hero actions grid; orb bleeds 6px each side; stats 1.8rem; ledger single column with the icon beside the text and the number hidden; map 390px, chips and panel 12px inset; form padding 22px 18px, radius `--r-lg`, head icon hidden; fields 1 column; options 1 column with row layouts; send button full width; notes full width. |
| orb width >= 440px (JS) | L5479 | Diagonal composition: dial top right, clock card bottom left, leader line to the Lahore pin. |
| orb width < 440px (JS) | L5503-5507 | Stacked composition: dial centred (max 480px), card centred under it (`min(W - 12, 460)` wide below 1024px), no leader line. |
| `(hover:hover)` | L1004-1008 | Ledger cell plate lift, child lift, number colour. The icon tile hover (L1012-1013) and option hover (L1113) are NOT gated. |
| `(pointer:fine)` and no reduced motion | L4626-4631 | Magnetic pull on "Send a message". |
| `prefers-reduced-motion: reduce` | L357-362, L1553-1559; JS `reduce` | All transitions and animations about 0 (global), hero delays 0, orb and map pings, beam dots and the dial "now" ping hidden, no sway loop, no column exit (globe scroll spin stays), `play()` and `is-live` without delay, count up skipped, `wait()` 0, `morphHeight` instant, scrolls `auto`. |
| `[data-theme="dark"]` | L818, L891, L919, L921, L931, L916, L1002, L1077, L1118-1119, L1336 | Error tokens, leader line opacity .6, night side `#000` at .42, rim shine, Lahore core accent, shade stop black, ledger plate `--surface-3`, focus border accent, checked option accent, input `color-scheme:dark`. |

#### 11.6.9 Content data

Where a value is shared with other pages (About key cards L3157-3186, the chat knowledge L6272-6274, the booking modal), keep ONE source: put the shared contact facts in `site.ts` (or import them from there if the About part already defines them) and the contact page only content in `contact.ts`.

##### frontend/src/content/site.ts (shared contact facts)
```ts
export interface ContactFacts {
  email: string;
  phone: { display: string; href: string };
  whatsapp: null;               // not in reference (only a chat keyword at L6295)
  location: string;
  city: string;
  timeZone: 'Asia/Karachi';
  utcOffsetMinutes: 300;        // PKT, UTC+5, no DST
  tzAbbr: 'PKT';
  gmtLabel: 'GMT+5';
  workingDays: readonly number[];   // getUTCDay() numbering, 1..5 = Monday..Friday
  workStartMinutes: number;         // minutes after midnight, Lahore time
  workEndMinutes: number;           // exclusive
}

export const contactFacts: ContactFacts = {
  email: 'mehrfaisal111@gmail.com',
  phone: { display: '+92 314 8166354', href: 'tel:+923148166354' },
  whatsapp: null,
  location: 'Lahore, Pakistan',
  city: 'Lahore',
  timeZone: 'Asia/Karachi',
  utcOffsetMinutes: 300,
  tzAbbr: 'PKT',
  gmtLabel: 'GMT+5',
  workingDays: [1, 2, 3, 4, 5],
  workStartMinutes: 540,   // 09:00
  workEndMinutes: 1080,    // 18:00
};
```
Response times as the reference states them (keep each where it appears, the wording differs): "Usually responds within 2-4 hours" (email method), "24h" (hero stat "Response Time"), "I'll respond within 24 hours with next steps" (form note), "within 24 hours" (done messages).

##### frontend/src/content/socials.ts
The contact page shows no social links. Socials live in the About hero (L3048-3054, part 11.3). WhatsApp: not in reference.

##### frontend/src/content/contact.ts: hero, clock card and dial
```ts
export type IconId = string; // sprite symbol id, for example 'i-mail' or 'ct-i-down'

export interface HeroStat { label: string; to: number; suffix: string }

export interface ContactHeroContent {
  pill: string;
  title: { a: string; b: string };
  lead: string;
  primaryCta: { label: string; href: string; icon: IconId; magnetic: number };
  bookCta: { label: string; icon: IconId };
  emailPill: { label: string; icon: IconId; title: string; copyAriaLabel: string; tip: string; tipCopied: string; toastPrefix: string; resetMs: number };
  stats: HeroStat[];
  cue: { label: string; href: string; icon: IconId };
}

export const contactHero: ContactHeroContent = {
  pill: 'Available for Projects',
  title: { a: 'Let’s', b: 'Connect' },
  lead: "Ready to bring your ideas to life with AI? Whether you need an intelligent web application, an AI-powered product with LLM integration, or expert consultation, I'm here to help turn your vision into reality.",
  primaryCta: { label: 'Send a message', href: '#ct-form', icon: 'ct-i-down', magnetic: 0.18 },
  bookCta: { label: 'Book a meeting', icon: 'i-calendar' },
  emailPill: {
    label: 'Email',
    icon: 'i-mail',
    title: 'mehrfaisal111@gmail.com',
    copyAriaLabel: 'Copy email address mehrfaisal111@gmail.com',
    tip: 'Copy email',
    tipCopied: 'Copied',
    toastPrefix: 'Email copied: ',
    resetMs: 2200,
  },
  stats: [
    { label: 'Response Time', to: 24, suffix: 'h' },
    { label: 'Projects Completed', to: 10, suffix: '+' },
    { label: 'Client Satisfaction', to: 100, suffix: '%' },
  ],
  cue: { label: 'Scroll to reach me', href: '#ct-ways', icon: 'ct-i-down' },
};

export interface ClockCardCopy {
  defaults: { status: string; lahore: string; you: string; city: string; diff: string; hours: string };
  lahoreKey: string;
  lahoreTz: string;
  youKey: string;
  hoursKey: string;
  sameCity: string;
  same: string;
  behind: (t: string) => string;
  ahead: (t: string) => string;
  hoursJoin: string;
  open: string;
  backIn: (h: number, m: number) => string;
  backDay: (day: string) => string;
  weekdays: readonly string[];
  srLine: (hhmm: string, status: string, diff: string) => string;
}

export const clockCard: ClockCardCopy = {
  defaults: { status: 'Checking hours', lahore: '--:--:--', you: '--:--', city: 'Local', diff: 'Same time zone as Lahore', hours: '09:00 to 18:00' },
  lahoreKey: 'Lahore',
  lahoreTz: 'PKT',
  youKey: 'You',
  hoursKey: 'My hours, your time',
  sameCity: 'Lahore',
  same: 'Same time zone as Lahore',
  behind: (t) => "You're " + t + ' behind Lahore',
  ahead: (t) => "You're " + t + ' ahead of Lahore',
  hoursJoin: ' to ',
  open: 'In working hours now',
  backIn: (h, m) => 'Offline, back in ' + (h ? h + 'h ' : '') + m + 'm',
  backDay: (day) => 'Offline, back ' + day + ' 9AM',
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  srLine: (hhmm, status, diff) => 'Live clock. Lahore time ' + hhmm + ' PKT. ' + status + '. ' + diff + '.',
};

export const orbCopy = {
  dialLabel: 'Mon\u2013Fri · 9AM\u20136PM PKT',   // two en dashes and a middle dot, exactly as L5339
  hourLabels: ['00', '06', '12', '18'],
  you: 'You',
  youWithCity: (city: string) => 'You · ' + city,     // L5370
  lahore: 'Lahore',
} as const;
```
The time difference text `t` is `hh + 'h' + (mm ? ' ' + mm + 'm' : '')` (11.6.3).

##### frontend/src/content/contact.ts: kicker and methods
```ts
export const contactKicker = { number: '05', text: 'Ways to reach me' } as const;

export type MethodCta =
  | { kind: 'link'; label: string; href: string; external?: boolean }
  | { kind: 'book'; label: string };   // button[data-book] with no preset type

export interface ContactMethod {
  no: string;
  icon: IconId;
  title: string;
  description: string;
  value: { text: string; href?: string };   // with href the value is a link (a.ct-method__v), else p.ct-method__v
  note: { icon: IconId; text: string };
  cta: MethodCta;
}

export const contactMethods: ContactMethod[] = [
  {
    no: '01',
    icon: 'i-mail',
    title: 'Email Me',
    description: 'Best for detailed project discussions',
    value: { text: 'mehrfaisal111@gmail.com', href: 'mailto:mehrfaisal111@gmail.com' },
    note: { icon: 'i-clock', text: 'Usually responds within 2-4 hours' },
    cta: { kind: 'link', label: 'Send Email', href: 'mailto:mehrfaisal111@gmail.com' },
  },
  {
    no: '02',
    icon: 'i-phone',
    title: 'Call Me',
    description: 'For urgent matters and quick consultations',
    value: { text: '+92 314 8166354', href: 'tel:+923148166354' },
    note: { icon: 'i-clock', text: 'Available Mon-Fri, 9AM-6PM (GMT+5)' },
    cta: { kind: 'link', label: 'Call Now', href: 'tel:+923148166354' },
  },
  {
    no: '03',
    icon: 'i-calendar',
    title: 'Schedule Meeting',
    description: 'Book a free consultation at your convenience',
    value: { text: 'Video Call or Phone' },
    note: { icon: 'i-video', text: '30 or 60 minute sessions available' },
    cta: { kind: 'book', label: 'Book Meeting' },
  },
  {
    no: '04',
    icon: 'i-pin',
    title: 'Location',
    description: 'Based in Pakistan, serving clients worldwide',
    value: { text: 'Lahore, Pakistan' },
    note: { icon: 'i-globe', text: 'Timezone: GMT+5 (PKT)' },
    cta: { kind: 'link', label: 'View Map', href: 'https://maps.google.com/?q=Lahore,Pakistan', external: true },
  },
];
// Every CTA ends with the icon 'i-arrow-up-right'. external: true means target="_blank" rel="noopener".
```

##### frontend/src/content/contact.ts: the Lahore map
```ts
export const lahoreMap = {
  chip: 'My Location',
  timeSrLabel: 'Local time in Lahore:',
  timePlaceholder: '--:--',
  tz: 'PKT',
  title: 'Lahore, Pakistan',
  coords: '31.5204° N, 74.3587° E',
  cta: { label: 'View Map', href: 'https://maps.google.com/?q=Lahore,Pakistan', icon: 'i-arrow-up-right' },
  svgLabels: { towns: ['Gujranwala', 'Sheikhupura', 'Kasur'], river: 'RAVI', pin: 'Lahore' },
} as const;
// The SVG art itself (11.6.5) is static markup: keep it in LahoreMap.tsx, not in content.
```

##### frontend/src/content/contact.ts: form content
Field rules, error texts, the payload and the hook success and failure texts are in REFERENCE_MAP.md section 10. Put them in this file as `contactFormMessages` next to the block below; they are not repeated here.
```ts
export interface ProjectTypeOption { value: string; title: string; subtitle: string; icon: IconId }
export interface BudgetOption { value: string; amount: string; subtitle: string }

export const projectTypes: ProjectTypeOption[] = [
  { value: 'App Development', title: 'App Development', subtitle: 'Mobile apps, cross-platform solutions, custom applications', icon: 'i-phone-dev' },
  { value: 'Web Application', title: 'Web Application', subtitle: 'Complex web apps, dashboards, SaaS platforms', icon: 'i-code' },
  { value: 'E-commerce', title: 'E-commerce', subtitle: 'Online stores, payment integration, inventory', icon: 'i-cart' },
  { value: 'Maintenance & Support', title: 'Maintenance & Support', subtitle: 'Bug fixes, updates, performance optimization', icon: 'i-wrench' },
  { value: 'Consultation', title: 'Consultation', subtitle: 'Technical advice, code review, architecture', icon: 'i-message' },
  { value: 'Other', title: 'Other', subtitle: 'Custom requirements, unique projects', icon: 'i-sparkles' },
];

export const budgets: BudgetOption[] = [
  { value: 'Under $1,000', amount: 'Under $1,000', subtitle: 'Small projects, basic websites' },
  { value: '$1,000 - $5,000', amount: '$1,000 - $5,000', subtitle: 'Medium complexity projects' },
  { value: '$5,000 - $10,000', amount: '$5,000 - $10,000', subtitle: 'Complex web applications' },
  { value: '$10,000+', amount: '$10,000+', subtitle: 'Enterprise solutions' },
];

export interface FieldCopy { label: string; required: boolean; icon?: IconId }

export const contactFormCopy = {
  headIcon: 'i-send',
  title: 'Send Me a Message',
  sub: "Tell me about your project and let's discuss how I can help bring your vision to life.",
  fields: {
    name: { label: 'Full Name', required: true, icon: 'i-user' },
    email: { label: 'Email Address', required: true, icon: 'i-mail' },
    phone: { label: 'Phone Number', required: false, icon: 'i-phone' },
    company: { label: 'Company/Organization', required: false, icon: 'i-building' },
    details: { label: 'Project Details', required: true },
  } satisfies Record<string, FieldCopy>,
  requiredMark: '*',
  typeLegend: 'What type of project are you interested in?',   // followed by the required mark
  budgetLegend: 'Project Budget Range',
  detailsMax: 2000,
  detailsNearAt: 1800,          // .is-near when length > 1800
  counterSuffix: ' / 2000',
  send: { idle: 'Send Message', idleIcon: 'i-send', okDefault: 'Done', okSent: 'Sent', okMail: 'Ready', okIcon: 'i-check' },
  notes: [
    { icon: 'i-shield', text: 'Your information is secure and will never be shared with third parties' },
    { icon: 'i-clock', text: "I'll respond within 24 hours with next steps" },
  ],
  // texts not listed in section 10:
  statusSending: 'Sending your message.',
  statusSent: 'Message sent.',
  statusMail: 'Your email app is opening with the message.',
  toastMail: 'Opening your email app with your message',
  done: {
    titleDefault: 'Thanks!',
    title: (first: string) => 'Thanks, ' + first + '!',
    mailMessage: 'Your email app should now be open with your message filled in. Press send there and I will get back to you within 24 hours.',
    again: { label: 'Write another message', icon: 'i-message' },
    direct: { label: 'Email directly', icon: 'i-mail', href: 'mailto:mehrfaisal111@gmail.com' },
  },
} as const;

// mailto fallback body, exactly as summary() at L5719-5725
export function contactMailBody(d: { name: string; email: string; phone: string; company: string; projectType: string; budget: string; details: string }): string {
  return 'Hi Faisal,\n\n' + d.details + '\n\n---\n' +
    'Name: ' + d.name + '\nEmail: ' + d.email +
    (d.phone ? '\nPhone: ' + d.phone : '') + (d.company ? '\nCompany: ' + d.company : '') +
    '\nProject type: ' + d.projectType + (d.budget ? '\nBudget: ' + d.budget : '') +
    '\n\nSent from faisalhanif.work';
}
```

##### frontend/src/content/contact.ts (or lib/contact/globe.ts): time zone to place table
Copied from L5239-5258. 62 zones, `[lat, lon]` in degrees. Keep the numbers exactly (they are the reference's rounded city positions, for example `'Europe/London':[51.5,-.1]`).
```ts
export const visitorPlaces: Record<string, readonly [number, number]> = {
  'America/New_York':[40.7,-74],'America/Toronto':[43.7,-79.4],'America/Chicago':[41.9,-87.6],'America/Denver':[39.7,-105],'America/Phoenix':[33.4,-112],
  'America/Los_Angeles':[34,-118.2],'America/Vancouver':[49.3,-123.1],'America/Mexico_City':[19.4,-99.1],'America/Sao_Paulo':[-23.5,-46.6],'America/Bogota':[4.7,-74.1],
  'America/Argentina/Buenos_Aires':[-34.6,-58.4],'America/Lima':[-12,-77],'Pacific/Honolulu':[21.3,-157.9],'Europe/London':[51.5,-.1],'Europe/Dublin':[53.3,-6.3],
  'Europe/Lisbon':[38.7,-9.1],'Europe/Madrid':[40.4,-3.7],'Europe/Paris':[48.9,2.35],'Europe/Amsterdam':[52.4,4.9],'Europe/Brussels':[50.8,4.4],'Europe/Berlin':[52.5,13.4],
  'Europe/Zurich':[47.4,8.5],'Europe/Rome':[41.9,12.5],'Europe/Stockholm':[59.3,18.1],'Europe/Oslo':[59.9,10.7],'Europe/Warsaw':[52.2,21],'Europe/Athens':[38,23.7],
  'Europe/Istanbul':[41,29],'Europe/Moscow':[55.8,37.6],'Europe/Kiev':[50.5,30.5],'Europe/Kyiv':[50.5,30.5],'Africa/Cairo':[30,31.2],'Africa/Lagos':[6.5,3.4],
  'Africa/Nairobi':[-1.3,36.8],'Africa/Johannesburg':[-26.2,28],'Africa/Casablanca':[33.6,-7.6],'Asia/Riyadh':[24.7,46.7],'Asia/Qatar':[25.3,51.5],'Asia/Dubai':[25.2,55.3],
  'Asia/Tehran':[35.7,51.4],'Asia/Kabul':[34.5,69.2],'Asia/Karachi':[24.9,67],'Asia/Tashkent':[41.3,69.3],'Asia/Kolkata':[22.6,88.4],'Asia/Calcutta':[22.6,88.4],
  'Asia/Kathmandu':[27.7,85.3],'Asia/Dhaka':[23.8,90.4],'Asia/Bangkok':[13.8,100.5],'Asia/Jakarta':[-6.2,106.8],'Asia/Singapore':[1.35,103.8],'Asia/Kuala_Lumpur':[3.1,101.7],
  'Asia/Shanghai':[31.2,121.5],'Asia/Hong_Kong':[22.3,114.2],'Asia/Taipei':[25,121.5],'Asia/Manila':[14.6,121],'Asia/Seoul':[37.6,127],'Asia/Tokyo':[35.7,139.7],
  'Australia/Perth':[-31.9,115.9],'Australia/Brisbane':[-27.5,153],'Australia/Sydney':[-33.9,151.2],'Australia/Melbourne':[-37.8,145],'Pacific/Auckland':[-36.8,174.8]
};

// Fallbacks (L5253-5258)
export const utcZonePattern = /^(Etc\/)?(UTC|GMT|UCT|Universal|Zulu)$/;   // or an empty tz: city 'UTC'
export const utcPlace = { lat: 51.5, lon: -0.1 } as const;              // London
export const regionLatitudes: Record<string, number> = { America: 35, Europe: 48, Africa: 5, Australia: -30, Pacific: -15, Asia: 28 };
export const defaultRegionLatitude = 30;                                // first tz segment not in the table
// unknown zone longitude: Math.max(-170, Math.min(170, offsetMinutes / 4))

export const lahoreGlobe = { lat: 31.52, lon: 74.36 } as const;         // L5234 (the map panel shows 31.5204, 74.3587)
```

#### Notes and traps

Globe and dial
- The globe has NO land: no continents, no dots, no outlines, no data file. Only the graticule, the dashed Lahore parallel, the night shade, the arc and two markers. Do not add a world map.
- It is one inline SVG, not a canvas. Build the static parts once as JSX and only rewrite `d`, `transform` and a few attributes per frame through refs. React state per frame would re-render the whole tree 22 times a second.
- `f1()` rounds to one decimal and JavaScript prints `444`, not `444.0`. Use `String(Math.round(n * 10) / 10)` so snapshot tests match the reference output.
- The dial puts 12:00 (noon) at the TOP and 00 at the bottom, hours clockwise. It is not a normal clock face; the working band runs from the 09 tick over the top to the 18 tick.
- "Same place" is decided by the UTC offset first: every UTC+5 zone (for example Asia/Tashkent, Asia/Yekaterinburg, Indian/Maldives) counts as Lahore. Those visitors get no "You" marker, no arc, "Same time zone as Lahore", and the card shows "You LAHORE" (the city text becomes `Lahore`, L5524). Asia/Kolkata (UTC+5:30) is not "same".
- The offset comes from `new Date().getTimezoneOffset()` once at load; a DST change during a visit is ignored.
- The comment at L5470-5474 says the card is "mirrored when the arc prefers the other side". The code never mirrors: `side` runs once (`side * .15` is always 0) and the card always docks bottom left (`kx = 0`). The `isL` branch of `place()` is never used.
- `fit()` picks `two` from the VIEWPORT (`innerWidth >= 1024`) but the diagonal layout from the ORB width (`>= 440px`). Tablets (single column, wide orb) get the diagonal layout with the leader line; only narrow phones get the stacked layout.
- The SVG is sized larger than the column (`hi = min(W / .9, 600 or 540)`) and pushed 5 percent past the top and right edges; the hero's `overflow:hidden;overflow:clip` trims it. Keep both overflow values.
- The ResizeObserver also watches the card; `fit()` changes the card width, which changes its height, which fires the observer once more. It settles after one extra pass; do not "fix" it with a guard that stops the second pass.
- The "You" marker is never hidden when it turns behind the globe (only the Lahore pin hides at `z < -.05`). The best view keeps both ends at `z >= .25`, so in practice it stays in front.
- The night shade is recomputed only every 5 minutes (`sunVec()` on minutes divisible by 5), so the terminator moves in small steps. Between steps only the view (sway, scroll) changes it.
- The Lahore label placer measures `getComputedTextLength()`; before the webfont loads the width is wrong. The reference re-fits on `document.fonts.ready`; keep that.
- The scroll exit ALWAYS spins the globe (up to 26 degrees on desktop, 18 below 1024px), even with reduced motion and on phones. Only the column lift and fade are desktop and motion only.
- `reduce` is read once at load. Toggling the OS setting mid visit does nothing until reload.
- With reduced motion the ambient sway never runs; the pings, the beam dot and the dial "now" ping are hidden (L1558), but the pulse along the arc (`ct-travel`) is not in that list; the global rule shortens it to one .001ms iteration, so it effectively disappears.

Timers and lifecycle
- Three one second intervals run forever in the reference (hero tick L5559, map clock L5654, plus About's clock). In React clear them on unmount.
- `reset()` does not cancel the stat count up (its `setTimeout` and rAF chain). Leaving and coming back quickly lets an old count keep writing over a new one. Cancel them in the port (no visible change otherwise).
- The first `fh:page` fires before contact.js exists; L5628 covers a direct load of `#contact`. In Next.js the page mount replaces both paths; keep the three delays (600ms, 120ms, 1320ms).
- `FH.split(title)` runs once at load. Render the split words in JSX; do not re-split on every show.
- The stats' HTML already says "24h", "10+", "100%" (good for no JS and SEO). The count up writes "0" plus suffix at `is-play`, while the `.ct-in` items are still invisible.

Hydration
- Everything that depends on the visitor (time zone, local time, city, the arc, the working hours status, the "is-hours" class) must be computed after mount. Render the HTML defaults on the server: "Checking hours", "--:--:--", "--:--", "Local", "Same time zone as Lahore", "09:00 to 18:00", map clock "--:--".
- The hidden start states are all under `.js` (L959-988, L178-186). Add the `js` class to `<html>` before paint (like L2881) or the hero flashes in its final state and then jumps back.

CSS details that are easy to get wrong
- Stats use `data-ct-count`, not `data-count`; the core counter must not touch them.
- The number shows above the label in the stats because `.ct-stat` is `flex-direction:column-reverse` while the DOM has `dt` first. Keep the DOM order (a11y: term before value).
- Not every hover is gated: the ledger plate and lift use `@media (hover:hover)`, but the ledger icon tile (L1012-1013) and the option cards (L1113) are not, so on touch they stay "hovered" after a tap, as in the reference.
- `background` transitions to `var(--grad)` (ledger icon tile, option icon tile) cannot interpolate a gradient; they switch at once. That is the reference look.
- Keep selector order for the form states. In dark mode `[data-theme="dark"] .ct-input:focus` (L1077) is more specific than `.ct-input[aria-invalid="true"]` (L1090), so a focused invalid field shows the ACCENT border (with the red background and red ring). In light mode the red border wins.
- `.ct-err:not(:empty)` replays its slide in only when the element goes from empty to filled.
- The floating labels depend on `placeholder=" "`; a real placeholder or an empty one breaks `:placeholder-shown`.
- `.ct-send` replaces the `.btn` transition list (no colour transitions on the send button).
- On phones `.ct-send{width:100%}`, but `setSend` writes inline pixel widths: the full width pill shrinks to a 58px circle, then grows to its old full width, then `width = ''` snaps back to 100 percent.
- Option fill origin with the keyboard: `keydown` clears `--cx/--cy` only on the radio that has focus when the key goes down (the one being left). An option that was clicked before and is reached again with the arrow keys still fills from its old pointer point.
- `#contact .ct-map` is 390px tall at 600px and below but 380px between 601px and 900px (the phone rule is later and taller).
- `.ct-map__pin{transition:transform .9s}`, the `.ct-hero__count` rules and `.ct-hero__bar::after` do nothing (no element, or switched off at L1563). Do not build them.
- `.ct-orb__g` is a CSS transformed `<g>` with `transform-box:view-box;transform-origin:250px 250px`. Keep `transform-box`, or the scale and rotate pivot moves.
- Reveal cards (`.ct-ledger`, `.ct-map`, `.ct-form`) get their `transition` from `.js [data-reveal]` (more specific than `.card`), so the `.card` shadow and border transitions do not apply to them.
- The page local sprite symbols `ct-i-copy` and `ct-i-down` live at L3966-3969, not in the main sprite (L2883-2947).
- The dial label uses two EN dashes and a middle dot (`Mon\u2013Fri · 9AM\u20136PM PKT`); the ledger note uses plain hyphens ("Mon-Fri, 9AM-6PM (GMT+5)"). Copy each exactly.
- The map panel coordinates (31.5204, 74.3587) differ from the globe's Lahore point (31.52, 74.36). Both are correct for their use.

Behaviour details
- Two clock formatters differ: the hero uses `hourCycle:'h23'`, the map uses `hour12:false`. Some engines print "24:00:00" at midnight with `hour12:false`. Using `hourCycle:'h23'` for both gives the intended "00:00:00" (see owner question).
- The legacy copy path (`execCommand`) always reports success, even if copying failed. A second click within 2200ms is reset early by the first click's timer.
- "Write another message" calls `setErr` on the company field too, which writes `aria-invalid="false"` on it (it never had the attribute). Harmless; match it or skip it.
- `#ct-mail-direct` ("Email directly") shows only on the mailto path. With the backend hook it never shows; on a failed send the reference shows a toast and keeps the form (no mailto fallback).
- `showDone` measures the form top before the height morph and scrolls by `top - 24` only when the form top is above the viewport.
- `morphHeight` sets `overflow:hidden` on the form for 700ms, which clips focus rings and shadows inside it during the morph. That matches the reference.
- The icon `svg` elements inside `.ct-method__ic`, `.ct-form__head .icon-tile` and `.ct-opt__ic` have no `aria-hidden` in the reference (the others do). Keep the markup the same unless the lead decides otherwise.
- `#ct-orb-sr` (sr-only, updated once a minute) is not a live region; screen readers read it when they reach the card. The visible card rows are `aria-hidden`.
- Hash anchors inside the page (`#ct-form`, `#ct-ways`) go through the core router's `FH.scrollToEl` with an 84px or 32px offset. In Next.js do not let them change the route; scroll with the same offsets.

### 11.7 Booking modal (#booking) and chat widget (#ct-chat): visuals, motion and the chat knowledge

This part adds the deep inventory for the booking modal and the chat widget. Sections 4, 5, 9 and 10 of the map already give the top level ranges, the fields, the error texts and the payloads; they are checked here (11.7.9 and 11.7.17) and only the missing detail is added. The modal hook itself (`FH.openModal`, `FH.closeModal`, click delegation, Esc) is written up in 11.2.11; the shared success styles (`.ct-done`, `.ct-check`) and the contact form classes are in 11.6. All line numbers are absolute lines in `reference-design/faisalhanif-redesign.html`.

#### 11.7.0 Source line index

| Area | HTML | CSS | JS |
|---|---|---|---|
| Error colour tokens for `#booking` and `.ct-chat`, `[hidden]` guard | none | L816-818 | none |
| Modal shell `.fh-modal` | L4240-4243 (booking copy) | L266-277 | L4649-4660 (core, see 11.2.11) |
| Booking panel width, stage, head, title, lead | L4242-4253 | L1227-1234 | none |
| Screen A `pick` | L4248-4319 | L1236-1296 | L5879-5922 |
| Screen B `steps` | L4321-4450 | L1298-1425 | L5924-6109 |
| Screen C `done` | L4452-4462 | L1427-1433 (plus `.ct-check` L1156-1162) | L6111-6160 |
| Booking responsive | none | L1435-1460 | none |
| Booking helpers used (`esc`, `pad`, `ymd`, `parseYmd`, `openMail`, `wait`, `morphHeight`, `swapViews`) | none | none | L5180-5225 |
| Booking module | none | none | L5788-6173 |
| Chat widget | L4467-4491 | L1462-1552 | L6175-6485 |
| Chat knowledge (`PROJECTS`, `A`, `KB`, `INTENTS`) | none | none | L6185-6330 |
| Every Book button (`[data-book]`) | L2992, L3043, L3203, L3411, L3416, L3812, L3986, L4046 | per page | L4658 (core delegation) |

Contact.js module constants used by both parts (L5180-5187):
- `$ = (s, r) => (r || document).querySelector(s)`, `$$` = the same with `querySelectorAll` turned into an array.
- `reduce = !!FH.reduce` (core L4565-4566: `matchMedia('(prefers-reduced-motion: reduce)').matches`, read ONCE at load, never updated).
- `EASE = 'cubic-bezier(.22,1,.36,1)'` (the same curve as `--ease-out`).
- `EMAIL = 'mehrfaisal111@gmail.com'`.
- `EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/`.
- `hooks = () => window.FH_HOOKS || {}` (read at call time, so a hook set later still works).
- `toast = m => FH.toast(m)` (core L4663: shows `#toast` with class `is-on` for 3200ms).

Tokens used below (values from L27-86; the full token table is in 11.1): `--ease-out: cubic-bezier(.22,1,.36,1)`, `--ease-io: cubic-bezier(.65,0,.35,1)`, `--dur-1: .35s`, `--dur-2: .6s`, `--r-pill: 999px`, `--r-lg: 24px`, `--r-xl: 32px`, `--mint: #5fcf9f` (dark `#6ee7b7`), `--grad: linear-gradient(135deg,#0e6655 0%,#0a5a4a 100%)` (dark `linear-gradient(135deg,#0f7a64 0%,#0a5a4a 100%)`), `--grad-glow: linear-gradient(100deg,#0e6655 0%,#1f9c7f 45%,#5fcf9f 100%)` (dark `linear-gradient(100deg,#34d399 0%,#5fcf9f 40%,#b6f0d9 100%)`), `--glow: 0 10px 30px -10px rgba(14,102,85,.55)` (dark `0 10px 34px -10px rgba(52,211,153,.45)`), `--glass: rgba(255,255,255,.72)` (dark `rgba(11,26,22,.72)`).

Shared classes these parts reuse (defined elsewhere, do not redefine): `.sr-only` L107, `.serif` L118, `.grad-text` L119, `.mono` L120, `.label` L121, `.eyebrow` L127-129, `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--sm` L134-145 (`.btn` has `--h:52px`), `.link-arrow` L146-148, `.icon-tile`, `.icon-tile--soft` L161-163, `@keyframes fh-ping` L153, `.ct-req` L1081, the hidden native radio rule `.ct-opt input,.ct-sess input,.ct-plat input` L1110, `.ct-err` L1093-1096, `.ct-spin` L1145-1146, `.ct-check*` L1156-1162.

Scoped CSS at the top of contact.css (L816-818), which the booking modal and the chat need even though they live outside `#contact`:
```css
#contact [hidden],#booking [hidden],.ct-chat [hidden]{display:none!important}
#contact,#booking,.ct-chat{--ct-err:#b42a33;--ct-err-soft:rgba(180,42,51,.10)}
[data-theme="dark"] #contact,[data-theme="dark"] #booking,[data-theme="dark"] .ct-chat{--ct-err:#ff9a9a;--ct-err-soft:rgba(255,154,154,.10)}
```
The `[hidden]` rule matters: `.ct-bk__done` has `display:grid`, which would beat the UA `[hidden]` rule without it.

#### 11.7.1 Every Book button (`[data-book]`)

There are exactly 8, all `<button>` elements. None has its own handler: the core click delegation (L4658) catches `e.target.closest('[data-book]')`, calls `e.preventDefault()`, then `FH.openBooking(b.dataset.book || '')` (falls back to `FH.openModal('booking')` if booking.js did not load). `openBooking` preselects Technical Deep Dive only when the value is exactly `deep`; every other value (including empty) preselects Quick Chat.

| Line | Page and place | Element and classes | Visible copy (icon) | `data-book` |
|---|---|---|---|---|
| L2992 | Top bar (phones and tablets, the bar hides at 1024px and up) | `button.btn.btn--primary.btn--sm` (no `type`) | "Book" (`i-calendar`, icon has no `aria-hidden`) | empty |
| L3043 | About hero actions, next to "Download CV" | `button.btn.btn--ghost[type=button]` | "Book Meeting" (`i-calendar`, `aria-hidden="true"`) | empty |
| L3203 | About "Get to Know Me" bento, the "Open to Work" card (`.ab-kc__actions`) | `button.btn.ab-btn-light[type=button]` | "Book Meeting" (`i-calendar`) | empty |
| L3411 | About side panel "Talk first" (`aside.ab-side`) | `button.card.card--hover.ab-sess[type=button][data-spotlight][data-reveal]` | `.ab-sess__time` "30" / "min", `.ab-sess__txt` "Quick Chat" / "Perfect for initial discussions and project exploration", `.ab-sess__price` "$15" / "per session" | empty |
| L3416 | Same panel | same classes | "60" / "min", "Technical Deep Dive" / "Comprehensive discussion for complex projects", "$25" / "per session" | `deep` |
| L3812 | Works hero CTAs (`.wk-wh__ctas`) | `button.btn.btn--ghost.wk-wh__book[type=button]` | "Book Meeting" (`i-calendar`) | empty |
| L3986 | Contact hero actions | `button.btn.btn--ghost.ct-hact.ct-in[type=button]` with `style="--i:7"` | "Book a meeting" (`i-calendar`) | empty |
| L4046 | Contact methods ledger, "Video Call or Phone" method | `button.link-arrow.ct-method__cta[type=button]` | "Book Meeting " then `i-arrow-up-right` | empty |

Also opening the booking modal, not through `[data-book]`: the chat action buttons "Book a call", "Book Quick Chat" and "Book Deep Dive" call `FH.openBooking(a.type || '')` (L6435), see 11.7.14.

Port as: one `openBooking(type?: 'quick' | 'deep' | '')` function from a `BookingProvider` context; every Book button calls it on click. Keep them as `<button type="button">` (the top bar one has no `type` in the reference; it is not inside a form, so `type="button"` is the safe equal).

#### 11.7.2 Modal shell for the booking modal (CSS L266-277, core JS L4649-4660)

The core hook is written up in 11.2.11. Here is what the booking modal gets from it.

##### Shell CSS (copy exactly)
```css
.fh-modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:clamp(0px,3vw,32px);visibility:hidden;pointer-events:none}
.fh-modal.is-open{visibility:visible;pointer-events:auto}
.fh-modal__scrim{position:absolute;inset:0;background:rgba(3,14,11,.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s var(--ease-out)}
.fh-modal.is-open .fh-modal__scrim{opacity:1}
.fh-modal__panel{position:relative;width:min(1080px,100%);max-height:min(92vh,100%);overflow:auto;overscroll-behavior:contain;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);
  opacity:0;transform:translateY(28px) scale(.98);transition:opacity .5s var(--ease-out),transform .7s var(--ease-out)}
.fh-modal.is-open .fh-modal__panel{opacity:1;transform:none}
@media (max-width:640px){.fh-modal{padding:0;align-items:end}.fh-modal__panel{max-height:94vh;border-radius:24px 24px 0 0}}
.fh-modal__close{position:sticky;top:14px;margin-left:auto;margin-right:14px;margin-top:14px;z-index:5;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);color:var(--ink);float:right;transition:transform var(--dur-2) var(--ease-out)}
.fh-modal__close:hover{transform:rotate(90deg)}
body.modal-open{overflow:hidden}
```
Booking override (L1227): `#booking .ct-bk__panel{width:min(1000px,100%)}`.

##### Booking modal root markup (L4240-4245)
- `div.fh-modal.ct-bk#booking[aria-hidden="true"]`
  - `div.fh-modal__scrim[data-close]` (click closes)
  - `div.fh-modal__panel.ct-bk__panel[role="dialog"][aria-modal="true"][aria-labelledby="ct-bk-t1"]` (JS swaps `aria-labelledby` to `ct-bk-t1`, `ct-bk-t2` or `ct-bk-t3` with the screen, L5872; JS also adds `data-native-scroll=""`, L5794)
    - `button.fh-modal__close[type=button][data-close][aria-label="Close booking"]` with `i-close` (no `aria-hidden` on the svg)
    - `p.sr-only#ct-bk-live[role="status"][aria-live="polite"]` (empty; the announcer, see 11.7.8)
    - `div.ct-bk__stage#ct-bk-stage` (holds the three `section.ct-bk__screen[data-screen]`)

##### Open and close animation
- Open: add `.is-open` to `#booking`. The scrim fades `opacity 0 to 1` over `.5s var(--ease-out)`. The panel goes from `opacity:0; transform:translateY(28px) scale(.98)` to `opacity:1; transform:none`, opacity over `.5s`, transform over `.7s`, both `var(--ease-out)`, no delay.
- Close: remove `.is-open`. Because `.fh-modal` switches `visibility` with no transition, the whole modal (scrim and panel inherit `visibility`) disappears at once; the reverse opacity and transform transitions run while invisible. So in the reference the close looks instant. Copy the CSS as is and the port behaves the same; do not add an exit animation.
- Reduced motion: the global block (L357-362) sets every transition to `.001ms`, so open is instant too.
- Phone sheet (max-width 640px): `.fh-modal` has `padding:0` and `align-items:end`, so the panel sits on the bottom edge as a sheet, `max-height:94vh`, radius `24px 24px 0 0`. The open motion is the same 28px rise and scale, not a full slide up.
- Panel scroll: the panel itself scrolls (`overflow:auto`, `overscroll-behavior:contain`). `data-native-scroll` tells the smooth wheel scroller (core L4744) to leave wheel events inside it alone; the scroller also stops when `body.modal-open` is set (L4749).
- The close button is `position:sticky; top:14px; float:right`, so it stays in the top right corner of the panel while the panel scrolls, and floats over the stage. `.ct-bk__head` keeps `padding-right:44px` (40px at 640px and below) so titles never run under it. Hover turns it 90 degrees over `var(--dur-2) var(--ease-out)`.

##### Behaviour: FH.openModal / FH.closeModal as used by the booking modal
- Name and lines: `FH.openModal` L4651-4652, `FH.closeModal` L4653-4654, delegation L4655-4659, Esc L4660.
- Starts when: `FH.openBooking()` calls `FH.openModal('booking')` (L6170). Closing: a click on any `[data-close]` inside (the scrim and the close button), the `Escape` key anywhere (`document` keydown, closes every open `.fh-modal`), or the router: `FH.go()` closes every open modal before it navigates (L4695).
- Reads or measures: `document.activeElement` at open (stored as `lastFocus`).
- Writes: `#booking.is-open`, `aria-hidden="false"`, `body.modal-open`; dispatches `fh:open` on the modal. Close: removes `.is-open`, `aria-hidden="true"`, dispatches `fh:close`, removes `body.modal-open` when no modal is left open, then focuses `lastFocus` with `{preventScroll:true}`.
- Timings: open focuses the first `[autofocus],button,input,select,textarea,a[href]` in the modal after 60ms (this is the close button); `openBooking` then moves focus to the checked session radio after 90ms (70ms with reduced motion).
- Pauses or skips when: nothing. There is no focus trap: Tab can leave the dialog into the page behind it.
- Cleanup in React: remove the `keydown` listener; restore `body` overflow; restore focus on unmount.
- Port as: `Modal` component (11.2.11) with `id="booking"`, used by `BookingModal`.

#### 11.7.3 Booking stage, screen shell and shared head (HTML L4245-4253, CSS L1227-1234)

Structure: `div.ct-bk__stage#ct-bk-stage` holds three siblings, `section.ct-bk__screen[data-screen="pick"]` (visible), `section.ct-bk__screen[data-screen="steps"][hidden]` and `section.ct-bk__screen.ct-bk__done[data-screen="done"][hidden]`. Only one is shown at a time; JS switches them with `swapViews` on the y axis (11.7.8, B1 and B2).

```css
.ct-bk__stage{padding:clamp(22px,4vw,48px);padding-top:clamp(24px,3.4vw,40px)}
.ct-bk__screen{outline:none}
.ct-bk__head{display:grid;gap:10px;justify-items:start;margin-bottom:clamp(22px,3vw,34px);padding-right:44px}
.ct-bk__title{font-size:clamp(2.1rem,4.4vw,3.3rem);font-weight:800;letter-spacing:-.045em;line-height:1;outline:none}
.ct-bk__title .serif{font-weight:400;letter-spacing:-.02em;padding-right:.08em}
.ct-bk__title--sm{font-size:clamp(1.9rem,3.6vw,2.7rem)}
.ct-bk__lead{color:var(--muted);font-size:1rem;max-width:54ch;line-height:1.6}
```
At 640px and below: `.ct-bk__stage{padding:20px 18px 24px}`, `.ct-bk__head{padding-right:40px}`.

#### 11.7.4 Screen A: pick a session (HTML L4247-4319, CSS L1236-1296)

##### Tree
- `section.ct-bk__screen[data-screen="pick"]`
  - `header.ct-bk__head`
    - `span.eyebrow` "Book Meeting"
    - `h2.ct-bk__title#ct-bk-t1` "Schedule a " + `span.serif.grad-text` "Meeting"
    - `p.ct-bk__lead` "Pick a session, choose how many you need, then grab a time that suits you."
  - `div.ct-bk__pick` (grid: main column and summary aside)
    - `div.ct-bk__main`
      - `fieldset.ct-bk__types` with `legend.sr-only` "Session type"
        - 2 x `label.ct-sess` > `input[type=radio][name="ct-bk-type"][value]` + `span.ct-sess__box` (card)
      - `div.ct-bk__count` (sessions stepper row)
    - `aside.ct-bk__sum[aria-label="Booking summary"]`
  - `div.ct-bk__expect` ("What to Expect" list)

##### Session cards (L4259-4278)
Each card: `label.ct-sess` > `input[type=radio][name="ct-bk-type"]` (a real radio, hidden by the shared contact form rule L1110: `.ct-opt input,.ct-sess input,.ct-plat input{position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none}`) + `span.ct-sess__box` >
- `span.ct-sess__top` > `span.ct-sess__ic` (svg `i-zap` or `i-layers`, no `aria-hidden`) + `span.ct-sess__dur.mono` (duration) + `span.ct-sess__radio[aria-hidden="true"]` (custom dot)
- `span.ct-sess__name`
- `span.ct-sess__price` > `b` price + " per session"
- `span.ct-sess__desc`
- `span.ct-sess__list` > 3 x `span` (svg `i-check` `aria-hidden="true"` + text)

Copy, word for word:

| value | icon | `.ct-sess__dur` | `.ct-sess__name` | `.ct-sess__price` | `.ct-sess__desc` | features |
|---|---|---|---|---|---|---|
| `quick` | `i-zap` | "30 minutes" | "Quick Chat" | "$15" + " per session" | "Perfect for initial discussions and project exploration" | "Project overview", "Requirements discussion", "Technology suggestions" |
| `deep` | `i-layers` | "60 minutes" | "Technical Deep Dive" | "$25" + " per session" | "Comprehensive discussion for complex projects" | "Detailed planning", "Architecture review", "Timeline & budget" (`&amp;` in the HTML) |

CSS (L1237-1261):
```css
.ct-bk__pick{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;align-items:stretch}
.ct-bk__main{display:flex;flex-direction:column;gap:14px;min-width:0}
.ct-bk__types{border:0;margin:0;padding:0;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.ct-sess{position:relative;display:block;cursor:pointer;min-width:0}
.ct-sess__box{display:flex;flex-direction:column;height:100%;padding:20px;border-radius:22px;background:var(--surface);border:1px solid var(--line-strong);
  transition:border-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out),background var(--dur-2)}
.ct-sess:hover .ct-sess__box{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--brand)}
.ct-sess input:checked + .ct-sess__box{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand),var(--shadow-md);background:linear-gradient(180deg,var(--brand-soft),transparent 55%),var(--surface)}
[data-theme="dark"] .ct-sess input:checked + .ct-sess__box{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent),var(--shadow-md)}
.ct-sess input:focus-visible + .ct-sess__box{outline:2px solid var(--accent);outline-offset:3px}
.ct-sess__top{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.ct-sess__ic{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand-ink);transition:background var(--dur-2),color var(--dur-2),box-shadow var(--dur-2)}
.ct-sess input:checked + .ct-sess__box .ct-sess__ic{background:var(--grad);color:#fff;box-shadow:var(--glow)}
.ct-sess__dur{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brand-ink);padding:5px 9px;border-radius:var(--r-pill);border:1px solid var(--line-strong)}
.ct-sess__radio{margin-left:auto;width:22px;height:22px;flex:none;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;transition:border-color var(--dur-1),background var(--dur-2)}
.ct-sess__radio::after{content:"";width:8px;height:8px;border-radius:50%;background:#fff;transform:scale(0);transition:transform var(--dur-2) var(--ease-out)}
.ct-sess input:checked + .ct-sess__box .ct-sess__radio{border-color:transparent;background:var(--grad)}
.ct-sess input:checked + .ct-sess__box .ct-sess__radio::after{transform:scale(1)}
.ct-sess__name{font-size:1.22rem;font-weight:750;color:var(--ink);letter-spacing:-.025em;line-height:1.2}
.ct-sess__price{color:var(--muted);font-size:.86rem;margin:4px 0 10px}
.ct-sess__price b{color:var(--brand-ink);font-size:1.6rem;font-weight:800;letter-spacing:-.035em;margin-right:4px}
.ct-sess__desc{font-size:.86rem;color:var(--ink-2);line-height:1.5;margin-bottom:14px}
.ct-sess__list{display:grid;gap:7px;margin-top:auto;padding-top:14px;border-top:1px dashed var(--line-strong)}
.ct-sess__list span{display:flex;align-items:center;gap:9px;font-size:.84rem;color:var(--ink-2)}
.ct-sess__list .i{width:15px;height:15px;color:var(--accent);stroke-width:2.6}
```
States: hover lifts the card 3px with `--shadow-md` and a brand border. Checked: brand border plus a 1px inset ring, a soft brand gradient top (`linear-gradient(180deg,var(--brand-soft),transparent 55%)`), the icon tile turns to `--grad` with white icon and `--glow`, the custom radio fills with `--grad` and its white 8px dot scales from 0 to 1 over `var(--dur-2) var(--ease-out)`. Dark theme uses `--accent` for the checked border and ring. Keyboard focus on the radio shows a 2px `--accent` outline 3px outside the box.
Interaction: arrow keys move between the two radios (native radio group). A change updates the summary, tweens the total and announces (11.7.8, B5).
Responsive: at 640px and below `.ct-bk__types{grid-template-columns:1fr}` (cards stack).

##### Sessions stepper row (L4281-4291, CSS L1263-1275)
- `div.ct-bk__count`
  - `div.ct-bk__count-txt` > `span.ct-bk__label#ct-bk-n-label` "Select Number of Session" (sic, singular) + `span.ct-bk__hint` "From 1 to 10"
  - `div.ct-stepper[role="group"][aria-labelledby="ct-bk-n-label"]`
    - `button.ct-stepper__b[type=button][data-bk-step="-1"][aria-label="Remove a session"]` (svg `i-minus`)
    - `span.ct-stepper__v` > `output#ct-bk-n[aria-live="polite"]` "1" + `span.ct-stepper__u` "Session (s)" (sic, with the space)
    - `button.ct-stepper__b[type=button][data-bk-step="1"][aria-label="Add a session"]` (svg `i-plus`)
```css
.ct-bk__count{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 12px 12px 20px;border-radius:20px;background:var(--surface);border:1px solid var(--line)}
.ct-bk__count-txt{display:grid;gap:2px;min-width:0}
.ct-bk__label{font-weight:650;color:var(--ink);font-size:.95rem}
.ct-bk__hint{font-size:.78rem;color:var(--muted)}
.ct-stepper{display:flex;align-items:center;gap:4px;padding:4px;border-radius:var(--r-pill);background:var(--surface-2);border:1px solid var(--line)}
.ct-stepper__b{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--surface);border:1px solid var(--line);color:var(--brand-ink);box-shadow:var(--shadow-sm);
  transition:transform var(--dur-1) var(--ease-out),background var(--dur-1),opacity var(--dur-1)}
.ct-stepper__b:hover:not(:disabled){background:var(--brand-soft)}
.ct-stepper__b:active:not(:disabled){transform:scale(.92)}
.ct-stepper__b:disabled{opacity:.38;cursor:not-allowed;box-shadow:none}
.ct-stepper__v{min-width:92px;display:grid;justify-items:center;line-height:1.1}
.ct-stepper__v output{font-weight:800;font-size:1.35rem;color:var(--ink);font-variant-numeric:tabular-nums;display:inline-block}
.ct-stepper__u{font-family:var(--font-mono);font-size:.64rem;letter-spacing:.06em;color:var(--muted)}
```
States: minus is `disabled` at 1, plus is `disabled` at 10 (L5898-5899). On each change the number does a Web Animations bump: `el.n.animate([{transform:'translateY(6px)' or 'translateY(-6px)', opacity:.3}, {transform:'none', opacity:1}], {duration:380, easing:EASE})`, +6px when adding, -6px when removing, skipped with reduced motion (L5912).
Responsive: at 640px and below `.ct-bk__count{flex-wrap:wrap;padding:14px}` and `.ct-stepper{margin-left:auto}` (the stepper wraps under the label and sits right).

##### Summary aside (L4294-4307, CSS L1277-1287)
- `aside.ct-bk__sum[aria-label="Booking summary"]`
  - `span.label` "Summary"
  - `dl.ct-bk__dl` > 3 x `div` > `dt` + `dd`:
    - "Session Type" / `dd#ct-bk-s-type` "Quick Chat"
    - "Price per Session" / `dd#ct-bk-s-price` "$15"
    - "Number of Sessions" / `dd#ct-bk-s-n` "1"
  - `div.ct-bk__total` > `span` "Total Amount" + `strong.ct-bk__total-v#ct-bk-s-total` "$15"
  - `button.btn.btn--primary.ct-bk__go#ct-bk-go[type=button]` "Book Session " + svg `i-arrow-right` (`aria-hidden="true"`)
  - `p.ct-bk__fine` > svg `i-calendar` (`aria-hidden="true"`) + "Next, pick a date and time"
```css
.ct-bk__sum{display:flex;flex-direction:column;padding:22px;border-radius:24px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-md);min-width:0}
.ct-bk__dl{margin:12px 0 0;display:grid}
.ct-bk__dl div,.ct-recap-dl div{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px dashed var(--line-strong);font-size:.87rem}
.ct-bk__dl dt,.ct-recap-dl dt{color:var(--muted);flex:none}
.ct-bk__dl dd,.ct-recap-dl dd{margin:0;color:var(--ink);font-weight:600;text-align:right;min-width:0;overflow-wrap:anywhere}
.ct-bk__total{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:18px 0 20px}
.ct-bk__total span{font-weight:650;color:var(--ink);font-size:.92rem}
.ct-bk__total-v{font-size:2.5rem;font-weight:800;letter-spacing:-.045em;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1}
.ct-bk__go{width:100%;margin-top:auto}
.ct-bk__fine{display:flex;gap:7px;justify-content:center;align-items:center;font-size:.76rem;color:var(--muted);margin-top:12px}
.ct-bk__fine .i{width:14px;height:14px}
```
The total counts with a 650ms cubic ease out tween (11.7.8, B4). The `$` sign and the whole number are written as one text node (`'$' + Math.round(n)`).
Responsive: at 860px and below `.ct-bk__pick{grid-template-columns:1fr}` (the aside drops under the cards).

##### What to Expect (L4310-4318, CSS L1289-1296)
- `div.ct-bk__expect` > `h3.ct-bk__h3` "What to Expect" + `ul.ct-bk__elist` > 4 x `li` > `span.icon-tile.icon-tile--soft` (svg, no `aria-hidden`) + `div` > `strong` + `p`

| icon | strong | p |
|---|---|---|
| `i-user` | "Personal Consultation" | "One-on-one discussion tailored to your specific needs and goals" |
| `i-sparkles` | "Expert Insights" | "Professional recommendations and innovative solutions for your project" |
| `i-clock` | "Flexible Timing" | "Choose a time that works best for your schedule across different time zones" |
| `i-shield` | "Confidential & Secure" (`&amp;` in the HTML) | "Your information and project details are kept private and secure at all times" |

```css
.ct-bk__expect{margin-top:clamp(26px,4vw,40px);padding-top:clamp(22px,3vw,30px);border-top:1px solid var(--line)}
.ct-bk__h3{font-size:1.05rem;letter-spacing:-.02em;margin-bottom:18px}
.ct-bk__elist{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px}
.ct-bk__elist li{display:grid;gap:12px;align-content:start;min-width:0}
.ct-bk__elist .icon-tile{width:40px;height:40px;border-radius:12px}
.ct-bk__elist .icon-tile .i{width:19px;height:19px}
.ct-bk__elist strong{display:block;color:var(--ink);font-size:.9rem;margin-bottom:4px;letter-spacing:-.01em}
.ct-bk__elist p{font-size:.8rem;color:var(--muted);line-height:1.5}
```
Responsive: 860px and below 2 columns; 440px and below `.ct-bk__elist{grid-template-columns:1fr;gap:16px}` and each `li` becomes a row `grid-template-columns:40px minmax(0,1fr);gap:14px` (icon left, text right).

#### 11.7.5 Screen B: the three steps (HTML L4321-4450, CSS L1298-1425)

##### Tree
- `section.ct-bk__screen[data-screen="steps"][hidden]`
  - `header.ct-bk__head.ct-bk__head--steps` (the `--steps` modifier has no CSS rule)
    - `button.ct-bk__change#ct-bk-change[type=button]` > svg `i-arrow-left` (`aria-hidden="true"`) + `span` "Change session"
    - `h2.ct-bk__title.ct-bk__title--sm#ct-bk-t2` "Book Your " + `span.serif.grad-text` "Session"
    - `p.ct-bk__lead` "Complete the steps below to schedule your meeting" (no full stop)
  - `div.ct-bk__flow` (grid: steps column and recap aside)
    - `div.ct-bk__col`
      - `div.ct-steps` (progress header)
      - `div.ct-bk__panes#ct-bk-panes` (no CSS rule; the `swapViews` container for the x axis) > 3 x `div.ct-pane[data-pane]`
    - `aside.ct-recap[aria-label="Your session"]`

```css
.ct-bk__change{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px 0 8px;margin:-6px 0 4px -8px;border-radius:var(--r-pill);color:var(--brand-ink);font-weight:600;font-size:.84rem;transition:background var(--dur-1)}
.ct-bk__change:hover{background:var(--brand-soft)}
.ct-bk__change .i{width:16px;height:16px;transition:transform var(--dur-2) var(--ease-out)}
.ct-bk__change:hover .i{transform:translateX(-3px)}
.ct-bk__flow{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:clamp(20px,3vw,32px);align-items:start}
.ct-bk__col{min-width:0}
```
Responsive: 860px and below `.ct-bk__flow{grid-template-columns:1fr}`, `.ct-recap{display:none}`, `.ct-order{display:block}` (the aside is replaced by the in pane order summary on step 3). 640px and below `.ct-bk__change{height:44px}`.

##### Steps header with the progress fill (L4331-4338, CSS L1305-1323)
- `div.ct-steps`
  - `div.ct-steps__line[aria-hidden="true"]` > `span.ct-steps__fill#ct-steps-fill`
  - `ol.ct-steps__list[aria-label="Booking progress"]` > 3 x `li.ct-steps__i[data-si]` > `span.ct-steps__n` (> `span` number + svg `i-check`, no `aria-hidden` on the svg) + `span.ct-steps__l` label

| `data-si` | number | label |
|---|---|---|
| 1 | "1" | "Details" |
| 2 | "2" | "Schedule" |
| 3 | "3" | "Confirm" |

```css
.ct-steps{position:relative;margin-bottom:clamp(24px,3vw,32px)}
.ct-steps__list{list-style:none;margin:0;padding:0;position:relative;z-index:1;display:flex;justify-content:space-between}
.ct-steps__i{display:flex;flex-direction:column;align-items:center;gap:8px;width:84px}
.ct-steps__i:first-child{align-items:flex-start}
.ct-steps__i:last-child{align-items:flex-end}
.ct-steps__line{position:absolute;left:20px;right:20px;top:19px;height:2px;border-radius:2px;background:var(--line-strong);overflow:hidden}
.ct-steps__fill{position:absolute;inset:0;background:var(--grad-glow);transform-origin:0 50%;transform:scaleX(0);transition:transform .9s var(--ease-out)}
.ct-steps__n{position:relative;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--surface);border:1.5px solid var(--line-strong);color:var(--muted);font-weight:700;font-size:.9rem;
  transition:border-color var(--dur-2),color var(--dur-2),background var(--dur-2),box-shadow var(--dur-2) var(--ease-out)}
.ct-steps__n > span,.ct-steps__n .i{transition:opacity var(--dur-1),transform var(--dur-2) var(--ease-out)}
.ct-steps__n .i{position:absolute;width:18px;height:18px;stroke-width:2.6;opacity:0;transform:scale(.4)}
.ct-steps__l{font-family:var(--font-mono);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);transition:color var(--dur-2)}
.ct-steps__i:first-child .ct-steps__l{padding-left:0}
.ct-steps__i.is-current .ct-steps__n{border-color:var(--brand);color:var(--brand-ink);box-shadow:0 0 0 5px var(--accent-soft)}
[data-theme="dark"] .ct-steps__i.is-current .ct-steps__n{border-color:var(--accent)}
.ct-steps__i.is-done .ct-steps__n{background:var(--grad);border-color:transparent;color:#fff}
.ct-steps__i.is-done .ct-steps__n > span{opacity:0;transform:scale(.4)}
.ct-steps__i.is-done .ct-steps__n .i{opacity:1;transform:none}
.ct-steps__i.is-current .ct-steps__l,.ct-steps__i.is-done .ct-steps__l{color:var(--brand-ink)}
```
States (set by `setStepUI`, L5925-5932): the current step gets `.is-current` and `aria-current="step"` (a brand ring plus a 5px `--accent-soft` halo); earlier steps get `.is-done` (filled `--grad`, the number fades and shrinks to `scale(.4)` while the check fades in from `scale(.4)` to full). The fill is set inline: `#ct-steps-fill.style.transform = 'scaleX(' + ((step - 1) / 2) + ')'`, so `scaleX(0)`, `scaleX(0.5)`, `scaleX(1)`, animated by the CSS transition `.9s var(--ease-out)`. The line runs from the centre of circle 1 to the centre of circle 3 (`left:20px; right:20px; top:19px`, circles are 40px).

##### Panes shared CSS (L1325-1351)
```css
.ct-pane{outline:none}
.ct-pane__t{font-size:1.12rem;letter-spacing:-.02em;margin-bottom:18px}
.ct-bf{display:grid;gap:7px;margin:0 0 18px;min-width:0;border:0;padding:0}
.ct-bf__l{font-size:.86rem;font-weight:650;color:var(--ink);padding:0}
legend.ct-bf__l{margin-bottom:9px}
.ct-opt-tag{font-weight:500;color:var(--muted)}
.ct-bf__in{display:block;width:100%;height:50px;padding:0 16px;border-radius:14px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);font-size:.95rem;outline:none;
  transition:border-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out)}
.ct-bf__in::placeholder{color:var(--muted);opacity:.7}
.ct-bf__in:focus{border-color:var(--brand);box-shadow:0 0 0 4px var(--accent-soft)}
[data-theme="dark"] .ct-bf__in:focus{border-color:var(--accent)}
[data-theme="dark"] .ct-bf__in,[data-theme="dark"] .ct-input{color-scheme:dark}
.ct-bf__in[aria-invalid="true"]{border-color:var(--ct-err);background:var(--ct-err-soft)}
.ct-bf__ta{height:auto;min-height:96px;padding:12px 16px;line-height:1.55;resize:vertical}
.ct-bf__row{display:flex;gap:8px}
.ct-bf__wrap{position:relative;flex:1;min-width:0}
.ct-bf__wrap .ct-bf__in{padding-right:44px}
.ct-bf__ok{position:absolute;right:14px;top:50%;margin-top:-10px;width:20px;height:20px;color:var(--accent);opacity:0;transform:scale(.4);transition:opacity var(--dur-1),transform var(--dur-2) var(--ease-out)}
.ct-bf__ok .i{width:20px;height:20px}
.ct-bf__verify{--h:50px;border-radius:14px;padding:0 18px;flex:none}
.ct-bf.is-verified .ct-bf__ok{opacity:1;transform:none}
.ct-bf.is-verified .ct-bf__in{border-color:var(--accent)}
.ct-bf.is-verified .ct-bf__verify{color:var(--brand-ink);background:var(--brand-soft);border-color:transparent}
.ct-bf__hint{display:flex;gap:6px;align-items:center;font-size:.78rem;color:var(--muted);line-height:1.4}
.ct-bf__hint .i{width:14px;height:14px;flex:none}
.ct-bf__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}
.ct-pane__nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px;padding-top:20px;border-top:1px solid var(--line)}
```
The error lines are the shared `.ct-err` (L1093-1096): `font-size:.8rem;color:var(--ct-err);line-height:1.4;margin-top:7px;padding-left:2px;font-weight:500`, hidden when `:empty`, and each time it gets text it plays `ct-err-in .45s var(--ease-out)` (`from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}`). `.ct-req` is `color:var(--brand-ink)`.
Responsive: 640px and below `.ct-bf__two{grid-template-columns:1fr}` and `.ct-pane__nav .btn{flex:1}` (Back and Continue share the row equally).

##### Pane 1: Contact Information (L4341-4376)
- `div.ct-pane[data-pane="1"]` > `h3.ct-pane__t` "Contact Information"
- Email `div.ct-bf` (gets `.is-verified`):
  - `label.ct-bf__l[for="ct-bk-email"]` "Email Address " + `span.ct-req[aria-hidden="true"]` "*"
  - `div.ct-bf__row` > `div.ct-bf__wrap` > `input.ct-bf__in#ct-bk-email[type=email][autocomplete=email][inputmode=email][placeholder="you@company.com"][required][aria-required="true"][aria-describedby="ct-bk-email-hint ct-bk-email-err"]` + `span.ct-bf__ok[aria-hidden="true"]` (svg `i-check-circle`); then `button.btn.btn--ghost.ct-bf__verify#ct-bk-verify[type=button]` "Verify"
  - `p.ct-bf__hint#ct-bk-email-hint` > svg `i-video` (`aria-hidden="true"`) + `span` "Meeting link will be sent here"
  - `p.ct-err#ct-bk-email-err[aria-live="polite"]` (the only `.ct-err` with `aria-live`)
- Name `div.ct-bf`: `label.ct-bf__l[for="ct-bk-name"]` "Full Name " + `span.ct-req` "*"; `input.ct-bf__in#ct-bk-name[type=text][autocomplete=name][placeholder="Your name"][required][aria-required="true"][aria-describedby="ct-bk-name-err"]`; `p.ct-err#ct-bk-name-err`
- `div.ct-bf__two` with two `div.ct-bf`:
  - `label[for="ct-bk-phone"]` "Phone Number " + `span.ct-opt-tag` "(Optional)"; `input.ct-bf__in#ct-bk-phone[type=tel][autocomplete=tel][inputmode=tel][placeholder="+1 555 000 0000"][aria-describedby="ct-bk-phone-hint"]`; `p.ct-bf__hint#ct-bk-phone-hint` > `span` "For urgent communication"
  - `label[for="ct-bk-company"]` "Company " + `span.ct-opt-tag` "(Optional)"; `input.ct-bf__in#ct-bk-company[type=text][autocomplete=organization][placeholder="Company name"][aria-describedby="ct-bk-company-hint"]`; `p.ct-bf__hint#ct-bk-company-hint` > `span` "Business context helps"
- `div.ct-pane__nav` > empty `span` (keeps Continue on the right) + `button.btn.btn--primary[type=button][data-bk-next]` "Continue " + svg `i-arrow-right`
- No `maxlength` on any of these four inputs (only the notes textarea has one).
- Verified look: the check icon fades and scales in inside the input (right 14px), the input border turns `--accent`, the Verify button turns soft brand with text "Verified".

##### Pane 2: Select Date & Time (L4379-4412, CSS L1353-1387)
- `div.ct-pane[data-pane="2"][hidden]` > `h3.ct-pane__t` "Select Date & Time" (`&amp;` in the HTML)
- `div.ct-sched` (grid: calendar left, side right)
  - `div.ct-bf.ct-bf--cal` (`--cal` has no CSS rule)
    - `span.ct-bf__l#ct-cal-label` "Preferred Date " + `span.ct-req` "*" + " " + `span.ct-opt-tag` "(Monday to Friday)"
    - `div.ct-cal#ct-cal[role="group"][aria-labelledby="ct-cal-label"][aria-describedby="ct-bk-date-err"]`
      - `div.ct-cal__head` > `button.ct-cal__nav[type=button][data-cal="-1"][aria-label="Previous month"]` (svg `i-arrow-left`) + `span.ct-cal__month#ct-cal-month[aria-live="polite"]` (for example "October 2026") + `button.ct-cal__nav[data-cal="1"][aria-label="Next month"]` (svg `i-arrow-right`)
      - `div.ct-cal__dow[aria-hidden="true"]` > `span` x 7: "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"
      - `div.ct-cal__grid#ct-cal-grid` (filled by JS)
    - `p.ct-err#ct-bk-date-err`
  - `div.ct-sched__side`
    - `div.ct-bf` > `label.ct-bf__l[for="ct-bk-tz"]` "Your Timezone " + `span.ct-req` "*"; `div.ct-select` > `select.ct-bf__in#ct-bk-tz` (options from JS) + svg `i-globe` (`aria-hidden="true"`)
    - `div.ct-bf` > `span.ct-bf__l#ct-slots-label` "Available Time Slots " + `span.ct-req` "*"; `div.ct-slots#ct-slots[role="radiogroup"][aria-labelledby="ct-slots-label"][aria-describedby="ct-slots-hint ct-bk-slot-err"]`; `p.ct-bf__hint#ct-slots-hint` > svg `i-clock` + `span` "Times shown in your timezone"; `p.ct-err#ct-bk-slot-err`
- `div.ct-pane__nav` > `button.btn.btn--ghost[type=button][data-bk-prev]` (svg `i-arrow-left`) "Back" + `button.btn.btn--primary[data-bk-next]` "Continue " (svg `i-arrow-right`)

Calendar grid markup written by `renderCal` (L6019-6023), one month:
- `lead = (first.getDay() + 6) % 7` pads first (Monday first): `<span class="ct-cal__pad" aria-hidden="true"></span>`
- then one button per day: `<button type="button" class="ct-cal__d[ is-today]" data-date="YYYY-MM-DD" aria-label="Tuesday, October 6, 2026[, unavailable]" aria-pressed="true|false" tabindex="0|-1"[ disabled]>6</button>`
  - `aria-label` uses `Intl.DateTimeFormat('en-US', {weekday:'long', day:'numeric', month:'long', year:'numeric'})`, plus ", unavailable" when the day cannot be booked.
  - `is-today` when the date is the visitor's local today (today is never bookable, so it is also `disabled`).
  - Exactly one button has `tabindex="0"` (roving tab stop): the passed focus date, else the selected date if it is in this month, else the first available day of the month; if the month has no available day, none gets `0`.
- No trailing pads after the last day.

Calendar states:
- Available: weekday (Mon to Fri by the visitor's local calendar), strictly after local today, and at most 60 days after today (`avail`, L6010).
- Disabled: `color:var(--muted);opacity:.38;cursor:default;font-weight:400`.
- Hover (not disabled, not selected): soft brand background and brand text.
- Today: 1px inset ring `inset 0 0 0 1px var(--line-strong)`.
- Selected (`aria-pressed="true"`): `--grad` background, white text, `--glow`.
- Invalid (no date on Continue): `.ct-cal.is-invalid` gives the calendar card a `--ct-err` border.
- Prev month button disabled when the view is the current month or earlier; next disabled when the view is the month of today + 60 days or later (L6027-6028). Disabled nav: `opacity:.3;cursor:default`.

```css
.ct-sched{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:20px;align-items:start}
.ct-sched__side{min-width:0}
.ct-cal{padding:12px;border-radius:20px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-sm)}
.ct-cal__head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.ct-cal__nav{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:var(--ink-2);border:1px solid var(--line);transition:background var(--dur-1),opacity var(--dur-1)}
.ct-cal__nav:hover:not(:disabled){background:var(--brand-soft);color:var(--brand-ink)}
.ct-cal__nav:disabled{opacity:.3;cursor:default}
.ct-cal__nav .i{width:16px;height:16px}
.ct-cal__month{font-weight:700;color:var(--ink);font-size:.95rem;letter-spacing:-.01em}
.ct-cal__dow,.ct-cal__grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;text-align:center}
.ct-cal__dow span{font-family:var(--font-mono);font-size:.64rem;color:var(--muted);letter-spacing:.06em;padding:6px 0}
.ct-cal__d{height:38px;border-radius:11px;font-size:.86rem;font-weight:600;color:var(--ink);display:grid;place-items:center;font-variant-numeric:tabular-nums;
  transition:background var(--dur-1),color var(--dur-1),box-shadow var(--dur-2) var(--ease-out),transform var(--dur-1) var(--ease-out)}
.ct-cal__d:hover:not(:disabled):not([aria-pressed="true"]){background:var(--brand-soft);color:var(--brand-ink)}
.ct-cal__d:disabled{color:var(--muted);opacity:.38;cursor:default;font-weight:400}
.ct-cal__d.is-today{box-shadow:inset 0 0 0 1px var(--line-strong)}
.ct-cal__d[aria-pressed="true"]{background:var(--grad);color:#fff;box-shadow:var(--glow)}
.ct-cal__pad{height:38px}
.ct-cal.is-invalid{border-color:var(--ct-err)}
.ct-select{position:relative}
.ct-select select{appearance:none;-webkit-appearance:none;padding-left:42px;padding-right:38px;cursor:pointer;text-overflow:ellipsis}
.ct-select > .i{position:absolute;left:15px;top:50%;margin-top:-9px;width:18px;height:18px;color:var(--muted);pointer-events:none}
.ct-select::after{content:"";position:absolute;right:18px;top:50%;width:7px;height:7px;margin-top:-6px;border-right:1.6px solid var(--muted);border-bottom:1.6px solid var(--muted);transform:rotate(45deg);pointer-events:none}
```
Responsive: 640px and below `.ct-sched{grid-template-columns:1fr}` (slots under the calendar), `.ct-cal__dow,.ct-cal__grid{gap:2px}`, `.ct-cal__d,.ct-cal__pad{height:44px}` (touch size).

Time zone options (written by `buildZones`, L5829-5840): `<option value="IANA id">GMT+5 · Pakistan (PKT) (your zone)</option>`. The `·` is U+00B7 with a space on each side. Sample list as rendered on 28 Sep 2026 for a visitor in `Asia/Karachi` (offsets are taken at "now", so they move with daylight saving):
```
GMT-7 · Los Angeles (Pacific)
GMT-6 · Denver (Mountain)
GMT-5 · Chicago (Central)
GMT-4 · New York (Eastern)
GMT-4 · Toronto
GMT-3 · Sao Paulo
GMT+0 · UTC
GMT+1 · Lagos
GMT+1 · London
GMT+2 · Berlin
GMT+2 · Paris
GMT+3 · Nairobi
GMT+3 · Riyadh
GMT+3 · Istanbul
GMT+4 · Dubai
GMT+5 · Pakistan (PKT) (your zone)
GMT+5:30 · India
GMT+6 · Dhaka
GMT+8 · Shanghai
GMT+8 · Singapore
GMT+9 · Tokyo
GMT+10 · Sydney
GMT+13 · Auckland
```
Sort is by offset, then by IANA id (`a.z.localeCompare(b.z)`), which is why "Riyadh" (`Asia/Riyadh`) comes before "Istanbul" (`Europe/Istanbul`) at the same offset. A visitor zone that is not in the list is added (unshifted) with its own label, for example `GMT+1 · Casablanca (your zone)`.

##### Time slots (L6059-6094, CSS L1376-1387)
Markup written by `renderSlots`:
- No date yet: `<div class="ct-slots__empty"><svg class="i" aria-hidden="true"><use href="#i-calendar"/></svg><span>Pick a date to see open times.</span></div>`
- With a date: 9 buttons, one per hour 9:00 to 17:00 Lahore time: `<button type="button" role="radio" class="ct-slot[ ct-slot--in]" style="animation-delay:{i*35}ms" data-ms="{utc ms}" aria-checked="true|false" aria-label="{label}" tabindex="-1">9:00 PM[<small>next day</small>]</button>`
  - Visible text: `fmtTime(ms, tz)` (`Intl.DateTimeFormat('en-US', {timeZone:tz, hour:'numeric', minute:'2-digit'})`, for example "9:00 AM"), then `<small>next day</small>` or `<small>prev day</small>` when the slot falls on another calendar day in the chosen zone than the picked (Lahore) date.
  - `aria-label`: `fmtTime(ms, tz)` + (if tagged: `', ' + fmtShortTz(ms, tz)`, for example ", Wed, Oct 7") + `' your time, '` + `fmtTime(ms, 'Asia/Karachi')` + `' in Lahore'`. Example: "9:00 PM your time, 9:00 AM in Lahore".
  - `ct-slot--in` is added only when `animate` is true and not reduced motion (after picking a date or changing the zone; not on entering step 2).
  - Roving tab stop: the checked slot, else the first slot, gets `tabindex=0`.
- States: hover `border-color:var(--brand); transform:translateY(-1px)`; checked (`aria-checked="true"`) `--grad` background, white text, no border, `--glow`, and the small tag turns `rgba(255,255,255,.8)`; invalid (Continue with no slot) every slot border turns `--ct-err`.
```css
.ct-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ct-slot{position:relative;height:46px;border-radius:13px;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);font-weight:600;font-size:.86rem;font-variant-numeric:tabular-nums;
  display:flex;align-items:center;justify-content:center;gap:6px;transition:border-color var(--dur-1),background var(--dur-2),color var(--dur-1),box-shadow var(--dur-2),transform var(--dur-1) var(--ease-out)}
.ct-slot small{font-family:var(--font-mono);font-size:.58rem;font-weight:500;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}
.ct-slot:hover{border-color:var(--brand);transform:translateY(-1px)}
.ct-slot[aria-checked="true"]{background:var(--grad);color:#fff;border-color:transparent;box-shadow:var(--glow)}
.ct-slot[aria-checked="true"] small{color:rgba(255,255,255,.8)}
.ct-slots.is-invalid .ct-slot{border-color:var(--ct-err)}
.ct-slots__empty{grid-column:1 / -1;display:grid;place-items:center;gap:6px;min-height:150px;padding:16px;border:1px dashed var(--line-strong);border-radius:16px;text-align:center;font-size:.84rem;color:var(--muted);line-height:1.5}
.ct-slots__empty .i{width:22px;height:22px;color:var(--brand-ink);opacity:.7}
.ct-slot--in{animation:ct-slot-in .5s var(--ease-out) both}
@keyframes ct-slot-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
```
Slot entrance: `ct-slot-in` 0.5s `var(--ease-out)`, fill `both`, delays 0, 35, 70 ... 280ms (inline `animation-delay`). The inline delay is written even when the class is absent (harmless).

##### Pane 3: Meeting Preferences (L4415-4438, CSS L1389-1425)
- `div.ct-pane[data-pane="3"][hidden]` > `h3.ct-pane__t` "Meeting Preferences"
- `fieldset.ct-bf.ct-bf--set[aria-describedby="ct-bk-plat-err"]` > `legend.ct-bf__l` "Choose Platform " + `span.ct-req` "*"; `div.ct-plats` > 2 x `label.ct-plat` > `input[type=radio][name="ct-bk-plat"][value]` + `span.ct-plat__box` > `span.ct-plat__ic` (svg) + `span` > `strong` + `small`; + `span.ct-plat__dot[aria-hidden="true"]`; then `p.ct-err#ct-bk-plat-err`

| value | icon | strong | small |
|---|---|---|---|
| `Google Meet` | `i-video` | "Google Meet" | "No downloads needed" |
| `Zoom` | `i-globe` | "Zoom" | "Professional conferencing" |

- Notes `div.ct-bf`: `label.ct-bf__l[for="ct-bk-notes"]` "Notes " + `span.ct-opt-tag` "(Optional)"; `textarea.ct-bf__in.ct-bf__ta#ct-bk-notes[rows=3][maxlength=800][placeholder="A line or two about your project"][aria-describedby="ct-bk-notes-hint"]`; `p.ct-bf__hint#ct-bk-notes-hint` > `span` "Helps me prepare for our session"
- `div.ct-order[aria-label="Order summary"]` > `span.label` "Order summary" + `dl.ct-recap-dl[data-recap]` (full rows, filled by `renderRecap`; only shown at 860px and below)
- `div.ct-pane__nav` > Back (`data-bk-prev`) + `button.btn.btn--primary.ct-bk__complete#ct-bk-complete[type=button]` > `span.ct-bk__cl` "Complete Booking" + `span.ct-spin[aria-hidden="true"]` + svg `i-check` (`aria-hidden="true"`)
```css
.ct-plats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ct-plat{display:block;cursor:pointer;position:relative;min-width:0}
.ct-plat__box{display:flex;align-items:center;gap:12px;min-height:70px;padding:14px;border-radius:17px;border:1px solid var(--line-strong);background:var(--surface);
  transition:border-color var(--dur-1),box-shadow var(--dur-2),background var(--dur-2),transform var(--dur-2) var(--ease-out)}
.ct-plat__box > span:nth-child(2){min-width:0}
.ct-plat:hover .ct-plat__box{border-color:var(--brand);transform:translateY(-2px)}
.ct-plat__ic{width:42px;height:42px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--brand-soft);color:var(--brand-ink);transition:background var(--dur-2),color var(--dur-2)}
.ct-plat strong{display:block;color:var(--ink);font-size:.93rem;letter-spacing:-.01em}
.ct-plat small{display:block;color:var(--muted);font-size:.77rem;line-height:1.35}
.ct-plat__dot{margin-left:auto;width:20px;height:20px;flex:none;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;transition:background var(--dur-2),border-color var(--dur-1)}
.ct-plat__dot::after{content:"";width:7px;height:7px;border-radius:50%;background:#fff;transform:scale(0);transition:transform var(--dur-2) var(--ease-out)}
.ct-plat input:checked + .ct-plat__box{border-color:var(--brand);background:var(--brand-soft);box-shadow:inset 0 0 0 1px var(--brand)}
[data-theme="dark"] .ct-plat input:checked + .ct-plat__box{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.ct-plat input:checked + .ct-plat__box .ct-plat__ic{background:var(--grad);color:#fff}
.ct-plat input:checked + .ct-plat__box .ct-plat__dot{background:var(--grad);border-color:transparent}
.ct-plat input:checked + .ct-plat__box .ct-plat__dot::after{transform:scale(1)}
.ct-plat input:focus-visible + .ct-plat__box{outline:2px solid var(--accent);outline-offset:3px}
.ct-bf--set.is-invalid .ct-plat__box{border-color:var(--ct-err)}
.ct-order{display:none;margin:4px 0 18px;padding:16px 18px;border-radius:18px;background:var(--surface);border:1px solid var(--line)}
.ct-bk__complete .ct-spin{display:none}
.ct-bk__complete > .i{display:none}
.ct-bk__complete.is-loading{pointer-events:none}
.ct-bk__complete.is-loading .ct-bk__cl{opacity:.0;width:0;overflow:hidden}
.ct-bk__complete.is-loading .ct-spin{display:block}
```
Complete button states: idle shows only "Complete Booking" (the `i-check` svg is always `display:none`). Loading (`.is-loading` and `aria-busy="true"`): the label collapses to width 0, the white spinner shows (`.ct-spin`: 20px ring `border:2px solid rgba(255,255,255,.35);border-top-color:#fff`, `ct-spin .8s linear infinite`, rotate to 360deg) and clicks are blocked. The button width therefore shrinks to the spinner plus padding while loading.
Responsive: 440px and below `.ct-plats{grid-template-columns:1fr}`.

##### Recap aside (L4442-4448, CSS L1409-1420)
- `aside.ct-recap[aria-label="Your session"]`
  - `div.ct-recap__head` > `span.ct-recap__ic#ct-recap-ic` (svg `<use href="#i-zap">`, JS swaps the href to `#i-layers` for deep) + `div` > `strong#ct-recap-name` "Quick Chat" + `span.mono#ct-recap-dur` "30 minutes"
  - `dl.ct-recap-dl[data-recap="short"]` (rows without "Session", filled by JS)
```css
.ct-recap{position:sticky;top:12px;padding:20px;border-radius:24px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-md);min-width:0}
.ct-recap__head{display:flex;gap:12px;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line)}
.ct-recap__head > div{display:grid;min-width:0}
.ct-recap__head strong{color:var(--ink);font-size:.98rem;letter-spacing:-.01em;line-height:1.3}
.ct-recap__head .mono{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.ct-recap__ic{width:42px;height:42px;flex:none;border-radius:13px;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:var(--glow)}
.ct-recap-dl{margin:4px 0 0;display:grid}
.ct-recap-dl div.is-empty dd{color:var(--muted);font-weight:400}
.ct-recap-dl div.ct-recap-total{border-bottom:0;padding-top:16px;align-items:center}
.ct-recap-dl div.ct-recap-total dt{color:var(--ink);font-weight:650}
.ct-recap-dl div.ct-recap-total dd{font-size:1.7rem;font-weight:800;letter-spacing:-.04em;line-height:1}
.ct-recap-dl dd small{display:block;font-size:.72rem;font-weight:500;color:var(--muted);margin-top:2px}
```
Row styling (`.ct-recap-dl div`, `dt`, `dd`) is shared with `.ct-bk__dl` (L1279-1281, above). The recap is `position:sticky; top:12px` inside the scrolling panel.

Recap rows written by `renderRecap` (L6097-6109), each `<div[ class="is-empty"]><dt>…</dt><dd>…</dd></div>`, then `<div class="ct-recap-total"><dt>Total</dt><dd>$N</dd></div>`:

| dt | dd when set | dd when not set (`is-empty`) | in `short` (aside) |
|---|---|---|---|
| "Session" | `T.name + ' (' + T.mins + ' min)'`, for example "Quick Chat (30 min)" | always set | no |
| "Sessions" | `S.n + ' × $' + T.price`, for example "2 × $15" (`×` is U+00D7) | always set | yes |
| "Date" | `fmtLongDate(S.date)`, for example "Tue, Oct 6, 2026" | "Not picked yet" | yes |
| "Time" | `fmtTime(slot, tz)` + `<small>` + `fmtTime(slot, 'Asia/Karachi')` + " in Lahore" + `</small>`, for example "9:00 PM" / "9:00 AM in Lahore" | "Not picked yet" | yes |
| "Platform" | "Google Meet" or "Zoom" | "Not picked yet" | yes |
| "Total" | `'$' + T.price * S.n` (not tweened) | always set | yes |

#### 11.7.6 Screen C: done (HTML L4452-4462, CSS L1427-1433 and L1156-1162)

##### Tree and copy
- `section.ct-bk__screen.ct-bk__done[data-screen="done"][hidden]` (gets `.is-drawn` from JS)
  - `svg.ct-check.ct-check--lg[viewBox="0 0 88 88"][aria-hidden="true"]` > `circle.ct-check__ring[cx=44][cy=44][r=38]` + `circle.ct-check__c[cx=44][cy=44][r=38]` + `path.ct-check__p[d="M29 45.5l10 10 20-22"]`
  - `h2.ct-bk__title.ct-bk__title--sm#ct-bk-t3[tabindex="-1"]` HTML default "Request ready!"; JS sets "Booking sent!" (hook path) or "Request ready!" (mail path)
  - `p.ct-bk__lead.ct-bk__done-p#ct-bk-done-msg` (JS text)
    - hook path: "Your booking went through. The confirmation and meeting link are on their way to " + email + "."
    - mail path: "A prefilled email just opened in your mail app with every detail. Send it and I will confirm the slot and share the meeting link at " + email + "."
  - `div.ct-bk__ticket#ct-bk-ticket` (JS markup below)
  - `div.ct-bk__done-actions`
    - `button.btn.btn--primary#ct-bk-again[type=button]` > svg `i-calendar` + "Book Another Meeting"
    - `a.btn.btn--ghost[href="mailto:mehrfaisal111@gmail.com?subject=Booking%20support"]` > svg `i-mail` + "Contact Support"

Ticket markup (L6135-6139), all values escaped:
```html
<dl class="ct-recap-dl">
  <div><dt>Session</dt><dd>{sessionName} × {sessions}</dd></div>
  <div><dt>When</dt><dd>{fmtLongDate(date)}<small>{timeLocal} your time · {timeLahore} in Lahore</small></dd></div>
  <div><dt>Platform</dt><dd>{platform}</dd></div>
  <div><dt>Total</dt><dd>${total}</dd></div>
</dl>
```
Example: "Quick Chat × 2", "Tue, Oct 6, 2026" / "9:00 PM your time · 9:00 AM in Lahore", "Google Meet", "$30". The Total row here is a plain row (no `ct-recap-total` class), so it is not the large figure.

##### CSS
```css
.ct-bk__done{display:grid;justify-items:center;text-align:center;gap:12px;padding:clamp(24px,5vw,56px) 0 clamp(8px,2vw,20px)}
.ct-check--lg{width:104px;height:104px;margin-bottom:6px}
.ct-bk__done-p{max-width:48ch;color:var(--ink-2)}
.ct-bk__ticket{width:min(480px,100%);margin:12px 0 6px;padding:6px 20px;border-radius:22px;background:var(--surface);border:1px dashed var(--line-strong);text-align:left}
.ct-bk__ticket .ct-recap-dl div:last-child{border-bottom:0}
.ct-bk__done-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:8px}
/* shared, L1156-1162 */
.ct-check{width:88px;height:88px;margin-bottom:6px}
.ct-check__ring{fill:var(--accent-soft)}
.ct-check__c{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-dasharray:239;stroke-dashoffset:239;transform:rotate(-90deg);transform-origin:44px 44px}
.ct-check__p{fill:none;stroke:var(--brand-ink);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:48;stroke-dashoffset:48}
.is-drawn .ct-check__c{animation:ct-draw .9s var(--ease-out) .1s forwards}
.is-drawn .ct-check__p{animation:ct-draw .55s var(--ease-out) .6s forwards}
@keyframes ct-draw{to{stroke-dashoffset:0}}
```
Draw in: the soft filled disc is always there; the ring stroke draws from 12 o'clock clockwise (`ct-draw` .9s `var(--ease-out)`, delay .1s), then the tick draws (.55s, delay .6s), both `forwards`. Trigger: `finish()` removes `.is-drawn`, starts the screen swap, and adds `.is-drawn` on the next animation frame (L6140-6142). Because the section is still `hidden` (display none) for the 190ms fade out of the old screen, the CSS animations actually start when the section becomes visible. With reduced motion the global rule makes them finish at once (the check shows fully drawn).
Responsive: 640px and below `.ct-bk__done-actions .btn{width:100%}` (the two buttons stack full width).

#### 11.7.7 Booking responsive summary (CSS L1435-1460)
```css
@media (max-width:860px){
  .ct-bk__pick{grid-template-columns:1fr}
  .ct-bk__elist{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ct-bk__flow{grid-template-columns:1fr}
  .ct-recap{display:none}
  .ct-order{display:block}
}
@media (max-width:640px){
  .ct-bk__stage{padding:20px 18px 24px}
  .ct-bk__head{padding-right:40px}
  .ct-bk__types{grid-template-columns:1fr}
  .ct-bk__count{flex-wrap:wrap;padding:14px}
  .ct-stepper{margin-left:auto}
  .ct-sched{grid-template-columns:1fr}
  .ct-bf__two{grid-template-columns:1fr}
  .ct-cal__dow,.ct-cal__grid{gap:2px}
  .ct-cal__d,.ct-cal__pad{height:44px}
  .ct-bk__change{height:44px}
  .ct-pane__nav .btn{flex:1}
  .ct-bk__done-actions .btn{width:100%}
}
@media (max-width:440px){
  .ct-plats{grid-template-columns:1fr}
  .ct-bk__elist{grid-template-columns:1fr;gap:16px}
  .ct-bk__elist li{grid-template-columns:40px minmax(0,1fr);gap:14px}
}
```
Plus the shell at 640px and below (bottom sheet, 11.7.2). There is no booking specific reduced motion CSS; reduced motion comes from the global block (L357-362) and from the JS `reduce` flag (no swaps, no tween, no bump, no slot entrance).

#### 11.7.8 Booking JS behaviours (L5202-5225 and L5788-6173)

##### State (L5798-5809, L5850)
```ts
type SessionType = 'quick' | 'deep';
interface BookingState {
  type: SessionType;      // default 'quick'
  n: number;              // sessions, 1 to 10, default 1
  email: string;          // set only when verified
  verified: boolean;
  name: string;           // saved when step 1 passes
  phone: string;
  company: string;
  date: string | null;    // 'YYYY-MM-DD', the Lahore calendar date picked
  slot: number | null;    // UTC epoch ms of the slot start
  plat: '' | 'Google Meet' | 'Zoom';
  notes: string;          // updated on every input
}
// module variables: cur: 'pick' | 'steps' | 'done' = 'pick'; step: 1 | 2 | 3 = 1; busy = false;
// totalShown = 15 (number currently painted in #ct-bk-s-total); raf = 0; view = { y, m } (calendar month)
```

##### B1. swapViews and morphHeight (L5202-5225)
- Name and lines: `morphHeight(el, change, dur)` L5203-5213, `swapViews(container, from, to, dir, axis)` L5215-5225. Shared by the booking screens (axis `'y'`) and the step panes (axis `'x'`). Contact form uses them too (11.6).
- Starts when: `showScreen(name, true, dir)` (screens) or `goStep(n)` (panes).
- Reads or measures: `container.getBoundingClientRect().height` before and after the DOM change.
- Writes:
  1. If `from === to`: nothing. If reduced motion, or no `Element.animate`, or no `from`: `from.hidden = true; to.hidden = false` at once.
  2. Out phase: `from.animate([{opacity:1, transform:'none'}, {opacity:0, transform:off(-dir)}], {duration:190, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards'})`.
  3. When it finishes: `morphHeight(container, change, 560)` where `change` sets `from.hidden = true`, cancels the out animation, sets `to.hidden = false`. `morphHeight` measures `h0`, runs `change`, measures `h1`; if `|h1 - h0| < 2` it stops; else it sets `container.style.overflow = 'hidden'` and animates `height: h0px` to `h1px` over 560ms with `EASE` (`cubic-bezier(.22,1,.36,1)`), then restores the previous inline `overflow`.
  4. At the same time the in phase: `to.animate([{opacity:0, transform:off(dir)}, {opacity:1, transform:'none'}], {duration:560, easing:EASE})` (no fill).
  5. Resolves when both the height morph and the in animation finish. If the out animation is cancelled it just toggles `hidden`.
- Offsets: `off(d)` is `translate3d(0, d*14 px, 0)` on axis `'y'` and `translate3d(d*22 px, 0, 0)` on axis `'x'`. `dir` is `1` (forward: the old view leaves upward or leftward, the new one comes from below or from the right) or `-1` (back).
- Timings: 190ms out (ease in `cubic-bezier(.4,0,1,1)`), then 560ms in plus height morph (`cubic-bezier(.22,1,.36,1)`). Total about 750ms.
- Pauses or skips when: reduced motion (instant swap). No other guard.
- Cleanup in React: cancel running `Animation` objects on unmount; restore `overflow`.
- Port as: `useSwapViews()` hook in `src/hooks/useSwapViews.ts` returning `swap(container, from, to, dir, axis): Promise<void>`, or a `<SwapViews activeKey axis dir>` component that keeps both children mounted during the swap and uses the Web Animations API with the same keyframes. Do not use CSS transitions here; the timings must match.

##### B2. showScreen (L5870-5877)
- Starts when: Book Session (`#ct-bk-go`) click to `steps` (dir 1), Change session (`#ct-bk-change`) to `pick` (dir -1), `finish()` to `done` (dir 1), Book Another Meeting (`#ct-bk-again`) to `pick` (dir -1), `openBooking()` to `pick` without animation.
- Reads: `panel.scrollTop`.
- Writes: `panel.aria-labelledby` = `ct-bk-t1` / `ct-bk-t2` / `ct-bk-t3`; `cur = name`. Without animation, or when the screen does not change: toggles `hidden` on all three screens directly. With animation: if the panel is scrolled, `panel.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'})` first, then `swapViews(stage, oldScreen, newScreen, dir, 'y')`.
- Returns a promise; the callers move focus after it resolves (see the focus table).
- Port as: `screen` state in `BookingModal` plus `useSwapViews`.

##### B3. reset(type, keepContact) (L5848-5869)
- Starts when: module start (`reset('quick')`, L6164), every `openBooking(type)` (`keepContact` false), Book Another Meeting (`reset(S.type, true)`: keeps email, verified, name, phone, company and the session type).
- Writes: new state (see above); checks the matching session radio; unchecks both platform radios; fills the four contact inputs from state; clears notes; toggles `.is-verified` on the email field and the Verify label; empties every `.ct-err`; removes every `aria-invalid` attribute and every `.is-invalid` class in the modal; sets the zone select to the visitor zone if listed, else `Asia/Karachi`; sets the calendar view to this month, or next month if this month has no bookable day left; renders the calendar and the empty slots; sets `totalShown` and cancels any total tween; `updateSummary(false)`; `step = 1` and `setStepUI()`; shows pane 1 and hides panes 2 and 3 (no animation); removes `.is-loading` from Complete and clears `busy`.
- Note: the sessions count `n` always resets to 1, even on Book Another Meeting.
- Port as: `resetBooking(type, keepContact)` reducer action.

##### B4. updateSummary and tweenTotal (L5880-5904)
- Starts when: session type change, stepper click (animated), `reset` (not animated).
- Writes: `#ct-bk-s-type` name, `#ct-bk-s-price` `'$' + price`, `#ct-bk-s-n` n, `#ct-bk-n` n, `disabled` on minus (n <= 1) and plus (n >= 10), the total, `#ct-recap-name`, `#ct-recap-dur`, `#ct-recap-ic use[href]` = `'#' + icon`, then `renderRecap()`.
- Total tween: `from = totalShown`, `d = 650` ms, per frame `p = clamp((t - t0) / 650, 0, 1)`, `e = 1 - Math.pow(1 - p, 3)` (cubic ease out), `totalShown = from + (to - from) * e`, text `'$' + Math.round(totalShown)`. A new tween cancels the old one and starts from the number currently shown. Reduced motion: writes the final value at once.
- Pauses or skips when: reduced motion. It keeps running if the modal closes mid tween (harmless).
- Cleanup in React: `cancelAnimationFrame` on unmount and before each new tween.
- Port as: `useTweenedNumber(target, 650)` hook in `src/hooks/useTweenedNumber.ts` (the same hook can serve the contact counters if their curve matches; check 11.2).

##### B5. Session type radios and the stepper (L5905-5916)
- Session radio `change`: `S.type = value; updateSummary(true)`; announce `TYPE_NAME + ' selected. Total $' + price * n` (for example "Technical Deep Dive selected. Total $25").
- Stepper click: `n = clamp(S.n + (+data-bk-step), 1, 10)`; if unchanged, stop. Else `S.n = n; updateSummary(true)`; bump animation on `#ct-bk-n` (380ms, `EASE`, from `translateY(6px)` when adding or `translateY(-6px)` when removing, opacity .3 to 1; skipped with reduced motion); announce `n + ' session'` or `' sessions'` + `'. Total $' + price * n` (for example "3 sessions. Total $45", "1 session. Total $15"). If the clicked button just became disabled (reached 1 or 10), focus moves to the other stepper button so focus is not lost.
- Port as: part of `BookingPickScreen`.

##### B6. Screen navigation buttons (L5917-5922, L6157-6160)
- `#ct-bk-go` (Book Session): `showScreen('steps', true, 1)`, then focus `#ct-bk-email`. There is no validation on screen A.
- `#ct-bk-change` (Change session): `showScreen('pick', true, -1)`, then focus the checked session radio. The step, the entered data and the picked date stay as they are.
- `#ct-bk-again` (Book Another Meeting): `reset(S.type, true)`, `showScreen('pick', true, -1)`, then focus the checked session radio.

##### B7. setStepUI and goStep (L5925-5946)
- `setStepUI()`: see the steps header states in 11.7.5.
- `goStep(n)` starts from Continue (`[data-bk-next]`, only after `validStep(step)` passes) and Back (`[data-bk-prev]`, no validation).
  1. Stop if `busy` or `n === step`.
  2. `dir = n > step ? 1 : -1`; `step = n`; `setStepUI()` (the fill and circles move at once, before the pane swap); `renderRecap()`; if `n === 2`, `renderSlots(false)` (no entrance animation).
  3. `busy = true`; `swapViews(panes, oldPane, newPane, dir, 'x')`; when done `busy = false` and focus: step 1 `#ct-bk-email`; step 2 the calendar day with `tabindex="0"` or else the zone select; step 3 the checked platform radio or else the first platform radio (all with `preventScroll`).
  4. Announce `'Step ' + n + ' of 3'` right away.
- The panel does not scroll to top on step changes (only on screen changes).

##### B8. Email verify and step validation (L5947-5998)
- `fieldErr(input, errId, msg)`: writes the message into `#errId` and sets `aria-invalid` to `'true'` or `'false'` (it never removes the attribute); returns `!msg`.
- `verifyEmail(silent)`: trims; empty: `verified = false`, remove `.is-verified`, label "Verify", error "Please enter your email so I can send the meeting link."; fails `EMAIL_RE`: same with "That email looks off. Try something like name@company.com."; else `S.email = value`, `verified = true`, add `.is-verified`, label "Verified", clear the error, and announce "Email verified" unless `silent`.
- Triggers: Verify button click (`verifyEmail(false)`); Enter in the email input (`preventDefault`, `verifyEmail(false)`); Continue on step 1 (`verifyEmail(true)`, silent).
- Email `input`: if it was verified, un-verify (label back to "Verify"); if it is marked invalid and now matches `EMAIL_RE`, clear the error.
- Name `input`: if marked invalid and the trimmed value has at least 2 characters, clear the error.
- `validStep(1)`: email check (silent) and name check ("Please add your full name." when empty, "That name looks a little short." when under 2 characters); focus the email if it failed, else the name if it failed; on success save `name`, `phone`, `company` (trimmed) into state. Phone and company are not validated at all.
- `validStep(2)`: no date: add `.is-invalid` to `#ct-cal`, error "Pick a weekday for the meeting.", focus the day with `tabindex="0"`; no slot: add `.is-invalid` to `#ct-slots`, error "Choose one of the time slots.", focus the first slot.
- `validStep(3)`: no platform: add `.is-invalid` to `.ct-bf--set`, error "Choose Google Meet or Zoom.", focus the first platform radio.
- Clearing: picking a date clears the date error and `.is-invalid`; picking a slot clears the slot error; changing platform clears the platform error.
- Port as: `validateBookingStep(step, state)` pure function plus field level error state; errors render into the same `p.ct-err` elements.

##### B9. Calendar (L6006-6057)
- Starts when: `reset`, month nav buttons (`[data-cal]` click: `moveMonth(+data-cal)`), a date click, and keyboard in the grid.
- Reads: local `new Date()` (visitor clock); `today0()` = local midnight today; `maxDate()` = today0 + 60 days.
- `avail(d)`: `d > today0() && d <= maxDate() && day !== 0 && day !== 6`.
- `firstAvailIn(y, m)`: first available day in that month or `null`.
- Click on an enabled day: `pickDate(k)`: `S.date = k`; if a slot is chosen and its Lahore day (`fmtDayTz(slot, 'Asia/Karachi')`) is not `k`, clear the slot; set `aria-pressed` and roving `tabIndex` on the day buttons (no full re-render); clear the date error; `renderSlots(true)`; `renderRecap()`; announce `fmtLongDate(k) + ' selected. ' + slotCount + ' time slots available.'` (always 9, for example "Tue, Oct 6, 2026 selected. 9 time slots available.").
- Keyboard on a day button (L6040-6057):
  - ArrowLeft -1 day, ArrowRight +1, ArrowUp -7, ArrowDown +7: walk in that step (up to 70 tries), stop when past `maxDate` or before today, land on the first available day.
  - PageDown / PageUp: first available day of the next / previous month (from the view month).
  - Home / End: first / last available day of the view month.
  - Any other key: ignored (default kept). Enter and Space act as a normal button click (selects).
  - When a target exists: `preventDefault`; if it is in another month, the view moves there and the grid re-renders with that day as the tab stop; else only the roving `tabIndex` moves; then focus the target. Arrow keys move focus only; they do not select.
- Month label: `Intl.DateTimeFormat('en-US', {month:'long', year:'numeric'})`, for example "October 2026", in an `aria-live="polite"` span.
- Port as: `BookingCalendar` component with `useCalendarMonth()`; keep the roving tabindex pattern.

##### B10. Time zones (L5811-5845)
- `LOCAL_TZ` = `Intl.DateTimeFormat().resolvedOptions().timeZone`, fallback `'Asia/Karachi'`.
- `ZONES` (23, in source order) and `NAMES` are in the content data below (11.7.10).
- `tzOffset(tz, at)`: formats `at` (default now) in `tz` with `en-US`, `hourCycle:'h23'`, reads the parts, rebuilds a UTC time and subtracts the real time (seconds and ms dropped); returns minutes, or `null` on error.
- `gmtLabel(min)`: `'GMT' + sign + hours + (minutes ? ':' + two digits : '')`, sign `-` for negative else `+` (so `GMT+0` for UTC).
- `buildZones()` (once at start): list = `ZONES` plus `LOCAL_TZ` at the front if missing; drop zones whose offset fails; sort by offset then IANA id; option text `gmtLabel(off) + ' · ' + name + (z === LOCAL_TZ ? ' (your zone)' : '')`; name = `NAMES[z]` or the last path part with `_` turned to spaces. Selects `LOCAL_TZ` if present else `'Asia/Karachi'`.
- `tzName(tz)`: the option text without " (your zone)".
- Zone `change`: `renderSlots(true)`, `renderRecap()`, announce `'Times now shown in ' + tzName(value)` (for example "Times now shown in GMT-4 · New York (Eastern)").
- Formatters: `fmtTime` en-US `{timeZone, hour:'numeric', minute:'2-digit'}`; `fmtDayTz` en-CA `{timeZone, year:'numeric', month:'2-digit', day:'2-digit'}` (gives `YYYY-MM-DD`); `fmtLongDate(s)` en-US `{weekday:'short', day:'numeric', month:'short', year:'numeric'}` on the local date (for example "Tue, Oct 6, 2026"); `fmtShortTz` en-US `{timeZone, weekday:'short', day:'numeric', month:'short'}` (for example "Wed, Oct 7").
- Port as: `src/lib/booking-time.ts` (pure functions) plus zone list in content.

##### B11. Slots (L6059-6094)
- `slotsFor(k)`: for `h` from 9 to 17: `Date.UTC(y, m - 1, d, h - 5, 0)`. That is 9:00 to 17:00 Pakistan time (UTC+5, no DST), 9 slots, each one hour long in meaning, though the duration is not used; a 60 minute Deep Dive can start at 17:00 and end at 18:00.
- Render: see 11.7.5. The day shift for the tag: `Math.round((parseYmd(fmtDayTz(ms, tz)) - parseYmd(S.date)) / 864e5)`.
- Click on a slot: `pickSlot(b)`: `S.slot = +data-ms`; set `aria-checked` and roving `tabIndex`; clear the slot error; `renderRecap()`. No announcement (the radio semantics speak).
- Keyboard: ArrowRight or ArrowDown picks and focuses the next slot, ArrowLeft or ArrowUp the previous one (both wrap around); Space or Enter picks the focused slot (`preventDefault`).
- Port as: `BookingSlots` component (`role="radiogroup"` with `role="radio"` buttons).

##### B12. renderRecap (L6097-6109)
- Starts when: `updateSummary`, `goStep`, `pickDate`, `pickSlot`, zone change, platform change.
- Writes: the inner HTML of every `[data-recap]` in the modal: the aside (`data-recap="short"`, rows 2 to 5 plus Total) and the order summary in pane 3 (all rows plus Total). See the rows table in 11.7.5.
- Port as: `<BookingRecap variant="short" | "full">` computed from state.

##### B13. Complete (L6111-6156)
- Starts when: `#ct-bk-complete` click. Stops if `busy` or `validStep(3)` fails.
- `bookingData()` builds the payload (section 10). Field notes: `date` is `S.date` (`YYYY-MM-DD`, the Lahore date), `timezone` is the IANA id from the select, `startUtc` is `new Date(S.slot).toISOString()` (for example "2026-10-06T04:00:00.000Z"), `timeLocal` and `timeLahore` are `fmtTime` strings like "9:00 PM", `notes` is the trimmed textarea value, `phone` and `company` are the values saved at step 1.
- Writes: `busy = true`, `.is-loading` and `aria-busy="true"` on the button.
- No hook (`typeof FH_HOOKS.onBooking !== 'function'`): `openMail('Meeting request: ' + sessionName + ' on ' + fmtLongDate(date), mailBody(d))` (hidden `<a href="mailto:...">` clicked, removed next tick), then wait 700ms (0 with reduced motion).
- With hook: `Promise.all([hook(d), wait(400)])` (so at least 400ms of spinner).
- Success: clear busy and loading, `finish(viaMail, d)`: sets the done title, message and ticket (11.7.6), removes `.is-drawn`, `showScreen('done', true, 1)` then focus `#ct-bk-t3`, adds `.is-drawn` next frame, toast "Opening your email app with the booking details" (mail) or "Booking sent. Check your inbox soon." (hook).
- Failure (hook rejects or throws): clear busy and loading, toast "Booking did not go through. Please try again.", announce "Booking failed. Please try again.". The user stays on step 3.
- `mailBody(d)` exact text (L6120-6128), with `\n` line breaks:
```
Hi Faisal,

I would like to book a meeting.

Session: {sessionName} ({durationMinutes} minutes)
Number of sessions: {sessions}
Total: ${total}

Date: {fmtLongDate(date)}
Time: {timeLocal} ({tzName(timezone)})
Time in Lahore: {timeLahore} PKT
Platform: {platform}

Name: {name}
Email: {email}
Phone: {phone}            <- only if phone
Company: {company}        <- only if company

Notes:                    <- this block only if notes
{notes}

Sent from faisalhanif.work
```
- Port as: `useBookingSubmit()` calling `api.createBooking(payload)` (the rebuild has a backend, so the hook path is the normal path; keep the mail path as the fallback only if API_CONTRACT.md says so).

##### B14. FH.openBooking(type) (L6162-6172)
- Module start: `buildZones()`, `reset('quick')`, `showScreen('pick', false)`.
- `openBooking(type)`: `reset(type === 'deep' ? 'deep' : 'quick', false)` (everything is cleared on every open, contact details too), `cur = 'pick'`, `showScreen('pick', false)` (no animation), `panel.scrollTop = 0`, `FH.openModal('booking')`, then after 90ms (70ms with reduced motion) focus the checked session radio with `preventScroll`.
- Port as: `openBooking` from `BookingProvider` (context), which resets the reducer, then opens the modal.

##### Announcements (`#ct-bk-live`, L5809)
`announce(m)`: set the text to `''`, then after 30ms set it to `m` (so a repeat message is read again). The live region is `p.sr-only[role="status"][aria-live="polite"]`.

| When | Text |
|---|---|
| Session type changes | `{name} selected. Total ${price*n}` |
| Stepper changes | `{n} session. Total ${total}` or `{n} sessions. Total ${total}` |
| Step changes | `Step {n} of 3` |
| Verify button or Enter succeeds | `Email verified` |
| Date picked | `{fmtLongDate} selected. {count} time slots available.` |
| Zone changed | `Times now shown in {option text without " (your zone)"}` |
| Complete fails | `Booking failed. Please try again.` |

Other live regions: `#ct-bk-n` (`output`, `aria-live="polite"`), `#ct-cal-month` (`aria-live="polite"`), `#ct-bk-email-err` (`aria-live="polite"`), and the page toast `#toast`.

##### Focus handling

| Moment | Focus goes to |
|---|---|
| Modal opens | close button at 60ms (core), then the checked session radio at 90ms (70ms reduced) |
| Book Session | `#ct-bk-email` after the swap |
| Change session / Book Another Meeting | the checked session radio after the swap |
| Step 1 | `#ct-bk-email` |
| Step 2 | calendar day with `tabindex="0"`, else `#ct-bk-tz` |
| Step 3 | checked platform radio, else the first one |
| Step 1 invalid | email if it failed, else name |
| Step 2 invalid | the tab stop day (no date) or the first slot (no slot) |
| Step 3 invalid | first platform radio |
| Stepper hits 1 or 10 | the other stepper button |
| Done | `#ct-bk-t3` (`tabindex="-1"`, `outline:none`) |
| Modal closes | the element that had focus before it opened |

#### 11.7.9 Section 10 check: booking modal

Verified against L4240-4465 and L5791-6173. Everything in section 10 "Booking modal" matches, with these corrections and additions:
- The "continue" button on the pick screen is `#ct-bk-go` and its label is "Book Session" (plus `i-arrow-right`). "Continue" is the label of the step buttons `[data-bk-next]`.
- Sessions also carry `mins` (30 and 60), used in the recap row "Quick Chat (30 min)" and in `durationMinutes`.
- The booking inputs have no `maxlength` except notes (800). Name has no upper limit; phone and company are not validated at all (unlike the contact form).
- Step 1 validation also clears errors live: the email error clears as soon as the value matches `EMAIL_RE`; the name error clears at 2 characters.
- The date is always a Lahore date: `slotsFor` builds the 9 slots as 9:00 to 17:00 at UTC+5 on `S.date`. "Mon to Fri" and "after today" and "60 days" are checked on the visitor's local calendar (`today0()` is local midnight).
- `date` in the payload is `YYYY-MM-DD`; `timeLocal` and `timeLahore` are en-US strings like "9:00 PM"; `startUtc` is an ISO string.
- The done title depends on the path: "Booking sent!" with a hook, "Request ready!" without one (the HTML default is "Request ready!"). The mail path message is "A prefilled email just opened in your mail app with every detail. Send it and I will confirm the slot and share the meeting link at <email>." and its toast is "Opening your email app with the booking details".
- The mailto subject date is `fmtLongDate(date)`, for example "Meeting request: Quick Chat on Tue, Oct 6, 2026".
- Failure also announces "Booking failed. Please try again." in `#ct-bk-live`.
- With a hook the spinner shows for at least 400ms; with mailto the done screen follows after 700ms (0 with reduced motion).
- The hook call is `hook(d)`; any return value is accepted and a rejected promise or a throw counts as failure. The response body is not read.
- Section 4 says the modal is L4240-4467; the `div#booking` closes at L4465 (L4467 is the chat comment).

#### 11.7.10 Booking content data (`frontend/src/content/booking.ts`)

```ts
export type SessionTypeId = 'quick' | 'deep';

export interface BookingSessionType {
  id: SessionTypeId;
  name: string;
  dur: string;          // text in the card pill and recap head
  mins: number;         // durationMinutes
  price: number;        // USD per session
  icon: 'i-zap' | 'i-layers';
  desc: string;         // card description
  features: string[];   // card check list
}

export const BOOKING_SESSIONS: BookingSessionType[] = [
  {
    id: 'quick',
    name: 'Quick Chat',
    dur: '30 minutes',
    mins: 30,
    price: 15,
    icon: 'i-zap',
    desc: 'Perfect for initial discussions and project exploration',
    features: ['Project overview', 'Requirements discussion', 'Technology suggestions'],
  },
  {
    id: 'deep',
    name: 'Technical Deep Dive',
    dur: '60 minutes',
    mins: 60,
    price: 25,
    icon: 'i-layers',
    desc: 'Comprehensive discussion for complex projects',
    features: ['Detailed planning', 'Architecture review', 'Timeline & budget'],
  },
];

export const BOOKING_SESSIONS_MIN = 1;
export const BOOKING_SESSIONS_MAX = 10;
export const BOOKING_CURRENCY = 'USD';

export interface BookingExpectItem {
  icon: 'i-user' | 'i-sparkles' | 'i-clock' | 'i-shield';
  title: string;
  text: string;
}

export const BOOKING_EXPECT: BookingExpectItem[] = [
  { icon: 'i-user', title: 'Personal Consultation', text: 'One-on-one discussion tailored to your specific needs and goals' },
  { icon: 'i-sparkles', title: 'Expert Insights', text: 'Professional recommendations and innovative solutions for your project' },
  { icon: 'i-clock', title: 'Flexible Timing', text: 'Choose a time that works best for your schedule across different time zones' },
  { icon: 'i-shield', title: 'Confidential & Secure', text: 'Your information and project details are kept private and secure at all times' },
];

export interface BookingPlatform {
  value: 'Google Meet' | 'Zoom';
  icon: 'i-video' | 'i-globe';
  title: string;
  sub: string;
}

export const BOOKING_PLATFORMS: BookingPlatform[] = [
  { value: 'Google Meet', icon: 'i-video', title: 'Google Meet', sub: 'No downloads needed' },
  { value: 'Zoom', icon: 'i-globe', title: 'Zoom', sub: 'Professional conferencing' },
];

/** Lahore working slots: start hours in PKT (UTC+5), Monday to Friday. */
export const BOOKING_SLOT_HOURS_PKT = [9, 10, 11, 12, 13, 14, 15, 16, 17];
export const BOOKING_PKT_OFFSET_HOURS = 5;
export const BOOKING_MAX_DAYS_AHEAD = 60;
export const BOOKING_HOME_TZ = 'Asia/Karachi';

/** Source order (L5814-5816). The select sorts them by offset at runtime. */
export const BOOKING_ZONES: string[] = [
  'Asia/Karachi', 'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Istanbul', 'Africa/Lagos', 'Africa/Nairobi', 'Asia/Riyadh', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo',
  'America/New_York', 'America/Toronto', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
];

/** Display names (L5817-5818). Zones not listed use the last path part with "_" as spaces. */
export const BOOKING_ZONE_NAMES: Record<string, string> = {
  'Asia/Karachi': 'Pakistan (PKT)',
  UTC: 'UTC',
  'Asia/Kolkata': 'India',
  'Asia/Dubai': 'Dubai',
  'Asia/Riyadh': 'Riyadh',
  'America/New_York': 'New York (Eastern)',
  'America/Chicago': 'Chicago (Central)',
  'America/Denver': 'Denver (Mountain)',
  'America/Los_Angeles': 'Los Angeles (Pacific)',
};

export const BOOKING_COPY = {
  closeLabel: 'Close booking',
  pick: {
    eyebrow: 'Book Meeting',
    titleA: 'Schedule a ',
    titleB: 'Meeting',            // .serif.grad-text
    lead: 'Pick a session, choose how many you need, then grab a time that suits you.',
    typesLegend: 'Session type',
    perSession: ' per session',
    countLabel: 'Select Number of Session',
    countHint: 'From 1 to 10',
    stepperUnit: 'Session (s)',
    removeLabel: 'Remove a session',
    addLabel: 'Add a session',
    summaryAria: 'Booking summary',
    summary: 'Summary',
    rowType: 'Session Type',
    rowPrice: 'Price per Session',
    rowCount: 'Number of Sessions',
    total: 'Total Amount',
    go: 'Book Session',
    fine: 'Next, pick a date and time',
    expectTitle: 'What to Expect',
  },
  steps: {
    change: 'Change session',
    titleA: 'Book Your ',
    titleB: 'Session',            // .serif.grad-text
    lead: 'Complete the steps below to schedule your meeting',
    progressAria: 'Booking progress',
    labels: ['Details', 'Schedule', 'Confirm'],
    next: 'Continue',
    back: 'Back',
    p1: {
      title: 'Contact Information',
      email: 'Email Address', emailPh: 'you@company.com', verify: 'Verify', verified: 'Verified', emailHint: 'Meeting link will be sent here',
      name: 'Full Name', namePh: 'Your name',
      phone: 'Phone Number', phonePh: '+1 555 000 0000', phoneHint: 'For urgent communication',
      company: 'Company', companyPh: 'Company name', companyHint: 'Business context helps',
      optional: '(Optional)',
    },
    p2: {
      title: 'Select Date & Time',
      date: 'Preferred Date', dateTag: '(Monday to Friday)',
      prevMonth: 'Previous month', nextMonth: 'Next month',
      dow: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      tz: 'Your Timezone', yourZone: ' (your zone)',
      slots: 'Available Time Slots', slotsHint: 'Times shown in your timezone', slotsEmpty: 'Pick a date to see open times.',
      nextDay: 'next day', prevDay: 'prev day', unavailable: ', unavailable',
    },
    p3: {
      title: 'Meeting Preferences',
      platform: 'Choose Platform',
      notes: 'Notes', notesPh: 'A line or two about your project', notesHint: 'Helps me prepare for our session', notesMax: 800,
      orderAria: 'Order summary', order: 'Order summary',
      complete: 'Complete Booking',
    },
    recapAria: 'Your session',
    notPicked: 'Not picked yet',
  },
  done: {
    titleHook: 'Booking sent!',
    titleMail: 'Request ready!',
    msgHook: 'Your booking went through. The confirmation and meeting link are on their way to {email}.',
    msgMail: 'A prefilled email just opened in your mail app with every detail. Send it and I will confirm the slot and share the meeting link at {email}.',
    again: 'Book Another Meeting',
    support: 'Contact Support',
    supportHref: 'mailto:mehrfaisal111@gmail.com?subject=Booking%20support',
  },
  errors: {
    emailEmpty: 'Please enter your email so I can send the meeting link.',
    emailBad: 'That email looks off. Try something like name@company.com.',
    nameEmpty: 'Please add your full name.',
    nameShort: 'That name looks a little short.',
    date: 'Pick a weekday for the meeting.',
    slot: 'Choose one of the time slots.',
    platform: 'Choose Google Meet or Zoom.',
  },
  toasts: {
    sent: 'Booking sent. Check your inbox soon.',
    mail: 'Opening your email app with the booking details',
    failed: 'Booking did not go through. Please try again.',
  },
  announce: {
    emailVerified: 'Email verified',
    failed: 'Booking failed. Please try again.',
  },
} as const;
```

#### 11.7.11 Chat widget: markup, visuals and motion (HTML L4467-4491, CSS L1462-1552)

The widget is global: it sits outside `main`, after the booking modal, on every page. It is not a `.fh-modal` and does not set `body.modal-open`.

##### Tree
- `div.ct-chat#ct-chat` (root; JS adds `.is-open`, `.is-read`, `.is-nudge`)
  - `div.ct-chat__nudge#ct-chat-nudge[aria-hidden="true"]` > `span` "Ask me anything"
  - `button.ct-chat__fab#ct-chat-fab[type=button][aria-expanded="false"][aria-controls="ct-chat-panel"][aria-label="Open chat with Faisal's Assistant"]`
    - `svg.i.ct-chat__fi.ct-chat__fi--open[aria-hidden="true"]` (`i-bolt-chat`)
    - `svg.i.ct-chat__fi.ct-chat__fi--close[aria-hidden="true"]` (`i-close`)
    - `span.ct-chat__unread[aria-hidden="true"]`
  - `section.ct-chat__panel#ct-chat-panel[role="dialog"][aria-labelledby="ct-chat-title"][aria-hidden="true"][inert]` (JS adds `data-native-scroll=""`, L6470)
    - `header.ct-chat__head`
      - `span.ct-chat__av[aria-hidden="true"]` "FH" + `span.ct-chat__live` (green dot)
      - `div.ct-chat__who` > `strong#ct-chat-title` "Faisal's Assistant" + `span` "Online now"
      - `button.ct-chat__x#ct-chat-x[type=button][aria-label="Close chat"]` (svg `i-close`, no `aria-hidden`)
    - `div.ct-chat__log#ct-chat-log[role="log"][aria-live="polite"][aria-relevant="additions"][tabindex="0"][aria-label="Chat messages"]`
    - `form.ct-chat__form#ct-chat-form[autocomplete="off"]`
      - `label.sr-only[for="ct-chat-input"]` "Your message"
      - `input.ct-chat__in#ct-chat-input[type=text][placeholder="Type your message..."][maxlength=500][enterkeyhint="send"]`
      - `button.ct-chat__send[type=submit][aria-label="Send message"]` (svg `i-send`, no `aria-hidden`)
- The panel has no `aria-modal` and no focus trap: Tab can move from the panel back to the page.

##### FAB, unread dot and nudge CSS (L1465-1480)
```css
.ct-chat{position:fixed;right:28px;bottom:28px;z-index:70;width:60px;height:60px}
.ct-chat__fab{position:relative;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:var(--glow),var(--shadow-lg);
  transition:transform var(--dur-2) var(--ease-out),box-shadow var(--dur-2) var(--ease-out),opacity var(--dur-1)}
.ct-chat__fab::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--line-strong);pointer-events:none;transition:inset var(--dur-2) var(--ease-out),opacity var(--dur-2)}
.ct-chat__fab:hover{transform:translateY(-3px);box-shadow:0 16px 40px -12px rgba(14,102,85,.7),var(--shadow-lg)}
.ct-chat__fab:hover::before{inset:-9px;opacity:.6}
.ct-chat__fi{position:absolute;width:26px;height:26px;transition:opacity var(--dur-1) var(--ease-out),transform var(--dur-2) var(--ease-out)}
.ct-chat__fi--close{opacity:0;transform:scale(.5)}
.ct-chat.is-open .ct-chat__fi--open{opacity:0;transform:scale(.5)}
.ct-chat.is-open .ct-chat__fi--close{opacity:1;transform:none}
.ct-chat__unread{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:var(--mint);border:2.5px solid var(--bg);transition:transform var(--dur-2) var(--ease-out)}
.ct-chat.is-read .ct-chat__unread{transform:scale(0)}
.ct-chat__nudge{position:absolute;right:calc(100% + 14px);bottom:10px;white-space:nowrap;padding:10px 15px;border-radius:16px 16px 5px 16px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-md);
  color:var(--ink);font-weight:600;font-size:.86rem;opacity:0;transform:translateX(8px) scale(.96);transform-origin:100% 100%;pointer-events:none;
  transition:opacity .5s var(--ease-out),transform .6s var(--ease-out)}
.ct-chat.is-nudge .ct-chat__nudge{opacity:1;transform:none}
```
- FAB: 60px gradient circle with a thin outer ring (`::before`, 6px outside). Hover lifts 3px, deepens the shadow, and the ring grows to 9px outside at .6 opacity.
- Icon swap: open state cross fades the chat icon out (to `scale(.5)`) and the close icon in (from `scale(.5)`), opacity `var(--dur-1)`, transform `var(--dur-2)`, both `var(--ease-out)`.
- Unread dot: 14px mint dot with a 2.5px `--bg` border at the top right; it shows from page load until the first open, then scales to 0 (`.is-read`, never removed, not stored).
- Nudge: a speech bubble to the left of the FAB (tail corner bottom right, radius `16px 16px 5px 16px`), from `translateX(8px) scale(.96)` and opacity 0 to rest, opacity .5s and transform .6s `var(--ease-out)`. It never takes clicks (`pointer-events:none`) and is `aria-hidden`.

##### Panel CSS and open or close motion (L1482-1498)
```css
.ct-chat__panel{position:absolute;right:0;bottom:calc(100% + 16px);width:min(396px,calc(100vw - 32px));height:min(640px,calc(100vh - 136px));display:flex;flex-direction:column;overflow:hidden;
  border-radius:28px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow-lg);
  transform-origin:calc(100% - 30px) 100%;opacity:0;transform:translateY(14px) scale(.9);visibility:hidden;
  transition:opacity .35s var(--ease-out),transform .55s var(--ease-out),visibility 0s linear .55s}
.ct-chat.is-open .ct-chat__panel{opacity:1;transform:none;visibility:visible;transition:opacity .4s var(--ease-out),transform .6s var(--ease-out),visibility 0s}
.ct-chat__head{position:absolute;left:0;right:0;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;
  background:var(--glass);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border-bottom:1px solid var(--line)}
.ct-chat__av{position:relative;width:42px;height:42px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--grad);color:#fff;font-weight:800;font-size:.84rem;letter-spacing:-.03em;box-shadow:var(--glow)}
.ct-chat__live{position:absolute;right:-3px;bottom:-3px;width:12px;height:12px;border-radius:50%;background:var(--accent);border:2.5px solid var(--surface);animation:fh-ping 2.4s var(--ease-out) infinite}
.ct-chat__who{display:grid;min-width:0;line-height:1.3}
.ct-chat__who strong{color:var(--ink);font-size:.98rem;letter-spacing:-.015em}
.ct-chat__who span{font-size:.76rem;color:var(--muted)}
.ct-chat__x{margin-left:auto;width:40px;height:40px;flex:none;border-radius:12px;display:grid;place-items:center;color:var(--ink-2);transition:background var(--dur-1),color var(--dur-1)}
.ct-chat__x:hover{background:var(--brand-soft);color:var(--brand-ink)}
.ct-chat__log{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:86px 16px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;outline:none;
  background:radial-gradient(120% 50% at 100% 0%,var(--accent-soft),transparent 60%),var(--surface)}
.ct-chat__log:focus-visible{box-shadow:inset 0 0 0 2px var(--accent)}
```
- Open: the panel grows from the FAB corner (`transform-origin: calc(100% - 30px) 100%`, the FAB centre): `translateY(14px) scale(.9)` to none over .6s, opacity 0 to 1 over .4s, `visibility` flips at once. Close: back to `translateY(14px) scale(.9)` over .55s, opacity to 0 over .35s, `visibility:hidden` waits .55s (`visibility 0s linear .55s`) so the exit is seen. Both `var(--ease-out)`.
- The header is a frosted glass bar laid over the top of the log (absolute, `z-index:2`); the log has `padding-top:86px` so the first message clears it and later messages scroll under the glass.
- The live dot pings forever with `fh-ping` 2.4s `var(--ease-out)` (`0%{box-shadow:0 0 0 0 rgba(16,185,129,.55)} 70%{box-shadow:0 0 0 9px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`), even while the panel is closed (it is hidden then).
- The log background has a soft mint glow in the top right corner.

##### Form CSS (L1529-1538)
```css
.ct-chat__form{display:flex;align-items:center;gap:8px;padding:12px;border-top:1px solid var(--line);background:var(--surface)}
.ct-chat__in{flex:1;min-width:0;height:48px;padding:0 18px;border-radius:var(--r-pill);border:1px solid var(--line-strong);background:var(--surface-2);color:var(--ink);font-size:.93rem;outline:none;
  transition:border-color var(--dur-1),box-shadow var(--dur-2) var(--ease-out)}
.ct-chat__in::placeholder{color:var(--muted)}
.ct-chat__in:focus{border-color:var(--brand);box-shadow:0 0 0 4px var(--accent-soft)}
[data-theme="dark"] .ct-chat__in:focus{border-color:var(--accent)}
.ct-chat__send{width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--grad);color:#fff;box-shadow:var(--glow);transition:transform var(--dur-1) var(--ease-out),opacity var(--dur-1)}
.ct-chat__send:hover{transform:translateY(-2px)}
.ct-chat__send:active{transform:scale(.94)}
.ct-chat__send .i{width:19px;height:19px}
```
The send button is never disabled, even while a reply is pending (sending is blocked in JS instead).

##### Responsive (L1540-1552)
```css
@media (max-width:1023px){
  .ct-chat{right:16px;bottom:max(96px,calc(env(safe-area-inset-bottom) + 84px));width:56px;height:56px}
  .ct-chat__fab{width:56px;height:56px}
  .ct-chat__panel{height:min(620px,calc(100vh - 248px))}
  .ct-chip,.ct-act{height:44px}
  .ct-chat__x{width:44px;height:44px}
}
@media (max-width:640px){
  .ct-chat__panel{position:fixed;left:10px;right:10px;width:auto;bottom:max(92px,calc(env(safe-area-inset-bottom) + 80px));height:min(640px,calc(100dvh - 172px));border-radius:24px;transform-origin:calc(100% - 40px) 100%}
  .ct-chat.is-open .ct-chat__fab{opacity:0;transform:scale(.6);pointer-events:none}
  .ct-chat__in{font-size:1rem}
  .ct-chat__nudge{bottom:8px}
}
```
- Under 1024px the FAB is 56px and sits 16px from the right, above the bottom dock (at least 96px from the bottom, more with a safe area inset). Chips, action buttons and the close button grow to 44px tap targets.
- At 640px and below the panel is fixed to the viewport, 10px from each side, uses `100dvh`, radius 24px, and while it is open the FAB fades and shrinks away (`opacity:0; transform:scale(.6)`) and cannot be clicked, so the header close button (or Esc) is the way out. The input uses 16px text (`1rem`) so iOS does not zoom on focus.

##### Reduced motion
There is no chat specific reduced motion CSS. The global block (L357-362) cuts every transition and animation to `.001ms` (so the panel, the icon swap, the nudge, the message entrance and the typing dots do not move; the dots stay at the first keyframe; the live dot does not ping). The JS `reduce` flag removes the delays: greeting at 0ms, typing shown at 0ms, reply at 0ms, focus at 0ms, and `goTo` waits 60ms.

#### 11.7.12 Chat messages: bubbles, typing, chips and actions (CSS L1499-1528, JS L6332-6374)

##### Markup written by JS
- Day label, once, before the greeting: `<div class="ct-chat__day" aria-hidden="true">Today</div>`
- User message: `<div class="ct-msg ct-msg--me"><div class="ct-bubble"><span class="sr-only">You: </span>{escaped text}</div></div>`
- Bot message:
```html
<div class="ct-msg ct-msg--bot">
  <div class="ct-bubble"><span class="sr-only">Assistant: </span>
    <p>{inline(p[0])}</p> ...                     <!-- r.p -->
    <ul><li>{inline(item)}</li> ...</ul>           <!-- r.list, if any -->
    <p>{inline(p2[0])}</p> ...                     <!-- r.p2 -->
  </div>
  <div class="ct-acts">                            <!-- if r.acts -->
    <a class="ct-act[ ct-act--ghost]" href="{href}"[ download][ target="_blank" rel="noopener"]><svg class="i" aria-hidden="true"><use href="#{icon}"/></svg>{label}</a>
    <button type="button" class="ct-act[ ct-act--ghost]" data-act="{index}"><svg ...>{label}</button>
  </div>
  <div class="ct-chips" role="group" aria-label="Suggested questions">   <!-- if r.chips -->
    <button type="button" class="ct-chip">{chip}</button> ...
  </div>
</div>
```
  - An action with `href` renders as `a`; `download` actions get `download` and `target="_blank" rel="noopener"`; `ext` actions get `target="_blank" rel="noopener"`; the rest (mailto) get neither. Actions without `href` render as `button[data-act=index]`, and the action objects are kept on the message element (`m.__acts`).
- Typing indicator: `<div class="ct-typing" aria-hidden="true"><i></i><i></i><i></i></div>`, appended to the log and removed when the reply lands.
- After every append: `log.scrollTop = log.scrollHeight` (smooth, because the log has `scroll-behavior:smooth`).

##### CSS
```css
.ct-chat__day{align-self:center;font-family:var(--font-mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:2px 0 6px}
.ct-msg{display:flex;flex-direction:column;gap:8px;max-width:88%;animation:ct-msg-in .5s var(--ease-out) both}
.ct-msg--bot{align-self:flex-start}
.ct-msg--me{align-self:flex-end;align-items:flex-end}
@keyframes ct-msg-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.ct-bubble{padding:11px 14px;border-radius:19px;font-size:.9rem;line-height:1.55;overflow-wrap:anywhere}
.ct-bubble p + p,.ct-bubble p + ul,.ct-bubble ul + p{margin-top:8px}
.ct-msg--bot .ct-bubble{background:var(--surface-3);color:var(--ink-2);border-bottom-left-radius:6px}
.ct-msg--me .ct-bubble{background:var(--grad);color:#fff;border-bottom-right-radius:6px}
.ct-msg--bot .ct-bubble strong{color:var(--ink);font-weight:700}
.ct-bubble a{color:var(--brand-ink);font-weight:600;text-decoration:underline;text-decoration-color:var(--line-strong);text-underline-offset:3px;transition:text-decoration-color var(--dur-1)}
.ct-bubble a:hover{text-decoration-color:currentColor}
.ct-bubble ul{list-style:none;margin:0;padding:0;display:grid;gap:5px}
.ct-bubble li{position:relative;padding-left:15px}
.ct-bubble li::before{content:"";position:absolute;left:3px;top:.68em;width:5px;height:5px;border-radius:50%;background:var(--accent)}
.ct-acts,.ct-chips{display:flex;flex-wrap:wrap;gap:6px}
.ct-act{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 15px;border-radius:var(--r-pill);background:var(--grad);color:#fff;font-size:.82rem;font-weight:600;box-shadow:var(--glow);
  transition:transform var(--dur-1) var(--ease-out),box-shadow var(--dur-2)}
.ct-act:hover{transform:translateY(-2px)}
.ct-act .i{width:15px;height:15px}
.ct-act--ghost{background:var(--surface);color:var(--brand-ink);border:1px solid var(--line-strong);box-shadow:none}
.ct-chip{height:36px;padding:0 14px;border-radius:var(--r-pill);border:1px solid var(--line-strong);background:var(--surface);color:var(--brand-ink);font-size:.8rem;font-weight:600;
  transition:background var(--dur-1),border-color var(--dur-1),transform var(--dur-1) var(--ease-out)}
.ct-chip:hover{background:var(--brand-soft);border-color:var(--brand);transform:translateY(-1px)}
.ct-chips--used .ct-chip{opacity:.5}
.ct-typing{align-self:flex-start;display:inline-flex;gap:5px;padding:15px 16px;border-radius:19px 19px 19px 6px;background:var(--surface-3);animation:ct-msg-in .4s var(--ease-out) both}
.ct-typing i{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:ct-dot 1.3s var(--ease-io) infinite}
.ct-typing i:nth-child(2){animation-delay:.16s}
.ct-typing i:nth-child(3){animation-delay:.32s}
@keyframes ct-dot{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}
```
- Every message (the whole group: bubble, actions and chips) enters with `ct-msg-in` .5s `var(--ease-out)` `both`: from `opacity:0; translateY(10px) scale(.98)`.
- Bot bubbles: `--surface-3` background, `--ink-2` text, bottom left corner 6px. User bubbles: `--grad` background, white text, bottom right corner 6px, right aligned. Max width 88% of the log.
- Links in bubbles: brand ink, weight 600, underline in `--line-strong`, underline turns `currentColor` on hover. The same link style applies inside user bubbles (white bubble text, brand ink links) but user text is never parsed for links (it is only escaped).
- Lists: no bullets; a 5px `--accent` dot at `left:3px; top:.68em`.
- Action buttons: gradient pills 38px high (44px under 1024px), ghost variant is surface with a line border and no glow; hover lifts 2px.
- Chips: 36px (44px under 1024px) outline pills. When the user sends any message, every chip group already in the log gets `.ct-chips--used` (chips dim to .5 opacity but still work).
- Typing dots: three 7px dots in a bot style bubble (bottom left corner 6px), each doing `ct-dot` 1.3s `var(--ease-io)` infinite, delays 0, .16s, .32s (rise 3px and brighten at 30%).

##### Inline formatter `inline(s)` (L6333-6342), applied to every `p`, `list` and `p2` string
1. Escape HTML (`esc`: `& < > " '` to entities).
2. Markdown links: `/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:|#)[^\s)]+)\)/g` to `<a href="{u}">{l}</a>`, and `target="_blank" rel="noopener"` when `u` starts with `http:` or `https:`.
3. Bold: `/\*\*([^*]+)\*\*/g` to `<strong>$1</strong>`.
4. Bare URLs: `/(^|[\s(])(https?:\/\/[^\s<)]+)/g` to `{a}<a href="{u}" target="_blank" rel="noopener">{u without "http(s)://" and without one trailing "/"}</a>`. It only matches a URL at the start or after whitespace or `(`, so URLs already inside `href="..."` are not wrapped twice.
- `plain(r)` (L6371), used for chat history: join `p`, `list`, `p2` with `\n`, remove `**`, turn `[label](url)` into `label`.

#### 11.7.13 Chat JS behaviours (L6178-6485)

Module state (L6181-6183): `history: {role:'user'|'assistant', content:string}[] = []`, `greeted = false`, `isOpen = false`, `busy = false`, `CV = FH.asset('imgs/Faisal-CVS.pdf')` (= `https://faisalhanif.work/imgs/Faisal-CVS.pdf`), `START = ['Services','Rates','Projects','Experience','Book a call','Contact']`, `typingEl = null`.

##### C1. Open and close (L6452-6473)
- Name and lines: `open()` L6453-6461, `close(focusFab)` L6462-6468, listeners L6469-6473. Exposed as `FH.openChat` and `FH.closeChat` (nothing else in the file calls them).
- Starts when: FAB click toggles (`close(true)` if open, else `open()`); header X click `close(true)`; `Escape` keydown on `document` closes (with focus back to the FAB) only when the chat is open AND no `.fh-modal.is-open` exists (but see Notes and traps: the core Esc listener runs first and closes the modal, so when both are open one Esc closes both); action buttons call `close(false)` (11.7.14).
- Reads: `FH.fine` (core L4627-4628: `matchMedia('(pointer:fine)').matches`, read once).
- Writes on open: `#ct-chat` gets `.is-open` and `.is-read`, loses `.is-nudge`; panel: remove `inert`, `aria-hidden="false"`; FAB: `aria-expanded="true"`, `aria-label="Close chat"`; marks the nudge as seen (`sessionStorage['ct-nudged'] = '1'`); runs `greet()` the first time only; focuses the input (fine pointer) or the header X (touch) after 160ms (0 with reduced motion), `preventScroll`.
- Writes on close: remove `.is-open`; panel: `inert=""`, `aria-hidden="true"`; FAB: `aria-expanded="false"`, `aria-label="Open chat with Faisal's Assistant"`; if `focusFab`, focus the FAB (`preventScroll`).
- Timings: CSS only (11.7.11) plus the 160ms focus delay.
- Pauses or skips when: `open()` does nothing if already open; `close()` does nothing if already closed. The conversation is kept while closed (log and history stay; no reset on close or on page change).
- Cleanup in React: remove the document `keydown` listener; clear the focus timeout.
- Port as: `ChatWidget` client component mounted once in the root layout, with `useChatWidget()` state (`isOpen`, `open`, `close`) exposed through a `ChatProvider` so actions and other parts can call it.

##### C2. One time nudge (L6475-6484)
- Starts when: the module runs (page load), if `sessionStorage.getItem('ct-nudged') !== '1'` (errors are swallowed; storage blocked counts as not seen).
- Timings: after 6000ms, if the chat is not open and no `.fh-modal.is-open` exists: add `.is-nudge` and set `sessionStorage['ct-nudged'] = '1'`; remove `.is-nudge` 5200ms later. The bubble fades and slides in over .5s and .6s, and out the same way (CSS 11.7.11).
- Storage: key `ct-nudged`, value `'1'`, in `sessionStorage` (per tab session, cleared when the tab closes). Opening the chat also sets it. So the nudge shows at most once per tab session, and never if the visitor opened the chat within the first 6 seconds.
- Skips when: the chat is open or a modal is open at the 6s mark. In that case it is NOT marked as seen, so it can show again on the next full load in the same tab. Reduced motion does not skip it (the timers are not scaled; only the CSS motion is cut).
- Cleanup in React: clear both timeouts on unmount.
- Port as: `useChatNudge({ isOpen, isModalOpen })` inside `ChatWidget`; wrap storage access in try/catch like the reference. Run it once per full page load (in the Next.js app the root layout mounts once, which matches the single page reference).

##### C3. Greeting (L6418-6424)
- Starts when: the first `open()`.
- Writes: `greeted = true`; appends the "Today" day label; shows the typing dots; after 650ms (0 with reduced motion) removes them and adds the bot message `{ p:["Hi! I'm Faisal's assistant. How can I help you today?"], chips: START }`; pushes `{ role:'assistant', content:"Hi! I'm Faisal's assistant. How can I help you today?" }` to `history`.
- Note: `busy` is not set during the greeting, so a message sent in the first 650ms can land before the greeting.

##### C4. Sending (L6404-6417, L6446-6450)
- Starts when: form `submit` (Enter in the input or the send button): `send(input.value)`; a chip click: `send(chip.textContent)`.
- Steps:
  1. `text = String(text || '').trim()`; stop if empty or `busy` (the typed text stays in the input when blocked).
  2. `busy = true`; mark every existing `.ct-chips` in the log as `.ct-chips--used`.
  3. `addUser(text)`; `history.push({role:'user', content:text})`; clear the input.
  4. `t0 = Date.now()`; show the typing dots after 220ms (0 with reduced motion).
  5. `getReply(text)` (C5). When it resolves: `min = reduce ? 0 : Math.min(1300, 650 + text.length * 8)`; after `max(0, min - elapsed)` ms: remove the dots, `addBot(reply)`, `history.push({role:'assistant', content: plain(reply)})`, `busy = false`.
- Timing examples: "Rates" (5 chars) waits at least 690ms; a 100 character question waits 1300ms; a slow API answer shows as soon as it arrives.
- The typing dots always appear before the reply: the minimum wait (at least 650ms) is longer than the 220ms dot delay; with reduced motion both timers are 0 and fire in order.
- Port as: `useChatConversation()` hook holding `messages`, `history`, `busy`, `send`.

##### C5. Getting a reply (L6376-6403)
- `getReply(text)`:
  - No `FH_HOOKS.chatEndpoint` (or no `fetch`): resolve `localReply(text)` (11.7.16).
  - Else `POST` to the endpoint with header `Content-Type: application/json` and body `JSON.stringify({ message: text, history: history.slice(-12) })`, with an `AbortController` that aborts after 12000ms.
  - Response not ok: error. Content type containing `json`: `res.json()`, else `res.text()`.
  - Text = the string itself, or `d.reply || d.message || d.text || d.content || d.answer || d.choices[0].message.content || ''`. Empty or not a string: error.
  - Success: `r = fromText(t)`; then `lr = localReply(text)`; if `lr.acts`, `r.acts = lr.acts` (the local action buttons are added to the API answer). API answers never get chips.
  - Any error (network, status, parse, empty, abort): resolve `localReply(text)`.
  - The timer is cleared after the chain settles.
- `fromText(text)` (L6377-6386): split the trimmed text into blocks on 2 or more newlines. For each block, split into lines:
  - every line matches `/^\s*([-*•]|\d+\.)\s+/`: strip that marker and append the lines to `r.list` (all list blocks merge into one list);
  - else if a list already exists: the block, lines joined with a space, goes to `r.p2`;
  - else: the block, lines joined with a space, goes to `r.p`.
- Port as: `src/lib/chat/getReply.ts` using the typed API client (`api.chat({ message, history })`, see API_CONTRACT.md), keeping the 12 second abort, the response field fallbacks, the local fallback and the "keep local actions" rule. The backend reads `backend/src/knowledge/portfolio.json`, seeded from 11.7.15.

#### 11.7.14 Chat actions inside answers (L6202-6212, L6426-6449)

Action objects (`A`, L6202-6212). `act` actions render as buttons; `href` actions render as links.

| key | label | icon | kind | target | ghost |
|---|---|---|---|---|---|
| `book` | "Book a call" | `i-calendar` | `act:'book'` | booking, no preset (Quick Chat) | no |
| `quick` | "Book Quick Chat" | `i-zap` | `act:'book'`, `type:'quick'` | booking, Quick Chat | no |
| `deep` | "Book Deep Dive" | `i-layers` | `act:'book'`, `type:'deep'` | booking, Technical Deep Dive | yes |
| `form` | "Send project details" | `i-send` | `act:'form'` | contact form `#ct-form`, then focus `#ct-name` | yes |
| `works` | "See all projects" | `i-briefcase` | `act:'scroll'`, `target:'#works'` | Works page | yes |
| `certs` | "View certifications" | `i-award` | `act:'scroll'`, `target:'#approvals'` | Approvals page | yes |
| `cv` | "Download CV" | `i-download` | `href: CV`, `download:true` | `https://faisalhanif.work/imgs/Faisal-CVS.pdf`, new tab, `download` | no |
| `mail` | "Email Faisal" | `i-mail` | `href:'mailto:' + EMAIL` | `mailto:mehrfaisal111@gmail.com` | no |
| `map` | "View Map" | `i-pin` | `href`, `ext:true` | `https://maps.google.com/?q=Lahore,Pakistan`, new tab | yes |

`runAct(a)` (L6434-6445), run on a click on `[data-act]` inside a message (`m.__acts[+data-act]`):
- `book`: `close(false)` (no focus move), then `FH.openBooking(a.type || '')`.
- `form`: `close(false)`, then `goTo('ct-form', focusName)`; `focusName` focuses `#ct-name` with `preventScroll`.
- `scroll`: only under 1024px wide (`innerWidth < 1024`) close the chat first; on desktop the chat stays open. Then `goTo(target without '#')`.

`goTo(id, after)` (L6428-6433):
- Finds the element; its page is the element itself if it has `.page`, else `FH.pageOf(el)`; `cross = FH.current && page && page !== FH.current`.
- Calls `FH.go(el)` (the router: pushes the hash, closes open modals, runs the curtain page change or scrolls within the page; see 11.2), or `scrollIntoView` if the router is missing.
- If `after` is given, runs it after 60ms (reduced motion), 2700ms (page change), or 900ms (same page).

Port as: an `onAction(action)` handler in `ChatWidget` that calls `openBooking(type)` from the booking context, `router.push('/contact#ct-form')` then focuses `#ct-name` after the same delays, or `router.push('/works')` and `router.push('/approvals')`. Keep the "close on under 1024px only" rule for the scroll actions.

#### 11.7.15 Chat knowledge (`frontend/src/content/chat-knowledge.ts`, seeds `backend/src/knowledge/portfolio.json`)

Full transcription of L6183 and L6185-6290. Every string is word for word, including the `**bold**` and `[label](url)` markup the renderer understands. Note the facts that differ from other parts of the site (they are the reference's words, keep them): the projects list here has 14 entries with its own short descriptions, the contact reply says "usually replies within 2-4 hours" while the availability reply says "within 24 hours", and the reviews include Sarah Johnson and Emily Rodriguez (marked `needsConfirmation` in section 13).

For `portfolio.json`: every reply below is static text except `location`, which appends the live Lahore time, and `contact`, which builds the email line from `CHAT_EMAIL`. The backend can store the resolved strings and compute the time per request.

```ts
// frontend/src/content/chat-knowledge.ts

export const CHAT_EMAIL = 'mehrfaisal111@gmail.com';
/** FH.asset('imgs/Faisal-CVS.pdf') with FH_BASE 'https://faisalhanif.work/' (L6182). */
export const CHAT_CV_URL = '/imgs/Faisal-CVS.pdf'; // same origin (orchestrator-decisions.md); the reference has the absolute https://faisalhanif.work URL

export const CHAT_GREETING = "Hi! I'm Faisal's assistant. How can I help you today?";
export const CHAT_START_CHIPS: string[] = ['Services', 'Rates', 'Projects', 'Experience', 'Book a call', 'Contact'];

/* ---------- projects (L6186-6201) ---------- */
export interface ChatProject {
  /** Lower case keywords; any hit returns this project's card. */
  k: string[];
  name: string;
  cat: string;
  d: string;
  live: string;
  /** Source code link; missing means "Closed source". */
  src?: string;
  tags: string;
}

export const CHAT_PROJECTS: ChatProject[] = [
  { k: ['purebody', 'pure body'], name: 'PureBody', cat: 'SaaS App', d: 'Live SaaS app on Android and the App Store. A complete AI system powering personalized diet plans, smart workout tracking and an AI coach that adapts to every user.', live: 'https://faisalhanif.work/sass-app.html', tags: 'React Native, Node.js, MongoDB, Push Notifications, LLM API' },
  { k: ['uha', 'uha international'], name: 'UHA International', cat: 'React.js', d: 'Corporate website covering tech, real estate and trading, with built-in AI chat support and Nodemailer turning visitor inquiries into real business.', live: 'https://uha-international.com/', tags: 'React.js, Node.js, Nodemailer, API Integration' },
  { k: ['fit for living', 'fitforliving'], name: 'Fit For Living', cat: 'Client Website', d: 'Business website for a Geelong gym and coaching studio, with membership pricing, programs and a live weekly class timetable.', live: 'https://fitforliving.netlify.app/', tags: 'HTML5, CSS3, JavaScript, Netlify' },
  { k: ['gitpulse', 'git pulse'], name: 'GitPulse', cat: 'Next.js', d: 'GitHub activity tracking platform for coding bootcamps, with role-based dashboards, cohort management, scoring and leaderboards.', live: 'https://gitpulseee.netlify.app/', src: 'https://github.com/FaisalHanif12/GitPulse-', tags: 'Next.js, React, GitHub API, Role-Based Access' },
  { k: ['smart health', 'fitness tracker'], name: 'Smart Health Care', cat: 'Full Stack', d: 'A full-featured fitness tracker with activity monitoring, workout scheduling and progress analytics.', live: 'https://smart-health-care.vercel.app/', src: 'https://github.com/FaisalHanif12/Smart-health-Care', tags: 'React, Node.js, MongoDB, Express' },
  { k: ['smart gallery', 'gallery app'], name: 'Smart Gallery App', cat: 'React Native', d: 'An intelligent photo gallery with advanced sorting, filtering and AI-powered image recognition.', live: 'https://smartgallery-display.netlify.app/', src: 'https://github.com/FaisalHanif12/SmartGallery', tags: 'React Native, Expo, Async Storage, OpenAI' },
  { k: ['echo ai', 'echoai'], name: 'Echo AI', cat: 'React.js', d: 'An AI-powered conversational interface with natural language processing and intelligent response generation.', live: 'https://echoaai.netlify.app/', src: 'https://github.com/FaisalHanif12/Echoai', tags: 'React, OpenAI, TypeScript, Tailwind' },
  { k: ['medicine store', 'medicine app', 'medicare', 'pet health'], name: 'Medicine Store App', cat: 'React Native', d: 'A pet healthcare app for tracking medications and medical records for animals.', live: 'https://medicaredisplay.netlify.app/', src: 'https://github.com/FaisalHanif12/medicine-tracker-', tags: 'React Native, Expo, Async Storage' },
  { k: ['soledeck', 'sneaker store', 'sneaker shop'], name: 'Soledeck', cat: 'E-commerce', d: 'A modern sneaker store with advanced filtering, Stripe payments and inventory management.', live: 'https://soledeckf.vercel.app/', src: 'https://github.com/FaisalHanif12/Soledeck', tags: 'Next.js, Stripe, MongoDB, Redux' },
  { k: ['financial fusion', 'fintech app', 'expense tracker'], name: 'Financial Fusion', cat: 'FinTech', d: 'A financial management app with expense tracking, budget planning and investment analytics.', live: 'https://financial-fusion.netlify.app/', src: 'https://github.com/FaisalHanif12/FinancialFusion', tags: 'React Native, Charts.js, SQLite, Redux' },
  { k: ['yoom', 'video conferencing app'], name: 'YOOM', cat: 'Communication', d: 'A video conferencing platform with real-time collaboration, screen sharing and meeting management.', live: 'https://faisal-yoom.netlify.app/', src: 'https://github.com/FaisalHanif12/YOOM', tags: 'Next.js, WebRTC, Socket.io, Clerk Auth' },
  { k: ['dosnexa', 'telemedicine'], name: 'Dosnexa', cat: 'Healthcare', d: 'A medical platform connecting patients with doctors, with appointment booking and telemedicine.', live: 'https://dosnexa.vercel.app/', src: 'https://github.com/FaisalHanif12/Dosnexa', tags: 'Next.js, Prisma, PostgreSQL, Shadcn/ui' },
  { k: ['dsa tracker', 'dsa'], name: 'DSA Tracker', cat: 'Education', d: 'A data structures and algorithms learning platform with progress tracking and coding challenges.', live: 'https://faisal-dsa-tracker.netlify.app/', src: 'https://github.com/FaisalHanif12/DSA-Tracker-', tags: 'React, Material-UI, PWA' },
  { k: ['live search weather', 'weather app'], name: 'Live Search Weather', cat: 'Utility', d: 'A real-time weather app with live search, detailed forecasts and location-based services.', live: 'https://weather-faisal.netlify.app/', src: 'https://github.com/FaisalHanif12/Live-search-weather', tags: 'Next.js, Weather API, Geolocation' },
];

/* ---------- action buttons (L6202-6212) ---------- */
export type ChatActionKey = 'book' | 'quick' | 'deep' | 'form' | 'works' | 'certs' | 'cv' | 'mail' | 'map';

export interface ChatAction {
  label: string;
  /** Sprite symbol id. */
  icon: 'i-calendar' | 'i-zap' | 'i-layers' | 'i-send' | 'i-briefcase' | 'i-award' | 'i-download' | 'i-mail' | 'i-pin';
  /** Button actions. */
  act?: 'book' | 'form' | 'scroll';
  /** Booking preset for act 'book'. */
  type?: 'quick' | 'deep';
  /** Element id with '#' for act 'scroll'. */
  target?: string;
  /** Link actions. */
  href?: string;
  download?: boolean;
  /** Opens in a new tab. */
  ext?: boolean;
  /** Outline style (.ct-act--ghost). */
  ghost?: boolean;
}

export const CHAT_ACTIONS: Record<ChatActionKey, ChatAction> = {
  book: { label: 'Book a call', icon: 'i-calendar', act: 'book' },
  quick: { label: 'Book Quick Chat', icon: 'i-zap', act: 'book', type: 'quick' },
  deep: { label: 'Book Deep Dive', icon: 'i-layers', act: 'book', type: 'deep', ghost: true },
  form: { label: 'Send project details', icon: 'i-send', act: 'form', ghost: true },
  works: { label: 'See all projects', icon: 'i-briefcase', act: 'scroll', target: '#works', ghost: true },
  certs: { label: 'View certifications', icon: 'i-award', act: 'scroll', target: '#approvals', ghost: true },
  cv: { label: 'Download CV', icon: 'i-download', href: CHAT_CV_URL, download: true },
  mail: { label: 'Email Faisal', icon: 'i-mail', href: 'mailto:' + CHAT_EMAIL },
  map: { label: 'View Map', icon: 'i-pin', href: 'https://maps.google.com/?q=Lahore,Pakistan', ghost: true, ext: true },
};

/* ---------- replies (L6213-6290) ---------- */
export interface ChatReply {
  /** Paragraphs before the list. */
  p?: string[];
  /** Bullet list. */
  list?: string[] | null;
  /** Paragraphs after the list. */
  p2?: string[];
  acts?: ChatAction[];
  chips?: string[];
}

export type ChatIntentId =
  | 'greet' | 'thanks' | 'services' | 'web' | 'mobile' | 'ai' | 'cloud' | 'rates' | 'book' | 'projects'
  | 'experience' | 'education' | 'skills' | 'certs' | 'contact' | 'location' | 'avail' | 'cv'
  | 'reviews' | 'about' | 'social' | 'fallback';

/** L6213: current time in Lahore, for example "3:42 PM"; '' if Intl fails. */
export function lahoreTime(now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', hour: 'numeric', minute: '2-digit' }).format(now);
  } catch {
    return '';
  }
}

const A = CHAT_ACTIONS;

export const CHAT_KB: Record<ChatIntentId, () => ChatReply> = {
  greet: () => ({
    p: ["Hello! I can tell you about Faisal's services, rates, projects or experience. What would you like to know?"],
    chips: CHAT_START_CHIPS,
  }),
  thanks: () => ({
    p: ['Happy to help! Anything else you would like to know?'],
    chips: ['Book a call', 'Projects', 'Contact'],
  }),
  services: () => ({
    p: ['Faisal works across four areas:'],
    list: [
      '**Web Development**: fast, responsive apps with React.js, Next.js, TypeScript and Node.js',
      '**Mobile Development**: cross-platform iOS and Android apps with React Native and Expo',
      '**AI/LLM Integration**: chatbots, agentic workflows and RAG with OpenAI, Claude and MCP',
      '**Cloud Orchestration**: AWS, Docker, CI/CD, Vercel and Netlify',
    ],
    p2: ['Want to talk through your project?'],
    acts: [A.book, A.form],
    chips: ['Rates', 'AI work', 'Projects'],
  }),
  web: () => ({
    p: [
      "**Web Development** is Faisal's core. He builds responsive, high-performance web apps with React.js, Next.js, TypeScript and Tailwind CSS, backed by Node.js, Express.js, MongoDB and SQL.",
      'Recent examples: [GitPulse](https://gitpulseee.netlify.app/), [Soledeck](https://soledeckf.vercel.app/) and [UHA International](https://uha-international.com/).',
    ],
    acts: [A.book, A.works],
    chips: ['Rates', 'Mobile apps'],
  }),
  mobile: () => ({
    p: [
      'Faisal builds cross-platform mobile apps with React Native and Expo, ready for iOS and Android.',
      'His latest is **PureBody**, a live AI fitness app on Android and the App Store with personalized diet plans and an AI coach. Others include [Smart Gallery](https://smartgallery-display.netlify.app/) and [Financial Fusion](https://financial-fusion.netlify.app/).',
    ],
    acts: [A.works],
    chips: ['Tell me about PureBody', 'Rates'],
  }),
  ai: () => ({
    p: ["AI is a big part of Faisal's work. He brings LLMs into real products:"],
    list: [
      'AI chatbots and assistants, agentic workflows and personalized AI features',
      'Tools: OpenAI, Claude API, LangChain, LangGraph, RAG and MCP',
      "Examples: PureBody's AI coach, [Echo AI](https://echoaai.netlify.app/) and the AI chat on [UHA International](https://uha-international.com/)",
      "Certified in Anthropic's Claude Code in Action and Claude 101 (2026)",
    ],
    acts: [A.deep],
    chips: ['Rates', 'Projects'],
  }),
  cloud: () => ({
    p: ['For **Cloud Orchestration** Faisal handles deployment and scaling with AWS, Docker, CI/CD pipelines, Vercel and Netlify. He also holds the AWS Cloud & Data Analytics Professional Certificate.'],
    acts: [A.book],
    chips: ['Services', 'Rates'],
  }),
  rates: () => ({
    p: ['Here is how pricing works:'],
    list: [
      '**Professional plan** (Full Stack + AI Power): **$25/hour**. Covers AI/LLM integration, frontend, backend API, database, performance, cloud and maintenance.',
      '**Quick Chat** call: $15 per 30 minute session',
      '**Technical Deep Dive** call: $25 per 60 minute session',
    ],
    p2: ['Need a custom solution? Share your project and he will get back with next steps.'],
    acts: [A.book, A.form],
    chips: ['Services', 'Projects'],
  }),
  book: () => ({
    p: ['You can book a video call right here:'],
    list: [
      '**Quick Chat**: 30 minutes, $15. Good for first discussions',
      '**Technical Deep Dive**: 60 minutes, $25. Planning, architecture and budget',
    ],
    p2: ['Slots run Monday to Friday, 9AM to 6PM Pakistan time, shown in your own timezone.'],
    acts: [A.quick, A.deep],
  }),
  projects: () => ({
    p: ['Faisal has shipped 10+ projects. A few highlights:'],
    list: [
      '**PureBody**: AI fitness SaaS on Android and the App Store',
      '**GitPulse**: GitHub activity tracking for bootcamps ([live](https://gitpulseee.netlify.app/))',
      '**UHA International**: corporate site with AI chat support ([live](https://uha-international.com/))',
      '**Echo AI**: conversational AI interface ([live](https://echoaai.netlify.app/))',
      '**Soledeck**: sneaker e-commerce with Stripe ([live](https://soledeckf.vercel.app/))',
      '**YOOM**: video conferencing with WebRTC ([live](https://faisal-yoom.netlify.app/))',
    ],
    acts: [A.works],
    chips: ['AI work', 'Mobile apps', 'Rates'],
  }),
  experience: () => ({
    p: ['Faisal has 3+ years of experience across 3+ companies:'],
    list: [
      '**Software Engineer, TechXelo** (2024 - 2026, current): AI-powered full-stack web and mobile apps with React.js, Next.js, Node.js and MongoDB',
      '**Freelance Developer, Upwork** (2023 - 2024): custom web solutions for international clients',
      '**Outsourcing Engineer, UHA International** (2023 - 2024): project acquisition and client strategy',
      '**React Native Developer, Viral Square** (2022 - 2023): cross-platform iOS and Android apps',
    ],
    acts: [A.cv],
    chips: ['Education', 'Skills'],
  }),
  education: () => ({
    p: ["Faisal's academic background:"],
    list: [
      '**BS Software Engineering**, University of Management & Technology, Lahore (2020 - 2024)',
      '**Intermediate, Computer Science**, Unique College, Lahore (2018 - 2020)',
      '**Matric, Computer Science**, Unique College, Lahore (2016 - 2018)',
    ],
    chips: ['Experience', 'Certifications'],
  }),
  skills: () => ({
    p: ['His main tools:'],
    list: [
      '**Languages**: JavaScript, TypeScript, Node.js, C++',
      '**Frameworks**: React.js, Next.js, React Native, Express.js',
      '**AI & LLM**: LangChain, LangGraph, OpenAI API, Claude API',
      '**Styling**: Tailwind CSS, Bootstrap, CSS3, responsive design',
    ],
    p2: ['He speaks English at a professional level and Urdu natively.'],
    chips: ['Projects', 'Certifications'],
  }),
  certs: () => ({
    p: ['Faisal holds 7 certifications, including:'],
    list: [
      '**Claude Code in Action** and **Claude 101**, Anthropic (2026)',
      '**React Front-End Developer** and **React Native Mobile Development**, Meta (2024)',
      '**Frontend Web Development**, Google (2024)',
      '**Full Stack Web Development**, IBM (2023)',
      '**AWS Cloud & Data Analytics** (2023)',
    ],
    acts: [A.certs],
    chips: ['Skills', 'Experience'],
  }),
  contact: () => ({
    p: ['Here is how to reach Faisal:'],
    list: [
      'Email: [' + CHAT_EMAIL + '](mailto:' + CHAT_EMAIL + '), usually replies within 2-4 hours',
      'Phone: [+92 314 8166354](tel:+923148166354), Mon-Fri, 9AM-6PM (GMT+5)',
    ],
    acts: [A.form, A.book],
    chips: ['Location'],
  }),
  location: () => {
    const t = lahoreTime();
    return {
      p: ['Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide.' + (t ? ' It is ' + t + ' there right now.' : '')],
      acts: [A.map],
      chips: ['Availability', 'Book a call'],
    };
  },
  avail: () => ({
    p: ['Yes, Faisal is available for work and new projects. He is reachable Monday to Friday, 9AM to 6PM (GMT+5), and replies to messages within 24 hours.'],
    acts: [A.book, A.form],
  }),
  cv: () => ({
    p: ["Here is Faisal's CV. It covers his experience, skills and education."],
    acts: [A.cv],
    chips: ['Experience', 'Contact'],
  }),
  reviews: () => ({
    p: ['A few words from clients:'],
    list: [
      '"His attention to detail and problem-solving skills are outstanding." **Sarah Johnson**, TechCorp',
      '"Exceptional coding skills and problem-solving abilities." **Amnan Hussain**, Infinity Edge Technology',
      '"His code quality and documentation are top-notch." **Emily Rodriguez**, AppSolutions',
    ],
    chips: ['Projects', 'Book a call'],
  }),
  about: () => ({
    p: [
      '**Faisal Hanif** is a software engineer in Lahore, Pakistan. He builds AI-powered web and mobile products with React, Next.js, Node.js and LLMs.',
      'He has 3+ years of experience, 10+ projects and a BS in Software Engineering.',
    ],
    chips: ['Services', 'Projects', 'Experience'],
  }),
  social: () => ({
    p: ['You can find Faisal here:'],
    list: [
      '[LinkedIn](https://www.linkedin.com/in/faisal-frontend-developer/)',
      '[GitHub](https://github.com/FaisalHanif12)',
      '[X](https://x.com/FaisalHanif333)',
      '[Instagram](https://www.instagram.com/faisal_hanif_0/)',
      '[Quora](https://www.quora.com/profile/Faisal-Hanif-126)',
    ],
    chips: ['Contact'],
  }),
  fallback: () => ({
    p: ['I am not sure about that one, but Faisal can answer it directly. I can also help with his services, rates, projects or experience.'],
    acts: [A.mail],
    chips: ['Services', 'Rates', 'Projects'],
  }),
};

/** L6287-6290: the card for a matched project. */
export function projectReply(p: ChatProject): ChatReply {
  const links = '[Live preview](' + p.live + ')' + (p.src ? ' · [Source](' + p.src + ')' : ' · Closed source');
  return {
    p: ['**' + p.name + '** (' + p.cat + '): ' + p.d, 'Built with ' + p.tags + '.', links],
    acts: [A.works],
    chips: ['Projects', 'Book a call'],
  };
}
```
The `·` in `projectReply` is U+00B7 with a space on each side. Example output for GitPulse: paragraph 1 "**GitPulse** (Next.js): GitHub activity tracking platform for coding bootcamps, with role-based dashboards, cohort management, scoring and leaderboards.", paragraph 2 "Built with Next.js, React, GitHub API, Role-Based Access.", paragraph 3 "[Live preview](https://gitpulseee.netlify.app/) · [Source](https://github.com/FaisalHanif12/GitPulse-)". For PureBody and UHA International (no `src`) paragraph 3 ends with " · Closed source"; Fit For Living has no `src` either.

#### 11.7.16 Local answer engine (L6291-6330): port exactly

Used when there is no chat endpoint, when the endpoint fails, and on every API answer to pick the action buttons. It is deterministic: port it as pure functions and unit test it with the table below.

```ts
// frontend/src/lib/chat/localReply.ts
import { CHAT_KB, CHAT_PROJECTS, projectReply, type ChatIntentId, type ChatReply } from '@/content/chat-knowledge';

export interface ChatIntent {
  id: Exclude<ChatIntentId, 'fallback'>;
  kw: string[];
  /** Weight; default 1. */
  w?: number;
}

/** L6291-6313. ORDER MATTERS: on equal scores the earlier intent wins. */
export const CHAT_INTENTS: ChatIntent[] = [
  { id: 'book', kw: ['book', 'booking', 'meeting', 'schedule', 'consult', 'consultation', 'session', 'appointment', 'book a call', 'video call', 'zoom', 'google meet', 'calendar', 'talk to him', 'call'] },
  { id: 'rates', kw: ['rate', 'rates', 'price', 'pricing', 'cost', 'costs', 'charge', 'charges', 'hourly', 'per hour', 'budget', 'fee', 'fees', 'how much', 'quote', 'expensive', 'cheap', 'plan', 'package', '$'] },
  { id: 'cv', kw: ['cv', 'resume', 'download'], w: 1.4 },
  { id: 'contact', kw: ['contact', 'email', 'mail', 'phone', 'number', 'reach', 'whatsapp', 'get in touch', 'call him', 'call me', 'message him'] },
  { id: 'ai', kw: ['ai', 'llm', 'llms', 'gpt', 'openai', 'claude', 'chatbot', 'chatbots', 'bot', 'agent', 'agents', 'agentic', 'rag', 'mcp', 'langchain', 'langgraph', 'prompt', 'machine learning', 'ai work'] },
  { id: 'mobile', kw: ['mobile', 'app', 'apps', 'ios', 'android', 'react native', 'expo', 'play store', 'app store', 'mobile apps'] },
  { id: 'web', kw: ['web', 'website', 'websites', 'frontend', 'front end', 'react', 'next', 'nextjs', 'next.js', 'landing page', 'dashboard', 'saas', 'full stack', 'fullstack', 'mern', 'backend', 'node', 'api'] },
  { id: 'cloud', kw: ['cloud', 'aws', 'docker', 'devops', 'deploy', 'deployment', 'ci/cd', 'cicd', 'vercel', 'netlify', 'hosting', 'server', 'kubernetes'] },
  { id: 'projects', kw: ['project', 'projects', 'portfolio', 'work samples', 'works', 'built', 'showcase', 'examples', 'example', 'case study', 'demo', 'previous work', 'shipped'] },
  { id: 'experience', kw: ['experience', 'job', 'jobs', 'company', 'companies', 'worked', 'career', 'techxelo', 'upwork', 'viral square', 'years', 'employment', 'work history'] },
  { id: 'education', kw: ['education', 'degree', 'university', 'umt', 'study', 'studied', 'college', 'bachelor', 'graduate', 'school', 'matric', 'intermediate', 'academic'] },
  { id: 'skills', kw: ['skill', 'skills', 'stack', 'tech stack', 'technology', 'technologies', 'typescript', 'javascript', 'tailwind', 'framework', 'frameworks', 'tools', 'proficient', 'languages', 'language', 'urdu', 'english', 'speak'] },
  { id: 'certs', kw: ['certificate', 'certificates', 'certification', 'certifications', 'certified', 'approvals', 'coursera', 'credential', 'credentials', 'course', 'courses'] },
  { id: 'location', kw: ['where', 'location', 'based', 'lahore', 'pakistan', 'timezone', 'time zone', 'gmt', 'pkt', 'local time', 'country', 'city', 'located', 'map'] },
  { id: 'avail', kw: ['available', 'availability', 'hire', 'hiring', 'open to work', 'freelance', 'start', 'when can', 'working hours', 'hours', 'capacity', 'free'] },
  { id: 'services', kw: ['service', 'services', 'offer', 'offers', 'what do you do', 'what does he do', 'what can', 'help with', 'specialize', 'specialise', 'expertise', 'do for me', 'what he does'] },
  { id: 'reviews', kw: ['review', 'reviews', 'testimonial', 'testimonials', 'clients say', 'feedback', 'recommend', 'references', 'reputation'] },
  { id: 'social', kw: ['linkedin', 'github', 'twitter', 'x.com', 'instagram', 'quora', 'social', 'socials', 'profiles', 'profile links'] },
  { id: 'about', kw: ['who', 'about', 'yourself', 'introduce', 'bio', 'summary', 'faisal'], w: 0.6 },
  { id: 'thanks', kw: ['thanks', 'thank you', 'thx', 'great', 'awesome', 'perfect', 'cool', 'nice', 'ok thanks'], w: 0.9 },
  { id: 'greet', kw: ['hi', 'hello', 'hey', 'salam', 'assalam', 'aoa', 'good morning', 'good evening', 'good afternoon', 'yo'], w: 0.8 },
];

/**
 * L6314. Lower case, drop a possessive "'s" or "’s" (straight or U+2019 quote),
 * turn anything outside [a-z0-9$./+- ] into a space, collapse spaces,
 * and pad with one space on each side.
 */
export function norm(s: string): string {
  return ' ' + String(s).toLowerCase().replace(/[’']s\b/g, '').replace(/[^a-z0-9$./+\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}

/** L6315-6319. t is the output of norm(). */
export function has(t: string, k: string): boolean {
  if (k === '$') return t.indexOf('$') > -1;
  if (k.indexOf(' ') > -1 || k.length > 5) return t.indexOf(k) > -1;
  return t.indexOf(' ' + k + ' ') > -1 || t.indexOf(' ' + k + 's ') > -1 || t.indexOf(' ' + k + '? ') > -1 || t.indexOf(' ' + k + '. ') > -1;
}

/** L6320-6330. */
export function localReply(text: string): ChatReply {
  const t = norm(text);
  for (let i = 0; i < CHAT_PROJECTS.length; i++) {
    if (CHAT_PROJECTS[i].k.some((k) => has(t, k))) return projectReply(CHAT_PROJECTS[i]);
  }
  let best: ChatIntent['id'] | null = null;
  let bestScore = 0;
  CHAT_INTENTS.forEach((it) => {
    let s = 0;
    it.kw.forEach((k) => {
      if (has(t, k)) s += (k.indexOf(' ') > -1 ? 1.6 : 1) * (it.w || 1);
    });
    if (s > bestScore + 1e-6) {
      bestScore = s;
      best = it.id;
    }
  });
  return (best ? CHAT_KB[best] : CHAT_KB.fallback)();
}
```

##### Rules in plain words
1. Normalise the message (`norm`). The possessive regex holds a literal U+2019 right single quote and a straight quote: `/[’']s\b/g`. Keep both.
2. Projects first: walk `CHAT_PROJECTS` in order; the first project with any keyword hit wins and returns `projectReply`. So "Tell me about PureBody" returns the PureBody card, not the about reply.
3. Else score every intent: each keyword hit adds `1` (single word) or `1.6` (keyword with a space), times the intent weight `w` (default 1; `cv` 1.4, `about` 0.6, `thanks` 0.9, `greet` 0.8). The highest score wins; a later intent must beat the best by more than `1e-6`, so ties go to the earlier intent in the list.
4. No hit at all: `fallback`.
5. Keyword matching (`has`):
   - `'$'`: any `$` in the text.
   - Keywords with a space, or longer than 5 characters: plain substring (so `'website'` also hits "websites", `'service'` hits "services", and `'deploy'` hits "deployment").
   - Keywords of 5 characters or fewer: whole word only, with the variants `k + 's'`, `k + '?'` and `k + '.'` also accepted (for example `'rate'` hits " rates "). Because `norm` turns `?` into a space, the `'? '` variant can never match; `.` is kept by `norm`, so "cv." still hits.
6. Every chip in the knowledge is itself a message; it goes through the same engine.

##### Expected results for every chip and a few messages (computed from the rules above)

| Message | Result | Why (score) |
|---|---|---|
| "Services" | `services` | `service` 1 + `services` 1 = 2 |
| "Rates" | `rates` | `rate` 1 (plural) + `rates` 1 = 2 |
| "Projects" | `projects` | `project` 1 + `projects` 1 = 2 |
| "Experience" | `experience` | 1 |
| "Book a call" | `book` | `book` 1 + `book a call` 1.6 + `call` 1 = 3.6 |
| "Contact" | `contact` | 1 |
| "AI work" | `ai` | `ai` 1 + `ai work` 1.6 = 2.6 |
| "Mobile apps" | `mobile` | `mobile` 1 + `app` 1 (plural) + `apps` 1 + `mobile apps` 1.6 = 4.6 |
| "Tell me about PureBody" | PureBody card | project keyword `purebody` |
| "Education" | `education` | 1 |
| "Skills" | `skills` | `skill` 1 (plural) + `skills` 1 = 2 |
| "Certifications" | `certs` | `certification` 1 + `certifications` 1 = 2 |
| "Location" | `location` | 1 |
| "Availability" | `avail` | `availability` 1 (`available` is not a substring of it) |
| "hello" | `greet` | 0.8 |
| "thanks" | `thanks` | 0.9 |
| "Can I download your CV?" | `cv` | `download` 1.4 + `cv` 1.4 = 2.8 |
| "what is your hourly rate" | `rates` | `rate` 1 + `hourly` 1 = 2 |

#### 11.7.17 Section 10 check: chat

Verified against L4467-4491 and L6178-6485. Everything in section 10 "Chat" matches, with these corrections and additions:
- `history` entries are `{ role: 'user' | 'assistant', content: string }`; assistant content is `plain(reply)` (markup removed, parts joined with `\n`). The greeting is in it (as the first entry) only once the chat has been opened, which is always true before a send.
- Only `acts` from the local reply are merged into API answers; chips are not.
- The renderer turns bare `http://` and `https://` URLs into links (section 10 says "bare https URLs").
- The greeting shows after 650ms of typing dots (0 with reduced motion), with the day label "Today" above it.
- The request sends `Content-Type: application/json`; a non ok status, an empty reply, a non string reply, a network error or the 12 second abort all fall back to the local reply silently (no error message is ever shown).
- The FAB label changes to "Close chat" while open; the panel uses `inert` and `aria-hidden` while closed.
- The nudge "Ask me anything" shows once per tab session, 6000ms after load, for 5200ms, stored in `sessionStorage` key `ct-nudged`.

#### Notes and traps

Booking modal
- The modal close is instant in the reference: `.fh-modal` flips `visibility` with no transition, so the fade out and the 28px drop are never seen. Only the open is animated. Do not "fix" this with an exit animation.
- Neither the booking dialog nor the chat panel traps focus. Tab can leave both. Match it; do not add a trap unless the owner asks.
- `reduce` (and `FH.fine`) are read once at page load (core L4565, L4628). A React `matchMedia` hook that updates live is a small behaviour change; either read once or accept live updates, but keep every reduced motion branch listed in 11.7.8 and 11.7.13.
- Every `openBooking()` clears all state, contact details included, so closing the modal by mistake loses what was typed. "Book Another Meeting" keeps the email (still verified), name, phone, company and session type, but resets the session count to 1. "Change session" keeps everything, including the current step.
- Screen A has no validation; `#ct-bk-go` always moves to step 1.
- The progress circles and fill change as soon as Continue or Back is pressed; the pane swap follows (190ms out, then 560ms in). Only screen changes scroll the panel to the top; step changes do not.
- `busy` is shared: while a pane swap runs, Continue, Back and Complete Booking do nothing, and during submit the pane buttons do nothing.
- `fieldErr` leaves `aria-invalid="false"` on a field after its error clears; only `reset` removes the attribute.
- Only the email error line has `aria-live`; the others are silent until focus reaches the field (`aria-describedby`).
- The Complete Booking button has an `i-check` icon in the markup that is always hidden (`.ct-bk__complete > .i{display:none}`). While loading the label collapses to `width:0`, so the button shrinks to the spinner.
- The done screen title text in the HTML is "Request ready!" (the mail path wording). In React render the title from state; the hook path says "Booking sent!".
- The check draw uses `.is-drawn`, removed and re added on the next frame (L6140-6142). In React, re add the class after the done screen mounts (or key the SVG) so the draw replays on every booking.
- `swapViews` needs both views in the DOM during the out phase and during the in phase with a measured height morph on the container. A conditional render that unmounts the old view at once will not match. Keep both mounted and toggle `hidden`, or use an animation library that can run the same keyframes: out 190ms `cubic-bezier(.4,0,1,1)` with `fill:'forwards'`, in 560ms `cubic-bezier(.22,1,.36,1)`, 14px on y, 22px on x.
- Dates: "today", the weekday rule and the 60 day limit use the visitor's local calendar, but the slot times are Lahore times on that date (9:00 to 17:00 at UTC+5). A visitor far west sees early slots tagged "prev day", a visitor far east sees late slots tagged "next day". Keep this exactly; the payload `date` is the Lahore date.
- Zone labels use the offset of "now", not of the meeting date. Around a daylight saving change the label (for example "GMT-4 · New York (Eastern)") can disagree with the converted slot time, which is always right.
- The calendar, the zone list and all `Intl` strings depend on the visitor's clock and zone. Render them on the client only (for example inside the modal after it opens) to avoid hydration mismatches. Some browser versions put a narrow no break space (U+202F) before "AM"/"PM" in `Intl` output; never compare these strings in tests against hard coded text with a normal space.
- A visitor zone missing from `ZONES` is added with a label made from the last part of its IANA id (`America/Argentina/Buenos_Aires` becomes "Buenos Aires").
- All 9 slots are always offered; the reference has no busy slot check. A 60 minute Deep Dive can start at 17:00 PKT and end at 18:00, which still fits "9AM to 6PM".
- The recap total and the ticket total are not tweened; only the pick screen total (`#ct-bk-s-total`) tweens, and it starts from whatever number is on screen at that moment.
- The mail path clicks a hidden `mailto:` link (subject and body URL encoded); with a hook, a rejected promise shows the failure toast and keeps the user on step 3 with all data.
- `.ct-bk__head--steps`, `.ct-bf--cal` and `.ct-bk__panes` have no CSS; they are JS or semantic hooks. `#ct-bk-panes` is the element whose height is morphed on step changes.
- The top bar Book button (L2992) has no `type` attribute and its icon has no `aria-hidden`.
- A chat "book" action closes the chat without moving focus, then opens the booking modal; the core stores the action button (now inside the `inert` chat panel) as the element to refocus, so on close focus falls back to the page. Decide in the port whether to refocus the FAB (small improvement) or match the reference.

Chat widget
- Esc order: the core keydown listener (L4660) is registered before the chat one (L6472). When the booking modal and the chat are both open (possible: open the chat, then click a Book button on the page, since page Book buttons do not close the chat), one Esc closes both, and focus ends on the FAB. Also, the core Esc handler calls `lastFocus.focus()` even when no modal is open, so once any modal has been opened, every Esc press moves focus back to the last modal opener (and, when the chat is open, the chat handler then moves it to the FAB).
- The chat is a site wide widget. In Next.js mount it once in the root layout so the conversation, the open state and the unread dot survive route changes, like the single page reference. Nothing is stored across reloads except the nudge flag.
- The nudge uses `sessionStorage` key `ct-nudged` = `'1'` and runs its 6000ms timer from script start, not from the end of the preloader; the timer is not paused when the tab is hidden. If a modal or the chat is open at 6s it is skipped without being marked, so it can appear on a later load in the same tab.
- The unread dot is purely visual and resets on reload (no storage).
- The greeting does not set `busy`; a message sent in the first 650ms can appear before the greeting bubble.
- `send` is blocked while a reply is pending, but the input and the send button stay enabled, and the blocked text stays in the input.
- Older chip groups are dimmed (`.ct-chips--used`, opacity .5) but still clickable.
- User messages are only escaped; they never get links or bold.
- `inline()` accepts `#id` links; in the reference the router's global click handler catches them. In the port, route `#` links through the Next.js router.
- At 640px and below the FAB is hidden while the chat is open, so the header X and Esc are the only ways to close it. Under 1024px the "See all projects" and "View certifications" actions close the chat; at 1024px and up they leave it open while the page changes.
- `goTo` waits 2700ms after a cross page jump and 900ms on the same page before running `after` (only the "Send project details" action uses it, to focus `#ct-name`); 60ms with reduced motion.
- The desktop panel height uses `100vh`; the phone panel uses `100dvh`. Keep both as written.
- The chat log has `scroll-behavior:smooth`, which the global reduced motion rule turns to `auto`.
- The "Download CV" action is an absolute `https://faisalhanif.work/imgs/Faisal-CVS.pdf` link with `download` and `target="_blank"`. Cross origin, browsers ignore `download` and open the PDF in a new tab. If the rebuild serves the CV from the same origin (`/imgs/Faisal-CVS.pdf`), `download` starts to work and the behaviour changes.
- The PureBody project card's "Live preview" link is the old site page `https://faisalhanif.work/sass-app.html` (see section 8).
- In `has()`, the `k + '? '` variant can never match, because `norm()` already turned `?` into a space. It is harmless; port it as is so the scores stay identical.
- Intent order decides ties (for example a message that scores the same for `web` and `cloud` returns `web`). Keep `CHAT_INTENTS` in the exact order.
- `norm()` has a literal U+2019 in its first regex (`/[’']s\b/g`). Some formatters or copy steps turn it into a straight quote; that would stop "Faisal’s CV" from being normalised the same way.
- The API reply parser merges every list block into one list and moves any paragraph after the first list into `p2`, so the order of mixed text and lists from an LLM can change. Keep it; the backend should answer in "paragraphs, then one list, then paragraphs" form.
- The chat facts differ from other sections in places (the reference wins, but flag them): "usually replies within 2-4 hours" (contact reply) versus "within 24 hours" (availability reply and the About "Response Time 24h"); "3+ companies" with four roles listed; the testimonials include Sarah Johnson and Emily Rodriguez, which section 13 marks `needsConfirmation`.
- Section 3 of the map says the chat rules "start at L816 and run to about L1551" and that the responsive and reduced motion rules for booking and chat are L1435-1556. In fact L816-818 are only the shared `[hidden]` and error colour lines, the chat rules are L1462-1552, and the reduced motion blocks at L1553-1559 are for the contact hero and map only (booking and chat rely on the global block L357-362 and the JS flag).
- Section 10 calls `#ct-bk-go` the "continue" button; its label is "Book Session".

