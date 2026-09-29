import { describe, expect, it } from 'vitest';
import { createLifecycle } from '../../src/lib/lifecycle.js';
import { createCapturingLogger } from '../helpers/logCapture.js';

describe('createLifecycle', () => {
  it('runs every started hook and never throws', async () => {
    const { logger, lines } = createCapturingLogger();
    const lifecycle = createLifecycle(logger);
    const ran: string[] = [];
    lifecycle.onStarted('ok', () => {
      ran.push('ok');
    });
    lifecycle.onStarted('sync-throw', () => {
      throw new Error('sync failure');
    });
    lifecycle.onStarted('async-reject', async () => {
      await Promise.resolve();
      throw new Error('async failure');
    });
    lifecycle.onStarted('after', async () => {
      await Promise.resolve();
      ran.push('after');
    });

    await expect(lifecycle.runStarted()).resolves.toBeUndefined();
    expect(ran.sort()).toEqual(['after', 'ok']);
    const warnings = lines().filter((line) => line.level === 40);
    expect(warnings.map((line) => line.hook).sort()).toEqual(['async-reject', 'sync-throw']);
    expect(warnings.every((line) => line.phase === 'started')).toBe(true);
  });

  it('runs shutdown hooks one by one in reverse order, each guarded', async () => {
    const { logger, lines } = createCapturingLogger();
    const lifecycle = createLifecycle(logger);
    const order: string[] = [];
    lifecycle.onShutdown('first', () => {
      order.push('first');
    });
    lifecycle.onShutdown('broken', () => {
      order.push('broken');
      throw new Error('close failed');
    });
    lifecycle.onShutdown('last', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push('last');
    });

    await expect(lifecycle.runShutdown()).resolves.toBeUndefined();
    expect(order).toEqual(['last', 'broken', 'first']);
    const warning = lines().find((line) => line.level === 40);
    expect(warning).toMatchObject({ hook: 'broken', phase: 'shutdown' });
  });

  it('runs shutdown only once', async () => {
    const { logger } = createCapturingLogger();
    const lifecycle = createLifecycle(logger);
    let calls = 0;
    lifecycle.onShutdown('count', () => {
      calls += 1;
    });
    const first = lifecycle.runShutdown();
    const second = lifecycle.runShutdown();
    expect(second).toBe(first);
    await first;
    await lifecycle.runShutdown();
    expect(calls).toBe(1);
  });

  it('does nothing when no hooks are registered', async () => {
    const { logger, lines } = createCapturingLogger();
    const lifecycle = createLifecycle(logger);
    await lifecycle.runStarted();
    await lifecycle.runShutdown();
    expect(lines()).toEqual([]);
  });
});
