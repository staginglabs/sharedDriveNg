export const customStorage: Storage = {
  length: 0,
  clear(): void {
    if (window && window.localStorage) {
      window.localStorage.clear();
      length = window.localStorage.length;
    }
  },
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  key(index: number): string | null {
    try {
      return window.localStorage.key(index);
    } catch (e) {
      return null;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
      length = window.localStorage.length;
    } catch (e) {
      return;
    }
  },
  setItem(key: string, data: string): void {
    try {
      window.localStorage.setItem(key, data);
      length = window.localStorage.length;
    } catch (e) {
      return;
    }
  }
};
