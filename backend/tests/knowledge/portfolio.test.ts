import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import portfolioJson from '../../src/knowledge/portfolio.json' with { type: 'json' };
import {
  KNOWLEDGE_PROMPT_MAX_CHARS,
  chatReplyParts,
  chatReplyText,
  findProject,
  knowledgeForPrompt,
  lahoreTime,
  loadKnowledge,
  parseKnowledge,
  projectReplyText,
  renderChatReply,
  siteLinksFor,
} from '../../src/services/knowledge/knowledge.js';
import {
  CHAT_INTENT_IDS,
  TIME_PLACEHOLDER,
  portfolioKnowledgeSchema,
} from '../../src/services/knowledge/types.js';

type KnowledgeData = z.output<typeof portfolioKnowledgeSchema>;

/** U+2014, built from its code point so this file holds no literal em dash. */
const EM_DASH = String.fromCharCode(0x2014);

/** Tuesday 29 September 2026, 15:42 in Lahore (UTC+5). */
const TUESDAY_AFTERNOON = new Date('2026-09-29T10:42:00Z');

/** The 14 projects of the reference (REFERENCE_MAP.md 11.5.11 and 11.7.15), in data order. */
const EXPECTED_PROJECTS: [name: string, live: string, source: string | null][] = [
  ['PureBody', 'https://faisalhanif.work/sass-app.html', null],
  ['UHA International', 'https://uha-international.com/', null],
  ['Fit For Living', 'https://fitforliving.netlify.app/', null],
  ['GitPulse', 'https://gitpulseee.netlify.app/', 'https://github.com/FaisalHanif12/GitPulse-'],
  [
    'Smart Health Care',
    'https://smart-health-care.vercel.app/',
    'https://github.com/FaisalHanif12/Smart-health-Care',
  ],
  [
    'Smart Gallery App',
    'https://smartgallery-display.netlify.app/',
    'https://github.com/FaisalHanif12/SmartGallery',
  ],
  ['Echo AI', 'https://echoaai.netlify.app/', 'https://github.com/FaisalHanif12/Echoai'],
  [
    'Medicine Store App',
    'https://medicaredisplay.netlify.app/',
    'https://github.com/FaisalHanif12/medicine-tracker-',
  ],
  ['Soledeck', 'https://soledeckf.vercel.app/', 'https://github.com/FaisalHanif12/Soledeck'],
  [
    'Financial Fusion',
    'https://financial-fusion.netlify.app/',
    'https://github.com/FaisalHanif12/FinancialFusion',
  ],
  ['YOOM', 'https://faisal-yoom.netlify.app/', 'https://github.com/FaisalHanif12/YOOM'],
  ['Dosnexa', 'https://dosnexa.vercel.app/', 'https://github.com/FaisalHanif12/Dosnexa'],
  [
    'DSA Tracker',
    'https://faisal-dsa-tracker.netlify.app/',
    'https://github.com/FaisalHanif12/DSA-Tracker-',
  ],
  [
    'Live Search Weather',
    'https://weather-faisal.netlify.app/',
    'https://github.com/FaisalHanif12/Live-search-weather',
  ],
];

const EXPECTED_CERTIFICATES: [name: string, issuer: string, year: string][] = [
  ['Claude Code in Action', 'Anthropic', '2026'],
  ['Claude 101', 'Anthropic', '2026'],
  ['Frontend Web Development Professional Certificate', 'Google', '2024'],
  ['React Front-End Developer Professional Certificate', 'Meta', '2024'],
  ['Full Stack Web Development Professional Certificate', 'IBM', '2023'],
  ['AWS Cloud & Data Analytics Professional Certificate', 'AWS', '2023'],
  ['Meta React Native Mobile Development Certificate', 'Meta', '2024'],
];

const EXPECTED_EXPERIENCE: [title: string, company: string, dates: string][] = [
  ['Software Engineer', 'TechXelo', '2024 - 2026'],
  ['Freelance Developer', 'Upwork Platform', '2023 - 2024'],
  ['Outsourcing Engineer', 'UHA International', '2023 - 2024'],
  ['React Native Developer', 'Viral Square', '2022 - 2023'],
];

/** A mutable copy of the valid data, for breaking one thing at a time. */
function validCopy(): KnowledgeData {
  return structuredClone(portfolioKnowledgeSchema.parse(portfolioJson));
}

/** Every string in the value with its dotted path. */
function stringsWithPaths(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      stringsWithPaths(child, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

/** Checks the sharedDecisions 14 shape: paragraphs, then at most one list, blank lines around. */
function expectChatFormat(text: string): void {
  expect(text).not.toMatch(/\n{3,}/);
  expect(text.trim()).toBe(text);
  const blocks = text.split('\n\n');
  const isListLine = (line: string) => line.startsWith('- ');
  let lists = 0;
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.every(isListLine)) {
      lists += 1;
    } else {
      // A paragraph is one line; a block may never mix list lines and text.
      expect(lines).toHaveLength(1);
      expect(isListLine(lines[0] ?? '')).toBe(false);
    }
  }
  expect(lists).toBeLessThanOrEqual(1);
}

describe('portfolio.json schema', () => {
  it('parses with the zod schema', () => {
    const result = portfolioKnowledgeSchema.safeParse(portfolioJson);
    expect(result.success).toBe(true);
  });

  it('loads once, caches the result and deep freezes it', () => {
    const k = loadKnowledge();
    expect(loadKnowledge()).toBe(k);
    expect(Object.isFrozen(k)).toBe(true);
    expect(Object.isFrozen(k.projects)).toBe(true);
    expect(Object.isFrozen(k.projects[0])).toBe(true);
    expect(Object.isFrozen(k.projects[0]?.tags)).toBe(true);
    expect(Object.isFrozen(k.chat.replies.rates.list)).toBe(true);
  });

  it('fails with a clear error when a required fact is missing', () => {
    const data = validCopy();
    data.projects.pop();
    expect(() => parseKnowledge(data)).toThrow(/knowledge base .*portfolio\.json is invalid/);
  });

  it('fails on unknown keys, so a typo in an edit is caught at startup', () => {
    const data = { ...validCopy(), extra: true };
    expect(() => parseKnowledge(data)).toThrow(/invalid/);
  });

  it('fails when an http link or a bad email slips in', () => {
    const insecure = validCopy();
    const first = insecure.projects[0];
    if (first) first.liveUrl = 'http://faisalhanif.work/sass-app.html';
    expect(() => parseKnowledge(insecure)).toThrow(/invalid/);

    const badEmail = validCopy();
    badEmail.person.email = 'not-an-email';
    expect(() => parseKnowledge(badEmail)).toThrow(/invalid/);
  });

  it('fails on duplicate ids', () => {
    const data = validCopy();
    const [a, b] = data.projects;
    if (a && b) b.id = a.id;
    expect(() => parseKnowledge(data)).toThrow(/Duplicate id "purebody"/);
  });

  it('allows the time placeholder only in the location reply', () => {
    const missing = validCopy();
    missing.chat.replies.location.p = ['Faisal is based in **Lahore, Pakistan**.'];
    expect(() => parseKnowledge(missing)).toThrow(/exactly one \{time\}/);

    const extra = validCopy();
    extra.chat.replies.rates.p2 = [`It is ${TIME_PLACEHOLDER} now.`];
    expect(() => parseKnowledge(extra)).toThrow(/Only the location reply/);
  });

  it('fails when a chat reply is missing', () => {
    const data = validCopy();
    const replies: Partial<KnowledgeData['chat']['replies']> = { ...data.chat.replies };
    delete replies.avail;
    expect(() => parseKnowledge({ ...data, chat: { ...data.chat, replies } })).toThrow(/invalid/);
  });

  it('fails when a site link leaves the base URL', () => {
    const data = validCopy();
    data.siteLinks.works = 'https://example.com/works';
    expect(() => parseKnowledge(data)).toThrow(/Must start with the base URL/);
  });
});

describe('portfolio.json key facts', () => {
  const k = loadKnowledge();

  it('holds all 14 projects with their live and source links, in order', () => {
    expect(k.projects.map((p) => [p.name, p.liveUrl, p.sourceUrl])).toEqual(EXPECTED_PROJECTS);
    expect(k.projects.map((p) => p.number)).toEqual(
      Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, '0')),
    );
    for (const p of k.projects) {
      expect(p.description.length).toBeGreaterThan(40);
      expect(p.chatDescription.length).toBeGreaterThan(40);
      expect(p.tags.length).toBeGreaterThan(0);
      expect(p.role).toBeNull();
    }
  });

  it('keeps the Works card descriptions word for word', () => {
    expect(findProject(k, 'GitPulse')?.description).toBe(
      `GitHub activity tracking platform for coding bootcamps ${EM_DASH} role-based dashboards for admins, coordinators, leadership, and learners with cohort management, scoring, and leaderboards.`,
    );
    expect(findProject(k, 'medicine-store-app')?.description).toBe(
      'A comprehensive pet healthcare management system for tracking medications and medical records for animal.',
    );
    expect(findProject(k, 'soledeck')?.chatDescription).toBe(
      'A modern sneaker store with advanced filtering, Stripe payments and inventory management.',
    );
  });

  it('marks the four hero projects as featured and Soledeck as a broken live link', () => {
    expect(k.projects.filter((p) => p.featured).map((p) => p.name)).toEqual([
      'PureBody',
      'UHA International',
      'Fit For Living',
      'GitPulse',
    ]);
    expect(k.projects.filter((p) => p.liveLinkBroken).map((p) => p.name)).toEqual(['Soledeck']);
  });

  it('has the $25/hour plan, both session types and 1 to 10 sessions', () => {
    expect(k.pricing.currency).toBe('USD');
    expect(k.pricing.plan).toMatchObject({ name: 'Professional', rate: 25, unit: 'hour' });
    expect(k.pricing.plan.display).toBe('$25/hour');
    expect(k.pricing.sessions.map((s) => [s.id, s.name, s.minutes, s.price])).toEqual([
      ['quick', 'Quick Chat', 30, 15],
      ['deep', 'Technical Deep Dive', 60, 25],
    ]);
    expect(k.pricing.sessionsPerBooking).toEqual({ min: 1, max: 10 });
    expect(k.pricing.payment.online).toBe(false);
  });

  it('has the booking rules', () => {
    expect(k.booking.workingDays).toEqual([1, 2, 3, 4, 5]);
    expect(k.booking.slotStartHours).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
    expect(k.booking.maxDaysAhead).toBe(60);
    expect(k.booking.platforms.map((p) => p.name)).toEqual(['Google Meet']);
  });

  it('holds all 7 certificates', () => {
    expect(k.certificates.map((c) => [c.name, c.issuer, c.date])).toEqual(EXPECTED_CERTIFICATES);
    for (const c of k.certificates) expect(c.link).toMatch(/^https:\/\//);
  });

  it('holds every experience role and company', () => {
    expect(k.experience.map((e) => [e.title, e.company, e.dates])).toEqual(EXPECTED_EXPERIENCE);
    expect(k.experience.filter((e) => e.current).map((e) => e.company)).toEqual(['TechXelo']);
  });

  it('holds education, skills, languages and core expertise', () => {
    expect(k.education.map((e) => [e.short, e.institution, e.years])).toEqual([
      ['BS-SE', 'University of Management & Technology, Lahore', '2020 - 2024'],
      ['Inter', 'Unique College, Lahore', '2018 - 2020'],
      ['Matric', 'Unique College, Lahore', '2016 - 2018'],
    ]);
    expect(k.skills.flatMap((g) => g.items).find((s) => s.name === 'React.js')?.level).toBe(95);
    expect(k.languages).toEqual([
      { name: 'English', level: 'Professional' },
      { name: 'Urdu', level: 'Native' },
    ]);
    expect(k.coreExpertise).toHaveLength(10);
  });

  it('has the contact details, location and hours', () => {
    expect(k.person.email).toBe('mehrfaisal111@gmail.com');
    expect(k.person.phone).toEqual({ display: '+92 314 8166354', href: 'tel:+923148166354' });
    expect(k.person.location).toBe('Lahore, Pakistan');
    expect(k.person.timezone).toBe('Asia/Karachi');
    expect(k.person.hours.text).toBe('Mon-Fri, 9AM-6PM (GMT+5)');
    expect(k.person.cvUrl).toBe('https://faisalhanif.work/imgs/Faisal-CVS.pdf');
    expect(k.person.responseTimes.map((r) => r.value)).toEqual(['2-4 hours', '24 hours']);
  });

  it('flags the Sarah Johnson and Emily Rodriguez testimonials for confirmation', () => {
    expect(k.testimonials.map((t) => [t.name, t.needsConfirmation])).toEqual([
      ['Sarah Johnson', true],
      ['Amnan Hussain', false],
      ['Emily Rodriguez', true],
    ]);
  });

  it('builds the site links on https://faisalhanif.work', () => {
    expect(k.siteLinks).toEqual({
      base: 'https://faisalhanif.work',
      home: 'https://faisalhanif.work/',
      profile: 'https://faisalhanif.work/profile',
      works: 'https://faisalhanif.work/works',
      approvals: 'https://faisalhanif.work/approvals',
      contact: 'https://faisalhanif.work/contact',
      contactForm: 'https://faisalhanif.work/contact#ct-form',
    });
  });

  it('keeps em dashes only where the reference has them', () => {
    const withDash = stringsWithPaths(portfolioJson)
      .filter(([, value]) => value.includes(EM_DASH))
      .map(([path]) => path);
    expect(withDash).toEqual([
      'projects.0.description',
      'projects.1.description',
      'projects.2.description',
      'projects.3.description',
      'experience.0.description',
    ]);
  });

  it('has the chat greeting, starter chips and a reply for every intent', () => {
    expect(k.chat.greeting).toBe("Hi! I'm Faisal's assistant. How can I help you today?");
    expect(k.chat.starterChips).toEqual([
      'Services',
      'Rates',
      'Projects',
      'Experience',
      'Book a call',
      'Contact',
    ]);
    expect(Object.keys(k.chat.replies)).toEqual([...CHAT_INTENT_IDS]);
  });
});

describe('chat reply rendering', () => {
  const k = loadKnowledge();

  it('renders the rates reply as paragraphs and one list with blank lines around it', () => {
    const text = chatReplyText(k, 'rates', TUESDAY_AFTERNOON);
    expect(text).toBe(
      [
        'Here is how pricing works:',
        '',
        '- **Professional plan** (Full Stack + AI Power): **$25/hour**. Covers AI/LLM integration, frontend, backend API, database, performance, cloud and maintenance.',
        '- **Quick Chat** call: $15 per 30 minute session',
        '- **Technical Deep Dive** call: $25 per 60 minute session',
        '',
        'Need a custom solution? Share your project and he will get back with next steps.',
      ].join('\n'),
    );
    expectChatFormat(text);
  });

  it('renders the projects reply in the same format', () => {
    const text = chatReplyText(k, 'projects', TUESDAY_AFTERNOON);
    expect(
      text.startsWith('Faisal has shipped 10+ projects. A few highlights:\n\n- **PureBody**'),
    ).toBe(true);
    expect(text).toContain(
      '- **YOOM**: video conferencing with WebRTC ([live](https://faisal-yoom.netlify.app/))',
    );
    expect(text.endsWith(')')).toBe(true);
    expectChatFormat(text);
  });

  it('renders every intent in the chat format', () => {
    for (const id of CHAT_INTENT_IDS) {
      const text = chatReplyText(k, id, TUESDAY_AFTERNOON);
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toContain(TIME_PLACEHOLDER);
      expectChatFormat(text);
    }
  });

  it('renders the contact reply with the 2-4 hours wording and the availability reply with 24 hours', () => {
    expect(chatReplyText(k, 'contact', TUESDAY_AFTERNOON)).toBe(
      [
        'Here is how to reach Faisal:',
        '',
        '- Email: [mehrfaisal111@gmail.com](mailto:mehrfaisal111@gmail.com), usually replies within 2-4 hours',
        '- Phone: [+92 314 8166354](tel:+923148166354), Mon-Fri, 9AM-6PM (GMT+5)',
      ].join('\n'),
    );
    expect(chatReplyText(k, 'avail', TUESDAY_AFTERNOON)).toContain('within 24 hours');
  });

  it('fills the Lahore time into the location reply', () => {
    const time = lahoreTime(TUESDAY_AFTERNOON);
    expect(time).toMatch(/^3:42\sPM$/u);
    expect(chatReplyText(k, 'location', TUESDAY_AFTERNOON)).toBe(
      `Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide. It is ${time} there right now.`,
    );
  });

  it('drops the time sentence when the time is unknown, as the reference does', () => {
    expect(chatReplyText(k, 'location', new Date(Number.NaN))).toBe(
      'Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide.',
    );
    expect(chatReplyParts(k, 'location', TUESDAY_AFTERNOON, 'Not/AZone').p).toEqual([
      'Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide.',
    ]);
  });

  it('renders parts with no list as plain paragraphs', () => {
    expect(renderChatReply({ p: ['One.', 'Two.'], list: [], p2: [] })).toBe('One.\n\nTwo.');
    expect(renderChatReply({ p: ['Intro:'], list: ['a', 'b'], p2: [] })).toBe('Intro:\n\n- a\n- b');
  });
});

describe('lahoreTime', () => {
  it('formats the time in 12 hour style for the given zone', () => {
    expect(lahoreTime(new Date('2026-09-28T19:05:00Z'))).toMatch(/^12:05\sAM$/u);
    expect(lahoreTime(TUESDAY_AFTERNOON, 'UTC')).toMatch(/^10:42\sAM$/u);
  });

  it("returns '' when Intl fails", () => {
    expect(lahoreTime(TUESDAY_AFTERNOON, 'Not/AZone')).toBe('');
    expect(lahoreTime(new Date(Number.NaN))).toBe('');
  });
});

describe('project card replies', () => {
  const k = loadKnowledge();

  it('matches the reference example for GitPulse', () => {
    expect(projectReplyText(k, 'GitPulse')).toBe(
      [
        '**GitPulse** (Next.js): GitHub activity tracking platform for coding bootcamps, with role-based dashboards, cohort management, scoring and leaderboards.',
        'Built with Next.js, React, GitHub API, Role-Based Access.',
        '[Live preview](https://gitpulseee.netlify.app/) · [Source](https://github.com/FaisalHanif12/GitPulse-)',
      ].join('\n\n'),
    );
  });

  it('says Closed source for projects without a source link', () => {
    for (const name of ['PureBody', 'UHA International', 'Fit For Living']) {
      expect(projectReplyText(k, name)?.endsWith(' · Closed source')).toBe(true);
    }
  });

  it('finds projects by id or name and returns undefined for unknown ones', () => {
    expect(findProject(k, 'live-search-weather')?.name).toBe('Live Search Weather');
    expect(findProject(k, '  yoom ')?.name).toBe('YOOM');
    expect(projectReplyText(k, 'Nope')).toBeUndefined();
  });
});

describe('knowledgeForPrompt', () => {
  const k = loadKnowledge();

  it('stays under its budget and is deterministic', () => {
    const text = knowledgeForPrompt(k);
    expect(text.length).toBeLessThan(KNOWLEDGE_PROMPT_MAX_CHARS);
    expect(knowledgeForPrompt(k)).toBe(text);
  });

  it('holds the key facts', () => {
    const text = knowledgeForPrompt(k);
    for (const [name, live, source] of EXPECTED_PROJECTS) {
      expect(text).toContain(name);
      expect(text).toContain(live);
      if (source) expect(text).toContain(source);
    }
    for (const [name] of EXPECTED_CERTIFICATES) expect(text).toContain(name);
    for (const [, company] of EXPECTED_EXPERIENCE) expect(text).toContain(company);
    for (const fact of [
      '$25/hour',
      'Quick Chat call: 30 minutes, $15 per session',
      'Technical Deep Dive call: 60 minutes, $25 per session',
      'Sessions per booking: 1 to 10',
      'mehrfaisal111@gmail.com',
      'tel:+923148166354',
      'Lahore, Pakistan',
      'Mon-Fri, 9AM-6PM (GMT+5)',
      'https://faisalhanif.work/imgs/Faisal-CVS.pdf',
      'https://faisalhanif.work/contact#ct-form',
      'Sarah Johnson',
      'Emily Rodriguez',
    ]) {
      expect(text).toContain(fact);
    }
    // The certificates keep the Approvals page order (not sorted), and the header says so.
    expect(text).toContain('CERTIFICATES (7, in Approvals page order)');
    expect(text).not.toContain('newest first');
    // Booking: each step ends with a period, and the two ways to open the form read as one sentence.
    expect(text).toContain('then press "Book Session". 2. Details:');
    expect(text).toContain('then press "Complete Booking".\n');
    expect(text).toContain('; or the chat actions "Book a call"');
  });
});

describe('siteLinksFor', () => {
  const k = loadKnowledge();

  it('keeps the stored links for the default site URL or bad input', () => {
    expect(siteLinksFor(k)).toBe(k.siteLinks);
    expect(siteLinksFor(k, 'https://faisalhanif.work/')).toBe(k.siteLinks);
    expect(siteLinksFor(k, 'not a url')).toBe(k.siteLinks);
    expect(siteLinksFor(k, 'ftp://example.com')).toBe(k.siteLinks);
  });

  it('rebases every page link on another site URL', () => {
    expect(siteLinksFor(k, 'http://localhost:3000/')).toEqual({
      base: 'http://localhost:3000',
      home: 'http://localhost:3000/',
      profile: 'http://localhost:3000/profile',
      works: 'http://localhost:3000/works',
      approvals: 'http://localhost:3000/approvals',
      contact: 'http://localhost:3000/contact',
      contactForm: 'http://localhost:3000/contact#ct-form',
    });
  });
});
