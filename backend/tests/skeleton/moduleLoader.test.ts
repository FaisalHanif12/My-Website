import { Router } from 'express';
import { describe, expect, it } from 'vitest';
import type { Env } from '../../src/config/env.js';
import { createLifecycle } from '../../src/lib/lifecycle.js';
import {
  API_MODULES,
  buildApiModules,
  loadApiModules,
  type ModuleImporter,
} from '../../src/routes/index.js';
import { isApiModule, type ApiModule, type AppContext } from '../../src/routes/types.js';
import { createCapturingLogger } from '../helpers/logCapture.js';
import { makeTestEnv } from '../helpers/testEnv.js';

function makeCtx(overrides: Partial<Env> = {}) {
  const capture = createCapturingLogger();
  const ctx: AppContext = {
    env: makeTestEnv(overrides),
    logger: capture.logger,
    lifecycle: createLifecycle(capture.logger),
  };
  return { ctx, capture };
}

function fakeModule(name: string, seen?: AppContext[]): ApiModule {
  return {
    name,
    createRouter(ctx) {
      seen?.push(ctx);
      return Router();
    },
  };
}

function missing(name: string): Error & { code: string } {
  return Object.assign(new Error(`Cannot find module './${name}.routes.js'`), {
    code: 'ERR_MODULE_NOT_FOUND',
  });
}

/** A fake importer: known names resolve to namespaces, the rest behave like missing files. */
function importerFrom(namespaces: Record<string, unknown>): ModuleImporter {
  return (name) =>
    name in namespaces ? Promise.resolve(namespaces[name]) : Promise.reject(missing(name));
}

describe('API_MODULES', () => {
  it('lists the four features in mount order', () => {
    expect(API_MODULES).toEqual(['chat', 'contact', 'booking-info', 'booking']);
  });
});

describe('isApiModule', () => {
  it('accepts a name plus createRouter only', () => {
    expect(isApiModule(fakeModule('chat'))).toBe(true);
    expect(isApiModule({ name: '', createRouter: () => Router() })).toBe(false);
    expect(isApiModule({ name: 'chat' })).toBe(false);
    expect(isApiModule(null)).toBe(false);
    expect(isApiModule('chat')).toBe(false);
  });
});

describe('loadApiModules', () => {
  it('loads every module in order and passes the context', async () => {
    const { ctx } = makeCtx();
    const seen: AppContext[] = [];
    const importer = importerFrom(
      Object.fromEntries(API_MODULES.map((name) => [name, { default: fakeModule(name, seen) }])),
    );
    const loaded = await loadApiModules(ctx, { importer });
    expect(loaded.map((m) => m.name)).toEqual([...API_MODULES]);
    expect(loaded.every((m) => typeof m.router === 'function')).toBe(true);
    expect(seen).toHaveLength(4);
    expect(seen.every((c) => c === ctx)).toBe(true);
  });

  it('awaits async createRouter', async () => {
    const { ctx } = makeCtx();
    const asyncModule: ApiModule = {
      name: 'chat',
      createRouter: async () => {
        await Promise.resolve();
        return Router();
      },
    };
    const loaded = await loadApiModules(ctx, {
      names: ['chat'],
      importer: importerFrom({ chat: { default: asyncModule } }),
    });
    expect(loaded.map((m) => m.name)).toEqual(['chat']);
  });

  it('skips a missing module with a warning outside production', async () => {
    const { ctx, capture } = makeCtx({ NODE_ENV: 'development' });
    const loaded = await loadApiModules(ctx, {
      importer: importerFrom({ contact: { default: fakeModule('contact') } }),
    });
    expect(loaded.map((m) => m.name)).toEqual(['contact']);
    const warnings = capture.lines().filter((line) => line.level === 40);
    expect(warnings.map((line) => line.module)).toEqual(['chat', 'booking-info', 'booking']);
    expect(String(warnings[0]?.msg)).toContain('Feature module "chat" was skipped');
  });

  it('skips broken modules with a warning outside production', async () => {
    const { ctx, capture } = makeCtx({ NODE_ENV: 'test' });
    const importer: ModuleImporter = (name) => {
      switch (name) {
        case 'chat':
          return Promise.reject(new SyntaxError('Unexpected token'));
        case 'contact':
          return Promise.resolve({ default: { name: 'contact' } });
        case 'booking-info':
          return Promise.resolve({
            default: {
              name: 'booking-info',
              createRouter: () => {
                throw new Error('factory failed');
              },
            },
          });
        default:
          return Promise.resolve({ notDefault: fakeModule(name) });
      }
    };
    const loaded = await loadApiModules(ctx, { importer });
    expect(loaded).toEqual([]);
    const reasons = capture
      .lines()
      .filter((line) => line.level === 40)
      .map((line) => line.reason);
    expect(reasons).toEqual([
      'Unexpected token',
      './contact.routes.js does not default-export an ApiModule',
      'factory failed',
      './booking.routes.js does not default-export an ApiModule',
    ]);
  });

  it('rejects a createRouter that returns something other than a router', async () => {
    const { ctx } = makeCtx({ NODE_ENV: 'production', CORS_ORIGINS: ['https://x.example'] });
    const bad = { name: 'chat', createRouter: () => ({}) };
    await expect(
      loadApiModules(ctx, { names: ['chat'], importer: importerFrom({ chat: { default: bad } }) }),
    ).rejects.toThrow('createRouter() of "chat" did not return an Express router');
  });

  it('throws in production when a module is missing', async () => {
    const { ctx } = makeCtx({ NODE_ENV: 'production', CORS_ORIGINS: ['https://x.example'] });
    await expect(
      loadApiModules(ctx, { names: ['chat'], importer: importerFrom({}) }),
    ).rejects.toThrow('Feature module "chat" failed to load');
  });

  it('throws in production when a module is broken', async () => {
    const { ctx } = makeCtx({ NODE_ENV: 'production', CORS_ORIGINS: ['https://x.example'] });
    const error = await loadApiModules(ctx, {
      names: ['contact'],
      importer: importerFrom({ contact: { default: 'nope' } }),
    }).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).cause).toBeInstanceOf(Error);
  });

  it('loads nothing for an empty list', async () => {
    const { ctx } = makeCtx();
    await expect(loadApiModules(ctx, { names: [], importer: importerFrom({}) })).resolves.toEqual(
      [],
    );
  });
});

describe('buildApiModules', () => {
  it('builds modules in hand and lets failures through', async () => {
    const { ctx } = makeCtx();
    const loaded = await buildApiModules(ctx, [fakeModule('a'), fakeModule('b')]);
    expect(loaded.map((m) => m.name)).toEqual(['a', 'b']);
    const failing: ApiModule = {
      name: 'x',
      createRouter: () => {
        throw new Error('boom');
      },
    };
    await expect(buildApiModules(ctx, [failing])).rejects.toThrow('boom');
  });
});
