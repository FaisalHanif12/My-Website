/**
 * npm run mail:preview [-- --all]
 * Renders every email template with sample data and writes the HTML and text versions to
 * backend/tmp/mail-preview/ so they can be opened in a browser (light and dark mode).
 * Sends nothing and opens no connection.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXTRA_MAIL_PREVIEWS, MAIL_PREVIEWS } from '../src/templates/samples.js';

const OUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'tmp',
  'mail-preview',
);

async function main(): Promise<void> {
  const all = process.argv.slice(2).includes('--all');
  const previews = all ? [...MAIL_PREVIEWS, ...EXTRA_MAIL_PREVIEWS] : MAIL_PREVIEWS;
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`Writing ${previews.length} email previews to ${OUT_DIR}`);
  for (const preview of previews) {
    const email = preview.render();
    const htmlPath = path.join(OUT_DIR, `${preview.name}.html`);
    const textPath = path.join(OUT_DIR, `${preview.name}.txt`);
    await writeFile(htmlPath, email.html);
    await writeFile(textPath, `Subject: ${email.subject}\n\n${email.text}`);
    console.log(`\n${preview.name}\n  subject: ${email.subject}\n  ${htmlPath}\n  ${textPath}`);
  }
  if (!all)
    console.log('\nRun with -- --all for the other branches (Zoom pending, plain samples).');
}

main().catch((error: unknown) => {
  console.error('Mail preview failed:', error);
  process.exitCode = 1;
});
