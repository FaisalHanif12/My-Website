/**
 * Profile education block (div.pf-edu-block, reference HTML L3657-3704): the featured degree card
 * and the two small cards, in reference order. Pure data: no React, no side effects.
 */
import type { ProfileIconId } from './profile';

interface EducationBase {
  /** article id (pf-edu-bs is the Education sheet's jump target). */
  id: string;
  /** span.pf-badge text, already upper case in the reference. */
  badge: string;
  /** p.pf-edu__yrs (featured) or span.pf-edu__yrs (small). */
  years: string;
  /** Plain part of h4.pf-edu__title. */
  title: string;
  /** span.serif part of h4.pf-edu__title. */
  titleSerif: string;
  /** p.pf-edu__inst > span. */
  institution: string;
  /** Icon before the institution. */
  institutionIcon: ProfileIconId;
  /** p.pf-edu__desc */
  description: string;
  /** ul.tags.pf-tags items, in order. */
  tags: readonly string[];
}

/**
 * article.card.pf-edu.pf-edu--feat (L3668-3679): data-reveal="fade" with no delay, a sheen, the
 * watermark and the icon tile; the badge is .pf-badge--onbrand and the years line is
 * p.pf-edu__yrs.pf-edu__yrs--big under the top row.
 */
export interface FeaturedEducation extends EducationBase {
  variant: 'featured';
  /** span.pf-edu__mark */
  watermark: string;
  /** Icon in span.pf-edu__ic. */
  icon: ProfileIconId;
}

/**
 * article.card.card--hover.pf-edu.pf-edu--sm (L3682-3703): plain data-reveal with data-delay; the
 * years sit in the top row next to the badge.
 */
export interface SmallEducation extends EducationBase {
  variant: 'small';
  /** data-delay in ms. */
  revealDelay: number;
}

export type EducationEntry = FeaturedEducation | SmallEducation;

export const education: readonly EducationEntry[] = [
  {
    id: 'pf-edu-bs',
    variant: 'featured',
    badge: "BACHELOR'S DEGREE",
    years: '2020 - 2024',
    title: 'Software Engineering',
    titleSerif: '(BS-SE)',
    institution: 'University of Management & Technology, Lahore',
    institutionIcon: 'i-building',
    description:
      'Comprehensive software engineering program covering modern development practices, algorithms, and industry-standard methodologies.',
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
    description:
      'Foundation in computing principles, programming fundamentals, and essential computer technology skills.',
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
    description:
      'Early foundation in computing with hands-on activities and basic programming concepts introduction.',
    tags: ['Computer Basics', 'Mathematics', 'Science'],
    revealDelay: 220,
  },
];
