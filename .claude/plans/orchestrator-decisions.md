# Orchestrator decisions (binding for leads and workers)

These answer the questions the reference map readers raised. They apply the rule in CLAUDE.md: the reference always wins.

## The rule for reference quirks
1. Anything a visitor can SEE or READ copies the reference exactly, including its quirks. Examples: hard coded numbers and captions, response time texts that disagree, a hover lift that never shows, a stagger that has no effect, a flash that never plays, a shadow that is clipped while animating.
2. A fix is allowed only when it changes nothing a visitor can see in the reference's normal states, AND either QA_CHECKLIST.md needs it (keyboard, focus, aria, zero console errors, performance) or it removes a clear bug (timers that leak, loops that never stop, a wrong state after a resize).
3. When unsure, copy the reference and list the point in your report.

## Decided
- Modals (booking, PureBody) and the chat panel: add a focus trap and return focus to the opener on close (QA needs it; invisible). After a chat "Book" action, focus returns to the chat button when the booking modal closes.
- Theme toggle: add `aria-pressed` (or an accessible name that states the current theme). Nothing visible changes.
- Boot script also sets `meta[name=theme-color]` for a dark first visit (browser chrome only).
- Rail indicator: re-measure when the rail becomes visible or the window is resized (fixes the wrong item after widening from phone width; the reference's normal states look the same).
- Esc restores focus only when a modal actually closed.
- Cancel count-up, ring and typing timers and stop idle rAF loops (cursor glow, globe) when a page is left or the loop has settled. The pixels stay identical.
- Clocks use `hourCycle: 'h23'` everywhere (fixes a possible "24:00:00").
- A page click during a running curtain is dropped without changing the URL.
- Reduced motion, `(pointer:fine)` and hover capability are read the same way the reference reads them (once at start). Keep the reference's reduced motion behaviour exactly, including where it still moves (the globe turns with scroll, the PureBody videos autoplay, the Approvals hero keeps its step delays).
- Page revisits: match the reference. Sections already revealed stay revealed when the visitor comes back to a page (keep the revealed set in a client store that survives route changes), and the CSS animations the reference replays on page show still replay.
- Back and Forward: try the full curtain (cover, hold, reveal) on `popstate`. If that is not robust with the App Router, use the fallback (the curtain appears covering, holds 140ms, reveals 640ms) and say so in the report.
- Scroll on route change: jump to the top instantly like the reference's `jumpTop` (Next.js 16 needs `data-scroll-behavior="smooth"` on `<html>` or a manual jump).
- Fonts: next/font with explicit weights. Plus Jakarta Sans 400, 500, 600, 700, 800 (the CSS also asks for 650 and 750, which the browser draws with the nearest faces, same as the reference). JetBrains Mono 400, 500. Instrument Serif italic 400; the normal face is loaded by the reference but never shown, so it is dropped (invisible, faster). tokens.css builds `--font-sans`, `--font-serif` and `--font-mono` from the next/font variables. The `ab-ic-aws` symbol gets `font-family: var(--font-sans)` so its text keeps the same face.
- Motion may animate what the reference animates (transform, opacity, filter, clip-path, border-radius, background-size, the `translate` property and CSS variables). Do not limit it to transform and opacity.
- The CV is served from the same origin (`/imgs/Faisal-CVS.pdf`) everywhere, including the chat's Download CV action, so `download` works.
- The PureBody "Open full page" link keeps the absolute URL `https://faisalhanif.work/sass-app.html` (the new site serves that file).
- Mailto flows stay for when `NEXT_PUBLIC_API_URL` is not set (API_CONTRACT.md). When the API is set and fails, show only the reference failure toast.
- Footer year: rendered on the server and updated on the client after mount, like the reference's runtime update.
- The backend rejects slots already busy on the owner's calendar (BACKEND_SPEC.md). The modal leaves them out of the list.
- Old hash links: `/#about` goes to `/`, and `/#profile`, `/#works`, `/#approvals`, `/#contact` go to their routes. Any other old anchor id redirects to the route of the page that holds that id, then scrolls to it.

## Content kept as the reference has it (the owner may change these later; list them in the final report)
- Testimonials from Sarah Johnson (TechCorp) and Emily Rodriguez (AppSolutions): shipped, marked `needsConfirmation: true`, also in the chat knowledge.
- Soledeck live link (returns 404): kept with its Live badge and link, flagged.
- Hero stats, captions and counters exactly as the current reference shows them (for example the " / 03" testimonial counter). Filter label "Sass App". Response times "2-4 hours" and "24 hours". Project descriptions word for word.
- No WhatsApp on the contact page (the reference has none).
