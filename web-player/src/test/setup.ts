import { afterEach, beforeEach, vi } from "vitest";

// Vitest's jsdom environment often leaves globalThis.localStorage undefined.
// We patch Storage.prototype so the native interface actually works, then
// expose a localStorage whose methods delegate to those prototype methods —
// this keeps vi.spyOn(Storage.prototype, ...) and vi.stubGlobal("fetch", ...)
// interceptable exactly like the real browser API.
const proto = Storage.prototype;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proto as any).setItem = function (this: Storage, key: string, value: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Storage.prototype as any)._store ??= {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Storage.prototype as any)._store[key] = String(value);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proto as any).getItem = function (this: Storage, key: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Storage.prototype as any)._store?.[key] ?? null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proto as any).removeItem = function (this: Storage, key: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Storage.prototype as any)._store?.[key] && delete (Storage.prototype as any)._store[key];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proto as any).clear = function (this: Storage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Storage.prototype as any)._store && Object.keys((Storage.prototype as any)._store).forEach(k => delete (Storage.prototype as any)._store[k]);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (proto as any).key = function (this: Storage, index: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = (Storage.prototype as any)._store;
    if (store) {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    }
    return null;
  };
  try {
    Object.defineProperty(proto, "length", {
      get: function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = (Storage.prototype as any)._store;
        return store ? Object.keys(store).length : 0;
      },
      configurable: true,
    });
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proto as any).length = 0;
  }

  globalThis.localStorage = {
    setItem(key: string, value: string) {
      proto.setItem.call(proto, key, String(value));
    },
    getItem(key: string) {
      return proto.getItem.call(proto, key);
    },
    removeItem(key: string) {
      proto.removeItem.call(proto, key);
    },
    clear() {
      proto.clear.call(proto);
    },
    key(index: number) {
      return proto.key.call(proto, index);
    },
    get length() {
      return (proto as any).length;
    },
  } as Storage;
});

afterEach(() => {
  // Clean up the store between test files.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Storage.prototype as any)._store && delete (Storage.prototype as any)._store;
  vi.clearAllMocks();
});
