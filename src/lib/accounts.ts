/* ─────────────────────────────────────────────────────────────
   CENTRALIZED ACCOUNTS DATA
   All user accounts in the VOXel platform
   Each account is independent with its own profile, posts, and content
   ───────────────────────────────────────────────────────────── */

export interface AccountPost {
  id: number;
  caption: string;
  likes: string;
  comments: string;
  shares: string;
  thumbnail: string;
  category: string;
}

export interface Account {
  username: string;
  name: string;
  bio: string;
  avatar: string;
  cover: string;
  followers: string;
  following: string;
  posts_count: string;
  verified: boolean;
  category: string;
  country: string;
  flag: string;
  isPrivate: boolean;
  isSeller: boolean;
  link?: string;
  linkLabel?: string;
  posts: AccountPost[];
  // Auth credentials
  email: string;
  password: string;
}

export const accounts: Account[] = [];

/* Helper: get account by username (signed-up users only) */
export function getAccount(username: string): Account | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("voxel_users");
    if (!raw) return undefined;
    const users = JSON.parse(raw) as Account[];
    return users.find((a) => a.username === username);
  } catch {
    return undefined;
  }
}

/* Helper: get all usernames (for static params) */
export function getAllUsernames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("voxel_users");
    if (!raw) return [];
    const users = JSON.parse(raw) as Account[];
    return users.map((a) => a.username);
  } catch {
    return [];
  }
}
