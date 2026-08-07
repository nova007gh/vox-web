"use client";

/* ─────────────────────────────────────────────────────────────
   CONTENT STORE
   Uses IndexedDB for file storage (images, videos) and
   localStorage for post metadata, likes, comments, saves, etc.
   ───────────────────────────────────────────────────────────── */

/* ─────────────── TYPES ─────────────── */

export interface Post {
  id: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  caption: string;
  hashtags: string;
  type: "video" | "photo";
  mediaIds: string[]; // IndexedDB file keys
  mediaUrls?: string[]; // Firebase Storage URLs
  thumbnailId?: string; // For videos - a poster image
  thumbnailUrl?: string; // Firebase Storage URL for thumbnail
  privacy: "Public" | "Friends" | "Private";
  allowDownload: boolean;
  allowComments: boolean;
  allowDuet: boolean;
  createdAt: number;
  likes: number;
  comments: Comment[];
  saves: number;
  shares: number;
  views: number;
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface Comment {
  id: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
  likes: number;
}

/* ─────────────── CONSTANTS ─────────────── */

const POSTS_KEY = "voxel_posts";
const FOLLOWS_KEY = "voxel_follows";
const DB_NAME = "voxel_content_db";
const DB_VERSION = 1;
const STORE_NAME = "files";

/* ─────────────── INDEXEDDB HELPERS ─────────────── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("No window"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/** Store a file (Blob) in IndexedDB and return its key. */
export async function storeFile(file: Blob, id?: string): Promise<string> {
  const db = await openDB();
  const key = id || `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, key);
    req.onsuccess = () => resolve(key);
    req.onerror = () => reject(req.error);
  });
}

/** Retrieve a file (Blob) from IndexedDB by key. */
export async function getFile(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Create an object URL from a stored file key. */
export async function getFileURL(key: string): Promise<string | null> {
  const blob = await getFile(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/** Delete a file from IndexedDB. */
export async function deleteFile(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
  } catch {
    /* ignore */
  }
}

/* ─────────────── LOCAL STORAGE HELPERS ─────────────── */

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ─────────────── POST MANAGEMENT ─────────────── */

/** Get all posts from localStorage. */
export function getAllPosts(): Post[] {
  return readJSON<Post[]>(POSTS_KEY) ?? [];
}

/** Get posts by a specific user. */
export function getUserPosts(username: string): Post[] {
  return getAllPosts().filter((p) => p.authorUsername === username);
}

/** Get public posts for the feed (newest first). */
export function getFeedPosts(): Post[] {
  return getAllPosts()
    .filter((p) => p.privacy === "Public")
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Save a new post. Returns the created post. */
export function createPost(data: {
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  caption: string;
  hashtags: string;
  type: "video" | "photo";
  mediaIds: string[];
  thumbnailId?: string;
  privacy: "Public" | "Friends" | "Private";
  allowDownload: boolean;
  allowComments: boolean;
  allowDuet: boolean;
}): Post {
  const post: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    authorUsername: data.authorUsername,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    caption: data.caption,
    hashtags: data.hashtags,
    type: data.type,
    mediaIds: data.mediaIds,
    thumbnailId: data.thumbnailId,
    privacy: data.privacy,
    allowDownload: data.allowDownload,
    allowComments: data.allowComments,
    allowDuet: data.allowDuet,
    createdAt: Date.now(),
    likes: 0,
    comments: [],
    saves: 0,
    shares: 0,
    views: 0,
    likedByMe: false,
    savedByMe: false,
  };
  const posts = getAllPosts();
  posts.push(post);
  writeJSON(POSTS_KEY, posts);
  return post;
}

/** Delete a post by ID (and its files). */
export async function deletePost(postId: string): Promise<void> {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    for (const mediaId of post.mediaIds) {
      await deleteFile(mediaId);
    }
    if (post.thumbnailId) await deleteFile(post.thumbnailId);
  }
  writeJSON(
    POSTS_KEY,
    posts.filter((p) => p.id !== postId),
  );
}

/* ─────────────── INTERACTIONS ─────────────── */

/** Toggle like on a post. Returns the new liked state. */
export function toggleLike(postId: string): boolean {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;
  post.likedByMe = !post.likedByMe;
  post.likes += post.likedByMe ? 1 : -1;
  if (post.likes < 0) post.likes = 0;
  writeJSON(POSTS_KEY, posts);
  return post.likedByMe;
}

/** Toggle save/bookmark on a post. Returns the new saved state. */
export function toggleSave(postId: string): boolean {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return false;
  post.savedByMe = !post.savedByMe;
  post.saves += post.savedByMe ? 1 : -1;
  if (post.saves < 0) post.saves = 0;
  writeJSON(POSTS_KEY, posts);
  return post.savedByMe;
}

/** Increment share count. */
export function incrementShare(postId: string): void {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.shares += 1;
    writeJSON(POSTS_KEY, posts);
  }
}

/** Increment view count. */
export function incrementView(postId: string): void {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.views += 1;
    writeJSON(POSTS_KEY, posts);
  }
}

/** Add a comment to a post. */
export function addComment(
  postId: string,
  data: {
    authorUsername: string;
    authorName: string;
    authorAvatar: string;
    text: string;
  },
): Comment {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    authorUsername: data.authorUsername,
    authorName: data.authorName,
    authorAvatar: data.authorAvatar,
    text: data.text,
    createdAt: Date.now(),
    likes: 0,
  };
  if (post) {
    post.comments.push(comment);
    writeJSON(POSTS_KEY, posts);
  }
  return comment;
}

/** Delete a comment from a post. */
export function deleteComment(postId: string, commentId: string): void {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.comments = post.comments.filter((c) => c.id !== commentId);
    writeJSON(POSTS_KEY, posts);
  }
}

/* ─────────────── FOLLOW MANAGEMENT ─────────────── */

/** Get the set of usernames the current user follows. */
export function getFollowing(): string[] {
  return readJSON<string[]>(FOLLOWS_KEY) ?? [];
}

/** Toggle follow status for a username. Returns the new followed state. */
export function toggleFollow(username: string): boolean {
  const following = getFollowing();
  const idx = following.indexOf(username);
  if (idx >= 0) {
    following.splice(idx, 1);
    writeJSON(FOLLOWS_KEY, following);
    return false;
  } else {
    following.push(username);
    writeJSON(FOLLOWS_KEY, following);
    return true;
  }
}

/** Check if the current user follows a given username. */
export function isFollowing(username: string): boolean {
  return getFollowing().includes(username);
}

/* ─────────────── DOWNLOAD ─────────────── */

/** Download a file from IndexedDB by its media key. */
export async function downloadFile(
  mediaId: string,
  filename: string,
): Promise<void> {
  const blob = await getFile(mediaId);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ─────────────── UTILITIES ─────────────── */

/** Format a timestamp as a relative time string. */
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

/** Format a count (e.g. 1200 -> "1.2K"). */
export function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Generate a thumbnail from a video file. */
export async function generateVideoThumbnail(videoFile: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of duration
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          },
          "image/jpeg",
          0.7,
        );
      } else {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}

/** Compress an image file to a max dimension. */
export async function compressImage(
  file: Blob,
  maxDim: number = 1080,
  quality: number = 0.8,
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else if (height > maxDim) {
        width = (width * maxDim) / height;
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(blob || file);
          },
          "image/jpeg",
          quality,
        );
      } else {
        URL.revokeObjectURL(url);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
  });
}
