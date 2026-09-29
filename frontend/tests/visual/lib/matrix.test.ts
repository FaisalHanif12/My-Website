// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  expandJobs,
  isReferenceUrl,
  outputName,
  routeSlug,
  urlFor,
  viewportFor,
  VIEWPORTS,
} from './matrix';
import { ROUTES, THEMES, WIDTHS } from './matrix';

const REF = 'http://localhost:4400/faisalhanif-redesign.html';

describe('matrix', () => {
  it('has the seven viewports of the QA checklist', () => {
    expect(VIEWPORTS.map((v) => `${v.width}x${v.height}`)).toEqual([
      '1440x900',
      '1280x720',
      '1024x768',
      '891x774',
      '768x1024',
      '390x844',
      '360x780',
    ]);
    expect(viewportFor(891)).toEqual({ width: 891, height: 774 });
  });

  it('maps routes to reference hash pages', () => {
    expect(isReferenceUrl(REF)).toBe(true);
    expect(urlFor(REF, '/')).toBe(REF);
    expect(urlFor(REF, '/profile')).toBe(`${REF}#profile`);
    expect(urlFor(REF, '/works')).toBe(`${REF}#works`);
    expect(urlFor(REF, '/approvals')).toBe(`${REF}#approvals`);
    expect(urlFor(REF, '/contact')).toBe(`${REF}#contact`);
    expect(urlFor(`${REF}#works`, '/')).toBe(REF);
  });

  it('maps routes to app paths', () => {
    expect(isReferenceUrl('http://localhost:3000')).toBe(false);
    expect(urlFor('http://localhost:3000', '/')).toBe('http://localhost:3000/');
    expect(urlFor('http://localhost:3000/', '/works')).toBe('http://localhost:3000/works');
    expect(urlFor('http://localhost:3000/?x=1#a', '/contact')).toBe(
      'http://localhost:3000/contact',
    );
  });

  it('names outputs <route>_<width>_<theme>[_<tag>]', () => {
    expect(routeSlug('/')).toBe('about');
    expect(routeSlug('/approvals')).toBe('approvals');
    const job = { route: '/' as const, viewport: viewportFor(390), theme: 'dark' as const };
    expect(outputName(job)).toBe('about_390_dark');
    expect(outputName(job, 'book open')).toBe('about_390_dark_book-open');
  });

  it('expands the full matrix in order, 70 jobs', () => {
    const jobs = expandJobs(ROUTES, WIDTHS, THEMES);
    expect(jobs).toHaveLength(70);
    expect(outputName(jobs[0])).toBe('about_1440_light');
    expect(outputName(jobs[1])).toBe('about_1440_dark');
    expect(outputName(jobs[69])).toBe('contact_360_dark');
  });
});
