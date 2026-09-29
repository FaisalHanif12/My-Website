/**
 * Visual diff CLI: npm run visual -- --route /works --width 1440 --theme dark
 * Screenshots the reference and the app under identical conditions, prints one line per capture
 * (route width theme diff%) and writes tests/visual/out/<name>_{ref,app,diff}.png.
 */
import { chromium } from '@playwright/test';
import { USAGE, parseArgs } from './lib/args';
import type { VisualArgs } from './lib/args';
import { LAUNCH_ARGS } from './lib/capture';
import { OUT_DIR, formatPercent } from './lib/diff';
import { expandJobs } from './lib/matrix';
import type { Job } from './lib/matrix';
import { compare } from './lib/run';
import type { CompareResult } from './lib/run';

/** Captures run in parallel: 3 jobs at once, each one page at a time (ref, then app). */
const PARALLEL = 3;

type Outcome = { ok: true; result: CompareResult } | { ok: false; job: Job; error: string };

function line(job: Job, value: string): string {
  return `${job.route.padEnd(10)} ${String(job.viewport.width).padEnd(4)} ${job.theme.padEnd(5)} ${value}`;
}

function printOutcome(o: Outcome): void {
  if (!o.ok) {
    console.log(line(o.job, `ERROR ${o.error}`));
    return;
  }
  const { result } = o;
  const px = result.diffPixels > 0 ? ` (${result.diffPixels} px)` : '';
  console.log(line(result.job, `${formatPercent(result.percent)}${px}`));
  for (const log of result.logs) console.log(`  ${log}`);
}

async function main(args: VisualArgs): Promise<number> {
  const jobs = expandJobs(args.routes, args.widths, args.themes);
  const outcomes: (Outcome | undefined)[] = new Array(jobs.length);
  let printed = 0;
  const flush = () => {
    while (printed < jobs.length && outcomes[printed]) printOutcome(outcomes[printed++]!);
  };

  const started = Date.now();
  const browser = await chromium.launch({ args: [...LAUNCH_ARGS] });
  try {
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const i = next++;
        const job = jobs[i];
        try {
          outcomes[i] = { ok: true, result: await compare(browser, job, args) };
        } catch (e) {
          const msg = e instanceof Error ? e.message.split('\n')[0] : String(e);
          outcomes[i] = { ok: false, job, error: msg };
        }
        flush();
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, worker));
  } finally {
    await browser.close();
  }

  const done = outcomes.filter((o): o is Outcome => o !== undefined);
  const results = done.flatMap((o) => (o.ok ? [o.result] : []));
  const errors = done.length - results.length;
  const over = results.filter((r) => r.percent > args.maxPercent);
  const worst = results.reduce((m, r) => Math.max(m, r.percent), 0);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n${jobs.length} capture(s): ${results.length - over.length} at or under ${args.maxPercent}%, ` +
      `${over.length} over, ${errors} error(s); worst ${formatPercent(worst)}; ${secs}s`,
  );
  for (const r of over) console.log(`  over: ${r.name} ${formatPercent(r.percent)}`);
  console.log(`PNGs in ${OUT_DIR}`);
  return over.length > 0 || errors > 0 ? 1 : 0;
}

let args: VisualArgs;
try {
  args = parseArgs(process.argv.slice(2), process.env);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(2);
}
if (args.help) {
  console.log(USAGE);
  process.exit(0);
}
main(args).then(
  (code) => process.exit(code),
  (e: unknown) => {
    console.error(e);
    process.exit(1);
  },
);
