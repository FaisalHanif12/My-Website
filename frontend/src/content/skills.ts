/**
 * Profile technical expertise block (div.pf-tech, reference HTML L3706-3792): the skill tabs with
 * their ring values, the Languages card and the Core Expertise chips, in reference order.
 * Pure data: no React, no side effects.
 */
import type { ProfileIconId } from './profile';

export interface Skill {
  /** span.pf-skill__name text. */
  name: string;
  /**
   * data-v: the ring's inline --v (set when lit), the count up target of span.pf-ring__num and the
   * sr-only text `: {value}%`. The markup number starts at `0%`.
   */
  value: number;
}

export interface SkillTab {
  /** button.pf-tab id (aria-labelledby of its panel). */
  tabId: string;
  /** div.pf-panel id (aria-controls of its tab). */
  panelId: string;
  /** Tab text, span inside button.pf-tab. */
  label: string;
  icon: ProfileIconId;
  /** li.pf-skill rings of the panel, in order. */
  skills: readonly Skill[];
}

/** div.pf-tabs[role="tablist"] aria-label (L3718). */
export const skillTabsLabel = 'Skill groups';

export const skillTabs: readonly SkillTab[] = [
  {
    tabId: 'pf-tab-0',
    panelId: 'pf-panel-0',
    label: 'Programming Languages',
    icon: 'i-code',
    skills: [
      { name: 'JavaScript', value: 90 },
      { name: 'TypeScript', value: 85 },
      { name: 'Node.js', value: 85 },
      { name: 'C++', value: 60 },
    ],
  },
  {
    tabId: 'pf-tab-1',
    panelId: 'pf-panel-1',
    label: 'Frameworks & Libraries',
    icon: 'i-layers',
    skills: [
      { name: 'React.js', value: 95 },
      { name: 'Next.js', value: 80 },
      { name: 'React Native', value: 80 },
      { name: 'Express.js', value: 70 },
    ],
  },
  {
    tabId: 'pf-tab-2',
    panelId: 'pf-panel-2',
    label: 'AI & LLM Frameworks',
    icon: 'i-sparkles',
    skills: [
      { name: 'LangChain', value: 80 },
      { name: 'LangGraph', value: 75 },
      { name: 'OpenAI API', value: 85 },
      { name: 'Claude API', value: 80 },
    ],
  },
  {
    tabId: 'pf-tab-3',
    panelId: 'pf-panel-3',
    label: 'CSS & Styling',
    icon: 'i-eye',
    skills: [
      { name: 'Tailwind CSS', value: 90 },
      { name: 'Bootstrap', value: 90 },
      { name: 'CSS3', value: 92 },
      { name: 'Responsive Design', value: 95 },
    ],
  },
];

/** li.pf-lang__row: `<span class="pf-lang__mono" aria-hidden="true">{mono}</span>`, name, level. */
export interface LanguageEntry {
  mono: string;
  /** span.pf-lang__name */
  name: string;
  /** span.pf-lang__lvl text. */
  level: string;
  /** Adds .pf-lang__lvl--native to the level. */
  native: boolean;
}

/** article.card.pf-lang (L3762-3771). */
export interface LanguagesCard {
  /** h4.pf-card-head__title */
  title: string;
  /** Icon in the span.icon-tile.icon-tile--soft head tile. */
  icon: ProfileIconId;
  items: readonly LanguageEntry[];
}

export const languagesCard: LanguagesCard = {
  title: 'Languages',
  icon: 'i-globe',
  items: [
    { mono: 'En', name: 'English', level: 'Professional', native: false },
    { mono: 'Ur', name: 'Urdu', level: 'Native', native: true },
  ],
};

/** li.pf-chipw > span.pf-chip: icon then label. */
export interface CoreExpertiseChip {
  icon: ProfileIconId;
  label: string;
}

/** article.card.pf-core (L3773-3790). */
export interface CoreExpertiseCard {
  /** h4.pf-card-head__title */
  title: string;
  /** Icon in the span.icon-tile.icon-tile--soft head tile. */
  icon: ProfileIconId;
  /** ul.pf-chips items, in order. */
  chips: readonly CoreExpertiseChip[];
}

export const coreExpertiseCard: CoreExpertiseCard = {
  title: 'Core Expertise',
  icon: 'i-zap',
  chips: [
    { icon: 'i-sparkles', label: 'AI/LLM Integration' },
    { icon: 'i-cpu', label: 'AI Agents & Workflows' },
    { icon: 'i-code', label: 'Frontend Development' },
    { icon: 'i-server', label: 'Backend Development' },
    { icon: 'i-phone-dev', label: 'Mobile Development' },
    { icon: 'i-layers', label: 'Progressive Web Apps' },
    { icon: 'i-check-circle', label: 'Website Testing' },
    { icon: 'i-cloud', label: 'Cloud Deployment' },
    { icon: 'i-rocket', label: 'Performance Optimization' },
    { icon: 'i-grid', label: 'UI/UX Design' },
  ],
};
