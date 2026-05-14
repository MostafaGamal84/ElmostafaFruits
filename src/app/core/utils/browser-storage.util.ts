export function readLocalStorage(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Storage can be blocked per browser profile. The app should keep rendering.
  }
}

export function removeLocalStorage(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Storage can be blocked per browser profile. The app should keep rendering.
  }
}
