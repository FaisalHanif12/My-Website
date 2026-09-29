/**
 * Command line options of the visual diff tool (npm run visual -- ...). The interface is binding
 * (frontend sharedDecisions section 6), keep it stable.
 */
import { ROUTES, THEMES, WIDTHS, isRoute, isTheme, isWidth } from './matrix';
import type { Route, Theme, Width } from './matrix';

export const DEFAULT_REF_URL = 'http://localhost:4400/faisalhanif-redesign.html';
export const DEFAULT_APP_URL = 'http://localhost:3000';
export const DEFAULT_WAIT_MS = 300;
export const DEFAULT_MAX_PERCENT = 0.5;

/** One --hover or --click, kept in command line order. */
export interface Action {
  type: 'hover' | 'click';
  selector: string;
}

export interface VisualArgs {
  routes: Route[];
  widths: Width[];
  themes: Theme[];
  selector?: string;
  actions: Action[];
  waitMs: number;
  motion: boolean;
  maxPercent: number;
  refUrl: string;
  appUrl: string;
  tag?: string;
  help: boolean;
}

export const USAGE = `Usage: npm run visual -- [options]
  --route / | /profile | /works | /approvals | /contact | all   (default /)
  --width 1440 | 1280 | 1024 | 891 | 768 | 390 | 360 | all      (default 1440)
  --theme light | dark | both                                   (default light)
  --selector "<css>"   element screenshot of the first visible match on both sides
  --hover "<css>"      hover before the capture (repeatable, kept in order with --click)
  --click "<css>"      click before the capture (repeatable, kept in order with --hover)
  --wait <ms>          extra settle time before the actions (default ${DEFAULT_WAIT_MS})
  --motion             turn reduced motion off (eye checks of end states)
  --max <percent>      exit 1 when any diff is above it (default ${DEFAULT_MAX_PERCENT})
  --ref-url <url>      reference page (default REF_URL or ${DEFAULT_REF_URL})
  --app-url <url>      app origin (default APP_URL or ${DEFAULT_APP_URL})
  --tag <name>         suffix for the output file names`;

const VALUE_FLAGS = new Set([
  'route',
  'width',
  'theme',
  'selector',
  'hover',
  'click',
  'wait',
  'max',
  'ref-url',
  'app-url',
  'tag',
]);
const BOOLEAN_FLAGS = new Set(['motion', 'help']);

function parseNumber(flag: string, raw: string): number {
  const n = Number(raw);
  if (raw.trim() === '' || !Number.isFinite(n) || n < 0) {
    throw new Error(`--${flag} expects a number >= 0, got "${raw}"`);
  }
  return n;
}

/** An absolute http(s) or file URL ("localhost:3000" would parse with the scheme "localhost:"). */
function parseUrl(flag: string, raw: string): string {
  let url: URL | undefined;
  try {
    url = new URL(raw);
  } catch {
    // Reported below.
  }
  if (!url || !['http:', 'https:', 'file:'].includes(url.protocol)) {
    throw new Error(`--${flag} expects an absolute URL, got "${raw}"`);
  }
  return url.toString();
}

export function parseArgs(
  argv: readonly string[],
  env: Readonly<Record<string, string | undefined>> = {},
): VisualArgs {
  const out: VisualArgs = {
    routes: ['/'],
    widths: [1440],
    themes: ['light'],
    actions: [],
    waitMs: DEFAULT_WAIT_MS,
    motion: false,
    maxPercent: DEFAULT_MAX_PERCENT,
    refUrl: parseUrl('ref-url (REF_URL)', env.REF_URL || DEFAULT_REF_URL),
    appUrl: parseUrl('app-url (APP_URL)', env.APP_URL || DEFAULT_APP_URL),
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    // npm may pass the separator through.
    if (token === '--') continue;
    if (!token.startsWith('--')) throw new Error(`Unexpected argument "${token}"`);
    const eq = token.indexOf('=');
    const flag = eq === -1 ? token.slice(2) : token.slice(2, eq);

    if (BOOLEAN_FLAGS.has(flag)) {
      if (eq !== -1) throw new Error(`--${flag} takes no value`);
      if (flag === 'motion') out.motion = true;
      else out.help = true;
      continue;
    }
    if (!VALUE_FLAGS.has(flag)) throw new Error(`Unknown option --${flag}\n\n${USAGE}`);

    let value: string | undefined;
    if (eq !== -1) value = token.slice(eq + 1);
    else {
      value = argv[i + 1];
      i++;
    }
    if (value === undefined || (eq === -1 && value.startsWith('--'))) {
      throw new Error(`--${flag} needs a value`);
    }

    switch (flag) {
      case 'route':
        if (value === 'all') out.routes = [...ROUTES];
        else if (isRoute(value)) out.routes = [value];
        else throw new Error(`--route must be one of ${ROUTES.join(', ')} or all, got "${value}"`);
        break;
      case 'width': {
        if (value === 'all') {
          out.widths = [...WIDTHS];
          break;
        }
        const n = Number(value);
        if (!isWidth(n)) {
          throw new Error(`--width must be one of ${WIDTHS.join(', ')} or all, got "${value}"`);
        }
        out.widths = [n];
        break;
      }
      case 'theme':
        if (value === 'both') out.themes = [...THEMES];
        else if (isTheme(value)) out.themes = [value];
        else throw new Error(`--theme must be light, dark or both, got "${value}"`);
        break;
      case 'selector':
        if (!value.trim()) throw new Error('--selector needs a CSS selector');
        out.selector = value;
        break;
      case 'hover':
      case 'click':
        if (!value.trim()) throw new Error(`--${flag} needs a CSS selector`);
        out.actions.push({ type: flag, selector: value });
        break;
      case 'wait':
        out.waitMs = parseNumber(flag, value);
        break;
      case 'max':
        out.maxPercent = parseNumber(flag, value);
        break;
      case 'ref-url':
        out.refUrl = parseUrl(flag, value);
        break;
      case 'app-url':
        out.appUrl = parseUrl(flag, value);
        break;
      case 'tag':
        if (!value.trim()) throw new Error('--tag needs a name');
        out.tag = value;
        break;
    }
  }
  return out;
}
