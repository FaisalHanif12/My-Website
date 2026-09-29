/**
 * Social profiles shown as icon links in the About hero (ul.ab-social, reference L3048-3054).
 * The Contact page shows no social links and there is no WhatsApp anywhere in the reference.
 * Pure data: no React, no side effects.
 */

/** Shell sprite symbol ids of the social icons. */
export type SocialIcon = 'i-linkedin' | 'i-xlogo' | 'i-github' | 'i-quora' | 'i-instagram';

export interface Social {
  id: 'linkedin' | 'x' | 'github' | 'quora' | 'instagram';
  /** aria-label of the link (the hero shows the icon only). */
  label: string;
  /** Opened with target="_blank" rel="noopener" (L3049-3053). */
  href: string;
  icon: SocialIcon;
}

/** aria-label of ul.ab-social (L3048). */
export const socialsAriaLabel = 'Social profiles';

/** Hero order, L3049-3053 (never sort). */
export const socials: readonly Social[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/faisal-frontend-developer/',
    icon: 'i-linkedin',
  },
  { id: 'x', label: 'X (Twitter)', href: 'https://x.com/FaisalHanif333', icon: 'i-xlogo' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/FaisalHanif12', icon: 'i-github' },
  {
    id: 'quora',
    label: 'Quora',
    href: 'https://www.quora.com/profile/Faisal-Hanif-126',
    icon: 'i-quora',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/faisal_hanif_0/',
    icon: 'i-instagram',
  },
];
