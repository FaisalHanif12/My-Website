// @vitest-environment node
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { diffPngs, formatPercent, writeOutputs } from './diff';

function solid(width: number, height: number, rgb: [number, number, number]): Buffer {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) png.data.set([...rgb, 255], i);
  return PNG.sync.write(png);
}

describe('diffPngs', () => {
  it('is 0 for identical images', () => {
    const r = diffPngs(solid(10, 10, [20, 40, 60]), solid(10, 10, [20, 40, 60]));
    expect(r.percent).toBe(0);
    expect(r.diffPixels).toBe(0);
  });

  it('counts every pixel of a different image', () => {
    const r = diffPngs(solid(10, 10, [0, 0, 0]), solid(10, 10, [255, 255, 255]));
    expect(r.percent).toBe(100);
  });

  it('pads to the larger size, so the extra area counts as diff', () => {
    const r = diffPngs(solid(10, 10, [0, 0, 0]), solid(10, 20, [0, 0, 0]));
    expect(r.width).toBe(10);
    expect(r.height).toBe(20);
    expect(r.diffPixels).toBe(100);
    expect(r.percent).toBe(50);
    const diff = PNG.sync.read(r.diffPng);
    expect([diff.width, diff.height]).toEqual([10, 20]);
  });

  it('formats two decimals', () => {
    expect(formatPercent(0)).toBe('0.00%');
    expect(formatPercent(0.4567)).toBe('0.46%');
  });

  it('writes the three PNGs', () => {
    const dir = mkdtempSync(join(tmpdir(), 'visual-'));
    try {
      const png = solid(2, 2, [1, 2, 3]);
      const files = writeOutputs('about_1440_light', png, png, png, dir);
      expect(files.ref.endsWith('about_1440_light_ref.png')).toBe(true);
      expect(readdirSync(dir).sort()).toEqual([
        'about_1440_light_app.png',
        'about_1440_light_diff.png',
        'about_1440_light_ref.png',
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
