/**
 * npm run google:auth
 * One time setup: opens Google's consent screen for the account whose calendar receives bookings,
 * catches the answer on http://127.0.0.1:3456 and prints the refresh token to paste into
 * backend/.env as GOOGLE_REFRESH_TOKEN. Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in
 * backend/.env, and http://127.0.0.1:3456/oauth2callback as an authorised redirect URI of the
 * OAuth client (type "Web application"). Nothing is stored: the token is only printed.
 */
import { randomBytes } from 'node:crypto';
import http from 'node:http';
import { google } from 'googleapis';
import { GOOGLE_CALENDAR_SCOPES } from '../src/services/calendar/google.js';
import { fail, flagValue, info, ok, reportFailure, scriptContext } from './lib.js';

const PORT = Number(flagValue('port') ?? 3456);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;
const WAIT_MS = 5 * 60_000;

async function main(): Promise<void> {
  const { env } = scriptContext();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    fail('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env first (see the README).');
    process.exitCode = 1;
    return;
  }
  const client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI,
  );
  const state = randomBytes(16).toString('hex');
  const url = client.generateAuthUrl({
    access_type: 'offline',
    // "consent" makes Google send a refresh token even when this account approved the app before.
    prompt: 'consent',
    scope: [...GOOGLE_CALENDAR_SCOPES],
    state,
  });

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const target = new URL(req.url ?? '/', REDIRECT_URI);
      if (target.pathname !== '/oauth2callback') {
        res.writeHead(404).end();
        return;
      }
      const returned = target.searchParams.get('code');
      const problem = target.searchParams.get('error');
      const okState = target.searchParams.get('state') === state;
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      if (returned && okState) {
        res.end('Done. You can close this tab and go back to the terminal.');
        server.close();
        resolve(returned);
      } else {
        res.end('Google did not approve the request. Go back to the terminal.');
        server.close();
        reject(
          new Error(
            problem ? `Google answered: ${problem}` : 'The answer did not match this request.',
          ),
        );
      }
    });
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => {
      console.log(
        'Open this address in a browser and sign in with the Google account that owns the calendar:\n',
      );
      console.log(url + '\n');
      info(`Waiting up to 5 minutes for Google to call back on ${REDIRECT_URI} ...`);
    });
    setTimeout(() => {
      server.close();
      reject(new Error('Timed out waiting for Google.'));
    }, WAIT_MS).unref();
  });

  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    fail(
      'Google sent no refresh token. Remove the app at https://myaccount.google.com/permissions and run this again.',
    );
    process.exitCode = 1;
    return;
  }
  ok('Success. Add this line to backend/.env (keep it secret, never commit it):\n');
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  info('Then run npm run check:env to test it.');
}

main().catch(reportFailure);
