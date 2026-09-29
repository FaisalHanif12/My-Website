import { z } from 'zod';
import portfolioJson from '../../knowledge/portfolio.json' with { type: 'json' };
import {
  TIME_PLACEHOLDER,
  portfolioKnowledgeSchema,
  type ChatIntentId,
  type ChatReplyParts,
  type DeepReadonly,
  type KnowledgeProject,
  type KnowledgeSiteLinks,
  type PortfolioKnowledge,
} from './types.js';

/** Faisal's home time zone; callers pass env.BOOKING_TIMEZONE, which defaults to it. */
export const DEFAULT_TIME_ZONE = 'Asia/Karachi';

const KNOWLEDGE_FILE = 'src/knowledge/portfolio.json';

function deepFreeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value as DeepReadonly<T>;
}

/**
 * Validates knowledge data with the zod schema and returns it deep frozen. Throws an Error that
 * lists every problem, so a broken edit of portfolio.json stops the server at startup.
 */
export function parseKnowledge(input: unknown): PortfolioKnowledge {
  const result = portfolioKnowledgeSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `The knowledge base ${KNOWLEDGE_FILE} is invalid:\n${z.prettifyError(result.error)}`,
    );
  }
  return deepFreeze(result.data);
}

let cached: PortfolioKnowledge | undefined;

/** Loads, validates and freezes portfolio.json once; later calls return the same object. */
export function loadKnowledge(): PortfolioKnowledge {
  cached ??= parseKnowledge(portfolioJson);
  return cached;
}

/**
 * Current time in Lahore as the reference chat shows it (L6213), for example "3:42 PM".
 * Returns '' when Intl fails (for example an unknown time zone or an invalid date).
 */
export function lahoreTime(now: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h12',
    }).format(now);
  } catch {
    return '';
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The sentence that holds the time placeholder, with the space before it. */
const TIME_SENTENCE_RE = new RegExp(
  `\\s*[^.!?]*${escapeRegExp(TIME_PLACEHOLDER)}[^.!?]*[.!?]?`,
  'g',
);

/**
 * Fills the time placeholder. With no time the whole sentence is dropped, as the reference does
 * (`t ? ' It is ' + t + ' there right now.' : ''`).
 */
function fillTime(value: string, time: string): string {
  if (!value.includes(TIME_PLACEHOLDER)) return value;
  return time ? value.split(TIME_PLACEHOLDER).join(time) : value.replace(TIME_SENTENCE_RE, '');
}

/**
 * Renders reply parts in the chat format of sharedDecisions 14: paragraphs separated by one blank
 * line, then at most one list ("- " lines) with a blank line before and after it, then the
 * closing paragraphs.
 */
export function renderChatReply(parts: ChatReplyParts): string {
  const blocks: string[] = [...parts.p];
  if (parts.list.length > 0) blocks.push(parts.list.map((item) => `- ${item}`).join('\n'));
  blocks.push(...parts.p2);
  return blocks.join('\n\n');
}

/** The reference reply for an intent with the Lahore time filled in. */
export function chatReplyParts(
  k: PortfolioKnowledge,
  intentId: ChatIntentId,
  now: Date,
  timeZone: string = DEFAULT_TIME_ZONE,
): ChatReplyParts {
  const reply = k.chat.replies[intentId];
  const time = lahoreTime(now, timeZone);
  const fill = (items: readonly string[]) => items.map((item) => fillTime(item, time));
  return { p: fill(reply.p), list: fill(reply.list), p2: fill(reply.p2) };
}

/** The reference reply for an intent as chat text (sharedDecisions 14 format). */
export function chatReplyText(
  k: PortfolioKnowledge,
  intentId: ChatIntentId,
  now: Date,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  return renderChatReply(chatReplyParts(k, intentId, now, timeZone));
}

/** Finds a project by id ("gitpulse") or by name, ignoring case ("GitPulse"). */
export function findProject(k: PortfolioKnowledge, idOrName: string): KnowledgeProject | undefined {
  const wanted = idOrName.trim().toLowerCase();
  return k.projects.find((p) => p.id === wanted || p.name.toLowerCase() === wanted);
}

/** The reference project card reply (projectReply, L6287-6290). */
export function projectReplyParts(
  k: PortfolioKnowledge,
  project: KnowledgeProject,
): ChatReplyParts {
  const card = k.chat.projectCard;
  const live = `[${card.livePreviewLabel}](${project.liveUrl})`;
  const source = project.sourceUrl
    ? `${card.separator}[${card.sourceLabel}](${project.sourceUrl})`
    : `${card.separator}${card.closedSourceText}`;
  return {
    p: [
      `**${project.name}** (${project.category}): ${project.chatDescription}`,
      `${card.builtWithPrefix}${project.chatTags}.`,
      live + source,
    ],
    list: [],
    p2: [],
  };
}

/** The project card reply as chat text, or undefined when no project matches. */
export function projectReplyText(k: PortfolioKnowledge, idOrName: string): string | undefined {
  const project = findProject(k, idOrName);
  return project ? renderChatReply(projectReplyParts(k, project)) : undefined;
}

/**
 * Site links on another base URL (for example a staging SITE_URL). Returns the stored links when
 * siteUrl is missing, equal to the stored base, or not an http(s) URL.
 */
export function siteLinksFor(k: PortfolioKnowledge, siteUrl?: string): KnowledgeSiteLinks {
  const links = k.siteLinks;
  if (!siteUrl) return links;
  let base: string;
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return links;
    base = `${url.origin}${url.pathname}`.replace(/\/+$/, '');
  } catch {
    return links;
  }
  if (base === links.base) return links;
  const rebase = (value: string) => base + value.slice(links.base.length);
  return {
    base,
    home: rebase(links.home),
    profile: rebase(links.profile),
    works: rebase(links.works),
    approvals: rebase(links.approvals),
    contact: rebase(links.contact),
    contactForm: rebase(links.contactForm),
  };
}

/* ---------- knowledge block for the system prompt ---------- */

/** knowledgeForPrompt stays under this many characters (checked by the tests). */
export const KNOWLEDGE_PROMPT_MAX_CHARS = 20_000;

const list = (items: readonly string[]) => items.join(', ');

function section(title: string, lines: readonly string[]): string {
  return [`[${title}]`, ...lines].join('\n');
}

function personSection(k: PortfolioKnowledge): string {
  const p = k.person;
  const lines = [
    `Name: ${p.name}`,
    `Role: ${p.role} (${list(p.roles)})`,
    `Summary: ${p.summary}`,
    `Location: ${p.location} (time zone ${p.timezone}, ${p.timezoneLabel}, ${p.timezoneAbbr}); works with clients worldwide. Map: ${p.mapUrl}`,
    `Email: ${p.email} (link: mailto:${p.email})`,
    `Phone: ${p.phone.display} (link: ${p.phone.href})`,
    `Working hours: ${p.hours.text}, that is ${p.hours.days}, ${p.hours.start} to ${p.hours.end} ${p.timezoneAbbr}`,
    `Status: ${p.availability.join('; ')}`,
    ...p.responseTimes.map(
      (r) =>
        `Response time "${r.value}": ` +
        r.mentions.map((m) => `${m.where}: "${m.text}"`).join('; '),
    ),
    `CV (PDF): ${p.cvUrl}`,
  ];
  return section('PERSON', lines);
}

function socialsSection(k: PortfolioKnowledge): string {
  return section(
    'SOCIAL PROFILES',
    k.socials.map((s) => `- ${s.label}: ${s.url}`),
  );
}

function statsSection(k: PortfolioKnowledge): string {
  return section(
    'SITE STATS (as shown on the site)',
    k.stats.map((g) => `- ${g.where}: ${g.items.map((i) => `${i.label} ${i.value}`).join('; ')}`),
  );
}

function servicesSection(k: PortfolioKnowledge): string {
  return section('SERVICES', [
    `Site intro (in Faisal's voice): "${k.services.lead}"`,
    ...k.services.areas.map(
      (a) =>
        `- ${a.title} (${a.kicker}): ${a.description} Features: ${list(a.features)}. Stack: ${list(a.stack)}.`,
    ),
  ]);
}

function pricingSection(k: PortfolioKnowledge): string {
  const { plan, sessions, sessionsPerBooking, currency, customNote, payment } = k.pricing;
  return section(`PRICING (${currency})`, [
    `- ${plan.name} plan (${plan.kicker}): ${plan.display}. Covers: ${list(plan.covers)}.`,
    ...sessions.map(
      (s) =>
        `- ${s.name} call: ${s.durationLabel}, $${s.price} per session. ${s.description}. Covers: ${list(s.features)}.`,
    ),
    `- Sessions per booking: ${sessionsPerBooking.min} to ${sessionsPerBooking.max}. Total = price per session x number of sessions.`,
    `- Custom work: ${customNote}`,
    `- Payment: ${payment.note}`,
  ]);
}

function bookingSection(k: PortfolioKnowledge): string {
  const b = k.booking;
  return section('BOOKING A CALL', [
    `- Days: ${b.days} (${b.timezone})`,
    `- Times: ${b.slotsSummary}`,
    `- Dates: ${b.window}`,
    `- Notice: a slot must start at least ${b.minNoticeHours} hours from now.`,
    `- Platforms: ${b.platforms.map((pl) => `${pl.name} (${pl.note})`).join(', ')}`,
    `- How to open the booking form: ${b.howToOpen.join('; or ')}.`,
    `- Steps: ${b.steps.map((s, i) => `${i + 1}. ${s}.`).join(' ')}`,
    `- What to expect: ${b.expect.map((e) => `${e.title}: ${e.text}`).join('; ')}.`,
    `- After booking: ${b.afterBooking.join(' ')}`,
  ]);
}

function projectLines(p: KnowledgeProject): string {
  const flags = [p.category];
  if (p.badge !== 'live') flags.push(`badge ${p.badge}`);
  if (p.featured) flags.push('featured on the Works page hero');
  // The Works card description holds the most detail; the shorter chat description stays in
  // portfolio.json (and in the project card reply) to keep this block within its budget.
  const lines = [
    `${p.number}. ${p.name} (${flags.join(', ')})`,
    `  ${p.description}`,
    `  Stack: ${list(p.tags)}`,
  ];
  if (p.role) lines.push(`  Role: ${p.role}`);
  lines.push(`  Live: ${p.liveUrl} | Source: ${p.sourceUrl ?? 'Closed source'}`);
  return lines.join('\n');
}

function projectsSection(k: PortfolioKnowledge): string {
  return section(
    `PROJECTS (${k.projects.length}, in Works page order)`,
    k.projects.map(projectLines),
  );
}

function experienceSection(k: PortfolioKnowledge): string {
  return section(
    'EXPERIENCE',
    k.experience.map((e) => {
      const status = e.current ? ', current' : '';
      return `- ${e.title}, ${e.company} (${e.dates}${status}): ${e.description} Tags: ${list(e.tags)}.`;
    }),
  );
}

function educationSection(k: PortfolioKnowledge): string {
  return section(
    'EDUCATION',
    k.education.map(
      (e) =>
        `- ${e.title} (${e.short}), ${e.institution}, ${e.years}. Level: ${e.level}. ${e.description}`,
    ),
  );
}

function skillsSection(k: PortfolioKnowledge): string {
  return section('SKILLS (proficiency as shown on the Profile page)', [
    ...k.skills.map(
      (g) => `- ${g.group}: ${g.items.map((i) => `${i.name} ${i.level}%`).join(', ')}`,
    ),
    `- Spoken languages: ${k.languages.map((l) => `${l.name} (${l.level})`).join(', ')}`,
    `- Core expertise: ${list(k.coreExpertise)}`,
  ]);
}

function certificatesSection(k: PortfolioKnowledge): string {
  return section(
    `CERTIFICATES (${k.certificates.length}, in Approvals page order)`,
    k.certificates.map(
      (c) =>
        `- ${c.name}, ${c.issuer}, ${c.date} (${c.type}, ${c.area}). Topics: ${list(c.tags)}. Verify: ${c.link}`,
    ),
  );
}

function testimonialsSection(k: PortfolioKnowledge): string {
  return section(
    'TESTIMONIALS',
    k.testimonials.map((t) => `- ${t.name}, ${t.role}: "${t.quote}"`),
  );
}

function siteLinksSection(links: KnowledgeSiteLinks): string {
  return section('SITE LINKS', [
    `- Home and About: ${links.home}`,
    `- Profile (experience, education, skills): ${links.profile}`,
    `- Works (all projects): ${links.works}`,
    `- Approvals (certificates): ${links.approvals}`,
    `- Contact page: ${links.contact}`,
    `- Contact form: ${links.contactForm}`,
  ]);
}

/**
 * Reference answers quoted in the prompt as examples of tone and format. The other intents only
 * repeat facts that the sections above already hold.
 */
export const PROMPT_REFERENCE_INTENTS = [
  'services',
  'rates',
  'book',
  'projects',
  'contact',
  'avail',
  'fallback',
] as const satisfies readonly ChatIntentId[];

function referenceAnswersSection(k: PortfolioKnowledge): string {
  // An invalid date makes lahoreTime return '', which drops the time sentence (no clock here).
  const noTime = new Date(Number.NaN);
  const answers = PROMPT_REFERENCE_INTENTS.map(
    (id) => `Topic "${id}":\n${chatReplyText(k, id, noTime)}`,
  );
  return section("REFERENCE ANSWERS (the site's own short answers, by topic)", [
    answers.join('\n\n'),
  ]);
}

/**
 * The knowledge base as compact plain text for the system prompt, grouped by section. It is a
 * pure function of its input, so the prompt is identical for the same knowledge.
 */
export function knowledgeForPrompt(
  k: PortfolioKnowledge,
  siteLinks: KnowledgeSiteLinks = k.siteLinks,
): string {
  return [
    personSection(k),
    socialsSection(k),
    statsSection(k),
    servicesSection(k),
    pricingSection(k),
    bookingSection(k),
    projectsSection(k),
    experienceSection(k),
    educationSection(k),
    skillsSection(k),
    certificatesSection(k),
    testimonialsSection(k),
    siteLinksSection(siteLinks),
    referenceAnswersSection(k),
    section('KNOWN DIFFERENCES (both are correct as the site states them)', [
      ...k.meta.knownDifferences.map((d) => `- ${d}`),
    ]),
  ].join('\n\n');
}
