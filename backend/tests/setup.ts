/**
 * Runs before every test file. Tests never touch the network or a .env file: env comes
 * from makeTestEnv() and every external service is faked or mocked.
 */
export const BLOCKED_FETCH_MESSAGE = 'Real network calls are blocked in tests';

const blockedFetch: typeof fetch = () => Promise.reject(new Error(BLOCKED_FETCH_MESSAGE));

// restoreMocks puts this back after a test that mocks fetch with vi.spyOn.
globalThis.fetch = blockedFetch;
