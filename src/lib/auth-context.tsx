"use client";

/* ─────────────────────────────────────────────────────────────
   CLIENT-SIDE AUTH CONTEXT
   Firebase Auth + Firestore backed user accounts.
   Falls back to localStorage seed/signup accounts when Firebase
   is not configured or unavailable.
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
import { isFirebaseConfigured } from "./firebase";
import {
  createUserAccount,
  loginUserAccount,
  loadUserProfile,
  updateUserProfile,
  subscribeToAuth,
  type UserProfile,
} from "./firebase-store";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────────────────── */

const SESSION_KEY = "voxel_session";
const USERS_KEY = "voxel_users";

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
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

/** Convert a Firestore UserProfile to the UI-facing Account shape. */
function profileToAccount(p: UserProfile): Account {
  return {
    username: p.username,
    name: p.name,
    bio: p.bio,
    avatar: p.avatar,
    cover: p.cover,
    followers: String(p.followers ?? 0),
    following: String(p.following ?? 0),
    posts_count: String(p.posts_count ?? 0),
    verified: p.verified,
    category: p.category,
    country: p.country,
    flag: p.flag,
    isPrivate: p.isPrivate,
    isSeller: p.isSeller,
    posts: [],
    email: p.email,
    password: "", // never return or store plain password
  };
}

/** Convert signup data to a localStorage Account (fallback path). */
function signupDataToAccount(data: SignupData): Account {
  return {
    username: data.username.trim(),
    name: data.name.trim(),
    bio: data.bio ?? "",
    avatar:
      data.avatar?.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name.trim())}&background=6C2BD9&color=fff&size=200&bold=true`,
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
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
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

  /* Restore Firebase session on mount. */
  useEffect(() => {
    let unsub: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      unsub = subscribeToAuth(async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await loadUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profileToAccount(profile));
          } else if (firebaseUser.email) {
            // Auth exists but no profile — build a fallback local account
            setCurrentUser({
              username: firebaseUser.email.split("@")[0],
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              bio: "",
              avatar:
                firebaseUser.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent("User")}&background=6C2BD9&color=fff&size=200&bold=true`,
              cover: "",
              followers: "0",
              following: "0",
              posts_count: "0",
              verified: false,
              category: "",
              country: "",
              flag: "",
              isPrivate: false,
              isSeller: false,
              posts: [],
              email: firebaseUser.email,
              password: "",
            });
          }
        }
        setHydrated(true);
      });
    } else {
      /* No Firebase — restore from localStorage session. */
      const session = readJSON<{ email: string }>(SESSION_KEY);
      if (session?.email) {
        const restored = resolveLocalAccount(session.email);
        setCurrentUser(restored);
      }
      setHydrated(true);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  /* Persist a local session marker whenever currentUser changes. */
  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) {
      writeJSON(SESSION_KEY, { email: currentUser.email });
    } else {
      removeKey(SESSION_KEY);
    }
  }, [currentUser, hydrated]);

  /* ── login ──────────────────────────────────────────────── */
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const normalized = email.trim().toLowerCase();

    // Firebase path
    if (isFirebaseConfigured()) {
      const result = await loginUserAccount(normalized, password);
      if ("error" in result) {
        // Fall back to local seed accounts for demo/testing
        const seedMatch = accounts.find(
          (a) => a.email.toLowerCase() === normalized && a.password === password,
        );
        if (seedMatch) {
          setCurrentUser(seedMatch);
          return { success: true };
        }
        // Fall back to localStorage signup accounts
        const localMatch = getSignupUsers().find(
          (a) => a.email.toLowerCase() === normalized && a.password === password,
        );
        if (localMatch) {
          setCurrentUser(localMatch);
          return { success: true };
        }
        return { success: false, error: result.error };
      }
      setCurrentUser(profileToAccount(result.user));
      return { success: true };
    }

    // No Firebase — local only
    const seedMatch = accounts.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    if (seedMatch) {
      setCurrentUser(seedMatch);
      return { success: true };
    }

    const localMatch = getSignupUsers().find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    if (localMatch) {
      setCurrentUser(localMatch);
      return { success: true };
    }

    return { success: false, error: "Invalid email or password." };
  };

  /* ── logout ─────────────────────────────────────────────── */
  const logout = (): void => {
    import("firebase/auth")
      .then(({ getAuth, signOut }) => {
        const firebaseAuth = getAuth();
        return signOut(firebaseAuth);
      })
      .catch(() => {});
    removeKey(SESSION_KEY);
    setCurrentUser(null);
  };

  /* ── signup ─────────────────────────────────────────────── */
  const signup = async (
    data: SignupData,
  ): Promise<{ success: boolean; error?: string }> => {
    const normalized = data.email.trim().toLowerCase();

    // Firebase path
    if (isFirebaseConfigured()) {
      const result = await createUserAccount({
        ...data,
        email: normalized,
      });
      if ("error" in result) {
        return { success: false, error: result.error };
      }
      setCurrentUser(profileToAccount(result.user));
      return { success: true };
    }

    // No Firebase — localStorage fallback
    const exists =
      accounts.some((a) => a.email.toLowerCase() === normalized) ||
      getSignupUsers().some((a) => a.email.toLowerCase() === normalized);
    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newAccount = signupDataToAccount(data);
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

    if (isFirebaseConfigured()) {
      // We need the Firebase uid to update the profile.
      // Since the Account type doesn't store uid, we re-read the user doc by email
      // by loading from Firestore. This is a best-effort update.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        try {
          const { getAuth } = await import("firebase/auth");
          const firebaseAuth = getAuth();
          const user = firebaseAuth.currentUser;
          if (user) {
            await updateUserProfile(user.uid, {
              ...updates,
              updatedAt: Date.now(),
            });
          }
        } catch {
          /* ignore */
        }
      })();
    }

    // Also update localStorage signup list if this is a local-only account
    const users = getSignupUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updates };
      setSignupUsers(users);
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

/** Resolve a local account by email (seed or signup users). */
function resolveLocalAccount(email: string): Account | null {
  const normalized = email.toLowerCase();
  const seed = accounts.find((a) => a.email.toLowerCase() === normalized);
  if (seed) return seed;
  return getSignupUsers().find((a) => a.email.toLowerCase() === normalized) ?? null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
