// src/lib/auth.ts
export type AuthUser = {
  ID_Pengguna?: number;
  Email?: string;
  Nama?: string;
  Role?: string;
  Alamat?: string;
  No_Telepon?: string;
  Created_At?: string;
  // tambahan field lain bila perlu
};

/**
 * Keys:
 * - malibu_token  : older code might use this
 * - malibu_auth   : newer unified token key
 * - malibu_user   : user object (JSON)
 */
const TOKEN_KEY_OLD = "malibu_token";
const TOKEN_KEY = "malibu_auth";
const USER_KEY = "malibu_user";

function safeWindowAvailable() {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Save token + user to localStorage.
 * - Accepts token|null and user|null.
 * - Writes both TOKEN_KEY and TOKEN_KEY_OLD for backward compatibility.
 * - Dispatches "auth_updated" event.
 */
export function saveAuth(token: string | null, user: any | null) {
  if (!safeWindowAvailable()) return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, String(token));
      // keep old key for compatibility
      localStorage.setItem(TOKEN_KEY_OLD, String(token));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY_OLD);
    }

    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);

    // notify app
    try { window.dispatchEvent(new Event("auth_updated")); } catch { /* ignore */ }
  } catch (e) {
    // ignore storage errors
    // console.error("saveAuth error", e);
  }
}

/** Read user object from storage, or null */
export function getUserFromStorage(): AuthUser | null {
  if (!safeWindowAvailable()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Try to read token from known keys (new then old). */
export function getTokenFromStorage(): string | null {
  if (!safeWindowAvailable()) return null;
  try {
    return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY_OLD) ?? null;
  } catch {
    return null;
  }
}

/** Backwards-compatible named helper (some code may call getToken()) */
export function getToken(): string | null {
  return getTokenFromStorage();
}

/** Quick boolean: is there a token? */
export function isAuthenticated(): boolean {
  if (!safeWindowAvailable()) return false;
  try {
    return !!(localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY_OLD));
  } catch {
    return false;
  }
}

/**
 * Perform logout: remove auth-related keys and broadcast events.
 * Also remove malibu_checkout to be safe (you can comment this out if undesired).
 */
export function performLogout() {
  if (!safeWindowAvailable()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY_OLD);
    localStorage.removeItem(USER_KEY);

    // optional: clear checkout selection (leave cart if you prefer)
    try { localStorage.removeItem("malibu_checkout"); } catch {}

    // notify app (use auth_updated so components listening update)
    try {
      window.dispatchEvent(new Event("auth_updated"));
      window.dispatchEvent(new Event("cart_updated"));
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

/** alias for older code that called logout() */
export function logout() {
  performLogout();
}
