/**
 * Cross-browser storage adapter for redux-persist.
 * Handles: Safari private mode, SSR, missing localStorage.
 */

export interface PersistStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const isStorageAvailable = (): boolean => {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const memoryStore: Record<string, string> = {};

const storage: PersistStorage = isStorageAvailable()
  ? {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : {
      // Fallback in-memory storage (Safari private, restricted environments)
      getItem: (key) => Promise.resolve(memoryStore[key] ?? null),
      setItem: (key, value) => {
        memoryStore[key] = value;
        return Promise.resolve();
      },
      removeItem: (key) => {
        delete memoryStore[key];
        return Promise.resolve();
      },
    };

export default storage;
