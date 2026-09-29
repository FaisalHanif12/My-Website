/**
 * Chat widget content: the widget copy, the greeting and start chips, the 14 project cards, the
 * action buttons, every canned reply (with the **bold** and [label](url) markup the renderer
 * understands) and the intent keyword table the local answer engine scores.
 *
 * Pure data (no React, no DOM, no browser APIs). It also seeds the backend knowledge base
 * (backend/src/knowledge/portfolio.json), so imports stay relative (no @/ alias). The engine code
 * (norm, has, localReply) lives in the chat feature; only its tables are here.
 * Source of truth: reference-design/faisalhanif-redesign.html, markup L4468-4491 and the script
 * L6178-6330. REFERENCE_MAP.md 11.7.15 and 11.7.16.
 *
 * Kept as the reference has it (orchestrator-decisions.md): the contact reply says "usually replies
 * within 2-4 hours" while the availability reply says "within 24 hours"; the reviews include Sarah
 * Johnson and Emily Rodriguez (needsConfirmation: true).
 */
import { CONTACT_EMAIL, CONTACT_PHONE, LAHORE_MAP_URL } from './contact';
import { site } from './site';

/* ---------- facts (L5184, L6182-6183) ---------- */

export const CHAT_EMAIL: string = CONTACT_EMAIL;

/**
 * The CV link of the "Download CV" action: '/imgs/Faisal-CVS.pdf'.
 * Deviation (orchestrator decision): the reference builds the absolute URL
 * https://faisalhanif.work/imgs/Faisal-CVS.pdf (FH.asset with FH_BASE, L6182); the rebuild serves
 * the CV from the same origin so `download` works.
 */
export const CHAT_CV_URL: string = site.cvPath;

/** First bot message (L6423). */
export const CHAT_GREETING = "Hi! I'm Faisal's assistant. How can I help you today?";

/** Start chips (START, L6183): shown with the greeting and the greet reply. */
export const CHAT_START_CHIPS: string[] = [
  'Services',
  'Rates',
  'Projects',
  'Experience',
  'Book a call',
  'Contact',
];

/* ---------- widget copy (markup L4468-4491, script L6346-6466) ---------- */

export const CHAT_UI = {
  /** Bubble next to the button. */
  nudge: 'Ask me anything',
  /** Button aria-label while closed (markup and close(), L6466). */
  fabOpenLabel: "Open chat with Faisal's Assistant",
  /** Button aria-label while open (L6457). */
  fabCloseLabel: 'Close chat',
  /** Avatar monogram. */
  avatar: site.initials,
  title: "Faisal's Assistant",
  status: 'Online now',
  /** Header close button aria-label. */
  closeLabel: 'Close chat',
  /** role="log" aria-label. */
  logLabel: 'Chat messages',
  /** Day divider above the greeting (L6420). */
  day: 'Today',
  /** sr-only label of the input. */
  inputLabel: 'Your message',
  placeholder: 'Type your message...',
  /** Input maxlength. */
  maxLength: 500,
  sendLabel: 'Send message',
  /** sr-only prefixes inside the bubbles (L6346, L6351). */
  srYou: 'You: ',
  srAssistant: 'Assistant: ',
  /** aria-label of the chip group (L6365). */
  chipsLabel: 'Suggested questions',
} as const;

/* ---------- projects (PROJECTS, L6186-6201) ---------- */

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

/** Array order is the match order (the first project with a keyword hit wins). */
export const CHAT_PROJECTS: ChatProject[] = [
  {
    k: ['purebody', 'pure body'],
    name: 'PureBody',
    cat: 'SaaS App',
    d: 'Live SaaS app on Android and the App Store. A complete AI system powering personalized diet plans, smart workout tracking and an AI coach that adapts to every user.',
    live: 'https://faisalhanif.work/sass-app.html',
    tags: 'React Native, Node.js, MongoDB, Push Notifications, LLM API',
  },
  {
    k: ['uha', 'uha international'],
    name: 'UHA International',
    cat: 'React.js',
    d: 'Corporate website covering tech, real estate and trading, with built-in AI chat support and Nodemailer turning visitor inquiries into real business.',
    live: 'https://uha-international.com/',
    tags: 'React.js, Node.js, Nodemailer, API Integration',
  },
  {
    k: ['fit for living', 'fitforliving'],
    name: 'Fit For Living',
    cat: 'Client Website',
    d: 'Business website for a Geelong gym and coaching studio, with membership pricing, programs and a live weekly class timetable.',
    live: 'https://fitforliving.netlify.app/',
    tags: 'HTML5, CSS3, JavaScript, Netlify',
  },
  {
    k: ['gitpulse', 'git pulse'],
    name: 'GitPulse',
    cat: 'Next.js',
    d: 'GitHub activity tracking platform for coding bootcamps, with role-based dashboards, cohort management, scoring and leaderboards.',
    live: 'https://gitpulseee.netlify.app/',
    src: 'https://github.com/FaisalHanif12/GitPulse-',
    tags: 'Next.js, React, GitHub API, Role-Based Access',
  },
  {
    k: ['smart health', 'fitness tracker'],
    name: 'Smart Health Care',
    cat: 'Full Stack',
    d: 'A full-featured fitness tracker with activity monitoring, workout scheduling and progress analytics.',
    live: 'https://smart-health-care.vercel.app/',
    src: 'https://github.com/FaisalHanif12/Smart-health-Care',
    tags: 'React, Node.js, MongoDB, Express',
  },
  {
    k: ['smart gallery', 'gallery app'],
    name: 'Smart Gallery App',
    cat: 'React Native',
    d: 'An intelligent photo gallery with advanced sorting, filtering and AI-powered image recognition.',
    live: 'https://smartgallery-display.netlify.app/',
    src: 'https://github.com/FaisalHanif12/SmartGallery',
    tags: 'React Native, Expo, Async Storage, OpenAI',
  },
  {
    k: ['echo ai', 'echoai'],
    name: 'Echo AI',
    cat: 'React.js',
    d: 'An AI-powered conversational interface with natural language processing and intelligent response generation.',
    live: 'https://echoaai.netlify.app/',
    src: 'https://github.com/FaisalHanif12/Echoai',
    tags: 'React, OpenAI, TypeScript, Tailwind',
  },
  {
    k: ['medicine store', 'medicine app', 'medicare', 'pet health'],
    name: 'Medicine Store App',
    cat: 'React Native',
    d: 'A pet healthcare app for tracking medications and medical records for animals.',
    live: 'https://medicaredisplay.netlify.app/',
    src: 'https://github.com/FaisalHanif12/medicine-tracker-',
    tags: 'React Native, Expo, Async Storage',
  },
  {
    k: ['soledeck', 'sneaker store', 'sneaker shop'],
    name: 'Soledeck',
    cat: 'E-commerce',
    d: 'A modern sneaker store with advanced filtering, Stripe payments and inventory management.',
    live: 'https://soledeckf.vercel.app/',
    src: 'https://github.com/FaisalHanif12/Soledeck',
    tags: 'Next.js, Stripe, MongoDB, Redux',
  },
  {
    k: ['financial fusion', 'fintech app', 'expense tracker'],
    name: 'Financial Fusion',
    cat: 'FinTech',
    d: 'A financial management app with expense tracking, budget planning and investment analytics.',
    live: 'https://financial-fusion.netlify.app/',
    src: 'https://github.com/FaisalHanif12/FinancialFusion',
    tags: 'React Native, Charts.js, SQLite, Redux',
  },
  {
    k: ['yoom', 'video conferencing app'],
    name: 'YOOM',
    cat: 'Communication',
    d: 'A video conferencing platform with real-time collaboration, screen sharing and meeting management.',
    live: 'https://faisal-yoom.netlify.app/',
    src: 'https://github.com/FaisalHanif12/YOOM',
    tags: 'Next.js, WebRTC, Socket.io, Clerk Auth',
  },
  {
    k: ['dosnexa', 'telemedicine'],
    name: 'Dosnexa',
    cat: 'Healthcare',
    d: 'A medical platform connecting patients with doctors, with appointment booking and telemedicine.',
    live: 'https://dosnexa.vercel.app/',
    src: 'https://github.com/FaisalHanif12/Dosnexa',
    tags: 'Next.js, Prisma, PostgreSQL, Shadcn/ui',
  },
  {
    k: ['dsa tracker', 'dsa'],
    name: 'DSA Tracker',
    cat: 'Education',
    d: 'A data structures and algorithms learning platform with progress tracking and coding challenges.',
    live: 'https://faisal-dsa-tracker.netlify.app/',
    src: 'https://github.com/FaisalHanif12/DSA-Tracker-',
    tags: 'React, Material-UI, PWA',
  },
  {
    k: ['live search weather', 'weather app'],
    name: 'Live Search Weather',
    cat: 'Utility',
    d: 'A real-time weather app with live search, detailed forecasts and location-based services.',
    live: 'https://weather-faisal.netlify.app/',
    src: 'https://github.com/FaisalHanif12/Live-search-weather',
    tags: 'Next.js, Weather API, Geolocation',
  },
];

/* ---------- action buttons (A, L6202-6212) ---------- */

export type ChatActionKey =
  'book' | 'quick' | 'deep' | 'form' | 'works' | 'certs' | 'cv' | 'mail' | 'map';

export interface ChatAction {
  label: string;
  /** Sprite symbol id. */
  icon:
    | 'i-calendar'
    | 'i-zap'
    | 'i-layers'
    | 'i-send'
    | 'i-briefcase'
    | 'i-award'
    | 'i-download'
    | 'i-mail'
    | 'i-pin';
  /** Button actions: open the booking modal, go to the contact form, or go to a page section. */
  act?: 'book' | 'form' | 'scroll';
  /** Booking preset for act 'book'. */
  type?: 'quick' | 'deep';
  /**
   * Element id with '#' for act 'scroll'. '#works' and '#approvals' are the reference page ids;
   * the rebuild resolves them to the /works and /approvals routes.
   */
  target?: string;
  /** Link actions. */
  href?: string;
  download?: boolean;
  /** Opens in a new tab (download links do too, L6360). */
  ext?: boolean;
  /** Outline style (.ct-act--ghost). */
  ghost?: boolean;
}

export const CHAT_ACTIONS: Record<ChatActionKey, ChatAction> = {
  book: { label: 'Book a call', icon: 'i-calendar', act: 'book' },
  quick: { label: 'Book Quick Chat', icon: 'i-zap', act: 'book', type: 'quick' },
  deep: { label: 'Book Deep Dive', icon: 'i-layers', act: 'book', type: 'deep', ghost: true },
  form: { label: 'Send project details', icon: 'i-send', act: 'form', ghost: true },
  works: {
    label: 'See all projects',
    icon: 'i-briefcase',
    act: 'scroll',
    target: '#works',
    ghost: true,
  },
  certs: {
    label: 'View certifications',
    icon: 'i-award',
    act: 'scroll',
    target: '#approvals',
    ghost: true,
  },
  cv: { label: 'Download CV', icon: 'i-download', href: CHAT_CV_URL, download: true },
  mail: { label: 'Email Faisal', icon: 'i-mail', href: 'mailto:' + CHAT_EMAIL },
  map: { label: 'View Map', icon: 'i-pin', href: LAHORE_MAP_URL, ghost: true, ext: true },
};

/* ---------- replies (KB, L6214-6286) ---------- */

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
  | 'greet'
  | 'thanks'
  | 'services'
  | 'web'
  | 'mobile'
  | 'ai'
  | 'cloud'
  | 'rates'
  | 'book'
  | 'projects'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certs'
  | 'contact'
  | 'location'
  | 'avail'
  | 'cv'
  | 'reviews'
  | 'about'
  | 'social'
  | 'fallback';

/** A reply builder. Only `location` reads the clock; `now` lets the backend and tests pass it. */
export type ChatReplyFactory = (now?: Date) => ChatReply;

/** lahoreTime() (L6213): the current Lahore time, for example "3:42 PM"; '' if Intl fails. */
export function lahoreTime(now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
    }).format(now);
  } catch {
    return '';
  }
}

/** A client quote in the reviews reply (L6276-6279). */
export interface ChatReview {
  quote: string;
  name: string;
  company: string;
  /** The owner has not confirmed this review yet (orchestrator-decisions.md). */
  needsConfirmation?: true;
}

export const CHAT_REVIEWS: ChatReview[] = [
  {
    quote: 'His attention to detail and problem-solving skills are outstanding.',
    name: 'Sarah Johnson',
    company: 'TechCorp',
    needsConfirmation: true,
  },
  {
    quote: 'Exceptional coding skills and problem-solving abilities.',
    name: 'Amnan Hussain',
    company: 'Infinity Edge Technology',
  },
  {
    quote: 'His code quality and documentation are top-notch.',
    name: 'Emily Rodriguez',
    company: 'AppSolutions',
    needsConfirmation: true,
  },
];

/** One reviews list line: '"<quote>" **<name>**, <company>'. */
export function chatReviewLine(r: ChatReview): string {
  return '"' + r.quote + '" **' + r.name + '**, ' + r.company;
}

const A = CHAT_ACTIONS;

/** Every canned reply, word for word. Key order is the reference order. */
export const CHAT_KB: Record<ChatIntentId, ChatReplyFactory> = {
  greet: () => ({
    p: [
      "Hello! I can tell you about Faisal's services, rates, projects or experience. What would you like to know?",
    ],
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
    p: [
      'For **Cloud Orchestration** Faisal handles deployment and scaling with AWS, Docker, CI/CD pipelines, Vercel and Netlify. He also holds the AWS Cloud & Data Analytics Professional Certificate.',
    ],
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
      'Phone: [' +
        CONTACT_PHONE.display +
        '](' +
        CONTACT_PHONE.href +
        '), Mon-Fri, 9AM-6PM (GMT+5)',
    ],
    acts: [A.form, A.book],
    chips: ['Location'],
  }),
  location: (now) => {
    const t = lahoreTime(now);
    return {
      p: [
        'Faisal is based in **Lahore, Pakistan** (GMT+5, PKT) and works with clients worldwide.' +
          (t ? ' It is ' + t + ' there right now.' : ''),
      ],
      acts: [A.map],
      chips: ['Availability', 'Book a call'],
    };
  },
  avail: () => ({
    p: [
      'Yes, Faisal is available for work and new projects. He is reachable Monday to Friday, 9AM to 6PM (GMT+5), and replies to messages within 24 hours.',
    ],
    acts: [A.book, A.form],
  }),
  cv: () => ({
    p: ["Here is Faisal's CV. It covers his experience, skills and education."],
    acts: [A.cv],
    chips: ['Experience', 'Contact'],
  }),
  reviews: () => ({
    p: ['A few words from clients:'],
    list: CHAT_REVIEWS.map(chatReviewLine),
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
    p: [
      'I am not sure about that one, but Faisal can answer it directly. I can also help with his services, rates, projects or experience.',
    ],
    acts: [A.mail],
    chips: ['Services', 'Rates', 'Projects'],
  }),
};

/**
 * projectReply() (L6287-6290): the card for a matched project. The separator is U+00B7 with a
 * space on each side; a project without src ends with " · Closed source".
 */
export function projectReply(p: ChatProject): ChatReply {
  const links =
    '[Live preview](' + p.live + ')' + (p.src ? ' · [Source](' + p.src + ')' : ' · Closed source');
  return {
    p: ['**' + p.name + '** (' + p.cat + '): ' + p.d, 'Built with ' + p.tags + '.', links],
    acts: [A.works],
    chips: ['Projects', 'Book a call'],
  };
}

/* ---------- local answer engine table (INTENTS, L6291-6313) ---------- */

export interface ChatIntent {
  id: Exclude<ChatIntentId, 'fallback'>;
  /** Lower case keywords, matched against the normalised message. */
  kw: string[];
  /** Weight; default 1. */
  w?: number;
}

/**
 * ORDER MATTERS: on equal scores the earlier intent wins. Each keyword hit scores 1 (1.6 for a
 * keyword with a space) times w. Messages that hit a CHAT_PROJECTS keyword never reach this table.
 */
export const CHAT_INTENTS: ChatIntent[] = [
  {
    id: 'book',
    kw: [
      'book',
      'booking',
      'meeting',
      'schedule',
      'consult',
      'consultation',
      'session',
      'appointment',
      'book a call',
      'video call',
      'zoom',
      'google meet',
      'calendar',
      'talk to him',
      'call',
    ],
  },
  {
    id: 'rates',
    kw: [
      'rate',
      'rates',
      'price',
      'pricing',
      'cost',
      'costs',
      'charge',
      'charges',
      'hourly',
      'per hour',
      'budget',
      'fee',
      'fees',
      'how much',
      'quote',
      'expensive',
      'cheap',
      'plan',
      'package',
      '$',
    ],
  },
  { id: 'cv', kw: ['cv', 'resume', 'download'], w: 1.4 },
  {
    id: 'contact',
    kw: [
      'contact',
      'email',
      'mail',
      'phone',
      'number',
      'reach',
      'whatsapp',
      'get in touch',
      'call him',
      'call me',
      'message him',
    ],
  },
  {
    id: 'ai',
    kw: [
      'ai',
      'llm',
      'llms',
      'gpt',
      'openai',
      'claude',
      'chatbot',
      'chatbots',
      'bot',
      'agent',
      'agents',
      'agentic',
      'rag',
      'mcp',
      'langchain',
      'langgraph',
      'prompt',
      'machine learning',
      'ai work',
    ],
  },
  {
    id: 'mobile',
    kw: [
      'mobile',
      'app',
      'apps',
      'ios',
      'android',
      'react native',
      'expo',
      'play store',
      'app store',
      'mobile apps',
    ],
  },
  {
    id: 'web',
    kw: [
      'web',
      'website',
      'websites',
      'frontend',
      'front end',
      'react',
      'next',
      'nextjs',
      'next.js',
      'landing page',
      'dashboard',
      'saas',
      'full stack',
      'fullstack',
      'mern',
      'backend',
      'node',
      'api',
    ],
  },
  {
    id: 'cloud',
    kw: [
      'cloud',
      'aws',
      'docker',
      'devops',
      'deploy',
      'deployment',
      'ci/cd',
      'cicd',
      'vercel',
      'netlify',
      'hosting',
      'server',
      'kubernetes',
    ],
  },
  {
    id: 'projects',
    kw: [
      'project',
      'projects',
      'portfolio',
      'work samples',
      'works',
      'built',
      'showcase',
      'examples',
      'example',
      'case study',
      'demo',
      'previous work',
      'shipped',
    ],
  },
  {
    id: 'experience',
    kw: [
      'experience',
      'job',
      'jobs',
      'company',
      'companies',
      'worked',
      'career',
      'techxelo',
      'upwork',
      'viral square',
      'years',
      'employment',
      'work history',
    ],
  },
  {
    id: 'education',
    kw: [
      'education',
      'degree',
      'university',
      'umt',
      'study',
      'studied',
      'college',
      'bachelor',
      'graduate',
      'school',
      'matric',
      'intermediate',
      'academic',
    ],
  },
  {
    id: 'skills',
    kw: [
      'skill',
      'skills',
      'stack',
      'tech stack',
      'technology',
      'technologies',
      'typescript',
      'javascript',
      'tailwind',
      'framework',
      'frameworks',
      'tools',
      'proficient',
      'languages',
      'language',
      'urdu',
      'english',
      'speak',
    ],
  },
  {
    id: 'certs',
    kw: [
      'certificate',
      'certificates',
      'certification',
      'certifications',
      'certified',
      'approvals',
      'coursera',
      'credential',
      'credentials',
      'course',
      'courses',
    ],
  },
  {
    id: 'location',
    kw: [
      'where',
      'location',
      'based',
      'lahore',
      'pakistan',
      'timezone',
      'time zone',
      'gmt',
      'pkt',
      'local time',
      'country',
      'city',
      'located',
      'map',
    ],
  },
  {
    id: 'avail',
    kw: [
      'available',
      'availability',
      'hire',
      'hiring',
      'open to work',
      'freelance',
      'start',
      'when can',
      'working hours',
      'hours',
      'capacity',
      'free',
    ],
  },
  {
    id: 'services',
    kw: [
      'service',
      'services',
      'offer',
      'offers',
      'what do you do',
      'what does he do',
      'what can',
      'help with',
      'specialize',
      'specialise',
      'expertise',
      'do for me',
      'what he does',
    ],
  },
  {
    id: 'reviews',
    kw: [
      'review',
      'reviews',
      'testimonial',
      'testimonials',
      'clients say',
      'feedback',
      'recommend',
      'references',
      'reputation',
    ],
  },
  {
    id: 'social',
    kw: [
      'linkedin',
      'github',
      'twitter',
      'x.com',
      'instagram',
      'quora',
      'social',
      'socials',
      'profiles',
      'profile links',
    ],
  },
  {
    id: 'about',
    kw: ['who', 'about', 'yourself', 'introduce', 'bio', 'summary', 'faisal'],
    w: 0.6,
  },
  {
    id: 'thanks',
    kw: ['thanks', 'thank you', 'thx', 'great', 'awesome', 'perfect', 'cool', 'nice', 'ok thanks'],
    w: 0.9,
  },
  {
    id: 'greet',
    kw: [
      'hi',
      'hello',
      'hey',
      'salam',
      'assalam',
      'aoa',
      'good morning',
      'good evening',
      'good afternoon',
      'yo',
    ],
    w: 0.8,
  },
];
