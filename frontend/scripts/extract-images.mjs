#!/usr/bin/env node
/**
 * Extracts the 5 base64 WebP images embedded in the reference design into frontend/public/images/.
 *
 * Usage (from frontend/): node scripts/extract-images.mjs
 *
 * For each known reference line it pulls the data:image/webp;base64 payload with a regex, decodes it
 * with Buffer.from(b64, 'base64'), writes the exact bytes to the file named in REFERENCE_MAP.md
 * section 8, then reads the width and height back from the VP8 / VP8L / VP8X header and checks them
 * against the table. The base64 text itself is never printed. Running it twice gives identical bytes
 * (the output is a pure function of the reference file). No dependencies.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(HERE, '..');
const REFERENCE = resolve(FRONTEND, '../reference-design/faisalhanif-redesign.html');
const OUT_DIR = resolve(FRONTEND, 'public/images');

/**
 * REFERENCE_MAP.md section 8: line, output file, alt text on the same line, expected size.
 * Exported for scripts/audit-assets.mjs and the works content test.
 */
export const IMAGES = [
  {
    line: 3112,
    file: 'portrait-faisal.webp',
    alt: 'Portrait of Faisal Hanif',
    width: 498,
    height: 696,
  },
  {
    line: 3833,
    file: 'works-hero-gitpulse.webp',
    alt: 'GitPulse admin dashboard with learner stats, an activity trend chart and a score distribution donut',
    width: 1400,
    height: 797,
  },
  {
    line: 3843,
    file: 'works-hero-uha.webp',
    alt: 'UHA International home page with a glass globe beside the headline',
    width: 1280,
    height: 697,
  },
  {
    line: 3853,
    file: 'works-hero-fitforliving.webp',
    alt: 'Fit For Living home page: Coaching that actually knows your name, with the weekly class timetable',
    width: 1280,
    height: 697,
  },
  {
    line: 3862,
    file: 'works-hero-purebody.webp',
    alt: "PureBody app home screen with today's overview and an AI meal plan",
    width: 402,
    height: 884,
  },
];

const PAYLOAD_RE = /src="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/g;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Reads the canvas size from a WebP file header (RIFF container).
 * VP8 (lossy): 14 bit width and height after the 0x9d 0x01 0x2a start code.
 * VP8L (lossless): 14 bit width-1 and height-1 packed after the 0x2f signature.
 * VP8X (extended): 24 bit canvas width-1 and height-1.
 */
export function webpSize(buf) {
  if (buf.length < 30) throw new Error('file too small for a WebP header');
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a RIFF/WEBP file');
  }
  const riffSize = buf.readUInt32LE(4);
  if (riffSize + 8 !== buf.length) {
    throw new Error(`RIFF size ${riffSize + 8} does not match the file length ${buf.length}`);
  }
  const chunk = buf.toString('ascii', 12, 16);
  const data = 20;
  if (chunk === 'VP8 ') {
    if (buf[data + 3] !== 0x9d || buf[data + 4] !== 0x01 || buf[data + 5] !== 0x2a) {
      throw new Error('VP8 start code missing');
    }
    return {
      format: 'VP8',
      width: buf.readUInt16LE(data + 6) & 0x3fff,
      height: buf.readUInt16LE(data + 8) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    if (buf[data] !== 0x2f) throw new Error('VP8L signature missing');
    const bits = buf.readUInt32LE(data + 1);
    return { format: 'VP8L', width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return {
      format: 'VP8X',
      width: buf.readUIntLE(data + 4, 3) + 1,
      height: buf.readUIntLE(data + 7, 3) + 1,
    };
  }
  throw new Error(`unknown WebP chunk "${chunk}"`);
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

function main() {
  if (!existsSync(REFERENCE)) throw new Error(`reference not found: ${REFERENCE}`);
  const lines = readFileSync(REFERENCE, 'utf8').split('\n');

  const total = lines.reduce((n, l) => n + (l.match(PAYLOAD_RE)?.length ?? 0), 0);
  if (total !== IMAGES.length) {
    throw new Error(
      `expected ${IMAGES.length} base64 WebP images in the reference, found ${total}`,
    );
  }

  mkdirSync(OUT_DIR, { recursive: true });
  let failures = 0;

  for (const img of IMAGES) {
    const text = lines[img.line - 1] ?? '';
    const matches = [...text.matchAll(PAYLOAD_RE)];
    if (matches.length !== 1) {
      throw new Error(`L${img.line}: expected 1 base64 WebP payload, found ${matches.length}`);
    }
    if (!text.includes(`alt="${img.alt}"`)) {
      throw new Error(`L${img.line}: alt text for ${img.file} not found on this line`);
    }
    const b64 = matches[0][1];
    if (b64.length % 4 !== 0 || !BASE64_RE.test(b64)) {
      throw new Error(`L${img.line}: payload is not canonical base64 (length ${b64.length})`);
    }

    const bytes = Buffer.from(b64, 'base64');
    // Round trip guard: Buffer.from ignores bad characters silently, so re-encode and compare.
    if (bytes.toString('base64') !== b64) {
      throw new Error(`L${img.line}: base64 round trip mismatch`);
    }

    const target = resolve(OUT_DIR, img.file);
    const before = existsSync(target) ? readFileSync(target) : null;
    const unchanged = before !== null && before.equals(bytes);
    if (!unchanged) writeFileSync(target, bytes);

    const written = readFileSync(target);
    if (!written.equals(bytes)) throw new Error(`${img.file}: bytes on disk differ after write`);

    const size = webpSize(written);
    const ok = size.width === img.width && size.height === img.height;
    if (!ok) failures += 1;

    console.log(
      [
        img.file.padEnd(30),
        `${String(written.length).padStart(6)} bytes`,
        size.format.padEnd(4),
        `${size.width}x${size.height}`.padEnd(9),
        ok ? 'OK' : `MISMATCH (expected ${img.width}x${img.height})`,
        `sha256:${sha256(written)}`,
        unchanged ? 'unchanged' : 'written',
      ].join('  '),
    );
  }

  const rel = relative(FRONTEND, OUT_DIR);
  if (failures > 0) {
    console.error(`\n${failures} image(s) do not match the section 8 size table.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${IMAGES.length} images match the section 8 size table (${rel}/).`);
  }
}

/**
 * True when node runs this file directly (not when a test imports it). Both sides go through
 * realpathSync, so a symlinked path to the script (or to a parent folder) still counts.
 */
function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  try {
    main();
  } catch (error) {
    console.error(`extract-images: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
