/**
 * Works page content: the 14 projects, the project filter, the grid copy, the Works hero (the
 * orbit: PureBody in the centre, six builds around it) and the PureBody showcase modal.
 *
 * Source: reference works.js data L6862-6911, card template L7030-7066, count L7102, hero seal and
 * jump L7352-7362, hero HTML L3799-3878, PureBody modal HTML L4493-4554 (REFERENCE_MAP.md 11.5.11).
 * Pure data: no React, no component imports. Array order is data order (never sort): it drives the
 * card number (01 to 14), reveal delays, cover colours and the hero jump lookup.
 * Every visible string is copied word for word from the reference (see works-content.test.ts).
 */

/** Filter keys used by the segmented filter and the "Built with" chips (P_FILTERS, L6906). */
export type ProjectFilterKey =
  'all' | 'reactjs' | 'nextjs' | 'fullstack' | 'reactnative' | 'sassapp';

/** A project's own key. 'website' (Fit For Living) has no filter button: it only shows under All Projects. */
export type ProjectKey = Exclude<ProjectFilterKey, 'all'> | 'website';

/** b in the reference: 'latest' = PureBody hero card, 'featured' = Echo AI, 'live' = every other card. */
export type ProjectBadge = 'latest' | 'featured' | 'live';

/** Icon ids from the sprite (map section 7, without the "i-" prefix) used on the card covers. */
export type CoverIconId =
  | 'rocket'
  | 'code'
  | 'globe'
  | 'layers'
  | 'server'
  | 'phone-dev'
  | 'cart'
  | 'dollar'
  | 'video'
  | 'shield'
  | 'book'
  | 'cloud';

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
  /** img: served from frontend/public; render with encodeURI() like the reference img() (L6944). */
  image: string;
  /** live: Live Preview link and the chrome URL text (protocol, trailing "/" and ".html" removed). */
  live: string;
  /** modal: when set, Live Preview is a button that opens this modal id instead of a link. */
  modal?: 'purebody';
  /** src: GitHub link, or null for "Closed Source". */
  source: string | null;
  /** tags: the tag list ("Technologies"). Shown upper case by the .tag CSS; keep the data case. */
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

/** P_FILTERS (L6906). "Sass App" is the reference label (the category says "SaaS App"); keep it. */
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
  FinTech: 'dollar',
  Communication: 'video',
  Healthcare: 'shield',
  Education: 'book',
  Utility: 'cloud',
};

/** PROJECTS (L6862-6905), in reference order. */
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
    image: '/imgs/uha-company-website.webp',
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
    // 05 (the reference describes this one as a fitness tracker; copied as written)
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
    // 07 (live URL "echoaai" with a double a, as in the reference)
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
    // 08 (description ends "for animal." as in the reference)
    title: 'Medicine Store App',
    initials: 'MS',
    category: 'React Native',
    filterKey: 'reactnative',
    badge: 'live',
    image: '/imgs/medicare.webp',
    live: 'https://medicaredisplay.netlify.app/',
    source: 'https://github.com/FaisalHanif12/medicine-tracker-',
    tags: ['React Native', 'Expo', 'Async Storage'],
    description:
      'A comprehensive pet healthcare management system for tracking medications and medical records for animal.',
    cover: { hue: 150, angle: 139, ring: [55, -40, 70] },
  },
  {
    // 09
    // OWNER FLAG: the live link below returns 404. Kept exactly as in the reference, with its Live
    // badge and Live Preview link (orchestrator decision, "Content kept as the reference has it").
    // Changing the link or hiding the button needs the owner's decision.
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

/** Toolbar, count, empty state and card copy of the Works grid (HTML L3880-3897, JS L6952-6954, L7033-7062, L7102). */
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

/** A project that rides the orbit: a small browser window on the ring (button.wk-oc, L4207-4237). */
export interface OrbitCard {
  /** data-p, matched against Project.title for the jump. */
  projectTitle: string;
  /** .wk-oc--dk (GitPulse and YOOM have dark screens). */
  dark?: boolean;
  /** Browser bar URL text (span.wk-oc__url). */
  url: string;
  /**
   * The base64 screenshot of the reference, extracted to frontend/public/images/ by
   * scripts/extract-images.mjs. width and height are the intrinsic size. The image has an empty alt
   * (decorative: the button carries the label), decoding="async" draggable="false".
   */
  image: { src: string; width: number; height: number };
  /** Hover label under the card: <b>{name}</b><span>{type}</span> (aria-hidden). */
  label: { name: string; type: string };
  ariaLabel: string;
}

/** Works hero, "the orbit" (HTML L4167-4265, script L7856-8113). */
export const WORKS_HERO = {
  eyebrow: 'Portfolio Showcase',
  titleRowA: 'Featured',
  titleRowB: 'Projects',
  /** Rendered as: 2022 <i>&rarr;</i> 2026 */
  titleMeta: { from: '2022', to: '2026' },
  lead: 'Explore my collection of AI-powered web applications, mobile solutions, and full-stack projects that blend LLM intelligence with cutting-edge technology and innovative design.',
  browseLabel: 'Browse projects',
  bookLabel: 'Book Meeting',
  /** Hard coded in the reference: "10+" projects while the data has 14. Copy as is. */
  stats: [
    { label: 'Projects', value: 10, suffix: '+', delay: 480 },
    { label: 'Technologies', value: 7, suffix: '+', delay: 540 },
    { label: 'Responsive', value: 100, suffix: '%', delay: 600 },
  ] as readonly WorksHeroStat[],
  stageAriaLabel: 'PureBody in the centre with six projects in orbit. Choose one to jump to it.',
  /** The upright phone in the middle: it opens the PureBody showcase (button.wk-phn, L4187-4204). */
  phone: {
    ariaLabel: 'PureBody, SaaS app. Open the app showcase.',
    /** Two app screens that swap every 4.5s; the first is on. */
    screens: [
      { src: '/images/works-orbit-purebody-1.webp', width: 402, height: 884 },
      { src: '/images/works-orbit-purebody-2.webp', width: 379, height: 872 },
    ],
    statusTime: '9:41',
  },
  /** The label pill under the phone (span.wk-ob__pill): dot, name, type, "Latest", page dots. */
  pill: { name: 'PureBody', type: 'SaaS App', latest: 'Latest' },
  /** The caption: a number, then a desktop line and a phone line (CSS shows one of them). */
  caption: {
    count: '06',
    desktop: 'PureBody at the centre, six builds in orbit. Pick one to jump to it.',
    phone: 'PureBody at the centre, six builds in orbit. Tap one to jump to it.',
  },
  cue: 'Scroll to explore',
  /** The six orbit cards in DOM order (slot i sits at angle i * 60deg). */
  cards: [
    {
      projectTitle: 'UHA International',
      url: 'uha-international.com',
      image: { src: '/images/works-orbit-uha.webp', width: 1280, height: 697 },
      label: { name: 'UHA International', type: 'React.js' },
      ariaLabel: 'UHA International, React.js. Jump to this project.',
    },
    {
      projectTitle: 'GitPulse',
      dark: true,
      url: 'gitpulseee.netlify.app',
      image: { src: '/images/works-orbit-gitpulse.webp', width: 1400, height: 797 },
      label: { name: 'GitPulse', type: 'Next.js' },
      ariaLabel: 'GitPulse, Next.js. Jump to this project.',
    },
    {
      projectTitle: 'Fit For Living',
      url: 'fitforliving.netlify.app',
      image: { src: '/images/works-orbit-fitforliving.webp', width: 1280, height: 697 },
      label: { name: 'Fit For Living', type: 'Client Website' },
      ariaLabel: 'Fit For Living, Client Website. Jump to this project.',
    },
    {
      projectTitle: 'Soledeck',
      url: 'soledeckf.vercel.app',
      image: { src: '/images/works-orbit-soledeck.webp', width: 1100, height: 690 },
      label: { name: 'Soledeck', type: 'Next.js \u00b7 Stripe' },
      ariaLabel: 'Soledeck, Next.js, Stripe. Jump to this project.',
    },
    {
      projectTitle: 'Dosnexa',
      url: 'dosnexa.vercel.app',
      image: { src: '/images/works-orbit-dosnexa.webp', width: 1100, height: 576 },
      label: { name: 'Dosnexa', type: 'Next.js \u00b7 Prisma' },
      ariaLabel: 'Dosnexa, Next.js, Prisma. Jump to this project.',
    },
    {
      projectTitle: 'YOOM',
      dark: true,
      url: 'faisal-yoom.netlify.app',
      image: { src: '/images/works-orbit-yoom.webp', width: 707, height: 380 },
      label: { name: 'YOOM', type: 'Next.js \u00b7 WebRTC' },
      ariaLabel: 'YOOM, Next.js, WebRTC. Jump to this project.',
    },
  ] as readonly OrbitCard[],
} as const;

export interface PureBodyDemo {
  /** --i on the figure (entrance delay, float phase, autoplay order). */
  index: 0 | 1 | 2;
  /**
   * Set as the video src on first start (lazy, data-src in the reference, resolved with FH.asset at
   * L7605). Served from frontend/public/vedioes/ (folder name spelled as in the reference).
   */
  video: string;
  posterAriaLabel: string;
  posterCaption: string;
  videoAriaLabel: string;
  figcaption: string;
}

/** PureBody showcase modal, id "purebody" (HTML L4493-4554). Opened by PROJECTS[0].modal. */
export const PUREBODY_SHOWCASE = {
  /** Modal id, the value of data-open on the PureBody card's Live Preview button. */
  id: 'purebody',
  closeAriaLabel: 'Close PureBody showcase',
  /** <dot-live/>SaaS App <i.wk-sep/> Latest */
  kickerParts: ['SaaS App', 'Latest'],
  titleParts: ['Pure', 'Body'],
  /** No final full stop in the reference. */
  lead: 'Explore the functionality and features of our PureBody mobile application through interactive video demonstrations',
  /** Absolute old site URL kept as is (orchestrator decision; the new site serves sass-app.html). */
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
