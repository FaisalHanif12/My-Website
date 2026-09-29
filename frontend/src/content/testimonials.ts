/**
 * About page, "Client Success Stories" (div.ab-tst, reference L3323-3370; carousel script
 * L5104-5161). Pure data: no React, no side effects.
 *
 * Content kept as the reference has it (orchestrator decision): the Sarah Johnson (TechCorp) and
 * Emily Rodriguez (AppSolutions) quotes read like template text. They ship, marked
 * `needsConfirmation: true` for the owner. The chat knowledge quotes a line of each of the three
 * (L6277-6279), so a change here must be mirrored there.
 */
import type { SectionHead } from './services';

export interface Testimonial {
  /** blockquote.ab-quote */
  quote: string;
  /** figcaption strong */
  name: string;
  /** The span under the name, exactly as shown. */
  role: string;
  /** span.ab-avatar (aria-hidden). */
  initials: string;
  /** div.tags > span.tag */
  tags: string[];
  /** true: reads like template text; the owner must confirm it before launch. */
  needsConfirmation: boolean;
}

export const testimonialsHead: SectionHead = {
  eyebrow: 'Testimonials',
  titleText: 'Client',
  titleAccent: 'Success Stories',
  lead: 'A few words from people I have built things with.',
};

export interface TestimonialsUi {
  /** aria-label of the prev and next buttons (data-tst, L3330-3331). */
  prevLabel: string;
  nextLabel: string;
  /**
   * Counter (L3332): `<b id="ab-tst-cur">{current}</b>{counterTotal}`. The current number is two
   * digits (`(i<9?'0':'') + (i+1)`, L5117); the total is hard coded in the HTML, kept as written.
   */
  counterTotal: string;
  /** aria-label of #ab-carousel (role region, aria-roledescription carousel, L3336). */
  carouselLabel: string;
  /** aria-roledescription of the carousel and of each slide (L3336, L3339). */
  carouselRole: string;
  slideRole: string;
  /** span.ab-carousel__mark (aria-hidden, L3337): &ldquo;. */
  quoteMark: string;
  /** Slide aria-label: `${index + 1}${slideLabelJoin}${count}`, for example "1 of 3" (L3339). */
  slideLabelJoin: string;
  /** aria-label of div.ab-dots (role group, L3364). */
  dotsLabel: string;
  /** Dot aria-label: `${dotLabelPrefix}${index + 1}`, for example "Testimonial 1" (L3365). */
  dotLabelPrefix: string;
}

export const testimonialsUi: TestimonialsUi = {
  prevLabel: 'Previous testimonial',
  nextLabel: 'Next testimonial',
  counterTotal: ' / 03',
  carouselLabel: 'Client success stories',
  carouselRole: 'carousel',
  slideRole: 'slide',
  quoteMark: '\u201c',
  slideLabelJoin: ' of ',
  dotsLabel: 'Choose testimonial',
  dotLabelPrefix: 'Testimonial ',
};

/** Slides in reference order (L3339-3362, never sort); the first is active on load. */
export const testimonials: readonly Testimonial[] = [
  {
    quote:
      'Faisal delivered exceptional work on our React project. His attention to detail and problem-solving skills are outstanding. The application performance improved significantly after his optimizations.',
    name: 'Sarah Johnson',
    role: 'Project Manager, TechCorp',
    initials: 'SJ',
    tags: ['React.js', 'Performance', 'Optimization'],
    needsConfirmation: true,
  },
  {
    quote:
      'I had the pleasure of working with Faisal on a challenging project. His exceptional coding skills and problem-solving abilities consistently delivered high-quality work, demonstrating both technical expertise and strong teamwork.',
    name: 'Amnan Hussain',
    role: 'Infinity Edge Technology',
    initials: 'AH',
    tags: ['Team Work', 'Problem Solving', 'Quality Code'],
    needsConfirmation: false,
  },
  {
    quote:
      "Faisal's expertise in React Native helped us launch our mobile app successfully. His code quality and documentation are top-notch. Highly recommended for any frontend development work.",
    name: 'Emily Rodriguez',
    role: 'Lead Developer, AppSolutions',
    initials: 'ER',
    tags: ['React Native', 'Mobile App', 'Documentation'],
    needsConfirmation: true,
  },
];
