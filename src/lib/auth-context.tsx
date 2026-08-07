"use client";

/* ─────────────────────────────────────────────────────────────
   CLIENT-SIDE AUTH CONTEXT
   A lightweight localStorage-based authentication simulation.
   No real crypto — credentials are matched against the seeded
   `accounts` array and any user-created accounts stored under
   the "voxel_users" localStorage key.
   ───────────────────────────────────────────────────────────── */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { accounts, type Account } from "./accounts";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────────────────── */

const SESSION_KEY = "voxel_session";
const USERS_KEY = "voxel_users";

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */

/** Payload persisted to localStorage so a session can be restored. */
interface SessionPayload {
  email: string;
  source: "seed" | "signup";
}

/** Shape of the data passed to `signup()`. */
export interface SignupData {
  username: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
  category?: string;
  country?: string;
  flag?: string;
}

/** Value exposed by the AuthContext. */
interface AuthContextValue {
  currentUser: Account | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  signup: (data: SignupData) => { success: boolean; error?: string };
  updateProfile: (updates: Partial<Pick<Account, "name" | "username" | "bio" | "avatar" | "cover" | "country">>) => void;
}

/* ─────────────────────────────────────────────────────────────
   CONTEXT
   ───────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

/** Safely read and parse a JSON value from localStorage. */
function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Safely serialize and write a value to localStorage. */
function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode / quota) — ignore */
  }
}

/** Remove a key from localStorage. */
function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Return all user-created accounts persisted in localStorage. */
function getSignupUsers(): Account[] {
  return readJSON<Account[]>(USERS_KEY) ?? [];
}

/** Persist the full list of user-created accounts. */
function setSignupUsers(users: Account[]): void {
  writeJSON(USERS_KEY, users);
}

/**
 * Resolve an Account from a session payload by searching both the
 * seeded `accounts` array and any user-created accounts in localStorage.
 */
function resolveAccount(payload: SessionPayload): Account | null {
  if (payload.source === "seed") {
    const base = accounts.find((a) => a.email === payload.email) ?? null;
    if (!base) return null;
    // Apply any saved profile overrides
    try {
      const overrides = JSON.parse(window.localStorage.getItem("voxel_profile_overrides") || "{}");
      const userOverrides = overrides[payload.email];
      if (userOverrides) {
        return { ...base, ...userOverrides };
      }
    } catch {
      /* ignore */
    }
    return base;
  }
  return getSignupUsers().find((a) => a.email.toLowerCase() === payload.email.toLowerCase()) ?? null;
}

/* ─────────────────────────────────────────────────────────────
   PROVIDER
   ───────────────────────────────────────────────────────────── */

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [hydrated, setHydrated] = useState(false);

  /* Restore any saved session on mount. */
  useEffect(() => {
    const payload = readJSON<SessionPayload>(SESSION_KEY);
    if (payload) {
      const restored = resolveAccount(payload);
      if (restored) {
        setCurrentUser(restored);
      } else {
        /* Stale session — clean it up. */
        removeKey(SESSION_KEY);
      }
    }
    setHydrated(true);
  }, []);

  /* Persist the current session whenever it changes (after hydration). */
  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) {
      const isSeed = accounts.some((a) => a.email === currentUser.email);
      const payload: SessionPayload = {
        email: currentUser.email,
        source: isSeed ? "seed" : "signup",
      };
      writeJSON(SESSION_KEY, payload);
    } else {
      removeKey(SESSION_KEY);
    }
  }, [currentUser, hydrated]);

  /* ── login ──────────────────────────────────────────────── */
  const login = (
    email: string,
    password: string,
  ): { success: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();

    const seedMatch = accounts.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    if (seedMatch) {
      setCurrentUser(seedMatch);
      return { success: true };
    }

    const signupMatch = getSignupUsers().find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    if (signupMatch) {
      setCurrentUser(signupMatch);
      return { success: true };
    }

    return { success: false, error: "Invalid email or password." };
  };

  /* ── logout ─────────────────────────────────────────────── */
  const logout = (): void => {
    removeKey(SESSION_KEY);
    setCurrentUser(null);
  };

  /* ── signup ─────────────────────────────────────────────── */
  const signup = (
    data: SignupData,
  ): { success: boolean; error?: string } => {
    const normalized = data.email.trim().toLowerCase();

    const exists =
      accounts.some((a) => a.email.toLowerCase() === normalized) ||
      getSignupUsers().some((a) => a.email.toLowerCase() === normalized);
    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newAccount: Account = {
      username: data.username.trim(),
      name: data.name.trim(),
      bio: data.bio ?? "",
      avatar: data.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name.trim())}&background=6C2BD9&color=fff&size=200&bold=true`,
      cover: "",
      followers: "0",
      following: "0",
      posts_count: "0",
      verified: false,
      category: data.category ?? "",
      country: data.country ?? "",
      flag: data.flag ?? "",
      isPrivate: false,
      isSeller: false,
      posts: [],
      email: normalized,
      password: data.password,
    };

    const users = getSignupUsers();
    users.push(newAccount);
    setSignupUsers(users);

    setCurrentUser(newAccount);
    return { success: true };
  };

  /* ── updateProfile ────────────────────────────────────── */
  const updateProfile = (
    updates: Partial<Pick<Account, "name" | "username" | "bio" | "avatar" | "cover" | "country">>,
  ): void => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };

    // If it's a seed account, persist overrides in localStorage
    const isSeed = accounts.some((a) => a.email.toLowerCase() === currentUser.email.toLowerCase());
    if (isSeed) {
      const overridesKey = "voxel_profile_overrides";
      try {
        const overrides = JSON.parse(window.localStorage.getItem(overridesKey) || "{}");
        overrides[currentUser.email] = { ...overrides[currentUser.email], ...updates };
        window.localStorage.setItem(overridesKey, JSON.stringify(overrides));
      } catch {
        /* ignore */
      }
    } else {
      // Update in the signup users list - preserve password!
      const users = getSignupUsers();
      const idx = users.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (idx >= 0) {
        // Merge with existing user to preserve fields like password
        users[idx] = { ...users[idx], ...updates };
        setSignupUsers(users);
      }
    }

    setCurrentUser(updated);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      hydrated,
      login,
      logout,
      signup,
      updateProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ─────────────────────────────────────────────────────────────
   HOOK
   ───────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
