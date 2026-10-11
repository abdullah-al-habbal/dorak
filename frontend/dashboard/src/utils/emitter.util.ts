/** Minimal synchronous pub/sub for module-level browser signals. */
export function createEmitter() {
  const listeners = new Set<() => void>();

  return {
    emit: () => listeners.forEach((listener) => listener()),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
