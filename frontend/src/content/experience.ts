/**
 * Profile experience timeline (div.pf-exp#pf-exp, reference HTML L3575-3655) and the sticky year
 * box that profile.js L6677-6708 drives from each role's data-from, data-to and data-role.
 * Array order is the reference order (newest first). Pure data: no React, no side effects.
 *
 * What the reference does NOT have (so it is not here): a location or employment type per role,
 * bullet lists. Each role has one description paragraph and a tag list.
 */
import type { ProfileIconId } from './profile';

/** Badge of a role: `current` renders span.pf-badge--live, `closed` renders span.pf-badge--closed. */
export type RoleStatus = 'current' | 'closed';

export interface ExperienceRole {
  /** li.pf-role id, also the jump target of the CV sheet (L3597). */
  id: string;
  /** Node label, span.pf-node > span. */
  number: string;
  /** data-from: sticky year, top line. */
  from: string;
  /** data-to: sticky year, bottom line. */
  to: string;
  /** span.pf-role__date text (after the i-calendar icon). */
  dateLabel: string;
  /** h4.pf-role__title */
  title: string;
  /** p.pf-role__co text (after the span.pf-co-ic icon). */
  company: string;
  companyIcon: ProfileIconId;
  /** Badge kind; null means the role has no badge (the date sits alone in div.pf-role__top). */
  status: RoleStatus | null;
  /** Badge text, already upper case in the reference; null when there is no badge. */
  statusLabel: string | null;
  /** data-role: the sticky year meta line (span.pf-year__role). */
  yearBoxRole: string;
  /** p.pf-role__desc */
  description: string;
  /** ul.tags.pf-tags items, in order. */
  tags: readonly string[];
}

export interface ExperienceYearBox {
  /** The fixed total in `<b class="pf-year__n">01</b> / 04` (L3589). */
  total: string;
}

export const experienceYearBox: ExperienceYearBox = {
  total: '04',
};

export const experience: readonly ExperienceRole[] = [
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
    description:
      'Integrating AI and LLMs into software engineering \u2014 building intelligent full-stack web and mobile applications with React.js, Next.js, Node.js, and MongoDB, powered by AI-driven features, smart automation, and scalable REST APIs across production systems.',
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
    description:
      'Collaborating with diverse international clients, delivering custom web solutions and building strong client relationships across various industries.',
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
    description:
      'Orchestrated project acquisition and client engagement strategies, expertly identifying opportunities and aligning them with company capabilities.',
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
    description:
      'Specialized in cross-platform mobile development, creating seamless user experiences for iOS and Android applications.',
    tags: ['React Native', 'Mobile Apps', 'Cross-Platform'],
  },
];
