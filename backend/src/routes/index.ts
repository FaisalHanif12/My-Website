import type { ApiModule, AppContext, LoadedApiModule } from './types.js';
import { isApiModule } from './types.js';

/** Feature modules, loaded from ./<name>.routes.js in this order and mounted at /api. */
export const API_MODULES = ['chat', 'contact', 'booking-info', 'booking'] as const;

export type ApiModuleName = (typeof API_MODULES)[number];

/** Imports one feature file and resolves to its module namespace. */
export type ModuleImporter = (name: string) => Promise<unknown>;

export interface LoadApiModulesOptions {
  names?: readonly string[];
  importer?: ModuleImporter;
}

/**
 * The template string keeps tsc from needing the feature files: they arrive from later
 * briefs, and the loader copes while they do not exist yet.
 */
const defaultImporter: ModuleImporter = (name) => import(`./${name}.routes.js`);

function reasonOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function loadOne(
  ctx: AppContext,
  name: string,
  importer: ModuleImporter,
): Promise<LoadedApiModule> {
  const namespace = await importer(name);
  const candidate =
    typeof namespace === 'object' && namespace !== null && 'default' in namespace
      ? namespace.default
      : undefined;
  if (!isApiModule(candidate)) {
    throw new Error(`./${name}.routes.js does not default-export an ApiModule`);
  }
  const router = await candidate.createRouter(ctx);
  if (typeof router !== 'function') {
    throw new Error(`createRouter() of "${name}" did not return an Express router`);
  }
  return { name: candidate.name, router };
}

/**
 * Loads the feature modules. Outside production a missing or broken module is skipped
 * with a warning, so the dev server keeps running while features are built. In
 * production any failure is fatal.
 */
export async function loadApiModules(
  ctx: AppContext,
  options: LoadApiModulesOptions = {},
): Promise<LoadedApiModule[]> {
  const names = options.names ?? API_MODULES;
  const importer = options.importer ?? defaultImporter;
  const loaded: LoadedApiModule[] = [];

  for (const name of names) {
    try {
      loaded.push(await loadOne(ctx, name, importer));
    } catch (err) {
      if (ctx.env.NODE_ENV === 'production') {
        throw new Error(`Feature module "${name}" failed to load: ${reasonOf(err)}`, {
          cause: err,
        });
      }
      ctx.logger.warn(
        { module: name, reason: reasonOf(err) },
        `Feature module "${name}" was skipped. Its endpoints answer 404 until it loads.`,
      );
    }
  }

  ctx.logger.debug({ modules: loaded.map((m) => m.name) }, 'Feature modules loaded');
  return loaded;
}

/**
 * Builds modules that are already in hand (tests, or a caller with its own fakes).
 * Unlike loadApiModules, any failure is thrown.
 */
export async function buildApiModules(
  ctx: AppContext,
  modules: readonly ApiModule[],
): Promise<LoadedApiModule[]> {
  const loaded: LoadedApiModule[] = [];
  for (const feature of modules) {
    loaded.push({ name: feature.name, router: await feature.createRouter(ctx) });
  }
  return loaded;
}
