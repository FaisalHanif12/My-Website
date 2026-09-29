import { describe, expect, it } from 'vitest';
import { createKeyedMutex } from '../../src/lib/keyedMutex.js';

function deferred() {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

/** Lets every pending promise callback run. */
function flush(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

describe('createKeyedMutex', () => {
  it('runs work for one key one at a time, in arrival order', async () => {
    const mutex = createKeyedMutex();
    const events: string[] = [];
    const gates = [deferred(), deferred(), deferred()];

    const runs = gates.map((gate, i) =>
      mutex.withLock('slot-1', async () => {
        events.push(`start ${i}`);
        await gate.promise;
        events.push(`end ${i}`);
        return i;
      }),
    );

    await flush();
    expect(events).toEqual(['start 0']);

    // Releasing a later gate first changes nothing: call 1 still waits for call 0.
    gates[2]?.resolve();
    gates[1]?.resolve();
    await flush();
    expect(events).toEqual(['start 0']);

    gates[0]?.resolve();
    await expect(Promise.all(runs)).resolves.toEqual([0, 1, 2]);
    expect(events).toEqual(['start 0', 'end 0', 'start 1', 'end 1', 'start 2', 'end 2']);
  });

  it('runs work for different keys in parallel', async () => {
    const mutex = createKeyedMutex();
    const started: string[] = [];
    const gateA = deferred();
    const gateB = deferred();

    const a = mutex.withLock('slot-a', async () => {
      started.push('a');
      await gateA.promise;
    });
    const b = mutex.withLock('slot-b', async () => {
      started.push('b');
      await gateB.promise;
    });

    await flush();
    expect(started).toEqual(['a', 'b']);
    expect(mutex.size).toBe(2);

    gateB.resolve();
    await b;
    gateA.resolve();
    await a;
  });

  it('releases the lock when the work fails and passes the error on', async () => {
    const mutex = createKeyedMutex();
    const failing = mutex.withLock('slot-1', () => Promise.reject(new Error('calendar is down')));
    const next = mutex.withLock('slot-1', () => 'ran');

    await expect(failing).rejects.toThrow('calendar is down');
    await expect(next).resolves.toBe('ran');
  });

  it('accepts synchronous work, including work that throws', async () => {
    const mutex = createKeyedMutex();
    await expect(mutex.withLock('k', () => 42)).resolves.toBe(42);
    await expect(
      mutex.withLock('k', () => {
        throw new Error('sync failure');
      }),
    ).rejects.toThrow('sync failure');
    await expect(mutex.withLock('k', () => 'after')).resolves.toBe('after');
  });

  it('removes a key once nothing holds or waits for it', async () => {
    const mutex = createKeyedMutex();
    expect(mutex.size).toBe(0);

    const gate = deferred();
    const first = mutex.withLock('slot-1', () => gate.promise);
    const second = mutex.withLock('slot-1', () => undefined);
    expect(mutex.size).toBe(1);

    gate.resolve();
    await first;
    expect(mutex.size).toBe(1);
    await second;
    expect(mutex.size).toBe(0);

    await mutex.withLock('slot-2', () => Promise.reject(new Error('boom'))).catch(() => undefined);
    expect(mutex.size).toBe(0);
  });

  it('keeps separate mutexes independent', async () => {
    const one = createKeyedMutex();
    const two = createKeyedMutex();
    const gate = deferred();
    const held = one.withLock('slot-1', () => gate.promise);

    await expect(two.withLock('slot-1', () => 'free')).resolves.toBe('free');
    gate.resolve();
    await held;
  });
});
