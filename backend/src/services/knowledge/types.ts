import { z } from 'zod';

/**
 * Shape of src/knowledge/portfolio.json: the facts the chat answers from. Every string in that
 * file is copied from the reference design through REFERENCE_MAP.md, so the schema checks shape
 * and integrity only; it never rewrites text (no trimming or other transforms).
 */

/** Intent ids of the reference chat knowledge (CHAT_KB, reference L6213-6286), in its order. */
export const CHAT_INTENT_IDS = [
  'greet',
  'thanks',
  'services',
  'web',
  'mobile',
  'ai',
  'cloud',
  'rates',
  'book',
  'projects',
  'experience',
  'education',
  'skills',
  'certs',
  'contact',
  'location',
  'avail',
  'cv',
  'reviews',
  'about',
  'social',
  'fallback',
] as const;

/** Action button keys of the reference chat (CHAT_ACTIONS, reference L6202-6212). */
export const CHAT_ACTION_KEYS = [
  'book',
  'quick',
  'deep',
  'form',
  'works',
  'certs',
  'cv',
  'mail',
  'map',
] as const;

/** Placeholder in the location reply, filled with the current Lahore time. */
export const TIME_PLACEHOLDER = '{time}';

/** The one intent whose reply carries TIME_PLACEHOLDER. */
export const TIME_INTENT = 'location';

export const chatIntentIdSchema = z.enum(CHAT_INTENT_IDS);
export const chatActionKeySchema = z.enum(CHAT_ACTION_KEYS);

const text = z.string().min(1);
const textList = z.array(text).min(1);
const httpsUrl = z.url({ protocol: /^https$/ });
const year = z.string().regex(/^\d{4}$/);
const yearRange = z.string().regex(/^\d{4} - \d{4}$/);
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const weekday = z.number().int().min(0).max(6);

const metaSchema = z.strictObject({
  schemaVersion: z.literal(1),
  source: z.literal('reference-design/faisalhanif-redesign.html'),
  /** REFERENCE_MAP.md sections the data was copied from. */
  referenceMapSections: textList,
  /** Places where the reference states a fact in two ways; both are kept on purpose. */
  knownDifferences: textList,
});

const responseTimeSchema = z.strictObject({
  value: text,
  /** Each place the reference states this response time, with its exact wording. */
  mentions: z.array(z.strictObject({ where: text, text })).min(1),
});

const personSchema = z.strictObject({
  name: text,
  role: text,
  /** The rolling roles of the About hero. */
  roles: textList,
  summary: text,
  location: z.literal('Lahore, Pakistan'),
  city: text,
  country: text,
  timezone: z.literal('Asia/Karachi'),
  timezoneLabel: z.literal('GMT+5'),
  timezoneAbbr: z.literal('PKT'),
  coordinates: text,
  email: z.email(),
  phone: z.strictObject({ display: text, href: z.string().regex(/^tel:\+\d{7,15}$/) }),
  cvUrl: httpsUrl,
  mapUrl: httpsUrl,
  hours: z.strictObject({
    text,
    days: text,
    workingDays: z.array(weekday).min(1),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  availability: textList,
  responseTimes: z.array(responseTimeSchema).min(1),
});

const socialSchema = z.strictObject({
  id: z.enum(['linkedin', 'x', 'github', 'quora', 'instagram']),
  label: text,
  url: httpsUrl,
});

const statGroupSchema = z.strictObject({
  page: z.enum(['about', 'profile', 'works', 'approvals', 'contact']),
  where: text,
  items: z.array(z.strictObject({ label: text, value: text })).min(1),
});

const serviceSchema = z.strictObject({
  id: slug,
  number: z.string().regex(/^\d{2}$/),
  kicker: text,
  title: text,
  description: text,
  features: textList,
  stack: textList,
});

const sessionSchema = z.strictObject({
  id: z.enum(['quick', 'deep']),
  name: text,
  minutes: z.number().int().positive(),
  durationLabel: text,
  price: z.number().positive(),
  description: text,
  features: textList,
});

const pricingSchema = z.strictObject({
  currency: z.literal('USD'),
  plan: z.strictObject({
    name: text,
    kicker: text,
    rate: z.number().positive(),
    unit: z.literal('hour'),
    display: text,
    covers: textList,
  }),
  customNote: text,
  sessions: z.array(sessionSchema).length(2),
  sessionsPerBooking: z.strictObject({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  payment: z.strictObject({ online: z.boolean(), note: text }),
});

const bookingSchema = z.strictObject({
  days: text,
  workingDays: z.array(weekday).min(1),
  timezone: z.literal('Asia/Karachi'),
  slotStartHours: z.array(z.number().int().min(0).max(23)).min(1),
  slotsSummary: text,
  window: text,
  maxDaysAhead: z.number().int().positive(),
  minNoticeHours: z.number().int().nonnegative(),
  platforms: z.array(z.strictObject({ name: z.enum(['Google Meet', 'Zoom']), note: text })).min(1),
  howToOpen: textList,
  steps: textList,
  expect: z.array(z.strictObject({ title: text, text })).min(1),
  afterBooking: textList,
});

const projectSchema = z.strictObject({
  id: slug,
  /** Card number on the Works page, in data order ("01" to "14"). */
  number: z.string().regex(/^\d{2}$/),
  name: text,
  category: text,
  /** Card badge on the Works page. */
  badge: z.enum(['latest', 'featured', 'live']),
  /** One of the four devices of the Works hero ("the studio wall"). */
  featured: z.boolean(),
  /** Works card description, word for word (keeps the reference em dashes). */
  description: text,
  /** Short description from the chat knowledge, word for word. */
  chatDescription: text,
  /** Works card tag list. */
  tags: textList,
  /** Tag line of the chat knowledge, as one string. */
  chatTags: text,
  /** Faisal's role on the project; null because the reference never states one. */
  role: text.nullable(),
  liveUrl: httpsUrl,
  /** GitHub link, or null for "Closed source". */
  sourceUrl: httpsUrl.nullable(),
  /** The live link returns 404 (owner note); it is kept exactly as the reference has it. */
  liveLinkBroken: z.boolean(),
  /** Lower case keywords the reference chat matches for this project. */
  chatKeywords: textList,
});

const experienceSchema = z.strictObject({
  id: slug,
  title: text,
  company: text,
  from: year,
  to: year,
  dates: yearRange,
  current: z.boolean(),
  status: z.enum(['current', 'closed']).nullable(),
  /** The role paragraph of the Profile page, word for word. The reference has no bullet lists. */
  description: text,
  tags: textList,
});

const educationSchema = z.strictObject({
  id: slug,
  level: text,
  title: text,
  short: text,
  institution: text,
  years: yearRange,
  description: text,
  tags: textList,
});

const skillGroupSchema = z.strictObject({
  group: text,
  items: z.array(z.strictObject({ name: text, level: z.number().int().min(0).max(100) })).min(1),
});

const certificateSchema = z.strictObject({
  id: slug,
  name: text,
  issuer: z.enum(['Anthropic', 'Google', 'Meta', 'IBM', 'AWS']),
  type: text,
  /** Year only; the reference has no month or day. */
  date: year,
  /** Issuer verify page. */
  link: httpsUrl,
  area: z.enum(['AI', 'Frontend', 'Backend', 'Cloud', 'Mobile']),
  tags: textList,
  description: text,
});

const testimonialSchema = z.strictObject({
  name: text,
  role: text,
  quote: text,
  /** The shorter quote the chat reviews reply uses. */
  chatQuote: text,
  tags: textList,
  /** Reads like template text; the owner must confirm it before launch. */
  needsConfirmation: z.boolean(),
});

export const chatReplySchema = z.strictObject({
  /** Paragraphs before the list. */
  p: textList,
  /** List items, without the "- " marker. Empty when the reply has no list. */
  list: z.array(text),
  /** Paragraphs after the list. */
  p2: z.array(text),
});

const chatActionSchema = z.strictObject({
  label: text,
  href: z
    .string()
    .regex(/^(https:\/\/|mailto:|tel:)/)
    .optional(),
});

const chatSchema = z.strictObject({
  greeting: text,
  starterChips: textList,
  /** Every reply of the reference chat knowledge, resolved to plain strings. */
  replies: z.record(chatIntentIdSchema, chatReplySchema),
  actions: z.record(chatActionKeySchema, chatActionSchema),
  /** Pieces of the project card reply (reference projectReply, L6287-6290). */
  projectCard: z.strictObject({
    builtWithPrefix: text,
    livePreviewLabel: text,
    sourceLabel: text,
    closedSourceText: text,
    separator: text,
  }),
});

const siteLinksSchema = z.strictObject({
  base: httpsUrl,
  home: httpsUrl,
  profile: httpsUrl,
  works: httpsUrl,
  approvals: httpsUrl,
  contact: httpsUrl,
  contactForm: httpsUrl,
});

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

export const portfolioKnowledgeSchema = z
  .strictObject({
    meta: metaSchema,
    person: personSchema,
    socials: z.array(socialSchema).min(1),
    stats: z.array(statGroupSchema).min(1),
    services: z.strictObject({ lead: text, areas: z.array(serviceSchema).length(4) }),
    pricing: pricingSchema,
    booking: bookingSchema,
    projects: z.array(projectSchema).length(14),
    experience: z.array(experienceSchema).min(1),
    education: z.array(educationSchema).min(1),
    skills: z.array(skillGroupSchema).min(1),
    languages: z.array(z.strictObject({ name: text, level: text })).min(1),
    coreExpertise: textList,
    certificates: z.array(certificateSchema).length(7),
    testimonials: z.array(testimonialSchema).min(1),
    chat: chatSchema,
    siteLinks: siteLinksSchema,
  })
  .superRefine((k, ctx) => {
    const unique: [string, readonly string[]][] = [
      ['projects', k.projects.map((p) => p.id)],
      ['experience', k.experience.map((e) => e.id)],
      ['education', k.education.map((e) => e.id)],
      ['certificates', k.certificates.map((c) => c.id)],
      ['pricing.sessions', k.pricing.sessions.map((s) => s.id)],
    ];
    for (const [path, ids] of unique) {
      for (const id of duplicates(ids)) {
        ctx.addIssue({ code: 'custom', path: [path], message: `Duplicate id "${id}".` });
      }
    }

    const { min, max } = k.pricing.sessionsPerBooking;
    if (min > max) {
      ctx.addIssue({
        code: 'custom',
        path: ['pricing', 'sessionsPerBooking'],
        message: 'min must not be above max.',
      });
    }

    for (const id of CHAT_INTENT_IDS) {
      const reply = k.chat.replies[id];
      const count = [...reply.p, ...reply.list, ...reply.p2]
        .join('\n')
        .split(TIME_PLACEHOLDER).length;
      const expected = id === TIME_INTENT ? 2 : 1;
      if (count !== expected) {
        ctx.addIssue({
          code: 'custom',
          path: ['chat', 'replies', id],
          message:
            id === TIME_INTENT
              ? `The ${TIME_INTENT} reply needs exactly one ${TIME_PLACEHOLDER} placeholder.`
              : `Only the ${TIME_INTENT} reply may use ${TIME_PLACEHOLDER}.`,
        });
      }
    }

    const { base, ...pages } = k.siteLinks;
    for (const [name, url] of Object.entries(pages)) {
      if (url !== base && !url.startsWith(`${base}/`)) {
        ctx.addIssue({
          code: 'custom',
          path: ['siteLinks', name],
          message: `Must start with the base URL ${base}.`,
        });
      }
    }
  });

/** Makes every nested property and array read only (the loaded knowledge is deep frozen). */
export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

export type PortfolioKnowledgeInput = z.input<typeof portfolioKnowledgeSchema>;
export type PortfolioKnowledge = DeepReadonly<z.output<typeof portfolioKnowledgeSchema>>;

export type ChatIntentId = z.infer<typeof chatIntentIdSchema>;
export type ChatActionKey = z.infer<typeof chatActionKeySchema>;
export type ChatReplyParts = DeepReadonly<z.output<typeof chatReplySchema>>;
export type KnowledgeProject = PortfolioKnowledge['projects'][number];
export type KnowledgeSession = PortfolioKnowledge['pricing']['sessions'][number];
export type KnowledgeSiteLinks = PortfolioKnowledge['siteLinks'];
