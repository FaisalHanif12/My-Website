/**
 * Runs one comparison (reference and app capture of one job, then the diff) and writes the PNGs.
 * Shared by the CLI (visual.ts) and the Playwright suite (parity.spec.ts).
 */
import type { Browser } from '@playwright/test';
import type { Action } from './args';
import { capture } from './capture';
import type { Side } from './capture';
import { diffPngs, writeOutputs } from './diff';
import type { WrittenFiles } from './diff';
import { outputName, urlFor } from './matrix';
import type { Job } from './matrix';

export interface CompareOptions {
  refUrl: string;
  appUrl: string;
  selector?: string;
  actions: readonly Action[];
  waitMs: number;
  motion: boolean;
  tag?: string;
}

export interface CompareResult {
  job: Job;
  name: string;
  percent: number;
  diffPixels: number;
  files: WrittenFiles;
  /** Console errors and warnings, page errors and failed requests, prefixed "ref:" or "app:". */
  logs: string[];
}

export async function compare(
  browser: Browser,
  job: Job,
  o: CompareOptions,
): Promise<CompareResult> {
  const logs: string[] = [];
  const shot = (side: Side, base: string) =>
    capture(browser, {
      side,
      url: urlFor(base, job.route),
      viewport: job.viewport,
      theme: job.theme,
      selector: o.selector,
      actions: o.actions,
      waitMs: o.waitMs,
      motion: o.motion,
      log: (line) => logs.push(`${side}: ${line}`),
    });
  const refPng = await shot('ref', o.refUrl);
  const appPng = await shot('app', o.appUrl);
  const diff = diffPngs(refPng, appPng);
  const name = outputName(job, o.tag);
  const files = writeOutputs(name, refPng, appPng, diff.diffPng);
  return { job, name, percent: diff.percent, diffPixels: diff.diffPixels, files, logs };
}
