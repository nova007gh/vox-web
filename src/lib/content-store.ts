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
  viewedBy?: string[]; // list of user emails who already counted as a view
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

export interface AppNotification {
  id: string;
  type: "like" | "comment" | "follow" | "gift" | "mention" | "system" | "live";
  fromUsername: string;
  fromName: string;
  fromAvatar: string;
  message: string;
  detail?: string;
  postId?: string;
  createdAt: number;
  read: boolean;
}

/* ─────────────── CONSTANTS ─────────────── */

const POSTS_KEY = "voxel_posts";
const FOLLOWS_KEY = "voxel_follows";
const NOTIFICATIONS_KEY = "voxel_notifications";
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

/** Increment view count (only once per viewer). */
export function incrementView(postId: string, viewerId?: string): void {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    const already = viewerId && post.viewedBy?.includes(viewerId);
    if (!already && viewerId) {
      post.viewedBy = post.viewedBy || [];
      post.viewedBy.push(viewerId);
      post.views += 1;
      writeJSON(POSTS_KEY, posts);
    } else if (!viewerId) {
      // anonymous view still counts once per anonymous session
      post.views += 1;
      writeJSON(POSTS_KEY, posts);
    }
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

/**
 * Compress an image to fit within a target size (in bytes) for Firestore.
 * Iteratively reduces dimensions and quality until it fits.
 * Firestore documents have a 1MB limit, so we target ~700KB to leave room for other fields.
 */
export async function compressImageForFirestore(
  file: Blob,
  maxBytes: number = 500000,
): Promise<Blob> {
  let currentDim = 720;
  let currentQuality = 0.7;

  for (let attempt = 0; attempt < 5; attempt++) {
    const compressed = await compressImage(file, currentDim, currentQuality);
    if (compressed.size <= maxBytes) {
      return compressed;
    }
    // Reduce dimensions and quality progressively
    currentDim = Math.round(currentDim * 0.75);
    currentQuality = Math.max(0.3, currentQuality - 0.1);
  }

  // Last resort: very small
  const finalCompressed = await compressImage(file, 300, 0.3);
  return finalCompressed;
}

/* ─────────────── NOTIFICATIONS ─────────────── */

export function getNotifications(username: string): AppNotification[] {
  if (typeof window === "undefined") return [];
  const all = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "{}");
  const userNotifs = all[username] || [];
  return userNotifs.sort((a: AppNotification, b: AppNotification) => b.createdAt - a.createdAt);
}

export function getUnreadCount(username: string): number {
  return getNotifications(username).filter((n: AppNotification) => !n.read).length;
}

export function addNotification(
  targetUsername: string,
  notif: Omit<AppNotification, "id" | "createdAt" | "read">,
): void {
  if (typeof window === "undefined") return;
  if (targetUsername === notif.fromUsername) return; // don't notify self
  const all = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "{}");
  const userNotifs = all[targetUsername] || [];
  const newNotif: AppNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    read: false,
  };
  userNotifs.unshift(newNotif);
  // Keep only last 100 notifications
  all[targetUsername] = userNotifs.slice(0, 100);
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function markNotificationRead(username: string, notifId: string): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "{}");
  const userNotifs = all[username] || [];
  const notif = userNotifs.find((n: AppNotification) => n.id === notifId);
  if (notif) notif.read = true;
  all[username] = userNotifs;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function markAllNotificationsRead(username: string): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "{}");
  const userNotifs = all[username] || [];
  userNotifs.forEach((n: AppNotification) => { n.read = true; });
  all[username] = userNotifs;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function clearNotifications(username: string): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(window.localStorage.getItem(NOTIFICATIONS_KEY) || "{}");
  delete all[username];
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

/* ─────────────── LIVE STREAMS ─────────────── */

export interface LiveStream {
  id: string;
  hostUsername: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: string;
  startedAt: number;
  viewers: number;
  active: boolean;
}

const LIVE_KEY = "voxel_live_streams";

export function getActiveStreams(): LiveStream[] {
  if (typeof window === "undefined") return [];
  const streams = JSON.parse(window.localStorage.getItem(LIVE_KEY) || "[]");
  // Filter out streams older than 4 hours (cleanup)
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  const active = streams.filter((s: LiveStream) => s.startedAt > cutoff && s.active);
  if (active.length !== streams.length) {
    window.localStorage.setItem(LIVE_KEY, JSON.stringify(active));
  }
  return active.sort((a: LiveStream, b: LiveStream) => b.viewers - a.viewers);
}

export function startLiveStream(data: {
  hostUsername: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: string;
}): LiveStream {
  const stream: LiveStream = {
    id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    hostUsername: data.hostUsername,
    hostName: data.hostName,
    hostAvatar: data.hostAvatar,
    title: data.title,
    category: data.category,
    startedAt: Date.now(),
    viewers: 1,
    active: true,
  };
  if (typeof window !== "undefined") {
    const streams = JSON.parse(window.localStorage.getItem(LIVE_KEY) || "[]");
    streams.push(stream);
    window.localStorage.setItem(LIVE_KEY, JSON.stringify(streams));
  }
  return stream;
}

export function endLiveStream(streamId: string): void {
  if (typeof window === "undefined") return;
  const streams = JSON.parse(window.localStorage.getItem(LIVE_KEY) || "[]");
  const stream = streams.find((s: LiveStream) => s.id === streamId);
  if (stream) stream.active = false;
  const active = streams.filter((s: LiveStream) => s.active);
  window.localStorage.setItem(LIVE_KEY, JSON.stringify(active));
}

export function incrementStreamViewers(streamId: string, delta: number): void {
  if (typeof window === "undefined") return;
  const streams = JSON.parse(window.localStorage.getItem(LIVE_KEY) || "[]");
  const stream = streams.find((s: LiveStream) => s.id === streamId);
  if (stream) {
    stream.viewers = Math.max(0, stream.viewers + delta);
    window.localStorage.setItem(LIVE_KEY, JSON.stringify(streams));
  }
}

export function getStreamById(streamId: string): LiveStream | null {
  if (typeof window === "undefined") return null;
  const streams = JSON.parse(window.localStorage.getItem(LIVE_KEY) || "[]");
  return streams.find((s: LiveStream) => s.id === streamId) || null;
}

/* ─────────────── LIVE SHOPPING ─────────────── */

export interface LiveProduct {
  id: string;
  streamId: string;
  sellerUsername: string;
  sellerName: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  description: string;
  sold: boolean;
}

const LIVE_PRODUCTS_KEY = "voxel_live_products";

export function getLiveProducts(streamId?: string): LiveProduct[] {
  if (typeof window === "undefined") return [];
  const all = JSON.parse(window.localStorage.getItem(LIVE_PRODUCTS_KEY) || "[]");
  const products = streamId ? all.filter((p: LiveProduct) => p.streamId === streamId) : all;
  return products;
}

export function addLiveProduct(product: Omit<LiveProduct, "id" | "sold">): LiveProduct {
  const full: LiveProduct = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sold: false,
  };
  if (typeof window !== "undefined") {
    const all = JSON.parse(window.localStorage.getItem(LIVE_PRODUCTS_KEY) || "[]");
    all.push(full);
    window.localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(all));
  }
  return full;
}

export function markProductSold(productId: string): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(window.localStorage.getItem(LIVE_PRODUCTS_KEY) || "[]");
  const p = all.find((p: LiveProduct) => p.id === productId);
  if (p) p.sold = true;
  window.localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(all));
}

/* ─────────────── LIVE AUCTIONS ─────────────── */

export interface LiveAuction {
  id: string;
  streamId: string;
  sellerUsername: string;
  sellerName: string;
  itemName: string;
  image: string;
  description: string;
  startingBid: number;
  currentBid: number;
  currency: string;
  bids: number;
  highestBidder: string;
  endsAt: number;
  active: boolean;
}

const LIVE_AUCTIONS_KEY = "voxel_live_auctions";

export function getLiveAuctions(streamId?: string): LiveAuction[] {
  if (typeof window === "undefined") return [];
  const all = JSON.parse(window.localStorage.getItem(LIVE_AUCTIONS_KEY) || "[]");
  const active = all.filter((a: LiveAuction) => a.active && a.endsAt > Date.now());
  if (active.length !== all.length) {
    window.localStorage.setItem(LIVE_AUCTIONS_KEY, JSON.stringify(active));
  }
  return streamId ? active.filter((a: LiveAuction) => a.streamId === streamId) : active;
}

export function createAuction(data: Omit<LiveAuction, "id" | "currentBid" | "bids" | "highestBidder" | "active">): LiveAuction {
  const auction: LiveAuction = {
    ...data,
    id: `auction_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    currentBid: data.startingBid,
    bids: 0,
    highestBidder: "",
    active: true,
  };
  if (typeof window !== "undefined") {
    const all = JSON.parse(window.localStorage.getItem(LIVE_AUCTIONS_KEY) || "[]");
    all.push(auction);
    window.localStorage.setItem(LIVE_AUCTIONS_KEY, JSON.stringify(all));
  }
  return auction;
}

export function placeBid(auctionId: string, bidderName: string, amount: number): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false };
  const all = JSON.parse(window.localStorage.getItem(LIVE_AUCTIONS_KEY) || "[]");
  const auction = all.find((a: LiveAuction) => a.id === auctionId);
  if (!auction) return { success: false, error: "Auction not found" };
  if (!auction.active || auction.endsAt <= Date.now()) return { success: false, error: "Auction ended" };
  if (amount <= auction.currentBid) return { success: false, error: "Bid must be higher than current bid" };
  auction.currentBid = amount;
  auction.highestBidder = bidderName;
  auction.bids += 1;
  window.localStorage.setItem(LIVE_AUCTIONS_KEY, JSON.stringify(all));
  return { success: true };
}

/* ─────────────── SEED DEMO DATA ─────────────── */

const SEED_KEY = "voxel_live_seeded_v3";

export function seedLiveDemoData(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_KEY)) return;

  const now = Date.now();

  const demoStreams: LiveStream[] = [
    { id: `live_demo_1`, hostUsername: "afro_queen", hostName: "Afro Queen", hostAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e168847?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", title: "Goddess Braids Tutorial ✨", category: "Beauty", startedAt: now - 600000, viewers: 15400, active: true },
    { id: `live_demo_2`, hostUsername: "just_wearwigs", hostName: "JUST WEAR WIGS", hostAvatar: "/profiles/justwearwigs/avatar.jpeg", title: "Wig Collection Tour 💇‍♀️", category: "Beauty", startedAt: now - 1200000, viewers: 12300, active: true },
    { id: `live_demo_3`, hostName: "Glow By Nana", hostUsername: "glow_by_nana", hostAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", title: "Glow Makeup Session 💄", category: "Beauty", startedAt: now - 300000, viewers: 8693, active: true },
    { id: `live_demo_4`, hostName: "Hair By Maame", hostUsername: "hair_by_maame", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", title: "Hair Styling Live 🔥", category: "Beauty", startedAt: now - 900000, viewers: 5100, active: true },
    { id: `live_demo_5`, hostName: "Berry Beauty", hostUsername: "berry_beauty", hostAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", title: "Skincare Routine Live", category: "Beauty", startedAt: now - 1800000, viewers: 3200, active: true },
    { id: `live_demo_6`, hostName: "Wigs By Akua", hostUsername: "wigs_by_akua", hostAvatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?fm=jpg&q=60&w=200&h=200&auto=format&fit=crop&crop=faces", title: "Lace Frontal Install", category: "Beauty", startedAt: now - 600000, viewers: 2800, active: true },
  ];
  window.localStorage.setItem(LIVE_KEY, JSON.stringify(demoStreams));

  const demoProducts: LiveProduct[] = [
    { id: `prod_demo_1`, streamId: "live_demo_2", sellerUsername: "just_wearwigs", sellerName: "JUST WEAR WIGS", name: "Silk Press Straight", price: 4200, currency: "GHS", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7b37e?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", description: "Premium silk press wig, 18 inches", sold: false },
    { id: `prod_demo_2`, streamId: "live_demo_2", sellerUsername: "just_wearwigs", sellerName: "JUST WEAR WIGS", name: "Ombre Color Masterpiece", price: 8300, currency: "GHS", image: "https://images.unsplash.com/photo-1605497788044-5a32c70ecbc7?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", description: "Ombre colored lace front wig", sold: false },
    { id: `prod_demo_3`, streamId: "live_demo_2", sellerUsername: "just_wearwigs", sellerName: "JUST WEAR WIGS", name: "Curly Goddess Curls", price: 2500, currency: "GHS", image: "https://images.unsplash.com/photo-1554466231-296474d5b1c9?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", description: "Curly goddess wig, natural texture", sold: false },
  ];
  window.localStorage.setItem(LIVE_PRODUCTS_KEY, JSON.stringify(demoProducts));

  const demoAuctions: LiveAuction[] = [
    { id: `auction_demo_1`, streamId: "live_demo_2", sellerUsername: "just_wearwigs", sellerName: "JUST WEAR WIGS", itemName: "Ombre Color Masterpiece - Custom", image: "https://images.unsplash.com/photo-1605497788044-5a32c70ecbc7?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", description: "Custom ombre lace front, any length", startingBid: 5000, currentBid: 8300, currency: "GHS", bids: 23, highestBidder: "AmaFan123", endsAt: now + 154000, active: true },
    { id: `auction_demo_2`, streamId: "live_demo_2", sellerUsername: "just_wearwigs", sellerName: "JUST WEAR WIGS", itemName: "Ocean Wave Goddess - Premium", image: "https://images.unsplash.com/photo-1499209974431-9fccce79dc47?fm=jpg&q=60&w=400&h=400&auto=format&fit=crop", description: "Premium ocean wave wig, 22 inches", startingBid: 6000, currentBid: 8500, currency: "GHS", bids: 41, highestBidder: "EsiLovesHair", endsAt: now + 312000, active: true },
  ];
  window.localStorage.setItem(LIVE_AUCTIONS_KEY, JSON.stringify(demoAuctions));

  window.localStorage.setItem(SEED_KEY, "1");
}
