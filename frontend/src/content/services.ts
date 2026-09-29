/**
 * About page, "What I Do Best" (div.ab-services, reference L3213-3319): the section head, the side
 * index and the four accordion rows. Also exports SectionHead, the shape of the four About section
 * heads (Get to Know Me, Services, Testimonials, Pricing). Pure data: no React, no side effects.
 *
 * Label text is kept in its source case; `.label`, `.tag` and `.ab-svc-index li` uppercase it in CSS.
 */

/**
 * div.sec-head: `<span class="eyebrow">[<b>{eyebrowNum}</b> ]{eyebrow}</span>`, then
 * `<h2 class="sec-title" data-split>{titleText} <span class="serif grad-text">{titleAccent}</span></h2>`
 * (one space between) and `<p class="lead" data-reveal>{lead}</p>`.
 */
export interface SectionHead {
  eyebrow: string;
  /** Number in <b> before the eyebrow text. Only the first About section has one (L3146). */
  eyebrowNum?: string;
  /** Plain words of the h2, before the accent. */
  titleText: string;
  /** Words wrapped in span.serif.grad-text. */
  titleAccent: string;
  lead: string;
}

export interface Service {
  /** span.ab-svc__num (aria-hidden), an outlined number. */
  num: string;
  /** span.label above the title. */
  kicker: string;
  /** Text of the matching item in the side index (ol.ab-svc-index, L3222). */
  indexLabel: string;
  /** span.ab-svc__title */
  title: string;
  /** p.ab-svc__desc */
  description: string;
  /** ul.ab-feats items, each after an i-check icon. */
  features: string[];
  /** div.tags > span.tag */
  tags: string[];
  /** Row 3 also has the class ab-svc--ai (gradient border when open). */
  variant?: 'ai';
}

export const servicesHead: SectionHead = {
  eyebrow: 'Services',
  titleText: 'What I Do',
  titleAccent: 'Best',
  lead: 'Four areas I work across, from the first screen to the cloud it runs on.',
};

/** Index of the row that is open on first render (article.ab-svc.is-open, L3227). */
export const servicesDefaultOpen = 0;

/** Rows in reference order (L3227-3316, never sort). Panel and button ids use the index. */
export const services: readonly Service[] = [
  {
    num: '01',
    kicker: 'Frontend',
    indexLabel: 'Web',
    title: 'Web Development',
    description:
      'Crafting responsive, high-performance web applications using modern frameworks and cutting-edge technologies.',
    features: ['Responsive Design', 'Performance Optimization', 'Modern UI/UX'],
    tags: [
      'React.js',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express.js',
      'MongoDB',
      'SQL',
      'API Integration',
    ],
  },
  {
    num: '02',
    kicker: 'Mobile',
    indexLabel: 'Mobile',
    title: 'Mobile Development',
    description:
      'Creating cross-platform mobile applications with native performance and exceptional user experience.',
    features: ['Cross-Platform', 'Native Performance', 'App Store Ready'],
    tags: [
      'React Native',
      'Expo',
      'iOS',
      'Android',
      'Node.js',
      'Express.js',
      'MongoDB',
      'SQL',
      'API Integration',
    ],
  },
  {
    num: '03',
    kicker: 'AI / LLM',
    indexLabel: 'AI / LLM',
    title: 'AI/LLM Integration',
    description:
      'Integrating large language models into real products: intelligent assistants, AI-powered features, and automated workflows that make applications smarter.',
    features: ['AI Chatbots & Assistants', 'Agentic Workflows', 'Personalized AI Features'],
    tags: ['OpenAI', 'Claude', 'LLM APIs', 'Prompt Engineering', 'RAG', 'MCP'],
    variant: 'ai',
  },
  {
    num: '04',
    kicker: 'Cloud',
    indexLabel: 'Cloud',
    title: 'Cloud Orchestration',
    description:
      'Orchestrating, deploying, and scaling cloud infrastructure with containerization, CI/CD pipelines, and modern DevOps practices for reliable production systems.',
    features: ['Cloud Architecture', 'Automated Deployment', 'Scalable Infrastructure'],
    tags: ['AWS', 'Docker', 'CI/CD', 'Vercel', 'Netlify'],
  },
];
