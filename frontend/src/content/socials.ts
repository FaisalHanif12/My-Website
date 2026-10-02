/**
 * Social profiles shown as icon links in the About hero (ul.ab-soc, reference L3409-3418).
 * The Contact page shows no social links and there is no WhatsApp anywhere in the reference.
 * Pure data: no React, no side effects.
 */
import { contactFacts } from './site';

/** Shell sprite symbol ids of the social icons. */
export type SocialIcon =
  'i-linkedin' | 'i-xlogo' | 'i-github' | 'i-quora' | 'i-instagram' | 'i-mail';

export interface Social {
  id: 'linkedin' | 'x' | 'github' | 'quora' | 'instagram' | 'email';
  /** aria-label of the link (the hero shows the icon only). */
  label: string;
  /** data-tip: the short tooltip text (L3411-3416). */
  tip: string;
  /** Opened with target="_blank" rel="noopener"; the email link is a mailto and opens in place. */
  href: string;
  icon: SocialIcon;
}

/** aria-label of ul.ab-soc (L3409). */
export const socialsAriaLabel = 'Social profiles and email';

/** Hero order, L3410-3417 (never sort). */
export const socials: readonly Social[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    tip: 'LinkedIn',
    href: 'https://www.linkedin.com/in/faisal-software-engineer/',
    icon: 'i-linkedin',
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    tip: 'X',
    href: 'https://x.com/FaisalHanif333',
    icon: 'i-xlogo',
  },
  {
    id: 'github',
    label: 'GitHub',
    tip: 'GitHub',
    href: 'https://github.com/FaisalHanif12',
    icon: 'i-github',
  },
  {
    id: 'quora',
    label: 'Quora',
    tip: 'Quora',
    href: 'https://www.quora.com/profile/Faisal-Hanif-126',
    icon: 'i-quora',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    tip: 'Instagram',
    href: 'https://www.instagram.com/faisal_hanif_0/',
    icon: 'i-instagram',
  },
  {
    id: 'email',
    label: `Email ${contactFacts.email}`,
    tip: 'Email',
    href: `mailto:${contactFacts.email}`,
    icon: 'i-mail',
  },
];
