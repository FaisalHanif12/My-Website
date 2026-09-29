/**
 * Pixel diff of two PNG screenshots. Both are padded to the same size with magenta, so a size
 * difference counts as differing pixels.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const THRESHOLD = 0.1;
export const OUT_DIR = fileURLToPath(new URL('../out/', import.meta.url));

const PAD: readonly [number, number, number, number] = [255, 0, 255, 255];

export interface DiffResult {
  /** Percent of differing pixels over the padded area, 0 to 100. */
  percent: number;
  diffPixels: number;
  width: number;
  height: number;
  diffPng: Buffer;
}

/** Copies an image onto a width x height magenta canvas (top left aligned). */
export function padTo(img: PNG, width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  for (let i = 0; i < out.length; i += 4) out.set(PAD, i);
  const rowBytes = img.width * 4;
  for (let y = 0; y < img.height; y++) {
    out.set(img.data.subarray(y * rowBytes, (y + 1) * rowBytes), y * width * 4);
  }
  return out;
}

export function diffPngs(refPng: Buffer, appPng: Buffer): DiffResult {
  const a = PNG.sync.read(refPng);
  const b = PNG.sync.read(appPng);
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    padTo(a, width, height),
    padTo(b, width, height),
    diff.data,
    width,
    height,
    {
      threshold: THRESHOLD,
    },
  );
  const total = width * height;
  return {
    percent: total === 0 ? 0 : (diffPixels / total) * 100,
    diffPixels,
    width,
    height,
    diffPng: PNG.sync.write(diff),
  };
}

export interface WrittenFiles {
  ref: string;
  app: string;
  diff: string;
}

/** Writes <name>_ref.png, <name>_app.png and <name>_diff.png to tests/visual/out/. */
export function writeOutputs(
  name: string,
  refPng: Buffer,
  appPng: Buffer,
  diffPng: Buffer,
  dir: string = OUT_DIR,
): WrittenFiles {
  mkdirSync(dir, { recursive: true });
  const files: WrittenFiles = {
    ref: join(dir, `${name}_ref.png`),
    app: join(dir, `${name}_app.png`),
    diff: join(dir, `${name}_diff.png`),
  };
  writeFileSync(files.ref, refPng);
  writeFileSync(files.app, appPng);
  writeFileSync(files.diff, diffPng);
  return files;
}

/** "0.00%" style, two decimals. */
export function formatPercent(p: number): string {
  return `${p.toFixed(2)}%`;
}
