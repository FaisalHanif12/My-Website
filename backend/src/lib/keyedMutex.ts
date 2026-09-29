export interface KeyedMutex {
  /**
   * Runs `fn` once every earlier call for the same key has finished (first come, first
   * served). Calls for different keys run in parallel. The lock is released whether `fn`
   * resolves or throws, and `fn`'s result or error is passed through.
   */
  withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T>;
  /** Keys that have a running or waiting call right now (idle keys are removed). */
  readonly size: number;
}

/**
 * An in-process lock per key. Booking holds it per slot while it checks and creates the
 * event, so two visitors cannot take one slot at the same moment.
 */
export function createKeyedMutex(): KeyedMutex {
  // Per key: a promise that settles when the last queued call has released the lock.
  const tails = new Map<string, Promise<void>>();

  return {
    async withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
      const previous = tails.get(key) ?? Promise.resolve();
      let release: () => void = () => undefined;
      const released = new Promise<void>((resolve) => {
        release = resolve;
      });
      // Queued before the first await, so calls keep their arrival order.
      const tail = previous.then(() => released);
      tails.set(key, tail);

      try {
        await previous;
        return await fn();
      } finally {
        release();
        if (tails.get(key) === tail) tails.delete(key);
      }
    },

    get size() {
      return tails.size;
    },
  };
}
