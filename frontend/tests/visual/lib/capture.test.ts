// @vitest-environment node
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_DIR, publicFileFor } from './capture';

const PUB = resolve('/tmp/site/public');

describe('publicFileFor', () => {
  it('maps a live URL to frontend/public, decoding %20', () => {
    expect(publicFileFor('https://faisalhanif.work/imgs/My%20Photo.png', PUB)).toBe(
      join(PUB, 'imgs', 'My Photo.png'),
    );
    expect(publicFileFor('https://faisalhanif.work/sass-app.html?x=1#top', PUB)).toBe(
      join(PUB, 'sass-app.html'),
    );
  });

  it('never leaves the public folder', () => {
    expect(publicFileFor('https://faisalhanif.work/..%2F..%2Fetc%2Fpasswd', PUB)).toBeNull();
    expect(publicFileFor('https://faisalhanif.work/imgs/%2E%2E%2F..%2Fsecret', PUB)).toBeNull();
    // The root maps to the folder itself, which is not a file (answered 404).
    expect(publicFileFor('https://faisalhanif.work/', PUB)).toBe(PUB);
  });

  it('points at frontend/public', () => {
    expect(PUBLIC_DIR.replace(/[\\/]$/, '').endsWith(join('frontend', 'public'))).toBe(true);
  });
});
