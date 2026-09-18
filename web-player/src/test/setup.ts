import { afterEach, vi } from "vitest";

// jsdom normally exposes localStorage, but some vitest/jsdom combos leave it
// undefined. Provide a polyfill so tests that call
// localStorage.clear()/getItem()/setItem() don't crash.
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      for (const key in store) {
        delete store[key];
      }
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

afterEach(() => {
  vi.clearAllMocks();
});
